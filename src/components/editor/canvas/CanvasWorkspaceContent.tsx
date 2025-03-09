
import { CanvasArea } from "./CanvasArea";
import { CanvasControls } from "./CanvasControls";
import { BannerSize, CanvasNavigationMode, EditingMode, EditorElement } from "../types";

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
  key: string;
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
  key,
  editingMode,
  setEditingMode
}: CanvasWorkspaceContentProps) => {
  return (
    <div
      ref={containerRef}
      className={`flex-1 p-8 flex justify-center items-center overflow-hidden ${canvasNavMode === 'pan' ? 'canvas-pan-mode' : ''}`}
      style={{
        cursor: isPanning ? 'grabbing' : canvasNavMode === 'pan' ? 'grab' : 'default',
      }}
    >
      <div
        style={{
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          alignItems: 'center',
        }}
      >
        {shouldShowAllSizes ? (
          activeSizes.map((size, index) => (
            <CanvasArea
              key={`canvas-${size.name}`}
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
              key={`${key}-${index}`}
            />
          ))
        ) : (
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
            key={key}
          />
        )}
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
