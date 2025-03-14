
import { useRef } from "react";
import { CanvasWorkspaceContent } from "./canvas/CanvasWorkspaceContent";
import { useDragAndResize } from "./canvas/useDragAndResize";
import { useCanvas } from "./CanvasContext";
import { useCanvasKeyboardShortcuts } from "./canvas/hooks/useCanvasKeyboardShortcuts";
import { useCanvasZoomAndPan } from "./canvas/hooks/useCanvasZoomAndPan";
import { useCanvasInitialization } from "./canvas/hooks/useCanvasInitialization";

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
    undo
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
    undo
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
    canvasNavMode
  });

  // Modificar o handleCanvasMouseDown para limpar a seleção quando clicar no canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Chama o comportamento original
    handleCanvasMouseDown(e);
    
    // Limpa a seleção se não estiver no modo de pan
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
