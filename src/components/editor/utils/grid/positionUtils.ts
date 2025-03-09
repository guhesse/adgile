
import { EditorElement } from "../../types";
import { absoluteToPercentage, percentageToAbsolute, snapToGrid } from "./gridCore";

// Convert element positions to percentage-based
export const convertElementToPercentage = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  const percentX = absoluteToPercentage(element.style.x, canvasWidth);
  const percentY = absoluteToPercentage(element.style.y, canvasHeight);
  const percentWidth = absoluteToPercentage(element.style.width, canvasWidth);
  const percentHeight = absoluteToPercentage(element.style.height, canvasHeight);

  return {
    ...element,
    style: {
      ...element.style,
      xPercent: percentX,
      yPercent: percentY,
      widthPercent: percentWidth,
      heightPercent: percentHeight
    }
  };
};

// Convert percentage positions to absolute (for a specific canvas size)
export const applyPercentageToElement = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  // Only apply if percentage values exist
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    return {
      ...element,
      style: {
        ...element.style,
        x: percentageToAbsolute(element.style.xPercent, canvasWidth),
        y: percentageToAbsolute(element.style.yPercent, canvasHeight),
        width: percentageToAbsolute(element.style.widthPercent, canvasWidth),
        height: percentageToAbsolute(element.style.heightPercent, canvasHeight)
      }
    };
  }
  return element;
};

// Smart positioning: Find the optimal position for an element across different canvas sizes
export const findOptimalPosition = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): { x: number, y: number, width: number, height: number } => {
  // If this element already has percentage values, use them
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    return {
      x: percentageToAbsolute(element.style.xPercent, canvasWidth),
      y: percentageToAbsolute(element.style.yPercent, canvasHeight),
      width: percentageToAbsolute(element.style.widthPercent, canvasWidth),
      height: percentageToAbsolute(element.style.heightPercent, canvasHeight)
    };
  }

  // If element is a text, center it horizontally
  if (element.type === "text" || element.type === "paragraph") {
    const x = (canvasWidth - element.style.width) / 2;
    return {
      x: snapToGrid(x),
      y: element.style.y,
      width: element.style.width,
      height: element.style.height
    };
  }

  // If element is an image or logo, maintain aspect ratio
  if (element.type === "image" || element.type === "logo") {
    const aspectRatio = element.style.width / element.style.height;
    let newWidth = Math.min(element.style.width, canvasWidth * 0.8); // 80% of canvas width max
    let newHeight = newWidth / aspectRatio;
    
    // Center it
    const x = (canvasWidth - newWidth) / 2;
    const y = (canvasHeight - newHeight) / 3; // Position in the upper third
    
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: snapToGrid(newWidth),
      height: snapToGrid(newHeight)
    };
  }

  // Default: scale by canvas size
  const widthRatio = canvasWidth / 600; // Assuming 600 is a reference width
  const heightRatio = canvasHeight / 600;
  
  return {
    x: snapToGrid(element.style.x * widthRatio),
    y: snapToGrid(element.style.y * heightRatio),
    width: snapToGrid(element.style.width * widthRatio),
    height: snapToGrid(element.style.height * heightRatio)
  };
};
