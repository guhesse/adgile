
import { EditorElement } from "../../types";
import { snapToGrid } from "./gridCore";

// Find the nearest container to place an element
export const findNearestContainer = (
  elements: EditorElement[],
  element: EditorElement
): EditorElement | null => {
  // Filter only container and layout elements
  const containers = elements.filter(
    el => el.type === "layout" || el.type === "container"
  );
  
  if (containers.length === 0) return null;
  
  // Sort containers by vertical distance to the element
  const sortedContainers = [...containers].sort((a, b) => {
    const aDistance = Math.abs(a.style.y - element.style.y);
    const bDistance = Math.abs(b.style.y - element.style.y);
    return aDistance - bDistance;
  });
  
  // Check if element overlaps with any container
  for (const container of sortedContainers) {
    if (
      element.style.x >= container.style.x &&
      element.style.x + element.style.width <= container.style.x + container.style.width &&
      element.style.y >= container.style.y &&
      element.style.y + element.style.height <= container.style.y + container.style.height
    ) {
      return container;
    }
  }
  
  // Return the nearest container vertically
  return sortedContainers[0];
};

// Create a container element for wrapping elements without a container
export const createContainerForElement = (
  element: EditorElement,
  canvasWidth: number
): EditorElement => {
  const container: EditorElement = {
    id: `container-${Date.now()}`,
    type: "container",
    content: "",
    inContainer: false,
    style: {
      x: 0,
      y: snapToGrid(element.style.y - 10),
      width: canvasWidth - 40, // Adjust width to have some margin
      height: snapToGrid(element.style.height + 20),
      backgroundColor: "#ffffff",
      padding: "10px",
    },
  };
  
  return container;
};
