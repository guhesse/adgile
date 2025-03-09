
import { EditorElement, BannerSize } from "../types";
import { toast } from "sonner";

// Link an element across all active sizes
export const linkElementsAcrossSizes = (
  element: EditorElement,
  elements: EditorElement[],
  selectedSize: BannerSize,
  activeSizes: BannerSize[]
): EditorElement[] => {
  if (!element || activeSizes.length <= 1) return elements;
  
  // Create a unique linked ID for this group of elements
  const linkedId = `linked-${Date.now()}`;
  
  // Convert the source element to percentage-based values
  const sourceElementWithPercentages = {
    ...element,
    style: {
      ...element.style,
    }
  };
  
  // Update the elements array with linked versions across all sizes
  const updatedElements = [...elements];
  
  // Find the element in the array and update it
  const sourceIndex = updatedElements.findIndex(el => el.id === element.id);
  if (sourceIndex !== -1) {
    updatedElements[sourceIndex] = {
      ...updatedElements[sourceIndex],
      linkedElementId: linkedId,
      style: {
        ...updatedElements[sourceIndex].style,
      }
    };
  }
  
  // Create clones for each other active size
  activeSizes.forEach(size => {
    // Skip the current size (source element's size)
    if (size.name === selectedSize.name) return;
    
    // Create a clone for this size
    const clone: EditorElement = {
      ...element,
      id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
      sizeId: size.name,
      linkedElementId: linkedId,
      style: {
        ...element.style,
        // Apply the percentage values to the new size
        // Calculate the absolute values for this size
        x: (element.style.xPercent! * size.width) / 100,
        y: (element.style.yPercent! * size.height) / 100,
        width: (element.style.widthPercent! * size.width) / 100,
        height: (element.style.heightPercent! * size.height) / 100
      }
    };
    
    // Add the clone to the elements array
    updatedElements.push(clone);
  });
  
  toast.success('Elemento vinculado em todos os tamanhos');
  return updatedElements;
};

// Unlink an element from its linked elements
export const unlinkElement = (
  element: EditorElement,
  elements: EditorElement[]
): EditorElement[] => {
  if (!element || !element.linkedElementId) return elements;
  
  // Make this element independently positionable
  const updatedElements = elements.map(el => {
    if (el.id === element.id) {
      return {
        ...el,
        linkedElementId: undefined,
        isIndividuallyPositioned: true
      };
    }
    return el;
  });
  
  toast.success('Elemento desvinculado');
  return updatedElements;
};

// Update all linked elements when one is modified
export const updateAllLinkedElements = (
  elements: EditorElement[],
  sourceElement: EditorElement,
  percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
  absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>,
  activeSizes: BannerSize[]
): EditorElement[] => {
  if (!sourceElement.linkedElementId) return elements;
  
  return elements.map(el => {
    // Update source element
    if (el.id === sourceElement.id) {
      return {
        ...el,
        style: {
          ...el.style,
          ...absoluteChanges,
          ...percentageChanges
        }
      };
    }
    
    // Update linked elements
    if (el.linkedElementId === sourceElement.linkedElementId && !el.isIndividuallyPositioned) {
      const size = activeSizes.find(size => size.name === el.sizeId);
      
      if (size) {
        // Calculate absolute values for this size
        const newAbsoluteValues: Record<string, number> = {};
        
        if (percentageChanges.xPercent !== undefined) {
          newAbsoluteValues.x = (percentageChanges.xPercent * size.width) / 100;
        }
        
        if (percentageChanges.yPercent !== undefined) {
          newAbsoluteValues.y = (percentageChanges.yPercent * size.height) / 100;
        }
        
        if (percentageChanges.widthPercent !== undefined) {
          newAbsoluteValues.width = (percentageChanges.widthPercent * size.width) / 100;
        }
        
        if (percentageChanges.heightPercent !== undefined) {
          newAbsoluteValues.height = (percentageChanges.heightPercent * size.height) / 100;
        }
        
        return {
          ...el,
          style: {
            ...el.style,
            ...newAbsoluteValues,
            ...percentageChanges
          }
        };
      }
    }
    
    return el;
  });
};

// Create linked versions of an element for all active sizes
export const createLinkedVersions = (
  element: EditorElement,
  activeSizes: BannerSize[],
  selectedSize: BannerSize
): EditorElement[] => {
  const linkedElements: EditorElement[] = [];
  const linkedId = `linked-${Date.now()}`;
  
  // Update the original element with the linked ID
  const updatedElement = {
    ...element,
    linkedElementId: linkedId
  };
  
  linkedElements.push(updatedElement);
  
  // Create linked elements for other sizes
  activeSizes.forEach(size => {
    // Skip the current size
    if (size.name === selectedSize.name) return;
    
    // Calculate absolute values for this size
    const newX = (element.style.xPercent! * size.width) / 100;
    const newY = (element.style.yPercent! * size.height) / 100;
    const newWidth = (element.style.widthPercent! * size.width) / 100;
    const newHeight = (element.style.heightPercent! * size.height) / 100;
    
    let linkedElement: EditorElement;
    
    if (element.type === 'layout') {
      linkedElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        },
        childElements: element.childElements?.map(child => ({
          ...child,
          id: `${child.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
          parentId: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
          sizeId: size.name
        }))
      };
    } else {
      linkedElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        }
      };
    }
    
    linkedElements.push(linkedElement);
  });
  
  return linkedElements;
};
