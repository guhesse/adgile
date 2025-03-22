
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";
import { isValidImageUrl } from "./context/elements/imageOperations";

interface ElementRendererProps {
  element: EditorElement;
  onContentChange?: (newContent: string) => void;
}

export const ElementRenderer = ({ element, onContentChange }: ElementRendererProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const doubleClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle click or double click for text editing
  const handleClick = () => {
    // Only enable editing for text, paragraphs, and buttons
    if (!['text', 'button'].includes(element.type)) return;
    
    if (doubleClickTimerRef.current) {
      // Double click detected
      clearTimeout(doubleClickTimerRef.current);
      doubleClickTimerRef.current = null;
      setIsEditing(true);
    } else {
      // Set timer for detecting slow double click
      doubleClickTimerRef.current = setTimeout(() => {
        doubleClickTimerRef.current = null;
      }, 300);
    }
  };
  
  // Handle content changes
  const handleTextChange = () => {
    if (editableRef.current && onContentChange) {
      onContentChange(editableRef.current.innerText);
    }
  };
  
  // Handle blur event to end editing
  const handleBlur = () => {
    setIsEditing(false);
    handleTextChange();
  };
  
  // Handle keydown events to exit editing with Enter or Escape keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
    }
    e.stopPropagation(); // Prevent keyboard shortcuts from triggering when editing
  };
  
  useEffect(() => {
    // Focus editable element when entering edit mode
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      
      // Place cursor at the end of the content
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  if (element.type === "text") {
    return (
      <div
        ref={editableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleTextChange}
        style={{
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
          outline: isEditing ? '2px solid rgba(59, 130, 246, 0.5)' : 'none',
          cursor: isEditing ? 'text' : 'default',
        }}
      >
        {element.content}
      </div>
    );
  } 
  
  if (element.type === "button") {
    if (isEditing) {
      return (
        <div
          ref={editableRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={handleTextChange}
          style={{
            fontSize: element.style.fontSize,
            color: element.style.color,
            fontFamily: element.style.fontFamily,
            backgroundColor: element.style.backgroundColor,
            padding: element.style.padding || "8px 16px",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            borderRadius: "0.375rem",
            outline: '2px solid rgba(59, 130, 246, 0.5)',
            cursor: 'text',
          }}
        >
          {element.content}
        </div>
      );
    }
    
    return (
      <Button 
        style={{
          fontSize: element.style.fontSize,
          color: element.style.color,
          fontFamily: element.style.fontFamily,
          backgroundColor: element.style.backgroundColor,
          padding: element.style.padding,
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
        }}
        onClick={handleClick}
      >
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
