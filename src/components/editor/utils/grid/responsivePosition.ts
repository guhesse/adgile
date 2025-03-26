
import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "./gridCore";

/**
 * Analyzes an element's position and determines the most appropriate constraints
 * to apply for responsive adaptation
 */
export const analyzeElementPosition = (
  element: EditorElement,
  canvasSize: BannerSize
): { horizontalConstraint: "left" | "right" | "center" | "scale", verticalConstraint: "top" | "bottom" | "center" | "scale" } => {
  const threshold = 20; // Threshold in pixels for constraint detection
  
  // Calculate distances to edges
  const leftDistance = element.style.x;
  const rightDistance = canvasSize.width - (element.style.x + element.style.width);
  const topDistance = element.style.y;
  const bottomDistance = canvasSize.height - (element.style.y + element.style.height);
  
  // Calculate center distances
  const centerXDistance = Math.abs((element.style.x + element.style.width / 2) - (canvasSize.width / 2));
  const centerYDistance = Math.abs((element.style.y + element.style.height / 2) - (canvasSize.height / 2));
  
  // Determine horizontal constraint
  let horizontalConstraint: "left" | "right" | "center" | "scale" = "left"; // Default
  if (centerXDistance < threshold) {
    horizontalConstraint = "center";
  } else if (rightDistance < leftDistance || rightDistance < threshold * 2) {
    horizontalConstraint = "right";
  } else if (element.style.width > canvasSize.width * 0.9) {
    // If element takes up most of the width, use scale constraint
    horizontalConstraint = "scale";
  }
  
  // Determine vertical constraint
  let verticalConstraint: "top" | "bottom" | "center" | "scale" = "top"; // Default
  if (centerYDistance < threshold) {
    verticalConstraint = "center";
  } else if (bottomDistance < topDistance || bottomDistance < threshold * 2) {
    // Enhanced detection for bottom-aligned elements
    verticalConstraint = "bottom";
  } else if (element.style.height > canvasSize.height * 0.9) {
    // If element takes up most of the height, use scale constraint
    verticalConstraint = "scale";
  }
  
  // Special case for images - check if it's likely to be a background or product image at bottom
  if (element.type === 'image') {
    // Large image taking most of the canvas - likely background
    if (element.style.width > canvasSize.width * 0.8 && element.style.height > canvasSize.height * 0.5) {
      // Check if it's at the bottom
      if (element.style.y + element.style.height > canvasSize.height * 0.7) {
        verticalConstraint = "bottom";
      }
    }
    
    // Check if it's a product image typically at bottom
    if (bottomDistance < canvasSize.height * 0.2) {
      verticalConstraint = "bottom";
    }
  }
  
  // Special case for CTA buttons - typically at bottom-right
  if ((element.type === 'button' || (element.type === 'container' && element.style?.backgroundColor === '#2563eb')) && 
      bottomDistance < canvasSize.height * 0.3) {
    verticalConstraint = "bottom";
    if (rightDistance < canvasSize.width * 0.3) {
      horizontalConstraint = "right";
    }
  }
  
  return { horizontalConstraint, verticalConstraint };
};

/**
 * Applies a transformation matrix to position an element
 * from one artboard size to another
 */
export const applyTransformationMatrix = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number, y: number, width: number, height: number } => {
  // Calculate scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Get constraints from element or calculate them if not present
  const horizontalConstraint = element.style.constraintHorizontal || 
    analyzeElementPosition(element, sourceSize).horizontalConstraint;
    
  const verticalConstraint = element.style.constraintVertical || 
    analyzeElementPosition(element, sourceSize).verticalConstraint;
  
  // Handle horizontal constraint
  let x = element.style.x * scaleX; // Default scaling
  
  if (horizontalConstraint === "right") {
    // Maintain right edge distance
    const rightEdgeDistance = sourceSize.width - (element.style.x + element.style.width);
    x = targetSize.width - rightEdgeDistance * scaleX - element.style.width * scaleX;
  } else if (horizontalConstraint === "center") {
    // Maintain center position
    const centerOffset = element.style.x + element.style.width / 2 - sourceSize.width / 2;
    x = targetSize.width / 2 + centerOffset * scaleX - element.style.width * scaleX / 2;
  } else if (horizontalConstraint === "scale") {
    // For elements that should scale relative to canvas width
    x = (element.style.x / sourceSize.width) * targetSize.width;
  }
  
  // Handle vertical constraint
  let y = element.style.y * scaleY; // Default scaling
  
  if (verticalConstraint === "bottom") {
    // Maintain bottom edge distance
    const bottomEdgeDistance = sourceSize.height - (element.style.y + element.style.height);
    y = targetSize.height - bottomEdgeDistance * scaleY - element.style.height * scaleY;
  } else if (verticalConstraint === "center") {
    // Maintain center position
    const centerOffset = element.style.y + element.style.height / 2 - sourceSize.height / 2;
    y = targetSize.height / 2 + centerOffset * scaleY - element.style.height * scaleY / 2;
  } else if (verticalConstraint === "scale") {
    // For elements that should scale relative to canvas height
    y = (element.style.y / sourceSize.height) * targetSize.height;
  }
  
  // Calculate dimensions based on scaling factors
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // Special handling for images to preserve aspect ratio
  if ((element.type === "image" || element.type === "logo") && 
       element.style.originalWidth && element.style.originalHeight) {
    const aspectRatio = element.style.originalWidth / element.style.originalHeight;
    
    // For bottom-aligned or centered images, maintain their position but adjust size
    if (verticalConstraint === "bottom" || verticalConstraint === "center") {
      // Use the smaller scale factor to preserve aspect ratio
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / aspectRatio;
      
      // Re-adjust position based on new dimensions
      if (verticalConstraint === "bottom") {
        const bottomEdgeDistance = sourceSize.height - (element.style.y + element.style.height);
        y = targetSize.height - bottomEdgeDistance * scaleY - height;
      } else if (verticalConstraint === "center") {
        const centerOffset = element.style.y + element.style.height / 2 - sourceSize.height / 2;
        y = targetSize.height / 2 + centerOffset * scaleY - height / 2;
      }
    } else {
      // For top-aligned images, maintain their top position and adjust size
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / aspectRatio;
    }
  }
  
  // Apply minimum size constraints
  if (element.style.minWidth && width < element.style.minWidth) {
    width = element.style.minWidth;
  }
  
  if (element.style.minHeight && height < element.style.minHeight) {
    height = element.style.minHeight;
  }
  
  // Apply maximum size constraints
  if (element.style.maxWidth && width > element.style.maxWidth) {
    width = element.style.maxWidth;
  }
  
  if (element.style.maxHeight && height > element.style.maxHeight) {
    height = element.style.maxHeight;
  }
  
  // Ensure font sizes remain legible
  if (element.type === "text" && element.style.fontSize) {
    // Scale font size with width but ensure it remains legible
    const newFontSize = element.style.fontSize * Math.min(scaleX, scaleY);
    const minLegibleSize = 9; // Minimum legible font size in pixels
    element.style.fontSize = Math.max(newFontSize, minLegibleSize);
  }
  
  return { 
    x: snapToGrid(x), 
    y: snapToGrid(y), 
    width: snapToGrid(width), 
    height: snapToGrid(height) 
  };
};

/**
 * Calculates a smart position for an element linked in different canvas sizes
 * based on percentages, respecting canvas boundaries
 */
export const calculateSmartPosition = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } => {
  // Fix: Use constraint-based positioning as the primary approach for better consistency
  if (element.style.constraintHorizontal || element.style.constraintVertical || 
      sourceSize.width !== targetSize.width || sourceSize.height !== targetSize.height) {
    // Create a temporary element with explicit constraints if none are defined
    if (!element.style.constraintHorizontal || !element.style.constraintVertical) {
      const { horizontalConstraint, verticalConstraint } = analyzeElementPosition(element, sourceSize);
      
      const elementWithConstraints = {
        ...element,
        style: {
          ...element.style,
          constraintHorizontal: element.style.constraintHorizontal || horizontalConstraint,
          constraintVertical: element.style.constraintVertical || verticalConstraint
        }
      };
      
      return applyTransformationMatrix(elementWithConstraints, sourceSize, targetSize);
    }
    
    return applyTransformationMatrix(element, sourceSize, targetSize);
  }
  
  // Fallback to percentage-based positioning if no constraints and same size
  const xPercent = element.style.xPercent !== undefined 
    ? element.style.xPercent 
    : (element.style.x / sourceSize.width) * 100;
    
  const yPercent = element.style.yPercent !== undefined 
    ? element.style.yPercent 
    : (element.style.y / sourceSize.height) * 100;
    
  const widthPercent = element.style.widthPercent !== undefined 
    ? element.style.widthPercent 
    : (element.style.width / sourceSize.width) * 100;
    
  const heightPercent = element.style.heightPercent !== undefined 
    ? element.style.heightPercent 
    : (element.style.height / sourceSize.height) * 100;

  // Calculate position based on percentages
  let x = (xPercent * targetSize.width) / 100;
  let y = (yPercent * targetSize.height) / 100;
  let width = (widthPercent * targetSize.width) / 100;
  let height = (heightPercent * targetSize.height) / 100;

  // Special handling for images to preserve aspect ratio
  if (element.type === "image" || element.type === "logo") {
    // Get original aspect ratio
    const originalAspectRatio = 
      (element.style.originalWidth && element.style.originalHeight) 
        ? element.style.originalWidth / element.style.originalHeight
        : element.style.width / element.style.height;
    
    // If original aspect ratio is available, use it to maintain proportion
    if (originalAspectRatio) {
      height = width / originalAspectRatio;
    }
  }

  // Snap to grid
  x = snapToGrid(x);
  y = snapToGrid(y);
  width = snapToGrid(width);
  height = snapToGrid(height);

  return { x, y, width, height };
};

/**
 * Maintains element position relative to cursor during drag operations
 * across different canvas sizes
 */
export const calculateDragPosition = (
  mouseX: number,
  mouseY: number,
  dragOffsetX: number,
  dragOffsetY: number,
  element: EditorElement,
  canvasSize: BannerSize
): { x: number; y: number } => {
  // Calculate new position based on mouse and offset
  let newX = mouseX - dragOffsetX;
  let newY = mouseY - dragOffsetY;

  // Restrict to canvas
  const maxX = canvasSize.width - element.style.width;
  const maxY = canvasSize.height - element.style.height;
  
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  // Snap to grid
  newX = snapToGrid(newX);
  newY = snapToGrid(newY);

  // Calculate and store percentage positions for responsive scaling
  element.style.xPercent = (newX / canvasSize.width) * 100;
  element.style.yPercent = (newY / canvasSize.height) * 100;

  return { x: newX, y: newY };
};

/**
 * Intelligently updates linked elements when one is modified,
 * maintaining relative proportions and positions
 */
export const updateLinkedElementsIntelligently = (
  elements: EditorElement[],
  sourceElement: EditorElement,
  activeSizes: BannerSize[]
): EditorElement[] => {
  if (!sourceElement.linkedElementId) return elements;

  // Find source element size
  const sourceSize = activeSizes.find(size => size.name === sourceElement.sizeId) || activeSizes[0];

  // Determine constraints if not explicitly set
  let horizontalConstraint = sourceElement.style.constraintHorizontal;
  let verticalConstraint = sourceElement.style.constraintVertical;
  
  if (!horizontalConstraint || !verticalConstraint) {
    const constraints = analyzeElementPosition(sourceElement, sourceSize);
    horizontalConstraint = horizontalConstraint || constraints.horizontalConstraint;
    verticalConstraint = verticalConstraint || constraints.verticalConstraint;
  }

  // Update all linked elements
  return elements.map(el => {
    // Skip if not linked to source element, is source element, or is individually positioned
    if (el.linkedElementId !== sourceElement.linkedElementId || 
        el.id === sourceElement.id || 
        el.isIndividuallyPositioned) {
      return el;
    }

    // Find target size
    const targetSize = activeSizes.find(size => size.name === el.sizeId) || activeSizes[0];
    
    // Apply transformations based on constraints
    const { x, y, width, height } = applyTransformationMatrix({
      ...sourceElement,
      style: {
        ...sourceElement.style,
        constraintHorizontal: horizontalConstraint,
        constraintVertical: verticalConstraint
      }
    }, sourceSize, targetSize);
    
    // Calculate percentage values for storage
    const xPercent = (x / targetSize.width) * 100;
    const yPercent = (y / targetSize.height) * 100;
    const widthPercent = (width / targetSize.width) * 100;
    const heightPercent = (height / targetSize.height) * 100;
    
    // Update element with new positions
    return {
      ...el,
      style: {
        ...el.style,
        x: x,
        y: y,
        width: width,
        height: height,
        // Store constraint info for future transformations
        constraintHorizontal: horizontalConstraint,
        constraintVertical: verticalConstraint,
        // Update percentage values
        xPercent: xPercent,
        yPercent: yPercent,
        widthPercent: widthPercent,
        heightPercent: heightPercent
      }
    };
  });
};
