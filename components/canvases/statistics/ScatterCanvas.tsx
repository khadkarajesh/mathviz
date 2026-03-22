'use client';

import { useState, useRef, useCallback } from 'react';
import { CanvasProps } from '@/types/canvas';
import { linearRegression } from '@/lib/math/statistics';
import { formatNumber } from '@/lib/utils/formatters';

interface ScatterState {
  data?: { x: number; y: number }[];
  rawData?: { x: number; y: number }[];
  placed?: number;
  showResiduals?: boolean;
  showBestFit?: boolean;
  lineSlope?: number;
  lineIntercept?: number;
  showFormula?: boolean;
}

const SVG_W = 400;
const SVG_H = 280;
const PAD_L = 50;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 40;

const X_MIN = 0, X_MAX = 10;
const Y_MIN = 30, Y_MAX = 100;

function dataToSVG(dx: number, dy: number) {
  const chartW = SVG_W - PAD_L - PAD_R;
  const chartH = SVG_H - PAD_T - PAD_B;
  return {
    x: PAD_L + ((dx - X_MIN) / (X_MAX - X_MIN)) * chartW,
    y: PAD_T + chartH - ((dy - Y_MIN) / (Y_MAX - Y_MIN)) * chartH,
  };
}

export function ScatterCanvas({ initialState, phase }: CanvasProps<ScatterState>) {
  const data = (initialState.data as { x: number; y: number }[]) ?? [];
  const rawData = (initialState.rawData as { x: number; y: number }[]) ?? data;
  const [placed, setPlaced] = useState((initialState.placed as number) ?? data.length);
  const [lineSlope, setLineSlope] = useState((initialState.lineSlope as number) ?? 5);
  const [lineIntercept, setLineIntercept] = useState((initialState.lineIntercept as number) ?? 35);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<'slope' | 'intercept' | null>(null);
  const dragStart = useRef({ y: 0, val: 0 });

  const visibleData = rawData.slice(0, placed === rawData.length ? rawData.length : placed);
  const showResiduals = (initialState.showResiduals as boolean) && phase === 'visual';
  const showBestFit = (initialState.showBestFit as boolean) || phase === 'abstract';
  const showFormula = (initialState.showFormula as boolean) || phase === 'abstract';

  const regression = linearRegression(rawData);

  const chartW = SVG_W - PAD_L - PAD_R;
  const chartH = SVG_H - PAD_T - PAD_B;

  // Line endpoints for display
  const lineY0 = lineSlope * X_MIN + lineIntercept;
  const lineY1 = lineSlope * X_MAX + lineIntercept;
  const lp0 = dataToSVG(X_MIN, lineY0);
  const lp1 = dataToSVG(X_MAX, lineY1);

  // Best fit line
  const bfY0 = regression.slope * X_MIN + regression.intercept;
  const bfY1 = regression.slope * X_MAX + regression.intercept;
  const bp0 = dataToSVG(X_MIN, bfY0);
  const bp1 = dataToSVG(X_MAX, bfY1);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>, handle: 'slope' | 'intercept') => {
    dragging.current = handle;
    dragStart.current = {
      y: e.clientY,
      val: handle === 'slope' ? lineSlope : lineIntercept,
    };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, [lineSlope, lineIntercept]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !svgRef.current) return;
    const dy = dragStart.current.y - e.clientY;
    const scale = dragging.current === 'slope' ? 0.05 : 0.5;
    const newVal = dragStart.current.val + dy * scale;
    if (dragging.current === 'slope') setLineSlope(Math.max(-20, Math.min(20, newVal)));
    else setLineIntercept(Math.max(Y_MIN, Math.min(Y_MAX, newVal)));
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = null; }, []);

  // Axis labels
  const xTicks = [0, 2, 4, 6, 8, 10];
  const yTicks = [30, 50, 70, 90];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)', touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH}
          stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1={PAD_L} y1={PAD_T + chartH} x2={PAD_L + chartW} y2={PAD_T + chartH}
          stroke="var(--text-muted)" strokeWidth="1.5" />

        {/* X ticks */}
        {xTicks.map((v) => {
          const { x } = dataToSVG(v, Y_MIN);
          return (
            <g key={v}>
              <line x1={x} y1={PAD_T + chartH} x2={x} y2={PAD_T + chartH + 5} stroke="var(--text-muted)" strokeWidth="1" />
              <text x={x} y={PAD_T + chartH + 18} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}h</text>
            </g>
          );
        })}

        {/* Y ticks */}
        {yTicks.map((v) => {
          const { y } = dataToSVG(X_MIN, v);
          return (
            <g key={v}>
              <line x1={PAD_L - 5} y1={y} x2={PAD_L} y2={y} stroke="var(--text-muted)" strokeWidth="1" />
              <text x={PAD_L - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={PAD_L + chartW / 2} y={SVG_H - 2} textAnchor="middle" fontSize="11" fill="var(--text-muted)">Practice Hours</text>
        <text x={12} y={PAD_T + chartH / 2} textAnchor="middle" fontSize="11" fill="var(--text-muted)" transform={`rotate(-90 12 ${PAD_T + chartH / 2})`}>Score</text>

        {/* Student-draggable line (visual phase) */}
        {phase === 'visual' && (
          <>
            <line
              x1={lp0.x} y1={lp0.y} x2={lp1.x} y2={lp1.y}
              stroke="var(--secondary)" strokeWidth="2" strokeDasharray="6 3"
            />
            {/* Drag handles */}
            <circle cx={lp0.x} cy={lp0.y} r={10} fill="var(--secondary)" opacity="0.7"
              className="drag-handle"
              onPointerDown={(e) => handlePointerDown(e as never, 'intercept')} />
            <circle cx={lp1.x} cy={lp1.y} r={10} fill="var(--primary)" opacity="0.7"
              className="drag-handle"
              onPointerDown={(e) => handlePointerDown(e as never, 'slope')} />
          </>
        )}

        {/* Residuals */}
        {showResiduals && visibleData.map((pt, i) => {
          const { x, y } = dataToSVG(pt.x, pt.y);
          const predY = lineSlope * pt.x + lineIntercept;
          const { y: py } = dataToSVG(pt.x, predY);
          return (
            <line key={i} x1={x} y1={y} x2={x} y2={py}
              stroke="var(--secondary)" strokeWidth="1.5" opacity="0.6" />
          );
        })}

        {/* Best fit line */}
        {showBestFit && (
          <line x1={bp0.x} y1={bp0.y} x2={bp1.x} y2={bp1.y}
            stroke="var(--accent)" strokeWidth="2.5"
          />
        )}

        {/* Data points */}
        {visibleData.map((pt, i) => {
          const { x, y } = dataToSVG(pt.x, pt.y);
          return <circle key={i} cx={x} cy={y} r={7} fill="var(--statistics)" opacity="0.85" />;
        })}
      </svg>

      {phase === 'concrete' && placed < rawData.length && (
        <button
          onClick={() => setPlaced((p) => Math.min(p + 1, rawData.length))}
          className="mx-auto px-5 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--statistics)' }}
        >
          Place next point →
        </button>
      )}

      {showFormula && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
            y = {formatNumber(regression.slope, 1)}x + {formatNumber(regression.intercept, 1)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            R² = {formatNumber(regression.r2, 3)} — {regression.r2 > 0.8 ? 'Strong' : regression.r2 > 0.5 ? 'Moderate' : 'Weak'} correlation
          </p>
        </div>
      )}
    </div>
  );
}
