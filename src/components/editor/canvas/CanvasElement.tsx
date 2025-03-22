
import React from 'react';
import { ElementHandles } from './ElementHandles';
import { ElementRenderer } from '../ElementRenderer';
import { BannerSize, CanvasNavigationMode, EditorElement } from '../types';
import { useCanvas } from '../CanvasContext';

interface CanvasElementProps {
  element: EditorElement;
  canvasSize: BannerSize;
  selectedElement: EditorElement | null;
  isDragging: boolean;
  isElementOutsideContainer: boolean;
  handleMouseDown: (e: React.MouseEvent, element: EditorElement) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
  handleContainerHover: (e: React.MouseEvent, containerId: string) => void;
  handleContainerHoverEnd: () => void;
  hoveredContainer: string | null;
  canvasNavMode: CanvasNavigationMode;
  zIndex: number;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  canvasSize,
  selectedElement,
  isDragging,
  isElementOutsideContainer,
  handleMouseDown,
  handleResizeStart,
  handleContainerHover,
  handleContainerHoverEnd,
  hoveredContainer,
  canvasNavMode,
  zIndex
}) => {
  const { updateElementContent } = useCanvas();
  
  // Handle content change from ElementRenderer
  const handleContentChange = (newContent: string) => {
    updateElementContent(newContent, element.id);
  };

  const isSelected = selectedElement?.id === element.id;
  const isHoveredContainer = hoveredContainer === element.id;

  let containerClasses = "absolute";
  if (element.inContainer) {
    containerClasses += " transition-all";
  }
  
  if (isHoveredContainer) {
    containerClasses += " bg-blue-50 border-2 border-dashed border-blue-300";
  }

  const isContainer = element.type === 'container' || element.type === 'layout';

  const handleContainerMouseOver = (e: React.MouseEvent) => {
    if (isContainer && canvasNavMode !== 'pan' && selectedElement && selectedElement.id !== element.id) {
      handleContainerHover(e, element.id);
    }
  };
  
  const elementStyle: React.CSSProperties = {
    left: `${element.style.x}px`,
    top: `${element.style.y}px`,
    width: `${element.style.width}px`,
    height: `${element.style.height}px`,
    zIndex,
    cursor: canvasNavMode === 'pan' ? 'auto' : isContainer ? 'default' : 'move',
    opacity: isSelected && isElementOutsideContainer ? 0.5 : 1
  };

  return (
    <div
      className={containerClasses}
      style={elementStyle}
      onMouseDown={(e) => handleMouseDown(e, element)}
      onMouseOver={handleContainerMouseOver}
      onMouseLeave={handleContainerHoverEnd}
      data-element-id={element.id}
      data-element-type={element.type}
    >
      <ElementRenderer 
        element={element} 
        onContentChange={handleContentChange}
      />
      
      {canvasNavMode !== 'pan' && (isSelected || isHoveredContainer) && !isDragging && (
        <ElementHandles
          element={element}
          handleResizeStart={handleResizeStart}
          isContainer={isContainer}
          isHoveredContainer={isHoveredContainer}
        />
      )}
      
      {element.childElements && element.childElements.map((childElement, index) => (
        <CanvasElement
          key={childElement.id}
          element={childElement}
          canvasSize={canvasSize}
          selectedElement={selectedElement}
          isDragging={isDragging}
          isElementOutsideContainer={isElementOutsideContainer}
          handleMouseDown={handleMouseDown}
          handleResizeStart={handleResizeStart}
          handleContainerHover={handleContainerHover}
          handleContainerHoverEnd={handleContainerHoverEnd}
          hoveredContainer={hoveredContainer}
          canvasNavMode={canvasNavMode}
          zIndex={index}
        />
      ))}
    </div>
  );
};
