'use client';

import { useCallback, useRef, useState } from 'react';
import { Point } from '@/types/canvas';
import { getPointerMathPos } from '@/lib/utils/svgHelpers';

interface UseDragOptions {
  svgHeight: number;
  onDragMove?: (point: Point, pointerId: number) => void;
  onDragEnd?: (point: Point, pointerId: number) => void;
  disabled?: boolean;
}

/**
 * Generic SVG drag hook. Handles both mouse and touch (pointer events API).
 * Returns event handlers to spread on the SVG element and dragging state.
 * All coordinates returned are in math space (y-up, origin bottom-left).
 */
export function useDrag({ svgHeight, onDragMove, onDragEnd, disabled }: UseDragOptions) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const activePointers = useRef<Set<number>>(new Set());

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (disabled) return;
      activePointers.current.add(e.pointerId);
      setIsDragging(true);
      // Capture so we get events even if pointer leaves SVG
      (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (disabled || !activePointers.current.has(e.pointerId)) return;
      if (!svgRef.current) return;
      const mathPos = getPointerMathPos(e, svgRef.current, svgHeight);
      onDragMove?.(mathPos, e.pointerId);
    },
    [disabled, onDragMove, svgHeight]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!activePointers.current.has(e.pointerId)) return;
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size === 0) setIsDragging(false);
      if (!svgRef.current) return;
      const mathPos = getPointerMathPos(e, svgRef.current, svgHeight);
      onDragEnd?.(mathPos, e.pointerId);
    },
    [onDragEnd, svgHeight]
  );

  const svgProps = {
    ref: svgRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    style: { touchAction: 'none' } as React.CSSProperties,
  };

  return { svgProps, isDragging, svgRef };
}
