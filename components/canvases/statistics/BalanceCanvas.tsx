'use client';

import { useState, useRef, useCallback } from 'react';
import { CanvasProps } from '@/types/canvas';
import { mean } from '@/lib/math/statistics';
import { formatNumber } from '@/lib/utils/formatters';

interface BalanceState {
  data: number[];
  fulcrumAt: number;
  showResiduals?: boolean;
  showFormula?: boolean;
}

const SVG_W = 420;
const SVG_H = 260;
const AXIS_Y = 140;
const AXIS_X1 = 40;
const AXIS_X2 = 380;
const DOT_R = 10;
const MIN_VAL = 0;
const MAX_VAL = 15;

function valToX(v: number) {
  return AXIS_X1 + ((v - MIN_VAL) / (MAX_VAL - MIN_VAL)) * (AXIS_X2 - AXIS_X1);
}

function xToVal(x: number) {
  return MIN_VAL + ((x - AXIS_X1) / (AXIS_X2 - AXIS_X1)) * (MAX_VAL - MIN_VAL);
}

export function BalanceCanvas({ initialState, phase }: CanvasProps<BalanceState>) {
  const data = (initialState.data as number[]) ?? [2, 4, 5, 7, 8];
  const [fulcrum, setFulcrum] = useState((initialState.fulcrumAt as number) ?? 5);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const trueMean = mean(data);
  const showResiduals = (initialState.showResiduals as boolean) || phase === 'visual';
  const showFormula = (initialState.showFormula as boolean) || phase === 'abstract';

  // Tipping angle based on imbalance
  const leftPull = data.filter((v) => v < fulcrum).reduce((s, v) => s + (fulcrum - v), 0);
  const rightPull = data.filter((v) => v > fulcrum).reduce((s, v) => s + (v - fulcrum), 0);
  const imbalance = rightPull - leftPull;
  const tiltDeg = Math.max(-15, Math.min(15, imbalance * 1.5));
  const balanced = Math.abs(fulcrum - trueMean) < 0.5;

  function getSVGX(e: React.PointerEvent<SVGSVGElement>) {
    const el = svgRef.current!;
    const bbox = el.getBoundingClientRect();
    return ((e.clientX - bbox.left) / bbox.width) * SVG_W;
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    const val = Math.max(MIN_VAL, Math.min(MAX_VAL, xToVal(getSVGX(e))));
    setFulcrum(Math.round(val * 2) / 2);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const val = Math.max(MIN_VAL, Math.min(MAX_VAL, xToVal(getSVGX(e))));
    setFulcrum(Math.round(val * 2) / 2);
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  // Dot stacking: count occurrences per value
  const dotCounts: Record<number, number> = {};
  for (const v of data) dotCounts[v] = (dotCounts[v] ?? 0) + 1;

  // Beam endpoints with tilt
  const beamLen = 160;
  const fx = valToX(fulcrum);
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const beam1 = { x: fx - beamLen * Math.cos(tiltRad), y: AXIS_Y - beamLen * Math.sin(tiltRad) };
  const beam2 = { x: fx + beamLen * Math.cos(tiltRad), y: AXIS_Y + beamLen * Math.sin(tiltRad) };

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
        {/* Number line axis */}
        <line x1={AXIS_X1} y1={AXIS_Y} x2={AXIS_X2} y2={AXIS_Y}
          stroke="var(--text-muted)" strokeWidth="2" />
        {Array.from({ length: MAX_VAL - MIN_VAL + 1 }, (_, i) => {
          const val = MIN_VAL + i;
          const x = valToX(val);
          return (
            <g key={val}>
              <line x1={x} y1={AXIS_Y - 5} x2={x} y2={AXIS_Y + 5} stroke="var(--text-muted)" strokeWidth="1.5" />
              <text x={x} y={AXIS_Y + 18} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{val}</text>
            </g>
          );
        })}

        {/* Residual lines */}
        {showResiduals && data.map((v, i) => {
          const stackIdx = Object.keys(dotCounts)
            .filter((k) => Number(k) === v)
            .map(() => i).indexOf(i);
          const dotY = AXIS_Y - DOT_R * 2 - stackIdx * (DOT_R * 2.5);
          const fx2 = valToX(fulcrum);
          return (
            <line key={i}
              x1={valToX(v)} y1={dotY}
              x2={fx2} y2={dotY}
              stroke={v < fulcrum ? 'var(--statistics)' : 'var(--secondary)'}
              strokeWidth="1.5"
              strokeDasharray="3 2"
              opacity="0.6"
            />
          );
        })}

        {/* Data dots */}
        {Object.entries(dotCounts).map(([valStr, count]) => {
          const val = Number(valStr);
          return Array.from({ length: count }, (_, si) => (
            <circle
              key={`${val}-${si}`}
              cx={valToX(val)}
              cy={AXIS_Y - DOT_R - si * (DOT_R * 2.5)}
              r={DOT_R}
              fill={val < fulcrum ? 'var(--statistics)' : val > fulcrum ? 'var(--secondary)' : 'var(--accent)'}
              opacity="0.85"
            />
          ));
        })}

        {/* Beam */}
        <line
          x1={beam1.x} y1={beam1.y}
          x2={beam2.x} y2={beam2.y}
          stroke={balanced ? 'var(--accent)' : 'var(--geometry)'}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Fulcrum triangle */}
        <polygon
          points={`${fx},${AXIS_Y} ${fx - 12},${AXIS_Y + 22} ${fx + 12},${AXIS_Y + 22}`}
          fill={balanced ? 'var(--accent)' : 'var(--geometry)'}
          className="drag-handle"
        />

        {/* Fulcrum label */}
        <text x={fx} y={AXIS_Y + 38} textAnchor="middle"
          fontSize="11" fontWeight="700"
          fill={balanced ? 'var(--accent)' : 'var(--geometry)'}
          fontFamily="var(--font-mono)">
          {formatNumber(fulcrum, 1)}
        </text>

        {/* Balanced indicator */}
        {balanced && (
          <text x={SVG_W / 2} y={30} textAnchor="middle"
            fontSize="12" fontWeight="700" fill="var(--accent)">
            ⚖ Balanced! That is the mean.
          </text>
        )}
      </svg>

      {showFormula && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
            Mean = ({data.join(' + ')}) ÷ {data.length} = <strong style={{ color: 'var(--accent)' }}>{formatNumber(trueMean, 2)}</strong>
          </p>
        </div>
      )}

      <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Drag the fulcrum ▲ to find the balance point
      </div>
    </div>
  );
}
