import { EditorElement, BannerSize } from "../types";

// Function to remove an element
export const removeElement = (
  elementId: string,
  elements: EditorElement[],
  selectedElement: EditorElement | null,
  editingMode: 'global' | 'individual'
) => {
  let updatedElements = [...elements];
  const elementToRemove = updatedElements.find(el => el.id === elementId);
  
  if (!elementToRemove) {
    return { updatedElements, newSelectedElement: selectedElement };
  }
  
  // If in global mode, remove all linked elements with the same linkedElementId
  if (editingMode === 'global' && elementToRemove.linkedElementId) {
    updatedElements = updatedElements.filter(
      el => el.linkedElementId !== elementToRemove.linkedElementId
    );
  } else {
    // Only remove the specific element
    updatedElements = updatedElements.filter(el => el.id !== elementId);
  }
  
  // If the removed element was selected, clear the selection
  const newSelectedElement = 
    selectedElement && (selectedElement.id === elementId || 
      (editingMode === 'global' && elementToRemove.linkedElementId && 
       selectedElement.linkedElementId === elementToRemove.linkedElementId))
      ? null
      : selectedElement;
  
  return { updatedElements, newSelectedElement };
};

// Function to update element style
export const updateElementStyle = (
  property: string,
  value: any,
  selectedElement: EditorElement | null,
  elements: EditorElement[],
  editingMode: 'global' | 'individual'
) => {
  if (!selectedElement) {
    return { updatedElements: elements, updatedSelectedElement: null };
  }

  let updatedElements = [...elements];
  let updatedSelectedElement: EditorElement | null = null;

  // If in global mode AND the element has a linkedElementId, update all linked elements
  if (editingMode === 'global' && selectedElement.linkedElementId) {
    updatedElements = elements.map(el => {
      if (el.linkedElementId === selectedElement.linkedElementId) {
        const updatedElement = {
          ...el,
          style: {
            ...el.style,
            [property]: value
          }
        };
        
        // Keep reference to the updated selected element
        if (el.id === selectedElement.id) {
          updatedSelectedElement = updatedElement;
        }
        
        return updatedElement;
      }
      return el;
    });
  } else {
    // In individual mode or if element doesn't have linkedElementId, only update the selected element
    updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        const updatedElement = {
          ...el,
          style: {
            ...el.style,
            [property]: value
          }
        };
        
        updatedSelectedElement = updatedElement;
        return updatedElement;
      }
      return el;
    });
  }

  return { 
    updatedElements, 
    updatedSelectedElement: updatedSelectedElement || selectedElement 
  };
};

// Function to update element content
export const updateElementContent = (
  content: string,
  selectedElement: EditorElement | null,
  elements: EditorElement[],
  editingMode: 'global' | 'individual'
) => {
  if (!selectedElement) {
    return { updatedElements: elements, updatedSelectedElement: null };
  }

  let updatedElements = [...elements];
  let updatedSelectedElement: EditorElement | null = null;

  // If in global mode AND the element has a linkedElementId, update all linked elements
  if (editingMode === 'global' && selectedElement.linkedElementId) {
    updatedElements = elements.map(el => {
      if (el.linkedElementId === selectedElement.linkedElementId) {
        const updatedElement = {
          ...el,
          content
        };
        
        // Keep reference to the updated selected element
        if (el.id === selectedElement.id) {
          updatedSelectedElement = updatedElement;
        }
        
        return updatedElement;
      }
      return el;
    });
  } else {
    // In individual mode or if element doesn't have linkedElementId, only update the selected element
    updatedElements = elements.map(el => {
      if (el.id === selectedElement.id) {
        const updatedElement = {
          ...el,
          content
        };
        
        updatedSelectedElement = updatedElement;
        return updatedElement;
      }
      return el;
    });
  }

  return { 
    updatedElements, 
    updatedSelectedElement: updatedSelectedElement || selectedElement 
  };
};

// Animation operations
export const animationOperations = {
  // Toggle play/pause for animations
  togglePlayPause: (isPlaying: boolean, elements: EditorElement[]) => {
    const newIsPlaying = !isPlaying;
    
    // Update the animation play state for all elements
    const updatedElements = elements.map(element => {
      return {
        ...element,
        style: {
          ...element.style,
          animationPlayState: newIsPlaying ? "running" as const : "paused" as const
        }
      };
    });
    
    return { newIsPlaying, updatedElements };
  },
  
  // Handle animation preview
  handlePreviewAnimation: (key: number) => {
    return key + 1; // Increment the key to force re-render
  },
  
  // Update animations based on timeline position
  updateAnimations: (time: number, elements: EditorElement[]) => {
    // Here you could implement logic to update animations based on the timeline position
    // For now, just returning the elements unchanged
    return elements;
  }
};
