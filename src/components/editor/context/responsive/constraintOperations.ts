
import { EditorElement, BannerSize } from "../../types";
import { analyzeElementPosition } from "../../utils/grid/responsivePosition";
import { snapToGrid } from "../../utils/grid/gridCore";

/**
 * Detects and analyzes constraints for an element
 */
export const detectElementConstraints = (
  element: EditorElement
): { horizontalConstraint: "left" | "right" | "center" | "scale"; verticalConstraint: "top" | "bottom" | "center" | "scale" } => {
  // Create a default banner size if we don't have one
  const canvasSize: BannerSize = { 
    name: element.sizeId || 'default', 
    width: 600, // Default width
    height: 800  // Default height
  };
  
  return analyzeElementPosition(element, canvasSize);
};

/**
 * Sets explicit constraints for an element
 */
export const setElementConstraints = (
  element: EditorElement,
  constraints: { 
    horizontal?: "left" | "right" | "center" | "scale"; 
    vertical?: "top" | "bottom" | "center" | "scale" 
  }
): EditorElement => {
  return {
    ...element,
    style: {
      ...element.style,
      constraintHorizontal: constraints.horizontal || element.style.constraintHorizontal,
      constraintVertical: constraints.vertical || element.style.constraintVertical
    }
  };
};

/**
 * Applies responsive transformation to an element based on its constraints
 */
export const applyResponsiveTransformation = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): EditorElement => {
  // Get constraints (use existing ones or detect new ones)
  const horizontalConstraint = element.style.constraintHorizontal || 
    analyzeElementPosition(element, sourceSize).horizontalConstraint;
    
  const verticalConstraint = element.style.constraintVertical || 
    analyzeElementPosition(element, sourceSize).verticalConstraint;
  
  // Calculate scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Default width/height scaling
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // Special handling for images to preserve aspect ratio
  if ((element.type === "image" || element.type === "logo") && 
      element.style.originalWidth && element.style.originalHeight) {
    const aspectRatio = element.style.originalWidth / element.style.originalHeight;
    const minScale = Math.min(scaleX, scaleY);
    
    // Adjust by aspect ratio
    width = element.style.width * minScale;
    height = width / aspectRatio;
  }
  
  // Position calculation based on constraints
  let x = element.style.x * scaleX; // Default (left) aligned
  let y = element.style.y * scaleY; // Default (top) aligned
  
  // Apply horizontal constraint
  if (horizontalConstraint === "right") {
    // Calculate distance from right edge in source
    const rightEdgeDistance = sourceSize.width - (element.style.x + element.style.width);
    // Apply same distance in target
    x = targetSize.width - rightEdgeDistance * scaleX - width;
  } else if (horizontalConstraint === "center") {
    // Calculate offset from center in source
    const centerOffset = element.style.x + element.style.width / 2 - sourceSize.width / 2;
    // Apply scaled offset in target
    x = targetSize.width / 2 + centerOffset * scaleX - width / 2;
  }
  
  // Apply vertical constraint
  if (verticalConstraint === "bottom") {
    // Calculate distance from bottom edge in source
    const bottomEdgeDistance = sourceSize.height - (element.style.y + element.style.height);
    // Apply same distance in target
    y = targetSize.height - bottomEdgeDistance * scaleY - height;
  } else if (verticalConstraint === "center") {
    // Calculate offset from center in source
    const centerOffset = element.style.y + element.style.height / 2 - sourceSize.height / 2;
    // Apply scaled offset in target
    x = targetSize.width / 2 + centerOffset * scaleX - width / 2;
  }
  
  // Snap positions to grid
  x = snapToGrid(x);
  y = snapToGrid(y);
  width = snapToGrid(width);
  height = snapToGrid(height);
  
  // Scale font size while ensuring minimum legibility
  let fontSize = element.style.fontSize;
  if (element.type === "text" && fontSize) {
    const minScale = Math.min(scaleX, scaleY);
    fontSize = fontSize * minScale;
    fontSize = Math.max(fontSize, 9); // Ensure minimum legible size
  }
  
  // Return element with transformed properties
  return {
    ...element,
    style: {
      ...element.style,
      x,
      y,
      width,
      height,
      fontSize,
      // Store percentage values
      xPercent: (x / targetSize.width) * 100,
      yPercent: (y / targetSize.height) * 100,
      widthPercent: (width / targetSize.width) * 100,
      heightPercent: (height / targetSize.height) * 100,
      // Maintain constraints
      constraintHorizontal: horizontalConstraint,
      constraintVertical: verticalConstraint
    }
  };
};
