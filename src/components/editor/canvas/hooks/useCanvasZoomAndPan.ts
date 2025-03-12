
import { useState, useEffect, useCallback, useRef } from 'react';
import { CanvasNavigationMode } from '../../types';

interface UseCanvasZoomAndPanProps {
  canvasNavMode: CanvasNavigationMode;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  zoomLevel: number;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const useCanvasZoomAndPan = ({ 
  canvasNavMode, 
  setZoomLevel,
  zoomLevel,
  containerRef
}: UseCanvasZoomAndPanProps) => {
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  }, [setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  }, [setZoomLevel]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, [setZoomLevel]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [handleZoomIn, handleZoomOut]);

  return {
    panStart,
    setPanStart,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    panPosition,
    setPanPosition,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
  };
};
