
import { Card } from "@/components/ui/card";
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";
import { CanvasElement } from "./CanvasElement";
import { useCanvas } from "../CanvasContext";

interface CanvasAreaProps {
  size: BannerSize;
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  isDragging: boolean;
  isElementOutsideContainer: boolean;
  zoomLevel: number;
  canvasRef?: React.RefObject<HTMLDivElement>;
  hoveredContainer: string | null;
  handleMouseDown: (e: React.MouseEvent, element: EditorElement) => void;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
  handleContainerHover: (e: React.MouseEvent, containerId: string) => void;
  handleContainerHoverEnd: () => void;
  canvasNavMode: CanvasNavigationMode;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

export const CanvasArea = ({
  size,
  elements,
  selectedElement,
  isDragging,
  isElementOutsideContainer,
  zoomLevel,
  canvasRef,
  hoveredContainer,
  handleMouseDown,
  handleCanvasMouseDown,
  handleResizeStart,
  handleContainerHover,
  handleContainerHoverEnd,
  canvasNavMode,
  handleMouseMove,
  handleMouseUp
}: CanvasAreaProps) => {
  const { artboardBackgroundColor = '#ffffff' } = useCanvas();
  
  // Use provided background color directly, no need to search for an element
  const backgroundColor = artboardBackgroundColor;

  // Filter elements that should appear in this specific size or globally
  // Sort elements by z-index (order in the array)
  const elementsToShow = elements
    .filter(element => 
      !element.sizeId || // Elements without sizeId
      element.sizeId === size.name || // Elements specific to this size
      element.sizeId === 'global' // Global elements that should appear in all sizes
    )
    // Filter out artboard-background elements as we handle them separately
    .filter(element => element.type !== 'artboard-background');

  return (
    <div className="relative">
      <Card
        ref={canvasRef}
        className="relative shadow-lg"
        style={{
          width: size.width,
          height: size.height,
          backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
          backgroundImage: backgroundColor === 'transparent' ? 
            "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)" : 
            "none",
          backgroundSize: backgroundColor === 'transparent' ? "20px 20px" : "auto",
          backgroundPosition: backgroundColor === 'transparent' ? "0 0, 10px 10px" : "auto"
        }}
        onMouseDown={(e) => {
          // Check if clicked directly on the Card (canvas) and not on an element
          if (e.currentTarget === e.target) {
            handleCanvasMouseDown(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elementsToShow
          .filter(el => !el.inContainer)
          .map((element, index) => (
            <CanvasElement
              key={`${element.id}-${index}`}
              element={element}
              canvasSize={size}
              selectedElement={selectedElement}
              isDragging={isDragging}
              isElementOutsideContainer={isElementOutsideContainer}
              handleMouseDown={handleMouseDown}
              handleResizeStart={handleResizeStart}
              handleContainerHover={handleContainerHover}
              handleContainerHoverEnd={handleContainerHoverEnd}
              hoveredContainer={hoveredContainer}
              canvasNavMode={canvasNavMode}
              zIndex={index} // Pass the index to control z-index
            />
          ))}
      </Card>
    </div>
  );
};
