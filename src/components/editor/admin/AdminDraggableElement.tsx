
import React, { useState, useRef } from 'react';
import { EditorElement } from '../types';

interface AdminDraggableElementProps {
  element: EditorElement;
  isSelected: boolean;
  onClick: () => void;
  onPositionChange?: (position: { left: number; top: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
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
  const elementRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startElementPosRef = useRef({ x: 0, y: 0 });

  // Style for the element
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.style.x,
    top: element.style.y,
    width: element.style.width,
    height: element.style.height,
    backgroundColor: element.style.backgroundColor || 'transparent',
    border: isSelected ? '2px solid #3b82f6' : element.type === 'container' ? '1px dashed #aaa' : 'none',
    outline: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isSelected ? 100 : 1,
    borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: element.style.color || '#000',
    fontSize: element.style.fontSize ? `${element.style.fontSize}px` : 'inherit',
    fontWeight: element.style.fontWeight || 'normal',
    textAlign: element.style.textAlign as any || 'center',
  };
  
  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startElementPosRef.current = { 
      x: element.style.x || 0, 
      y: element.style.y || 0 
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse movement during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - startPosRef.current.x) / scale;
    const dy = (e.clientY - startPosRef.current.y) / scale;
    const newX = startElementPosRef.current.x + dx;
    const newY = startElementPosRef.current.y + dy;
    if (onPositionChange) {
      onPositionChange({ left: newX, top: newY });
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Render the element with its content
  return (
    <div
      ref={elementRef}
      style={elementStyle}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      className="admin-draggable-element"
    >
      {element.type === 'text' && (
        <div>{element.content || 'Text Element'}</div>
      )}
      
      {element.type === 'image' && (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {element.content ? (
            <img src={element.content} alt="Element" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-xs text-gray-500">Image</div>
          )}
        </div>
      )}
      
      {element.type === 'button' && (
        <div className="px-4 py-2 bg-blue-500 text-white rounded">
          {element.content || 'Button'}
        </div>
      )}
      
      {element.type === 'container' && (
        <div className="text-xs text-gray-500">Container</div>
      )}
    </div>
  );
};
