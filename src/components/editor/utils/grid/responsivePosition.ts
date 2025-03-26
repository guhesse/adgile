
import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "./gridCore";

/**
 * Analyzes an element's position and determines the most appropriate constraints
 * to apply for responsive adaptation
 */
export const analyzeElementPosition = (
  element: EditorElement,
  canvasSize: BannerSize
): { horizontalConstraint: string, verticalConstraint: string } => {
  const threshold = 20; // Threshold in pixels for constraint detection
  
  // Calculate distances to edges
  const leftDistance = element.style.x;
  const rightDistance = canvasSize.width - (element.style.x + element.style.width);
  const topDistance = element.style.y;
  const bottomDistance = canvasSize.height - (element.style.y + element.style.height);
  
  // Determine horizontal constraint
  let horizontalConstraint = "left"; // Default
  if (Math.abs(leftDistance - rightDistance) < threshold) {
    horizontalConstraint = "center";
  } else if (leftDistance > rightDistance) {
    horizontalConstraint = "right";
  }
  
  // Determine vertical constraint
  let verticalConstraint = "top"; // Default
  if (Math.abs(topDistance - bottomDistance) < threshold) {
    verticalConstraint = "center";
  } else if (topDistance > bottomDistance) {
    verticalConstraint = "bottom";
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
  
  // Handle horizontal constraint
  let x = element.style.x * scaleX; // Default scaling
  
  if (element.style.constraintHorizontal === "right") {
    // Maintain right edge distance
    const rightEdgeDistance = sourceSize.width - (element.style.x + element.style.width);
    x = targetSize.width - rightEdgeDistance * scaleX - element.style.width * scaleX;
  } else if (element.style.constraintHorizontal === "center") {
    // Maintain center position
    const centerOffset = element.style.x + element.style.width / 2 - sourceSize.width / 2;
    x = targetSize.width / 2 + centerOffset * scaleX - element.style.width * scaleX / 2;
  }
  
  // Handle vertical constraint
  let y = element.style.y * scaleY; // Default scaling
  
  if (element.style.constraintVertical === "bottom") {
    // Maintain bottom edge distance
    const bottomEdgeDistance = sourceSize.height - (element.style.y + element.style.height);
    y = targetSize.height - bottomEdgeDistance * scaleY - element.style.height * scaleY;
  } else if (element.style.constraintVertical === "center") {
    // Maintain center position
    const centerOffset = element.style.y + element.style.height / 2 - sourceSize.height / 2;
    y = targetSize.height / 2 + centerOffset * scaleY - element.style.height * scaleY / 2;
  }
  
  // Calculate dimensions based on scaling factors
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // Special handling for images to preserve aspect ratio
  if ((element.type === "image" || element.type === "logo") && 
       element.style.originalWidth && element.style.originalHeight) {
    const aspectRatio = element.style.originalWidth / element.style.originalHeight;
    
    // Determine the constraining dimension (width or height)
    if (width / height > aspectRatio) {
      // Width is more constrained, adjust height
      height = width / aspectRatio;
    } else {
      // Height is more constrained, adjust width
      width = height * aspectRatio;
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
    // Scale font size based on width ratio but ensure minimum legibility
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
  // Use constraint-based positioning if available
  if (element.style.constraintHorizontal || element.style.constraintVertical) {
    return applyTransformationMatrix(element, sourceSize, targetSize);
  }
  
  // First, ensure we have percentage values
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

  // Calculate position based on percentages - maintain relative proportion to artboard
  let x = (xPercent * targetSize.width) / 100;
  let y = (yPercent * targetSize.height) / 100;
  let width = (widthPercent * targetSize.width) / 100;
  let height = (heightPercent * targetSize.height) / 100;

  // Ensure minimum dimensions
  width = Math.max(width, 10);
  height = Math.max(height, 10);

  // Special handling for images to preserve aspect ratio
  if (element.type === "image" || element.type === "logo") {
    // Get original aspect ratio
    const originalAspectRatio = 
      (element.style.originalWidth && element.style.originalHeight) 
        ? element.style.originalWidth / element.style.originalHeight
        : element.style.width / element.style.height;
    
    // If original aspect ratio is available, use it to maintain proportion
    if (originalAspectRatio) {
      // Determine which dimension constrains the other
      if (width / height > originalAspectRatio) {
        // Width constrains height
        height = width / originalAspectRatio;
      } else {
        // Height constrains width
        width = height * originalAspectRatio;
      }
    }
  }

  // Detect and preserve bottom alignment
  const isBottomAligned = Math.abs((element.style.y + element.style.height) - sourceSize.height) < 20;
  if (isBottomAligned) {
    y = targetSize.height - height;
  }

  // Detect and preserve center alignment
  const isCenteredHorizontally = Math.abs((element.style.x + element.style.width / 2) - (sourceSize.width / 2)) < 20;
  if (isCenteredHorizontally) {
    x = (targetSize.width - width) / 2;
  }

  // Ensure element stays within canvas boundaries
  const margin = 0; // No margin for overflow
  x = Math.max(margin * -1, Math.min(x, targetSize.width - width - margin));
  y = Math.max(margin * -1, Math.min(y, targetSize.height - height - margin));

  // Snap to grid
  x = snapToGrid(x);
  y = snapToGrid(y);
  width = snapToGrid(width);
  height = snapToGrid(height);

  // Special handling for text elements
  if (element.type === "text" && element.style.fontSize) {
    // Scale font size based on width ratio
    const widthRatio = targetSize.width / sourceSize.width;
    const heightRatio = targetSize.height / sourceSize.height;
    
    // Scale based on the smaller ratio to ensure text remains visible
    const scaleFactor = Math.min(widthRatio, heightRatio);
    
    // Get original font size or use current
    const originalFontSize = element.style.fontSize;
    
    // Calculate new font size with scaling
    let newFontSize = originalFontSize * scaleFactor;
    
    // Ensure minimum legible size
    const minLegibleSize = 8; // Pixels
    newFontSize = Math.max(newFontSize, minLegibleSize);
    
    // Update element font size
    element.style.fontSize = newFontSize;
  }

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

  // Check if source element is aligned to bottom
  const isBottomAligned = Math.abs((sourceElement.style.y + sourceElement.style.height) - sourceSize.height) < 20;
  
  // Check if source element is centered horizontally
  const isCenteredHorizontally = Math.abs((sourceElement.style.x + sourceElement.style.width / 2) - (sourceSize.width / 2)) < 20;

  // Determine constraints if not explicitly set
  let horizontalConstraint = sourceElement.style.constraintHorizontal;
  let verticalConstraint = sourceElement.style.constraintVertical;
  
  if (!horizontalConstraint) {
    if (isCenteredHorizontally) {
      horizontalConstraint = "center";
    } else {
      const rightDistance = sourceSize.width - (sourceElement.style.x + sourceElement.style.width);
      horizontalConstraint = (sourceElement.style.x <= rightDistance) ? "left" : "right";
    }
  }
  
  if (!verticalConstraint) {
    if (isBottomAligned) {
      verticalConstraint = "bottom";
    } else {
      const bottomDistance = sourceSize.height - (sourceElement.style.y + sourceElement.style.height);
      verticalConstraint = (sourceElement.style.y <= bottomDistance) ? "top" : "bottom";
    }
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
