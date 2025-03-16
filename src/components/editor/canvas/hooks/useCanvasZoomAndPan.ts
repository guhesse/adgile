
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
  const [panPosition, setPanPosition] = useState({ x: 100, y: 100 }); // Start with some padding

  // Handle zooming
  useEffect(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        // Calculate zoom factor
        const delta = -e.deltaY * 0.01;
        const newZoomLevel = Math.max(0.2, Math.min(3, zoomLevel + delta));
        
        // Get mouse position relative to container
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - panPosition.x;
        const mouseY = e.clientY - rect.top - panPosition.y;
        
        // Calculate new pan position to zoom towards mouse cursor
        const scaleFactor = newZoomLevel / zoomLevel;
        const newPanX = panPosition.x - mouseX * (scaleFactor - 1);
        const newPanY = panPosition.y - mouseY * (scaleFactor - 1);
        
        // Update zoom level and pan position
        setZoomLevel(newZoomLevel);
        setPanPosition({ x: newPanX, y: newPanY });
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [containerRef, zoomLevel, panPosition, setZoomLevel]);

  // Handle keyboard shortcuts for zooming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          setZoomLevel(prev => Math.min(prev + 0.1, 3));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomLevel(prev => Math.max(prev - 0.1, 0.2));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1);
        }
      }

      // Handle arrow keys for panning
      if (e.key === 'ArrowUp') {
        setPanPosition(prev => ({ ...prev, y: prev.y + 10 }));
      } else if (e.key === 'ArrowDown') {
        setPanPosition(prev => ({ ...prev, y: prev.y - 10 }));
      } else if (e.key === 'ArrowLeft') {
        setPanPosition(prev => ({ ...prev, x: prev.x + 10 }));
      } else if (e.key === 'ArrowRight') {
        setPanPosition(prev => ({ ...prev, x: prev.x - 10 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setZoomLevel]);

  // Handle pan with mouse
  useEffect(() => {
    if (!containerRef?.current) return;
    
    const container = containerRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (canvasNavMode === 'pan' || e.buttons === 2 || e.buttons === 4 || e.altKey || e.getModifierState('Space')) {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        setPanOffset({ x: panPosition.x, y: panPosition.y });
        
        document.body.style.cursor = 'grabbing';
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        
        setPanPosition({
          x: panOffset.x + dx,
          y: panOffset.y + dy
        });
      }
    };
    
    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
    };
    
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasNavMode, containerRef, isPanning, panOffset, panPosition, panStart]);

  return {
    panStart,
    setPanStart,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    panPosition,
    setPanPosition
  };
};
