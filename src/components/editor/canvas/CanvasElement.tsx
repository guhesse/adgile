
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

  const optimalPosition = findOptimalPosition(element, canvasSize.width, canvasSize.height);
  
  const position = element.isIndividuallyPositioned 
    ? { x: element.style.x, y: element.style.y, width: element.style.width, height: element.style.height }
    : optimalPosition;

  let positionStyle: React.CSSProperties = {};

  if (isChild) {
    positionStyle = {
      position: "absolute",
      left: position.x,
      top: position.y,
      width: position.width,
      height: position.height
    };
  } else {
    positionStyle = {
      position: "absolute",
      left: position.x,
      top: position.y,
      width: position.width,
      height: position.height
    };
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
