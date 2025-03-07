
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { ElementRenderer } from "./ElementRenderer";
import { useCanvas } from "./CanvasContext";

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
    setElements
  } = useCanvas();
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, element: any) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedElement(element);
    setDragStart({
      x: e.clientX - element.style.x,
      y: e.clientY - element.style.y,
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
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, selectedSize.width - selectedElement.style.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, selectedSize.height - selectedElement.style.height));

      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, style: { ...el.style, x: newX, y: newY } }
          : el
      ));
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = selectedElement.style.width;
      let newHeight = selectedElement.style.height;
      let newX = selectedElement.style.x;
      let newY = selectedElement.style.y;
      
      // Handle different resize directions
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, selectedElement.style.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        const possibleWidth = Math.max(50, selectedElement.style.width - deltaX);
        newX = selectedElement.style.x + (selectedElement.style.width - possibleWidth);
        newWidth = possibleWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(20, selectedElement.style.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        const possibleHeight = Math.max(20, selectedElement.style.height - deltaY);
        newY = selectedElement.style.y + (selectedElement.style.height - possibleHeight);
        newHeight = possibleHeight;
      }
      
      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, style: { ...el.style, x: newX, y: newY, width: newWidth, height: newHeight } }
          : el
      ));
      
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div className="p-8 flex justify-center min-h-[calc(100vh-14rem)]">
      <Card
        ref={canvasRef}
        className="relative bg-white shadow-lg"
        style={{
          width: selectedSize.width,
          height: selectedSize.height,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((element) => (
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
            }}
            className={`cursor-move ${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation}`}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <ElementRenderer element={element} />
            
            {/* Resize Handles */}
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
        ))}
      </Card>
    </div>
  );
};
