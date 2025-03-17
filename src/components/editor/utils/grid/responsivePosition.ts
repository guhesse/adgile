import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "./gridCore";

/**
 * Calculates the ideal position for a linked element across different canvas sizes
 * based on percentages while respecting canvas boundaries
 */
export const calculateSmartPosition = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } => {
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

  // Calculate position based on percentages
  let x = (xPercent * targetSize.width) / 100;
  let y = (yPercent * targetSize.height) / 100;
  let width = (widthPercent * targetSize.width) / 100;
  let height = (heightPercent * targetSize.height) / 100;

  // Ensure minimum dimensions
  width = Math.max(width, 20);
  height = Math.max(height, 20);

  // Special handling for images to preserve aspect ratio
  if (element.type === "image" || element.type === "logo") {
    // Get the original aspect ratio
    const originalAspectRatio = 
      (element.style.width / element.style.height) || 
      (sourceSize.width / sourceSize.height);
    
    // Calculate the new aspect ratio based on the percentage calculations
    const newAspectRatio = width / height;
    
    // If aspect ratios are significantly different, adjust dimensions
    if (Math.abs(originalAspectRatio - newAspectRatio) > 0.01) {
      // For images, prioritize percentage-based width and adjust height to maintain aspect ratio
      height = width / originalAspectRatio;
    }
  }

  // Bottom alignment detection and preservation
  const isBottomAligned = Math.abs((element.style.y + element.style.height) - sourceSize.height) < 10;
  if (isBottomAligned) {
    // If element was bottom-aligned in source, keep it bottom-aligned in target
    y = targetSize.height - height;
  }

  // Ensure element stays within canvas bounds
  const margin = 0; // No margin for overflow
  x = Math.max(margin * -1, Math.min(x, targetSize.width - width - margin));
  y = Math.max(margin * -1, Math.min(y, targetSize.height - height - margin));

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

  // Constrain to canvas
  const maxX = canvasSize.width - element.style.width;
  const maxY = canvasSize.height - element.style.height;
  
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  // Snap to grid
  newX = snapToGrid(newX);
  newY = snapToGrid(newY);

  return { x: newX, y: newY };
};

/**
 * Updates linked elements intelligently when one is modified
 */
export const updateLinkedElementsIntelligently = (
  elements: EditorElement[],
  sourceElement: EditorElement,
  activeSizes: BannerSize[]
): EditorElement[] => {
  if (!sourceElement.linkedElementId) return elements;

  // Find the source element's size
  const sourceSize = activeSizes.find(size => size.name === sourceElement.sizeId) || activeSizes[0];

  // Update all linked elements
  return elements.map(el => {
    // Skip if not linked to the source element, is the source element itself, or is individually positioned
    if (el.linkedElementId !== sourceElement.linkedElementId || 
        el.id === sourceElement.id || 
        el.isIndividuallyPositioned) {
      return el;
    }

    // Find the target element's size
    const targetSize = activeSizes.find(size => size.name === el.sizeId) || activeSizes[0];
    
    // Calculate smart position for this canvas size
    const smartPosition = calculateSmartPosition(sourceElement, sourceSize, targetSize);
    
    // Update element with new positions
    return {
      ...el,
      style: {
        ...el.style,
        x: smartPosition.x,
        y: smartPosition.y,
        width: smartPosition.width,
        height: smartPosition.height,
        // Copy other percentage values
        xPercent: (smartPosition.x / targetSize.width) * 100,
        yPercent: (smartPosition.y / targetSize.height) * 100,
        widthPercent: (smartPosition.width / targetSize.width) * 100,
        heightPercent: (smartPosition.height / targetSize.height) * 100
      }
    };
  });
};
