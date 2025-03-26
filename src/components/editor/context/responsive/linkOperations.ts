import { EditorElement, BannerSize } from "../../types";
import { analyzeElementPosition, applyTransformationMatrix } from "../../utils/grid/responsivePosition";
import { toast } from "sonner";

/**
 * Links elements across different sizes
 */
export const linkElementsAcrossSizes = (
  elements: EditorElement[],
  elementId: string,
  activeSizes: BannerSize[]
): EditorElement[] => {
  // Find the source element
  const sourceElement = elements.find(el => el.id === elementId);
  if (!sourceElement) {
    toast.error("Could not find source element");
    return elements;
  }
  
  // Generate a unique linked ID
  const linkedId = `linked-${Date.now()}`;
  
  // Find the source size
  const sourceSize = activeSizes.find(size => size.name === sourceElement.sizeId);
  if (!sourceSize) {
    toast.error("Could not determine source size");
    return elements;
  }
  
  // Analyze element position to determine constraints
  const { horizontalConstraint, verticalConstraint } = analyzeElementPosition(sourceElement, sourceSize);
  
  // Calculate percentage values for the source element
  const xPercent = (sourceElement.style.x / sourceSize.width) * 100;
  const yPercent = (sourceElement.style.y / sourceSize.height) * 100;
  const widthPercent = (sourceElement.style.width / sourceSize.width) * 100;
  const heightPercent = (sourceElement.style.height / sourceSize.height) * 100;
  
  // Create a new array of elements with the source element updated
  let updatedElements = elements.map(el => {
    if (el.id === sourceElement.id) {
      return {
        ...el,
        linkedElementId: linkedId,
        style: {
          ...el.style,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent,
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        }
      };
    }
    return el;
  });
  
  // Create linked versions for each other size
  activeSizes
    .filter(size => size.name !== sourceElement.sizeId)
    .forEach(targetSize => {
      // Apply transformations using matrix transformation
      const { x, y, width, height } = applyTransformationMatrix(
        {
          ...sourceElement,
          style: {
            ...sourceElement.style,
            constraintHorizontal: horizontalConstraint,
            constraintVertical: verticalConstraint
          }
        },
        sourceSize,
        targetSize
      );
      
      // Calculate percentage values for the target size
      const targetXPercent = (x / targetSize.width) * 100;
      const targetYPercent = (y / targetSize.height) * 100;
      const targetWidthPercent = (width / targetSize.width) * 100;
      const targetHeightPercent = (height / targetSize.height) * 100;
      
      // Adjust font size for text elements based on size change
      let fontSize = sourceElement.style.fontSize;
      if (sourceElement.type === 'text' && fontSize) {
        const fontScaleFactor = Math.min(targetSize.width / sourceSize.width, targetSize.height / sourceSize.height);
        fontSize = fontSize * fontScaleFactor;
        // Ensure minimum readable size
        fontSize = Math.max(fontSize, 9);
      }
      
      // Create new element ID for the linked version
      const newId = `${sourceElement.id}-${targetSize.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Create the linked element
      const linkedElement: EditorElement = {
        ...sourceElement,
        id: newId,
        sizeId: targetSize.name,
        linkedElementId: linkedId,
        style: {
          ...sourceElement.style,
          x,
          y,
          width,
          height,
          fontSize,
          xPercent: targetXPercent,
          yPercent: targetYPercent,
          widthPercent: targetWidthPercent,
          heightPercent: targetHeightPercent,
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        }
      };
      
      // Add the linked element to the updated elements array
      updatedElements.push(linkedElement);
    });
  
  return updatedElements;
};

/**
 * Unlinking an element from its linked versions
 */
export const unlinkElement = (
  elements: EditorElement[],
  elementId: string
): EditorElement[] => {
  // Find the element to unlink
  const element = elements.find(el => el.id === elementId);
  if (!element || !element.linkedElementId) {
    return elements;
  }
  
  // Update all linked elements to remove the linkedElementId
  return elements.map(el => {
    if (el.linkedElementId === element.linkedElementId) {
      // Remove the linkedElementId but keep position and constraint data
      return {
        ...el,
        linkedElementId: undefined,
        isIndividuallyPositioned: false
      };
    }
    return el;
  });
};
