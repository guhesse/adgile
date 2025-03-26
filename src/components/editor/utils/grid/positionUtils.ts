
import { EditorElement } from "../../types";
import { absoluteToPercentage, percentageToAbsolute, snapToGrid } from "./gridCore";

// Converter posições de elemento para baseadas em porcentagem
export const convertElementToPercentage = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  const percentX = absoluteToPercentage(element.style.x, canvasWidth);
  const percentY = absoluteToPercentage(element.style.y, canvasHeight);
  const percentWidth = absoluteToPercentage(element.style.width, canvasWidth);
  const percentHeight = absoluteToPercentage(element.style.height, canvasHeight);

  return {
    ...element,
    style: {
      ...element.style,
      xPercent: percentX,
      yPercent: percentY,
      widthPercent: percentWidth,
      heightPercent: percentHeight
    }
  };
};

// Converter posições percentuais para absolutas (para um tamanho específico de canvas)
export const applyPercentageToElement = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): EditorElement => {
  // Apenas aplicar se valores percentuais existirem
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    // Calcular valores absolutos a partir das porcentagens
    const x = percentageToAbsolute(element.style.xPercent, canvasWidth);
    const y = percentageToAbsolute(element.style.yPercent, canvasHeight);
    const width = percentageToAbsolute(element.style.widthPercent, canvasWidth);
    const height = percentageToAbsolute(element.style.heightPercent, canvasHeight);
    
    // Se for imagem, ajustar altura para manter proporção
    let adjustedHeight = height;
    if ((element.type === "image" || element.type === "logo") && element.style.originalWidth && element.style.originalHeight) {
      const aspectRatio = element.style.originalWidth / element.style.originalHeight;
      adjustedHeight = width / aspectRatio;
    }
    
    return {
      ...element,
      style: {
        ...element.style,
        x: x,
        y: y,
        width: width,
        height: element.type === "image" || element.type === "logo" ? adjustedHeight : height
      }
    };
  }
  return element;
};

// Posicionamento inteligente: Encontrar a posição ideal para um elemento em diferentes tamanhos de canvas
export const findOptimalPosition = (
  element: EditorElement,
  canvasWidth: number,
  canvasHeight: number
): { x: number, y: number, width: number, height: number } => {
  // Se este elemento já tem valores percentuais, usá-los
  if (
    element.style.xPercent !== undefined &&
    element.style.yPercent !== undefined &&
    element.style.widthPercent !== undefined &&
    element.style.heightPercent !== undefined
  ) {
    // Converter porcentagens para tamanho atual da prancheta
    let x = (element.style.xPercent * canvasWidth) / 100;
    let y = (element.style.yPercent * canvasHeight) / 100;
    let width = (element.style.widthPercent * canvasWidth) / 100;
    let height = (element.style.heightPercent * canvasHeight) / 100;
    
    // Se for uma imagem, manter proporção
    if (element.type === "image" || element.type === "logo") {
      const aspectRatio = element.style.originalWidth && element.style.originalHeight 
        ? element.style.originalWidth / element.style.originalHeight
        : element.style.width / element.style.height;
      
      height = width / aspectRatio;
    }
    
    // Verificar alinhamento inferior
    const isBottomAligned = element.style.yPercent + element.style.heightPercent > 95;
    if (isBottomAligned) {
      y = canvasHeight - height;
    }
    
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: snapToGrid(width),
      height: snapToGrid(height)
    };
  }

  // Se não tiver valores percentuais, calcular posições relativas
  
  // Calcular porcentagens com base na largura de referência
  const widthPercent = (element.style.width / 600) * 100; // Usando 600 como largura de referência
  const width = (widthPercent * canvasWidth) / 100;
  
  // Se elemento for um texto, centralizá-lo horizontalmente
  if (element.type === "text" || element.type === "paragraph") {
    const heightPercent = (element.style.height / 600) * 100;
    const height = (heightPercent * canvasHeight) / 100;
    const x = (canvasWidth - width) / 2;
    
    return {
      x: snapToGrid(x),
      y: element.style.y,
      width: snapToGrid(width),
      height: snapToGrid(height)
    };
  }

  // Se elemento for uma imagem ou logo, manter proporção
  if (element.type === "image" || element.type === "logo") {
    const aspectRatio = element.style.width / element.style.height;
    const height = width / aspectRatio;
    
    // Centralizá-lo
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 3; // Posicionar no terço superior
    
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: snapToGrid(width),
      height: snapToGrid(height)
    };
  }

  // Padrão: escalar pelo tamanho do canvas
  const widthRatio = canvasWidth / 600; // Assumindo 600 como largura de referência
  const heightRatio = canvasHeight / 600;
  
  return {
    x: snapToGrid(element.style.x * widthRatio),
    y: snapToGrid(element.style.y * heightRatio),
    width: snapToGrid(element.style.width * widthRatio),
    height: snapToGrid(element.style.height * heightRatio)
  };
};
