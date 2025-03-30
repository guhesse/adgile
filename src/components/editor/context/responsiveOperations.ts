
import { EditorElement, BannerSize } from "../types";
import { toast } from "sonner";
import { calculateSmartPosition } from "../utils/grid/responsivePosition";

// Calculate responsive font size
const calculateResponsiveFontSize = (
  originalFontSize: number,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): number => {
  // This function follows a smart algorithm to scale text properly 
  // between different format sizes
  
  // Determine if formats are horizontal or vertical
  const isSourceHorizontal = sourceWidth > sourceHeight;
  const isTargetHorizontal = targetWidth > targetHeight;
  
  // Base scaling factors
  const widthRatio = targetWidth / sourceWidth;
  const heightRatio = targetHeight / sourceHeight;
  
  let scaleFactor = 1;
  
  if (isSourceHorizontal && isTargetHorizontal) {
    // Both horizontal - scale primarily based on width
    scaleFactor = widthRatio * 0.8 + heightRatio * 0.2;
  } else if (!isSourceHorizontal && !isTargetHorizontal) {
    // Both vertical - scale primarily based on height
    scaleFactor = heightRatio * 0.8 + widthRatio * 0.2;
  } else {
    // Mixed orientations - use a balanced approach
    scaleFactor = (widthRatio * 0.5) + (heightRatio * 0.5);
  }
  
  // Apply limits to prevent too small or too large text
  const minFontSize = 12;
  const maxFactor = 1.5;
  const minFactor = 0.7;
  
  // Constrain scale factor
  scaleFactor = Math.max(minFactor, Math.min(maxFactor, scaleFactor));
  
  // Calculate and round new font size
  let newFontSize = Math.round(originalFontSize * scaleFactor);
  
  // Ensure minimum readable size
  newFontSize = Math.max(minFontSize, newFontSize);
  
  return newFontSize;
};

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
      
      // Calculate responsive font size if this is a text element
      let responsiveStyle: any = {};
      if (element.type === 'text' && element.style.fontSize) {
        const newFontSize = calculateResponsiveFontSize(
          element.style.fontSize,
          selectedSize.width,
          selectedSize.height,
          size.width,
          size.height
        );
        responsiveStyle.fontSize = newFontSize;
      }
      
      // Create a clone for this size
      const clone: EditorElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          ...responsiveStyle,
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
  
  // For font size changes, we need to calculate responsive sizes for each target format
  const hasFontSizeChange = absoluteChanges.fontSize !== undefined;
  const originalFontSize = hasFontSizeChange ? absoluteChanges.fontSize : sourceElement.style.fontSize;
  
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
        
        // Handle font size responsively if it changed
        if (hasFontSizeChange && originalFontSize) {
          newAbsoluteValues.fontSize = calculateResponsiveFontSize(
            originalFontSize,
            sourceSize.width,
            sourceSize.height,
            size.width,
            size.height
          );
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
    
    // Calculate responsive font size if this is a text element
    let responsiveStyle: any = {};
    if (element.type === 'text' && element.style.fontSize) {
      const newFontSize = calculateResponsiveFontSize(
        element.style.fontSize,
        selectedSize.width,
        selectedSize.height,
        size.width,
        size.height
      );
      responsiveStyle.fontSize = newFontSize;
    }
    
    let linkedElement: EditorElement;
    
    if (element.type === 'layout') {
      linkedElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          ...responsiveStyle,
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
          ...responsiveStyle,
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
