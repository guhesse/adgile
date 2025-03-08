
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
    organizeElements
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
    
    // If already have a selected element and clicking elsewhere, clear the selection
    if (selectedElement && selectedElement.id !== element.id) {
      setSelectedElement(null);
    }
    
    setIsDragging(true);
    setSelectedElement(element);
    
    // Calculate drag offset based on whether element is in a container
    const dragOffsetX = e.clientX - element.style.x;
    const dragOffsetY = e.clientY - element.style.y;
    
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
    }, 800); // 800ms hover time to consider moving into container

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
      // Calculate new position with grid snapping
      let newX: number;
      let newY: number;
      
      // If element is in a container, calculate position relative to container
      if (selectedElement.inContainer && selectedElement.parentId) {
        const parent = elements.find(el => el.id === selectedElement.parentId);
        if (parent) {
          // Get position relative to the container
          newX = snapToGrid(Math.max(0, Math.min(e.clientX - dragStart.x, parent.style.width - selectedElement.style.width)));
          newY = snapToGrid(Math.max(0, Math.min(e.clientY - dragStart.y, parent.style.height - selectedElement.style.height)));
        } else {
          // Fallback
          newX = snapToGrid(Math.max(0, Math.min(e.clientX - dragStart.x, selectedSize.width - selectedElement.style.width)));
          newY = snapToGrid(Math.max(0, Math.min(e.clientY - dragStart.y, selectedSize.height - selectedElement.style.height)));
        }
      } else {
        // Standard positioning
        newX = snapToGrid(Math.max(0, Math.min(e.clientX - dragStart.x, selectedSize.width - selectedElement.style.width)));
        newY = snapToGrid(Math.max(0, Math.min(e.clientY - dragStart.y, selectedSize.height - selectedElement.style.height)));
      }

      // Update elements array
      const updatedElements = elements.map(el => {
        // If this is a child element being dragged
        if (el.id === selectedElement.id && !selectedElement.inContainer) {
          return { ...el, style: { ...el.style, x: newX, y: newY } };
        }
        
        // If this is the parent container of the element being dragged
        if (selectedElement.inContainer && el.id === selectedElement.parentId && el.childElements) {
          return {
            ...el,
            childElements: el.childElements.map(child => 
              child.id === selectedElement.id
                ? { ...child, style: { ...child.style, x: newX, y: newY } }
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
      
      // Update element dimensions based on container status
      const updatedElements = elements.map(el => {
        // If this element is being resized directly
        if (el.id === selectedElement.id && !selectedElement.inContainer) {
          return { 
            ...el, 
            style: { ...el.style, x: newX, y: newY, width: newWidth, height: newHeight }
          };
        }
        
        // If this is the parent container of the element being resized
        if (selectedElement.inContainer && el.id === selectedElement.parentId && el.childElements) {
          return {
            ...el,
            childElements: el.childElements.map(child => 
              child.id === selectedElement.id
                ? { ...child, style: { ...child.style, x: newX, y: newY, width: newWidth, height: newHeight } }
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
            // Reset position relative to the container
            x: 0,
            y: 0
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
        x: 0,
        y: 0
      }
    });
  };

  const renderElement = (element: any, isChild = false) => {
    const isHovered = hoveredContainer === element.id;
    
    return (
      <div
        key={`${element.id}-${key}`}
        style={{
          position: "absolute",
          left: element.style.x,
          top: element.style.y,
          width: element.style.width,
          height: element.style.height,
          animationPlayState: element.style.animationPlayState,
          animationDelay: element.style.animationDelay != null ? `${element.style.animationDelay}s` : undefined,
          animationDuration: element.style.animationDuration != null ? `${element.style.animationDuration}s` : undefined,
          backgroundColor: element.type === "container" || element.type === "layout" 
            ? isHovered ? "rgba(200, 220, 255, 0.5)" : "rgba(240, 240, 240, 0.5)" 
            : undefined,
          border: (element.type === "container" || element.type === "layout") 
            ? isHovered ? "1px dashed #4080ff" : "1px dashed #aaa" 
            : undefined,
          zIndex: isDragging && selectedElement?.id === element.id ? 1000 : 1,
          transition: "background-color 0.3s, border-color 0.3s",
        }}
        className={`cursor-move ${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation || ""}`}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onMouseEnter={(e) => {
          if (element.type === "container" || element.type === "layout") {
            handleContainerHover(e, element.id);
          }
        }}
        onMouseLeave={() => {
          if (element.type === "container" || element.type === "layout") {
            handleContainerHoverEnd();
          }
        }}
      >
        <ElementRenderer element={element} />
        
        {/* Render child elements */}
        {(element.type === "container" || element.type === "layout") && element.childElements && (
          <div className="relative w-full h-full">
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
    <div className="p-8 flex justify-center min-h-[calc(100vh-14rem)]">
      <Card
        ref={canvasRef}
        className="relative bg-white shadow-lg"
        style={{
          width: selectedSize.width,
          height: selectedSize.height,
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
          backgroundSize: `${snapToGrid(20)}px ${snapToGrid(20)}px`,
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
