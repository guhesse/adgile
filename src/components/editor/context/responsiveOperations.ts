
import { EditorElement, BannerSize } from "../types";
import { toast } from "sonner";
import { calculateSmartPosition, analyzeElementPosition } from "../utils/grid/responsivePosition";
import { applyConstraintBasedPositioning } from "../utils/grid/positionUtils";

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
  
  // Analyze element's position to determine appropriate constraints
  const { horizontalConstraint, verticalConstraint } = analyzeElementPosition(element, selectedSize);
  
  // Update the elements array with linked versions across all sizes
  const updatedElements = [...elements];
  
  // Find the element in the array and update it with percentage values and constraints
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
        heightPercent,
        constraintHorizontal: horizontalConstraint as any,
        constraintVertical: verticalConstraint as any
      }
    };
  }
  
  // Create clones for each other active size
  activeSizes.forEach(size => {
    // Skip the current size (source element's size)
    if (size.name === selectedSize.name) return;
    
    // Calculate position and size for this specific canvas size using constraints
    const { x, y, width, height } = calculateSmartPosition({
      ...element,
      style: {
        ...element.style,
        constraintHorizontal: horizontalConstraint as any,
        constraintVertical: verticalConstraint as any
      }
    }, selectedSize, size);
    
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
        heightPercent,
        // Store constraints for responsive positioning
        constraintHorizontal: horizontalConstraint as any,
        constraintVertical: verticalConstraint as any
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
  
  // Analyze element position to determine constraints if they're not already set
  let { horizontalConstraint, verticalConstraint } = 
    { horizontalConstraint: sourceElement.style.constraintHorizontal, 
      verticalConstraint: sourceElement.style.constraintVertical };
  
  if (!horizontalConstraint || !verticalConstraint) {
    const constraints = analyzeElementPosition(sourceElement, sourceSize);
    horizontalConstraint = horizontalConstraint || constraints.horizontalConstraint as any;
    verticalConstraint = verticalConstraint || constraints.verticalConstraint as any;
  }
  
  return elements.map(el => {
    // Update source element
    if (el.id === sourceElement.id) {
      return {
        ...el,
        style: {
          ...el.style,
          ...absoluteChanges,
          ...calculatedPercentChanges,
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        }
      };
    }
    
    // Update linked elements
    if (el.linkedElementId === sourceElement.linkedElementId && !el.isIndividuallyPositioned) {
      const targetSize = activeSizes.find(size => size.name === el.sizeId);
      
      if (targetSize) {
        // Apply transformation using constraints
        const { x, y, width, height } = applyConstraintBasedPositioning({
          ...sourceElement,
          style: {
            ...sourceElement.style,
            ...absoluteChanges,
            constraintHorizontal: horizontalConstraint,
            constraintVertical: verticalConstraint
          }
        }, targetSize.width, targetSize.height);
        
        // Calculate new percentage values
        const xPercent = (x / targetSize.width) * 100;
        const yPercent = (y / targetSize.height) * 100;
        const widthPercent = (width / targetSize.width) * 100;
        const heightPercent = (height / targetSize.height) * 100;
        
        return {
          ...el,
          style: {
            ...el.style,
            x,
            y,
            width,
            height,
            xPercent,
            yPercent,
            widthPercent,
            heightPercent,
            constraintHorizontal: horizontalConstraint,
            constraintVertical: verticalConstraint
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
  
  // Calculate percentage values for the source element
  const xPercent = (element.style.x / selectedSize.width) * 100;
  const yPercent = (element.style.y / selectedSize.height) * 100;
  const widthPercent = (element.style.width / selectedSize.width) * 100;
  const heightPercent = (element.style.height / selectedSize.height) * 100;
  
  // Analyze element position to determine constraints
  const { horizontalConstraint, verticalConstraint } = analyzeElementPosition(element, selectedSize);
  
  // Update the original element with the linked ID, percentage values, and constraints
  const updatedElement = {
    ...element,
    linkedElementId: linkedId,
    style: {
      ...element.style,
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      constraintHorizontal: horizontalConstraint as any,
      constraintVertical: verticalConstraint as any
    }
  };
  
  linkedElements.push(updatedElement);
  
  // Create linked elements for other sizes
  activeSizes.forEach(size => {
    // Skip the current size
    if (size.name === selectedSize.name) return;
    
    // Use calculateSmartPosition to get proper positioning based on constraints
    const { x, y, width, height } = calculateSmartPosition(
      {
        ...element,
        style: {
          ...element.style,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent,
          constraintHorizontal: horizontalConstraint as any,
          constraintVertical: verticalConstraint as any
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
          heightPercent,
          constraintHorizontal: horizontalConstraint as any,
          constraintVertical: verticalConstraint as any
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
          heightPercent,
          constraintHorizontal: horizontalConstraint as any,
          constraintVertical: verticalConstraint as any
        }
      };
    }
    
    linkedElements.push(linkedElement);
  });
  
  return linkedElements;
};
