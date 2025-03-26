
import { EditorElement, BannerSize } from "../../types";
import { analyzeElementPosition, calculateSmartPosition } from "../../utils/grid/responsivePosition";

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
  
  // Analyze element position to determine constraints
  const { horizontalConstraint, verticalConstraint } = analyzeElementPosition(element, selectedSize);
  
  // Calculate percentage values for the source element
  const xPercent = (element.style.x / selectedSize.width) * 100;
  const yPercent = (element.style.y / selectedSize.height) * 100;
  const widthPercent = (element.style.width / selectedSize.width) * 100;
  const heightPercent = (element.style.height / selectedSize.height) * 100;
  
  // Special handling for elements that should be aligned to bottom/right
  const isNearBottom = Math.abs((element.style.y + element.style.height) - selectedSize.height) < 20;
  const isNearRight = Math.abs((element.style.x + element.style.width) - selectedSize.width) < 20;
  const isNearBottomRight = isNearBottom && isNearRight;
  
  // Check if element is probably a bottom-anchored image or a footer
  const isBottomImage = element.type === 'image' && isNearBottom;
  const isBottomRightButton = element.type === 'button' && isNearBottomRight;
  
  // Force specific constraints for special elements
  let finalHorizontalConstraint = horizontalConstraint;
  let finalVerticalConstraint = verticalConstraint;
  
  if (isBottomImage) {
    finalVerticalConstraint = 'bottom';
  }
  
  if (isBottomRightButton) {
    finalHorizontalConstraint = 'right';
    finalVerticalConstraint = 'bottom';
  }
  
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
      constraintHorizontal: finalHorizontalConstraint,
      constraintVertical: finalVerticalConstraint
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
          constraintHorizontal: finalHorizontalConstraint,
          constraintVertical: finalVerticalConstraint
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
          constraintHorizontal: finalHorizontalConstraint,
          constraintVertical: finalVerticalConstraint
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
          constraintHorizontal: finalHorizontalConstraint,
          constraintVertical: finalVerticalConstraint
        }
      };
    }
    
    linkedElements.push(linkedElement);
  });
  
  return linkedElements;
};
