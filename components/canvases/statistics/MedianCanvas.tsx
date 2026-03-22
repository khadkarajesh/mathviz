'use client';

import { useState } from 'react';
import { CanvasProps } from '@/types/canvas';
import { median, mean } from '@/lib/math/statistics';
import { formatNumber } from '@/lib/utils/formatters';

interface MedianState {
  data: number[];
  sorted: boolean;
  showMedianLine?: boolean;
  showFormula?: boolean;
}

const SVG_W = 420;
const SVG_H = 180;
const ITEM_W = 64;
const ITEM_H = 44;
const PAD = 20;

export function MedianCanvas({ initialState, phase }: CanvasProps<MedianState>) {
  const rawData = (initialState.data as number[]) ?? [5, 3, 8, 1, 9];
  const [order, setOrder] = useState<number[]>(rawData.map((_, i) => i));
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const autoSort = (initialState.sorted as boolean) || phase !== 'concrete';

  const displayIndices = autoSort ? [...order].sort((a, b) => rawData[a] - rawData[b]) : order;
  const sortedVals = displayIndices.map((i) => rawData[i]);
  const med = median(rawData);
  const avg = mean(rawData);
  const showMedianLine = (initialState.showMedianLine as boolean) || phase !== 'concrete';
  const showFormula = (initialState.showFormula as boolean) || phase === 'abstract';

  const medianIdx = Math.floor(sortedVals.length / 2);

  // Simple swap-based drag for sorting in concrete phase
  function handleDragStart(realIdx: number) {
    if (autoSort) return;
    setDraggingIdx(realIdx);
  }

  function handleDrop(targetRealIdx: number) {
    if (draggingIdx === null || draggingIdx === targetRealIdx) return;
    setOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggingIdx);
      const to = next.indexOf(targetRealIdx);
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setDraggingIdx(null);
  }

  const totalW = sortedVals.length * (ITEM_W + 8) + PAD * 2;
  const svgW = Math.max(SVG_W, totalW);

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgW} ${SVG_H}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)', minWidth: totalW }}
      >
        {sortedVals.map((val, displayI) => {
          const x = PAD + displayI * (ITEM_W + 8);
          const y = SVG_H / 2 - ITEM_H / 2 - 10;
          const isMedian = sortedVals.length % 2 === 1 && displayI === medianIdx;
          const isMedianPair = sortedVals.length % 2 === 0 && (displayI === medianIdx - 1 || displayI === medianIdx);
          const highlight = isMedian || isMedianPair;

          return (
            <g
              key={displayI}
              style={{ cursor: autoSort ? 'default' : 'grab' }}
              onPointerDown={() => handleDragStart(order[displayI])}
              onPointerUp={() => handleDrop(order[displayI])}
            >
              <rect
                x={x} y={y} width={ITEM_W} height={ITEM_H}
                rx="8"
                fill={highlight && showMedianLine ? 'rgba(67,217,162,0.2)' : 'rgba(59,130,246,0.12)'}
                stroke={highlight && showMedianLine ? 'var(--accent)' : 'var(--statistics)'}
                strokeWidth={highlight && showMedianLine ? 2.5 : 1.5}
              />
              <text
                x={x + ITEM_W / 2} y={y + ITEM_H / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="16" fontWeight="700"
                fill={highlight && showMedianLine ? 'var(--accent)' : 'var(--statistics)'}
                fontFamily="var(--font-mono)"
              >
                {val}
              </text>
              {/* Rank label */}
              <text x={x + ITEM_W / 2} y={y + ITEM_H + 16}
                textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                #{displayI + 1}
              </text>
            </g>
          );
        })}

        {/* Median marker line */}
        {showMedianLine && (
          <line
            x1={PAD + (sortedVals.length / 2) * (ITEM_W + 8) - 4}
            y1={SVG_H / 2 - ITEM_H / 2 - 20}
            x2={PAD + (sortedVals.length / 2) * (ITEM_W + 8) - 4}
            y2={SVG_H / 2 + ITEM_H / 2}
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeDasharray="5 3"
          />
        )}
      </svg>

      {!autoSort && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Tap two cards to swap them into sorted order
        </p>
      )}

      {showMedianLine && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--accent)', background: 'rgba(67,217,162,0.07)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Median</div>
            <div className="font-mono font-bold text-lg" style={{ color: 'var(--accent)' }}>
              {formatNumber(med, 0)}
            </div>
          </div>
          <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Mean</div>
            <div className="font-mono font-bold text-lg" style={{ color: 'var(--primary)' }}>
              {formatNumber(avg, 1)}
            </div>
          </div>
        </div>
      )}

      {showFormula && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            Sort → find middle value (odd n) or average of two middle values (even n)
          </p>
        </div>
      )}
    </div>
  );
}
