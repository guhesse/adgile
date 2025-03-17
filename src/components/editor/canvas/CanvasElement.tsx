
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";
import { ElementRenderer } from "../ElementRenderer";
import { ElementHandles } from "./ElementHandles";
import { calculateSmartPosition } from "../utils/grid/responsivePosition";
import { useCallback, useRef } from "react";

interface CanvasElementProps {
  element: EditorElement;
  canvasSize: BannerSize;
  selectedElement: EditorElement | null;
  isChild?: boolean;
  isDragging?: boolean;
  isElementOutsideContainer?: boolean;
  handleMouseDown: (e: React.MouseEvent, element: EditorElement) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
  handleContainerHover: (e: React.MouseEvent, containerId: string) => void;
  handleContainerHoverEnd: () => void;
  hoveredContainer: string | null;
  canvasNavMode: CanvasNavigationMode;
  zIndex?: number;
}

export const CanvasElement = ({
  element,
  canvasSize,
  selectedElement,
  isChild = false,
  isDragging = false,
  isElementOutsideContainer = false,
  handleMouseDown,
  handleResizeStart,
  handleContainerHover,
  handleContainerHoverEnd,
  hoveredContainer,
  canvasNavMode,
  zIndex = 1
}: CanvasElementProps) => {
  const isHovered = hoveredContainer === element.id;
  const isContainer = element.type === "container" || element.type === "layout";
  const isExiting = isElementOutsideContainer && selectedElement?.id === element.id;
  const isImage = element.type === "image" || element.type === "logo";
  const isText = element.type === "text";
  const isSelected = selectedElement?.id === element.id;
  
  // Referência para manter um ponto fixo ao arrastar
  const elementRef = useRef<HTMLDivElement>(null);

  // If the element doesn't belong to this canvas size, don't render it
  // Global elements (sizeId = 'global') should appear in all canvases
  if (element.sizeId && element.sizeId !== canvasSize.name && element.sizeId !== 'global') {
    return null;
  }

  // Determine the position for this element
  let position = { 
    x: element.style.x, 
    y: element.style.y, 
    width: element.style.width, 
    height: element.style.height 
  };
  
  // If element has percentage values and needs to be adjusted for this canvas size
  if (element.style.xPercent !== undefined && 
      element.style.yPercent !== undefined && 
      element.style.widthPercent !== undefined && 
      element.style.heightPercent !== undefined &&
      element.sizeId !== canvasSize.name) {
    
    // Find the source size (the size this element was originally created for)
    const sourceSize = {
      name: element.sizeId || 'unknown',
      width: canvasSize.width, // Fallback to current size if unknown
      height: canvasSize.height
    };
    
    // Use calculateSmartPosition to adjust to this canvas
    position = calculateSmartPosition(element, sourceSize, canvasSize);
  }

  // Apply the final position style
  let positionStyle: React.CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height
  };

  // Function to prevent default browser image dragging
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // Otimizado handler de mouse down para elementos de texto
  const handleElementMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Captura posição do mouse no início do arraste relativo ao elemento
    if (elementRef.current && isText) {
      const rect = elementRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // Guarda as informações no elemento do evento para uso no handler de drag
      (e as any).elementOffset = { x: offsetX, y: offsetY };
    }
    
    handleMouseDown(e, element);
  }, [element, handleMouseDown, isText]);

  return (
    <div
      ref={elementRef}
      style={{
        ...positionStyle,
        animationPlayState: element.style.animationPlayState,
        animationDelay: element.style.animationDelay != null ? `${element.style.animationDelay}s` : undefined,
        animationDuration: element.style.animationDuration != null ? `${element.style.animationDuration}s` : undefined,
        backgroundColor: isContainer
          ? isHovered ? "rgba(200, 220, 255, 0.5)" : "rgba(240, 240, 240, 0.5)"
          : element.style.backgroundColor,
        border: isContainer
          ? isHovered ? "1px dashed #4080ff" : "1px dashed #aaa"
          : undefined,
        zIndex: isDragging && isSelected ? 1000 : zIndex,
        transition: isExiting ? "none" : (isDragging ? "none" : "all 0.1s ease-out"),
        overflow: isContainer ? "hidden" : "visible",
        cursor: canvasNavMode === 'pan' ? 'grab' : 'move',
        userSelect: "none",
        opacity: element.style.opacity !== undefined ? element.style.opacity : 1,
        boxShadow: isSelected ? "0 0 0 2px #2563eb" : (isExiting ? "0 0 0 2px #ff4040" : undefined),
        outline: "none",
        touchAction: "none", // Prevents touch scrolling during drags
      }}
      className={`${isSelected ? "outline-2 outline-blue-600" : ""} ${element.style.animation || ""}`}
      onMouseDown={handleElementMouseDown}
      onDragStart={handleDragStart}
      draggable={false}
      data-element-id={element.id}
      data-element-type={element.type}
      data-zoom-level={1}
      data-canvas-wrapper="true"
      onMouseEnter={(e) => {
        if (isContainer) {
          handleContainerHover(e, element.id);
        }
      }}
      onMouseLeave={() => {
        if (isContainer) {
          handleContainerHoverEnd();
        }
      }}
    >
      <div 
        className="w-full h-full"
        draggable={false}
        onDragStart={handleDragStart}
      >
        <ElementRenderer element={element} />
      </div>

      {isContainer && element.childElements && (
        <div className="absolute top-0 left-0 w-full h-full" draggable={false}>
          {element.childElements.map((child: EditorElement, childIndex: number) => (
            <CanvasElement
              key={child.id}
              element={child}
              canvasSize={canvasSize}
              selectedElement={selectedElement}
              isChild={true}
              isDragging={isDragging}
              isElementOutsideContainer={isElementOutsideContainer}
              handleMouseDown={handleMouseDown}
              handleResizeStart={handleResizeStart}
              handleContainerHover={handleContainerHover}
              handleContainerHoverEnd={handleContainerHoverEnd}
              hoveredContainer={hoveredContainer}
              canvasNavMode={canvasNavMode}
              zIndex={childIndex + 1}
            />
          ))}
        </div>
      )}

      {isSelected && canvasNavMode !== 'pan' && (
        <ElementHandles 
          element={element} 
          handleResizeStart={handleResizeStart}
        />
      )}
    </div>
  );
};
