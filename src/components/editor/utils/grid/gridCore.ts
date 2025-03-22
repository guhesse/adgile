
/**
 * Grid utils - core functions for positioning and sizing elements
 */

export const GRID_SIZE = 10; // Grid size in pixels

/**
 * Snaps a value to the nearest grid point
 */
export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

/**
 * Converts an absolute position to a percentage of the container width
 */
export const absoluteToPercentage = (position: number, containerSize: number): number => {
  return (position / containerSize) * 100;
};

/**
 * Converts a percentage position to an absolute position
 */
export const percentageToAbsolute = (percentage: number, containerSize: number): number => {
  return (percentage * containerSize) / 100;
};

/**
 * Calculates the correct position and size after a resize operation
 */
export const calculateResizedDimensions = (
  startX: number, 
  startY: number, 
  startWidth: number, 
  startHeight: number,
  deltaX: number, 
  deltaY: number, 
  direction: string,
  aspectRatio?: number
): { x: number; y: number; width: number; height: number } => {
  let newX = startX;
  let newY = startY;
  let newWidth = startWidth;
  let newHeight = startHeight;

  // Adjust width based on horizontal resize
  if (direction.includes('e')) {
    newWidth = Math.max(10, startWidth + deltaX);
  } else if (direction.includes('w')) {
    const possibleWidth = Math.max(10, startWidth - deltaX);
    newX = startX + (startWidth - possibleWidth);
    newWidth = possibleWidth;
  }

  // Adjust height based on vertical resize
  if (direction.includes('s')) {
    newHeight = Math.max(10, startHeight + deltaY);
  } else if (direction.includes('n')) {
    const possibleHeight = Math.max(10, startHeight - deltaY);
    newY = startY + (startHeight - possibleHeight);
    newHeight = possibleHeight;
  }

  // Maintain aspect ratio if needed (e.g., for images)
  if (aspectRatio) {
    if (direction === 'se' || direction === 'ne') {
      newHeight = newWidth / aspectRatio;
    } else if (direction === 'sw' || direction === 'nw') {
      newWidth = newHeight * aspectRatio;
    }
  }

  // Snap all values to grid
  return {
    x: snapToGrid(newX),
    y: snapToGrid(newY),
    width: snapToGrid(newWidth),
    height: snapToGrid(newHeight)
  };
};

/**
 * Converts element dimensions to account for different container sizes
 */
export const scaleElementToNewSize = (
  x: number,
  y: number,
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  newWidth: number,
  newHeight: number
): { x: number; y: number; width: number; height: number } => {
  // Calculate scaling factors
  const widthRatio = newWidth / originalWidth;
  const heightRatio = newHeight / originalHeight;
  
  // Scale dimensions
  return {
    x: snapToGrid(x * widthRatio),
    y: snapToGrid(y * heightRatio),
    width: snapToGrid(width * widthRatio),
    height: snapToGrid(height * heightRatio)
  };
};

/**
 * Gets the position relative to a parent container
 */
export const getRelativePosition = (
  x: number,
  y: number,
  parentX: number,
  parentY: number
): { x: number; y: number } => {
  return {
    x: x - parentX,
    y: y - parentY
  };
};

/**
 * Determines if two elements are overlapping
 */
export const areElementsOverlapping = (
  x1: number, y1: number, width1: number, height1: number,
  x2: number, y2: number, width2: number, height2: number
): boolean => {
  return (
    x1 < x2 + width2 &&
    x1 + width1 > x2 &&
    y1 < y2 + height2 &&
    y1 + height1 > y2
  );
};
