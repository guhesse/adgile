import { EditorElement, BannerSize } from '../../types';

// Type for constraint detection results
interface ConstraintDetectionResult {
  horizontalConstraint: "left" | "right" | "center" | "scale";
  verticalConstraint: "top" | "bottom" | "center" | "scale";
}

// Function to detect an element's constraints based on its position
export const detectElementConstraints = (element: EditorElement): ConstraintDetectionResult => {
  const { style } = element;
  
  // Default constraints
  const result: ConstraintDetectionResult = {
    horizontalConstraint: "left",
    verticalConstraint: "top"
  };
  
  // Define thresholds for constraint detection
  const EDGE_THRESHOLD = 20; // pixels from edge
  const CENTER_THRESHOLD = 30; // pixels from center
  
  // Detect horizontal constraint
  if (style.xPercent !== undefined && style.xPercent > 0) {
    // If element's left edge is close to the left edge of the artboard
    if (style.x < EDGE_THRESHOLD) {
      result.horizontalConstraint = "left";
    }
    // If element's right edge is close to the right edge of the artboard
    else if (style.xPercent > 85) {
      result.horizontalConstraint = "right";
    }
    // If element is roughly centered horizontally
    else if (Math.abs(style.xPercent - 50) < CENTER_THRESHOLD) {
      result.horizontalConstraint = "center";
    }
    // If element takes up a large portion of the width
    else if (style.widthPercent && style.widthPercent > 80) {
      result.horizontalConstraint = "scale";
    }
  }
  
  // Detect vertical constraint
  if (style.yPercent !== undefined && style.yPercent > 0) {
    // If element's top edge is close to the top edge of the artboard
    if (style.y < EDGE_THRESHOLD) {
      result.verticalConstraint = "top";
    }
    // If element's bottom edge is close to the bottom edge of the artboard
    else if (style.yPercent > 85) {
      result.verticalConstraint = "bottom";
    }
    // If element is roughly centered vertically
    else if (Math.abs(style.yPercent - 50) < CENTER_THRESHOLD) {
      result.verticalConstraint = "center";
    }
    // If element takes up a large portion of the height
    else if (style.heightPercent && style.heightPercent > 80) {
      result.verticalConstraint = "scale";
    }
  }
  
  return result;
};

// Apply responsive transformation based on constraints
export const applyResponsiveTransformation = (
  element: EditorElement, 
  sourceSize: BannerSize, 
  targetSize: BannerSize
): EditorElement => {
  // Clone the element to avoid mutating the original
  const transformedElement = { ...element };
  const { style } = transformedElement;
  
  // Apply transformations based on constraints
  const horizontalConstraint = style.constraintHorizontal || "left";
  const verticalConstraint = style.constraintVertical || "top";
  
  const sourceWidth = sourceSize.width;
  const sourceHeight = sourceSize.height;
  const targetWidth = targetSize.width;
  const targetHeight = targetSize.height;
  
  // Calculate width and height scaling
  const widthScale = targetWidth / sourceWidth;
  const heightScale = targetHeight / sourceHeight;
  
  // Calculate new dimensions
  if (horizontalConstraint === "scale") {
    style.width = style.width * widthScale;
  }
  
  if (verticalConstraint === "scale") {
    style.height = style.height * heightScale;
  }
  
  // Calculate new position based on constraints
  switch (horizontalConstraint) {
    case "left":
      style.x = style.x * widthScale;
      break;
    case "right":
      style.x = targetWidth - (sourceWidth - style.x) * widthScale;
      break;
    case "center":
      style.x = (targetWidth / 2) + ((style.x - (sourceWidth / 2)) * widthScale);
      break;
    case "scale":
      // For scale, we keep the same percentage position
      style.x = (style.x / sourceWidth) * targetWidth;
      break;
  }
  
  switch (verticalConstraint) {
    case "top":
      style.y = style.y * heightScale;
      break;
    case "bottom":
      style.y = targetHeight - (sourceHeight - style.y) * heightScale;
      break;
    case "center":
      style.y = (targetHeight / 2) + ((style.y - (sourceHeight / 2)) * heightScale);
      break;
    case "scale":
      // For scale, we keep the same percentage position
      style.y = (style.y / sourceHeight) * targetHeight;
      break;
  }
  
  // Update percentage values
  style.xPercent = (style.x / targetWidth) * 100;
  style.yPercent = (style.y / targetHeight) * 100;
  style.widthPercent = (style.width / targetWidth) * 100;
  style.heightPercent = (style.height / targetHeight) * 100;
  
  return transformedElement;
};

// Explicitly set constraints for an element
export const setElementConstraints = (
  element: EditorElement, 
  constraints: { 
    horizontal?: "left" | "right" | "center" | "scale", 
    vertical?: "top" | "bottom" | "center" | "scale" 
  }
): EditorElement => {
  // Clone the element to avoid mutating the original
  const updatedElement = { ...element };
  
  // Only update if constraints are provided
  if (constraints.horizontal) {
    updatedElement.style = {
      ...updatedElement.style,
      constraintHorizontal: constraints.horizontal
    };
  }
  
  if (constraints.vertical) {
    updatedElement.style = {
      ...updatedElement.style,
      constraintVertical: constraints.vertical
    };
  }
  
  return updatedElement;
};
