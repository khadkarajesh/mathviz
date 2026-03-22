import dynamic from 'next/dynamic';
import type { CanvasProps } from '@/types/canvas';
import type { ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCanvasComponent = ComponentType<CanvasProps<any>>;

// Each canvas is dynamically imported so only used canvases ship to the client.
export const canvasRegistry: Record<string, AnyCanvasComponent> = {
  RectangleCanvas: dynamic(
    () => import('@/components/canvases/geometry/RectangleCanvas').then((m) => m.RectangleCanvas),
    { ssr: false }
  ),
  AngleCanvas: dynamic(
    () => import('@/components/canvases/geometry/AngleCanvas').then((m) => m.AngleCanvas),
    { ssr: false }
  ),
  TransformCanvas: dynamic(
    () => import('@/components/canvases/geometry/TransformCanvas').then((m) => m.TransformCanvas),
    { ssr: false }
  ),
  PythagoreanCanvas: dynamic(
    () => import('@/components/canvases/geometry/PythagoreanCanvas').then((m) => m.PythagoreanCanvas),
    { ssr: false }
  ),
  BalanceCanvas: dynamic(
    () => import('@/components/canvases/statistics/BalanceCanvas').then((m) => m.BalanceCanvas),
    { ssr: false }
  ),
  MedianCanvas: dynamic(
    () => import('@/components/canvases/statistics/MedianCanvas').then((m) => m.MedianCanvas),
    { ssr: false }
  ),
  DotPlotCanvas: dynamic(
    () => import('@/components/canvases/statistics/DotPlotCanvas').then((m) => m.DotPlotCanvas),
    { ssr: false }
  ),
  HistogramCanvas: dynamic(
    () => import('@/components/canvases/statistics/HistogramCanvas').then((m) => m.HistogramCanvas),
    { ssr: false }
  ),
  ScatterCanvas: dynamic(
    () => import('@/components/canvases/statistics/ScatterCanvas').then((m) => m.ScatterCanvas),
    { ssr: false }
  ),
  ProbabilityCanvas: dynamic(
    () => import('@/components/canvases/statistics/ProbabilityCanvas').then((m) => m.ProbabilityCanvas),
    { ssr: false }
  ),
  CompositeShapeCanvas: dynamic(
    () => import('@/components/canvases/geometry/CompositeShapeCanvas').then((m) => m.CompositeShapeCanvas),
    { ssr: false }
  ),
  CoordinateGeometryCanvas: dynamic(
    () => import('@/components/canvases/geometry/CoordinateGeometryCanvas').then((m) => m.CoordinateGeometryCanvas),
    { ssr: false }
  ),
};
