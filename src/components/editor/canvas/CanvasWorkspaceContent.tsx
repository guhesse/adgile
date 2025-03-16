
import React from "react";
import { CanvasArea } from "./CanvasArea";
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";

interface CanvasWorkspaceContentProps {
  containerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasNavMode: CanvasNavigationMode;
  isPanning: boolean;
  panPosition: { x: number; y: number };
  activeSizes: BannerSize[];
  shouldShowAllSizes: boolean;
  selectedSize: BannerSize;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  isDragging: boolean;
  isResizing: boolean;
  isElementOutsideContainer: boolean;
  hoveredContainer: string | null;
  handleMouseDown: (e: React.MouseEvent, element: EditorElement) => void;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
  handleContainerHover: (e: React.MouseEvent, containerId: string) => void;
  handleContainerHoverEnd: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  editorKey: string;
  editingMode: 'global' | 'individual';
  setEditingMode: (mode: 'global' | 'individual') => void;
}

export const CanvasWorkspaceContent: React.FC<CanvasWorkspaceContentProps> = ({
  containerRef,
  canvasRef,
  canvasNavMode,
  isPanning,
  panPosition,
  activeSizes,
  shouldShowAllSizes,
  selectedSize,
  zoomLevel,
  elements,
  selectedElement,
  isDragging,
  isResizing,
  isElementOutsideContainer,
  hoveredContainer,
  handleMouseDown,
  handleCanvasMouseDown,
  handleResizeStart,
  handleContainerHover,
  handleContainerHoverEnd,
  handleMouseMove,
  handleMouseUp,
  editorKey,
  editingMode,
  setEditingMode,
}) => {
  // Calculate spaces between artboards
  const calculateArtboardSpacing = () => {
    // Base gap between artboards (px)
    const baseGap = 100;
    
    // Calculate total width needed
    let maxHeight = 0;
    let currentX = 0;
    let currentY = 0;
    let rowMaxHeight = 0;
    const positions: {size: BannerSize, x: number, y: number}[] = [];
    
    // Sort by height for better arrangement
    const sortedSizes = [...activeSizes].sort((a, b) => b.height - a.height);
    
    // Maximum width to start a new row
    const maxWidth = 2000;
    
    // Position each artboard
    sortedSizes.forEach((size) => {
      // Check if we need to start a new row
      if (currentX + size.width > maxWidth) {
        currentX = 0;
        currentY += rowMaxHeight + baseGap;
        rowMaxHeight = 0;
      }
      
      positions.push({
        size,
        x: currentX,
        y: currentY
      });
      
      // Update position for next artboard
      currentX += size.width + baseGap;
      rowMaxHeight = Math.max(rowMaxHeight, size.height);
      maxHeight = Math.max(maxHeight, currentY + size.height);
    });
    
    return { positions, maxHeight: maxHeight + baseGap };
  };
  
  const { positions, maxHeight } = calculateArtboardSpacing();
  
  // If showing a single canvas (not "All")
  if (!shouldShowAllSizes) {
    return (
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-neutral-800 flex items-center justify-center relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor: canvasNavMode === "pan" ? (isPanning ? "grabbing" : "grab") : "default",
        }}
      >
        <div
          className="transform-gpu transition-transform duration-100"
          style={{
            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
            transformOrigin: "center center",
          }}
        >
          <CanvasArea
            size={selectedSize}
            elements={elements}
            selectedElement={selectedElement}
            isDragging={isDragging}
            isElementOutsideContainer={isElementOutsideContainer}
            zoomLevel={zoomLevel}
            canvasRef={canvasRef}
            hoveredContainer={hoveredContainer}
            handleMouseDown={handleMouseDown}
            handleCanvasMouseDown={handleCanvasMouseDown}
            handleResizeStart={handleResizeStart}
            handleContainerHover={handleContainerHover}
            handleContainerHoverEnd={handleContainerHoverEnd}
            canvasNavMode={canvasNavMode}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
          />
        </div>
      </div>
    );
  }

  // For "All" view with multiple canvases
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-neutral-800 relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: canvasNavMode === "pan" ? (isPanning ? "grabbing" : "grab") : "default",
      }}
    >
      <div
        className="transform-gpu min-h-full"
        style={{
          transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
          transformOrigin: "0 0",
          width: 2000,
          height: maxHeight,
        }}
      >
        {/* Position each canvas based on the calculated layout */}
        {positions.map(({ size, x, y }) => (
          <div 
            key={`${size.name}-${editorKey}`} 
            className="absolute"
            style={{ 
              left: x, 
              top: y,
            }}
          >
            <CanvasArea
              size={size}
              elements={elements}
              selectedElement={selectedElement}
              isDragging={isDragging}
              isElementOutsideContainer={isElementOutsideContainer}
              zoomLevel={zoomLevel}
              hoveredContainer={hoveredContainer}
              handleMouseDown={handleMouseDown}
              handleCanvasMouseDown={handleCanvasMouseDown}
              handleResizeStart={handleResizeStart}
              handleContainerHover={handleContainerHover}
              handleContainerHoverEnd={handleContainerHoverEnd}
              canvasNavMode={canvasNavMode}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
