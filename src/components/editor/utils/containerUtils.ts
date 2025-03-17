
import { toast } from "sonner";
import { EditorElement } from "../types";

export const moveElementToContainer = (
  element: EditorElement,
  containerId: string,
  elements: EditorElement[],
  setElements: (elements: EditorElement[]) => void,
  setSelectedElement: (element: EditorElement | null) => void
) => {
  const container = elements.find(el => el.id === containerId);
  if (!container) return;

  const updatedElements = [...elements];

  if (element.inContainer && element.parentId) {
    const oldParentIndex = updatedElements.findIndex(el => el.id === element.parentId);
    if (oldParentIndex !== -1 && updatedElements[oldParentIndex].childElements) {
      updatedElements[oldParentIndex] = {
        ...updatedElements[oldParentIndex],
        childElements: updatedElements[oldParentIndex].childElements?.filter(child => child.id !== element.id) || []
      };
    }
  } else {
    const elementIndex = updatedElements.findIndex(el => el.id === element.id);
    if (elementIndex !== -1) {
      updatedElements.splice(elementIndex, 1);
    }
  }

  const containerIndex = updatedElements.findIndex(el => el.id === containerId);
  if (containerIndex === -1) return;

  const relativeX = Math.max(0, element.style.x - container.style.x);
  const relativeY = Math.max(0, element.style.y - container.style.y);

  const adjustedX = Math.min(relativeX, container.style.width - element.style.width);
  const adjustedY = Math.max(0, Math.min(relativeY, container.style.height - element.style.height));

  const xPercent = (adjustedX / container.style.width) * 100;
  const yPercent = (adjustedY / container.style.height) * 100;

  const childElements = updatedElements[containerIndex].childElements || [];

  const newElement = {
    ...element,
    inContainer: true,
    parentId: containerId,
    style: {
      ...element.style,
      x: adjustedX,
      y: adjustedY,
      xPercent,
      yPercent
    }
  };

  updatedElements[containerIndex] = {
    ...updatedElements[containerIndex],
    childElements: [
      ...childElements,
      newElement
    ]
  };

  setElements(updatedElements);
  setSelectedElement(newElement);
  
  toast.success('Elemento adicionado ao container');
};

export const moveElementOutOfContainer = (
  element: EditorElement,
  elements: EditorElement[],
  setElements: (elements: EditorElement[]) => void,
  setSelectedElement: (element: EditorElement | null) => void
) => {
  if (!element.inContainer || !element.parentId) return;

  const parentContainer = elements.find(el => el.id === element.parentId);
  if (!parentContainer) return;

  const absoluteX = parentContainer.style.x + element.style.x;
  const absoluteY = parentContainer.style.y + element.style.y;

  const newElements = [...elements];

  const parentIndex = newElements.findIndex(el => el.id === element.parentId);
  if (parentIndex !== -1 && newElements[parentIndex].childElements) {
    newElements[parentIndex] = {
      ...newElements[parentIndex],
      childElements: newElements[parentIndex].childElements?.filter(child => child.id !== element.id) || []
    };
  }

  const standaloneElement = {
    ...element,
    inContainer: false,
    parentId: undefined,
    style: {
      ...element.style,
      x: absoluteX,
      y: absoluteY
    }
  };

  newElements.push(standaloneElement);
  setElements(newElements);
  setSelectedElement(standaloneElement);
  
  toast.success('Elemento removido do container');
};

// Updated function to constrain element to artboard with some allowed overflow
export const constrainElementToArtboard = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  // If the element is in a container, don't apply constraints directly
  if (element.inContainer) return element;
  
  // Allow some overflow for elements on the artboard
  const overflowAllowance = 20; // Allow elements to go 20px outside the artboard
  
  let newX = element.style.x;
  let newY = element.style.y;
  
  // Check if the element is too far outside the horizontal bounds
  if (newX < -overflowAllowance) {
    newX = -overflowAllowance;
  } else if (newX + element.style.width > canvasWidth + overflowAllowance) {
    newX = canvasWidth + overflowAllowance - element.style.width;
  }
  
  // Check if the element is too far outside the vertical bounds
  if (newY < -overflowAllowance) {
    newY = -overflowAllowance;
  } else if (newY + element.style.height > canvasHeight + overflowAllowance) {
    newY = canvasHeight + overflowAllowance - element.style.height;
  }
  
  // If no changes needed, return the original element
  if (newX === element.style.x && newY === element.style.y) {
    return element;
  }
  
  // Update percentages along with absolute positions
  const xPercent = (newX / canvasWidth) * 100;
  const yPercent = (newY / canvasHeight) * 100;
  
  return {
    ...element,
    style: {
      ...element.style,
      x: newX,
      y: newY,
      xPercent,
      yPercent
    }
  };
};

// Updated function to check if element is too far outside the artboard
export const isElementOutOfBounds = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  const overflowAllowance = 30; // Slightly larger than the constraint allowance
  
  // Element is out of bounds if it's completely outside the artboard plus allowance
  const isOutHorizontally = 
    element.style.x + element.style.width < -overflowAllowance || 
    element.style.x > canvasWidth + overflowAllowance;
  
  const isOutVertically = 
    element.style.y + element.style.height < -overflowAllowance || 
    element.style.y > canvasHeight + overflowAllowance;
  
  return isOutHorizontally || isOutVertically;
};

// Updated function to apply constraints to all elements
export const constrainAllElements = (
  elements: EditorElement[],
  canvasWidth: number,
  canvasHeight: number
): EditorElement[] => {
  return elements.map(element => {
    // If the element has children, apply constraints to the parent first
    if (element.childElements && element.childElements.length > 0) {
      const constrainedParent = constrainElementToArtboard(element, canvasWidth, canvasHeight);
      
      // We don't need to constrain children as they're positioned relative to their parent
      return {
        ...constrainedParent,
        childElements: element.childElements
      };
    }
    
    // For standalone elements
    return constrainElementToArtboard(element, canvasWidth, canvasHeight);
  });
};
