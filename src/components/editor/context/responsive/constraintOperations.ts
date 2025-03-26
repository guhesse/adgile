
import { EditorElement, BannerSize } from '../../types';

// Type for constraint detection results
interface ConstraintDetectionResult {
  horizontalConstraint: "left" | "right" | "center" | "scale";
  verticalConstraint: "top" | "bottom" | "center" | "scale";
}

// Function to detect an element's constraints based on its position
export const detectElementConstraints = (element: EditorElement): ConstraintDetectionResult => {
  const { style } = element;
  
  // Default constraints
  const result: ConstraintDetectionResult = {
    horizontalConstraint: "left",
    verticalConstraint: "top"
  };
  
  // Define thresholds for constraint detection
  const EDGE_THRESHOLD = 20; // pixels from edge
  const CENTER_THRESHOLD = 30; // pixels from center
  
  // Detect horizontal constraint
  if (style.xPercent !== undefined && style.xPercent > 0) {
    // If element's left edge is close to the left edge of the artboard
    if (style.x < EDGE_THRESHOLD) {
      result.horizontalConstraint = "left";
    }
    // If element's right edge is close to the right edge of the artboard
    else if (style.xPercent > 85) {
      result.horizontalConstraint = "right";
    }
    // If element is roughly centered horizontally
    else if (Math.abs(style.xPercent - 50) < CENTER_THRESHOLD) {
      result.horizontalConstraint = "center";
    }
    // If element takes up a large portion of the width
    else if (style.widthPercent && style.widthPercent > 80) {
      result.horizontalConstraint = "scale";
    }
  }
  
  // Detect vertical constraint
  if (style.yPercent !== undefined && style.yPercent > 0) {
    // If element's top edge is close to the top edge of the artboard
    if (style.y < EDGE_THRESHOLD) {
      result.verticalConstraint = "top";
    }
    // If element's bottom edge is close to the bottom edge of the artboard
    else if (style.yPercent > 85) {
      result.verticalConstraint = "bottom";
    }
    // If element is roughly centered vertically
    else if (Math.abs(style.yPercent - 50) < CENTER_THRESHOLD) {
      result.verticalConstraint = "center";
    }
    // If element takes up a large portion of the height
    else if (style.heightPercent && style.heightPercent > 80) {
      result.verticalConstraint = "scale";
    }
  }
  
  return result;
};

// Determine if a banner size has a vertical orientation
const isVerticalOrientation = (size: BannerSize): boolean => {
  return size.height > size.width;
};

// Apply responsive transformation based on constraints and orientation
export const applyResponsiveTransformation = (
  element: EditorElement, 
  sourceSize: BannerSize, 
  targetSize: BannerSize
): EditorElement => {
  // Clone the element to avoid mutating the original
  const transformedElement = { ...element, style: { ...element.style } };
  const { style } = transformedElement;
  
  // Determine orientation of source and target
  const sourceIsVertical = isVerticalOrientation(sourceSize);
  const targetIsVertical = isVerticalOrientation(targetSize);
  
  // Check if we're transforming between different orientations
  const isOrientationChange = sourceIsVertical !== targetIsVertical;
  
  // Apply transformations based on constraints
  let horizontalConstraint = style.constraintHorizontal || "left";
  let verticalConstraint = style.constraintVertical || "top";

  const sourceWidth = sourceSize.width;
  const sourceHeight = sourceSize.height;
  const targetWidth = targetSize.width;
  const targetHeight = targetSize.height;
  
  // Calculate width and height scaling
  const widthScale = targetWidth / sourceWidth;
  const heightScale = targetHeight / sourceHeight;
  
  // For orientation changes, we need to adapt constraint strategies
  if (isOrientationChange) {
    // Apply special transformation for orientation changes
    return applyOrientationChangeTransformation(
      element, 
      sourceSize, 
      targetSize
    );
  }
  
  // Standard transformation for same orientation
  
  // Calculate new dimensions
  if (horizontalConstraint === "scale") {
    style.width = style.width * widthScale;
  }
  
  if (verticalConstraint === "scale") {
    style.height = style.height * heightScale;
  }
  
  // Calculate new position based on constraints
  switch (horizontalConstraint) {
    case "left":
      style.x = style.x * widthScale;
      break;
    case "right":
      style.x = targetWidth - (sourceWidth - style.x) * widthScale;
      break;
    case "center":
      style.x = (targetWidth / 2) + ((style.x - (sourceWidth / 2)) * widthScale);
      break;
    case "scale":
      // For scale, we keep the same percentage position
      style.x = (style.x / sourceWidth) * targetWidth;
      break;
  }
  
  switch (verticalConstraint) {
    case "top":
      style.y = style.y * heightScale;
      break;
    case "bottom":
      style.y = targetHeight - (sourceHeight - style.y) * heightScale;
      break;
    case "center":
      style.y = (targetHeight / 2) + ((style.y - (sourceHeight / 2)) * heightScale);
      break;
    case "scale":
      // For scale, we keep the same percentage position
      style.y = (style.y / sourceHeight) * targetHeight;
      break;
  }
  
  // Special handling for text elements to scale font size
  if (element.type === 'text' && style.fontSize) {
    // Scale font size but ensure minimum legibility
    const fontScale = Math.min(widthScale, heightScale);
    style.fontSize = Math.max(style.fontSize * fontScale, 10); // minimum 10px font size
  }
  
  // Update percentage values
  style.xPercent = (style.x / targetWidth) * 100;
  style.yPercent = (style.y / targetHeight) * 100;
  style.widthPercent = (style.width / targetWidth) * 100;
  style.heightPercent = (style.height / targetHeight) * 100;
  
  return transformedElement;
};

// Special transformation for orientation changes (vertical to horizontal or vice versa)
const applyOrientationChangeTransformation = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): EditorElement => {
  // Clone the element to avoid mutating the original
  const transformedElement = { ...element, style: { ...element.style } };
  const { style } = transformedElement;
  
  const sourceIsVertical = isVerticalOrientation(sourceSize);
  const sourceWidth = sourceSize.width;
  const sourceHeight = sourceSize.height;
  const targetWidth = targetSize.width;
  const targetHeight = targetSize.height;
  
  // Calculate element's position in source as percentages
  const xPercent = (style.x / sourceWidth) * 100;
  const yPercent = (style.y / sourceHeight) * 100;
  const widthPercent = (style.width / sourceWidth) * 100;
  const heightPercent = (style.height / sourceHeight) * 100;
  
  // Analisar o tipo de elemento para determinar o melhor tratamento
  const isImageType = element.type === 'image' || element.type === 'logo';
  const isTextType = element.type === 'text' || element.type === 'paragraph';
  const isButtonType = element.type === 'button';
  const isBackgroundElement = (widthPercent > 90 && heightPercent > 90) || 
                             element.style.backgroundColor === sourceSize.backgroundColor;
  
  // Get element's aspect ratio
  const aspectRatio = style.width / style.height;
  
  if (sourceIsVertical) {
    // VERTICAL TO HORIZONTAL TRANSFORMATION
    
    if (isBackgroundElement) {
      // Elementos de fundo devem ocupar todo o espaço disponível
      style.x = 0;
      style.y = 0;
      style.width = targetWidth;
      style.height = targetHeight;
    } 
    else if (widthPercent > 90) {
      // Elementos que ocupam toda a largura vão para o topo com largura completa
      style.x = 0;
      style.y = 0;
      style.width = targetWidth;
      style.height = Math.min(targetHeight * 0.25, style.height * (targetWidth / sourceWidth));
    }
    else if (heightPercent > 90) {
      // Elementos que ocupam toda a altura vão para a esquerda com altura completa
      style.x = 0;
      style.y = 0;
      style.width = Math.min(targetWidth * 0.3, style.width * (targetHeight / sourceHeight));
      style.height = targetHeight;
    }
    else {
      // Determinar em qual metade vertical o elemento está
      const isTopHalf = yPercent < 50;
      
      if (isTopHalf) {
        // Elementos na metade superior vão para a esquerda
        style.x = Math.min(targetWidth * 0.05, style.width * 0.1);
        style.y = targetHeight * (yPercent / 100);
        
        if (isImageType) {
          // Imagens na metade superior são posicionadas à esquerda e mantêm proporção
          style.width = Math.min(targetWidth * 0.45, style.width);
          style.height = style.width / aspectRatio;
        } 
        else if (isTextType) {
          // Textos na metade superior são posicionados à esquerda e ocupam ~40% da largura
          style.width = Math.min(targetWidth * 0.4, style.width);
          style.height = Math.min(targetHeight * 0.4, style.height);
          
          // Ajustar tamanho da fonte para textos
          if (style.fontSize) {
            // Aumentar tamanho da fonte para o formato horizontal, mas não excessivamente
            const baseSize = style.fontSize;
            style.fontSize = Math.min(baseSize * 1.2, 24);
          }
        }
        else if (isButtonType) {
          // Botões devem manter um tamanho proporcional ao espaço disponível
          style.y = style.y * (targetHeight / sourceHeight);
          style.width = Math.min(targetWidth * 0.25, style.width * 1.2);
        }
      } 
      else {
        // Elementos na metade inferior vão para a direita
        style.x = targetWidth * 0.6;
        style.y = targetHeight * ((yPercent - 50) / 50);
        
        if (isImageType) {
          // Imagens na metade inferior são posicionadas à direita e mantêm proporção
          style.width = Math.min(targetWidth * 0.45, style.width);
          style.height = style.width / aspectRatio;
        } 
        else if (isTextType) {
          // Textos na metade inferior são posicionados à direita
          style.width = Math.min(targetWidth * 0.35, style.width);
          style.height = Math.min(targetHeight * 0.4, style.height);
          
          // Ajustar tamanho da fonte para textos
          if (style.fontSize) {
            const baseSize = style.fontSize;
            style.fontSize = Math.min(baseSize * 1.2, 20);
          }
        }
        else if (isButtonType) {
          // Botões na parte inferior vão para baixo à direita
          style.x = targetWidth - style.width - 20;
          style.y = targetHeight - style.height - 20;
        }
      }
    }
  } 
  else {
    // HORIZONTAL TO VERTICAL TRANSFORMATION
    
    if (isBackgroundElement) {
      // Elementos de fundo devem ocupar todo o espaço disponível
      style.x = 0;
      style.y = 0;
      style.width = targetWidth;
      style.height = targetHeight;
    } 
    else if (widthPercent > 90) {
      // Elementos que ocupam toda a largura vão para o topo com largura completa
      style.x = 0;
      style.y = 0;
      style.width = targetWidth;
      style.height = Math.min(targetHeight * 0.15, style.height * (targetWidth / sourceWidth));
    }
    else if (heightPercent > 90) {
      // Elementos que ocupam toda a altura vão para o topo e ocupam toda a largura
      style.x = 0;
      style.y = 0;
      style.width = targetWidth;
      style.height = Math.min(targetHeight * 0.6, style.height * (targetWidth / sourceWidth));
    }
    else {
      // Determinar em qual metade horizontal o elemento está
      const isLeftHalf = xPercent < 50;
      
      if (isLeftHalf) {
        // Elementos na metade esquerda vão para a parte superior
        style.x = targetWidth * (xPercent / 100);
        style.y = targetHeight * 0.05;
        
        if (isImageType) {
          // Imagens na metade esquerda são posicionadas no topo e mantêm proporção
          style.width = Math.min(targetWidth * 0.9, style.width * (targetWidth / sourceWidth));
          style.height = style.width / aspectRatio;
        } 
        else if (isTextType) {
          // Textos na metade esquerda vão para o topo
          style.x = targetWidth * 0.05;
          style.width = targetWidth * 0.9;
          style.height = Math.min(targetHeight * 0.25, style.height);
          
          // Ajustar tamanho da fonte para textos
          if (style.fontSize) {
            // Reduzir tamanho da fonte para o formato vertical
            const baseSize = style.fontSize;
            style.fontSize = Math.max(baseSize * 0.9, 12);
          }
        }
        else if (isButtonType) {
          // Botões devem manter um tamanho proporcional
          style.width = Math.min(targetWidth * 0.4, style.width);
          style.y = targetHeight * 0.4;
        }
      } 
      else {
        // Elementos na metade direita vão para a parte inferior
        style.x = targetWidth * ((xPercent - 50) / 50);
        style.y = targetHeight * 0.6;
        
        if (isImageType) {
          // Imagens na metade direita são posicionadas abaixo e mantêm proporção
          style.width = Math.min(targetWidth * 0.9, style.width * (targetWidth / sourceWidth));
          style.height = style.width / aspectRatio;
          style.x = (targetWidth - style.width) / 2; // Centralizar horizontalmente
        } 
        else if (isTextType) {
          // Textos na metade direita vão para baixo
          style.x = targetWidth * 0.05;
          style.width = targetWidth * 0.9;
          style.height = Math.min(targetHeight * 0.2, style.height);
          
          // Ajustar tamanho da fonte para textos
          if (style.fontSize) {
            const baseSize = style.fontSize;
            style.fontSize = Math.max(baseSize * 0.8, 10);
          }
        }
        else if (isButtonType) {
          // Botões na parte direita vão para o final
          style.x = (targetWidth - style.width) / 2; // Centralizar horizontalmente
          style.y = targetHeight - style.height - 20;
        }
      }
    }
  }
  
  // Ensure elements are within canvas boundaries
  style.x = Math.max(0, Math.min(style.x, targetWidth - style.width));
  style.y = Math.max(0, Math.min(style.y, targetHeight - style.height));
  
  // Update percentage values
  style.xPercent = (style.x / targetWidth) * 100;
  style.yPercent = (style.y / targetHeight) * 100;
  style.widthPercent = (style.width / targetWidth) * 100;
  style.heightPercent = (style.height / targetHeight) * 100;
  
  return transformedElement;
};

// Explicitly set constraints for an element
export const setElementConstraints = (
  element: EditorElement, 
  constraints: { 
    horizontal: "left" | "right" | "center" | "scale", 
    vertical: "top" | "bottom" | "center" | "scale" 
  }
): EditorElement => {
  // Clone the element to avoid mutating the original
  const updatedElement = { ...element, style: { ...element.style } };
  
  // Set the constraints
  updatedElement.style.constraintHorizontal = constraints.horizontal;
  updatedElement.style.constraintVertical = constraints.vertical;
  
  return updatedElement;
};
