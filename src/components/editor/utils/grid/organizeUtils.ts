
import { EditorElement } from "../../types";
import { findNearestContainer } from "./containerUtils";

// Automatically organize elements into containers
export const organizeElementsInContainers = (
  elements: EditorElement[],
  canvasWidth: number
): EditorElement[] => {
  const organizedElements: EditorElement[] = [];
  const elementsToProcess = [...elements];
  
  // First, add any existing containers/layouts
  const containers = elementsToProcess.filter(
    el => el.type === "layout" || el.type === "container"
  );
  
  // Process children first to make sure they're properly attached to their containers
  containers.forEach(container => {
    if (container.childElements && container.childElements.length > 0) {
      // Make sure all child elements have the correct parentId and inContainer flag
      container.childElements = container.childElements.map(child => ({
        ...child,
        parentId: container.id,
        inContainer: true
      }));
    } else {
      container.childElements = [];
    }
    
    organizedElements.push(container);
  });
  
  // Process remaining standalone elements
  const remainingElements = elementsToProcess.filter(
    el => el.type !== "layout" && el.type !== "container" && !el.inContainer
  );
  
  // Sort elements by vertical position
  remainingElements.sort((a, b) => a.style.y - b.style.y);
  
  // Find overlapping elements with existing containers
  for (const element of remainingElements) {
    // Skip if it's already processed
    if (organizedElements.some(el => el.id === element.id)) continue;
    
    // Find nearest container that this element overlaps with
    const nearestContainer = findNearestContainer(organizedElements, element);
    
    if (nearestContainer && 
        element.style.x >= nearestContainer.style.x && 
        element.style.x + element.style.width <= nearestContainer.style.x + nearestContainer.style.width &&
        element.style.y >= nearestContainer.style.y && 
        element.style.y + element.style.height <= nearestContainer.style.y + nearestContainer.style.height) {
      // Element overlaps with container, add it as a child
      const updatedElement = {
        ...element,
        inContainer: true,
        parentId: nearestContainer.id,
        style: {
          ...element.style,
          // Adjust position to be relative to container
          x: element.style.x - nearestContainer.style.x,
          y: element.style.y - nearestContainer.style.y
        }
      };
      
      // Update the container's childElements array
      const containerIndex = organizedElements.findIndex(el => el.id === nearestContainer.id);
      if (containerIndex !== -1) {
        organizedElements[containerIndex] = {
          ...organizedElements[containerIndex],
          childElements: [
            ...(organizedElements[containerIndex].childElements || []),
            updatedElement
          ]
        };
      }
    } else {
      // Standalone element, add it directly
      organizedElements.push(element);
    }
  }
  
  return organizedElements;
};
