
import { EditorElement, BannerSize } from "../../types";
import { applyResponsiveTransformation } from "./constraintOperations";

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
  let { constraintHorizontal, constraintVertical } = 
    { constraintHorizontal: sourceElement.style.constraintHorizontal, 
      constraintVertical: sourceElement.style.constraintVertical };
  
  if (!constraintHorizontal || !constraintVertical) {
    const { analyzeElementPosition } = require('../../utils/grid/responsivePosition');
    const constraints = analyzeElementPosition(sourceElement, sourceSize);
    constraintHorizontal = constraintHorizontal || constraints.horizontalConstraint;
    constraintVertical = constraintVertical || constraints.verticalConstraint;
  }
  
  // Special considerations for different element types
  if (sourceElement.type === 'image' && !constraintVertical) {
    // Check if image is at the bottom
    const bottomDistance = sourceSize.height - (sourceElement.style.y + sourceElement.style.height);
    if (bottomDistance < 20) {
      constraintVertical = 'bottom';
    }
  }
  
  if (sourceElement.type === 'button' && !constraintHorizontal && !constraintVertical) {
    // Check if button is at bottom-right
    const rightDistance = sourceSize.width - (sourceElement.style.x + sourceElement.style.width);
    const bottomDistance = sourceSize.height - (sourceElement.style.y + sourceElement.style.height);
    
    if (rightDistance < 20) {
      constraintHorizontal = 'right';
    }
    
    if (bottomDistance < 20) {
      constraintVertical = 'bottom';
    }
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
          constraintHorizontal: constraintHorizontal,
          constraintVertical: constraintVertical
        }
      };
    }
    
    // Update linked elements
    if (el.linkedElementId === sourceElement.linkedElementId && !el.isIndividuallyPositioned) {
      const targetSize = activeSizes.find(size => size.name === el.sizeId);
      
      if (targetSize) {
        // Create a source element with the changes applied
        const updatedSourceElement = {
          ...sourceElement,
          style: {
            ...sourceElement.style,
            ...absoluteChanges,
            constraintHorizontal: constraintHorizontal,
            constraintVertical: constraintVertical
          }
        };
        
        // Apply transformation using responsive algorithm
        const transformedElement = applyResponsiveTransformation(
          updatedSourceElement, 
          sourceSize, 
          targetSize
        );
        
        // Return the transformed element, keeping all other properties from the original element
        return {
          ...el,
          style: {
            ...el.style,
            ...transformedElement.style
          }
        };
      }
    }
    
    return el;
  });
};
