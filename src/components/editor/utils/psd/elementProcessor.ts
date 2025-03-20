import { EditorElement, BannerSize } from '../../types';
import { PSDFileData, TextLayerStyle } from './types';
import { addFontImportToDocument } from './fontMapper';
import { saveImageToStorage } from './storage';

/**
 * Gera um ID único usando timestamp e um valor aleatório
 * @returns Um ID único para o elemento
 */
const generateUniqueId = (): string => {
  return `layer_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Cria um elemento de imagem a partir de uma camada
 * @param layer A camada do PSD
 * @param selectedSize O tamanho do banner selecionado
 * @param preExtractedImage Imagem pré-extraída, se disponível
 */
const createImageElement = async (
  layer: any, 
  selectedSize: BannerSize, 
  preExtractedImage?: string
): Promise<EditorElement | null> => {
  try {
    const id = generateUniqueId();
    
    // Extrair posição e dimensões
    let x = 0, y = 0, width = 100, height = 100;
    
    // Tentar obter coordenadas a partir da camada
    if (layer.left !== undefined && layer.top !== undefined &&
        layer.right !== undefined && layer.bottom !== undefined) {
      x = layer.left;
      y = layer.top;
      width = layer.right - layer.left;
      height = layer.bottom - layer.top;
    }
    
    // Se não temos uma imagem pré-extraída e não conseguimos extrair uma nova, retornar null
    if (!preExtractedImage) {
      if (layer.layer && layer.layer.image) {
        try {
          const png = layer.layer.image.toPng();
          if (png) {
            preExtractedImage = png.src || png;
            console.log(`Imagem extraída diretamente da camada: ${layer.name}`);
          }
        } catch (error) {
          console.error(`Erro ao extrair imagem da camada: ${layer.name}`, error);
        }
      }
      
      if (!preExtractedImage && layer.toPng) {
        try {
          const png = layer.toPng();
          if (png) {
            preExtractedImage = png.src || png;
            console.log(`Imagem extraída via toPng(): ${layer.name}`);
          }
        } catch (error) {
          console.error(`Erro ao extrair imagem via toPng() da camada: ${layer.name}`, error);
        }
      }
      
      // Se ainda não temos uma imagem, não podemos criar um elemento de imagem
      if (!preExtractedImage) {
        console.log(`Não foi possível extrair imagem da camada: ${layer.name}`);
        return null;
      }
    }
    
    console.log(`Criando elemento de imagem para: ${layer.name}`);
    
    // Criar elemento de imagem com os dados extraídos
    return {
      id,
      type: 'image',
      src: preExtractedImage,
      alt: layer.name,
      content: preExtractedImage, // Importante: isso garante que a imagem seja usada corretamente
      sizeId: 'global',
      style: {
        x,
        y,
        width,
        height,
        rotation: 0,
        opacity: 1,
        zIndex: 0,
        xPercent: 0,
        yPercent: 0,
        widthPercent: 0,
        heightPercent: 0
      }
    };
  } catch (error) {
    console.error(`Erro ao criar elemento de imagem para ${layer.name}:`, error);
    return null;
  }
};


/**
 * Processa uma camada do PSD e a converte em um elemento de editor
 * @param layer A camada do PSD
 * @param selectedSize O tamanho do banner selecionado
 * @param psdData Dados do arquivo PSD
 * @param extractedImages Imagens extraídas do PSD
 * @returns Um elemento de editor ou null se a camada não puder ser processada
 */
export const processLayer = async (
  layer: any,
  selectedSize: BannerSize,
  psdData: PSDFileData,
  extractedImages: Map<string, string>
): Promise<EditorElement | null> => {
  try {
    // Se a camada não tiver nome, não podemos processá-la corretamente
    if (!layer.name) {
      console.log("Camada sem nome, ignorando");
      return null;
    }

    console.log(`Processando camada: "${layer.name}"`);
    
    // Encontrar a camada correspondente nos dados do PSD
    const psdLayer = psdData.layers.find(l => l.name === layer.name);
    
    // Determinar o tipo de camada
    let layerType = 'unknown';
    
    if (psdLayer && psdLayer.type === 'text') {
      layerType = 'text';
    } else if (extractedImages && extractedImages.has(layer.name)) {
      layerType = 'image';
    }
    
    console.log(`Tipo de camada determinado para "${layer.name}": ${layerType}`);
    
    let element: EditorElement | null = null;
    
    // Processar camada de texto
    if (layerType === 'text') {
      console.log(`Processando camada de texto: ${layer.name}`);
      
      const textStyle = psdLayer?.textStyle as TextLayerStyle;
      if (!textStyle) {
        console.error(`Estilo de texto não encontrado para ${layer.name}`);
        return null;
      }

      // Pré-carregar a fonte encontrada na camada de texto
      if (textStyle.fontFamily) {
        console.log(`Pré-carregando fonte: ${textStyle.fontFamily}`);
        addFontImportToDocument(textStyle.fontFamily);
      }
      
      // Extrair valores de posição e tamanho (com valores padrão de segurança)
      const x = psdLayer?.x || 0;
      const y = psdLayer?.y || 0;
      const width = psdLayer?.width || 100;
      const height = psdLayer?.height || 20;
      
      // Criar elemento de texto
      element = {
        id: generateUniqueId(),
        type: 'text',
        content: textStyle.text || layer.name,
        sizeId: 'global',
        style: {
          x,
          y,
          width,
          height,
          rotation: 0,
          fontFamily: textStyle.fontFamily || 'Roboto',
          fontSize: textStyle.fontSize || 16,
          fontWeight: textStyle.fontWeight || 'normal',
          fontStyle: textStyle.fontStyle || 'normal',
          textAlign: textStyle.alignment || 'left',
          color: textStyle.color || '#000000',
          opacity: 1,
          zIndex: 1,
          letterSpacing: textStyle.letterSpacing || 0,
          lineHeight: textStyle.lineHeight || 1.2,
          xPercent: 0,
          yPercent: 0,
          widthPercent: 0,
          heightPercent: 0
        }
      };
    } else if (layerType === 'image') {
      // Check if we already have this image pre-extracted
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
        console.log(`Verificando imagem pré-extraída para ${layer.name}: ${preExtractedImage ? 'encontrada' : 'não encontrada'}`);
      }
      
      // Create image element using pre-extracted image data if available
      console.log(`Criando elemento de imagem para camada: ${layer.name || 'sem nome'}`);
      element = await createImageElement(layer, selectedSize, preExtractedImage);
      
      if (element) {
        // Store image in our application storage
        try {
          const imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
          console.log(`Imagem salva no storage com chave: ${imageKey}`);
          
          // Add to PSD data
          const layerInfo = {
            id: element.id,
            name: layer.name || 'Image Layer',
            type: 'image',
            x: element.style.x,
            y: element.style.y,
            width: element.style.width,
            height: element.style.height,
            imageData: element.content as string,
          };
          
          // Só adiciona se não existir ainda
          if (!psdData.layers.some(l => l.name === layerInfo.name)) {
            psdData.layers.push(layerInfo);
          }
        } catch (storageError) {
          console.error('Erro ao salvar imagem no storage:', storageError);
          
          // Still add the element but without storage reference
          const layerInfo = {
            id: element.id,
            name: layer.name || 'Image Layer',
            type: 'image',
            x: element.style.x,
            y: element.style.y,
            width: element.style.width,
            height: element.style.height,
            imageData: element.content as string
          };
          
          // Só adiciona se não existir ainda
          if (!psdData.layers.some(l => l.name === layerInfo.name)) {
            psdData.layers.push(layerInfo);
          }
        }
      }
    } else {
      // For generic layers that might contain images or other content
      console.log(`Processando camada genérica: ${layer.name || 'sem nome'}`);
      
      // Check if we have a pre-extracted image for this layer
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
        console.log(`Verificando imagem pré-extraída para camada genérica ${layer.name}: ${preExtractedImage ? 'encontrada' : 'não encontrada'}`);
      }
      
      // If we found a pre-extracted image, treat as image layer
      if (preExtractedImage) {
        console.log(`Usando imagem pré-extraída para criar elemento de imagem`);
        element = await createImageElement(layer, selectedSize, preExtractedImage);
      } else {
        // First check if it could be treated as an image
        console.log(`Tentando extrair imagem da camada genérica`);
        element = await createImageElement(layer, selectedSize);
      
      }
      
      if (element) {
        // Add to PSD data
        const layerInfo = {
          id: element.id,
          name: layer.name || 'Generic Layer',
          type: element.type as 'image' | 'text' | 'shape' | 'group',
          x: element.style.x,
          y: element.style.y,
          width: element.style.width,
          height: element.style.height
        };
        
        if (element.type === 'image' && element.content) {
          try {
            const imageInfo = {
              ...layerInfo,
              imageData: element.content as string
            };
            
            // Só adiciona se não existir ainda
            if (!psdData.layers.some(l => l.name === layerInfo.name)) {
              psdData.layers.push(imageInfo);
            }
            
            console.log(`Imagem de camada genérica salva no storage`);
          } catch (storageError) {
            console.error('Erro ao salvar imagem de camada genérica no storage:', storageError);
            
            const imageInfo = {
              ...layerInfo,
              imageData: element.content as string
            };
            
            // Só adiciona se não existir ainda
            if (!psdData.layers.some(l => l.name === layerInfo.name)) {
              psdData.layers.push(imageInfo);
            }
          }
        } else {
          // Só adiciona se não existir ainda
          if (!psdData.layers.some(l => l.name === layerInfo.name)) {
            psdData.layers.push(layerInfo);
          }
        }
      }
    }
    
    return element;
  } catch (error) {
    console.error(`Erro ao processar camada ${layer?.name || 'desconhecida'}:`, error);
    return null;
  }
};

/**
 * Calcula os valores percentuais para posição e tamanho dos elementos
 * @param elements Os elementos a serem processados
 * @param selectedSize O tamanho do banner selecionado
 */
export const calculatePercentageValues = (
  elements: EditorElement[],
  selectedSize: BannerSize
): void => {
  elements.forEach(element => {
    if (!element.style) return;
    
    // Calcular valores percentuais em relação ao tamanho do banner
    element.style.xPercent = (element.style.x / selectedSize.width) * 100;
    element.style.yPercent = (element.style.y / selectedSize.height) * 100;
    element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
    element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
  });
};
