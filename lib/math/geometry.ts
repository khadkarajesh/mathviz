import { Point } from '@/types/canvas';

/** Shoelace formula for polygon area (math-space coordinates) */
export function polygonArea(vertices: Point[]): number {
  const n = vertices.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area) / 2;
}

/** Perimeter of a polygon (math-space coordinates) */
export function polygonPerimeter(vertices: Point[]): number {
  const n = vertices.length;
  if (n < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = vertices[j].x - vertices[i].x;
    const dy = vertices[j].y - vertices[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

/** Rectangle area */
export function rectArea(width: number, height: number): number {
  return width * height;
}

/** Rectangle perimeter */
export function rectPerimeter(width: number, height: number): number {
  return 2 * (width + height);
}

/** 2D transformation matrix (column-major) */
export type Matrix2D = [number, number, number, number, number, number]; // [a, b, c, d, tx, ty]

export function identityMatrix(): Matrix2D {
  return [1, 0, 0, 1, 0, 0];
}

export function translationMatrix(tx: number, ty: number): Matrix2D {
  return [1, 0, 0, 1, tx, ty];
}

export function rotationMatrix(angleDeg: number): Matrix2D {
  const r = (angleDeg * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
}

export function reflectionMatrix(axis: 'x' | 'y'): Matrix2D {
  if (axis === 'x') return [1, 0, 0, -1, 0, 0];
  return [-1, 0, 0, 1, 0, 0];
}

export function scaleMatrix(factor: number): Matrix2D {
  return [factor, 0, 0, factor, 0, 0];
}

export function applyMatrix(m: Matrix2D, p: Point): Point {
  return {
    x: m[0] * p.x + m[2] * p.y + m[4],
    y: m[1] * p.x + m[3] * p.y + m[5],
  };
}

export function applyMatrixToPolygon(m: Matrix2D, vertices: Point[]): Point[] {
  return vertices.map((v) => applyMatrix(m, v));
}

/** Distance between two points */
export function dist(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/** Pythagorean theorem: hypotenuse */
export function hypotenuse(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}
