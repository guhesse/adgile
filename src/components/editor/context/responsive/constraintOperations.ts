
import { EditorElement, BannerSize } from "../../types";

/**
 * Analyze element position to detect constraints automatically
 * @param element The element to analyze
 * @param size The banner size context
 * @returns Object with detected horizontal and vertical constraints
 */
export const detectElementConstraints = (
  element: EditorElement,
  size: BannerSize
): { horizontalConstraint: "left" | "right" | "center" | "scale"; 
     verticalConstraint: "top" | "bottom" | "center" | "scale"; } => {
  const { x, y, width, height } = element.style;
  
  // Calculate distances to edges
  const leftDist = x;
  const rightDist = size.width - (x + width);
  const topDist = y;
  const bottomDist = size.height - (y + height);
  
  // Calculate centers
  const centerX = Math.abs((x + width / 2) - size.width / 2);
  const centerY = Math.abs((y + height / 2) - size.height / 2);
  
  // Horizontal constraint detection
  let horizontalConstraint: "left" | "right" | "center" | "scale";
  
  if (centerX < 10 || (leftDist > 0 && rightDist > 0 && Math.abs(leftDist - rightDist) < 5)) {
    horizontalConstraint = "center";
  } else if (leftDist <= rightDist && leftDist < 20) {
    horizontalConstraint = "left";
  } else if (rightDist < leftDist && rightDist < 20) {
    horizontalConstraint = "right";
  } else {
    // If no clear constraint is detected, assume scaling
    horizontalConstraint = "scale";
  }
  
  // Vertical constraint detection
  let verticalConstraint: "top" | "bottom" | "center" | "scale";
  
  if (centerY < 10 || (topDist > 0 && bottomDist > 0 && Math.abs(topDist - bottomDist) < 5)) {
    verticalConstraint = "center";
  } else if (topDist <= bottomDist && topDist < 20) {
    verticalConstraint = "top";
  } else if (bottomDist < topDist && bottomDist < 20) {
    verticalConstraint = "bottom";
  } else {
    // If no clear constraint is detected, assume scaling
    verticalConstraint = "scale";
  }
  
  return { horizontalConstraint, verticalConstraint };
};

/**
 * Apply responsive transformation to an element when resizing
 * @param element The element to transform
 * @param sourceSize The original banner size
 * @param targetSize The target banner size
 * @returns New position and size values
 */
export const applyResponsiveTransformation = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } => {
  const { constraintHorizontal, constraintVertical } = element.style;
  const { xPercent, yPercent, widthPercent, heightPercent } = element.style;
  
  // If we have all percentage values, use them for precise calculations
  if (xPercent !== undefined && yPercent !== undefined &&
      widthPercent !== undefined && heightPercent !== undefined) {
    return {
      x: (xPercent / 100) * targetSize.width,
      y: (yPercent / 100) * targetSize.height,
      width: (widthPercent / 100) * targetSize.width,
      height: (heightPercent / 100) * targetSize.height
    };
  }
  
  // Default values if constraints aren't specified
  const horizontalConstraint = constraintHorizontal || "scale";
  const verticalConstraint = constraintVertical || "scale";
  
  // Get original values
  const { x, y, width, height } = element.style;
  
  // Calculate scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Calculate new values based on constraints
  let newX, newY, newWidth, newHeight;
  
  // Apply horizontal constraints
  switch (horizontalConstraint) {
    case "left":
      newX = x * scaleX;
      newWidth = width * scaleX;
      break;
    case "right":
      newX = targetSize.width - (sourceSize.width - x) * scaleX;
      newWidth = width * scaleX;
      break;
    case "center":
      const centerX = x + width / 2;
      const centerXRatio = centerX / sourceSize.width;
      newX = centerXRatio * targetSize.width - (width * scaleX) / 2;
      newWidth = width * scaleX;
      break;
    case "scale":
    default:
      newX = x * scaleX;
      newWidth = width * scaleX;
      break;
  }
  
  // Apply vertical constraints
  switch (verticalConstraint) {
    case "top":
      newY = y * scaleY;
      newHeight = height * scaleY;
      break;
    case "bottom":
      newY = targetSize.height - (sourceSize.height - y) * scaleY;
      newHeight = height * scaleY;
      break;
    case "center":
      const centerY = y + height / 2;
      const centerYRatio = centerY / sourceSize.height;
      newY = centerYRatio * targetSize.height - (height * scaleY) / 2;
      newHeight = height * scaleY;
      break;
    case "scale":
    default:
      newY = y * scaleY;
      newHeight = height * scaleY;
      break;
  }
  
  return { x: newX, y: newY, width: newWidth, height: newHeight };
};

/**
 * Set constraint properties for an element
 * @param element The element to modify
 * @param constraints The constraints to apply
 * @returns The modified element
 */
export const setElementConstraints = (
  element: EditorElement,
  constraints: {
    horizontal: "left" | "right" | "center" | "scale";
    vertical: "top" | "bottom" | "center" | "scale";
  }
): EditorElement => {
  return {
    ...element,
    style: {
      ...element.style,
      constraintHorizontal: constraints.horizontal,
      constraintVertical: constraints.vertical
    }
  };
};
