
import { useRef, useEffect } from "react";
import { CanvasWorkspaceContent } from "./canvas/CanvasWorkspaceContent";
import { useDragAndResize } from "./canvas/useDragAndResize";
import { useCanvas } from "./CanvasContext";
import { useCanvasKeyboardShortcuts } from "./canvas/hooks/useCanvasKeyboardShortcuts";
import { useCanvasZoomAndPan } from "./canvas/hooks/useCanvasZoomAndPan";
import { useCanvasInitialization } from "./canvas/hooks/useCanvasInitialization";
import { constrainAllElements } from "./utils/containerUtils";
import { createLinkedVersions } from "./context/responsiveOperations";

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
    canvasNavMode,
    activeSizes
  });

  // Effect to ensure all elements stay within artboard bounds
  useEffect(() => {
    if (elements.length > 0) {
      const constrainedElements = constrainAllElements(elements, selectedSize.width, selectedSize.height);
      
      // Only update if elements changed to avoid re-renders
      if (JSON.stringify(elements) !== JSON.stringify(constrainedElements)) {
        setElements(constrainedElements);
      }
    }
  }, [selectedSize, elements.length]);

  // Create linked versions for elements without sizeId when adding new sizes
  useEffect(() => {
    if (activeSizes.length > 1 && elements.length > 0) {
      let elementsNeedUpdate = false;
      const updatedElements = [...elements];
      
      // Check for elements created before additional sizes were added
      elements.forEach((element, index) => {
        if (!element.linkedElementId && (!element.sizeId || element.sizeId === activeSizes[0].name)) {
          // Create linked versions for this element
          const linkedElements = createLinkedVersions(element, activeSizes, activeSizes[0]);
          
          if (linkedElements.length > 1) {
            // Replace the original element with its updated version (first in the array)
            updatedElements[index] = linkedElements[0];
            
            // Add the newly created linked versions
            linkedElements.slice(1).forEach(linkedEl => {
              updatedElements.push(linkedEl);
            });
            
            elementsNeedUpdate = true;
          }
        }
      });
      
      if (elementsNeedUpdate) {
        setElements(updatedElements);
      }
    }
  }, [activeSizes.length, elements]);

  // Modify the handleCanvasMouseDown to clear selection when clicking on canvas
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
