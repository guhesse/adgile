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
  
  // Calculate element's position in source as percentages
  const xPercent = (style.x / sourceWidth) * 100;
  const yPercent = (style.y / sourceHeight) * 100;
  const widthPercent = (style.width / sourceWidth) * 100;
  const heightPercent = (style.height / sourceHeight) * 100;
  
  if (sourceIsVertical) {
    // Vertical to horizontal transformation
    
    // Determine quadrant in source (top-left, top-right, bottom-left, bottom-right)
    const isTopHalf = yPercent < 50;
    const isLeftHalf = xPercent < 50;
    
    // Positioning strategy based on quadrant
    if (isTopHalf) {
      // Elements in top half go to left side
      if (isLeftHalf) {
        // Top-left quadrant to left-top area
        style.x = targetWidth * 0.25 * (xPercent / 50);
        style.y = targetHeight * 0.25 * (yPercent / 50);
      } else {
        // Top-right quadrant to left-bottom area
        style.x = targetWidth * 0.25 * ((100 - xPercent) / 50);
        style.y = targetHeight * 0.25 + (targetHeight * 0.25 * ((yPercent) / 50));
      }
    } else {
      // Elements in bottom half go to right side
      if (isLeftHalf) {
        // Bottom-left quadrant to right-top area
        style.x = targetWidth * 0.5 + (targetWidth * 0.25 * (xPercent / 50));
        style.y = targetHeight * 0.25 * ((yPercent - 50) / 50);
      } else {
        // Bottom-right quadrant to right-bottom area
        style.x = targetWidth * 0.5 + (targetWidth * 0.25 * ((100 - xPercent) / 50));
        style.y = targetHeight * 0.25 + (targetHeight * 0.25 * ((yPercent - 50) / 50));
      }
    }
    
    // Scale dimensions to maintain relative proportions
    // Vertical elements generally need to be wider and shorter in horizontal layout
    const aspectRatio = style.width / style.height;
    let newWidth, newHeight;
    
    if (widthPercent > 70) {  // If element was very wide in vertical layout
      newWidth = targetWidth * 0.4;  // Make it less dominant in horizontal
    } else {
      newWidth = targetWidth * (widthPercent / 200);  // Scale proportionally but reduce
    }
    
    newHeight = newWidth / aspectRatio;
    
    // Ensure height is not too large
    if (newHeight > targetHeight * 0.7) {
      newHeight = targetHeight * 0.7;
      newWidth = newHeight * aspectRatio;
    }
    
    style.width = newWidth;
    style.height = newHeight;
    
    // Special handling for text elements
    if (element.type === 'text' && style.fontSize) {
      // Scale font size for better legibility in horizontal layout
      // Text in vertical layouts is typically larger, so reduce it for horizontal
      const baseSize = style.fontSize;
      const widthRatio = targetWidth / sourceHeight;  // Note: intentional cross-axis comparison
      style.fontSize = Math.max(baseSize * widthRatio * 0.7, 12);  // Reduce by 30% but ensure minimum 12px
    }
  } else {
    // Horizontal to vertical transformation
    
    // Determine quadrant in source
    const isTopHalf = yPercent < 50;
    const isLeftHalf = xPercent < 50;
    
    // Positioning strategy based on quadrant
    if (isLeftHalf) {
      // Elements in left half go to top portion
      if (isTopHalf) {
        // Left-top quadrant to top-left area
        style.x = targetWidth * 0.25 * (xPercent / 50);
        style.y = targetHeight * 0.25 * (yPercent / 50);
      } else {
        // Left-bottom quadrant to top-right area
        style.x = targetWidth * 0.25 + (targetWidth * 0.25 * (xPercent / 50));
        style.y = targetHeight * 0.25 * ((100 - yPercent) / 50);
      }
    } else {
      // Elements in right half go to bottom portion
      if (isTopHalf) {
        // Right-top quadrant to bottom-left area
        style.x = targetWidth * 0.25 * ((100 - xPercent) / 50);
        style.y = targetHeight * 0.5 + (targetHeight * 0.25 * (yPercent / 50));
      } else {
        // Right-bottom quadrant to bottom-right area
        style.x = targetWidth * 0.25 + (targetWidth * 0.25 * ((100 - xPercent) / 50));
        style.y = targetHeight * 0.5 + (targetHeight * 0.25 * ((100 - yPercent) / 50));
      }
    }
    
    // Scale dimensions to maintain relative proportions
    // Horizontal elements generally need to be narrower but taller in vertical layout
    const aspectRatio = style.width / style.height;
    let newWidth, newHeight;
    
    if (heightPercent > 70) {  // If element was very tall in horizontal layout
      newHeight = targetHeight * 0.4;  // Make it less dominant in vertical
    } else {
      newHeight = targetHeight * (heightPercent / 200);  // Scale proportionally but reduce
    }
    
    newWidth = newHeight * aspectRatio;
    
    // Ensure width is not too large
    if (newWidth > targetWidth * 0.9) {
      newWidth = targetWidth * 0.9;
      newHeight = newWidth / aspectRatio;
    }
    
    style.width = newWidth;
    style.height = newHeight;
    
    // Special handling for text elements
    if (element.type === 'text' && style.fontSize) {
      // Scale font size for better legibility in vertical layout
      // Text in horizontal layouts is typically smaller, so increase it for vertical
      const baseSize = style.fontSize;
      const heightRatio = targetHeight / sourceWidth;  // Note: intentional cross-axis comparison
      style.fontSize = Math.min(baseSize * heightRatio * 1.3, 24);  // Increase by 30% but cap at 24px
    }
  }
  
  // Ensure elements are within canvas boundaries
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
    horizontal: "left" | "right" | "center" | "scale", 
    vertical: "top" | "bottom" | "center" | "scale" 
  }
): EditorElement => {
  // Clone the element to avoid mutating the original
  const updatedElement = { ...element, style: { ...element.style } };
  
  // Set the constraints
  updatedElement.style.constraintHorizontal = constraints.horizontal;
  updatedElement.style.constraintVertical = constraints.vertical;
  
  return updatedElement;
};
