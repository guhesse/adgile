import { EditorElement } from "../types";

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

// Find the nearest container to place an element
export const findNearestContainer = (
  elements: EditorElement[],
  element: EditorElement
): EditorElement | null => {
  // Filter only container and layout elements
  const containers = elements.filter(
    el => el.type === "layout" || el.type === "container"
  );
  
  if (containers.length === 0) return null;
  
  // Sort containers by vertical distance to the element
  const sortedContainers = [...containers].sort((a, b) => {
    const aDistance = Math.abs(a.style.y - element.style.y);
    const bDistance = Math.abs(b.style.y - element.style.y);
    return aDistance - bDistance;
  });
  
  // Check if element overlaps with any container
  for (const container of sortedContainers) {
    if (
      element.style.x >= container.style.x &&
      element.style.x + element.style.width <= container.style.x + container.style.width &&
      element.style.y >= container.style.y &&
      element.style.y + element.style.height <= container.style.y + container.style.height
    ) {
      return container;
    }
  }
  
  // Return the nearest container vertically
  return sortedContainers[0];
};

// Create a container element for wrapping elements without a container
export const createContainerForElement = (
  element: EditorElement,
  canvasWidth: number
): EditorElement => {
  const container: EditorElement = {
    id: `container-${Date.now()}`,
    type: "container",
    content: "",
    inContainer: false,
    style: {
      x: 0,
      y: snapToGrid(element.style.y - 10),
      width: canvasWidth - 40, // Adjust width to have some margin
      height: snapToGrid(element.style.height + 20),
      backgroundColor: "#ffffff",
      padding: "10px",
    },
  };
  
  return container;
};

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
const isColliding = (
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

// Automatically organize elements into containers
export const organizeElementsInContainers = (
  elements: EditorElement[],
  canvasWidth: number
): EditorElement[] => {
  const organizedElements: EditorElement[] = [];
  const elementsToProcess = [...elements];
  
  // First, add any existing containers/layouts
  const containers = elementsToProcess.filter(
    el => el.type === "layout" || el.type === "container"
  );
  
  // Process children first to make sure they're properly attached to their containers
  containers.forEach(container => {
    if (container.childElements && container.childElements.length > 0) {
      // Make sure all child elements have the correct parentId and inContainer flag
      container.childElements = container.childElements.map(child => ({
        ...child,
        parentId: container.id,
        inContainer: true
      }));
    } else {
      container.childElements = [];
    }
    
    organizedElements.push(container);
  });
  
  // Process remaining standalone elements
  const remainingElements = elementsToProcess.filter(
    el => el.type !== "layout" && el.type !== "container" && !el.inContainer
  );
  
  // Sort elements by vertical position
  remainingElements.sort((a, b) => a.style.y - b.style.y);
  
  // Find overlapping elements with existing containers
  for (const element of remainingElements) {
    // Skip if it's already processed
    if (organizedElements.some(el => el.id === element.id)) continue;
    
    // Find nearest container that this element overlaps with
    const nearestContainer = findNearestContainer(organizedElements, element);
    
    if (nearestContainer && 
        element.style.x >= nearestContainer.style.x && 
        element.style.x + element.style.width <= nearestContainer.style.x + nearestContainer.style.width &&
        element.style.y >= nearestContainer.style.y && 
        element.style.y + element.style.height <= nearestContainer.style.y + nearestContainer.style.height) {
      // Element overlaps with container, add it as a child
      const updatedElement = {
        ...element,
        inContainer: true,
        parentId: nearestContainer.id,
        style: {
          ...element.style,
          // Adjust position to be relative to container
          x: element.style.x - nearestContainer.style.x,
          y: element.style.y - nearestContainer.style.y
        }
      };
      
      // Update the container's childElements array
      const containerIndex = organizedElements.findIndex(el => el.id === nearestContainer.id);
      if (containerIndex !== -1) {
        organizedElements[containerIndex] = {
          ...organizedElements[containerIndex],
          childElements: [
            ...(organizedElements[containerIndex].childElements || []),
            updatedElement
          ]
        };
      }
    } else {
      // Standalone element, add it directly
      organizedElements.push(element);
    }
  }
  
  return organizedElements;
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
