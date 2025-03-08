import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ElementRenderer } from "./ElementRenderer";
import { useCanvas } from "./CanvasContext";
import { snapToGrid } from "./utils/gridUtils";

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
    zoomLevel
  } = useCanvas();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerHoverTimer, setContainerHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);

  // Auto-organize elements when new ones are added
  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent, element: any) => {
    e.stopPropagation();
    
    setSelectedElement(element);
    setIsDragging(true);
    
    // Calculate drag offset relative to the element position
    const rect = e.currentTarget.getBoundingClientRect();
    const dragOffsetX = e.clientX - rect.left;
    const dragOffsetY = e.clientY - rect.top;
    
    setDragStart({
      x: dragOffsetX,
      y: dragOffsetY,
    });
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
    }, 500); // 500ms hover time to consider moving into container

    setContainerHoverTimer(timer);
  };

  const handleContainerHoverEnd = () => {
    if (containerHoverTimer) {
      clearTimeout(containerHoverTimer);
      setContainerHoverTimer(null);
    }
    setHoveredContainer(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds || !selectedElement) return;

    if (isDragging) {
      // Get the canvas position
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const parentElement = selectedElement.inContainer ? 
        elements.find(el => el.id === selectedElement.parentId) : null;
      
      // Calculate mouse position relative to the canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Calculate element position considering the drag start offset
      let newX = mouseX - dragStart.x;
      let newY = mouseY - dragStart.y;
      
      // Apply constraints if the element is in a container
      if (parentElement) {
        // Convert to container's coordinate system
        const relativeX = newX - parentElement.style.x;
        const relativeY = newY - parentElement.style.y;
        
        // Constrain element within container bounds
        newX = Math.max(parentElement.style.x, Math.min(newX, parentElement.style.x + parentElement.style.width - selectedElement.style.width));
        newY = Math.max(parentElement.style.y, Math.min(newY, parentElement.style.y + parentElement.style.height - selectedElement.style.height));
      } else {
        // If not in a container, constrain within canvas
        newX = Math.max(0, Math.min(newX, selectedSize.width - selectedElement.style.width));
        newY = Math.max(0, Math.min(newY, selectedSize.height - selectedElement.style.height));
      }
      
      // Apply grid snapping
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      // Update elements array
      const updatedElements = elements.map(el => {
        if (el.id === selectedElement.id) {
          return { ...el, style: { ...el.style, x: newX, y: newY } };
        }
        
        if (el.childElements && selectedElement.parentId === el.id) {
          return {
            ...el,
            childElements: el.childElements.map(child => 
              child.id === selectedElement.id
                ? { ...child, style: { ...child.style, x: newX - el.style.x, y: newY - el.style.y } }
                : child
            )
          };
        }
        
        return el;
      });
      
      setElements(updatedElements);

      // Update the selected element reference
      setSelectedElement({
        ...selectedElement,
        style: { ...selectedElement.style, x: newX, y: newY }
      });
    } else if (isResizing) {
      // Handle resizing similarly, with container constraints
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = selectedElement.style.width;
      let newHeight = selectedElement.style.height;
      let newX = selectedElement.style.x;
      let newY = selectedElement.style.y;
      
      // Handle different resize directions with grid snapping
      if (resizeDirection.includes('e')) {
        newWidth = snapToGrid(Math.max(50, selectedElement.style.width + deltaX));
      }
      if (resizeDirection.includes('w')) {
        const possibleWidth = snapToGrid(Math.max(50, selectedElement.style.width - deltaX));
        newX = snapToGrid(selectedElement.style.x + (selectedElement.style.width - possibleWidth));
        newWidth = possibleWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = snapToGrid(Math.max(20, selectedElement.style.height + deltaY));
      }
      if (resizeDirection.includes('n')) {
        const possibleHeight = snapToGrid(Math.max(20, selectedElement.style.height - deltaY));
        newY = snapToGrid(selectedElement.style.y + (selectedElement.style.height - possibleHeight));
        newHeight = possibleHeight;
      }
      
      // Apply parent container constraints if needed
      if (selectedElement.inContainer && selectedElement.parentId) {
        const parentElement = elements.find(el => el.id === selectedElement.parentId);
        if (parentElement) {
          // Ensure the element stays within the container bounds
          if (newX < parentElement.style.x) {
            newX = parentElement.style.x;
            newWidth = selectedElement.style.width;
          }
          if (newY < parentElement.style.y) {
            newY = parentElement.style.y;
            newHeight = selectedElement.style.height;
          }
          if (newX + newWidth > parentElement.style.x + parentElement.style.width) {
            newWidth = parentElement.style.x + parentElement.style.width - newX;
          }
          if (newY + newHeight > parentElement.style.y + parentElement.style.height) {
            newHeight = parentElement.style.y + parentElement.style.height - newY;
          }
        }
      }
      
      // Update elements array
      const updatedElements = elements.map(el => {
        if (el.id === selectedElement.id) {
          return { ...el, style: { ...el.style, x: newX, y: newY, width: newWidth, height: newHeight } };
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
                      height: newHeight 
                    } 
                  }
                : child
            )
          };
        }
        
        return el;
      });
      
      setElements(updatedElements);
      
      // Update selected element reference
      setSelectedElement({
        ...selectedElement,
        style: { ...selectedElement.style, x: newX, y: newY, width: newWidth, height: newHeight }
      });
      
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
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
            y: adjustedY
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
        x: element.style.x,
        y: element.style.y
      }
    });
  };

  const renderElement = (element: any, isChild = false) => {
    const isHovered = hoveredContainer === element.id;
    const isContainer = element.type === "container" || element.type === "layout";
    
    let positionStyle: React.CSSProperties = {};
    
    if (isChild) {
      // Child elements are positioned relative to their container
      positionStyle = {
        position: "absolute",
        left: element.style.x,
        top: element.style.y
      };
    } else {
      // Top-level elements are positioned absolutely within the canvas
      positionStyle = {
        position: "absolute",
        left: element.style.x,
        top: element.style.y
      };
    }

    return (
      <div
        key={`${element.id}-${key}`}
        style={{
          ...positionStyle,
          width: element.style.width,
          height: element.style.height,
          animationPlayState: element.style.animationPlayState,
          animationDelay: element.style.animationDelay != null ? `${element.style.animationDelay}s` : undefined,
          animationDuration: element.style.animationDuration != null ? `${element.style.animationDuration}s` : undefined,
          backgroundColor: isContainer 
            ? isHovered ? "rgba(200, 220, 255, 0.5)" : "rgba(240, 240, 240, 0.5)" 
            : undefined,
          border: isContainer 
            ? isHovered ? "1px dashed #4080ff" : "1px dashed #aaa" 
            : undefined,
          zIndex: isDragging && selectedElement?.id === element.id ? 1000 : 1,
          transition: "background-color 0.3s, border-color 0.3s",
          overflow: isContainer ? "hidden" : "visible",
          cursor: "move",
          userSelect: "none",
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
            {element.childElements.map((child: any) => renderElement(child, true))}
          </div>
        )}
        
        {/* Resize Handles - only show for selected elements */}
        {selectedElement?.id === element.id && (
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

  return (
    <div className="flex-1 p-8 flex justify-center items-center overflow-auto">
      <Card
        ref={canvasRef}
        className="relative bg-white shadow-lg transform"
        style={{
          width: selectedSize.width,
          height: selectedSize.height,
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
          backgroundSize: `${snapToGrid(20)}px ${snapToGrid(20)}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out"
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Render only top-level elements first */}
        {elements.filter(el => !el.inContainer).map((element) => renderElement(element))}
      </Card>
    </div>
  );
};
