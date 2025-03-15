
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";
import { isValidImageUrl } from "./context/elements/imageOperations";

interface ElementRendererProps {
  element: EditorElement;
}

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
        {hasValidImage ? (
          <img
            src={element.content as string}
            alt={element.alt || "Image element"}
            className="w-full h-full"
            style={{
              objectFit: element.style.objectFit || "cover",
              objectPosition: element.style.objectPosition || "center",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm p-2 text-center">
            {element.alt || (element.content as string) || "Imagem"}
          </div>
        )}
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
          />
        ))}
      </div>
    );
  }

  return null;
};
