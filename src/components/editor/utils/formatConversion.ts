
import { BannerSize, EditorElement, getOrientation } from "../types";
import { toast } from "sonner";

/**
 * Copia um elemento de um formato para outro com ajustes específicos
 */
export const copyElementToFormat = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): EditorElement => {
  const sourceOrientation = getOrientation(sourceSize);
  const targetOrientation = getOrientation(targetSize);
  
  // Calcular novas dimensões e posições
  let newStyle: Partial<EditorElement['style']> = {};
  
  // Scale factors
  const widthRatio = targetSize.width / sourceSize.width;
  const heightRatio = targetSize.height / sourceSize.height;
  
  // Determinar posição e tamanho base
  if (sourceOrientation === targetOrientation) {
    // Mesma orientação: aplicar escala proporcional
    newStyle = {
      x: Math.round(element.style.x * widthRatio),
      y: Math.round(element.style.y * heightRatio),
      width: Math.round(element.style.width * widthRatio),
      height: Math.round(element.style.height * heightRatio)
    };
  } else if (element.type === 'artboard-background') {
    // Para backgrounds de artboard, sempre cobrir todo o espaço
    newStyle = {
      x: 0,
      y: 0,
      width: targetSize.width,
      height: targetSize.height
    };
  } else if (
    (sourceOrientation === 'vertical' && targetOrientation === 'horizontal') ||
    (sourceOrientation === 'horizontal' && targetOrientation === 'vertical')
  ) {
    // Conversão entre horizontal e vertical
    
    // Calcular posição vertical relativa (0-1) no formato original
    const verticalPosition = element.style.y / sourceSize.height;
    
    if (element.type === 'image' || element.type === 'logo') {
      // Para imagens, preservar proporção e ajustar tamanho
      const aspectRatio = element.style.width / element.style.height;
      let newWidth, newHeight;
      
      if (sourceOrientation === 'vertical' && targetOrientation === 'horizontal') {
        // Vertical para horizontal
        newHeight = targetSize.height * 0.7; // 70% da altura do alvo
        newWidth = newHeight * aspectRatio;
        
        // Posicionar horizontalmente com base na posição vertical original
        newStyle = {
          x: Math.round(verticalPosition * (targetSize.width - newWidth)),
          y: Math.round((targetSize.height - newHeight) / 2), // Centralizar verticalmente
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        };
      } else {
        // Horizontal para vertical
        newWidth = targetSize.width * 0.8; // 80% da largura do alvo
        newHeight = newWidth / aspectRatio;
        
        // Posicionar verticalmente com base na posição horizontal relativa
        const horizontalPosition = element.style.x / sourceSize.width;
        newStyle = {
          x: Math.round((targetSize.width - newWidth) / 2), // Centralizar horizontalmente
          y: Math.round(horizontalPosition * (targetSize.height - newHeight)),
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        };
      }
    } else if (element.type === 'text') {
      // Para textos, ajustar tamanho e posição
      if (sourceOrientation === 'vertical' && targetOrientation === 'horizontal') {
        // Vertical para horizontal: textos vão do topo para esquerda, ou base para direita
        const isTopHalf = element.style.y < sourceSize.height / 2;
        
        if (isTopHalf) {
          // Elementos do topo vão para a esquerda
          newStyle = {
            x: Math.round(targetSize.width * 0.1), // 10% da largura
            y: Math.round(targetSize.height * 0.3), // 30% da altura
            width: Math.round(targetSize.width * 0.4), // 40% da largura
            height: Math.round(targetSize.height * 0.4) // 40% da altura
          };
        } else {
          // Elementos da base vão para a direita
          newStyle = {
            x: Math.round(targetSize.width * 0.55), // 55% da largura
            y: Math.round(targetSize.height * 0.3), // 30% da altura
            width: Math.round(targetSize.width * 0.4), // 40% da largura
            height: Math.round(targetSize.height * 0.4) // 40% da altura
          };
        }
        
        // Ajustar tamanho da fonte proporcionalmente
        if (element.style.fontSize) {
          newStyle.fontSize = Math.max(12, Math.round(element.style.fontSize * (widthRatio + heightRatio) / 2));
        }
      } else {
        // Horizontal para vertical: textos vão da esquerda para o topo, ou direita para base
        const isLeftHalf = element.style.x < sourceSize.width / 2;
        
        if (isLeftHalf) {
          // Elementos da esquerda vão para o topo
          newStyle = {
            x: Math.round(targetSize.width * 0.1), // 10% da largura
            y: Math.round(targetSize.height * 0.1), // 10% da altura
            width: Math.round(targetSize.width * 0.8), // 80% da largura
            height: Math.round(targetSize.height * 0.2) // 20% da altura
          };
        } else {
          // Elementos da direita vão para a base
          newStyle = {
            x: Math.round(targetSize.width * 0.1), // 10% da largura
            y: Math.round(targetSize.height * 0.7), // 70% da altura
            width: Math.round(targetSize.width * 0.8), // 80% da largura
            height: Math.round(targetSize.height * 0.2) // 20% da altura
          };
        }
        
        // Ajustar tamanho da fonte proporcionalmente
        if (element.style.fontSize) {
          newStyle.fontSize = Math.max(12, Math.round(element.style.fontSize * (widthRatio + heightRatio) / 2));
        }
      }
    } else if (element.type === 'button') {
      // Para botões, ajustar tamanho e posição
      if (sourceOrientation === 'vertical' && targetOrientation === 'horizontal') {
        // Vertical para horizontal: botões geralmente vão para a direita e abaixo
        newStyle = {
          x: Math.round(targetSize.width * 0.6), // 60% da largura
          y: Math.round(targetSize.height * 0.6), // 60% da altura
          width: Math.round(targetSize.width * 0.3), // 30% da largura
          height: Math.round(targetSize.height * 0.15) // 15% da altura
        };
      } else {
        // Horizontal para vertical: botões geralmente vão para a base centralizada
        newStyle = {
          x: Math.round(targetSize.width * 0.25), // 25% da largura
          y: Math.round(targetSize.height * 0.8), // 80% da altura
          width: Math.round(targetSize.width * 0.5), // 50% da largura
          height: Math.round(targetSize.height * 0.08) // 8% da altura
        };
      }
    } else {
      // Para outros elementos, usar estratégia padrão
      if (sourceOrientation === 'vertical' && targetOrientation === 'horizontal') {
        // Vertical para horizontal
        newStyle = {
          x: Math.round(verticalPosition * targetSize.width),
          y: Math.round(targetSize.height * 0.3),
          width: Math.round(targetSize.width * 0.3),
          height: Math.round(targetSize.height * 0.4)
        };
      } else {
        // Horizontal para vertical
        const horizontalPosition = element.style.x / sourceSize.width;
        newStyle = {
          x: Math.round(targetSize.width * 0.3),
          y: Math.round(horizontalPosition * targetSize.height),
          width: Math.round(targetSize.width * 0.4),
          height: Math.round(targetSize.height * 0.3)
        };
      }
    }
  } else {
    // Conversão para/de formatos quadrados
    // Aplicar escala proporcional com ajustes
    newStyle = {
      x: Math.round(element.style.x * widthRatio),
      y: Math.round(element.style.y * heightRatio),
      width: Math.round(element.style.width * widthRatio),
      height: Math.round(element.style.height * heightRatio)
    };
  }
  
  // Ajustar tamanho de fonte para textos, se não foi definido acima
  if (element.type === 'text' && element.style.fontSize && !newStyle.fontSize) {
    // Usar uma média ponderada dos fatores de escala para determinar o novo tamanho da fonte
    const scaleFactor = (widthRatio + heightRatio) / 2;
    newStyle.fontSize = Math.max(12, Math.round(element.style.fontSize * scaleFactor));
  }
  
  // Criar um novo elemento com os estilos específicos para este formato
  const newElement: EditorElement = {
    ...element,
    id: element.id, // Manter o mesmo ID para identificar como o mesmo elemento
    formatSpecificStyles: {
      ...(element.formatSpecificStyles || {}),
      [targetSize.name]: newStyle
    }
  };
  
  return newElement;
};

/**
 * Copiar estilos específicos de um elemento para todos os formatos ativos
 */
export const copyElementToAllFormats = (
  element: EditorElement,
  sourceSize: BannerSize,
  activeSizes: BannerSize[]
): EditorElement => {
  // Começar com o elemento original
  let updatedElement = { ...element };
  
  // Aplicar para cada formato ativo
  activeSizes.forEach(targetSize => {
    // Pular o formato de origem
    if (targetSize.name === sourceSize.name) return;
    
    // Criar estilos específicos para este formato
    const adaptedElement = copyElementToFormat(element, sourceSize, targetSize);
    
    // Atualizar o elemento com os novos estilos específicos
    updatedElement = {
      ...updatedElement,
      formatSpecificStyles: {
        ...(updatedElement.formatSpecificStyles || {}),
        [targetSize.name]: adaptedElement.formatSpecificStyles?.[targetSize.name] || {}
      }
    };
  });
  
  toast.success('Elemento adaptado para todos os formatos');
  return updatedElement;
};

/**
 * Limpar estilos específicos de formato para um elemento
 */
export const clearFormatSpecificStyles = (
  element: EditorElement,
  formatName?: string
): EditorElement => {
  if (!element.formatSpecificStyles) {
    return element;
  }
  
  if (formatName) {
    // Limpar apenas um formato específico
    const { [formatName]: _, ...remainingStyles } = element.formatSpecificStyles;
    return {
      ...element,
      formatSpecificStyles: remainingStyles
    };
  } else {
    // Limpar todos os formatos
    return {
      ...element,
      formatSpecificStyles: {}
    };
  }
};

/**
 * Verificar se um elemento possui estilos específicos para um formato
 */
export const hasFormatSpecificStyles = (
  element: EditorElement,
  formatName: string
): boolean => {
  return !!(element.formatSpecificStyles && element.formatSpecificStyles[formatName]);
};

/**
 * Obter o estilo combinado de um elemento para um formato específico
 */
export const getCombinedStyleForFormat = (
  element: EditorElement,
  formatName: string
): EditorElement['style'] => {
  const baseStyle = element.style;
  const formatStyle = element.formatSpecificStyles?.[formatName] || {};
  
  return {
    ...baseStyle,
    ...formatStyle
  };
};
