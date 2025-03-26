
import { EditorElement } from "../../types";
import { absoluteToPercentage, percentageToAbsolute, snapToGrid } from "./gridCore";

// Convert element positions to percentage-based values
export const convertElementToPercentage = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  const percentX = absoluteToPercentage(element.style.x, canvasWidth);
  const percentY = absoluteToPercentage(element.style.y, canvasHeight);
  const percentWidth = absoluteToPercentage(element.style.width, canvasWidth);
  const percentHeight = absoluteToPercentage(element.style.height, canvasHeight);

  return {
    ...element,
    style: {
      ...element.style,
      xPercent: percentX,
      yPercent: percentY,
      widthPercent: percentWidth,
      heightPercent: percentHeight
    }
  };
};

// Apply percentage-based positions to calculate absolute values
export const applyPercentageToElement = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  // Only apply if percentage values exist
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    // Calculate absolute values from percentages
    const x = percentageToAbsolute(element.style.xPercent, canvasWidth);
    const y = percentageToAbsolute(element.style.yPercent, canvasHeight);
    const width = percentageToAbsolute(element.style.widthPercent, canvasWidth);
    const height = percentageToAbsolute(element.style.heightPercent, canvasHeight);
    
    // For images, adjust height to maintain aspect ratio
    let adjustedHeight = height;
    if ((element.type === "image" || element.type === "logo") && element.style.originalWidth && element.style.originalHeight) {
      const aspectRatio = element.style.originalWidth / element.style.originalHeight;
      adjustedHeight = width / aspectRatio;
    }
    
    return {
      ...element,
      style: {
        ...element.style,
        x: snapToGrid(x),
        y: snapToGrid(y),
        width: snapToGrid(width),
        height: element.type === "image" || element.type === "logo" ? snapToGrid(adjustedHeight) : snapToGrid(height)
      }
    };
  }
  
  return element;
};

// Analyze element position to determine constraints
export const analyzeElementConstraints = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): { horizontalConstraint: string, verticalConstraint: string } => {
  const threshold = 20; // Pixels
  
  // Calculate distances to edges
  const leftDistance = element.style.x;
  const rightDistance = canvasWidth - (element.style.x + element.style.width);
  const topDistance = element.style.y;
  const bottomDistance = canvasHeight - (element.style.y + element.style.height);
  
  // Calculate center distances
  const xCenterOffset = Math.abs((element.style.x + element.style.width/2) - (canvasWidth/2));
  const yCenterOffset = Math.abs((element.style.y + element.style.height/2) - (canvasHeight/2));
  
  // Determine constraints
  let horizontalConstraint = "left"; // Default
  if (xCenterOffset < threshold) {
    horizontalConstraint = "center";
  } else if (rightDistance < leftDistance) {
    horizontalConstraint = "right";
  }
  
  let verticalConstraint = "top"; // Default
  if (yCenterOffset < threshold) {
    verticalConstraint = "center";
  } else if (bottomDistance < topDistance) {
    verticalConstraint = "bottom";
  }
  
  return { horizontalConstraint, verticalConstraint };
};

// Intelligent positioning: Find optimal position for an element on different canvas sizes
export const findOptimalPosition = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): { x: number, y: number, width: number, height: number } => {
  // Apply constraint-based positioning if constraints are defined
  if (element.style.constraintHorizontal && element.style.constraintVertical) {
    return applyConstraintBasedPositioning(element, canvasWidth, canvasHeight);
  }
  
  // If element has percentage values, use them
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    // Convert percentages to current artboard size
    let x = (element.style.xPercent * canvasWidth) / 100;
    let y = (element.style.yPercent * canvasHeight) / 100;
    let width = (element.style.widthPercent * canvasWidth) / 100;
    let height = (element.style.heightPercent * canvasHeight) / 100;
    
    // For images, maintain aspect ratio
    if (element.type === "image" || element.type === "logo") {
      const aspectRatio = element.style.originalWidth && element.style.originalHeight 
        ? element.style.originalWidth / element.style.originalHeight
        : element.style.width / element.style.height;
      
      height = width / aspectRatio;
    }
    
    // Check for bottom alignment
    const isBottomAligned = element.style.yPercent + element.style.heightPercent > 95;
    if (isBottomAligned) {
      y = canvasHeight - height;
    }
    
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: snapToGrid(width),
      height: snapToGrid(height)
    };
  }

  // Without percentage values, calculate relative positions
  
  // Calculate percentages using reference width
  const widthPercent = (element.style.width / 600) * 100; // Using 600 as reference width
  const width = (widthPercent * canvasWidth) / 100;
  
  // If element is text, center it horizontally
  if (element.type === "text" || element.type === "paragraph") {
    const heightPercent = (element.style.height / 600) * 100;
    const height = (heightPercent * canvasHeight) / 100;
    const x = (canvasWidth - width) / 2;
    
    return {
      x: snapToGrid(x),
      y: element.style.y,
      width: snapToGrid(width),
      height: snapToGrid(height)
    };
  }

  // If element is an image or logo, maintain aspect ratio
  if (element.type === "image" || element.type === "logo") {
    const aspectRatio = element.style.width / element.style.height;
    const height = width / aspectRatio;
    
    // Center it
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 3; // Position in upper third
    
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: snapToGrid(width),
      height: snapToGrid(height)
    };
  }

  // Default: Scale by canvas size
  const widthRatio = canvasWidth / 600; // Assuming 600 as reference width
  const heightRatio = canvasHeight / 600;
  
  return {
    x: snapToGrid(element.style.x * widthRatio),
    y: snapToGrid(element.style.y * heightRatio),
    width: snapToGrid(element.style.width * widthRatio),
    height: snapToGrid(element.style.height * heightRatio)
  };
};

// Apply positioning based on constraints 
export const applyConstraintBasedPositioning = (
  element: EditorElement,
  canvasWidth: number, 
  canvasHeight: number
): { x: number, y: number, width: number, height: number } => {
  // Default: assume we're scaling from a reference size of 600x600
  const referenceWidth = 600;
  const referenceHeight = 600;
  
  // Calculate scale ratios
  const widthRatio = canvasWidth / referenceWidth;
  const heightRatio = canvasHeight / referenceHeight;
  
  // Get original values or use current
  const originalX = element.style.x;
  const originalY = element.style.y;
  const originalWidth = element.style.width;
  const originalHeight = element.style.height;
  
  // Calculate width and height (may be scaled differently based on constraints)
  let width = originalWidth * widthRatio;
  let height = originalHeight * heightRatio;
  
  // Handle aspect ratio for images
  if ((element.type === "image" || element.type === "logo") && 
      element.style.originalWidth && element.style.originalHeight) {
    const aspectRatio = element.style.originalWidth / element.style.originalHeight;
    height = width / aspectRatio;
  }
  
  // Apply horizontal constraints
  let x = originalX * widthRatio; // Default left constraint
  
  if (element.style.constraintHorizontal === "right") {
    // Calculate distance from right edge
    const rightDistance = referenceWidth - (originalX + originalWidth);
    x = canvasWidth - width - (rightDistance * widthRatio);
  } 
  else if (element.style.constraintHorizontal === "center") {
    // Calculate center position
    const centerX = referenceWidth / 2;
    const elementCenterOffset = (originalX + originalWidth/2) - centerX;
    x = (canvasWidth / 2) + (elementCenterOffset * widthRatio) - (width / 2);
  }
  
  // Apply vertical constraints
  let y = originalY * heightRatio; // Default top constraint
  
  if (element.style.constraintVertical === "bottom") {
    // Calculate distance from bottom edge
    const bottomDistance = referenceHeight - (originalY + originalHeight);
    y = canvasHeight - height - (bottomDistance * heightRatio);
  } 
  else if (element.style.constraintVertical === "center") {
    // Calculate center position
    const centerY = referenceHeight / 2;
    const elementCenterOffset = (originalY + originalHeight/2) - centerY;
    y = (canvasHeight / 2) + (elementCenterOffset * heightRatio) - (height / 2);
  }
  
  // Ensure values are snapped to grid and within canvas bounds
  x = snapToGrid(Math.max(0, Math.min(canvasWidth - width, x)));
  y = snapToGrid(Math.max(0, Math.min(canvasHeight - height, y)));
  width = snapToGrid(width);
  height = snapToGrid(height);
  
  return { x, y, width, height };
};
