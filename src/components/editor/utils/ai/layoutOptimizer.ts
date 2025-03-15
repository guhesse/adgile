import { EditorElement, BannerSize } from "../../types";

// Interface for position and size recommendations
interface LayoutRecommendation {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

// Interface for element relationship mapping
interface ElementRelationship {
  id: string;
  relatedTo: string[];
  importance: number; // 1-10 scale with 10 being most important
  alignmentPreference?: 'left' | 'center' | 'right' | 'top' | 'bottom';
}

/**
 * Uses AI heuristics to determine optimal layout for elements across different banner sizes
 */
export const optimizeLayout = (
  elements: EditorElement[],
  targetSize: BannerSize,
  sourceSize: BannerSize
): EditorElement[] => {
  console.log("Running AI layout optimization for", targetSize.name);
  
  // Deep clone elements to avoid mutation
  const optimizedElements = JSON.parse(JSON.stringify(elements));
  
  // Get element relationships and importance
  const relationships = analyzeElementRelationships(optimizedElements);
  
  // For each element, determine optimal position and size
  optimizedElements.forEach(element => {
    const recommendation = getOptimalPositionAndSize(
      element, 
      optimizedElements, 
      relationships,
      sourceSize,
      targetSize
    );
    
    // Apply recommendations to element
    element.style.x = recommendation.x;
    element.style.y = recommendation.y;
    element.style.width = recommendation.width;
    element.style.height = recommendation.height;
    
    // Update percentage-based positioning for responsive handling
    element.style.xPercent = (recommendation.x / targetSize.width) * 100;
    element.style.yPercent = (recommendation.y / targetSize.height) * 100;
    element.style.widthPercent = (recommendation.width / targetSize.width) * 100;
    element.style.heightPercent = (recommendation.height / targetSize.height) * 100;
    
    if (recommendation.zIndex) {
      element.style.zIndex = recommendation.zIndex;
    }
  });
  
  // After all elements are positioned, check for overlaps and adjust
  resolveOverlaps(optimizedElements, targetSize);
  
  return optimizedElements;
};

/**
 * Analyzes elements to determine their relationships and importance
 */
const analyzeElementRelationships = (elements: EditorElement[]): ElementRelationship[] => {
  const relationships: ElementRelationship[] = [];
  
  elements.forEach(element => {
    // Create a relationship entry for this element
    const relationship: ElementRelationship = {
      id: element.id,
      relatedTo: [],
      importance: calculateElementImportance(element)
    };
    
    // Determine alignment preference
    if (element.style.textAlign) {
      relationship.alignmentPreference = element.style.textAlign;
    } else if (element.type === "text" || element.type === "paragraph") {
      relationship.alignmentPreference = "left";
    } else if (element.type === "logo") {
      relationship.alignmentPreference = "center";
    }
    
    // Find related elements (e.g., text that's near an image, etc.)
    elements.forEach(otherElement => {
      if (element.id !== otherElement.id && areElementsRelated(element, otherElement)) {
        relationship.relatedTo.push(otherElement.id);
      }
    });
    
    relationships.push(relationship);
  });
  
  return relationships;
};

/**
 * Calculates importance score for an element based on type, size, content
 */
const calculateElementImportance = (element: EditorElement): number => {
  let importance = 5; // Default mid-level importance
  
  // Logos and large images are typically more important
  if (element.type === "logo") {
    importance += 3;
  }
  
  // Headings (large text) are important
  if (element.type === "text" && element.style.fontSize && element.style.fontSize > 24) {
    importance += 2;
  }
  
  // CTA buttons are important
  if (element.type === "button") {
    importance += 2;
  }
  
  // Larger elements might be more important
  const area = element.style.width * element.style.height;
  if (area > 40000) { // arbitrary threshold
    importance += 1;
  }
  
  // Cap at 10
  return Math.min(importance, 10);
};

/**
 * Determines if two elements are related (positioned near each other)
 */
const areElementsRelated = (element1: EditorElement, element2: EditorElement): boolean => {
  // Simple distance-based relationship check
  const center1 = {
    x: element1.style.x + element1.style.width / 2,
    y: element1.style.y + element1.style.height / 2
  };
  
  const center2 = {
    x: element2.style.x + element2.style.width / 2,
    y: element2.style.y + element2.style.height / 2
  };
  
  const distance = Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + 
    Math.pow(center2.y - center1.y, 2)
  );
  
  // If they're close enough, consider them related
  const proximityThreshold = Math.max(
    element1.style.width, 
    element1.style.height, 
    element2.style.width, 
    element2.style.height
  );
  
  return distance < proximityThreshold * 1.5;
};

/**
 * Gets optimal positioning and sizing for an element 
 */
const getOptimalPositionAndSize = (
  element: EditorElement,
  allElements: EditorElement[],
  relationships: ElementRelationship[],
  sourceSize: BannerSize,
  targetSize: BannerSize
): LayoutRecommendation => {
  // Find relationship info for this element
  const relationship = relationships.find(r => r.id === element.id);
  
  // Default to current values (scaled) if no relationship found
  if (!relationship) {
    return getScaledPosition(element, sourceSize, targetSize);
  }
  
  // Different strategies based on element type
  if (element.type === "image" || element.type === "logo") {
    return optimizeImagePosition(element, relationship, allElements, sourceSize, targetSize);
  } else if (element.type === "text" || element.type === "paragraph") {
    return optimizeTextPosition(element, relationship, allElements, sourceSize, targetSize);
  } else if (element.type === "button") {
    return optimizeButtonPosition(element, relationship, allElements, sourceSize, targetSize);
  } else {
    // For other element types, use default scaling
    return getScaledPosition(element, sourceSize, targetSize);
  }
};

/**
 * Scale element position and size proportionally for target size
 */
const getScaledPosition = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): LayoutRecommendation => {
  // Simple proportional scaling
  const widthRatio = targetSize.width / sourceSize.width;
  const heightRatio = targetSize.height / sourceSize.height;
  
  return {
    x: element.style.x * widthRatio,
    y: element.style.y * heightRatio,
    width: element.style.width * widthRatio,
    height: element.style.height * heightRatio
  };
};

/**
 * Optimize image or logo positioning
 */
const optimizeImagePosition = (
  element: EditorElement,
  relationship: ElementRelationship,
  allElements: EditorElement[],
  sourceSize: BannerSize,
  targetSize: BannerSize
): LayoutRecommendation => {
  // Start with scaled position
  const scaledPos = getScaledPosition(element, sourceSize, targetSize);
  
  // Maintain aspect ratio for images
  const aspectRatio = element.style.width / element.style.height;
  
  // For very different aspect ratios (like horizontal to vertical),
  // we want to adjust the image size more carefully
  if (targetSize.width / targetSize.height < 0.7 * (sourceSize.width / sourceSize.height)) {
    // Going from a wide format to a tall one - make image smaller
    let newWidth = Math.min(targetSize.width * 0.8, scaledPos.width);
    let newHeight = newWidth / aspectRatio;
    
    // Center it
    const x = (targetSize.width - newWidth) / 2;
    const y = targetSize.height * 0.2; // Place in the upper portion
    
    return { x, y, width: newWidth, height: newHeight };
  } 
  else if (targetSize.width / targetSize.height > 1.3 * (sourceSize.width / sourceSize.height)) {
    // Going from a tall format to a wide one - emphasize width
    let newHeight = Math.min(targetSize.height * 0.6, scaledPos.height);
    let newWidth = newHeight * aspectRatio;
    
    // Center it
    const x = (targetSize.width - newWidth) / 2;
    const y = (targetSize.height - newHeight) / 2;
    
    return { x, y, width: newWidth, height: newHeight };
  } 
  else {
    // For logos, try to keep them close to their relative position
    if (element.type === "logo") {
      // Often logos should be at the top
      scaledPos.y = Math.min(scaledPos.y, targetSize.height * 0.15);
    }
    
    return scaledPos;
  }
};

/**
 * Optimize text positioning
 */
const optimizeTextPosition = (
  element: EditorElement,
  relationship: ElementRelationship,
  allElements: EditorElement[],
  sourceSize: BannerSize,
  targetSize: BannerSize
): LayoutRecommendation => {
  // Start with scaled position
  const scaledPos = getScaledPosition(element, sourceSize, targetSize);
  
  // For text, we want to ensure it's not too wide on smaller screens
  const maxWidth = targetSize.width * 0.9;
  if (scaledPos.width > maxWidth) {
    scaledPos.width = maxWidth;
    // Center it horizontally
    scaledPos.x = (targetSize.width - scaledPos.width) / 2;
  }
  
  // Adjust position based on alignment preference
  if (relationship.alignmentPreference) {
    if (relationship.alignmentPreference === 'center') {
      scaledPos.x = (targetSize.width - scaledPos.width) / 2;
    } else if (relationship.alignmentPreference === 'right') {
      scaledPos.x = targetSize.width - scaledPos.width - 20; // 20px margin
    } else if (relationship.alignmentPreference === 'left') {
      scaledPos.x = 20; // 20px margin
    }
  }
  
  // Check if this text should be positioned relative to another element
  if (relationship.relatedTo.length > 0) {
    // Get related elements
    const relatedElements = allElements.filter(el => 
      relationship.relatedTo.includes(el.id)
    );
    
    // If related to an image, position below or beside it
    const relatedImage = relatedElements.find(el => 
      el.type === "image" || el.type === "logo"
    );
    
    if (relatedImage) {
      // Find the position of the related image in the target size
      const relatedImageRel = relationships.find(r => r.id === relatedImage.id);
      const relatedImagePos = getOptimalPositionAndSize(
        relatedImage, allElements, relationships, sourceSize, targetSize
      );
      
      // Position below or beside based on layout
      if (targetSize.width > targetSize.height) {
        // Landscape - position beside if enough space
        if (relatedImagePos.width < targetSize.width * 0.5) {
          scaledPos.x = relatedImagePos.x + relatedImagePos.width + 20;
          scaledPos.y = relatedImagePos.y + (relatedImagePos.height - scaledPos.height) / 2;
        } else {
          // Not enough space beside, position below
          scaledPos.x = (targetSize.width - scaledPos.width) / 2;
          scaledPos.y = relatedImagePos.y + relatedImagePos.height + 20;
        }
      } else {
        // Portrait - position below
        scaledPos.x = (targetSize.width - scaledPos.width) / 2;
        scaledPos.y = relatedImagePos.y + relatedImagePos.height + 20;
      }
    }
  }
  
  return scaledPos;
};

/**
 * Optimize button positioning
 */
const optimizeButtonPosition = (
  element: EditorElement,
  relationship: ElementRelationship,
  allElements: EditorElement[],
  sourceSize: BannerSize,
  targetSize: BannerSize
): LayoutRecommendation => {
  // Start with scaled position
  const scaledPos = getScaledPosition(element, sourceSize, targetSize);
  
  // Buttons typically look better centered
  scaledPos.x = (targetSize.width - scaledPos.width) / 2;
  
  // For portrait layouts, buttons are often near the bottom
  if (targetSize.height > targetSize.width) {
    scaledPos.y = targetSize.height * 0.7;
  }
  
  // Check if this button should follow content
  if (relationship.relatedTo.length > 0) {
    // Find the highest element that this is related to
    const relatedElements = allElements
      .filter(el => relationship.relatedTo.includes(el.id))
      .map(el => {
        const elPos = getOptimalPositionAndSize(el, allElements, relationships, sourceSize, targetSize);
        return {
          element: el,
          bottom: elPos.y + elPos.height
        };
      });
    
    // Find the bottom-most related element
    if (relatedElements.length > 0) {
      const maxBottom = Math.max(...relatedElements.map(el => el.bottom));
      scaledPos.y = maxBottom + 30; // Position 30px below the bottom-most element
    }
  }
  
  return scaledPos;
};

/**
 * Resolve overlaps between elements by repositioning them
 */
const resolveOverlaps = (elements: EditorElement[], targetSize: BannerSize): void => {
  // Simple algorithm to adjust elements vertically if they overlap
  for (let i = 0; i < elements.length; i++) {
    const el1 = elements[i];
    
    for (let j = i + 1; j < elements.length; j++) {
      const el2 = elements[j];
      
      // Check if they overlap
      if (
        el1.style.x < el2.style.x + el2.style.width &&
        el1.style.x + el1.style.width > el2.style.x &&
        el1.style.y < el2.style.y + el2.style.height &&
        el1.style.y + el1.style.height > el2.style.y
      ) {
        // Get relationship data to decide how to resolve
        const rel1 = { 
          id: el1.id, 
          importance: calculateElementImportance(el1) 
        };
        const rel2 = { 
          id: el2.id, 
          importance: calculateElementImportance(el2) 
        };
        
        // If one is more important, move the less important one
        if (rel1.importance > rel2.importance) {
          // Move el2 below el1
          el2.style.y = el1.style.y + el1.style.height + 10;
        } else if (rel2.importance > rel1.importance) {
          // Move el1 below el2
          el1.style.y = el2.style.y + el2.style.height + 10;
        } else {
          // Equal importance, move the lower one down further
          if (el1.style.y > el2.style.y) {
            el1.style.y = el2.style.y + el2.style.height + 10;
          } else {
            el2.style.y = el1.style.y + el1.style.height + 10;
          }
        }
        
        // Update percentages for the moved element
        if (rel1.importance <= rel2.importance) {
          el1.style.yPercent = (el1.style.y / targetSize.height) * 100;
        } else {
          el2.style.yPercent = (el2.style.y / targetSize.height) * 100;
        }
      }
    }
    
    // Make sure element doesn't exceed canvas bounds
    if (el1.style.x + el1.style.width > targetSize.width) {
      el1.style.x = targetSize.width - el1.style.width;
      el1.style.xPercent = (el1.style.x / targetSize.width) * 100;
    }
    
    if (el1.style.y + el1.style.height > targetSize.height) {
      el1.style.y = targetSize.height - el1.style.height;
      el1.style.yPercent = (el1.style.y / targetSize.height) * 100;
    }
  }
};
