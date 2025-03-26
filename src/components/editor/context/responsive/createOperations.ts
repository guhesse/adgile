
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
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
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
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        }
      };
    }
    
    linkedElements.push(linkedElement);
  });
  
  return linkedElements;
};
