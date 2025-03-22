
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
