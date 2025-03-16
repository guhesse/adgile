
import { EditorElement } from "../types";

// Function to check if an element is within the boundaries of its container
export const isElementWithinContainer = (
  element: EditorElement,
  container: EditorElement
): boolean => {
  if (!element || !container) return false;

  const { x, y, width, height } = element.style;
  const { width: containerWidth, height: containerHeight } = container.style;

  return (
    x >= 0 &&
    y >= 0 &&
    x + width <= containerWidth &&
    y + height <= containerHeight
  );
};

// Function to constrain an element to stay within the canvas boundaries
export const constrainElementToCanvas = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  const { x, y, width, height } = element.style;
  
  // Calculate constrained position
  const constrainedX = Math.max(0, Math.min(x, canvasWidth - Math.min(width, 20)));
  const constrainedY = Math.max(0, Math.min(y, canvasHeight - Math.min(height, 20)));
  
  // Only update if position changed
  if (x === constrainedX && y === constrainedY) {
    return element;
  }
  
  // Update the element position
  return {
    ...element,
    style: {
      ...element.style,
      x: constrainedX,
      y: constrainedY
    }
  };
};

// Function to move an element out of its container
export const moveElementOutOfContainer = (
  element: EditorElement,
  elements: EditorElement[],
  setElements: (elements: EditorElement[]) => void,
  setSelectedElement: (element: EditorElement | null) => void
) => {
  if (!element.inContainer || !element.parentId) return;

  // Clone the elements array
  const updatedElements = [...elements];

  // Find the parent container
  const containerIndex = updatedElements.findIndex(el => el.id === element.parentId);
  if (containerIndex === -1) return;
  
  // Remove element from container's childElements
  if (updatedElements[containerIndex].childElements) {
    updatedElements[containerIndex] = {
      ...updatedElements[containerIndex],
      childElements: updatedElements[containerIndex].childElements?.filter(
        child => child.id !== element.id
      ) || []
    };
  }

  // Calculate a position on the canvas where the element won't overlap
  // Use the element's absolute position based on container position
  const containerX = updatedElements[containerIndex].style.x;
  const containerY = updatedElements[containerIndex].style.y;
  
  // Calculate absolute position and apply margins to avoid overlaps
  const absolutePosition = {
    x: containerX + element.style.x + 20,
    y: containerY + element.style.y + 20
  };

  // Create a new standalone element
  const standaloneElement: EditorElement = {
    ...element,
    inContainer: false,
    parentId: undefined,
    style: {
      ...element.style,
      x: absolutePosition.x,
      y: absolutePosition.y
    }
  };

  // Add the standalone element to the array
  updatedElements.push(standaloneElement);
  
  // Update the state
  setElements(updatedElements);
  setSelectedElement(standaloneElement);
};

// Function to move an element to a container
export const moveElementToContainer = (
  element: EditorElement,
  containerId: string,
  elements: EditorElement[],
  setElements: (elements: EditorElement[]) => void,
  setSelectedElement: (element: EditorElement | null) => void
) => {
  // Clone the elements array
  const updatedElements = [...elements];
  
  // Find the container
  const containerIndex = updatedElements.findIndex(el => el.id === containerId);
  if (containerIndex === -1) return;
  
  // First remove the element from its current location (standalone or another container)
  if (element.inContainer && element.parentId) {
    // Element is in a container, remove it from there
    const sourceContainerIndex = updatedElements.findIndex(el => el.id === element.parentId);
    if (sourceContainerIndex !== -1 && updatedElements[sourceContainerIndex].childElements) {
      updatedElements[sourceContainerIndex] = {
        ...updatedElements[sourceContainerIndex],
        childElements: updatedElements[sourceContainerIndex].childElements?.filter(
          child => child.id !== element.id
        ) || []
      };
    }
  } else {
    // Element is standalone, remove it from the elements array
    const elementIndex = updatedElements.findIndex(el => el.id === element.id);
    if (elementIndex !== -1) {
      updatedElements.splice(elementIndex, 1);
    }
  }
  
  // Create a new element for the container
  const containerElement: EditorElement = {
    ...element,
    inContainer: true,
    parentId: containerId,
    style: {
      ...element.style,
      x: 10, // Position inside container with a small margin
      y: 10
    }
  };
  
  // Add the element to the container's childElements
  const containerChildElements = updatedElements[containerIndex].childElements || [];
  updatedElements[containerIndex] = {
    ...updatedElements[containerIndex],
    childElements: [...containerChildElements, containerElement]
  };
  
  // Update the state
  setElements(updatedElements);
  setSelectedElement(containerElement);
};
