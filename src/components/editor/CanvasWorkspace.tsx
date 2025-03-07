
import { useRef, useEffect } from "react";
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

  // Auto-organize elements when new ones are added
  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent, element: any) => {
    e.stopPropagation();
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds || !selectedElement) return;

    if (isDragging) {
      // Calculate new position with grid snapping
      const newX = snapToGrid(Math.max(0, Math.min(e.clientX - dragStart.x, selectedSize.width - selectedElement.style.width)));
      const newY = snapToGrid(Math.max(0, Math.min(e.clientY - dragStart.y, selectedSize.height - selectedElement.style.height)));

      // If the element is in a container, update it differently
      if (selectedElement.inContainer) {
        setElements(elements.map(el => {
          if (el.id === selectedElement.parentId && el.childElements) {
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
        }));
      } else {
        // Update standalone element
        setElements(elements.map(el =>
          el.id === selectedElement.id
            ? { ...el, style: { ...el.style, x: newX, y: newY } }
            : el
        ));
      }

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
      if (selectedElement.inContainer) {
        setElements(elements.map(el => {
          if (el.id === selectedElement.parentId && el.childElements) {
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
        }));
      } else {
        setElements(elements.map(el =>
          el.id === selectedElement.id
            ? { ...el, style: { ...el.style, x: newX, y: newY, width: newWidth, height: newHeight } }
            : el
        ));
      }
      
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
      // Re-organize elements when drag/resize finishes
      organizeElements();
    }
    
    setIsDragging(false);
    setIsResizing(false);
  };

  const renderElement = (element: any, isChild = false) => {
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
          backgroundColor: element.type === "container" || element.type === "layout" ? "rgba(240, 240, 240, 0.5)" : undefined,
          border: (element.type === "container" || element.type === "layout") ? "1px dashed #aaa" : undefined,
        }}
        className={`cursor-move ${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation || ""}`}
        onMouseDown={(e) => handleMouseDown(e, element)}
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
