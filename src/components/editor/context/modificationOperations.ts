
import { EditorElement } from "../types";

// Function to remove an element
export const removeElement = (
  elementId: string,
  elements: EditorElement[],
  selectedElement: EditorElement | null,
  editingMode: 'global' | 'individual'
): {
  updatedElements: EditorElement[];
  newSelectedElement: EditorElement | null;
} => {
  const elementToRemove = elements.find(el => el.id === elementId);
  if (!elementToRemove) {
    return { updatedElements: elements, newSelectedElement: selectedElement };
  }
  
  let newElements = [...elements];
  
  // If the element is linked, ask if user wants to remove all linked instances
  if (elementToRemove.linkedElementId && editingMode === 'global') {
    const linkedIds = elements
      .filter(el => el.linkedElementId === elementToRemove.linkedElementId)
      .map(el => el.id);
    
    // Remove all linked elements
    newElements = newElements.map(el => {
      if (el.childElements) {
        el.childElements = el.childElements.filter(child => !linkedIds.includes(child.id));
      }
      return el;
    }).filter(el => !linkedIds.includes(el.id));
  } else {
    // Just remove this element
    newElements = newElements.map(el => {
      if (el.childElements) {
        el.childElements = el.childElements.filter(child => child.id !== elementId);
      }
      return el;
    }).filter(el => el.id !== elementId);
  }
  
  const newSelectedElement = selectedElement?.id === elementId ? null : selectedElement;
  
  return { 
    updatedElements: newElements, 
    newSelectedElement 
  };
};

// Function to update element style
export const updateElementStyle = (
  property: string,
  value: any,
  selectedElement: EditorElement | null,
  elements: EditorElement[],
  editingMode: 'global' | 'individual'
): {
  updatedElements: EditorElement[];
  updatedSelectedElement: EditorElement | null;
} => {
  if (!selectedElement) {
    return { updatedElements: elements, updatedSelectedElement: selectedElement };
  }

  let updatedElements = [...elements];
  
  // If editing linked element in global mode, update all linked elements
  if (editingMode === 'global' && selectedElement.linkedElementId) {
    const linkedElementIds = elements
      .filter(el => el.linkedElementId === selectedElement.linkedElementId)
      .map(el => el.id);
    
    // Update each linked element
    updatedElements = updatedElements.map(el => {
      // Update standalone elements
      if (linkedElementIds.includes(el.id) && !el.isIndividuallyPositioned) {
        return { ...el, style: { ...el.style, [property]: value } };
      }
      
      // Update elements in containers
      if (el.childElements) {
        return {
          ...el,
          childElements: el.childElements.map(child =>
            linkedElementIds.includes(child.id) && !child.isIndividuallyPositioned
              ? { ...child, style: { ...child.style, [property]: value } }
              : child
          )
        };
      }
      
      return el;
    });
  } else {
    // Update just the selected element
    if (!selectedElement.inContainer) {
      updatedElements = updatedElements.map(el =>
        el.id === selectedElement.id
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      );
    } else {
      updatedElements = updatedElements.map(el => {
        if (el.childElements && el.id === selectedElement.parentId) {
          return {
            ...el,
            childElements: el.childElements.map(child =>
              child.id === selectedElement.id
                ? { ...child, style: { ...child.style, [property]: value } }
                : child
            )
          };
        }
        return el;
      });
    }
  }
  
  const updatedSelectedElement = { 
    ...selectedElement, 
    style: { ...selectedElement.style, [property]: value } 
  };
  
  return { 
    updatedElements, 
    updatedSelectedElement 
  };
};

// Function to update element content
export const updateElementContent = (
  content: string,
  selectedElement: EditorElement | null,
  elements: EditorElement[],
  editingMode: 'global' | 'individual'
): {
  updatedElements: EditorElement[];
  updatedSelectedElement: EditorElement | null;
} => {
  if (!selectedElement) {
    return { updatedElements: elements, updatedSelectedElement: selectedElement };
  }

  let updatedElements = [...elements];
  
  // If editing linked element in global mode, update all linked elements
  if (editingMode === 'global' && selectedElement.linkedElementId) {
    const linkedElementIds = elements
      .filter(el => el.linkedElementId === selectedElement.linkedElementId)
      .map(el => el.id);
    
    // Update each linked element
    updatedElements = updatedElements.map(el => {
      // Update standalone elements
      if (linkedElementIds.includes(el.id)) {
        return { ...el, content };
      }
      
      // Update elements in containers
      if (el.childElements) {
        return {
          ...el,
          childElements: el.childElements.map(child =>
            linkedElementIds.includes(child.id)
              ? { ...child, content }
              : child
          )
        };
      }
      
      return el;
    });
  } else {
    // Update just the selected element
    if (!selectedElement.inContainer) {
      updatedElements = updatedElements.map(el =>
        el.id === selectedElement.id
          ? { ...el, content }
          : el
      );
    } else {
      updatedElements = updatedElements.map(el => {
        if (el.childElements && el.id === selectedElement.parentId) {
          return {
            ...el,
            childElements: el.childElements.map(child =>
              child.id === selectedElement.id
                ? { ...child, content }
                : child
            )
          };
        }
        return el;
      });
    }
  }
  
  const updatedSelectedElement = { 
    ...selectedElement, 
    content 
  };
  
  return { 
    updatedElements, 
    updatedSelectedElement 
  };
};

// Function for animation operations
export const animationOperations = {
  // Preview animation by incrementing the key
  handlePreviewAnimation: (key: number): number => {
    return key + 1;
  },
  
  // Toggle play/pause state
  togglePlayPause: (
    isPlaying: boolean,
    elements: EditorElement[]
  ): {
    newIsPlaying: boolean,
    updatedElements: EditorElement[]
  } => {
    const newIsPlaying = !isPlaying;
    const updatedElements = elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: isPlaying ? "paused" : "running"
      }
    }));
    
    return { newIsPlaying, updatedElements };
  },
  
  // Update animations based on timeline
  updateAnimations: (
    time: number,
    elements: EditorElement[]
  ): EditorElement[] => {
    return elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: "paused",
        animationDelay: time * -1
      }
    }));
  }
};
