
import { useRef, useEffect, useState } from "react";
import { CanvasWorkspaceContent } from "./canvas/CanvasWorkspaceContent";
import { useDragAndResize } from "./canvas/useDragAndResize";
import { useCanvas } from "./CanvasContext";

export const CanvasWorkspace = () => {
  const {
    elements,
    selectedElement,
    setSelectedElement,
    selectedSize,
    key,
    setElements,
    organizeElements,
    zoomLevel,
    setZoomLevel,
    canvasNavMode,
    setCanvasNavMode,
    activeSizes,
    editingMode,
    setEditingMode,
    updateAllLinkedElements
  } = useCanvas();

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const {
    isDragging,
    isResizing,
    hoveredContainer,
    isPanning,
    isElementOutsideContainer,
    handleMouseDown,
    handleCanvasMouseDown,
    handleResizeStart,
    handleContainerHover,
    handleContainerHoverEnd,
    handleMouseMove,
    handleMouseUp
  } = useDragAndResize({
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    selectedSize,
    editingMode,
    updateAllLinkedElements,
    organizeElements,
    canvasNavMode
  });

  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, []);

  useEffect(() => {
    const handleSpacebarDown = () => {
      if (canvasNavMode !== 'pan') {
        setCanvasNavMode('pan');
      }
    };

    const handleSpacebarUp = () => {
      if (canvasNavMode === 'pan') {
        setCanvasNavMode('edit');
      }
    };

    document.addEventListener('canvas-spacebar-down', handleSpacebarDown);
    document.addEventListener('canvas-spacebar-up', handleSpacebarUp);

    return () => {
      document.removeEventListener('canvas-spacebar-down', handleSpacebarDown);
      document.removeEventListener('canvas-spacebar-up', handleSpacebarUp);
    };
  }, [canvasNavMode, setCanvasNavMode]);

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
  }, [setZoomLevel]);

  return (
    <CanvasWorkspaceContent
      containerRef={containerRef}
      canvasRef={canvasRef}
      canvasNavMode={canvasNavMode}
      isPanning={isPanning}
      panPosition={panPosition}
      activeSizes={activeSizes}
      shouldShowAllSizes={activeSizes.length > 1 && selectedSize.name === 'All'}
      selectedSize={selectedSize}
      zoomLevel={zoomLevel}
      setZoomLevel={setZoomLevel}
      elements={elements}
      selectedElement={selectedElement}
      isDragging={isDragging}
      isResizing={isResizing}
      isElementOutsideContainer={isElementOutsideContainer}
      hoveredContainer={hoveredContainer}
      handleMouseDown={handleMouseDown}
      handleCanvasMouseDown={handleCanvasMouseDown}
      handleResizeStart={handleResizeStart}
      handleContainerHover={handleContainerHover}
      handleContainerHoverEnd={handleContainerHoverEnd}
      handleMouseMove={handleMouseMove}
      handleMouseUp={handleMouseUp}
      editorKey={key} // Changed from key to editorKey to avoid naming conflict
      editingMode={editingMode}
      setEditingMode={setEditingMode}
    />
  );
};
