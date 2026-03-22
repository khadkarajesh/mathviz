import { CPAPhase } from './curriculum';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasProps<TState = Record<string, unknown>> {
  initialState: TState;
  onStateChange?: (state: TState) => void;
  phase: CPAPhase;
  readOnly?: boolean;
}

export interface DragState {
  isDragging: boolean;
  pointerId: number | null;
  startPoint: Point;
  currentPoint: Point;
}

export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number; // pixels per grid unit
  originX: number; // grid origin in SVG space
  originY: number;
}

export interface PolygonState {
  vertices: Point[]; // in math coordinates (y-up)
  locked: boolean;
}

export interface RectangleState {
  x: number;
  y: number;
  width: number;
  height: number;
}
