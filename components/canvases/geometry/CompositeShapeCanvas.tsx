'use client';

import { useState } from 'react';
import { CanvasProps } from '@/types/canvas';
import { SliderControl } from '@/components/controls/SliderControl';

interface CompositeState {
  shape: string;
  splitAt: number;
}

const CELL = 40;
const PAD = 30;

// L-shape: outer 8×6 grid, inner cut bottom-right 4×3
const OUTER_W = 8;
const OUTER_H = 6;
const CUT_W = 4;
const CUT_H = 3;

export function CompositeShapeCanvas({ initialState, phase }: CanvasProps<CompositeState>) {
  const [splitAt, setSplitAt] = useState((initialState.splitAt as number) ?? 3);

  const SVG_W = OUTER_W * CELL + PAD * 2;
  const SVG_H = OUTER_H * CELL + PAD * 2;

  // L-shape vertices (SVG coords, top-left origin)
  const lShape = [
    { x: PAD, y: PAD },
    { x: PAD + OUTER_W * CELL, y: PAD },
    { x: PAD + OUTER_W * CELL, y: PAD + CUT_H * CELL },
    { x: PAD + CUT_W * CELL, y: PAD + CUT_H * CELL },
    { x: PAD + CUT_W * CELL, y: PAD + OUTER_H * CELL },
    { x: PAD, y: PAD + OUTER_H * CELL },
  ].map((p) => `${p.x},${p.y}`).join(' ');

  // Split line x-coordinate
  const splitX = PAD + splitAt * CELL;

  // Area of two pieces
  const piece1W = splitAt;
  const piece1H = OUTER_H;
  const piece2W = OUTER_W - splitAt;
  const piece2H = CUT_H;
  const area1 = piece1W * piece1H;
  const area2 = piece2W * piece2H;
  const total = area1 + area2;

  const showSplit = phase !== 'concrete';

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)' }}
      >
        {/* Grid */}
        {Array.from({ length: OUTER_W + 1 }, (_, i) => (
          <line key={`v${i}`}
            x1={PAD + i * CELL} y1={PAD}
            x2={PAD + i * CELL} y2={PAD + OUTER_H * CELL}
            stroke="var(--border)" strokeWidth="1" />
        ))}
        {Array.from({ length: OUTER_H + 1 }, (_, i) => (
          <line key={`h${i}`}
            x1={PAD} y1={PAD + i * CELL}
            x2={PAD + OUTER_W * CELL} y2={PAD + i * CELL}
            stroke="var(--border)" strokeWidth="1" />
        ))}

        {/* Piece 1 fill */}
        {showSplit && (
          <rect
            x={PAD} y={PAD}
            width={piece1W * CELL} height={OUTER_H * CELL}
            fill="rgba(245,158,11,0.2)"
          />
        )}
        {/* Piece 2 fill */}
        {showSplit && (
          <rect
            x={PAD + splitAt * CELL} y={PAD}
            width={piece2W * CELL} height={CUT_H * CELL}
            fill="rgba(108,99,255,0.2)"
          />
        )}

        {/* L-shape outline */}
        <polygon
          points={lShape}
          fill={showSplit ? 'none' : 'rgba(245,158,11,0.15)'}
          stroke="var(--geometry)"
          strokeWidth="2.5"
        />

        {/* Split line */}
        {showSplit && (
          <line
            x1={splitX} y1={PAD}
            x2={splitX} y2={PAD + OUTER_H * CELL}
            stroke="var(--secondary)"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
        )}

        {/* Area labels */}
        {showSplit && (
          <>
            <text
              x={PAD + (piece1W * CELL) / 2} y={PAD + (OUTER_H * CELL) / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="13" fontWeight="700" fill="var(--geometry)" fontFamily="var(--font-mono)"
            >
              {area1} m²
            </text>
            <text
              x={PAD + splitAt * CELL + (piece2W * CELL) / 2} y={PAD + (CUT_H * CELL) / 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="13" fontWeight="700" fill="var(--primary)" fontFamily="var(--font-mono)"
            >
              {area2} m²
            </text>
          </>
        )}
      </svg>

      {phase !== 'concrete' && (
        <SliderControl
          label="Split position"
          value={splitAt}
          min={1} max={OUTER_W - 1}
          onChange={setSplitAt}
          color="var(--secondary)"
        />
      )}

      {(phase === 'visual' || phase === 'abstract') && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
            A = A₁ + A₂ = {area1} + {area2} = <strong>{total} m²</strong>
          </p>
        </div>
      )}
    </div>
  );
}
