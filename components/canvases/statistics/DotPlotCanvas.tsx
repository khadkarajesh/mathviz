'use client';

import { useState } from 'react';
import { CanvasProps } from '@/types/canvas';

interface DotPlotState {
  data: number[];
  placed: number[];
}

const SVG_W = 420;
const SVG_H = 200;
const AXIS_Y = 160;
const AXIS_X1 = 40;
const AXIS_X2 = 390;
const DOT_R = 9;

export function DotPlotCanvas({ initialState, phase }: CanvasProps<DotPlotState>) {
  const allData = (initialState.data as number[]) ?? [];
  // In concrete phase, student places dots one at a time
  const [placed, setPlaced] = useState(phase === 'concrete' ? 0 : allData.length);

  const visibleData = allData.slice(0, placed);

  const minVal = Math.min(...allData);
  const maxVal = Math.max(...allData);

  function valToX(v: number) {
    return AXIS_X1 + ((v - minVal) / (maxVal - minVal || 1)) * (AXIS_X2 - AXIS_X1);
  }

  // Count dots per value for stacking
  const dotCounts: Record<number, number> = {};
  for (const v of visibleData) dotCounts[v] = (dotCounts[v] ?? 0) + 1;

  // Unique values on axis
  const uniqueVals = [...new Set(allData)].sort((a, b) => a - b);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)' }}
      >
        {/* Axis */}
        <line x1={AXIS_X1} y1={AXIS_Y} x2={AXIS_X2} y2={AXIS_Y}
          stroke="var(--text-muted)" strokeWidth="2" />

        {/* Tick marks */}
        {uniqueVals.map((v) => {
          const x = valToX(v);
          return (
            <g key={v}>
              <line x1={x} y1={AXIS_Y - 5} x2={x} y2={AXIS_Y + 5}
                stroke="var(--text-muted)" strokeWidth="1.5" />
              <text x={x} y={AXIS_Y + 18} textAnchor="middle"
                fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
            </g>
          );
        })}

        {/* Dots */}
        {Object.entries(dotCounts).map(([valStr, count]) => {
          const val = Number(valStr);
          return Array.from({ length: count }, (_, si) => (
            <circle
              key={`${val}-${si}`}
              cx={valToX(val)}
              cy={AXIS_Y - DOT_R - si * (DOT_R * 2.2) - 2}
              r={DOT_R}
              fill="var(--statistics)"
              opacity="0.85"
            />
          ));
        })}

        {/* "Next" unplaced dot preview */}
        {placed < allData.length && phase === 'concrete' && (
          <circle
            cx={valToX(allData[placed])}
            cy={AXIS_Y - DOT_R - (dotCounts[allData[placed]] ?? 0) * (DOT_R * 2.2) - 2}
            r={DOT_R}
            fill="var(--statistics)"
            opacity="0.3"
            strokeDasharray="3 2"
            stroke="var(--statistics)"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {phase === 'concrete' && placed < allData.length && (
        <button
          onClick={() => setPlaced((p) => Math.min(p + 1, allData.length))}
          className="mx-auto px-5 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--statistics)' }}
        >
          Place next dot ({allData[placed]} min) →
        </button>
      )}

      {placed === allData.length && (
        <p className="text-xs text-center font-medium" style={{ color: 'var(--accent)' }}>
          All {allData.length} students placed!
        </p>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Dots stack when values are equal · Each dot = 1 student
      </p>
    </div>
  );
}
