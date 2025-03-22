import { EditorElement } from "../../types";

// Grid cell size in pixels
export const GRID_CELL_SIZE = 1;

// Snap value to grid
export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_CELL_SIZE) * GRID_CELL_SIZE;
};

// Convert absolute position to percentage (relative to canvas)
export const absoluteToPercentage = (value: number, dimension: number): number => {
  return (value / dimension) * 100;
};

// Convert percentage to absolute position
export const percentageToAbsolute = (percentage: number, dimension: number): number => {
  return (percentage * dimension) / 100;
};

// Calculate responsive position for an element across different artboard sizes
export const calculateResponsivePosition = (
  element: EditorElement,
  originalSize: { width: number, height: number },
  targetSize: { width: number, height: number }
): { x: number, y: number, width: number, height: number } => {
  // If element has percentage values, use them
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    return {
      x: percentageToAbsolute(element.style.xPercent, targetSize.width),
      y: percentageToAbsolute(element.style.yPercent, targetSize.height),
      width: percentageToAbsolute(element.style.widthPercent, targetSize.width),
      height: percentageToAbsolute(element.style.heightPercent, targetSize.height)
    };
  }
  
  // Otherwise calculate based on scale
  const widthRatio = targetSize.width / originalSize.width;
  const heightRatio = targetSize.height / originalSize.height;
  
  return {
    x: element.style.x * widthRatio,
    y: element.style.y * heightRatio,
    width: element.style.width * widthRatio,
    height: element.style.height * heightRatio
  };
};
