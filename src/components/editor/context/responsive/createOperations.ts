
import { EditorElement, BannerSize } from "../../types";
import { analyzeElementPosition, applyTransformationMatrix } from "../../utils/grid/responsivePosition";

/**
 * Determina se um banner tem orientação vertical
 */
const isVerticalBanner = (size: BannerSize): boolean => {
  return size.height > size.width;
};

/**
 * Determina se um elemento está na metade superior de um banner vertical
 */
const isInUpperHalf = (element: EditorElement, size: BannerSize): boolean => {
  const elementMidY = element.style.y + (element.style.height / 2);
  return elementMidY < (size.height / 2);
};

/**
 * Adapta elemento com base na mudança de orientação entre banners
 */
const adaptElementForOrientationChange = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number, y: number, width: number, height: number } => {
  const sourceIsVertical = isVerticalBanner(sourceSize);
  const targetIsVertical = isVerticalBanner(targetSize);
  
  // Se ambos têm a mesma orientação, usar transformação padrão
  if (sourceIsVertical === targetIsVertical) {
    return applyTransformationMatrix(element, sourceSize, targetSize);
  }
  
  // Calculando valores percentuais no source
  const xPercent = (element.style.x / sourceSize.width) * 100;
  const yPercent = (element.style.y / sourceSize.height) * 100;
  const widthPercent = (element.style.width / sourceSize.width) * 100;
  const heightPercent = (element.style.height / sourceSize.height) * 100;
  
  let newX, newY, newWidth, newHeight;
  
  // De vertical para horizontal
  if (sourceIsVertical && !targetIsVertical) {
    const isUpper = isInUpperHalf(element, sourceSize);
    
    if (isUpper) {
      // Elementos superiores vão para o lado esquerdo
      newX = (targetSize.width * 0.25) - (element.style.width * targetSize.width / sourceSize.width / 2);
      newY = (targetSize.height * yPercent / 100);
    } else {
      // Elementos inferiores vão para o lado direito
      newX = (targetSize.width * 0.75) - (element.style.width * targetSize.width / sourceSize.width / 2);
      newY = (targetSize.height * (yPercent - 50) / 50);
    }
    
    // Ajuste especial para elementos que ocupam toda a largura
    if (widthPercent > 90) {
      newWidth = targetSize.width * 0.4;
      newHeight = (newWidth * element.style.height) / element.style.width;
    } else {
      // Cálculo proporcional padrão
      newWidth = element.style.width * targetSize.width / sourceSize.width;
      newHeight = element.style.height * targetSize.height / sourceSize.height;
    }
    
    // Ajustes para tipos específicos de elementos
    if (element.type === 'text') {
      // Textos podem precisar de ajustes adicionais
      const scaleFactor = Math.min(targetSize.width / sourceSize.width, targetSize.height / sourceSize.height);
      if (element.style.fontSize) {
        // Ajustar o tamanho da fonte proporcionalmente, com um fator mínimo
        const minFontScale = 0.7;
        const fontScale = Math.max(scaleFactor, minFontScale);
      }
    } else if (element.type === 'image' || element.type === 'logo') {
      // Preservar proporção para imagens
      if (element.style.originalWidth && element.style.originalHeight) {
        const aspectRatio = element.style.originalWidth / element.style.originalHeight;
        newHeight = newWidth / aspectRatio;
      }
    }
  } 
  // De horizontal para vertical
  else if (!sourceIsVertical && targetIsVertical) {
    const isLeft = element.style.x < (sourceSize.width / 2);
    
    if (isLeft) {
      // Elementos da esquerda vão para a parte superior
      newX = (targetSize.width * xPercent / 100);
      newY = (targetSize.height * 0.25) - (element.style.height * targetSize.height / sourceSize.height / 2);
    } else {
      // Elementos da direita vão para a parte inferior
      newX = (targetSize.width * (xPercent - 50) / 50);
      newY = (targetSize.height * 0.75) - (element.style.height * targetSize.height / sourceSize.height / 2);
    }
    
    // Ajuste especial para elementos que ocupam toda a altura
    if (heightPercent > 90) {
      newHeight = targetSize.height * 0.4;
      newWidth = (newHeight * element.style.width) / element.style.height;
    } else {
      // Cálculo proporcional padrão
      newWidth = element.style.width * targetSize.width / sourceSize.width;
      newHeight = element.style.height * targetSize.height / sourceSize.height;
    }
    
    // Ajustes para tipos específicos de elementos
    if (element.type === 'text') {
      // Ajustes de texto para orientação vertical
      const scaleFactor = Math.min(targetSize.width / sourceSize.width, targetSize.height / sourceSize.height);
      if (element.style.fontSize) {
        // Ajustar o tamanho da fonte proporcionalmente, com um fator mínimo
        const minFontScale = 0.7;
        const fontScale = Math.max(scaleFactor, minFontScale);
      }
    } else if (element.type === 'image' || element.type === 'logo') {
      // Preservar proporção para imagens
      if (element.style.originalWidth && element.style.originalHeight) {
        const aspectRatio = element.style.originalWidth / element.style.originalHeight;
        newHeight = newWidth / aspectRatio;
      }
    }
  }
  
  // Garantir que os valores sejam numéricos e arredondados
  return {
    x: Math.round(newX || 0),
    y: Math.round(newY || 0),
    width: Math.round(newWidth || element.style.width),
    height: Math.round(newHeight || element.style.height)
  };
};

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
    _originalSize: { width: selectedSize.width, height: selectedSize.height },
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
    
    // Apply special adaptations based on orientation changes
    const { x, y, width, height } = adaptElementForOrientationChange(
      updatedElement,
      selectedSize,
      size
    );
    
    // Calculate new percentage values for the target size
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
        _originalSize: { width: selectedSize.width, height: selectedSize.height },
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
        // Determinar se há mudança de orientação
        const isOrientationChange = isVerticalBanner(selectedSize) !== isVerticalBanner(size);
        
        // Calcular fator de escala com base na mudança de dimensões
        const widthRatio = size.width / selectedSize.width;
        const heightRatio = size.height / selectedSize.height;
        
        // Usar fatores diferentes para mudanças de orientação
        let fontScaleFactor;
        if (isOrientationChange) {
          // Para mudanças de orientação, considerar a menor dimensão
          fontScaleFactor = Math.min(widthRatio, heightRatio) * 0.85;
        } else {
          // Para mesma orientação, usar escala proporcional
          fontScaleFactor = (widthRatio + heightRatio) / 2;
        }
        
        // Aplicar escala com limite mínimo e máximo
        const minScale = 0.7; // Não reduzir fonte abaixo de 70% do original
        const maxScale = 1.3; // Não aumentar fonte acima de 130% do original
        fontScaleFactor = Math.max(minScale, Math.min(maxScale, fontScaleFactor));
        
        adjustedFontSize = element.style.fontSize * fontScaleFactor;
        adjustedFontSize = Math.max(adjustedFontSize, 9); // Garantir tamanho mínimo legível
      }
      
      linkedElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        _originalSize: { width: selectedSize.width, height: selectedSize.height },
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
