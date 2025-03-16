
import { Card } from "@/components/ui/card";
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";
import { CanvasElement } from "./CanvasElement";

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
  return (
    <div className="relative flex flex-col items-center">
      {/* Canvas label that scales with zoom */}
      <div 
        className="text-sm text-gray-600 mb-1 font-medium"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center bottom",
          marginBottom: `${Math.max(6, 8 * zoomLevel)}px`,
          whiteSpace: "nowrap"
        }}
      >
        {size.name} ({size.width}×{size.height})
      </div>
      
      <Card
        ref={canvasRef}
        className="relative bg-white shadow-lg transform"
        style={{
          width: size.width,
          height: size.height,
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease-out"
        }}
        onMouseDown={(e) => {
          // Verificar se clicou diretamente no Card (canvas) e não em um elemento
          if (e.currentTarget === e.target) {
            handleCanvasMouseDown(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements
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
            />
          ))}
      </Card>
    </div>
  );
};
