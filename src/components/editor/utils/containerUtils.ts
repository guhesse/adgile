
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

// Nova função para manter elementos dentro dos limites da artboard
export const constrainElementToArtboard = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  // Se o elemento estiver em um container, não aplicamos restrições diretamente
  if (element.inContainer) return element;
  
  let newX = element.style.x;
  let newY = element.style.y;
  
  // Verificar se o elemento está fora dos limites horizontais
  if (newX < 0) {
    newX = 0;
  } else if (newX + element.style.width > canvasWidth) {
    newX = Math.max(0, canvasWidth - element.style.width);
  }
  
  // Verificar se o elemento está fora dos limites verticais
  if (newY < 0) {
    newY = 0;
  } else if (newY + element.style.height > canvasHeight) {
    newY = Math.max(0, canvasHeight - element.style.height);
  }
  
  // Se não houve mudanças, retornar o elemento original
  if (newX === element.style.x && newY === element.style.y) {
    return element;
  }
  
  // Atualizar as porcentagens também
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

// Nova função para verificar se um elemento está completamente fora da artboard
export const isElementOutOfBounds = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  // Elemento está fora horizontalmente se estiver completamente à esquerda ou à direita
  const isOutHorizontally = 
    element.style.x + element.style.width < 0 || 
    element.style.x > canvasWidth;
  
  // Elemento está fora verticalmente se estiver completamente acima ou abaixo
  const isOutVertically = 
    element.style.y + element.style.height < 0 || 
    element.style.y > canvasHeight;
  
  return isOutHorizontally || isOutVertically;
};

// Nova função para aplicar restrições a todos os elementos
export const constrainAllElements = (
  elements: EditorElement[],
  canvasWidth: number,
  canvasHeight: number
): EditorElement[] => {
  return elements.map(element => {
    // Se o elemento tiver filhos, aplique restrições a eles também
    if (element.childElements && element.childElements.length > 0) {
      const constrainedChildren = element.childElements.map(child => {
        // Para filhos em containers, as coordenadas são relativas ao container
        // Então não precisamos aplicar restrições da artboard diretamente
        return child;
      });
      
      return {
        ...constrainElementToArtboard(element, canvasWidth, canvasHeight),
        childElements: constrainedChildren
      };
    }
    
    return constrainElementToArtboard(element, canvasWidth, canvasHeight);
  });
};
