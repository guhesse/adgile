
import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ElementRenderer } from "./ElementRenderer";
import { useCanvas } from "./CanvasContext";
import { snapToGrid, findOptimalPosition } from "./utils/gridUtils";
import { toast } from "sonner";

export const CanvasWorkspace = () => {
  const {
    elements,
    selectedElement,
    setSelectedElement,
    selectedSize,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    resizeDirection,
    setResizeDirection,
    dragStart,
    setDragStart,
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
  const [containerHoverTimer, setContainerHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [containerExitTimer, setContainerExitTimer] = useState<NodeJS.Timeout | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isElementOutsideContainer, setIsElementOutsideContainer] = useState(false);

  // Auto-organize elements when new ones are added
  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, []);

  // Event handlers for spacebar + canvas panning
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

  // Handle wheel events for zooming and panning
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Ctrl + wheel for zoom
      if (e.ctrlKey) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.min(Math.max(0.1, prev + delta), 5)); // Extended zoom range from 0.1 to 5
        return;
      }

      // Shift + wheel for horizontal scroll
      if (e.shiftKey) {
        setPanPosition(prev => ({
          x: prev.x - e.deltaY,
          y: prev.y
        }));
        return;
      }

      // Regular wheel for vertical scroll
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

  const handleMouseDown = (e: React.MouseEvent, element: any) => {
    if (canvasNavMode === 'pan') {
      // Handle panning mode
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
      return;
    }

    e.stopPropagation();

    setSelectedElement(element);
    setIsDragging(true);

    // Store the mouse position relative to the element top-left corner
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Canvas panning when in pan mode
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (canvasNavMode === 'pan') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string, element: any) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setSelectedElement(element);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleContainerHover = (e: React.MouseEvent, containerId: string) => {
    // Only handle container hovering when dragging an element
    if (!isDragging || !selectedElement || selectedElement.id === containerId) {
      return;
    }

    // Clear any existing hover timer
    if (containerHoverTimer) {
      clearTimeout(containerHoverTimer);
    }

    // Set a new timer for hovering
    const timer = setTimeout(() => {
      setHoveredContainer(containerId);
    }, 300); // 300ms hover time to consider moving into container

    setContainerHoverTimer(timer);
  };

  const handleContainerHoverEnd = () => {
    if (containerHoverTimer) {
      clearTimeout(containerHoverTimer);
      setContainerHoverTimer(null);
    }
    setHoveredContainer(null);
  };

  const handleElementExitContainer = (element: any, isOutside: boolean) => {
    if (!element.inContainer) return;

    // If already tracking and no longer outside, cancel the exit
    if (containerExitTimer && !isOutside) {
      clearTimeout(containerExitTimer);
      setContainerExitTimer(null);
      setIsElementOutsideContainer(false);
      return;
    }

    // If newly outside, start the timer
    if (isOutside && !containerExitTimer) {
      setIsElementOutsideContainer(true);
      const timer = setTimeout(() => {
        moveElementOutOfContainer(element);
        setContainerExitTimer(null);
        setIsElementOutsideContainer(false);
      }, 500); // 500ms to exit container

      setContainerExitTimer(timer);
    }
  };

  const moveElementOutOfContainer = (element: any) => {
    if (!element.inContainer || !element.parentId) return;

    // Find the parent container
    const parentContainer = elements.find(el => el.id === element.parentId);
    if (!parentContainer) return;

    // Calculate absolute position in the canvas
    const absoluteX = parentContainer.style.x + element.style.x;
    const absoluteY = parentContainer.style.y + element.style.y;

    // Create a new standalone element
    const newElements = [...elements];
    
    // Remove element from its parent's childElements
    const parentIndex = newElements.findIndex(el => el.id === element.parentId);
    if (parentIndex !== -1 && newElements[parentIndex].childElements) {
      newElements[parentIndex] = {
        ...newElements[parentIndex],
        childElements: newElements[parentIndex].childElements?.filter(child => child.id !== element.id) || []
      };
    }

    // Add the element as a top-level element
    const standaloneElement = {
      ...element,
      inContainer: false,
      parentId: undefined,
      style: {
        ...element.style,
        x: absoluteX,
        y: absoluteY
      }
    };

    newElements.push(standaloneElement);
    setElements(newElements);
    setSelectedElement(standaloneElement);
    
    toast.success('Elemento removido do container');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handle panning
    if (isPanning) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (!isDragging && !isResizing) return;

    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds || !selectedElement) return;

    if (isDragging) {
      // Calculate the new position based on mouse and canvas coordinates
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const parentElement = selectedElement.inContainer ?
        elements.find(el => el.id === selectedElement.parentId) : null;

      // Calculate new position by subtracting the drag start offset
      const canvasX = (mouseX - canvasRect.left) / zoomLevel;
      const canvasY = (mouseY - canvasRect.top) / zoomLevel;

      let newX = canvasX - dragStart.x / zoomLevel;
      let newY = canvasY - dragStart.y / zoomLevel;

      // Check if element is being dragged outside its container
      if (parentElement && selectedElement.inContainer) {
        const isOutside = (
          newX < 0 ||
          newY < 0 ||
          newX + selectedElement.style.width > parentElement.style.width ||
          newY + selectedElement.style.height > parentElement.style.height
        );
        
        handleElementExitContainer(selectedElement, isOutside);

        // Constrain element within container bounds (unless it's exiting)
        if (!isElementOutsideContainer) {
          newX = Math.max(0, Math.min(newX, parentElement.style.width - selectedElement.style.width));
          newY = Math.max(0, Math.min(newY, parentElement.style.height - selectedElement.style.height));
        }
      } else {
        // If not in a container, constrain within canvas
        newX = Math.max(0, Math.min(newX, selectedSize.width - selectedElement.style.width));
        newY = Math.max(0, Math.min(newY, selectedSize.height - selectedElement.style.height));
      }

      // Apply grid snapping
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      // Calculate percentage values for responsive positioning
      const xPercent = (newX / selectedSize.width) * 100;
      const yPercent = (newY / selectedSize.height) * 100;

      // Update the selected element with new position
      let updatedElements = [...elements];
      
      if (editingMode === 'global' && selectedElement.linkedElementId) {
        // Update all linked elements across different sizes
        updatedElements = updateAllLinkedElements(
          updatedElements,
          selectedElement,
          { xPercent, yPercent },
          { x: newX, y: newY }
        );
      } else {
        // Only update the current element
        updatedElements = updatedElements.map(el => {
          if (el.id === selectedElement.id) {
            return { 
              ...el, 
              style: { 
                ...el.style, 
                x: newX, 
                y: newY,
                xPercent,
                yPercent 
              },
              isIndividuallyPositioned: editingMode === 'individual'
            };
          }

          if (el.childElements && selectedElement.parentId === el.id) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === selectedElement.id
                  ? { 
                      ...child, 
                      style: { 
                        ...child.style, 
                        x: newX - el.style.x, 
                        y: newY - el.style.y,
                        xPercent,
                        yPercent
                      },
                      isIndividuallyPositioned: editingMode === 'individual'
                    }
                  : child
              )
            };
          }

          return el;
        });
      }

      setElements(updatedElements);

      // Update the selected element reference
      setSelectedElement({
        ...selectedElement,
        style: { 
          ...selectedElement.style, 
          x: newX, 
          y: newY,
          xPercent,
          yPercent
        },
        isIndividuallyPositioned: editingMode === 'individual'
      });
    } else if (isResizing) {
      // Handle resizing with similar improvements
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = selectedElement.style.width;
      let newHeight = selectedElement.style.height;
      let newX = selectedElement.style.x;
      let newY = selectedElement.style.y;

      // Apply different scaling factor based on zoom level
      const scaledDeltaX = deltaX / zoomLevel;
      const scaledDeltaY = deltaY / zoomLevel;

      // Handle different resize directions with grid snapping
      if (resizeDirection.includes('e')) {
        newWidth = snapToGrid(Math.max(50, selectedElement.style.width + scaledDeltaX));
      }
      if (resizeDirection.includes('w')) {
        const possibleWidth = snapToGrid(Math.max(50, selectedElement.style.width - scaledDeltaX));
        newX = snapToGrid(selectedElement.style.x + (selectedElement.style.width - possibleWidth));
        newWidth = possibleWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = snapToGrid(Math.max(20, selectedElement.style.height + scaledDeltaY));
      }
      if (resizeDirection.includes('n')) {
        const possibleHeight = snapToGrid(Math.max(20, selectedElement.style.height - scaledDeltaY));
        newY = snapToGrid(selectedElement.style.y + (selectedElement.style.height - possibleHeight));
        newHeight = possibleHeight;
      }

      // Apply parent container constraints if needed
      if (selectedElement.inContainer && selectedElement.parentId) {
        const parentElement = elements.find(el => el.id === selectedElement.parentId);
        if (parentElement) {
          // Ensure the element stays within the container bounds
          if (newX < 0) {
            newX = 0;
            newWidth = selectedElement.style.width;
          }
          if (newY < 0) {
            newY = 0;
            newHeight = selectedElement.style.height;
          }
          if (newX + newWidth > parentElement.style.width) {
            newWidth = parentElement.style.width - newX;
          }
          if (newY + newHeight > parentElement.style.height) {
            newHeight = parentElement.style.height - newY;
          }
        }
      }

      // Calculate percentage values
      const widthPercent = (newWidth / selectedSize.width) * 100;
      const heightPercent = (newHeight / selectedSize.height) * 100;
      const xPercent = (newX / selectedSize.width) * 100;
      const yPercent = (newY / selectedSize.height) * 100;

      // Update elements array
      let updatedElements;
      
      if (editingMode === 'global' && selectedElement.linkedElementId) {
        // Update all linked elements across different sizes
        updatedElements = updateAllLinkedElements(
          elements,
          selectedElement,
          { xPercent, yPercent, widthPercent, heightPercent },
          { x: newX, y: newY, width: newWidth, height: newHeight }
        );
      } else {
        // Update only the current element
        updatedElements = elements.map(el => {
          if (el.id === selectedElement.id) {
            return { 
              ...el, 
              style: { 
                ...el.style, 
                x: newX, 
                y: newY, 
                width: newWidth, 
                height: newHeight,
                xPercent,
                yPercent,
                widthPercent,
                heightPercent
              },
              isIndividuallyPositioned: editingMode === 'individual'
            };
          }

          if (el.childElements && selectedElement.parentId === el.id) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === selectedElement.id
                  ? {
                    ...child,
                    style: {
                      ...child.style,
                      x: newX - el.style.x,
                      y: newY - el.style.y,
                      width: newWidth,
                      height: newHeight,
                      xPercent,
                      yPercent,
                      widthPercent,
                      heightPercent
                    },
                    isIndividuallyPositioned: editingMode === 'individual'
                  }
                  : child
              )
            };
          }

          return el;
        });
      }

      setElements(updatedElements);

      // Update selected element reference
      setSelectedElement({
        ...selectedElement,
        style: { 
          ...selectedElement.style, 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
        },
        isIndividuallyPositioned: editingMode === 'individual'
      });

      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging || isResizing) {
      // If hovering over a container when releasing the element and not a container itself
      if (hoveredContainer && selectedElement && selectedElement.type !== 'container' && selectedElement.type !== 'layout') {
        // Move the element into the container
        moveElementToContainer(selectedElement, hoveredContainer);
      } else {
        // Otherwise, just re-organize elements
        organizeElements();
      }
    }

    if (containerExitTimer) {
      clearTimeout(containerExitTimer);
      setContainerExitTimer(null);
      setIsElementOutsideContainer(false);
    }

    setIsDragging(false);
    setIsResizing(false);
    handleContainerHoverEnd();
  };

  const moveElementToContainer = (element: any, containerId: string) => {
    // Find the container
    const container = elements.find(el => el.id === containerId);
    if (!container) return;

    // Create a copy of the elements array to modify
    const updatedElements = [...elements];

    // If the element is already in a container, remove it from that container first
    if (element.inContainer && element.parentId) {
      const oldParentIndex = updatedElements.findIndex(el => el.id === element.parentId);
      if (oldParentIndex !== -1 && updatedElements[oldParentIndex].childElements) {
        updatedElements[oldParentIndex] = {
          ...updatedElements[oldParentIndex],
          childElements: updatedElements[oldParentIndex].childElements?.filter(child => child.id !== element.id) || []
        };
      }
    } else {
      // If not in a container, remove it from the main elements array
      const elementIndex = updatedElements.findIndex(el => el.id === element.id);
      if (elementIndex !== -1) {
        updatedElements.splice(elementIndex, 1);
      }
    }

    // Find the container in our updated array
    const containerIndex = updatedElements.findIndex(el => el.id === containerId);
    if (containerIndex === -1) return;

    // Calculate position relative to the container
    const relativeX = Math.max(0, element.style.x - container.style.x);
    const relativeY = Math.max(0, element.style.y - container.style.y);

    // Ensure the element is within container bounds
    const adjustedX = Math.min(relativeX, container.style.width - element.style.width);
    const adjustedY = Math.max(0, Math.min(relativeY, container.style.height - element.style.height));

    // Calculate percentage values
    const xPercent = (adjustedX / container.style.width) * 100;
    const yPercent = (adjustedY / container.style.height) * 100;

    // Add the element to the container
    const childElements = updatedElements[containerIndex].childElements || [];

    // Update container with the new child
    updatedElements[containerIndex] = {
      ...updatedElements[containerIndex],
      childElements: [
        ...childElements,
        {
          ...element,
          inContainer: true,
          parentId: containerId,
          style: {
            ...element.style,
            // Set position relative to the container
            x: adjustedX,
            y: adjustedY,
            xPercent,
            yPercent
          }
        }
      ]
    };

    // Update the elements state
    setElements(updatedElements);

    // Update the selected element to reflect its new container status
    setSelectedElement({
      ...element,
      inContainer: true,
      parentId: containerId,
      style: {
        ...element.style,
        x: adjustedX,
        y: adjustedY,
        xPercent,
        yPercent
      }
    });
    
    toast.success('Elemento adicionado ao container');
  };

  const renderElement = (element: any, isChild = false, canvasSize = selectedSize) => {
    const isHovered = hoveredContainer === element.id;
    const isContainer = element.type === "container" || element.type === "layout";
    const isExiting = isElementOutsideContainer && selectedElement?.id === element.id;

    // Apply optimal positioning for this specific canvas size
    const optimalPosition = findOptimalPosition(element, canvasSize.width, canvasSize.height);
    
    // Use fixed positioning if element has been individually positioned
    const position = element.isIndividuallyPositioned 
      ? { x: element.style.x, y: element.style.y, width: element.style.width, height: element.style.height }
      : optimalPosition;

    let positionStyle: React.CSSProperties = {};

    if (isChild) {
      // Child elements are positioned relative to their container
      positionStyle = {
        position: "absolute",
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height
      };
    } else {
      // Top-level elements are positioned absolutely within the canvas
      positionStyle = {
        position: "absolute",
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height
      };
    }

    return (
      <div
        key={`${element.id}-${key}-${canvasSize.name}`}
        style={{
          ...positionStyle,
          animationPlayState: element.style.animationPlayState,
          animationDelay: element.style.animationDelay != null ? `${element.style.animationDelay}s` : undefined,
          animationDuration: element.style.animationDuration != null ? `${element.style.animationDuration}s` : undefined,
          backgroundColor: isContainer
            ? isHovered ? "rgba(200, 220, 255, 0.5)" : "rgba(240, 240, 240, 0.5)"
            : element.style.backgroundColor,
          border: isContainer
            ? isHovered ? "1px dashed #4080ff" : "1px dashed #aaa"
            : undefined,
          zIndex: isDragging && selectedElement?.id === element.id ? 1000 : 1,
          transition: isExiting ? "none" : "background-color 0.3s, border-color 0.3s",
          overflow: isContainer ? "hidden" : "visible",
          cursor: canvasNavMode === 'pan' ? 'grab' : 'move',
          userSelect: "none",
          opacity: isExiting ? 0.6 : 1,
          boxShadow: isExiting ? "0 0 0 2px #ff4040" : undefined
        }}
        className={`${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation || ""}`}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onMouseEnter={(e) => {
          if (isContainer) {
            handleContainerHover(e, element.id);
          }
        }}
        onMouseLeave={() => {
          if (isContainer) {
            handleContainerHoverEnd();
          }
        }}
      >
        <ElementRenderer element={element} />

        {/* Render child elements */}
        {isContainer && element.childElements && (
          <div className="absolute top-0 left-0 w-full h-full">
            {element.childElements.map((child: any) => renderElement(child, true, canvasSize))}
          </div>
        )}

        {/* Resize Handles - only show for selected elements and not in pan mode */}
        {selectedElement?.id === element.id && canvasNavMode !== 'pan' && (
          <>
            <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n', element)}></div>
            <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e', element)}></div>
            <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's', element)}></div>
            <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w', element)}></div>
            <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw', element)}></div>
            <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne', element)}></div>
            <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se', element)}></div>
            <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw', element)}></div>
          </>
        )}
      </div>
    );
  };

  // Show all active sizes if there's more than one and selectedSize.name is 'All'
  const shouldShowAllSizes = activeSizes.length > 1 && selectedSize.name === 'All';

  return (
    <div
      ref={containerRef}
      className={`flex-1 p-8 flex justify-center items-center overflow-hidden ${canvasNavMode === 'pan' ? 'canvas-pan-mode' : ''}`}
      style={{
        cursor: isPanning ? 'grabbing' : canvasNavMode === 'pan' ? 'grab' : 'default',
      }}
    >
      <div
        style={{
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
        }}
      >
        {shouldShowAllSizes ? (
          // Display multiple canvas sizes
          activeSizes.map((size, index) => (
            <div key={`canvas-${size.name}`} className="relative flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-2">{size.name} ({size.width}×{size.height})</div>
              <Card
                className="relative bg-white shadow-lg transform"
                style={{
                  width: size.width,
                  height: size.height,
                  backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease-out"
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Render elements for this size */}
                {elements.filter(el => !el.inContainer).map((element) => renderElement(element, false, size))}
              </Card>
            </div>
          ))
        ) : (
          // Display single canvas
          <Card
            ref={canvasRef}
            className="relative bg-white shadow-lg transform"
            style={{
              width: selectedSize.width,
              height: selectedSize.height,
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out"
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Render only top-level elements first */}
            {elements.filter(el => !el.inContainer).map((element) => renderElement(element))}
          </Card>
        )}
      </div>

      {/* Editing Mode Indicator */}
      <div className="absolute bottom-14 right-4 bg-white px-3 py-1.5 rounded shadow-md">
        <div 
          className={`flex gap-1 text-xs items-center cursor-pointer ${editingMode === 'global' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setEditingMode('global')}
        >
          <div className={`w-3 h-3 rounded-full ${editingMode === 'global' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          Edição Global
        </div>
        <div 
          className={`flex gap-1 text-xs items-center cursor-pointer mt-1 ${editingMode === 'individual' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setEditingMode('individual')}
        >
          <div className={`w-3 h-3 rounded-full ${editingMode === 'individual' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          Edição Individual
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded shadow-md flex items-center gap-3">
        <span className="text-xs whitespace-nowrap">Zoom: {Math.round(zoomLevel * 100)}%</span>
        <input 
          type="range" 
          min="10" 
          max="500" 
          value={zoomLevel * 100} 
          onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
          className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
