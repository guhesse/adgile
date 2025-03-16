
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
  canvasNavMode
}: CanvasElementProps) => {
  const isHovered = hoveredContainer === element.id;
  const isContainer = element.type === "container" || element.type === "layout";
  const isExiting = isElementOutsideContainer && selectedElement?.id === element.id;

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

  // Ensure the element stays within canvas boundaries
  const constrainedPosition = {
    x: Math.max(0, Math.min(position.x, canvasSize.width - Math.min(position.width, 20))),
    y: Math.max(0, Math.min(position.y, canvasSize.height - Math.min(position.height, 20))),
    width: Math.min(position.width, canvasSize.width),
    height: Math.min(position.height, canvasSize.height)
  };

  // Apply the final position style
  let positionStyle: React.CSSProperties = {
    position: "absolute",
    left: constrainedPosition.x,
    top: constrainedPosition.y,
    width: constrainedPosition.width,
    height: constrainedPosition.height
  };

  // If this element doesn't belong to this canvas size, don't render it
  if (element.sizeId && element.sizeId !== canvasSize.name) {
    return null;
  }

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
        zIndex: isDragging && selectedElement?.id === element.id ? 1000 : 1,
        transition: isExiting ? "none" : "background-color 0.3s, border-color 0.3s",
        overflow: isContainer ? "hidden" : "visible",
        cursor: canvasNavMode === 'pan' ? 'grab' : 'move',
        userSelect: "none",
        opacity: isExiting ? 0.6 : 1,
        boxShadow: isExiting ? "0 0 0 2px #ff4040" : undefined
      }}
      className={`${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation || ""}`}
      onMouseDown={(e) => handleMouseDown(e, element)}
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
      <ElementRenderer element={element} />

      {isContainer && element.childElements && (
        <div className="absolute top-0 left-0 w-full h-full">
          {element.childElements.map((child: EditorElement) => (
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
