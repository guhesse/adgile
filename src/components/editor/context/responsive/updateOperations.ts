
import { EditorElement, BannerSize } from "../../types";
import { applyConstraintBasedPositioning } from "../../utils/grid/positionUtils";

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
  let { horizontalConstraint, verticalConstraint } = 
    { horizontalConstraint: sourceElement.style.constraintHorizontal, 
      verticalConstraint: sourceElement.style.constraintVertical };
  
  if (!horizontalConstraint || !verticalConstraint) {
    const { analyzeElementPosition } = require('../../utils/grid/responsivePosition');
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
