
import { CanvasArea } from "./CanvasArea";
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";
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
}: CanvasWorkspaceContentProps) => {
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
          {shouldShowAllSizes ? (
            <div className="relative">
              {activeSizes.map((size, index) => {
                // Calculate position for each artboard to avoid overlapping
                const rowSize = Math.ceil(Math.sqrt(activeSizes.length));
                const row = Math.floor(index / rowSize);
                const col = index % rowSize;
                
                // Add extra gap (100px) to ensure no overlapping
                const leftPosition = col * (Math.max(...activeSizes.map(s => s.width)) + 100);
                const topPosition = row * (Math.max(...activeSizes.map(s => s.height)) + 100);
                
                return (
                  <div 
                    key={`canvas-wrapper-${size.name}-${index}`}
                    style={{ 
                      position: 'absolute',
                      left: `${leftPosition}px`,
                      top: `${topPosition}px`,
                    }}
                  >
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
          ) : (
            <div>
              <CanvasArea
                key={`single-canvas-${editorKey}`}
                size={selectedSize}
                elements={elements}
                selectedElement={selectedElement}
                isDragging={isDragging}
                isElementOutsideContainer={isElementOutsideContainer}
                zoomLevel={1} // Fixed at 1 as we're scaling the entire workspace now
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
          )}
        </div>
      </div>

      <CanvasControls 
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
    </div>
  );
};
