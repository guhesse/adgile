
import React, { useState, useRef, useEffect } from "react";
import { EditorElement } from "../types";
import { ElementRenderer } from "../ElementRenderer";

interface AdminDraggableElementProps {
  element: EditorElement;
  isSelected: boolean;
  onClick: () => void;
  onPositionChange: (position: { left: number; top: number }) => void;
  onResize: (size: { width: number; height: number }) => void;
  scale: number;
}

export const AdminDraggableElement: React.FC<AdminDraggableElementProps> = ({
  element,
  isSelected,
  onClick,
  onPositionChange,
  onResize,
  scale
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementStartPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Element style including position, size, and other properties
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.style.x}px`,
    top: `${element.style.y}px`,
    width: `${element.style.width}px`,
    height: `${element.style.height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isSelected ? 100 : element.style.zIndex || 0,
    boxSizing: 'border-box',
    userSelect: 'none'
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!elementRef.current) return;
    
    onClick();
    setIsDragging(true);
    
    const rect = elementRef.current.getBoundingClientRect();
    dragStartRef.current = { 
      x: e.clientX, 
      y: e.clientY 
    };
    
    elementStartPosRef.current = {
      x: element.style.x,
      y: element.style.y,
      width: element.style.width,
      height: element.style.height
    };
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    dragStartRef.current = { 
      x: e.clientX, 
      y: e.clientY 
    };
    
    elementStartPosRef.current = {
      x: element.style.x,
      y: element.style.y,
      width: element.style.width,
      height: element.style.height
    };
  };

  // Effect for global mouse move and up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.x) / scale;
        const dy = (e.clientY - dragStartRef.current.y) / scale;
        
        onPositionChange({
          left: elementStartPosRef.current.x + dx,
          top: elementStartPosRef.current.y + dy
        });
      } else if (isResizing) {
        const dx = (e.clientX - dragStartRef.current.x) / scale;
        const dy = (e.clientY - dragStartRef.current.y) / scale;
        
        let newWidth = elementStartPosRef.current.width;
        let newHeight = elementStartPosRef.current.height;
        
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(20, elementStartPosRef.current.width + dx);
        } else if (resizeDirection.includes('w')) {
          const widthDiff = elementStartPosRef.current.width - Math.max(20, elementStartPosRef.current.width - dx);
          if (widthDiff !== 0) {
            onPositionChange({
              left: elementStartPosRef.current.x + widthDiff,
              top: elementStartPosRef.current.y
            });
            newWidth = elementStartPosRef.current.width - widthDiff;
          }
        }
        
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(20, elementStartPosRef.current.height + dy);
        } else if (resizeDirection.includes('n')) {
          const heightDiff = elementStartPosRef.current.height - Math.max(20, elementStartPosRef.current.height - dy);
          if (heightDiff !== 0) {
            onPositionChange({
              left: elementStartPosRef.current.x,
              top: elementStartPosRef.current.y + heightDiff
            });
            newHeight = elementStartPosRef.current.height - heightDiff;
          }
        }
        
        onResize({
          width: newWidth,
          height: newHeight
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, onPositionChange, onResize, resizeDirection, scale]);

  // Resize handles for selected elements
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
    const handles = [
      { position: 'nw', cursor: 'nwse-resize', top: '-5px', left: '-5px' },
      { position: 'n', cursor: 'ns-resize', top: '-5px', left: 'calc(50% - 5px)' },
      { position: 'ne', cursor: 'nesw-resize', top: '-5px', right: '-5px' },
      { position: 'e', cursor: 'ew-resize', top: 'calc(50% - 5px)', right: '-5px' },
      { position: 'se', cursor: 'nwse-resize', bottom: '-5px', right: '-5px' },
      { position: 's', cursor: 'ns-resize', bottom: '-5px', left: 'calc(50% - 5px)' },
      { position: 'sw', cursor: 'nesw-resize', bottom: '-5px', left: '-5px' },
      { position: 'w', cursor: 'ew-resize', top: 'calc(50% - 5px)', left: '-5px' }
    ];
    
    return handles.map((handle) => (
      <div
        key={handle.position}
        onMouseDown={(e) => handleResizeStart(e, handle.position)}
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          border: '1px solid #3b82f6',
          cursor: handle.cursor,
          ...handle
        }}
      />
    ));
  };

  return (
    <div
      ref={elementRef}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className={`admin-draggable-element ${isSelected ? 'selected-element' : ''}`}
    >
      <ElementRenderer element={element} preview={false} isSelected={isSelected} />
      {renderResizeHandles()}
      {isSelected && (
        <div 
          className="absolute -top-5 left-0 right-0 text-xs text-center bg-blue-100 text-blue-800 px-1 rounded"
          style={{ zIndex: 101 }}
        >
          {element.type}
        </div>
      )}
    </div>
  );
};
