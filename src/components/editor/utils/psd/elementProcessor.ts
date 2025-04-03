import { EditorElement, BannerSize } from '../../types';
import { PSDFileData, TextLayerStyle } from './types';
import { addFontImportToDocument } from './fontMapper';
import { toast } from "sonner";
import axios from "axios";

// Sistema de logs centralizado
const logger = {
  // Define níveis de log para controlar o que é exibido
  enabled: process.env.NODE_ENV === 'development',
  levels: {
    INFO: false,
    DEBUG: false, // Ative para logs mais detalhados
    LAYERS: false,
    IMAGE: false,
    TEXT: false,
    ERROR: false
  },

  // Métodos de log organizados
  info: (message: string, data?: any) => {
    if (logger.enabled && logger.levels.INFO) {
      console.group(`ℹ️ ${message}`);
      if (data) console.log('  ', data);
      console.groupEnd();
    }
  },

  debug: (message: string, data?: any) => {
    if (logger.enabled && logger.levels.DEBUG) {
      console.group(`🔍 Debug: ${message}`);
      if (data) console.log('  ', data);
      console.groupEnd();
    }
  },

  layer: (layerName: string, message: string, data?: any) => {
    if (logger.enabled && logger.levels.LAYERS) {
      console.group(`🔖 Camada: "${layerName}"`);
      console.log(`  ${message}`);
      if (data) console.log('  ', data);
      console.groupEnd();
    }
  },

  image: (layerName: string, message: string, data?: any) => {
    if (logger.enabled && logger.levels.IMAGE) {
      console.group(`🖼️ Imagem: "${layerName}"`);
      console.log(`  ${message}`);
      if (data) console.log('  ', data);
      console.groupEnd();
    }
  },

  text: (layerName: string, message: string, data?: any) => {
    if (logger.enabled && logger.levels.TEXT) {
      console.group(`📝 Texto: "${layerName}"`);
      console.log(`  ${message}`);
      if (data) console.log('  ', data);
      console.groupEnd();
    }
  },

  error: (message: string, error: any) => {
    if (logger.enabled && logger.levels.ERROR) {
      console.group(`❌ Erro: ${message}`);
      console.error('  ', error);
      console.groupEnd();
    }
  }
};

/**
 * Gera um ID único usando timestamp e um valor aleatório
 * @returns Um ID único para o elemento
 */
const generateUniqueId = (): string => {
  return `layer_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Faz upload de uma imagem extraída para o backend e retorna a URL do CDN
 * @param imageBuffer Buffer da imagem extraída
 * @param filename Nome do arquivo
 */
const uploadImageToCDN = async (imageBuffer: ArrayBuffer, filename: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), filename);

    const response = await axios.post('http://localhost:3333/api/cdn/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.url) {
      logger.info(`Imagem enviada para o CDN com sucesso: ${response.data.url}`);
      return response.data.url;
    } else {
      throw new Error('Resposta do backend não contém uma URL válida.');
    }
  } catch (error) {
    logger.error('Erro ao enviar imagem para o CDN:', error);
    toast.error('Erro ao enviar imagem para o CDN.');
    throw error;
  }
};

/**
 * Creates a text element from layer data
 */
const createTextElement = async (
  layer: any,
  selectedSize: BannerSize,
  textStyle: TextLayerStyle
): Promise<EditorElement | null> => {
  try {
    const id = generateUniqueId();

    // Extract position and dimensions
    const x = layer.left || 0;
    const y = layer.top || 0;
    const width = (layer.right || 100) - x;
    const height = (layer.bottom || 50) - y;

    // Convert text alignment to proper value
    let textAlign: "left" | "center" | "right" = "left";
    if (textStyle.alignment === "center") {
      textAlign = "center";
    } else if (textStyle.alignment === "right") {
      textAlign = "right";
    }

    // Create text element
    return {
      id,
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
        textAlign: textAlign,
        color: textStyle.color || '#000000',
        opacity: 1,
        letterSpacing: textStyle.letterSpacing || 0,
        lineHeight: textStyle.lineHeight || 1.2,
        xPercent: 0,
        yPercent: 0,
        widthPercent: 0,
        heightPercent: 0
      }
    };
  } catch (error) {
    logger.error(`Error creating text element for ${layer.name}`, error);
    return null;
  }
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

    if (layer.left !== undefined && layer.top !== undefined &&
        layer.right !== undefined && layer.bottom !== undefined) {
      x = layer.left;
      y = layer.top;
      width = layer.right - layer.left;
      height = layer.bottom - layer.top;
    }

    // Se não temos uma imagem pré-extraída, tentar extrair da camada
    if (!preExtractedImage && layer.layer && layer.layer.image) {
      try {
        const pngBuffer = layer.layer.image.toPng().buffer;
        preExtractedImage = await uploadImageToCDN(pngBuffer, `${layer.name || 'image'}.png`);
      } catch (error) {
        logger.error(`Erro ao extrair e enviar imagem da camada: ${layer.name}`, error);
        return null;
      }
    }

    if (!preExtractedImage) {
      logger.image(layer.name, 'Não foi possível extrair ou enviar imagem da camada');
      return null;
    }

    logger.image(layer.name, 'Criando elemento de imagem', {
      dimensões: { x, y, largura: width, altura: height }
    });

    return {
      id,
      type: 'image',
      src: preExtractedImage,
      alt: layer.name,
      content: preExtractedImage,
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
    logger.error(`Erro ao criar elemento de imagem para ${layer.name}`, error);
    return null;
  }
};

// Update the psdData.layers.push calls to match the LayerData type
const addLayerToPsdData = (psdData: PSDFileData, layerInfo: any) => {
  const typedLayerInfo = {
    ...layerInfo,
    type: layerInfo.type as 'text' | 'image' | 'group' | 'shape'
  };

  // Only add if it doesn't exist yet
  if (!psdData.layers.some(l => l.name === typedLayerInfo.name)) {
    psdData.layers.push(typedLayerInfo);
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
    if (!layer.name) {
      logger.info("Camada sem nome, ignorando");
      return null;
    }

    logger.layer(layer.name, `Iniciando processamento`);

    const psdLayer = psdData.layers.find(l => l.name === layer.name);
    let layerType = 'unknown';

    if (psdLayer && psdLayer.type === 'text') {
      layerType = 'text';
    } else if (extractedImages && extractedImages.has(layer.name)) {
      layerType = 'image';
    }

    logger.layer(layer.name, `Tipo determinado: ${layerType}`);

    let element: EditorElement | null = null;

    if (layerType === 'text') {
      logger.text(layer.name, 'Processando camada de texto');

      const textStyle = psdLayer?.textStyle as TextLayerStyle;
      if (!textStyle) {
        logger.error(`Estilo de texto não encontrado para ${layer.name}`, 'Sem dados de estilo');
        return null;
      }

      console.log(`🎯 Fonte final para "${layer.name}": "${textStyle.fontFamily || 'não definida'}"`);

      if (textStyle.fontFamily) {
        addFontImportToDocument(textStyle.fontFamily);
      }

      const x = psdLayer?.x || 0;
      const y = psdLayer?.y || 0;
      const width = psdLayer?.width || 100;
      const height = psdLayer?.height || 20;

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

      logger.text(layer.name, 'Elemento de texto criado', {
        posição: { x, y },
        tamanho: { largura: width, altura: height },
        estilo: {
          fonte: textStyle.fontFamily,
          tamanho: textStyle.fontSize,
          cor: textStyle.color
        }
      });

    } else if (layerType === 'image') {
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
      }

      element = await createImageElement(layer, selectedSize, preExtractedImage);

      if (element) {
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

        if (!psdData.layers.some(l => l.name === layerInfo.name)) {
          psdData.layers.push(layerInfo);
        }
      }
    } else {
      logger.layer(layer.name, 'Processando camada genérica');

      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
        logger.layer(layer.name, `Verificando imagem pré-extraída: ${preExtractedImage ? 'encontrada' : 'não encontrada'}`);
      }

      if (preExtractedImage) {
        logger.image(layer.name, 'Usando imagem pré-extraída');
        element = await createImageElement(layer, selectedSize, preExtractedImage);
      } else {
        logger.layer(layer.name, 'Tentando extrair imagem da camada genérica');
        element = await createImageElement(layer, selectedSize);
      }

      if (element) {
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

            if (!psdData.layers.some(l => l.name === layerInfo.name)) {
              psdData.layers.push(imageInfo);
            }

            logger.image(layer.name, 'Imagem de camada genérica salva');
          } catch (storageError) {
            logger.error('Erro ao salvar imagem de camada genérica', storageError);

            const imageInfo = {
              ...layerInfo,
              imageData: element.content as string
            };

            if (!psdData.layers.some(l => l.name === layerInfo.name)) {
              psdData.layers.push(imageInfo);
            }
          }
        } else {
          if (!psdData.layers.some(l => l.name === layerInfo.name)) {
            psdData.layers.push(layerInfo);
          }
        }
      }
    }

    return element;
  } catch (error) {
    logger.error(`Erro ao processar camada ${layer?.name || 'desconhecida'}`, error);
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

    element.style.xPercent = (element.style.x / selectedSize.width) * 100;
    element.style.yPercent = (element.style.y / selectedSize.height) * 100;
    element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
    element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
  });

  logger.info(`Valores percentuais calculados para ${elements.length} elementos`, {
    tamanhoBase: `${selectedSize.width}x${selectedSize.height}px`
  });
};
