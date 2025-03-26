
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

// Determine if a banner size has a vertical orientation
const isVerticalOrientation = (size: BannerSize): boolean => {
  return size.height > size.width;
};

// Apply responsive transformation based on constraints and orientation
export const applyResponsiveTransformation = (
  element: EditorElement, 
  sourceSize: BannerSize, 
  targetSize: BannerSize
): EditorElement => {
  // Clone the element to avoid mutating the original
  const transformedElement = { ...element, style: { ...element.style } };
  const { style } = transformedElement;
  
  // Determine orientation of source and target
  const sourceIsVertical = isVerticalOrientation(sourceSize);
  const targetIsVertical = isVerticalOrientation(targetSize);
  
  // Check if we're transforming between different orientations
  const isOrientationChange = sourceIsVertical !== targetIsVertical;
  
  // Apply transformations based on constraints
  let horizontalConstraint = style.constraintHorizontal || "left";
  let verticalConstraint = style.constraintVertical || "top";

  const sourceWidth = sourceSize.width;
  const sourceHeight = sourceSize.height;
  const targetWidth = targetSize.width;
  const targetHeight = targetSize.height;
  
  // Calculate width and height scaling
  const widthScale = targetWidth / sourceWidth;
  const heightScale = targetHeight / sourceHeight;
  
  // For orientation changes, we need to adapt constraint strategies
  if (isOrientationChange) {
    // Apply special transformation for orientation changes
    return applyOrientationChangeTransformation(
      element, 
      sourceSize, 
      targetSize
    );
  }
  
  // Standard transformation for same orientation
  
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
  
  // Special handling for text elements to scale font size
  if (element.type === 'text' && style.fontSize) {
    // Scale font size but ensure minimum legibility
    const fontScale = Math.min(widthScale, heightScale);
    style.fontSize = Math.max(style.fontSize * fontScale, 10); // minimum 10px font size
  }
  
  // Update percentage values
  style.xPercent = (style.x / targetWidth) * 100;
  style.yPercent = (style.y / targetHeight) * 100;
  style.widthPercent = (style.width / targetWidth) * 100;
  style.heightPercent = (style.height / targetHeight) * 100;
  
  return transformedElement;
};

// Special transformation for orientation changes (vertical to horizontal or vice versa)
const applyOrientationChangeTransformation = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): EditorElement => {
  // Clone the element to avoid mutating the original
  const transformedElement = { ...element, style: { ...element.style } };
  const { style } = transformedElement;
  
  const sourceIsVertical = isVerticalOrientation(sourceSize);
  const sourceWidth = sourceSize.width;
  const sourceHeight = sourceSize.height;
  const targetWidth = targetSize.width;
  const targetHeight = targetSize.height;
  
  // Calculate the element's position in the source banner as percentages
  const xPercent = (style.x / sourceWidth) * 100;
  const yPercent = (style.y / sourceHeight) * 100;
  const widthPercent = (style.width / sourceWidth) * 100;
  const heightPercent = (style.height / sourceHeight) * 100;
  
  // For vertical to horizontal transformation:
  // - Top half elements go to left side
  // - Bottom half elements go to right side
  // For horizontal to vertical transformation:
  // - Left half elements go to top
  // - Right half elements go to bottom
  
  if (sourceIsVertical) {
    // Vertical to horizontal transformation
    
    // Determine if element is in top half or bottom half
    const isTopHalf = yPercent < 50;
    
    if (isTopHalf) {
      // Element is in top half, position to left side
      style.x = (targetWidth * 0.25) - (style.width / 2);
      // Maintain vertical position proportionally in the top half
      style.y = (yPercent / 50) * targetHeight;
    } else {
      // Element is in bottom half, position to right side
      style.x = (targetWidth * 0.75) - (style.width / 2);
      // Maintain vertical position proportionally in the bottom half
      style.y = ((yPercent - 50) / 50) * targetHeight;
    }
    
    // For text elements, adjust font size based on target dimensions
    if (element.type === 'text' && style.fontSize) {
      // Scale based on the smallest dimension ratio for legibility
      const fontScale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
      style.fontSize = Math.max(style.fontSize * fontScale * 1.2, 12); // Increase by 20% for better readability
    }
    
    // For images, adjust dimensions while maintaining aspect ratio
    if (element.type === 'image' || element.type === 'logo') {
      // Maintain aspect ratio but scale proportionally
      const aspectRatio = style.width / style.height;
      
      // Scale down width for horizontal layout
      style.width = Math.min(style.width, targetWidth * 0.4);
      style.height = style.width / aspectRatio;
    }
  } else {
    // Horizontal to vertical transformation
    
    // Determine if element is in left half or right half
    const isLeftHalf = xPercent < 50;
    
    if (isLeftHalf) {
      // Element is in left half, position to top half
      style.y = (targetHeight * 0.25) - (style.height / 2);
      // Maintain horizontal position proportionally in the left half
      style.x = (xPercent / 50) * targetWidth;
    } else {
      // Element is in right half, position to bottom half
      style.y = (targetHeight * 0.75) - (style.height / 2);
      // Maintain horizontal position proportionally in the right half
      style.x = ((xPercent - 50) / 50) * targetWidth;
    }
    
    // For text elements, adjust font size
    if (element.type === 'text' && style.fontSize) {
      // Scale based on the smallest dimension ratio for legibility
      const fontScale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
      style.fontSize = Math.max(style.fontSize * fontScale * 0.8, 10); // Reduce by 20% for vertical layout
    }
    
    // For images, adjust dimensions while maintaining aspect ratio
    if (element.type === 'image' || element.type === 'logo') {
      // Maintain aspect ratio but scale proportionally
      const aspectRatio = style.width / style.height;
      
      // Scale down width for vertical layout
      style.width = Math.min(style.width, targetWidth * 0.8);
      style.height = style.width / aspectRatio;
    }
  }
  
  // Ensure elements are not positioned outside the canvas
  style.x = Math.max(0, Math.min(style.x, targetWidth - style.width));
  style.y = Math.max(0, Math.min(style.y, targetHeight - style.height));
  
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
  const updatedElement = { ...element, style: { ...element.style } };
  
  // Only update if constraints are provided
  if (constraints.horizontal) {
    updatedElement.style.constraintHorizontal = constraints.horizontal;
  }
  
  if (constraints.vertical) {
    updatedElement.style.constraintVertical = constraints.vertical;
  }
  
  return updatedElement;
};
