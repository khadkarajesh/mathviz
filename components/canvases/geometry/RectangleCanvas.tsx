'use client';

import { useState, useRef, useCallback } from 'react';
import { CanvasProps } from '@/types/canvas';
import { rectArea, rectPerimeter } from '@/lib/math/geometry';
import { formatNumber } from '@/lib/utils/formatters';
import { SliderControl } from '@/components/controls/SliderControl';

interface RectState {
  width: number;
  height: number;
}

const CELL = 48; // pixels per grid unit
const COLS = 10;
const ROWS = 8;
const PAD = 40;
const SVG_W = COLS * CELL + PAD * 2;
const SVG_H = ROWS * CELL + PAD * 2;

export function RectangleCanvas({ initialState, phase, onStateChange }: CanvasProps<RectState>) {
  const [rect, setRect] = useState<RectState>({
    width: (initialState.width as number) ?? 4,
    height: (initialState.height as number) ?? 3,
  });
  const draggingCorner = useRef<'br' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const area = rectArea(rect.width, rect.height);
  const perimeter = rectPerimeter(rect.width, rect.height);

  // SVG coordinates for the rectangle (origin = PAD, PAD top-left of grid)
  const rx = PAD;
  const ry = PAD;
  const rw = rect.width * CELL;
  const rh = rect.height * CELL;

  function getSVGPos(e: React.PointerEvent<SVGSVGElement>): { x: number; y: number } {
    const svgEl = svgRef.current!;
    const bbox = svgEl.getBoundingClientRect();
    const scaleX = SVG_W / bbox.width;
    const scaleY = SVG_H / bbox.height;
    return {
      x: (e.clientX - bbox.left) * scaleX,
      y: (e.clientY - bbox.top) * scaleY,
    };
  }

  function snap(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(val / CELL)));
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (phase === 'abstract') return;
    const pos = getSVGPos(e);
    const cornerX = rx + rw;
    const cornerY = ry + rh;
    if (Math.hypot(pos.x - cornerX, pos.y - cornerY) < 20) {
      draggingCorner.current = 'br';
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    }
  }, [rx, rw, ry, rh, phase]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingCorner.current) return;
    const pos = getSVGPos(e);
    const newW = snap(pos.x - PAD, 1, COLS);
    const newH = snap(pos.y - PAD, 1, ROWS);
    setRect({ width: newW, height: newH });
    onStateChange?.({ width: newW, height: newH });
  }, [onStateChange]);

  const handlePointerUp = useCallback(() => {
    draggingCorner.current = null;
  }, []);

  const showLabels = phase === 'visual' || phase === 'abstract';
  const showFormula = phase === 'visual' || phase === 'abstract';

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)', cursor: 'default', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid */}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={PAD + i * CELL} y1={PAD}
            x2={PAD + i * CELL} y2={PAD + ROWS * CELL}
            stroke="var(--border)" strokeWidth="1"
          />
        ))}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={PAD} y1={PAD + i * CELL}
            x2={PAD + COLS * CELL} y2={PAD + i * CELL}
            stroke="var(--border)" strokeWidth="1"
          />
        ))}

        {/* Rectangle fill */}
        <rect
          x={rx} y={ry} width={rw} height={rh}
          fill="rgba(245,158,11,0.18)"
          stroke="var(--geometry)"
          strokeWidth="2.5"
          rx="4"
        />

        {/* Side labels */}
        {showLabels && (
          <>
            {/* top */}
            <text
              x={rx + rw / 2} y={ry - 10}
              textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--geometry)" fontFamily="var(--font-mono)"
            >
              {rect.width}m
            </text>
            {/* bottom */}
            <text
              x={rx + rw / 2} y={ry + rh + 22}
              textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--geometry)" fontFamily="var(--font-mono)"
            >
              {rect.width}m
            </text>
            {/* left */}
            <text
              x={rx - 12} y={ry + rh / 2}
              textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--geometry)" fontFamily="var(--font-mono)"
              transform={`rotate(-90 ${rx - 12} ${ry + rh / 2})`}
            >
              {rect.height}m
            </text>
            {/* right */}
            <text
              x={rx + rw + 18} y={ry + rh / 2}
              textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--geometry)" fontFamily="var(--font-mono)"
              transform={`rotate(90 ${rx + rw + 18} ${ry + rh / 2})`}
            >
              {rect.height}m
            </text>
          </>
        )}

        {/* Corner drag handle */}
        {phase !== 'abstract' && (
          <circle
            cx={rx + rw} cy={ry + rh} r={10}
            fill="var(--geometry)" opacity="0.9"
            className="drag-handle"
            style={{ cursor: 'se-resize' }}
          />
        )}
      </svg>

      {/* Abstract phase sliders */}
      {phase === 'abstract' && (
        <div className="flex flex-col gap-3">
          <SliderControl
            label="Length (l)"
            value={rect.width}
            min={1} max={COLS}
            unit="m"
            onChange={(v) => setRect((r) => ({ ...r, width: v }))}
            color="var(--geometry)"
          />
          <SliderControl
            label="Width (w)"
            value={rect.height}
            min={1} max={ROWS}
            unit="m"
            onChange={(v) => setRect((r) => ({ ...r, height: v }))}
            color="var(--geometry)"
          />
        </div>
      )}

      {/* Stats */}
      {showFormula && (
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-lg p-3 border text-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Perimeter = 2l + 2w
            </div>
            <div className="font-mono font-bold text-lg" style={{ color: 'var(--primary)' }}>
              {formatNumber(perimeter, 0)}m
            </div>
          </div>
          <div
            className="rounded-lg p-3 border text-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              Area = l × w
            </div>
            <div className="font-mono font-bold text-lg" style={{ color: 'var(--geometry)' }}>
              {formatNumber(area, 0)}m²
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
