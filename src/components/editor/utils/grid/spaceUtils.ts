
import { EditorElement } from "../../types";
import { snapToGrid } from "./gridCore";

// Find the nearest free space for an element
export const findNearestFreeSpace = (
  elements: EditorElement[],
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): { x: number, y: number } => {
  // Get all occupied areas
  const occupiedAreas = elements
    .filter(el => el.id !== element.id && !el.inContainer)
    .map(el => ({
      x1: el.style.x,
      y1: el.style.y,
      x2: el.style.x + el.style.width,
      y2: el.style.y + el.style.height
    }));
  
  // Try to place at original position first
  let { x, y } = element.style;
  
  // If there's a collision, find the nearest free space
  if (isColliding({ x, y, width: element.style.width, height: element.style.height }, occupiedAreas)) {
    // Try to place below other elements
    const highestY = Math.max(
      ...occupiedAreas.map(area => area.y2),
      0
    );
    
    y = snapToGrid(highestY + 10);
    x = snapToGrid(20); // Start from the left with some margin
  }
  
  // Make sure the element is within canvas bounds
  x = Math.min(Math.max(0, x), canvasWidth - element.style.width);
  y = Math.min(Math.max(0, y), canvasHeight - element.style.height);
  
  return { x, y };
};

// Check if an element collides with any occupied areas
export const isColliding = (
  element: { x: number, y: number, width: number, height: number },
  occupiedAreas: Array<{ x1: number, y1: number, x2: number, y2: number }>
): boolean => {
  const { x, y, width, height } = element;
  const x2 = x + width;
  const y2 = y + height;
  
  for (const area of occupiedAreas) {
    if (
      x < area.x2 &&
      x2 > area.x1 &&
      y < area.y2 &&
      y2 > area.y1
    ) {
      return true;
    }
  }
  
  return false;
};
