
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
      }}>
        {element.content}
      </Button>
    );
  } 
  
  if (element.type === "image") {
    return (
      <img
        src={element.content || "/placeholder.svg"}
        alt="Banner element"
        className="w-full h-full object-cover"
      />
    );
  }

  if (element.type === "layout") {
    // Render layout with columns
    return (
      <div className="w-full h-full bg-white rounded border border-dashed border-gray-300 flex">
        {element.columns && Array.from({ length: element.columns }).map((_, index) => (
          <div 
            key={index} 
            className={`h-full ${index > 0 ? "border-l border-dashed border-gray-300" : ""}`} 
            style={{ width: `${100 / element.columns!}%` }}
          >
            {/* If we have child elements for this layout, render them */}
            {element.childElements?.map((child, childIndex) => {
              const columnIndex = childIndex % element.columns!;
              if (columnIndex === index) {
                return (
                  <div
                    key={child.id}
                    className="relative p-2"
                    style={{
                      height: "100%",
                    }}
                  >
                    <ElementRenderer element={child} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
    );
  }

  return null;
};
