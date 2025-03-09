
import { useEffect, useState, RefObject } from 'react';

interface UseCanvasZoomAndPanProps {
  containerRef: RefObject<HTMLDivElement>;
  setZoomLevel: (zoomLevel: number) => void;
}

export const useCanvasZoomAndPan = ({ containerRef, setZoomLevel }: UseCanvasZoomAndPanProps) => {
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.min(Math.max(0.1, prev + delta), 5));
        return;
      }

      if (e.shiftKey) {
        // Update pan position for horizontal scrolling
        setPanPosition(prev => ({
          x: prev.x - e.deltaY,
          y: prev.y
        }));
        return;
      }

      // Normal vertical scrolling
      setPanPosition(prev => ({
        x: prev.x,
        y: prev.y - e.deltaY
      }));
    };

    containerElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      containerElement.removeEventListener('wheel', handleWheel);
    };
  }, [setZoomLevel, containerRef]);

  return { panPosition, setPanPosition };
};
