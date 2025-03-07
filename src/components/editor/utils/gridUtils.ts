
import { EditorElement } from "../types";

// Grid cell size in pixels
export const GRID_CELL_SIZE = 10;

// Snap value to grid
export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_CELL_SIZE) * GRID_CELL_SIZE;
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
  
  // Check if element is within any container's bounds
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
      width: canvasWidth,
      height: snapToGrid(element.style.height + 20),
      backgroundColor: "#ffffff",
      padding: "10px",
    },
  };
  
  return container;
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
  organizedElements.push(...containers);
  
  // Process remaining elements
  const remainingElements = elementsToProcess.filter(
    el => el.type !== "layout" && el.type !== "container"
  );
  
  // Sort elements by vertical position
  remainingElements.sort((a, b) => a.style.y - b.style.y);
  
  // Process each element
  for (const element of remainingElements) {
    // Skip elements that are already in a container
    if (element.inContainer) {
      const container = organizedElements.find(c => c.id === element.parentId);
      if (container && container.childElements) {
        // Update child elements array
        container.childElements.push({...element});
      } else {
        // If container not found, reset to standalone
        element.inContainer = false;
        element.parentId = undefined;
        organizedElements.push(element);
      }
      continue;
    }
    
    // Find nearest container
    const nearestContainer = findNearestContainer(organizedElements, element);
    
    if (nearestContainer && 
        element.style.y >= nearestContainer.style.y && 
        element.style.y + element.style.height <= nearestContainer.style.y + nearestContainer.style.height) {
      // Element is within container bounds, move it inside
      element.inContainer = true;
      element.parentId = nearestContainer.id;
      
      // Initialize childElements array if needed
      if (!nearestContainer.childElements) {
        nearestContainer.childElements = [];
      }
      
      // Add to container's children
      nearestContainer.childElements.push({...element});
    } else {
      // Create a new container for this element
      const newContainer = createContainerForElement(element, canvasWidth);
      element.inContainer = true;
      element.parentId = newContainer.id;
      
      // Initialize container's children array
      newContainer.childElements = [{...element}];
      
      // Add new container to organized elements
      organizedElements.push(newContainer);
    }
  }
  
  return organizedElements;
};
