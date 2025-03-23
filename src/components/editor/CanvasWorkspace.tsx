
import { useRef, useEffect } from "react";
import { CanvasWorkspaceContent } from "./canvas/CanvasWorkspaceContent";
import { useDragAndResize } from "./canvas/useDragAndResize";
import { useCanvas } from "./CanvasContext";
import { useCanvasKeyboardShortcuts } from "./canvas/hooks/useCanvasKeyboardShortcuts";
import { useCanvasZoomAndPan } from "./canvas/hooks/useCanvasZoomAndPan";
import { useCanvasInitialization } from "./canvas/hooks/useCanvasInitialization";
import { constrainAllElements } from "./utils/containerUtils";
import { useHotkeys } from "react-hotkeys-hook";

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
    updateAllLinkedElements,
    removeElement,
    undo,
    updateElementStyle
  } = useCanvas();

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas elements
  useCanvasInitialization({ elements, organizeElements });

  // Handle keyboard shortcuts
  useCanvasKeyboardShortcuts({ 
    canvasNavMode, 
    setCanvasNavMode, 
    selectedElement, 
    removeElement,
    undo,
    updateElementStyle
  });

  // Handle zoom and pan
  const { 
    panPosition, 
    setPanPosition, 
    isPanning, 
    setIsPanning 
  } = useCanvasZoomAndPan({ 
    canvasNavMode, 
    setZoomLevel, 
    zoomLevel,
    containerRef 
  });

  // Handle drag and resize
  const {
    isDragging,
    isResizing,
    hoveredContainer,
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
    canvasNavMode,
    activeSizes
  });

  // Keyboard navigation for selected elements
  useHotkeys('left', () => {
    if (selectedElement && canvasNavMode === 'edit' && !isResizing && !isDragging) {
      updateElementStyle(selectedElement.id, { x: Math.max(0, selectedElement.style.x - 1) });
    }
  }, [selectedElement, canvasNavMode, isResizing, isDragging]);

  useHotkeys('right', () => {
    if (selectedElement && canvasNavMode === 'edit' && !isResizing && !isDragging) {
      updateElementStyle(selectedElement.id, { x: selectedElement.style.x + 1 });
    }
  }, [selectedElement, canvasNavMode, isResizing, isDragging]);

  useHotkeys('up', () => {
    if (selectedElement && canvasNavMode === 'edit' && !isResizing && !isDragging) {
      updateElementStyle(selectedElement.id, { y: Math.max(0, selectedElement.style.y - 1) });
    }
  }, [selectedElement, canvasNavMode, isResizing, isDragging]);

  useHotkeys('down', () => {
    if (selectedElement && canvasNavMode === 'edit' && !isResizing && !isDragging) {
      updateElementStyle(selectedElement.id, { y: selectedElement.style.y + 1 });
    }
  }, [selectedElement, canvasNavMode, isResizing, isDragging]);

  // Effect to ensure all elements stay within the bounds of the artboard
  useEffect(() => {
    if (elements.length > 0) {
      const constrainedElements = constrainAllElements(elements, selectedSize.width, selectedSize.height);
      
      // Only update if elements changed to avoid re-renders
      if (JSON.stringify(elements) !== JSON.stringify(constrainedElements)) {
        setElements(constrainedElements);
      }
    }
  }, [selectedSize, elements.length]);

  // Modify the handleCanvasMouseDown to clear the selection when clicking on the canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Prevent default browser behavior
    e.preventDefault();
    
    // Call the original behavior
    handleCanvasMouseDown(e);
    
    // Clear selection if not in pan mode
    if (canvasNavMode !== 'pan') {
      setSelectedElement(null);
    }
  };

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
      handleCanvasMouseDown={handleCanvasClick}
      handleResizeStart={handleResizeStart}
      handleContainerHover={handleContainerHover}
      handleContainerHoverEnd={handleContainerHoverEnd}
      handleMouseMove={handleMouseMove}
      handleMouseUp={handleMouseUp}
      editorKey={key.toString()} // Convert number to string for editorKey
      editingMode={editingMode}
      setEditingMode={setEditingMode}
    />
  );
};
