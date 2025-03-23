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
        }}
        draggable={false}
      />
      
      {/* Color overlay layer */}
      {style.overlayColor && style.overlayOpacity && style.overlayOpacity > 0 && (
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
        color: element.style.color,
        fontFamily: element.style.fontFamily,
        backgroundColor: element.style.backgroundColor,
        padding: element.style.padding,
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
          backgroundColor: element.style.backgroundColor,
          borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : undefined,
          borderTopLeftRadius: element.style.borderTopLeftRadius ? `${element.style.borderTopLeftRadius}px` : undefined,
          borderTopRightRadius: element.style.borderTopRightRadius ? `${element.style.borderTopRightRadius}px` : undefined,
          borderBottomLeftRadius: element.style.borderBottomLeftRadius ? `${element.style.borderBottomLeftRadius}px` : undefined,
          borderBottomRightRadius: element.style.borderBottomRightRadius ? `${element.style.borderBottomRightRadius}px` : undefined,
          borderWidth: element.style.borderWidth ? `${element.style.borderWidth}px` : undefined,
          borderStyle: element.style.borderStyle,
          borderColor: element.style.borderColor,
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
