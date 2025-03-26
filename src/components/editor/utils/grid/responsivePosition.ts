
import { EditorElement, BannerSize } from "../../types";
import { snapToGrid } from "./gridCore";

/**
 * Calcula a posição ideal para um elemento vinculado em diferentes tamanhos de canvas
 * com base em porcentagens, respeitando os limites do canvas
 */
export const calculateSmartPosition = (
  element: EditorElement,
  sourceSize: BannerSize,
  targetSize: BannerSize
): { x: number; y: number; width: number; height: number } => {
  // Primeiro, garantir que temos valores percentuais
  const xPercent = element.style.xPercent !== undefined 
    ? element.style.xPercent 
    : (element.style.x / sourceSize.width) * 100;
    
  const yPercent = element.style.yPercent !== undefined 
    ? element.style.yPercent 
    : (element.style.y / sourceSize.height) * 100;
    
  const widthPercent = element.style.widthPercent !== undefined 
    ? element.style.widthPercent 
    : (element.style.width / sourceSize.width) * 100;
    
  const heightPercent = element.style.heightPercent !== undefined 
    ? element.style.heightPercent 
    : (element.style.height / sourceSize.height) * 100;

  // Calcular posição baseada em porcentagens - manter proporção relativa à prancheta
  let x = (xPercent * targetSize.width) / 100;
  let y = (yPercent * targetSize.height) / 100;
  let width = (widthPercent * targetSize.width) / 100;
  let height = (heightPercent * targetSize.height) / 100;

  // Garantir dimensões mínimas
  width = Math.max(width, 10);
  height = Math.max(height, 10);

  // Tratamento especial para imagens para preservar proporção
  if (element.type === "image" || element.type === "logo") {
    // Obter a proporção original
    const originalAspectRatio = 
      (element.style.originalWidth && element.style.originalHeight) 
        ? element.style.originalWidth / element.style.originalHeight
        : element.style.width / element.style.height;
    
    // Se a proporção original está disponível, usá-la para manter a proporção
    if (originalAspectRatio) {
      height = width / originalAspectRatio;
    }
  }

  // Detecção e preservação de alinhamento inferior
  const isBottomAligned = Math.abs((element.style.y + element.style.height) - sourceSize.height) < 20;
  if (isBottomAligned) {
    y = targetSize.height - height;
  }

  // Garantir que o elemento permaneça dentro dos limites do canvas
  const margin = 0; // Sem margem para overflow
  x = Math.max(margin * -1, Math.min(x, targetSize.width - width - margin));
  y = Math.max(margin * -1, Math.min(y, targetSize.height - height - margin));

  // Ajustar à grade
  x = snapToGrid(x);
  y = snapToGrid(y);
  width = snapToGrid(width);
  height = snapToGrid(height);

  return { x, y, width, height };
};

/**
 * Mantém a posição do elemento em relação ao cursor durante operações de arrastar
 * em diferentes tamanhos de canvas
 */
export const calculateDragPosition = (
  mouseX: number,
  mouseY: number,
  dragOffsetX: number,
  dragOffsetY: number,
  element: EditorElement,
  canvasSize: BannerSize
): { x: number; y: number } => {
  // Calcular nova posição com base no mouse e no deslocamento
  let newX = mouseX - dragOffsetX;
  let newY = mouseY - dragOffsetY;

  // Restringir ao canvas
  const maxX = canvasSize.width - element.style.width;
  const maxY = canvasSize.height - element.style.height;
  
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  // Ajustar à grade
  newX = snapToGrid(newX);
  newY = snapToGrid(newY);

  return { x: newX, y: newY };
};

/**
 * Atualiza elementos vinculados de forma inteligente quando um é modificado,
 * mantendo proporções e posições relativas
 */
export const updateLinkedElementsIntelligently = (
  elements: EditorElement[],
  sourceElement: EditorElement,
  activeSizes: BannerSize[]
): EditorElement[] => {
  if (!sourceElement.linkedElementId) return elements;

  // Encontrar o tamanho do elemento fonte
  const sourceSize = activeSizes.find(size => size.name === sourceElement.sizeId) || activeSizes[0];

  // Verificar se o elemento fonte está alinhado ao fundo
  const isBottomAligned = Math.abs((sourceElement.style.y + sourceElement.style.height) - sourceSize.height) < 20;

  // Atualizar todos os elementos vinculados
  return elements.map(el => {
    // Pular se não estiver vinculado ao elemento fonte, for o próprio elemento fonte ou estiver posicionado individualmente
    if (el.linkedElementId !== sourceElement.linkedElementId || 
        el.id === sourceElement.id || 
        el.isIndividuallyPositioned) {
      return el;
    }

    // Encontrar o tamanho do elemento alvo
    const targetSize = activeSizes.find(size => size.name === el.sizeId) || activeSizes[0];
    
    // Atualizar os valores percentuais com base no elemento fonte
    const xPercent = (sourceElement.style.x / sourceSize.width) * 100;
    const yPercent = (sourceElement.style.y / sourceSize.height) * 100;
    const widthPercent = (sourceElement.style.width / sourceSize.width) * 100;
    const heightPercent = (sourceElement.style.height / sourceSize.height) * 100;
    
    // Aplicar essas porcentagens ao tamanho da prancheta alvo
    let x = (xPercent * targetSize.width) / 100;
    let y = (yPercent * targetSize.height) / 100;
    let width = (widthPercent * targetSize.width) / 100;
    let height = (heightPercent * targetSize.height) / 100;
    
    // Assegurar que as dimensões mínimas são mantidas
    width = Math.max(width, 10);
    height = Math.max(height, 10);
    
    // Tratamento especial para imagens
    if (el.type === "image" || el.type === "logo") {
      const aspectRatio = sourceElement.style.width / sourceElement.style.height;
      height = width / aspectRatio;
    }
    
    // Se o elemento original estiver alinhado ao fundo, garantir que este também esteja
    if (isBottomAligned) {
      y = targetSize.height - height;
    }
    
    // Garantir que o elemento permanece dentro dos limites
    x = Math.max(0, Math.min(x, targetSize.width - width));
    y = Math.max(0, Math.min(y, targetSize.height - height));
    
    // Ajustar à grade
    x = snapToGrid(x);
    y = snapToGrid(y);
    width = snapToGrid(width);
    height = snapToGrid(height);
    
    // Atualizar elemento com novas posições
    return {
      ...el,
      style: {
        ...el.style,
        x: x,
        y: y,
        width: width,
        height: height,
        // Atualizar valores percentuais
        xPercent: xPercent,
        yPercent: yPercent,
        widthPercent: widthPercent,
        heightPercent: heightPercent
      }
    };
  });
};
