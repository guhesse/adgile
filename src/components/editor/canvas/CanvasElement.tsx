
import { BannerSize, CanvasNavigationMode, EditorElement } from "../types";
import { ElementRenderer } from "../ElementRenderer";
import { ElementHandles } from "./ElementHandles";
import { useCallback, useRef, useMemo } from "react";

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
  
  // Determine state for styling
  const isHovered = hoveredContainer === element.id;
  const isContainer = element.type === "container" || element.type === "layout";
  const isExiting = isElementOutsideContainer && selectedElement?.id === element.id;
  const isImage = element.type === "image" || element.type === "logo";
  const isText = element.type === "text";
  const isSelected = selectedElement?.id === element.id;
  
  // Reference to maintain a fixed point when dragging
  const elementRef = useRef<HTMLDivElement>(null);

  // If the element doesn't belong to this canvas size, don't render it
  // Global elements (sizeId = 'global') should appear in all canvases
  if (element.sizeId && element.sizeId !== canvasSize.name && element.sizeId !== 'global') {
    return null;
  }

  // Get format-specific styles if they exist
  const formatSpecificStyle = useMemo(() => {
    // Check if the element has format-specific styles for this canvas size
    if (element.formatSpecificStyles && element.formatSpecificStyles[canvasSize.name]) {
      return element.formatSpecificStyles[canvasSize.name];
    }
    return {};
  }, [element.formatSpecificStyles, canvasSize.name]);

  // Combine base style with format-specific style, giving priority to format-specific
  const combinedStyle = useMemo(() => {
    return {
      ...element.style,
      ...formatSpecificStyle
    };
  }, [element.style, formatSpecificStyle]);

  // Handle object-fit and object-position for images
  const imageSpecificStyle = useMemo(() => {
    if (isImage) {
      const { objectFit, objectPositionX, objectPositionY } = combinedStyle;
      
      if (objectFit === 'cover' && (objectPositionX !== undefined || objectPositionY !== undefined)) {
        const x = objectPositionX !== undefined ? objectPositionX : 50;
        const y = objectPositionY !== undefined ? objectPositionY : 50;
        
        return {
          objectFit,
          objectPosition: `${x}% ${y}%`
        };
      }
      
      return { objectFit };
    }
    
    return {};
  }, [
    isImage, 
    combinedStyle.objectFit, 
    combinedStyle.objectPositionX, 
    combinedStyle.objectPositionY
  ]);

  // Apply the final position style
  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: combinedStyle.x,
    top: combinedStyle.y,
    width: combinedStyle.width,
    height: combinedStyle.height,
    ...imageSpecificStyle
  };

  // Function to prevent default browser image dragging
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  // Optimized mouse down handler for text elements
  const handleElementMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Capture mouse position at the beginning of the drag relative to the element
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // Store information in the event object for use in the drag handler
      (e as any).elementOffset = { x: offsetX, y: offsetY };
    }
    
    handleMouseDown(e, element);
  }, [element, handleMouseDown]);

  // Determine the final styles for rendering
  const rendererProps = {
    ...element,
    style: combinedStyle, // Use the combined style for rendering
  };

  return (
    <div
      ref={elementRef}
      style={{
        ...positionStyle,
        animationPlayState: combinedStyle.animationPlayState,
        animationDelay: combinedStyle.animationDelay != null ? `${combinedStyle.animationDelay}s` : undefined,
        animationDuration: combinedStyle.animationDuration != null ? `${combinedStyle.animationDuration}s` : undefined,
        backgroundColor: isContainer
          ? isHovered ? "rgba(200, 220, 255, 0.5)" : "rgba(240, 240, 240, 0.5)"
          : combinedStyle.backgroundColor,
        border: isContainer
          ? isHovered ? "1px dashed #4080ff" : "1px dashed #aaa"
          : undefined,
        zIndex: isDragging && isSelected ? 1000 : zIndex,
        transition: isExiting ? "none" : (isDragging ? "none" : "all 0.1s ease-out"),
        overflow: isContainer ? "hidden" : "visible",
        cursor: canvasNavMode === 'pan' ? 'grab' : 'move',
        userSelect: "none",
        opacity: combinedStyle.opacity !== undefined ? combinedStyle.opacity : 1,
        boxShadow: isSelected ? "0 0 0 2px #2563eb" : (isExiting ? "0 0 0 2px #ff4040" : undefined),
        outline: "none",
        touchAction: "none", // Prevents touch scrolling during drags
      }}
      className={`${isSelected ? "outline-2 outline-blue-600" : ""} ${combinedStyle.animation || ""}`}
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
        <ElementRenderer element={rendererProps} />
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
          element={{
            ...element,
            style: combinedStyle, // Use combined styles for handles too
          }} 
          handleResizeStart={handleResizeStart}
        />
      )}
    </div>
  );
};
