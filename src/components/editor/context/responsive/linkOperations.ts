import { EditorElement, BannerSize } from "../../types";
import { analyzeElementPosition } from "../../utils/grid/responsivePosition";
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
      // Calculate dimensions for the new element based on constraints
      const scaleX = targetSize.width / sourceSize.width;
      const scaleY = targetSize.height / sourceSize.height;
      
      // Base calculations assuming left/top constraints
      let x = sourceElement.style.x * scaleX;
      let y = sourceElement.style.y * scaleY;
      let width = sourceElement.style.width * scaleX;
      let height = sourceElement.style.height * scaleY;
      
      // Apply horizontal constraint
      if (horizontalConstraint === "right") {
        const rightEdgeDistance = sourceSize.width - (sourceElement.style.x + sourceElement.style.width);
        x = targetSize.width - rightEdgeDistance * scaleX - width;
      } else if (horizontalConstraint === "center") {
        const centerOffsetX = sourceElement.style.x + sourceElement.style.width / 2 - sourceSize.width / 2;
        x = targetSize.width / 2 + centerOffsetX * scaleX - width / 2;
      }
      
      // Apply vertical constraint
      if (verticalConstraint === "bottom") {
        const bottomEdgeDistance = sourceSize.height - (sourceElement.style.y + sourceElement.style.height);
        y = targetSize.height - bottomEdgeDistance * scaleY - height;
      } else if (verticalConstraint === "center") {
        const centerOffsetY = sourceElement.style.y + sourceElement.style.height / 2 - sourceSize.height / 2;
        y = targetSize.height / 2 + centerOffsetY * scaleY - height / 2;
      }
      
      // Special handling for images to preserve aspect ratio
      if ((sourceElement.type === "image" || sourceElement.type === "logo") && 
          sourceElement.style.originalWidth && sourceElement.style.originalHeight) {
        const aspectRatio = sourceElement.style.originalWidth / sourceElement.style.originalHeight;
        
        // Use the smaller scale factor for aspect-preserving scaling
        const minScale = Math.min(scaleX, scaleY);
        
        if (verticalConstraint === "bottom" || verticalConstraint === "center") {
          width = sourceElement.style.width * minScale;
          height = width / aspectRatio;
          
          // Re-adjust position based on new dimensions
          if (verticalConstraint === "bottom") {
            const bottomEdgeDistance = sourceSize.height - (sourceElement.style.y + sourceElement.style.height);
            y = targetSize.height - bottomEdgeDistance * scaleY - height;
          } else if (verticalConstraint === "center") {
            const centerOffsetY = sourceElement.style.y + sourceElement.style.height / 2 - sourceSize.height / 2;
            y = targetSize.height / 2 + centerOffsetY * scaleY - height / 2;
          }
        } else {
          // For top-aligned images
          width = sourceElement.style.width * minScale;
          height = width / aspectRatio;
        }
      }
      
      // For text elements, ensure font size is properly scaled but remains legible
      let fontSize = sourceElement.style.fontSize;
      if (sourceElement.type === "text" && fontSize) {
        const minScale = Math.min(scaleX, scaleY);
        fontSize = fontSize * minScale;
        fontSize = Math.max(fontSize, 9); // Minimum legible size
      }
      
      // Create the linked element with the proper ID for this size
      const linkedElement: EditorElement = {
        ...sourceElement,
        id: `${sourceElement.id}-${targetSize.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: targetSize.name,
        linkedElementId: linkedId,
        style: {
          ...sourceElement.style,
          x,
          y,
          width,
          height,
          fontSize,
          xPercent: (x / targetSize.width) * 100,
          yPercent: (y / targetSize.height) * 100,
          widthPercent: (width / targetSize.width) * 100,
          heightPercent: (height / targetSize.height) * 100,
          constraintHorizontal: horizontalConstraint,
          constraintVertical: verticalConstraint
        }
      };
      
      // For containers or layouts, also update child element IDs
      if (sourceElement.type === "container" || sourceElement.type === "layout") {
        linkedElement.childElements = sourceElement.childElements?.map(child => ({
          ...child,
          id: `${child.id}-${targetSize.name.replace(/\s+/g, '-').toLowerCase()}`,
          parentId: linkedElement.id,
          sizeId: targetSize.name
        }));
      }
      
      // Add the linked element to our updated elements
      updatedElements.push(linkedElement);
    });
  
  return updatedElements;
};

/**
 * Unlinks an element from its linked versions
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
  
  const linkedId = element.linkedElementId;
  
  // Update all elements, removing linked ID from the specified element
  // and removing all other elements with this linked ID
  return elements
    .filter(el => el.id === elementId || el.linkedElementId !== linkedId) // Keep this element and non-linked elements
    .map(el => {
      if (el.id === elementId) {
        // Remove linked ID and constraints from this element
        const { linkedElementId, ...styleWithoutLinkedProps } = el.style;
        return {
          ...el,
          linkedElementId: undefined,
          style: {
            ...styleWithoutLinkedProps,
            // Keep percentage values for future use
            xPercent: el.style.xPercent,
            yPercent: el.style.yPercent,
            widthPercent: el.style.widthPercent,
            heightPercent: el.style.heightPercent,
          }
        };
      }
      return el;
    });
};
