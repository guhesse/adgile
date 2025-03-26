
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";
import { isValidImageUrl } from "./context/elements/imageOperations";

interface ElementRendererProps {
  element: EditorElement;
}

const renderImageElement = (element: EditorElement) => {
  const { content, style, alt } = element;
  
  // Calculate position based on objectPositionX and objectPositionY
  let objectPosition = style.objectPosition || "center";
  
  if (style.objectFit === "cover" && style.objectPositionX !== undefined && style.objectPositionY !== undefined) {
    objectPosition = `${style.objectPositionX}% ${style.objectPositionY}%`;
  }
  
  // Apply scale transform if defined and using cover object-fit
  const scale = style.objectFit === "cover" && style.objectScale ? 
    `scale(${style.objectScale / 100})` : "none";
  
  // Apply CSS filters if they exist
  let filterStyle = "";
  
  if (style.hueRotate !== undefined) {
    filterStyle += `hue-rotate(${style.hueRotate}deg) `;
  }
  
  if (style.grayscale !== undefined) {
    filterStyle += `grayscale(${style.grayscale}) `;
  }
  
  if (style.brightness !== undefined) {
    filterStyle += `brightness(${style.brightness}) `;
  }
  
  if (style.contrast !== undefined) {
    filterStyle += `contrast(${style.contrast}) `;
  }
  
  if (style.saturate !== undefined) {
    filterStyle += `saturate(${style.saturate}) `;
  }
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={content as string}
        alt={alt || ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: style.objectFit || "contain",
          objectPosition,
          transform: scale,
          filter: filterStyle || undefined,
        }}
        draggable={false}
      />
      
      {/* Color overlay layer - only render if not using filters */}
      {!filterStyle && style.overlayColor && style.overlayOpacity && style.overlayOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: style.overlayColor,
            opacity: style.overlayOpacity,
            mixBlendMode: "normal",
          }}
        />
      )}
    </div>
  );
};

export const ElementRenderer = ({ element }: ElementRendererProps) => {
  // Use the provided element style (which may already include format-specific adjustments)
  const { style } = element;

  if (element.type === "text") {
    return (
      <p style={{
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
        color: style.color,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
        textAlign: style.textAlign,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: "4px",
        boxSizing: "border-box",
        overflow: "hidden",
        wordBreak: "break-word",
        backgroundColor: style.backgroundColor,
      }}>
        {element.content}
      </p>
    );
  } 
  
  if (element.type === "button") {
    return (
      <Button style={{
        fontSize: style.fontSize,
        color: style.color,
        fontFamily: style.fontFamily,
        backgroundColor: style.backgroundColor,
        padding: style.padding,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}>
        {element.content}
      </Button>
    );
  } 
  
  if (element.type === "image") {
    const hasValidImage = element.content && isValidImageUrl(element.content as string);
    const renderImageWithLink = (imageElement: JSX.Element) => {
      if (element.link) {
        return (
          <a 
            href={element.link} 
            target={element.openInNewTab ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="w-full h-full block"
          >
            {imageElement}
          </a>
        );
      }
      return imageElement;
    };
    
    const imageElement = hasValidImage ? (
      renderImageElement(element)
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm p-2 text-center">
        {element.alt || element.content || "Imagem"}
      </div>
    );
    
    return (
      <div 
        className="w-full h-full"
        style={{
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
          borderTopLeftRadius: style.borderTopLeftRadius ? `${style.borderTopLeftRadius}px` : undefined,
          borderTopRightRadius: style.borderTopRightRadius ? `${style.borderTopRightRadius}px` : undefined,
          borderBottomLeftRadius: style.borderBottomLeftRadius ? `${style.borderBottomLeftRadius}px` : undefined,
          borderBottomRightRadius: style.borderBottomRightRadius ? `${style.borderBottomRightRadius}px` : undefined,
          borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
          borderStyle: style.borderStyle,
          borderColor: style.borderColor,
          overflow: "hidden"
        }}
      >
        {renderImageWithLink(imageElement)}
      </div>
    );
  }

  if (element.type === "container") {
    return (
      <div className="w-full h-full flex flex-col p-2 relative border border-dashed border-gray-300 rounded">
        <div className="text-xs text-gray-500 absolute top-0 left-0 bg-white px-1">
          {element.content || "Container"}
        </div>
      </div>
    );
  }

  if (element.type === "layout") {
    // Render layout with columns
    return (
      <div className="w-full h-full bg-white rounded flex relative">
        <div className="text-xs text-gray-500 absolute top-0 left-0 bg-white px-1">
          {element.content || "Layout"}
        </div>
        {element.columns && Array.from({ length: element.columns }).map((_, index) => (
          <div 
            key={index} 
            className={`h-full ${index > 0 ? "border-l border-dashed border-gray-300" : ""}`} 
            style={{ width: `${100 / element.columns!}%` }}
          >
            {/* We don't render child elements here anymore as they are handled in CanvasWorkspace */}
          </div>
        ))}
      </div>
    );
  }

  return null;
};
