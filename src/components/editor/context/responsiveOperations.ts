
import { EditorElement, BannerSize } from "../types";
import { toast } from "sonner";
import { calculateSmartPosition } from "../utils/grid/responsivePosition";

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
  
  // Calculate percentage values for the source element
  const xPercent = (element.style.x / selectedSize.width) * 100;
  const yPercent = (element.style.y / selectedSize.height) * 100;
  const widthPercent = (element.style.width / selectedSize.width) * 100;
  const heightPercent = (element.style.height / selectedSize.height) * 100;
  
  // Update the elements array with linked versions across all sizes
  const updatedElements = [...elements];
  
  // Find the element in the array and update it with percentage values
  const sourceIndex = updatedElements.findIndex(el => el.id === element.id);
  if (sourceIndex !== -1) {
    updatedElements[sourceIndex] = {
      ...updatedElements[sourceIndex],
      linkedElementId: linkedId,
      style: {
        ...updatedElements[sourceIndex].style,
        xPercent,
        yPercent,
        widthPercent,
        heightPercent
      }
    };
  }
  
  // Create clones for each other active size - only if independent mode is NOT active
  const independentMode = localStorage.getItem('responsiveMode') === 'independent';
  
  if (!independentMode) {
    activeSizes.forEach(size => {
      // Skip the current size (source element's size)
      if (size.name === selectedSize.name) return;
      
      // Calculate position and size for this specific canvas size
      const { x, y, width, height } = calculateSmartPosition(element, selectedSize, size);
      
      // Create a clone for this size
      const clone: EditorElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          x,
          y,
          width,
          height,
          // Store percentage values
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
        }
      };
      
      // Add the clone to the elements array
      updatedElements.push(clone);
    });
    
    toast.success('Elemento vinculado em todos os tamanhos');
  } else {
    toast.info('Elementos independentes - sem vinculação automática');
  }
  
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
  
  // Check if in independent mode
  const independentMode = localStorage.getItem('responsiveMode') === 'independent';
  if (independentMode) {
    // In independent mode, only update the source element
    return elements.map(el => {
      if (el.id === sourceElement.id) {
        return {
          ...el,
          style: {
            ...el.style,
            ...absoluteChanges
          }
        };
      }
      return el;
    });
  }
  
  // Find source size
  const sourceSize = activeSizes.find(size => size.name === sourceElement.sizeId) || activeSizes[0];
  
  // If we have absolute changes, calculate the corresponding percentage changes
  const calculatedPercentChanges = { ...percentageChanges };
  
  if (absoluteChanges.x !== undefined) {
    calculatedPercentChanges.xPercent = (absoluteChanges.x / sourceSize.width) * 100;
  }
  
  if (absoluteChanges.y !== undefined) {
    calculatedPercentChanges.yPercent = (absoluteChanges.y / sourceSize.height) * 100;
  }
  
  if (absoluteChanges.width !== undefined) {
    calculatedPercentChanges.widthPercent = (absoluteChanges.width / sourceSize.width) * 100;
  }
  
  if (absoluteChanges.height !== undefined) {
    calculatedPercentChanges.heightPercent = (absoluteChanges.height / sourceSize.height) * 100;
  }
  
  return elements.map(el => {
    // Update source element
    if (el.id === sourceElement.id) {
      return {
        ...el,
        style: {
          ...el.style,
          ...absoluteChanges,
          ...calculatedPercentChanges
        }
      };
    }
    
    // Update linked elements
    if (el.linkedElementId === sourceElement.linkedElementId && !el.isIndividuallyPositioned) {
      const size = activeSizes.find(size => size.name === el.sizeId);
      
      if (size) {
        // Calculate absolute values for this size based on percentage
        const newAbsoluteValues: Record<string, number> = {};
        
        if (calculatedPercentChanges.xPercent !== undefined) {
          newAbsoluteValues.x = (calculatedPercentChanges.xPercent * size.width) / 100;
        }
        
        if (calculatedPercentChanges.yPercent !== undefined) {
          newAbsoluteValues.y = (calculatedPercentChanges.yPercent * size.height) / 100;
        }
        
        if (calculatedPercentChanges.widthPercent !== undefined) {
          newAbsoluteValues.width = (calculatedPercentChanges.widthPercent * size.width) / 100;
        }
        
        if (calculatedPercentChanges.heightPercent !== undefined) {
          newAbsoluteValues.height = (calculatedPercentChanges.heightPercent * size.height) / 100;
        }
        
        return {
          ...el,
          style: {
            ...el.style,
            ...newAbsoluteValues,
            ...calculatedPercentChanges
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
  
  // Check if in independent mode
  const independentMode = localStorage.getItem('responsiveMode') === 'independent';
  
  // Calculate percentage values for the source element
  const xPercent = (element.style.x / selectedSize.width) * 100;
  const yPercent = (element.style.y / selectedSize.height) * 100;
  const widthPercent = (element.style.width / selectedSize.width) * 100;
  const heightPercent = (element.style.height / selectedSize.height) * 100;
  
  // Update the original element with the linked ID and percentage values
  const updatedElement = {
    ...element,
    linkedElementId: independentMode ? undefined : linkedId,
    style: {
      ...element.style,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent
    }
  };
  
  linkedElements.push(updatedElement);
  
  // If independent mode is active, don't create linked elements
  if (independentMode) {
    return linkedElements;
  }
  
  // Create linked elements for other sizes
  activeSizes.forEach(size => {
    // Skip the current size
    if (size.name === selectedSize.name) return;
    
    // Use calculateSmartPosition to get proper positioning based on percentages
    const { x, y, width, height } = calculateSmartPosition(
      {
        ...element,
        style: {
          ...element.style,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
        }
      },
      selectedSize,
      size
    );
    
    let linkedElement: EditorElement;
    
    if (element.type === 'layout') {
      linkedElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          x,
          y,
          width,
          height,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
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
          x,
          y,
          width,
          height,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
        }
      };
    }
    
    linkedElements.push(linkedElement);
  });
  
  return linkedElements;
};
