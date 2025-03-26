
import { EditorElement, BannerSize } from "../../types";
import { toast } from "sonner";
import { analyzeElementPosition } from "../../utils/grid/responsivePosition";

/**
 * Detects the most appropriate constraints for an element based on its position
 * relative to the artboard
 */
export const detectElementConstraints = (element: EditorElement): { 
  horizontalConstraint: "left" | "right" | "center" | "scale",
  verticalConstraint: "top" | "bottom" | "center" | "scale"
} => {
  // Default constraints
  let horizontalConstraint: "left" | "right" | "center" | "scale" = "left";
  let verticalConstraint: "top" | "bottom" | "center" | "scale" = "top";
  
  // If element already has constraints defined, use those
  if (element.style.constraintHorizontal) {
    horizontalConstraint = element.style.constraintHorizontal as "left" | "right" | "center" | "scale";
  }
  
  if (element.style.constraintVertical) {
    verticalConstraint = element.style.constraintVertical as "top" | "bottom" | "center" | "scale";
  }
  
  return { horizontalConstraint, verticalConstraint };
};

/**
 * Applies a responsive transformation to an element when moving between different
 * artboard sizes, using constraints to determine the appropriate positioning
 */
export const applyResponsiveTransformation = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): EditorElement => {
  // Get constraints (use existing or detect new ones)
  const { horizontalConstraint, verticalConstraint } = element.style.constraintHorizontal && element.style.constraintVertical 
    ? { 
        horizontalConstraint: element.style.constraintHorizontal as "left" | "right" | "center" | "scale", 
        verticalConstraint: element.style.constraintVertical as "top" | "bottom" | "center" | "scale" 
      } 
    : analyzeElementPosition(element, sourceSize);
  
  // Calculate scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Start with default position
  let x = element.style.x;
  let y = element.style.y;
  let width = element.style.width;
  let height = element.style.height;
  
  // Apply horizontal constraint
  switch (horizontalConstraint) {
    case "left":
      x = element.style.x * scaleX;
      width = element.style.width * scaleX;
      break;
    case "right":
      const rightDistance = sourceSize.width - (element.style.x + element.style.width);
      x = targetSize.width - rightDistance * scaleX - element.style.width * scaleX;
      width = element.style.width * scaleX;
      break;
    case "center":
      const centerOffsetX = element.style.x + element.style.width / 2 - sourceSize.width / 2;
      x = targetSize.width / 2 + centerOffsetX * scaleX - element.style.width * scaleX / 2;
      width = element.style.width * scaleX;
      break;
    case "scale":
      x = element.style.x * scaleX;
      width = element.style.width * scaleX;
      break;
  }
  
  // Apply vertical constraint
  switch (verticalConstraint) {
    case "top":
      y = element.style.y * scaleY;
      height = element.style.height * scaleY;
      break;
    case "bottom":
      const bottomDistance = sourceSize.height - (element.style.y + element.style.height);
      y = targetSize.height - bottomDistance * scaleY - element.style.height * scaleY;
      height = element.style.height * scaleY;
      break;
    case "center":
      const centerOffsetY = element.style.y + element.style.height / 2 - sourceSize.height / 2;
      y = targetSize.height / 2 + centerOffsetY * scaleY - element.style.height * scaleY / 2;
      height = element.style.height * scaleY;
      break;
    case "scale":
      y = element.style.y * scaleY;
      height = element.style.height * scaleY;
      break;
  }
  
  // Special handling for images to maintain aspect ratio
  if (element.type === 'image' || element.type === 'logo') {
    // Use the smaller scale factor for both dimensions to avoid distortion
    const minScale = Math.min(scaleX, scaleY);
    
    // For bottom-aligned elements, especially images, ensure they stay aligned
    if (verticalConstraint === 'bottom') {
      const newHeight = element.style.height * minScale;
      y = targetSize.height - bottomDistance * scaleY - newHeight;
      height = newHeight;
    }
    
    // For images with original dimensions, preserve the aspect ratio
    if (element.style.originalWidth && element.style.originalHeight) {
      const aspectRatio = element.style.originalWidth / element.style.originalHeight;
      // Adjust height based on the new width and aspect ratio
      height = width / aspectRatio;
    }
  }
  
  // Special handling for text to ensure it stays legible
  if (element.type === 'text' && element.style.fontSize) {
    // Scale font size based on the smaller of width/height ratio
    const minScale = Math.min(scaleX, scaleY);
    const newFontSize = element.style.fontSize * minScale;
    
    // Set minimum font size to ensure legibility
    const minLegibleSize = 8; // pixels
    const fontSize = Math.max(newFontSize, minLegibleSize);
    
    // Create transformed element with updated font size
    return {
      ...element,
      style: {
        ...element.style,
        x,
        y,
        width,
        height,
        fontSize,
        constraintHorizontal: horizontalConstraint,
        constraintVertical: verticalConstraint,
        // Calculate percentage values
        xPercent: (x / targetSize.width) * 100,
        yPercent: (y / targetSize.height) * 100,
        widthPercent: (width / targetSize.width) * 100,
        heightPercent: (height / targetSize.height) * 100
      }
    };
  }
  
  // Create transformed element
  const transformedElement: EditorElement = {
    ...element,
    style: {
      ...element.style,
      x,
      y,
      width,
      height,
      constraintHorizontal: horizontalConstraint,
      constraintVertical: verticalConstraint,
      // Calculate percentage values
      xPercent: (x / targetSize.width) * 100,
      yPercent: (y / targetSize.height) * 100,
      widthPercent: (width / targetSize.width) * 100,
      heightPercent: (height / targetSize.height) * 100
    }
  };
  
  return transformedElement;
};

/**
 * Sets specific constraints for an element, which will control how
 * it responds to artboard size changes
 */
export const setElementConstraints = (
  element: EditorElement,
  constraints: { 
    horizontal?: "left" | "right" | "center" | "scale", 
    vertical?: "top" | "bottom" | "center" | "scale" 
  }
): EditorElement => {
  if (!element) return element;
  
  const updatedElement = {
    ...element,
    style: {
      ...element.style,
      constraintHorizontal: constraints.horizontal || element.style.constraintHorizontal,
      constraintVertical: constraints.vertical || element.style.constraintVertical
    }
  };
  
  toast.success('Element constraints updated');
  return updatedElement;
};
