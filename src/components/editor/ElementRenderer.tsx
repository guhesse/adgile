
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
  
  // Verificar se temos informações de tamanho original
  const hasOriginalSize = element._originalSize !== undefined;
  
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
      
      {/* Debug indicator for original size */}
      {process.env.NODE_ENV === 'development' && hasOriginalSize && (
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1">
          {element._originalSize?.width}x{element._originalSize?.height}
        </div>
      )}
    </div>
  );
};

export const ElementRenderer = ({ element }: ElementRendererProps) => {
  // Verificar se a orientação original do elemento é diferente da atual
  const isFromDifferentOrientation = element._originalSize && (
    (element._originalSize.width > element._originalSize.height && element.style.height > element.style.width) ||
    (element._originalSize.height > element._originalSize.width && element.style.width > element.style.height)
  );
  
  if (element.type === "text") {
    return (
      <p style={{
        fontSize: element.style.fontSize,
        fontWeight: element.style.fontWeight,
        fontStyle: element.style.fontStyle,
        textDecoration: element.style.textDecoration,
        color: element.style.color,
        fontFamily: element.style.fontFamily,
        lineHeight: element.style.lineHeight,
        letterSpacing: element.style.letterSpacing ? `${element.style.letterSpacing}px` : undefined,
        textAlign: element.style.textAlign,
        width: "100%",
        height: "100%",
        margin: 0,
        padding: "4px",
        boxSizing: "border-box",
        overflow: "hidden",
        wordBreak: "break-word",
        backgroundColor: element.style.backgroundColor,
      }}>
        {element.content}
      </p>
    );
  } 
  
  if (element.type === "button") {
    return (
      <Button style={{
        fontSize: element.style.fontSize,
        fontWeight: element.style.fontWeight,
        fontFamily: element.style.fontFamily,
        backgroundColor: element.style.backgroundColor,
        color: element.style.color,
        width: "100%",
        height: "100%",
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {element.content}
      </Button>
    );
  }
  
  if (element.type === "image" || element.type === "logo") {
    return renderImageElement(element);
  }

  if (element.type === "container" || element.type === "layout") {
    return (
      <div 
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: element.style.backgroundColor || "transparent",
          overflow: "hidden",
          position: "relative"
        }}
      >
        {/* Container elements could have child elements */}
      </div>
    );
  }
  
  // Default renderer for other element types
  return (
    <div className="w-full h-full flex items-center justify-center">
      {typeof element.content === "string" ? element.content : "Element"}
    </div>
  );
};
