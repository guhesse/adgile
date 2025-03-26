
import { EditorElement, BannerSize } from "../../types";
import { toast } from "sonner";

/**
 * Layout descriptor interface representing standard positioning patterns
 */
interface LayoutDescriptor {
  name: string;
  description: string;
  pattern: 'product-display' | 'hero-banner' | 'call-to-action' | 'gallery' | 'text-heavy' | 'custom';
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'background';
  ctaPosition?: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  textAlignment?: 'left' | 'right' | 'center' | 'justified';
  colorScheme?: 'light' | 'dark' | 'colorful' | 'monochrome' | 'custom';
  density?: 'sparse' | 'moderate' | 'dense';
  confidence: number;
}

/**
 * Position pattern to help recognize common layouts
 */
interface PositionPattern {
  imageAtBottom?: boolean;
  imageAtTop?: boolean;
  textInMiddle?: boolean;
  ctaAtBottom?: boolean;
  ctaAtRight?: boolean;
  textAtTop?: boolean;
  hasLogo?: boolean;
  logoAtTop?: boolean;
  isVertical?: boolean;
  isHorizontal?: boolean;
}

/**
 * Analyzes the layout of elements in a banner and applies optimal constraints
 * @param elements Elements to analyze
 * @param canvasSize Size of the canvas
 * @returns Elements with optimized constraints
 */
export const analyzeAndOptimizeLayout = (
  elements: EditorElement[],
  canvasSize: BannerSize
): EditorElement[] => {
  if (!elements || elements.length === 0) return elements;
  
  // Determine layout pattern
  const layoutPattern = detectLayoutPattern(elements, canvasSize);
  
  // Apply constraints based on detected pattern
  const optimizedElements = applyLayoutConstraints(elements, layoutPattern, canvasSize);
  
  // Log detected layout for debugging
  console.log(`AI Layout Analysis: Detected "${layoutPattern.name}" layout with ${layoutPattern.confidence.toFixed(1)}% confidence`);
  
  // Show toast with layout info if confidence is high enough
  if (layoutPattern.confidence > 70) {
    toast.info(`Layout detected: ${layoutPattern.name}`, {
      description: "Optimized element positioning for responsive behavior",
      duration: 3000,
    });
  }
  
  return optimizedElements;
};

/**
 * Detects the layout pattern from element positions
 */
function detectLayoutPattern(elements: EditorElement[], canvasSize: BannerSize): LayoutDescriptor {
  // Extract basic position information
  const pattern = analyzePositionPatterns(elements, canvasSize);
  
  // Product display pattern detection
  if (pattern.imageAtBottom && pattern.textAtTop && pattern.ctaAtBottom) {
    return {
      name: "Product Showcase",
      description: "Product image at bottom with descriptive text and CTA",
      pattern: 'product-display',
      imagePosition: 'bottom',
      ctaPosition: pattern.ctaAtRight ? 'bottom-right' : 'bottom-center',
      textAlignment: 'left',
      confidence: 85
    };
  }
  
  // Hero banner pattern detection
  if (pattern.imageAtBottom && pattern.textInMiddle) {
    return {
      name: "Hero Banner",
      description: "Large showcase with text overlay and product image",
      pattern: 'hero-banner',
      imagePosition: 'bottom',
      ctaPosition: 'bottom-right',
      textAlignment: 'left',
      confidence: 80
    };
  }
  
  // Call to action pattern detection
  if (pattern.ctaAtBottom && pattern.ctaAtRight) {
    return {
      name: "Call to Action",
      description: "Promotional content with strong CTA button",
      pattern: 'call-to-action',
      ctaPosition: 'bottom-right',
      textAlignment: 'left',
      confidence: 75
    };
  }
  
  // Gallery/content showcase detection
  if (pattern.imageAtTop && pattern.textInMiddle && pattern.ctaAtBottom) {
    return {
      name: "Content Showcase",
      description: "Visual content with supporting text and call to action",
      pattern: 'gallery',
      imagePosition: 'top',
      ctaPosition: 'bottom-center',
      confidence: 70
    };
  }
  
  // Default to custom layout with low confidence
  return {
    name: "Custom Layout",
    description: "Custom layout design",
    pattern: 'custom',
    confidence: 50
  };
}

/**
 * Analyzes basic position patterns of elements
 */
function analyzePositionPatterns(elements: EditorElement[], canvasSize: BannerSize): PositionPattern {
  const pattern: PositionPattern = {
    isVertical: canvasSize.height > canvasSize.width,
    isHorizontal: canvasSize.width > canvasSize.height
  };
  
  const imageElements = elements.filter(e => e.type === 'image');
  const textElements = elements.filter(e => e.type === 'text');
  const buttons = elements.filter(e => e.type === 'button' || 
                                (e.type === 'container' && e.style?.backgroundColor === '#2563eb'));
  
  // Canvas divisions (for rough positioning)
  const bottomThreshold = canvasSize.height * 0.7;
  const topThreshold = canvasSize.height * 0.3;
  const rightThreshold = canvasSize.width * 0.7;
  
  // Check image positions
  for (const img of imageElements) {
    // Logo detection heuristic - small image at top
    if (img.style.width < canvasSize.width * 0.3 && 
        img.style.height < canvasSize.height * 0.2 &&
        img.style.y < topThreshold) {
      pattern.hasLogo = true;
      pattern.logoAtTop = true;
      continue; // Skip counting this as a main image
    }
    
    // Main image position detection
    const imgBottom = img.style.y + img.style.height;
    if (imgBottom > bottomThreshold) {
      pattern.imageAtBottom = true;
    }
    if (img.style.y < topThreshold) {
      pattern.imageAtTop = true;
    }
  }
  
  // Check text positions
  let textInMiddleCount = 0;
  let textAtTopCount = 0;
  
  for (const text of textElements) {
    const textCenter = text.style.y + (text.style.height / 2);
    if (textCenter > topThreshold && textCenter < bottomThreshold) {
      textInMiddleCount++;
    }
    if (text.style.y < topThreshold) {
      textAtTopCount++;
    }
  }
  
  pattern.textInMiddle = textInMiddleCount > 0;
  pattern.textAtTop = textAtTopCount > 0;
  
  // Check button/CTA positions
  for (const btn of buttons) {
    const btnBottom = btn.style.y + btn.style.height;
    if (btnBottom > bottomThreshold) {
      pattern.ctaAtBottom = true;
    }
    if (btn.style.x > rightThreshold) {
      pattern.ctaAtRight = true;
    }
  }
  
  return pattern;
}

/**
 * Applies appropriate constraints based on detected layout pattern
 */
function applyLayoutConstraints(
  elements: EditorElement[], 
  layout: LayoutDescriptor,
  canvasSize: BannerSize
): EditorElement[] {
  return elements.map(element => {
    // Skip elements that already have explicit constraints
    if (element.style.constraintHorizontal && element.style.constraintVertical) {
      return element;
    }
    
    let horizontalConstraint: "left" | "right" | "center" | "scale" = "left";
    let verticalConstraint: "top" | "bottom" | "center" | "scale" = "top";
    
    // Apply constraints based on element type and detected layout
    if (element.type === 'image') {
      // Handle image constraints
      if (layout.imagePosition === 'bottom' || isElementAtBottom(element, canvasSize)) {
        verticalConstraint = 'bottom';
      } else if (layout.imagePosition === 'top' || isElementAtTop(element, canvasSize)) {
        verticalConstraint = 'top';
      }
      
      // Center large images horizontally
      if (element.style.width > canvasSize.width * 0.7) {
        horizontalConstraint = 'center';
      }
      
      // Images that span most of the width
      if (element.style.width > canvasSize.width * 0.9) {
        horizontalConstraint = 'scale';
      }
    }
    else if (element.type === 'text') {
      // Title or large text is often important to place properly
      if (element.style.fontSize && element.style.fontSize > 20) {
        if (isElementNearCenter(element, canvasSize)) {
          horizontalConstraint = 'center';
        }
      }
      
      // Text at the bottom
      if (isElementAtBottom(element, canvasSize)) {
        verticalConstraint = 'bottom';
      }
    }
    else if (element.type === 'button' || 
            (element.type === 'container' && element.style?.backgroundColor === '#2563eb')) {
      // CTAs and buttons
      if (layout.ctaPosition === 'bottom-right' || 
          (isElementAtBottom(element, canvasSize) && isElementAtRight(element, canvasSize))) {
        verticalConstraint = 'bottom';
        horizontalConstraint = 'right';
      } else if (layout.ctaPosition === 'bottom-center' || 
                 (isElementAtBottom(element, canvasSize) && isElementNearCenter(element, canvasSize))) {
        verticalConstraint = 'bottom';
        horizontalConstraint = 'center';
      }
    }
    
    // Apply the detected constraints
    return {
      ...element,
      style: {
        ...element.style,
        constraintHorizontal: horizontalConstraint,
        constraintVertical: verticalConstraint
      }
    };
  });
}

// Helper functions for position detection
function isElementAtBottom(element: EditorElement, canvasSize: BannerSize): boolean {
  const bottomThreshold = canvasSize.height * 0.7;
  return (element.style.y + element.style.height) > bottomThreshold;
}

function isElementAtTop(element: EditorElement, canvasSize: BannerSize): boolean {
  const topThreshold = canvasSize.height * 0.3;
  return element.style.y < topThreshold;
}

function isElementAtRight(element: EditorElement, canvasSize: BannerSize): boolean {
  const rightThreshold = canvasSize.width * 0.7;
  return element.style.x > rightThreshold;
}

function isElementNearCenter(element: EditorElement, canvasSize: BannerSize): boolean {
  const elementCenterX = element.style.x + (element.style.width / 2);
  const canvasCenterX = canvasSize.width / 2;
  return Math.abs(elementCenterX - canvasCenterX) < (canvasSize.width * 0.2);
}
