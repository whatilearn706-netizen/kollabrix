'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SplitWidths {
  leftPct: number;
  rightPct: number;
  yoursRatio: number; // fraction of stacked web preview height given to "Yours" vs "Blueprint"
}

/**
 * Manages drag-to-resize percentages for the 3-column BattleWorkspace
 * and stacked Blueprint/Yours web previews.
 */
export function useResizableSplit(initialLeft = 28, initialRight = 25) {
  const [widths, setWidths] = useState<SplitWidths>({
    leftPct: initialLeft,
    rightPct: initialRight,
    yoursRatio: 50,
  });
  const [draggingAxis, setDraggingAxis] = useState<'left' | 'right' | 'webY' | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const webStackRef = useRef<HTMLDivElement | null>(null);

  const startDrag = useCallback((axis: 'left' | 'right' | 'webY') => {
    setDraggingAxis(axis);
  }, []);

  useEffect(() => {
    if (!draggingAxis) return;

    const handleMove = (e: PointerEvent) => {
      if (draggingAxis === 'left' || draggingAxis === 'right') {
        const box = containerRef.current?.getBoundingClientRect();
        if (!box || box.width <= 0) return;
        if (draggingAxis === 'left') {
          const nextLeft = ((e.clientX - box.left) / box.width) * 100;
          setWidths((prev) => {
            const clampedLeft = Math.max(18, Math.min(52, nextLeft));
            // Guarantee center editor always keeps at least 26%
            const maxAllowed = 74 - prev.rightPct;
            return { ...prev, leftPct: Math.min(clampedLeft, maxAllowed) };
          });
        } else {
          const nextRight = ((box.right - e.clientX) / box.width) * 100;
          setWidths((prev) => {
            const clampedRight = Math.max(14, Math.min(42, nextRight));
            const maxAllowed = 74 - prev.leftPct;
            return { ...prev, rightPct: Math.min(clampedRight, maxAllowed) };
          });
        }
      } else if (draggingAxis === 'webY') {
        const box = webStackRef.current?.getBoundingClientRect();
        if (!box || box.height <= 0) return;
        const topPct = ((e.clientY - box.top) / box.height) * 100;
        // yoursRatio = 100 - topPct
        const clampedTop = Math.max(25, Math.min(75, topPct));
        setWidths((prev) => ({ ...prev, yoursRatio: 100 - clampedTop }));
      }
    };

    const stopDrag = () => setDraggingAxis(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopDrag);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopDrag);
    };
  }, [draggingAxis]);

  const resetLayout = useCallback(() => {
    setWidths({ leftPct: initialLeft, rightPct: initialRight, yoursRatio: 50 });
  }, [initialLeft, initialRight]);

  const centerPct = Math.max(26, 100 - widths.leftPct - widths.rightPct);

  return {
    widths,
    centerPct,
    draggingAxis,
    containerRef,
    webStackRef,
    startDrag,
    resetLayout,
  };
}
