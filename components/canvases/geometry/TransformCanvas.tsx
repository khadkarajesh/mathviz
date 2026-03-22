'use client';

import { useState, useRef, useCallback } from 'react';
import { CanvasProps } from '@/types/canvas';
import { SliderControl } from '@/components/controls/SliderControl';

interface TransformState {
  mode: 'translation' | 'rotation' | 'reflection';
  shape: 'arrow' | 'triangle';
  tx?: number;
  ty?: number;
  showGhost?: boolean;
  showVector?: boolean;
  showFormula?: boolean;
}

const CELL = 40;
const GRID_COLS = 12;
const GRID_ROWS = 10;
const PAD = 20;
const SVG_W = GRID_COLS * CELL + PAD * 2;
const SVG_H = GRID_ROWS * CELL + PAD * 2;
const ORIGIN_X = PAD + GRID_COLS / 2 * CELL;
const ORIGIN_Y = PAD + GRID_ROWS / 2 * CELL;

// Math-to-SVG: (0,0) at center of grid
function mts(mx: number, my: number) {
  return { x: ORIGIN_X + mx * CELL, y: ORIGIN_Y - my * CELL };
}

// Arrow shape vertices in math coordinates
const ARROW_SHAPE = [
  { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 },
  { x: 2, y: 0 }, { x: 1, y: -1 }, { x: 1, y: 0 },
];

const TRIANGLE_SHAPE = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 2 }];

function polyPoints(verts: { x: number; y: number }[], tx: number, ty: number) {
  return verts.map((v) => {
    const p = mts(v.x + tx, v.y + ty);
    return `${p.x},${p.y}`;
  }).join(' ');
}

export function TransformCanvas({ initialState, phase }: CanvasProps<TransformState>) {
  const [tx, setTx] = useState((initialState.tx as number) ?? 0);
  const [ty, setTy] = useState((initialState.ty as number) ?? 0);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startTx = useRef(0);
  const startTy = useRef(0);

  const shape = (initialState.shape as string) === 'triangle' ? TRIANGLE_SHAPE : ARROW_SHAPE;
  const showGhost = (initialState.showGhost as boolean) || phase !== 'concrete';
  const showVector = (initialState.showVector as boolean) || phase === 'visual';
  const showFormula = (initialState.showFormula as boolean) || phase === 'abstract';

  function getSVGPos(e: React.PointerEvent<SVGSVGElement>) {
    const el = svgRef.current!;
    const bbox = el.getBoundingClientRect();
    return {
      x: ((e.clientX - bbox.left) / bbox.width) * SVG_W,
      y: ((e.clientY - bbox.top) / bbox.height) * SVG_H,
    };
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    startPos.current = getSVGPos(e);
    startTx.current = tx;
    startTy.current = ty;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  }, [tx, ty]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const pos = getSVGPos(e);
    const dx = Math.round((pos.x - startPos.current.x) / CELL);
    const dy = Math.round(-(pos.y - startPos.current.y) / CELL);
    setTx(Math.max(-4, Math.min(4, startTx.current + dx)));
    setTy(Math.max(-4, Math.min(4, startTy.current + dy)));
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  // Centroid of transformed shape for vector arrow
  const shapeCentroid = shape.reduce((s, v) => ({ x: s.x + v.x / shape.length, y: s.y + v.y / shape.length }), { x: 0, y: 0 });
  const origC = mts(shapeCentroid.x, shapeCentroid.y);
  const transC = mts(shapeCentroid.x + tx, shapeCentroid.y + ty);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid */}
        {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
          <line key={`v${i}`}
            x1={PAD + i * CELL} y1={PAD}
            x2={PAD + i * CELL} y2={PAD + GRID_ROWS * CELL}
            stroke={i === GRID_COLS / 2 ? 'var(--text-muted)' : 'var(--border)'}
            strokeWidth={i === GRID_COLS / 2 ? 1.5 : 1} />
        ))}
        {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
          <line key={`h${i}`}
            x1={PAD} y1={PAD + i * CELL}
            x2={PAD + GRID_COLS * CELL} y2={PAD + i * CELL}
            stroke={i === GRID_ROWS / 2 ? 'var(--text-muted)' : 'var(--border)'}
            strokeWidth={i === GRID_ROWS / 2 ? 1.5 : 1} />
        ))}

        {/* Ghost (original) */}
        {showGhost && (
          <polygon
            points={polyPoints(shape, 0, 0)}
            fill="rgba(108,99,255,0.1)"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
        )}

        {/* Translation vector arrow */}
        {showVector && (tx !== 0 || ty !== 0) && (
          <line
            x1={origC.x} y1={origC.y}
            x2={transC.x} y2={transC.y}
            stroke="var(--secondary)"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        )}

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--secondary)" />
          </marker>
        </defs>

        {/* Translated shape */}
        <polygon
          points={polyPoints(shape, tx, ty)}
          fill="rgba(245,158,11,0.18)"
          stroke="var(--geometry)"
          strokeWidth="2.5"
          className="drag-handle"
        />

        {/* Vector label */}
        {showVector && (tx !== 0 || ty !== 0) && (
          <text
            x={(origC.x + transC.x) / 2 + 8}
            y={(origC.y + transC.y) / 2}
            fontSize="12" fontWeight="600"
            fill="var(--secondary)"
            fontFamily="var(--font-mono)"
          >
            ({tx}, {ty})
          </text>
        )}
      </svg>

      {phase === 'abstract' && (
        <div className="flex flex-col gap-3">
          <SliderControl label="Translate x" value={tx} min={-4} max={4} onChange={setTx} color="var(--geometry)" />
          <SliderControl label="Translate y" value={ty} min={-4} max={4} onChange={setTy} color="var(--geometry)" />
        </div>
      )}

      {showFormula && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono font-bold" style={{ color: 'var(--primary)' }}>
            (x, y) → (x + {tx}, y + {ty})
          </p>
        </div>
      )}
    </div>
  );
}
