
import { EditorElement, BannerSize } from "../../types";
import { analyzeElementPosition, applyTransformationMatrix } from "../../utils/grid/responsivePosition";

/**
 * Creates linked versions of an element for all active sizes
 */
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
      constraintHorizontal: horizontalConstraint,
      constraintVertical: verticalConstraint
    }
  };
  
  linkedElements.push(updatedElement);
  
  // Create linked elements for other sizes
  activeSizes.forEach(size => {
    // Skip the current size
    if (size.name === selectedSize.name) return;
    
    // Apply transformations using the improved matrix transformation
    const { x, y, width, height } = applyTransformationMatrix(
      updatedElement,
      selectedSize,
      size
    );
    
    // Recalculate percentage values for the target size
    const targetXPercent = (x / size.width) * 100;
    const targetYPercent = (y / size.height) * 100;
    const targetWidthPercent = (width / size.width) * 100;
    const targetHeightPercent = (height / size.height) * 100;
    
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
          xPercent: targetXPercent,
          yPercent: targetYPercent,
          widthPercent: targetWidthPercent,
          heightPercent: targetHeightPercent,
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        },
        childElements: element.childElements?.map(child => ({
          ...child,
          id: `${child.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
          parentId: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
          sizeId: size.name
        }))
      };
    } else {
      // Adjust font size for text elements based on size change
      let adjustedFontSize = element.style.fontSize;
      
      if (element.type === 'text' && element.style.fontSize) {
        const fontScaleFactor = Math.min(size.width / selectedSize.width, size.height / selectedSize.height);
        adjustedFontSize = element.style.fontSize * fontScaleFactor;
        // Ensure minimum readable size
        adjustedFontSize = Math.max(adjustedFontSize, 9);
      }
      
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
          fontSize: adjustedFontSize,
          xPercent: targetXPercent,
          yPercent: targetYPercent,
          widthPercent: targetWidthPercent,
          heightPercent: targetHeightPercent,
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        }
      };
    }
    
    linkedElements.push(linkedElement);
  });
  
  return linkedElements;
};
