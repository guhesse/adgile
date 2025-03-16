
import { useState, useEffect, useRef } from 'react';
import { CanvasNavigationMode } from '../../types';

interface UseCanvasZoomAndPanProps {
  canvasNavMode: CanvasNavigationMode;
  setZoomLevel: (level: number) => void;
  zoomLevel: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useCanvasZoomAndPan = ({
  canvasNavMode,
  setZoomLevel,
  zoomLevel,
  containerRef
}: UseCanvasZoomAndPanProps) => {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // Handle wheel event for zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle zooming if Ctrl key is pressed or in pan mode
      if (e.ctrlKey || canvasNavMode === 'pan') {
        e.preventDefault();
        
        // More sensitive zoom step (1% instead of 5%)
        const zoomStep = 0.01;
        
        // Determine zoom direction
        const zoomFactor = e.deltaY > 0 ? -zoomStep : zoomStep;
        const newZoomLevel = Math.max(0.1, Math.min(3, zoomLevel + zoomFactor));
        
        setZoomLevel(newZoomLevel);
      } else if (canvasNavMode === 'pan') {
        // In pan mode, handle scroll without Ctrl as panning
        e.preventDefault();
        setPanPosition((prev) => ({
          x: prev.x - e.deltaX / zoomLevel,
          y: prev.y - e.deltaY / zoomLevel,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, zoomLevel, canvasNavMode, setZoomLevel]);

  // Prevent default spacebar behavior to avoid page scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent spacebar from scrolling the page
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    panPosition,
    setPanPosition
  };
};
