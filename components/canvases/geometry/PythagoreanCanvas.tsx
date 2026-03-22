'use client';

import { useState } from 'react';
import { CanvasProps } from '@/types/canvas';
import { hypotenuse } from '@/lib/math/geometry';
import { formatNumber } from '@/lib/utils/formatters';
import { SliderControl } from '@/components/controls/SliderControl';

interface PythState {
  a: number;
  b: number;
  showSquares?: boolean;
  showLabels?: boolean;
  showFormula?: boolean;
}

const CELL = 28;
const PAD = 16;
const SVG_W = 380;
const SVG_H = 340;

// Triangle is right-angle at bottom-left
// A = bottom-left, B = bottom-right (leg a along x), C = top-left (leg b along y)
function getVertices(a: number, b: number) {
  const A = { x: PAD + 60, y: PAD + b * CELL + 60 };
  const B = { x: PAD + 60 + a * CELL, y: PAD + b * CELL + 60 };
  const C = { x: PAD + 60, y: PAD + 60 };
  return { A, B, C };
}

export function PythagoreanCanvas({ initialState, phase }: CanvasProps<PythState>) {
  const [a, setA] = useState((initialState.a as number) ?? 3);
  const [b, setB] = useState((initialState.b as number) ?? 4);

  const c = hypotenuse(a, b);
  const { A, B, C } = getVertices(a, b);
  const showSquares = (initialState.showSquares as boolean) ?? phase !== 'abstract';
  const showLabels = (initialState.showLabels as boolean) || phase !== 'concrete';
  const showFormula = (initialState.showFormula as boolean) || phase === 'abstract';

  // Square on leg a (bottom): below the triangle, anchored at A and B
  const sqA = [
    A, B,
    { x: B.x, y: B.y + a * CELL },
    { x: A.x, y: A.y + a * CELL },
  ];
  // Square on leg b (left): to the left of the triangle, anchored at A and C
  const sqB = [
    A, C,
    { x: C.x - b * CELL, y: C.y },
    { x: A.x - b * CELL, y: A.y },
  ];
  // Square on hypotenuse c
  const dx = B.x - C.x, dy = B.y - C.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len, ny = dx / len;
  const sqC = [
    C, B,
    { x: B.x + nx * len, y: B.y + ny * len },
    { x: C.x + nx * len, y: C.y + ny * len },
  ];

  function poly(pts: { x: number; y: number }[]) {
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  }

  function centroid(pts: { x: number; y: number }[]) {
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)' }}
      >
        {/* Squares */}
        {showSquares && (
          <>
            <polygon points={poly(sqA)} fill="rgba(59,130,246,0.2)" stroke="var(--statistics)" strokeWidth="1.5" />
            <polygon points={poly(sqB)} fill="rgba(67,217,162,0.2)" stroke="var(--accent)" strokeWidth="1.5" />
            <polygon points={poly(sqC)} fill="rgba(245,158,11,0.2)" stroke="var(--geometry)" strokeWidth="1.5" />

            {/* Area labels in each square */}
            {(() => {
              const ca = centroid(sqA), cb = centroid(sqB), cc = centroid(sqC);
              return (
                <>
                  <text x={ca.x} y={ca.y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="12" fontWeight="700" fill="var(--statistics)" fontFamily="var(--font-mono)">
                    {a}² = {a * a}
                  </text>
                  <text x={cb.x} y={cb.y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="12" fontWeight="700" fill="var(--accent)" fontFamily="var(--font-mono)">
                    {b}² = {b * b}
                  </text>
                  <text x={cc.x} y={cc.y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontWeight="700" fill="var(--geometry)" fontFamily="var(--font-mono)">
                    {formatNumber(c, 1)}² ≈ {formatNumber(c * c, 0)}
                  </text>
                </>
              );
            })()}
          </>
        )}

        {/* Triangle */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="rgba(108,99,255,0.12)"
          stroke="var(--primary)"
          strokeWidth="2.5"
        />

        {/* Right angle box */}
        <rect x={A.x} y={A.y - 12} width={12} height={12}
          fill="none" stroke="var(--primary)" strokeWidth="1.5" />

        {/* Side labels */}
        {showLabels && (
          <>
            <text x={(A.x + B.x) / 2} y={A.y + 16}
              textAnchor="middle" fontSize="13" fontWeight="700"
              fill="var(--statistics)" fontFamily="var(--font-mono)">a = {a}</text>
            <text x={C.x - 20} y={(A.y + C.y) / 2}
              textAnchor="middle" fontSize="13" fontWeight="700"
              fill="var(--accent)" fontFamily="var(--font-mono)">b = {b}</text>
            <text x={(B.x + C.x) / 2 + 18} y={(B.y + C.y) / 2}
              textAnchor="middle" fontSize="12" fontWeight="700"
              fill="var(--geometry)" fontFamily="var(--font-mono)">c = {formatNumber(c, 2)}</text>
          </>
        )}
      </svg>

      {/* Sliders */}
      {(phase === 'visual' || phase === 'abstract') && (
        <div className="flex flex-col gap-3">
          <SliderControl label="Leg a" value={a} min={1} max={8} onChange={setA} color="var(--statistics)" />
          <SliderControl label="Leg b" value={b} min={1} max={8} onChange={setB} color="var(--accent)" />
        </div>
      )}

      {/* Formula */}
      {showFormula && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono font-bold text-base" style={{ color: 'var(--primary)' }}>
            a² + b² = c²
          </p>
          <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {a}² + {b}² = {a * a} + {b * b} = {a * a + b * b} → c = {formatNumber(c, 2)}
          </p>
        </div>
      )}
    </div>
  );
}
