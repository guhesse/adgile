
import { EditorElement, BannerSize } from "../../types";

/**
 * Optimize the layout of elements for different banner sizes
 * @param sourceElements The source elements to optimize
 * @param targetSize The target banner size
 * @param sourceSize The source banner size
 * @returns Array of optimized elements for the target size
 */
export const optimizeLayout = (
  sourceElements: EditorElement[],
  targetSize: BannerSize,
  sourceSize: BannerSize
): EditorElement[] => {
  console.log(`Running AI layout optimization for ${targetSize.name}`);
  
  // Clone the source elements first
  const clonedElements = sourceElements.map(el => ({
    ...el,
    id: `${el.id}-${targetSize.name.replace(/\s+/g, '-').toLowerCase()}`,
    style: { ...el.style },
    sizeId: targetSize.name
  }));
  
  // Calculate scaling factors
  const scaleX = targetSize.width / sourceSize.width;
  const scaleY = targetSize.height / sourceSize.height;
  
  // Step 1: Apply proportional scaling to all elements
  const scaledElements = clonedElements.map(element => {
    const scaledElement = { ...element };
    
    // Scale position and size values
    scaledElement.style.x = Math.round(element.style.x * scaleX);
    scaledElement.style.y = Math.round(element.style.y * scaleY);
    scaledElement.style.width = Math.round(element.style.width * scaleX);
    scaledElement.style.height = Math.round(element.style.height * scaleY);
    
    // Ensure elements are visible and have reasonable sizes
    ensureMinimumSize(scaledElement);
    
    return scaledElement;
  });
  
  // Step 2: Analyze element relationships
  const relationships = analyzeElementRelationships(scaledElements);
  
  // Step 3: Identify and solve layout problems
  const elementsWithResolvedPosition = solveLayoutProblems(
    scaledElements, 
    relationships,
    targetSize
  );
  
  // Step 4: Ensure no element extends beyond canvas boundaries
  const boundedElements = ensureElementsWithinBounds(
    elementsWithResolvedPosition,
    targetSize
  );
  
  // Step 5: Calculate percentage-based positions for responsive behavior
  boundedElements.forEach(element => {
    element.style.xPercent = (element.style.x / targetSize.width) * 100;
    element.style.yPercent = (element.style.y / targetSize.height) * 100;
    element.style.widthPercent = (element.style.width / targetSize.width) * 100;
    element.style.heightPercent = (element.style.height / targetSize.height) * 100;
  });
  
  return boundedElements;
};

/**
 * Ensure elements have a minimum size for visibility
 * @param element The element to check and adjust
 */
const ensureMinimumSize = (element: EditorElement): void => {
  const MIN_WIDTH = 10;
  const MIN_HEIGHT = 10;
  
  if (element.style.width < MIN_WIDTH) {
    element.style.width = MIN_WIDTH;
  }
  
  if (element.style.height < MIN_HEIGHT) {
    element.style.height = MIN_HEIGHT;
  }
};

/**
 * Define a relationship between elements
 */
interface ElementRelationship {
  element1Id: string;
  element2Id: string;
  type: 'overlap' | 'adjacent' | 'contained' | 'aligned';
  strength: number; // 0-1 indicating how strong the relationship is
}

/**
 * Analyze relationships between elements
 * @param elements The elements to analyze
 * @returns Array of element relationships
 */
const analyzeElementRelationships = (elements: EditorElement[]): ElementRelationship[] => {
  const relationships: ElementRelationship[] = [];
  
  // Check each pair of elements
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const element1 = elements[i];
      const element2 = elements[j];
      
      // Skip elements from different artboards
      if (element1.sizeId !== element2.sizeId) {
        continue;
      }
      
      // Check for overlaps
      if (elementsOverlap(element1, element2)) {
        const overlapArea = calculateOverlapArea(element1, element2);
        const element1Area = element1.style.width * element1.style.height;
        const element2Area = element2.style.width * element2.style.height;
        const smallerArea = Math.min(element1Area, element2Area);
        
        const strength = overlapArea / smallerArea;
        
        relationships.push({
          element1Id: element1.id,
          element2Id: element2.id,
          type: 'overlap',
          strength: strength
        });
      }
      
      // Check for alignment
      if (elementsAreAligned(element1, element2)) {
        relationships.push({
          element1Id: element1.id,
          element2Id: element2.id,
          type: 'aligned',
          strength: 0.7 // Arbitrary strength for alignment
        });
      }
      
      // Check for adjacency
      if (elementsAreAdjacent(element1, element2)) {
        relationships.push({
          element1Id: element1.id,
          element2Id: element2.id,
          type: 'adjacent',
          strength: 0.5 // Arbitrary strength for adjacency
        });
      }
      
      // Check for containment
      if (elementContains(element1, element2)) {
        relationships.push({
          element1Id: element1.id,
          element2Id: element2.id,
          type: 'contained',
          strength: 0.9 // Strong relationship for containment
        });
      } else if (elementContains(element2, element1)) {
        relationships.push({
          element1Id: element2.id,
          element2Id: element1.id,
          type: 'contained',
          strength: 0.9
        });
      }
    }
  }
  
  return relationships;
};

/**
 * Solve layout problems based on relationships
 * @param elements The elements to adjust
 * @param relationships The relationships between elements
 * @param targetSize The target banner size
 * @returns Array of elements with resolved positions
 */
const solveLayoutProblems = (
  elements: EditorElement[],
  relationships: ElementRelationship[],
  targetSize: BannerSize
): EditorElement[] => {
  const adjustedElements = [...elements];
  
  // First, resolve overlaps between important elements
  const overlapRelationships = relationships.filter(r => r.type === 'overlap' && r.strength > 0.2);
  
  for (const relationship of overlapRelationships) {
    const element1 = adjustedElements.find(e => e.id === relationship.element1Id);
    const element2 = adjustedElements.find(e => e.id === relationship.element2Id);
    
    if (element1 && element2) {
      resolveOverlap(element1, element2, targetSize);
    }
  }
  
  // Then maintain alignment where possible
  const alignmentRelationships = relationships.filter(r => r.type === 'aligned');
  
  for (const relationship of alignmentRelationships) {
    const element1 = adjustedElements.find(e => e.id === relationship.element1Id);
    const element2 = adjustedElements.find(e => e.id === relationship.element2Id);
    
    if (element1 && element2) {
      maintainAlignment(element1, element2);
    }
  }
  
  return adjustedElements;
};

/**
 * Check if elements overlap
 * @param element1 First element
 * @param element2 Second element
 * @returns True if elements overlap
 */
const elementsOverlap = (element1: EditorElement, element2: EditorElement): boolean => {
  const rect1 = {
    left: element1.style.x,
    right: element1.style.x + element1.style.width,
    top: element1.style.y,
    bottom: element1.style.y + element1.style.height
  };
  
  const rect2 = {
    left: element2.style.x,
    right: element2.style.x + element2.style.width,
    top: element2.style.y,
    bottom: element2.style.y + element2.style.height
  };
  
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
};

/**
 * Calculate the overlap area between two elements
 * @param element1 First element
 * @param element2 Second element
 * @returns The overlap area in square pixels
 */
const calculateOverlapArea = (element1: EditorElement, element2: EditorElement): number => {
  const rect1 = {
    left: element1.style.x,
    right: element1.style.x + element1.style.width,
    top: element1.style.y,
    bottom: element1.style.y + element1.style.height
  };
  
  const rect2 = {
    left: element2.style.x,
    right: element2.style.x + element2.style.width,
    top: element2.style.y,
    bottom: element2.style.y + element2.style.height
  };
  
  // Calculate overlap dimensions
  const overlapWidth = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
  const overlapHeight = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
  
  return overlapWidth * overlapHeight;
};

/**
 * Check if elements are aligned (horizontally or vertically)
 * @param element1 First element
 * @param element2 Second element
 * @returns True if elements are aligned
 */
const elementsAreAligned = (element1: EditorElement, element2: EditorElement): boolean => {
  const ALIGNMENT_THRESHOLD = 5; // Pixels tolerance for alignment
  
  // Horizontal alignment (tops aligned)
  const topsAligned = Math.abs(element1.style.y - element2.style.y) <= ALIGNMENT_THRESHOLD;
  
  // Horizontal alignment (centers aligned)
  const element1CenterY = element1.style.y + element1.style.height / 2;
  const element2CenterY = element2.style.y + element2.style.height / 2;
  const centersAlignedY = Math.abs(element1CenterY - element2CenterY) <= ALIGNMENT_THRESHOLD;
  
  // Horizontal alignment (bottoms aligned)
  const element1Bottom = element1.style.y + element1.style.height;
  const element2Bottom = element2.style.y + element2.style.height;
  const bottomsAligned = Math.abs(element1Bottom - element2Bottom) <= ALIGNMENT_THRESHOLD;
  
  // Vertical alignment (lefts aligned)
  const leftsAligned = Math.abs(element1.style.x - element2.style.x) <= ALIGNMENT_THRESHOLD;
  
  // Vertical alignment (centers aligned)
  const element1CenterX = element1.style.x + element1.style.width / 2;
  const element2CenterX = element2.style.x + element2.style.width / 2;
  const centersAlignedX = Math.abs(element1CenterX - element2CenterX) <= ALIGNMENT_THRESHOLD;
  
  // Vertical alignment (rights aligned)
  const element1Right = element1.style.x + element1.style.width;
  const element2Right = element2.style.x + element2.style.width;
  const rightsAligned = Math.abs(element1Right - element2Right) <= ALIGNMENT_THRESHOLD;
  
  return topsAligned || centersAlignedY || bottomsAligned || leftsAligned || centersAlignedX || rightsAligned;
};

/**
 * Check if elements are adjacent (close to each other)
 * @param element1 First element
 * @param element2 Second element
 * @returns True if elements are adjacent
 */
const elementsAreAdjacent = (element1: EditorElement, element2: EditorElement): boolean => {
  const ADJACENCY_THRESHOLD = 20; // Pixels tolerance for adjacency
  
  const rect1 = {
    left: element1.style.x,
    right: element1.style.x + element1.style.width,
    top: element1.style.y,
    bottom: element1.style.y + element1.style.height
  };
  
  const rect2 = {
    left: element2.style.x,
    right: element2.style.x + element2.style.width,
    top: element2.style.y,
    bottom: element2.style.y + element2.style.height
  };
  
  // Check if rectangles are adjacent horizontally or vertically
  const horizontallyAdjacent = 
    (rect1.right <= rect2.left && rect2.left - rect1.right <= ADJACENCY_THRESHOLD) ||
    (rect2.right <= rect1.left && rect1.left - rect2.right <= ADJACENCY_THRESHOLD);
  
  const verticallyAdjacent = 
    (rect1.bottom <= rect2.top && rect2.top - rect1.bottom <= ADJACENCY_THRESHOLD) ||
    (rect2.bottom <= rect1.top && rect1.top - rect2.bottom <= ADJACENCY_THRESHOLD);
  
  // Check if rectangles overlap either horizontally or vertically
  const horizontalOverlap = !(rect1.right < rect2.left || rect1.left > rect2.right);
  const verticalOverlap = !(rect1.bottom < rect2.top || rect1.top > rect2.bottom);
  
  // Return true if the rectangles are adjacent in either direction
  return (horizontallyAdjacent && verticalOverlap) || (verticallyAdjacent && horizontalOverlap);
};

/**
 * Check if one element contains another
 * @param container Potential container element
 * @param contained Potential contained element
 * @returns True if container contains contained
 */
const elementContains = (container: EditorElement, contained: EditorElement): boolean => {
  const CONTAINMENT_MARGIN = 5; // Pixels of margin for containment
  
  return (
    container.style.x - CONTAINMENT_MARGIN <= contained.style.x &&
    container.style.y - CONTAINMENT_MARGIN <= contained.style.y &&
    container.style.x + container.style.width + CONTAINMENT_MARGIN >= contained.style.x + contained.style.width &&
    container.style.y + container.style.height + CONTAINMENT_MARGIN >= contained.style.y + contained.style.height
  );
};

/**
 * Resolve overlap between two elements
 * @param element1 First element
 * @param element2 Second element
 * @param targetSize The target banner size
 */
const resolveOverlap = (
  element1: EditorElement,
  element2: EditorElement,
  targetSize: BannerSize
): void => {
  // Determine which element is more important
  const element1Importance = getElementImportance(element1);
  const element2Importance = getElementImportance(element2);
  
  let elementToMove: EditorElement;
  let stationaryElement: EditorElement;
  
  if (element1Importance < element2Importance) {
    elementToMove = element1;
    stationaryElement = element2;
  } else {
    elementToMove = element2;
    stationaryElement = element1;
  }
  
  // Determine direction to move (up, down, left, right)
  const directions = [
    { dx: 0, dy: -elementToMove.style.height }, // Up
    { dx: 0, dy: stationaryElement.style.height }, // Down
    { dx: -elementToMove.style.width, dy: 0 }, // Left
    { dx: stationaryElement.style.width, dy: 0 } // Right
  ];
  
  // Find the best direction to move
  let bestDirection = { dx: 0, dy: 0 };
  let minDistanceSquared = Number.MAX_VALUE;
  
  for (const direction of directions) {
    const newX = elementToMove.style.x + direction.dx;
    const newY = elementToMove.style.y + direction.dy;
    
    // Check if this position is still within bounds
    if (
      newX >= 0 && 
      newY >= 0 && 
      newX + elementToMove.style.width <= targetSize.width && 
      newY + elementToMove.style.height <= targetSize.height
    ) {
      const distanceSquared = direction.dx * direction.dx + direction.dy * direction.dy;
      
      if (distanceSquared < minDistanceSquared) {
        minDistanceSquared = distanceSquared;
        bestDirection = direction;
      }
    }
  }
  
  // Apply the movement
  elementToMove.style.x += bestDirection.dx;
  elementToMove.style.y += bestDirection.dy;
  
  // Ensure the element stays within bounds after moving
  if (elementToMove.style.x < 0) elementToMove.style.x = 0;
  if (elementToMove.style.y < 0) elementToMove.style.y = 0;
  if (elementToMove.style.x + elementToMove.style.width > targetSize.width) {
    elementToMove.style.x = targetSize.width - elementToMove.style.width;
  }
  if (elementToMove.style.y + elementToMove.style.height > targetSize.height) {
    elementToMove.style.y = targetSize.height - elementToMove.style.height;
  }
};

/**
 * Get the importance of an element for layout decisions
 * @param element The element to evaluate
 * @returns Importance score (higher = more important)
 */
const getElementImportance = (element: EditorElement): number => {
  // Simple heuristics for importance:
  // - Larger elements tend to be more important
  // - Elements near the center are more important
  // - Text elements might be more important than images
  
  const area = element.style.width * element.style.height;
  const typeImportance = element.type === 'text' ? 2 : element.type === 'image' ? 1.5 : 1;
  
  return area * typeImportance;
};

/**
 * Maintain alignment between elements after position adjustments
 * @param element1 First element
 * @param element2 Second element
 */
const maintainAlignment = (element1: EditorElement, element2: EditorElement): void => {
  // This is a simplified implementation
  // In a real application, you'd want more sophisticated alignment preservation
  
  const ALIGNMENT_THRESHOLD = 5; // Pixels tolerance for alignment
  
  // Horizontal center alignment
  const element1CenterY = element1.style.y + element1.style.height / 2;
  const element2CenterY = element2.style.y + element2.style.height / 2;
  
  if (Math.abs(element1CenterY - element2CenterY) <= ALIGNMENT_THRESHOLD) {
    // Align to the average center
    const avgCenterY = (element1CenterY + element2CenterY) / 2;
    element1.style.y = avgCenterY - element1.style.height / 2;
    element2.style.y = avgCenterY - element2.style.height / 2;
  }
  
  // Vertical center alignment
  const element1CenterX = element1.style.x + element1.style.width / 2;
  const element2CenterX = element2.style.x + element2.style.width / 2;
  
  if (Math.abs(element1CenterX - element2CenterX) <= ALIGNMENT_THRESHOLD) {
    // Align to the average center
    const avgCenterX = (element1CenterX + element2CenterX) / 2;
    element1.style.x = avgCenterX - element1.style.width / 2;
    element2.style.x = avgCenterX - element2.style.width / 2;
  }
};

/**
 * Ensure all elements are within the canvas boundaries
 * @param elements The elements to check
 * @param targetSize The target banner size
 * @returns Array of elements with positions within bounds
 */
const ensureElementsWithinBounds = (
  elements: EditorElement[],
  targetSize: BannerSize
): EditorElement[] => {
  return elements.map(element => {
    const boundedElement = { ...element };
    
    // Ensure x and y are positive
    if (boundedElement.style.x < 0) boundedElement.style.x = 0;
    if (boundedElement.style.y < 0) boundedElement.style.y = 0;
    
    // Ensure element doesn't extend beyond canvas width and height
    if (boundedElement.style.x + boundedElement.style.width > targetSize.width) {
      if (boundedElement.style.width < targetSize.width) {
        boundedElement.style.x = targetSize.width - boundedElement.style.width;
      } else {
        boundedElement.style.x = 0;
        boundedElement.style.width = targetSize.width;
      }
    }
    
    if (boundedElement.style.y + boundedElement.style.height > targetSize.height) {
      if (boundedElement.style.height < targetSize.height) {
        boundedElement.style.y = targetSize.height - boundedElement.style.height;
      } else {
        boundedElement.style.y = 0;
        boundedElement.style.height = targetSize.height;
      }
    }
    
    return boundedElement;
  });
};
