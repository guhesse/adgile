
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
  const horizontalCenterDistance = Math.abs((element.style.x + element.style.width / 2) - (canvasSize.width / 2));
  const verticalCenterDistance = Math.abs((element.style.y + element.style.height / 2) - (canvasSize.height / 2));
  
  // Determine if the element is close to an edge (uses lower threshold for bottom/right)
  const isNearLeft = leftDistance < threshold;
  const isNearRight = rightDistance < threshold;
  const isNearTop = topDistance < threshold;
  const isNearBottom = bottomDistance < threshold;
  const isNearHorizontalCenter = horizontalCenterDistance < threshold;
  const isNearVerticalCenter = verticalCenterDistance < threshold;
  
  // Special checks for buttons (usually in bottom-right corner)
  const isButton = element.type === 'button';
  const isBottomRightButton = isButton && isNearBottom && isNearRight;
  
  // Special checks for images (often aligned to bottom)
  const isImage = element.type === 'image';
  const isImageNearBottom = isImage && isNearBottom;
  
  // Determine horizontal constraint
  let horizontalConstraint: "left" | "right" | "center" | "scale" = "left"; // Default
  
  if (isNearHorizontalCenter) {
    horizontalConstraint = "center";
  } else if (isBottomRightButton || isNearRight) {
    horizontalConstraint = "right";
  } else if (isNearLeft) {
    horizontalConstraint = "left";
  } else if (element.style.width / canvasSize.width > 0.8) {
    // If element takes up most of the width, use scale
    horizontalConstraint = "scale";
  } else if (leftDistance < rightDistance) {
    horizontalConstraint = "left";
  } else {
    horizontalConstraint = "right";
  }
  
  // Determine vertical constraint
  let verticalConstraint: "top" | "bottom" | "center" | "scale" = "top"; // Default
  
  if (isNearVerticalCenter) {
    verticalConstraint = "center";
  } else if (isBottomRightButton || isImageNearBottom || isNearBottom) {
    verticalConstraint = "bottom";
  } else if (isNearTop) {
    verticalConstraint = "top";
  } else if (element.style.height / canvasSize.height > 0.8) {
    // If element takes up most of the height, use scale
    verticalConstraint = "scale";
  } else if (topDistance < bottomDistance) {
    verticalConstraint = "top";
  } else {
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
  
  // Calculate edge distances in source
  const leftDistance = element.style.x;
  const rightDistance = sourceSize.width - (element.style.x + element.style.width);
  const topDistance = element.style.y;
  const bottomDistance = sourceSize.height - (element.style.y + element.style.height);
  
  // Handle horizontal constraint
  let x = element.style.x * scaleX; // Default scaling
  
  if (element.style.constraintHorizontal === "right") {
    // Maintain right edge distance
    x = targetSize.width - rightDistance * scaleX - element.style.width * scaleX;
  } else if (element.style.constraintHorizontal === "center") {
    // Maintain center position
    const centerOffset = element.style.x + element.style.width / 2 - sourceSize.width / 2;
    x = targetSize.width / 2 + centerOffset * scaleX - element.style.width * scaleX / 2;
  }
  
  // Handle vertical constraint
  let y = element.style.y * scaleY; // Default scaling
  
  if (element.style.constraintVertical === "bottom") {
    // Maintain bottom edge distance
    y = targetSize.height - bottomDistance * scaleY - element.style.height * scaleY;
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
    
    // Special handling for bottom-aligned images
    if (element.style.constraintVertical === "bottom") {
      // For images at the bottom, prioritize width and adjust height based on aspect ratio
      width = element.style.width * scaleX;
      height = width / aspectRatio;
      
      // Re-adjust position to maintain bottom alignment
      y = targetSize.height - bottomDistance * scaleY - height;
    } 
    // Special handling for right-aligned images
    else if (element.style.constraintHorizontal === "right") {
      // Maintain the aspect ratio
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / aspectRatio;
      
      // Re-adjust position to maintain right alignment
      x = targetSize.width - rightDistance * scaleX - width;
    }
    else {
      // For other images, preserve aspect ratio using the smaller scale factor
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / aspectRatio;
    }
  }
  
  // Special handling for buttons - they should maintain their absolute size
  // so they remain usable and not too small
  if (element.type === "button") {
    // Ensure buttons don't get too small
    const minButtonWidth = 80;
    const minButtonHeight = 30;
    width = Math.max(element.style.width * scaleX, minButtonWidth);
    height = Math.max(element.style.height * scaleY, minButtonHeight);
    
    // Re-adjust position based on constraints
    if (element.style.constraintHorizontal === "right") {
      x = targetSize.width - rightDistance * scaleX - width;
    } else if (element.style.constraintHorizontal === "center") {
      x = targetSize.width / 2 - width / 2;
    }
    
    if (element.style.constraintVertical === "bottom") {
      y = targetSize.height - bottomDistance * scaleY - height;
    } else if (element.style.constraintVertical === "center") {
      y = targetSize.height / 2 - height / 2;
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
  
  // Ensure font sizes remain legible for text elements
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
  
  // Calculate edge distances in source
  const leftDistance = element.style.x;
  const rightDistance = sourceSize.width - (element.style.x + element.style.width);
  const topDistance = element.style.y;
  const bottomDistance = sourceSize.height - (element.style.y + element.style.height);
  
  // Threshold for determining if element is aligned to an edge
  const edgeThreshold = 20;
  
  // Determine position strategy based on element's position in source
  let positionStrategy = {
    horizontal: 'percentage',
    vertical: 'percentage'
  };
  
  // Check if element is aligned to edges
  if (leftDistance < edgeThreshold) {
    positionStrategy.horizontal = 'left';
  } else if (rightDistance < edgeThreshold) {
    positionStrategy.horizontal = 'right';
  } else if (Math.abs((element.style.x + element.style.width / 2) - (sourceSize.width / 2)) < edgeThreshold) {
    positionStrategy.horizontal = 'center';
  }
  
  if (topDistance < edgeThreshold) {
    positionStrategy.vertical = 'top';
  } else if (bottomDistance < edgeThreshold) {
    positionStrategy.vertical = 'bottom';
  } else if (Math.abs((element.style.y + element.style.height / 2) - (sourceSize.height / 2)) < edgeThreshold) {
    positionStrategy.vertical = 'center';
  }
  
  // Calculate scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Calculate dimensions based on scaling
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // First, ensure we have percentage values
  const xPercent = element.style.xPercent !== undefined 
    ? element.style.xPercent 
    : (element.style.x / sourceSize.width) * 100;
    
  const yPercent = element.style.yPercent !== undefined 
    ? element.style.yPercent 
    : (element.style.y / sourceSize.height) * 100;
  
  // Calculate position based on strategy
  let x, y;
  
  // Apply horizontal positioning strategy
  switch (positionStrategy.horizontal) {
    case 'left':
      x = leftDistance * scaleX;
      break;
    case 'right':
      x = targetSize.width - width - rightDistance * scaleX;
      break;
    case 'center':
      x = (targetSize.width - width) / 2;
      break;
    default: // percentage
      x = (xPercent * targetSize.width) / 100;
  }
  
  // Apply vertical positioning strategy
  switch (positionStrategy.vertical) {
    case 'top':
      y = topDistance * scaleY;
      break;
    case 'bottom':
      y = targetSize.height - height - bottomDistance * scaleY;
      break;
    case 'center':
      y = (targetSize.height - height) / 2;
      break;
    default: // percentage
      y = (yPercent * targetSize.height) / 100;
  }
  
  // Special handling for images to preserve aspect ratio
  if (element.type === "image" || element.type === "logo") {
    // Get original aspect ratio
    const originalAspectRatio = 
      (element.style.originalWidth && element.style.originalHeight) 
        ? element.style.originalWidth / element.style.originalHeight
        : element.style.width / element.style.height;
    
    // If original aspect ratio is available, use it to maintain proportion
    if (originalAspectRatio) {
      // Use the smaller scale factor to prevent oversizing
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / originalAspectRatio;
      
      // Recalculate y position for bottom-aligned images
      if (positionStrategy.vertical === 'bottom') {
        y = targetSize.height - height - bottomDistance * scaleY;
      }
    }
  }
  
  // Special handling for buttons to ensure minimum size
  if (element.type === "button") {
    const minButtonWidth = 80;
    const minButtonHeight = 30;
    width = Math.max(width, minButtonWidth);
    height = Math.max(height, minButtonHeight);
    
    // Recalculate position for edge-aligned buttons
    if (positionStrategy.horizontal === 'right') {
      x = targetSize.width - width - rightDistance * scaleX;
    }
    if (positionStrategy.vertical === 'bottom') {
      y = targetSize.height - height - bottomDistance * scaleY;
    }
  }

  // Ensure minimum dimensions
  width = Math.max(width, 10);
  height = Math.max(height, 10);

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
