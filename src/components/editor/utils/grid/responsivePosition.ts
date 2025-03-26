
import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "./gridCore";

/**
 * Calculate position based on percentage values for responsive sizing
 */
export function calculatePercentagePosition(
  element: EditorElement, 
  canvasSize: BannerSize
): { x: number; y: number; width: number; height: number } {
  // Return original values if no percentage values are available
  if (
    element.style.xPercent === undefined ||
    element.style.yPercent === undefined ||
    element.style.widthPercent === undefined ||
    element.style.heightPercent === undefined
  ) {
    return {
      x: element.style.x,
      y: element.style.y,
      width: element.style.width,
      height: element.style.height,
    };
  }

  // Calculate new position based on the percentages and current canvas size
  const x = (element.style.xPercent / 100) * canvasSize.width;
  const y = (element.style.yPercent / 100) * canvasSize.height;
  const width = (element.style.widthPercent / 100) * canvasSize.width;
  const height = (element.style.heightPercent / 100) * canvasSize.height;

  // Snap all values to the grid
  return {
    x: snapToGrid(x),
    y: snapToGrid(y),
    width: snapToGrid(width),
    height: snapToGrid(height),
  };
}

/**
 * Apply constraint-based positioning
 */
export function calculateConstraintPosition(
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } {
  // Default scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Default linear scaling
  let x = element.style.x * scaleX;
  let y = element.style.y * scaleY;
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // Determine current constraints
  const horizontalConstraint = element.style.constraintHorizontal || "left";
  const verticalConstraint = element.style.constraintVertical || "top";
  
  // Apply horizontal constraint
  if (horizontalConstraint === "right") {
    // Distance from right edge in the source
    const rightDistance = sourceSize.width - (element.style.x + element.style.width);
    // Maintain same distance in the target
    x = targetSize.width - width - rightDistance * scaleX;
  } else if (horizontalConstraint === "center") {
    // Distance from center in the source
    const centerOffset = element.style.x - (sourceSize.width / 2) + (element.style.width / 2);
    // Maintain same relative center position in the target
    x = (targetSize.width / 2) - (width / 2) + centerOffset * scaleX;
  } else if (horizontalConstraint === "scale") {
    // Scale position based on relative position in the canvas
    const relativeX = element.style.x / sourceSize.width;
    x = relativeX * targetSize.width;
  }
  
  // Apply vertical constraint
  if (verticalConstraint === "bottom") {
    // Distance from bottom edge in the source
    const bottomDistance = sourceSize.height - (element.style.y + element.style.height);
    // Maintain same distance in the target
    y = targetSize.height - height - bottomDistance * scaleY;
  } else if (verticalConstraint === "center") {
    // Distance from center in the source
    const centerOffset = element.style.y - (sourceSize.height / 2) + (element.style.height / 2);
    // Maintain same relative center position in the target
    y = (targetSize.height / 2) - (height / 2) + centerOffset * scaleY;
  } else if (verticalConstraint === "scale") {
    // Scale position based on relative position in the canvas
    const relativeY = element.style.y / sourceSize.height;
    y = relativeY * targetSize.height;
  }
  
  // Special handling for images to maintain aspect ratio
  if ((element.type === "image" || element.type === "logo") && 
      (element.style.originalWidth && element.style.originalHeight)) {
    
    const originalAspectRatio = element.style.originalWidth / element.style.originalHeight;
    // Preserve aspect ratio
    if (horizontalConstraint === "scale" && verticalConstraint !== "scale") {
      // Width scales with canvas, adjust height to maintain ratio
      height = width / originalAspectRatio;
    } else if (horizontalConstraint !== "scale" && verticalConstraint === "scale") {
      // Height scales with canvas, adjust width to maintain ratio
      width = height * originalAspectRatio;
    }
  }
  
  // Font size adjustment for text
  if (element.type === "text" && element.style.fontSize) {
    // Adjust font size based on scale but ensure minimum readability
    const fontScale = Math.min(scaleX, scaleY);
    const fontSize = Math.max(element.style.fontSize * fontScale, 9);
    
    // Adjust width to accommodate font size changes if needed
    if (Math.abs(fontScale - scaleX) > 0.2) {
      width = Math.max(width, element.style.width * fontScale);
    }
  }
  
  // Snap to grid
  return {
    x: snapToGrid(x),
    y: snapToGrid(y),
    width: snapToGrid(width),
    height: snapToGrid(height),
  };
}

/**
 * Calculate smart position for an element based on constraints and percentages
 */
export function calculateSmartPosition(
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } {
  // If the element has constraints, use constraint-based positioning
  if (element.style.constraintHorizontal || element.style.constraintVertical) {
    return calculateConstraintPosition(element, sourceSize, targetSize);
  }
  
  // If the element has percentage values, use percentage-based positioning
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    return calculatePercentagePosition(element, targetSize);
  }
  
  // Apply transformation matrix as a fallback
  return applyTransformationMatrix(element, sourceSize, targetSize);
}

/**
 * Create transformation matrix for responsive elements
 */
export function applyTransformationMatrix(
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } {
  // Get constraints if available
  const horizontalConstraint = element.style.constraintHorizontal || 'left';
  const verticalConstraint = element.style.constraintVertical || 'top';
  
  // Calculate basic scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Initial linear scaling
  let x = element.style.x * scaleX;
  let y = element.style.y * scaleY;
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // Apply horizontal constraint
  if (horizontalConstraint === 'right') {
    const distanceFromRight = sourceSize.width - (element.style.x + element.style.width);
    x = targetSize.width - width - (distanceFromRight * scaleX);
  } else if (horizontalConstraint === 'center') {
    const sourceCenter = sourceSize.width / 2;
    const targetCenter = targetSize.width / 2;
    const distanceFromCenter = (element.style.x + element.style.width / 2) - sourceCenter;
    x = targetCenter + (distanceFromCenter * scaleX) - (width / 2);
  } else if (horizontalConstraint === 'scale') {
    const relativeX = element.style.x / sourceSize.width;
    x = targetSize.width * relativeX;
  }
  
  // Apply vertical constraint
  if (verticalConstraint === 'bottom') {
    const distanceFromBottom = sourceSize.height - (element.style.y + element.style.height);
    y = targetSize.height - height - (distanceFromBottom * scaleY);
  } else if (verticalConstraint === 'center') {
    const sourceCenter = sourceSize.height / 2;
    const targetCenter = targetSize.height / 2;
    const distanceFromCenter = (element.style.y + element.style.height / 2) - sourceCenter;
    y = targetCenter + (distanceFromCenter * scaleY) - (height / 2);
  } else if (verticalConstraint === 'scale') {
    const relativeY = element.style.y / sourceSize.height;
    y = targetSize.height * relativeY;
  }
  
  // Special handling for aspect ratio preservation
  const aspectRatioDifference = (targetSize.width / targetSize.height) / (sourceSize.width / sourceSize.height);
  
  // Handle extreme aspect ratio differences (e.g., switching between portrait and landscape)
  if (Math.abs(aspectRatioDifference - 1) > 0.3) {
    if ((element.type === 'image' || element.type === 'logo') && element.style.width && element.style.height) {
      // Preserve original aspect ratio for images
      const aspectRatio = element.style.width / element.style.height;
      const minScale = Math.min(scaleX, scaleY);
      
      // Adjust dimensions based on constraints
      if (horizontalConstraint === 'scale' && verticalConstraint !== 'scale') {
        // Width scales with canvas, adjust height to preserve ratio
        height = width / aspectRatio;
      } else if (horizontalConstraint !== 'scale' && verticalConstraint === 'scale') {
        // Height scales with canvas, adjust width to preserve ratio
        width = height * aspectRatio;
      } else if (horizontalConstraint !== 'scale' && verticalConstraint !== 'scale') {
        // Both dimensions are anchored, but we still want to preserve aspect ratio
        width = element.style.width * minScale;
        height = width / aspectRatio;
      }
    } else if (element.type === 'text' && element.style.fontSize) {
      // For text, adjust the font size based on the minimum scale factor
      const minScale = Math.min(scaleX, scaleY);
      // Adjust width to maintain readable text
      width = element.style.width * minScale;
    }
  }
  
  return {
    x: snapToGrid(x),
    y: snapToGrid(y),
    width: snapToGrid(width),
    height: snapToGrid(height)
  };
}

/**
 * Analyze an element's position to automatically detect constraints
 */
export function analyzeElementPosition(
  element: EditorElement,
  canvasSize: BannerSize
): { 
  horizontalConstraint: "left" | "right" | "center" | "scale";
  verticalConstraint: "top" | "bottom" | "center" | "scale";
} {
  const { x, y, width, height } = element.style;
  
  // Calculate distances from edges and center
  const distanceFromLeft = x;
  const distanceFromRight = canvasSize.width - (x + width);
  const distanceFromTop = y;
  const distanceFromBottom = canvasSize.height - (y + height);
  
  // Calculate center distances
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const distanceFromCenterX = Math.abs(centerX - canvasSize.width / 2);
  const distanceFromCenterY = Math.abs(centerY - canvasSize.height / 2);
  
  // Calculate relative positions
  const relativeX = x / canvasSize.width;
  const relativeY = y / canvasSize.height;
  const relativeWidth = width / canvasSize.width;
  const relativeHeight = height / canvasSize.height;
  
  // Threshold distance as percentage of canvas size
  const thresholdX = canvasSize.width * 0.1; // 10% of canvas width
  const thresholdY = canvasSize.height * 0.1; // 10% of canvas height
  const centerThresholdX = canvasSize.width * 0.05; // 5% of canvas width
  const centerThresholdY = canvasSize.height * 0.05; // 5% of canvas height
  
  // Determine horizontal constraint
  let horizontalConstraint: "left" | "right" | "center" | "scale" = "left"; // Default
  
  // Check if element takes up most of the width (scale)
  if (relativeWidth > 0.8) {
    horizontalConstraint = "scale";
  }
  // Check if centered horizontally
  else if (distanceFromCenterX < centerThresholdX) {
    horizontalConstraint = "center";
  }
  // Check if closer to right edge
  else if (distanceFromRight < thresholdX && distanceFromRight < distanceFromLeft) {
    horizontalConstraint = "right";
  }
  // Check if proportionally positioned (e.g., at 25%, 33%, 50%, 66%, 75%)
  else if (
    Math.abs(relativeX - 0.25) < 0.02 ||
    Math.abs(relativeX - 0.33) < 0.02 ||
    Math.abs(relativeX - 0.5) < 0.02 ||
    Math.abs(relativeX - 0.66) < 0.02 ||
    Math.abs(relativeX - 0.75) < 0.02
  ) {
    horizontalConstraint = "scale";
  }
  
  // Determine vertical constraint
  let verticalConstraint: "top" | "bottom" | "center" | "scale" = "top"; // Default
  
  // Check if element takes up most of the height (scale)
  if (relativeHeight > 0.8) {
    verticalConstraint = "scale";
  }
  // Check if centered vertically
  else if (distanceFromCenterY < centerThresholdY) {
    verticalConstraint = "center";
  }
  // Check if closer to bottom
  else if (distanceFromBottom < thresholdY && distanceFromBottom < distanceFromTop) {
    verticalConstraint = "bottom";
  }
  // Check if proportionally positioned
  else if (
    Math.abs(relativeY - 0.25) < 0.02 ||
    Math.abs(relativeY - 0.33) < 0.02 ||
    Math.abs(relativeY - 0.5) < 0.02 ||
    Math.abs(relativeY - 0.66) < 0.02 ||
    Math.abs(relativeY - 0.75) < 0.02
  ) {
    verticalConstraint = "scale";
  }
  
  // Special cases for specific element types
  if (element.type === "image" || element.type === "logo") {
    // Large images that span most of the width/height often need to scale
    if (relativeWidth > 0.7) horizontalConstraint = "scale";
    if (relativeHeight > 0.7) verticalConstraint = "scale";
  } else if (element.type === "text") {
    // Text elements near edges often need to stay anchored
    if (distanceFromLeft < thresholdX) horizontalConstraint = "left";
    if (distanceFromRight < thresholdX) horizontalConstraint = "right";
    if (distanceFromTop < thresholdY) verticalConstraint = "top";
    if (distanceFromBottom < thresholdY) verticalConstraint = "bottom";
  }
  
  return {
    horizontalConstraint,
    verticalConstraint
  };
}
