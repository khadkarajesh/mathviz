import { Point, GridConfig } from '@/types/canvas';

/**
 * Convert math coordinates (y-up, origin bottom-left) to SVG coordinates (y-down, origin top-left).
 * All canvas components work in math space; this converts to SVG space for rendering.
 */
export function mathToSVG(point: Point, svgHeight: number): Point {
  return { x: point.x, y: svgHeight - point.y };
}

export function svgToMath(point: Point, svgHeight: number): Point {
  return { x: point.x, y: svgHeight - point.y };
}

/** Snap a math-space point to the nearest grid intersection */
export function snapToGrid(point: Point, cellSize: number): Point {
  return {
    x: Math.round(point.x / cellSize) * cellSize,
    y: Math.round(point.y / cellSize) * cellSize,
  };
}

/** Get SVG pointer position relative to an SVG element, in math coordinates */
export function getPointerMathPos(
  e: React.PointerEvent<SVGSVGElement>,
  svgEl: SVGSVGElement,
  svgHeight: number
): Point {
  const rect = svgEl.getBoundingClientRect();
  const scaleX = svgEl.viewBox.baseVal.width / rect.width;
  const scaleY = svgEl.viewBox.baseVal.height / rect.height;
  const svgX = (e.clientX - rect.left) * scaleX;
  const svgY = (e.clientY - rect.top) * scaleY;
  return svgToMath({ x: svgX, y: svgY }, svgHeight);
}

/** Build SVG path string from math-space polygon vertices */
export function polygonToSVGPath(vertices: Point[], svgHeight: number): string {
  if (vertices.length === 0) return '';
  const pts = vertices.map((v) => mathToSVG(v, svgHeight));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return `${d} Z`;
}

/** Calculate distance between two math-space points */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/** Grid cell size to actual unit label (e.g., 40px = 1 meter) */
export function gridUnits(grid: GridConfig, pixels: number): number {
  return pixels / grid.cellSize;
}
