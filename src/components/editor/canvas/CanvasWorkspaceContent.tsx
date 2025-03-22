
import { useState, useRef } from "react";
import { CanvasArea } from "./CanvasArea";
import { BannerSize, CanvasNavigationMode, EditingMode, EditorElement } from "../types";
import { CanvasControls } from "./CanvasControls";

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
  setZoomLevel: (zoomLevel: number) => void;
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
  editingMode: EditingMode;
  setEditingMode: (mode: EditingMode) => void;
}

export const CanvasWorkspaceContent = ({
  containerRef,
  canvasRef,
  canvasNavMode,
  isPanning,
  panPosition,
  activeSizes,
  shouldShowAllSizes,
  selectedSize,
  zoomLevel,
  setZoomLevel,
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
  setEditingMode
}: CanvasWorkspaceContentProps) => {
  // State to track artboard positions
  const [artboardPositions, setArtboardPositions] = useState<Record<string, { x: number, y: number }>>(() => {
    // Initialize positions for all active sizes
    const initialPositions: Record<string, { x: number, y: number }> = {};
    
    activeSizes.forEach((size, index) => {
      // Calculate default positions based on grid layout
      const rowSize = Math.ceil(Math.sqrt(activeSizes.length));
      const row = Math.floor(index / rowSize);
      const col = index % rowSize;
      
      // Add extra gap (100px) to ensure no overlapping
      const leftPosition = col * (Math.max(...activeSizes.map(s => s.width)) + 200);
      const topPosition = row * (Math.max(...activeSizes.map(s => s.height)) + 200);
      
      initialPositions[size.name] = { x: leftPosition, y: topPosition };
    });
    
    return initialPositions;
  });
  
  // State to track which artboard is being moved
  const [movingArtboard, setMovingArtboard] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Start artboard move
  const handleArtboardMoveStart = (e: React.MouseEvent, sizeName: string) => {
    e.stopPropagation();
    if (canvasNavMode === 'edit') {
      setMovingArtboard(sizeName);
      
      const currentPosition = artboardPositions[sizeName] || { x: 0, y: 0 };
      setDragOffset({
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      });
    }
  };
  
  // Handle artboard move
  const handleArtboardMove = (e: React.MouseEvent) => {
    if (movingArtboard) {
      e.stopPropagation();
      
      const newPositions = { ...artboardPositions };
      newPositions[movingArtboard] = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      setArtboardPositions(newPositions);
    }
  };
  
  // End artboard move
  const handleArtboardMoveEnd = () => {
    setMovingArtboard(null);
  };
  
  // Combine mouse handlers for both elements and artboards
  const handleWorkspaceMouseMove = (e: React.MouseEvent) => {
    if (movingArtboard) {
      handleArtboardMove(e);
    } else {
      handleMouseMove(e);
    }
  };
  
  const handleWorkspaceMouseUp = () => {
    if (movingArtboard) {
      handleArtboardMoveEnd();
    } else {
      handleMouseUp();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 p-8 overflow-hidden ${canvasNavMode === 'pan' ? 'canvas-pan-mode' : ''}`}
      style={{
        cursor: isPanning ? 'grabbing' : canvasNavMode === 'pan' ? 'grab' : 'default',
        position: 'relative',
      }}
    >
      {/* Canvas workspace with fixed size and scrollable content */}
      <div 
        className="h-full w-full overflow-auto"
        style={{
          position: 'relative',
        }}
        onMouseMove={handleWorkspaceMouseMove}
        onMouseUp={handleWorkspaceMouseUp}
        onMouseLeave={handleWorkspaceMouseUp}
      >
        {/* Infinite canvas area that can be zoomed and panned */}
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            position: 'absolute',
            left: `${panPosition.x}px`,
            top: `${panPosition.y}px`,
          }}
        >
          {/* Always show all artboards */}
          <div className="relative">
            {activeSizes.map((size, index) => {
              // Get the position for this artboard (or use default if not set)
              const position = artboardPositions[size.name] || { 
                x: index * (Math.max(...activeSizes.map(s => s.width)) + 200), 
                y: 0 
              };
              
              // Highlight the selected size
              const isSelected = size.name === selectedSize.name || selectedSize.name === 'All';
              
              return (
                <div 
                  key={`canvas-wrapper-${size.name}-${index}`}
                  style={{ 
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transition: movingArtboard === size.name ? 'none' : 'all 0.2s ease',
                    opacity: isSelected ? 1 : 0.7,
                    transform: `scale(${isSelected ? 1 : 0.95})`,
                  }}
                >
                  {/* Draggable header for artboard */}
                  <div 
                    className="absolute -top-8 left-0 right-0 text-sm font-medium p-1 rounded cursor-move flex items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                      color: isSelected ? 'rgb(37, 99, 235)' : '#666',
                      border: isSelected ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent'
                    }}
                    onMouseDown={(e) => handleArtboardMoveStart(e, size.name)}
                  >
                    {size.name} ({size.width}×{size.height})
                  </div>
                  
                  <CanvasArea
                    key={`canvas-${size.name}-${editorKey}-${index}`}
                    size={size}
                    elements={elements}
                    selectedElement={selectedElement}
                    isDragging={isDragging}
                    isElementOutsideContainer={isElementOutsideContainer}
                    zoomLevel={1} // Fixed at 1 as we're scaling the entire workspace now
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
              );
            })}
          </div>
        </div>
      </div>

      <CanvasControls 
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        editingMode={editingMode}
        setEditingMode={setEditingMode}
      />
    </div>
  );
};
