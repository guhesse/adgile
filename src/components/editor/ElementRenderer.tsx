
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";

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
    const hasValidImage = element.content && typeof element.content === 'string' && element.content.length > 0;
    
    return (
      <div 
        className="w-full h-full"
        style={{
          backgroundColor: element.style.backgroundColor,
          borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : undefined,
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
            Image
          </div>
        )}
      </div>
    );
  }

  if (element.type === "container" || element.type === "layout") {
    return (
      <div className="w-full h-full border border-dashed border-gray-300 rounded flex items-center justify-center">
        <span className="text-xs text-gray-500">{element.type}</span>
      </div>
    );
  }

  // Fallback for unknown element types
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs text-gray-500">
      {element.type || "Unknown"}
    </div>
  );
};
