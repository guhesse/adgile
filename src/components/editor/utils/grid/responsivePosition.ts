
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
  
  // Enhanced detection for element position relative to canvas
  const relativeX = element.style.x / canvasSize.width;
  const relativeY = element.style.y / canvasSize.height;
  const relativeRight = rightDistance / canvasSize.width;
  const relativeBottom = bottomDistance / canvasSize.height;
  
  // Determine horizontal constraint with improved proportional logic
  let horizontalConstraint: "left" | "right" | "center" | "scale" = "left"; // Default
  
  if (centerXDistance < threshold || relativeX > 0.4 && relativeX < 0.6) {
    horizontalConstraint = "center";
  } else if (rightDistance < leftDistance || relativeRight < 0.1) {
    horizontalConstraint = "right";
  } else if (element.style.width > canvasSize.width * 0.8) {
    // If element takes up most of the width, use scale constraint
    horizontalConstraint = "scale";
  }
  
  // Determine vertical constraint with improved proportion-based detection
  let verticalConstraint: "top" | "bottom" | "center" | "scale" = "top"; // Default
  
  if (centerYDistance < threshold || (relativeY > 0.4 && relativeY < 0.6)) {
    verticalConstraint = "center";
  } else if (bottomDistance < topDistance || relativeBottom < 0.2) {
    // Enhanced detection for bottom-aligned elements
    verticalConstraint = "bottom";
  } else if (element.style.height > canvasSize.height * 0.8) {
    // If element takes up most of the height, use scale constraint
    verticalConstraint = "scale";
  }
  
  // Special case for images - use more intelligent detection
  if (element.type === 'image') {
    // Large image taking most of the canvas width - likely background or banner image
    if (element.style.width > canvasSize.width * 0.7) {
      horizontalConstraint = "scale";
      
      // Check if it's likely to be a header or footer image
      if (element.style.y < canvasSize.height * 0.3) {
        verticalConstraint = "top";
      } else if (element.style.y + element.style.height > canvasSize.height * 0.7) {
        verticalConstraint = "bottom";
      }
    }
    
    // Product images typically at bottom
    if (relativeBottom < 0.3 && element.style.height > canvasSize.height * 0.3) {
      verticalConstraint = "bottom";
    }
    
    // Person/product portraits typically need to maintain their position 
    if (element.style.height > canvasSize.height * 0.5) {
      // Use aspect ratio to help determine if it's a portrait
      const aspectRatio = element.style.width / element.style.height;
      if (aspectRatio < 1.2) { // Portrait or square-ish image
        // Check if image is at bottom half
        if (element.style.y > canvasSize.height * 0.4) {
          verticalConstraint = "bottom";
        }
      }
    }
  }
  
  // Special case for CTA buttons - typically at bottom-right or centered at bottom
  if ((element.type === 'button' || 
      (element.type === 'container' && element.style?.backgroundColor === '#2563eb') ||
      (element.content && element.content.toLowerCase().includes('saiba') || 
       element.content && element.content.toLowerCase().includes('comprar')))) {
       
    if (relativeBottom < 0.3) {
      verticalConstraint = "bottom";
      
      // Check if closer to right or center
      if (relativeRight < relativeX) {
        horizontalConstraint = "right";
      } else if (centerXDistance < canvasSize.width * 0.3) {
        horizontalConstraint = "center";
      }
    }
  }
  
  // Special case for logos - typically at top-left or top-center
  if (element.type === 'logo' || 
      (element.type === 'image' && 
       element.style.width < canvasSize.width * 0.5 && 
       element.style.y < canvasSize.height * 0.2)) {
    
    verticalConstraint = "top";
    
    if (centerXDistance < canvasSize.width * 0.2) {
      horizontalConstraint = "center";
    } else if (leftDistance < canvasSize.width * 0.2) {
      horizontalConstraint = "left";
    }
  }
  
  // Special case for headlines/titles - typically at top or center
  if ((element.type === 'text' && element.style.fontSize && element.style.fontSize > 18) ||
      (element.content && element.content.toUpperCase() === element.content && element.content.length < 30)) {
    
    if (relativeY < 0.3) {
      verticalConstraint = "top";
    } else if (relativeY > 0.3 && relativeY < 0.7) {
      verticalConstraint = "center";
    }
    
    // Centered headlines are common
    if (Math.abs((element.style.x + element.style.width/2) - (canvasSize.width/2)) < canvasSize.width * 0.25) {
      horizontalConstraint = "center";
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
  // Calculate scaling factors based on proportions
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  const aspectRatioDifference = (targetSize.width / targetSize.height) / (sourceSize.width / sourceSize.height);
  
  // Get constraints from element or calculate them if not present
  const horizontalConstraint = element.style.constraintHorizontal || 
    analyzeElementPosition(element, sourceSize).horizontalConstraint;
    
  const verticalConstraint = element.style.constraintVertical || 
    analyzeElementPosition(element, sourceSize).verticalConstraint;
  
  // Calculate dimensions based on scaling factors
  let width = element.style.width * scaleX;
  let height = element.style.height * scaleY;
  
  // Special handling for images to preserve aspect ratio
  if ((element.type === "image" || element.type === "logo") && 
       element.style.originalWidth && element.style.originalHeight) {
    const imageAspectRatio = element.style.originalWidth / element.style.originalHeight;
    
    // If the aspect ratio of the target format is very different, adjust more intelligently
    if (Math.abs(aspectRatioDifference - 1) > 0.3) {
      // For dramatic format changes (e.g. square to wide rectangle), use minimum scale
      const minScale = Math.min(scaleX, scaleY);
      width = element.style.width * minScale;
      height = width / imageAspectRatio;
    } else {
      // For similar aspect ratios, maintain relative proportions
      width = element.style.width * scaleX;
      height = width / imageAspectRatio;
    }
  }
  
  // Handle horizontal constraint
  let x = element.style.x * scaleX; // Default scaling
  
  if (horizontalConstraint === "right") {
    // Maintain right edge distance proportionally
    const rightEdgeDistance = sourceSize.width - (element.style.x + element.style.width);
    const scaledRightDistance = rightEdgeDistance * scaleX;
    x = targetSize.width - scaledRightDistance - width;
  } else if (horizontalConstraint === "center") {
    // Maintain center position proportionally
    const sourceCenterX = sourceSize.width / 2;
    const targetCenterX = targetSize.width / 2;
    const elementOffsetFromCenter = (element.style.x + element.style.width / 2) - sourceCenterX;
    const scaledOffset = elementOffsetFromCenter * scaleX;
    x = targetCenterX + scaledOffset - width / 2;
  } else if (horizontalConstraint === "scale") {
    // For elements that should scale with canvas width
    const relativeX = element.style.x / sourceSize.width;
    x = relativeX * targetSize.width;
    
    // For full-width elements, scale width to match target
    if (element.style.width > sourceSize.width * 0.8) {
      width = targetSize.width * (element.style.width / sourceSize.width);
    }
  }
  
  // Handle vertical constraint
  let y = element.style.y * scaleY; // Default scaling
  
  if (verticalConstraint === "bottom") {
    // Maintain bottom edge distance proportionally
    const bottomEdgeDistance = sourceSize.height - (element.style.y + element.style.height);
    const scaledBottomDistance = bottomEdgeDistance * scaleY;
    y = targetSize.height - scaledBottomDistance - height;
  } else if (verticalConstraint === "center") {
    // Maintain center position proportionally
    const sourceCenterY = sourceSize.height / 2;
    const targetCenterY = targetSize.height / 2;
    const elementOffsetFromCenter = (element.style.y + element.style.height / 2) - sourceCenterY;
    const scaledOffset = elementOffsetFromCenter * scaleY;
    y = targetCenterY + scaledOffset - height / 2;
  } else if (verticalConstraint === "scale") {
    // For elements that should scale with canvas height
    const relativeY = element.style.y / sourceSize.height;
    y = relativeY * targetSize.height;
    
    // For full-height elements, scale height to match target
    if (element.style.height > sourceSize.height * 0.8) {
      height = targetSize.height * (element.style.height / sourceSize.height);
    }
  }
  
  // Font scaling for text elements
  if (element.type === "text" && element.style.fontSize) {
    // Scale font size relative to the width, as it's usually more important for readability
    const fontScale = Math.min(scaleX, scaleY);
    const targetFontSize = element.style.fontSize * fontScale;
    
    // Ensure font remains readable (minimum size)
    element.style.fontSize = Math.max(targetFontSize, 9);
    
    // If text gets too large, cap it
    if (element.style.fontSize > 72) {
      element.style.fontSize = 72;
    }
    
    // Adjust text width based on font scaling
    if (Math.abs(fontScale - 1) > 0.2) {
      // Only adjust if scale change is significant
      width = width * (fontScale / scaleX);
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
  
  // Ensure element stays within canvas boundaries
  x = Math.max(0, Math.min(x, targetSize.width - width));
  y = Math.max(0, Math.min(y, targetSize.height - height));
  
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
  // Use constraint-based positioning for most consistent results
  const sourceHasConstraints = element.style.constraintHorizontal && element.style.constraintVertical;
  
  // If there are no constraints set or the sizes differ significantly, analyze and set constraints
  if (!sourceHasConstraints || 
      Math.abs((sourceSize.width / sourceSize.height) - (targetSize.width / targetSize.height)) > 0.2) {
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
  
  // If constraints are already set and sizes are similar, use them directly
  return applyTransformationMatrix(element, sourceSize, targetSize);
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
  const xPercent = (newX / canvasSize.width) * 100;
  const yPercent = (newY / canvasSize.height) * 100;

  return { x: newX, y: newY, xPercent, yPercent };
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
        x,
        y,
        width,
        height,
        // Store constraint info for future transformations
        constraintHorizontal: horizontalConstraint,
        constraintVertical: verticalConstraint,
        // Update percentage values
        xPercent,
        yPercent,
        widthPercent,
        heightPercent,
        // If this is a text element, preserve font scaling
        fontSize: sourceElement.type === 'text' && sourceElement.style.fontSize 
          ? sourceElement.style.fontSize * (width / sourceElement.style.width)
          : el.style.fontSize
      }
    };
  });
};
