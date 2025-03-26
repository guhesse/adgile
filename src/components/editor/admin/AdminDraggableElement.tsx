
import React, { useState } from "react";
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
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0
  });

  // Element style for positioning and dimensions
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.style.x}px`,
    top: `${element.style.y}px`,
    width: `${element.style.width}px`,
    height: `${element.style.height}px`,
    border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
    zIndex: isSelected ? 10 : 1,
    boxSizing: 'border-box',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only primary mouse button (left click)
    if (e.button !== 0) return;
    
    onClick();
    setIsDragging(true);
    setInitialMousePos({
      x: e.clientX,
      y: e.clientY
    });
    setInitialElementState({
      left: element.style.x,
      top: element.style.y,
      width: element.style.width,
      height: element.style.height
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Start resizing
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    
    // Only primary mouse button (left click)
    if (e.button !== 0) return;
    
    onClick();
    setIsResizing(true);
    setResizeDirection(direction);
    setInitialMousePos({
      x: e.clientX,
      y: e.clientY
    });
    setInitialElementState({
      left: element.style.x,
      top: element.style.y,
      width: element.style.width,
      height: element.style.height
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle both dragging and resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Calculate the delta between current mouse position and initial position
      const deltaX = (e.clientX - initialMousePos.x) / scale;
      const deltaY = (e.clientY - initialMousePos.y) / scale;
      
      // Apply the delta to the element's position
      onPositionChange({
        left: initialElementState.left + deltaX,
        top: initialElementState.top + deltaY
      });
    }
    
    if (isResizing) {
      // Calculate the delta between current mouse position and initial position
      const deltaX = (e.clientX - initialMousePos.x) / scale;
      const deltaY = (e.clientY - initialMousePos.y) / scale;
      
      // Apply the delta based on the resize direction
      let newWidth = initialElementState.width;
      let newHeight = initialElementState.height;
      
      if (resizeDirection.includes('e')) {
        newWidth = initialElementState.width + deltaX;
      }
      if (resizeDirection.includes('w')) {
        newWidth = initialElementState.width - deltaX;
        onPositionChange({
          left: initialElementState.left + deltaX,
          top: initialElementState.top
        });
      }
      if (resizeDirection.includes('s')) {
        newHeight = initialElementState.height + deltaY;
      }
      if (resizeDirection.includes('n')) {
        newHeight = initialElementState.height - deltaY;
        onPositionChange({
          left: initialElementState.left,
          top: initialElementState.top + deltaY
        });
      }
      
      // Ensure minimum dimensions (10x10 pixels)
      newWidth = Math.max(10, newWidth);
      newHeight = Math.max(10, newHeight);
      
      onResize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  // Stop dragging/resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Resize handles for the corners and edges
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
    const handles = [
      { position: 'nw', style: { top: '-4px', left: '-4px', cursor: 'nwse-resize' } },
      { position: 'n', style: { top: '-4px', left: 'calc(50% - 4px)', cursor: 'ns-resize' } },
      { position: 'ne', style: { top: '-4px', right: '-4px', cursor: 'nesw-resize' } },
      { position: 'e', style: { top: 'calc(50% - 4px)', right: '-4px', cursor: 'ew-resize' } },
      { position: 'se', style: { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' } },
      { position: 's', style: { bottom: '-4px', left: 'calc(50% - 4px)', cursor: 'ns-resize' } },
      { position: 'sw', style: { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' } },
      { position: 'w', style: { top: 'calc(50% - 4px)', left: '-4px', cursor: 'ew-resize' } }
    ];
    
    return handles.map(handle => (
      <div
        key={handle.position}
        className="absolute w-2 h-2 bg-blue-500 z-20"
        style={handle.style as React.CSSProperties}
        onMouseDown={(e) => handleResizeMouseDown(e, handle.position)}
      />
    ));
  };

  return (
    <div
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <ElementRenderer element={element} />
      {renderResizeHandles()}
    </div>
  );
};
