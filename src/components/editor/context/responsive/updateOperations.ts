import { EditorElement, BannerSize } from "../../types";
import { applyTransformationMatrix } from "../../utils/grid/responsivePosition";
import { analyzeElementPosition } from "../../utils/grid/responsivePosition";

/**
 * Updates all linked elements when one is modified
 */
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
  let horizontalConstraint = sourceElement.style.constraintHorizontal;
  let verticalConstraint = sourceElement.style.constraintVertical;
  
  if (!horizontalConstraint || !verticalConstraint) {
    const constraints = analyzeElementPosition(sourceElement, sourceSize);
    horizontalConstraint = horizontalConstraint || constraints.horizontalConstraint;
    verticalConstraint = verticalConstraint || constraints.verticalConstraint;
  }
  
  // Create a source element with the changes applied for transformation calculations
  const updatedSourceElement = {
    ...sourceElement,
    style: {
      ...sourceElement.style,
      ...absoluteChanges,
      xPercent: calculatedPercentChanges.xPercent !== undefined ? calculatedPercentChanges.xPercent : sourceElement.style.xPercent,
      yPercent: calculatedPercentChanges.yPercent !== undefined ? calculatedPercentChanges.yPercent : sourceElement.style.yPercent,
      widthPercent: calculatedPercentChanges.widthPercent !== undefined ? calculatedPercentChanges.widthPercent : sourceElement.style.widthPercent,
      heightPercent: calculatedPercentChanges.heightPercent !== undefined ? calculatedPercentChanges.heightPercent : sourceElement.style.heightPercent,
      constraintHorizontal: horizontalConstraint,
      constraintVertical: verticalConstraint
    }
  };
  
  return elements.map(el => {
    // Update source element
    if (el.id === sourceElement.id) {
      return updatedSourceElement;
    }
    
    // Update linked elements
    if (el.linkedElementId === sourceElement.linkedElementId && el.linkedElementId && !el.isIndividuallyPositioned) {
      const targetSize = activeSizes.find(size => size.name === el.sizeId);
      
      if (targetSize) {
        // Apply transformation using responsive algorithm
        const transformedStyle = applyTransformationMatrix(
          updatedSourceElement, 
          sourceSize, 
          targetSize
        );
        
        // Calculate new percentage values
        const xPercent = (transformedStyle.x / targetSize.width) * 100;
        const yPercent = (transformedStyle.y / targetSize.height) * 100;
        const widthPercent = (transformedStyle.width / targetSize.width) * 100;
        const heightPercent = (transformedStyle.height / targetSize.height) * 100;
        
        // Return the transformed element, keeping all other properties from the original element
        return {
          ...el,
          style: {
            ...el.style,
            x: transformedStyle.x,
            y: transformedStyle.y,
            width: transformedStyle.width,
            height: transformedStyle.height,
            xPercent,
            yPercent,
            widthPercent,
            heightPercent,
            constraintHorizontal: horizontalConstraint,
            constraintVertical: verticalConstraint,
            // If this is a text element, adjust font size in proportion
            fontSize: sourceElement.type === 'text' && sourceElement.style.fontSize 
              ? sourceElement.style.fontSize * (transformedStyle.width / updatedSourceElement.style.width)
              : el.style.fontSize
          }
        };
      }
    }
    
    return el;
  });
};
