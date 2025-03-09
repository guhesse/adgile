
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
