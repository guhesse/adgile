
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
  const aspectRatioDifference = (targetSize.width / targetSize.height) / (sourceSize.width / sourceSize.height);
  
  // Default width/height scaling
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  let x = element.style.x * scaleX; // Default (left) aligned
  let y = element.style.y * scaleY; // Default (top) aligned
  
  // Special handling for images/logos to preserve aspect ratio
  if ((element.type === "image" || element.type === "logo") && 
      element.style.originalWidth && element.style.originalHeight) {
      
    const aspectRatio = element.style.originalWidth / element.style.originalHeight;
    
    // If the aspect ratios of the source and target are very different, adjust more intelligently
    if (Math.abs(aspectRatioDifference - 1) > 0.3) {
      // For dramatic format changes (e.g. square to wide rectangle), use minimum scale
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / aspectRatio;
    } else {
      // For similar aspect ratios, maintain relative proportions
      width = element.style.width * scaleX;
      height = width / aspectRatio;
    }
  }
  
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
  } else if (horizontalConstraint === "scale") {
    // Scale the position proportionally to the canvas
    const relativeX = element.style.x / sourceSize.width;
    x = targetSize.width * relativeX;
    
    // If element takes up most of the width, scale to match canvas
    if (element.style.width > sourceSize.width * 0.8) {
      width = targetSize.width * (element.style.width / sourceSize.width);
    }
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
    y = targetSize.height / 2 + centerOffset * scaleY - height / 2;
  } else if (verticalConstraint === "scale") {
    // Scale the position proportionally to the canvas
    const relativeY = element.style.y / sourceSize.height;
    y = targetSize.height * relativeY;
    
    // If element takes up most of the height, scale to match canvas
    if (element.style.height > sourceSize.height * 0.8) {
      height = targetSize.height * (element.style.height / sourceSize.height);
    }
  }
  
  // Font size adjustment for text elements
  let fontSize = element.style.fontSize;
  if (element.type === "text" && fontSize) {
    // Base font scaling on the closer dimension change to maintain proportion
    const fontScaleFactor = Math.min(scaleX, scaleY);
    fontSize = fontSize * fontScaleFactor;
    
    // For very small target sizes, ensure minimum readability
    fontSize = Math.max(fontSize, 9);
    
    // For very large sizes, cap font size to avoid giant text
    if (fontSize > 72) {
      fontSize = 72;
    }
    
    // Adjust width to accommodate font size changes
    if (Math.abs(fontScaleFactor - scaleX) > 0.2) {
      width = element.style.width * fontScaleFactor;
    }
  }
  
  // Snap positions to grid
  x = snapToGrid(x);
  y = snapToGrid(y);
  width = snapToGrid(width);
  height = snapToGrid(height);
  
  // Ensure element stays within canvas boundaries
  x = Math.max(0, Math.min(x, targetSize.width - width));
  y = Math.max(0, Math.min(y, targetSize.height - height));
  
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
