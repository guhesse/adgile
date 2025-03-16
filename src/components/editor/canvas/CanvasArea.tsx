
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
  // Filtra elementos que devem aparecer neste tamanho específico ou globalmente
  const elementsToShow = elements.filter(element => 
    !element.sizeId || element.sizeId === size.name || element.sizeId === 'global'
  );

  return (
    <div className="relative">
      {/* Canvas label positioned at the top */}
      <div 
        className="absolute -top-6 left-0 right-0 text-sm text-gray-600 font-medium text-center"
      >
        {size.name} ({size.width}×{size.height})
      </div>
      
      <Card
        ref={canvasRef}
        className="relative bg-white shadow-lg"
        style={{
          width: size.width,
          height: size.height,
          backgroundColor: "white"
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
            />
          ))}
      </Card>
    </div>
  );
};
