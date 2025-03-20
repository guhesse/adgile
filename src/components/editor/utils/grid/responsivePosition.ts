
import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "./gridCore";

/**
 * Calculates the ideal position for a linked element across different canvas sizes
 * based on percentages, respecting canvas boundaries
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

  // Calculate position based on percentages - maintain proportion relative to canvas
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
      height = width / originalAspectRatio;
    }
  }

  // Bottom alignment detection and preservation
  const isBottomAligned = Math.abs((element.style.y + element.style.height) - sourceSize.height) < 20;
  if (isBottomAligned) {
    y = targetSize.height - height;
  }

  // Ensure the element stays within canvas boundaries
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

  // Restrict to canvas
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
 * Intelligently updates linked elements when one is modified,
 * maintaining relative proportions and positions
 */
export const updateLinkedElementsIntelligently = (
  elements: EditorElement[],
  sourceElement: EditorElement,
  activeSizes: BannerSize[]
): EditorElement[] => {
  if (!sourceElement.linkedElementId) return elements;

  // Find the source size
  const sourceSize = activeSizes.find(size => size.name === sourceElement.sizeId) || activeSizes[0];

  // Check if source element is bottom-aligned
  const isBottomAligned = Math.abs((sourceElement.style.y + sourceElement.style.height) - sourceSize.height) < 20;

  // Calculate percentage values from source element
  const xPercent = (sourceElement.style.x / sourceSize.width) * 100;
  const yPercent = (sourceElement.style.y / sourceSize.height) * 100;
  const widthPercent = (sourceElement.style.width / sourceSize.width) * 100;
  const heightPercent = (sourceElement.style.height / sourceSize.height) * 100;

  // Update all linked elements
  return elements.map(el => {
    // Skip if not linked to source element, is the source element, or is individually positioned
    if (el.linkedElementId !== sourceElement.linkedElementId || 
        el.id === sourceElement.id || 
        el.isIndividuallyPositioned) {
      return el;
    }

    // Find the target size
    const targetSize = activeSizes.find(size => size.name === el.sizeId) || activeSizes[0];
    
    // Apply percentage values to target size
    let x = (xPercent * targetSize.width) / 100;
    let y = (yPercent * targetSize.height) / 100;
    let width = (widthPercent * targetSize.width) / 100;
    let height = (heightPercent * targetSize.height) / 100;
    
    // Ensure minimum dimensions
    width = Math.max(width, 10);
    height = Math.max(height, 10);
    
    // Special handling for images
    if (el.type === "image" || el.type === "logo") {
      const aspectRatio = sourceElement.style.width / sourceElement.style.height;
      height = width / aspectRatio;
    }
    
    // If source element is bottom-aligned, ensure target is also
    if (isBottomAligned) {
      y = targetSize.height - height;
    }
    
    // Ensure element stays within boundaries
    x = Math.max(0, Math.min(x, targetSize.width - width));
    y = Math.max(0, Math.min(y, targetSize.height - height));
    
    // Snap to grid
    x = snapToGrid(x);
    y = snapToGrid(y);
    width = snapToGrid(width);
    height = snapToGrid(height);
    
    // Update element with new positions
    return {
      ...el,
      style: {
        ...el.style,
        x: x,
        y: y,
        width: width,
        height: height,
        // Update percentage values
        xPercent: xPercent,
        yPercent: yPercent,
        widthPercent: widthPercent,
        heightPercent: heightPercent
      }
    };
  });
};
