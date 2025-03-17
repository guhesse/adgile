
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";
import { ElementRenderer } from "../ElementRenderer";
import { ElementHandles } from "./ElementHandles";
import { findOptimalPosition } from "../utils/grid/positionUtils";

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
  zIndex?: number; // Added zIndex prop
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
  zIndex = 1 // Default zIndex
}: CanvasElementProps) => {
  const isHovered = hoveredContainer === element.id;
  const isContainer = element.type === "container" || element.type === "layout";
  const isExiting = isElementOutsideContainer && selectedElement?.id === element.id;
  const isImage = element.type === "image" || element.type === "logo";

  // Choose the appropriate position calculation method
  let position;
  
  // If the element is individually positioned or has specific coordinates, use those
  if (element.isIndividuallyPositioned || (element.style.x !== undefined && element.style.y !== undefined)) {
    position = { 
      x: element.style.x, 
      y: element.style.y, 
      width: element.style.width, 
      height: element.style.height 
    };
  }
  // Use percentage-based positioning if available
  else if (element.style.xPercent !== undefined && element.style.yPercent !== undefined) {
    position = {
      x: (element.style.xPercent * canvasSize.width) / 100,
      y: (element.style.yPercent * canvasSize.height) / 100,
      width: (element.style.widthPercent! * canvasSize.width) / 100,
      height: (element.style.heightPercent! * canvasSize.height) / 100
    };
  }
  // As a last resort, use smart positioning logic
  else {
    position = findOptimalPosition(element, canvasSize.width, canvasSize.height);
  }

  // Apply the final position style
  let positionStyle: React.CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height
  };

  // If this element doesn't belong to this canvas size, don't render it
  // Global elements (sizeId = 'global') should appear in all canvases
  if (element.sizeId && element.sizeId !== canvasSize.name && element.sizeId !== 'global') {
    return null;
  }

  // Function to prevent default browser image dragging
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div
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
        zIndex: isDragging && selectedElement?.id === element.id ? 1000 : zIndex,
        transition: isExiting ? "none" : "background-color 0.3s, border-color 0.3s",
        overflow: isContainer ? "hidden" : "visible",
        cursor: canvasNavMode === 'pan' ? 'grab' : 'move',
        userSelect: "none",
        opacity: element.style.opacity !== undefined ? element.style.opacity : 1,
        boxShadow: isExiting ? "0 0 0 2px #ff4040" : undefined
      }}
      className={`${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation || ""}`}
      onMouseDown={(e) => handleMouseDown(e, element)}
      onDragStart={handleDragStart}
      draggable={false}
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
              zIndex={childIndex + 1} // Ensure child elements have higher z-index
            />
          ))}
        </div>
      )}

      {selectedElement?.id === element.id && canvasNavMode !== 'pan' && (
        <ElementHandles 
          element={element} 
          handleResizeStart={handleResizeStart}
        />
      )}
    </div>
  );
};
