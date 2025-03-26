
import { EditorElement, BannerSize } from "../../types";
import { toast } from "sonner";
import { analyzeElementPosition, calculateSmartPosition } from "../../utils/grid/responsivePosition";

/**
 * Links an element across all active sizes
 */
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

/**
 * Unlinks an element from its linked elements
 */
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
