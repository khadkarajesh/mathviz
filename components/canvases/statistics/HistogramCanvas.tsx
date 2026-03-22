'use client';

import { useState } from 'react';
import { CanvasProps } from '@/types/canvas';
import { histogramBins, mean, median } from '@/lib/math/statistics';
import { formatNumber } from '@/lib/utils/formatters';
import { SliderControl } from '@/components/controls/SliderControl';

interface HistogramState {
  data: number[];
  binCount: number;
  showStats?: boolean;
}

const SVG_W = 420;
const SVG_H = 220;
const PAD_L = 45;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 40;

export function HistogramCanvas({ initialState, phase }: CanvasProps<HistogramState>) {
  const data = (initialState.data as number[]) ?? [];
  const [binCount, setBinCount] = useState((initialState.binCount as number) ?? 5);
  const showStats = (initialState.showStats as boolean) || phase === 'abstract';

  const bins = histogramBins(data, binCount);
  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const chartW = SVG_W - PAD_L - PAD_R;
  const chartH = SVG_H - PAD_T - PAD_B;
  const binW = chartW / binCount;

  const avg = mean(data);
  const med = median(data);

  function countToY(count: number) {
    return PAD_T + chartH - (count / maxCount) * chartH;
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)' }}>

        {/* Y-axis */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH}
          stroke="var(--text-muted)" strokeWidth="1.5" />
        {/* X-axis */}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={PAD_L + chartW} y2={PAD_T + chartH}
          stroke="var(--text-muted)" strokeWidth="1.5" />

        {/* Y ticks */}
        {[0, Math.ceil(maxCount / 2), maxCount].map((count) => {
          const y = countToY(count);
          return (
            <g key={count}>
              <line x1={PAD_L - 5} y1={y} x2={PAD_L} y2={y} stroke="var(--text-muted)" strokeWidth="1" />
              <text x={PAD_L - 8} y={y} textAnchor="end" dominantBaseline="middle"
                fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{count}</text>
            </g>
          );
        })}

        {/* Bars */}
        {bins.map((bin, i) => {
          const x = PAD_L + i * binW;
          const y = countToY(bin.count);
          const h = PAD_T + chartH - y;
          return (
            <g key={i}>
              <rect x={x + 1} y={y} width={binW - 2} height={h}
                fill="rgba(59,130,246,0.55)"
                stroke="var(--statistics)"
                strokeWidth="1.5"
                rx="2"
              />
              <text x={x + binW / 2} y={PAD_T + chartH + 14}
                textAnchor="middle" fontSize="9"
                fill="var(--text-muted)" fontFamily="var(--font-mono)">
                {Math.round(bin.min)}
              </text>
              {i === bins.length - 1 && (
                <text x={x + binW} y={PAD_T + chartH + 14}
                  textAnchor="middle" fontSize="9"
                  fill="var(--text-muted)" fontFamily="var(--font-mono)">
                  {Math.round(bin.max)}
                </text>
              )}
            </g>
          );
        })}

        {/* Mean line */}
        {showStats && (
          <>
            <line
              x1={PAD_L + ((avg - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * chartW}
              y1={PAD_T}
              x2={PAD_L + ((avg - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * chartW}
              y2={PAD_T + chartH}
              stroke="var(--secondary)" strokeWidth="2" strokeDasharray="5 3"
            />
            <text
              x={PAD_L + ((avg - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * chartW + 4}
              y={PAD_T + 12}
              fontSize="10" fill="var(--secondary)" fontFamily="var(--font-mono)">
              mean={formatNumber(avg, 0)}
            </text>
          </>
        )}
      </svg>

      {phase !== 'concrete' && (
        <SliderControl
          label="Number of bins"
          value={binCount}
          min={2} max={8}
          onChange={setBinCount}
          color="var(--statistics)"
        />
      )}

      {showStats && (
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          {[
            { label: 'Mean', val: formatNumber(avg, 1), color: 'var(--secondary)' },
            { label: 'Median', val: formatNumber(med, 1), color: 'var(--accent)' },
            { label: 'n', val: data.length.toString(), color: 'var(--primary)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-lg p-2 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
              <div className="font-mono font-bold" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
