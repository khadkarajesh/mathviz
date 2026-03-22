'use client';

import { useState, useRef, useCallback } from 'react';
import { CanvasProps, Point } from '@/types/canvas';
import { formatNumber } from '@/lib/utils/formatters';

interface CoordState {
  mode: 'distance' | 'midpoint' | 'slope';
  pointA: Point; // math coordinates
  pointB: Point;
}

const CELL = 34;       // pixels per unit
const GRID_EXTENT = 7; // grid goes -7 to +7
const PAD = 24;
const SVG_SIZE = GRID_EXTENT * 2 * CELL + PAD * 2;
const ORIGIN = PAD + GRID_EXTENT * CELL; // SVG pixel for (0,0)

// Math → SVG
function mts(p: Point): Point {
  return { x: ORIGIN + p.x * CELL, y: ORIGIN - p.y * CELL };
}

// SVG → Math (snapped to integer grid)
function stm(svgX: number, svgY: number): Point {
  return {
    x: Math.round((svgX - ORIGIN) / CELL),
    y: Math.round((ORIGIN - svgY) / CELL),
  };
}

function clamp(v: number) {
  return Math.max(-GRID_EXTENT + 1, Math.min(GRID_EXTENT - 1, v));
}

function distance(a: Point, b: Point) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function slope(a: Point, b: Point): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0) return 'undefined (vertical)';
  const s = dy / dx;
  return formatNumber(s, 2);
}

const QUADRANT_COLORS: Record<string, string> = {
  I:   'rgba(108,99,255,0.04)',
  II:  'rgba(67,217,162,0.04)',
  III: 'rgba(245,158,11,0.04)',
  IV:  'rgba(255,101,132,0.04)',
};

export function CoordinateGeometryCanvas({ initialState, phase }: CanvasProps<CoordState>) {
  const mode = (initialState.mode as string) ?? 'distance';
  const [A, setA] = useState<Point>((initialState.pointA as Point) ?? { x: -3, y: -2 });
  const [B, setB] = useState<Point>((initialState.pointB as Point) ?? { x: 4, y: 3 });
  const dragging = useRef<'A' | 'B' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const svgA = mts(A);
  const svgB = mts(B);
  const mid = midpoint(A, B);
  const svgMid = mts(mid);
  const dist = distance(A, B);
  const sl = slope(A, B);
  const rise = B.y - A.y;
  const run = B.x - A.x;

  function getSVGPos(e: React.PointerEvent<SVGSVGElement>): Point {
    const el = svgRef.current!;
    const bbox = el.getBoundingClientRect();
    return {
      x: ((e.clientX - bbox.left) / bbox.width) * SVG_SIZE,
      y: ((e.clientY - bbox.top) / bbox.height) * SVG_SIZE,
    };
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const pos = getSVGPos(e);
    const dA = Math.hypot(pos.x - svgA.x, pos.y - svgA.y);
    const dB = Math.hypot(pos.x - svgB.x, pos.y - svgB.y);
    if (dA < 20 || dB < 20) {
      dragging.current = dA < dB ? 'A' : 'B';
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    }
  }, [svgA, svgB]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const pos = getSVGPos(e);
    const math = stm(pos.x, pos.y);
    const clamped = { x: clamp(math.x), y: clamp(math.y) };
    if (dragging.current === 'A') setA(clamped);
    else setB(clamped);
  }, []);

  const handlePointerUp = useCallback(() => { dragging.current = null; }, []);

  const showLabels   = phase !== 'concrete';
  const showDistance = (mode === 'distance') && phase !== 'concrete';
  const showMidpoint = (mode === 'midpoint') && phase !== 'concrete';
  const showSlope    = (mode === 'slope') && phase !== 'concrete';
  const showFormula  = phase === 'abstract';

  const ticks = Array.from({ length: GRID_EXTENT * 2 + 1 }, (_, i) => i - GRID_EXTENT);

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full rounded-lg"
        style={{ background: 'var(--surface-2)', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Quadrant fills */}
        <rect x={ORIGIN} y={PAD} width={GRID_EXTENT * CELL} height={GRID_EXTENT * CELL} fill={QUADRANT_COLORS.I} />
        <rect x={PAD} y={PAD} width={GRID_EXTENT * CELL} height={GRID_EXTENT * CELL} fill={QUADRANT_COLORS.II} />
        <rect x={PAD} y={ORIGIN} width={GRID_EXTENT * CELL} height={GRID_EXTENT * CELL} fill={QUADRANT_COLORS.III} />
        <rect x={ORIGIN} y={ORIGIN} width={GRID_EXTENT * CELL} height={GRID_EXTENT * CELL} fill={QUADRANT_COLORS.IV} />

        {/* Grid lines */}
        {ticks.map((v) => {
          const x = ORIGIN + v * CELL;
          const y = ORIGIN - v * CELL;
          return (
            <g key={v}>
              <line x1={x} y1={PAD} x2={x} y2={SVG_SIZE - PAD}
                stroke="var(--border)" strokeWidth={v === 0 ? 1.5 : 0.7} />
              <line x1={PAD} y1={y} x2={SVG_SIZE - PAD} y2={y}
                stroke="var(--border)" strokeWidth={v === 0 ? 1.5 : 0.7} />
            </g>
          );
        })}

        {/* Axis arrows */}
        <line x1={PAD} y1={ORIGIN} x2={SVG_SIZE - PAD} y2={ORIGIN}
          stroke="var(--text-muted)" strokeWidth="2" markerEnd="url(#arrowX)" />
        <line x1={ORIGIN} y1={SVG_SIZE - PAD} x2={ORIGIN} y2={PAD}
          stroke="var(--text-muted)" strokeWidth="2" markerEnd="url(#arrowY)" />

        <defs>
          <marker id="arrowX" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="var(--text-muted)" />
          </marker>
          <marker id="arrowY" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
            <path d="M0,6 L6,6 L3,0 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Axis tick labels */}
        {ticks.filter((v) => v !== 0 && Math.abs(v) % 2 === 0).map((v) => (
          <g key={`lbl${v}`}>
            <text x={ORIGIN + v * CELL} y={ORIGIN + 14}
              textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
            <text x={ORIGIN - 12} y={ORIGIN - v * CELL + 3}
              textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={SVG_SIZE - PAD + 6} y={ORIGIN + 4} fontSize="11" fill="var(--text-muted)">x</text>
        <text x={ORIGIN - 4} y={PAD - 6} fontSize="11" fill="var(--text-muted)">y</text>

        {/* Distance: right-angle helper lines */}
        {showDistance && (
          <>
            <line
              x1={svgA.x} y1={svgA.y} x2={svgB.x} y2={svgA.y}
              stroke="var(--statistics)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7"
            />
            <line
              x1={svgB.x} y1={svgA.y} x2={svgB.x} y2={svgB.y}
              stroke="var(--secondary)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7"
            />
            {/* run label */}
            <text
              x={(svgA.x + svgB.x) / 2} y={svgA.y + 14}
              textAnchor="middle" fontSize="11" fontWeight="600"
              fill="var(--statistics)" fontFamily="var(--font-mono)"
            >
              run={run}
            </text>
            {/* rise label */}
            <text
              x={svgB.x + 16} y={(svgA.y + svgB.y) / 2}
              textAnchor="start" fontSize="11" fontWeight="600"
              fill="var(--secondary)" fontFamily="var(--font-mono)"
            >
              rise={rise}
            </text>
          </>
        )}

        {/* Slope: line extended */}
        {showSlope && run !== 0 && (
          <line
            x1={PAD} y1={svgA.y - ((A.x - (-GRID_EXTENT)) * (rise / run)) * CELL}
            x2={SVG_SIZE - PAD} y2={svgA.y + ((GRID_EXTENT - A.x) * (rise / run)) * CELL}
            stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5"
          />
        )}

        {/* AB line segment */}
        <line
          x1={svgA.x} y1={svgA.y} x2={svgB.x} y2={svgB.y}
          stroke="var(--geometry)" strokeWidth="2.5" strokeLinecap="round"
        />

        {/* Distance label on segment */}
        {showDistance && (
          <text
            x={(svgA.x + svgB.x) / 2 - 10}
            y={(svgA.y + svgB.y) / 2 - 10}
            fontSize="12" fontWeight="700"
            fill="var(--geometry)" fontFamily="var(--font-mono)"
          >
            {formatNumber(dist, 2)}
          </text>
        )}

        {/* Midpoint marker */}
        {showMidpoint && (
          <>
            <circle cx={svgMid.x} cy={svgMid.y} r={6}
              fill="var(--accent)" stroke="white" strokeWidth="1.5" />
            <text
              x={svgMid.x + 10} y={svgMid.y - 8}
              fontSize="11" fontWeight="600"
              fill="var(--accent)" fontFamily="var(--font-mono)"
            >
              M({formatNumber(mid.x, 1)}, {formatNumber(mid.y, 1)})
            </text>
          </>
        )}

        {/* Point A */}
        <circle cx={svgA.x} cy={svgA.y} r={10}
          fill="var(--primary)" className="drag-handle" />
        <text x={svgA.x - 14} y={svgA.y - 14}
          fontSize="12" fontWeight="700" fill="var(--primary)" fontFamily="var(--font-mono)">
          A
        </text>
        {showLabels && (
          <text x={svgA.x - 14} y={svgA.y + 22}
            fontSize="10" fill="var(--primary)" fontFamily="var(--font-mono)">
            ({A.x},{A.y})
          </text>
        )}

        {/* Point B */}
        <circle cx={svgB.x} cy={svgB.y} r={10}
          fill="var(--secondary)" className="drag-handle" />
        <text x={svgB.x + 6} y={svgB.y - 14}
          fontSize="12" fontWeight="700" fill="var(--secondary)" fontFamily="var(--font-mono)">
          B
        </text>
        {showLabels && (
          <text x={svgB.x + 6} y={svgB.y + 22}
            fontSize="10" fill="var(--secondary)" fontFamily="var(--font-mono)">
            ({B.x},{B.y})
          </text>
        )}
      </svg>

      {/* Formula panels */}
      {showFormula && mode === 'distance' && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono text-sm font-bold" style={{ color: 'var(--primary)' }}>
            d = √((x₂−x₁)² + (y₂−y₁)²)
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            = √(({B.x}−{A.x})² + ({B.y}−{A.y})²) = √({run ** 2}+{rise ** 2}) = <strong>{formatNumber(dist, 2)}</strong>
          </p>
        </div>
      )}

      {showFormula && mode === 'midpoint' && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono text-sm font-bold" style={{ color: 'var(--primary)' }}>
            M = ((x₁+x₂)/2, (y₁+y₂)/2)
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            = (({A.x}+{B.x})/2, ({A.y}+{B.y})/2) = <strong>({formatNumber(mid.x, 1)}, {formatNumber(mid.y, 1)})</strong>
          </p>
        </div>
      )}

      {showFormula && mode === 'slope' && (
        <div className="rounded-lg p-3 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono text-sm font-bold" style={{ color: 'var(--primary)' }}>
            m = rise/run = (y₂−y₁)/(x₂−x₁)
          </p>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            = ({B.y}−{A.y})/({B.x}−{A.x}) = {rise}/{run} = <strong>{sl}</strong>
          </p>
        </div>
      )}

      {!showLabels && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Drag points A and B anywhere on the grid
        </p>
      )}
    </div>
  );
}
