'use client';

import { useState, useRef, useCallback } from 'react';
import { CanvasProps } from '@/types/canvas';
import { SliderControl } from '@/components/controls/SliderControl';

interface AngleState {
  angleDeg: number;
  showProtractor?: boolean;
  showComplement?: boolean;
}

const CX = 200;
const CY = 210;
const R = 130;
const SVG_W = 400;
const SVG_H = 280;

function degToRad(d: number) { return (d * Math.PI) / 180; }

function angleType(deg: number): string {
  if (deg === 90) return 'Right angle';
  if (deg < 90) return 'Acute angle';
  if (deg < 180) return 'Obtuse angle';
  if (deg === 180) return 'Straight angle';
  return 'Reflex angle';
}

function angleColor(deg: number): string {
  if (deg === 90) return 'var(--accent)';
  if (deg < 90) return 'var(--primary)';
  if (deg < 180) return 'var(--secondary)';
  return 'var(--text-muted)';
}

export function AngleCanvas({ initialState, phase }: CanvasProps<AngleState>) {
  const [angleDeg, setAngleDeg] = useState((initialState.angleDeg as number) ?? 45);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const rad = degToRad(angleDeg);
  // Fixed arm: points right (east)
  const arm1X = CX + R;
  const arm1Y = CY;
  // Rotating arm: measured from east, counterclockwise (math convention)
  const arm2X = CX + R * Math.cos(rad);
  const arm2Y = CY - R * Math.sin(rad); // SVG y-down

  // Arc path for the angle
  const arcR = 45;
  const arcEnd = { x: CX + arcR * Math.cos(rad), y: CY - arcR * Math.sin(rad) };
  const largeArc = angleDeg > 180 ? 1 : 0;

  function getSVGAngle(e: React.PointerEvent<SVGSVGElement>): number {
    const svgEl = svgRef.current!;
    const bbox = svgEl.getBoundingClientRect();
    const scaleX = SVG_W / bbox.width;
    const scaleY = SVG_H / bbox.height;
    const mx = (e.clientX - bbox.left) * scaleX - CX;
    const my = CY - (e.clientY - bbox.top) * scaleY; // flip y
    const angle = Math.atan2(my, mx) * (180 / Math.PI);
    return Math.max(1, Math.min(179, Math.round(angle < 0 ? angle + 360 : angle)));
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    setAngleDeg(getSVGAngle(e));
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    setAngleDeg(getSVGAngle(e));
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = false; }, []);

  const color = angleColor(angleDeg);
  const complement = 90 - angleDeg;
  const supplement = 180 - angleDeg;

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
        {/* Protractor arc */}
        {(initialState.showProtractor || phase !== 'concrete') && (
          <>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Tick marks every 30 degrees */}
            {[0, 30, 60, 90, 120, 150, 180].map((d) => {
              const r2 = degToRad(d);
              const tx = CX + (R + 12) * Math.cos(r2);
              const ty = CY - (R + 12) * Math.sin(r2);
              return (
                <text key={d} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                  {d}°
                </text>
              );
            })}
          </>
        )}

        {/* Angle fill arc */}
        <path
          d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEnd.x} ${arcEnd.y} Z`}
          fill={`${color}22`}
          stroke={color}
          strokeWidth="1.5"
        />

        {/* Arms */}
        <line x1={CX} y1={CY} x2={arm1X} y2={arm1Y} stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={arm2X} y2={arm2Y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Vertex dot */}
        <circle cx={CX} cy={CY} r={5} fill={color} />

        {/* Drag handle at tip of rotating arm */}
        <circle cx={arm2X} cy={arm2Y} r={12} fill={color} opacity="0.85" className="drag-handle" />

        {/* Angle label */}
        <text x={CX + 60} y={CY - 25} fontSize="22" fontWeight="700"
          fill={color} fontFamily="var(--font-mono)">
          {angleDeg}°
        </text>
        <text x={CX + 60} y={CY - 5} fontSize="11" fill="var(--text-muted)">
          {angleType(angleDeg)}
        </text>

        {/* Right angle box if 90 */}
        {Math.abs(angleDeg - 90) < 2 && (
          <rect x={CX + 5} y={CY - 18} width={13} height={13}
            fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        )}
      </svg>

      {/* Slider for abstract phase */}
      {phase === 'abstract' && (
        <SliderControl
          label="Angle"
          value={angleDeg}
          min={1} max={179}
          unit="°"
          onChange={setAngleDeg}
          color={color}
        />
      )}

      {/* Complement / supplement info */}
      {(phase === 'visual' || phase === 'abstract') && (initialState.showComplement || phase === 'abstract') && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Complement (90° − angle)</div>
            <div className="font-mono font-bold" style={{ color: complement > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
              {complement > 0 ? `${complement}°` : 'N/A'}
            </div>
          </div>
          <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Supplement (180° − angle)</div>
            <div className="font-mono font-bold" style={{ color: supplement > 0 ? 'var(--secondary)' : 'var(--text-muted)' }}>
              {supplement > 0 ? `${supplement}°` : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
