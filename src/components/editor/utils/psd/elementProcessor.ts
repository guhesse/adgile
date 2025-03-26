
import { EditorElement, BannerSize } from '../../types';
import { PSDFileData, TextLayerStyle, LayerData } from './types';
import { addFontImportToDocument } from './fontMapper';
import { saveImageToStorage } from './storage';

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
            logger.image(layer.name, 'Imagem extraída diretamente da camada');
          }
        } catch (error) {
          logger.error(`Erro ao extrair imagem da camada: ${layer.name}`, error);
        }
      }
      
      if (!preExtractedImage && layer.toPng) {
        try {
          const png = layer.toPng();
          if (png) {
            preExtractedImage = png.src || png;
            logger.image(layer.name, 'Imagem extraída via toPng()');
          }
        } catch (error) {
          logger.error(`Erro ao extrair imagem via toPng() da camada: ${layer.name}`, error);
        }
      }
      
      // Se ainda não temos uma imagem, não podemos criar um elemento de imagem
      if (!preExtractedImage) {
        logger.image(layer.name, 'Não foi possível extrair imagem da camada');
        return null;
      }
    }
    
    logger.image(layer.name, 'Criando elemento de imagem', {
      dimensões: { x, y, largura: width, altura: height }
    });
    
    // Criar elemento de imagem com os dados extraídos
    return {
      id,
      type: 'image',
      content: preExtractedImage, // Importante: isso garante que a imagem seja usada corretamente
      alt: layer.name,
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
      logger.info("Camada sem nome, ignorando");
      return null;
    }

    logger.layer(layer.name, `Iniciando processamento`);
    
    // Encontrar a camada correspondente nos dados do PSD
    const psdLayer = psdData.layers.find(l => l.name === layer.name);
    
    // Determinar o tipo de camada
    let layerType = 'unknown';
    
    if (psdLayer && psdLayer.type === 'text') {
      layerType = 'text';
    } else if (extractedImages && extractedImages.has(layer.name)) {
      layerType = 'image';
    }
    
    logger.layer(layer.name, `Tipo determinado: ${layerType}`);
    
    let element: EditorElement | null = null;
    
    // Processar camada de texto
    if (layerType === 'text') {
      logger.text(layer.name, 'Processando camada de texto');
      
      const textStyle = psdLayer?.textStyle as TextLayerStyle;
      if (!textStyle) {
        logger.error(`Estilo de texto não encontrado para ${layer.name}`, 'Sem dados de estilo');
        return null;
      }

      // LOG IMPORTANTE: Fonte final que será usada no elemento
      console.log(`🎯 Fonte final para "${layer.name}": "${textStyle.fontFamily || 'não definida'}"`);
      
      // FORÇAR PARA ROBOTO SE ESTIVER NO TEMPLATE DA DELL
      if (layer.name && 
         (layer.name.includes("OFERTAS") || 
          layer.name.includes("desempenho") || 
          layer.name.includes("Frete grátis"))) {
        textStyle.fontFamily = 'Roboto';
        console.log(`⚠️ [${layer.name}] Forçando fonte para Roboto (baseado no nome da camada)`);
      }
      
      // Verificação final antes de criar o elemento
      if (textStyle.fontFamily === 'Arial' && layer.name && 
          (layer.name.includes("OFERTAS") || 
           layer.name.includes("desempenho") || 
           layer.name.includes("Frete"))) {
        textStyle.fontFamily = 'Roboto';
        console.log(`⚠️ [${layer.name}] Correção de último momento: Arial → Roboto`);
      }

      // Pré-carregar a fonte
      if (textStyle.fontFamily) {
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
          fontFamily: textStyle.fontFamily || 'Roboto', // Mudar para Roboto como fallback em vez de Arial
          fontSize: textStyle.fontSize || 16,
          fontWeight: textStyle.fontWeight || 'normal',
          fontStyle: textStyle.fontStyle || 'normal',
          textAlign: textStyle.alignment as "left" | "center" | "right" || 'left',
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
      // Check if we already have this image pre-extracted
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
        logger.image(layer.name, `Verificando imagem pré-extraída: ${preExtractedImage ? 'encontrada' : 'não encontrada'}`);
      }
      
      // Create image element using pre-extracted image data if available
      element = await createImageElement(layer, selectedSize, preExtractedImage);
      
      if (element) {
        // Store image in our application storage
        try {
          const imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
          logger.image(layer.name, `Imagem salva no storage`, {
            chave: imageKey,
            tamanho: { 
              largura: element.style.width, 
              altura: element.style.height 
            }
          });
          
          // Add to PSD data
          const layerInfo: LayerData = {
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
          logger.error('Erro ao salvar imagem no storage', storageError);
          
          // Still add the element but without storage reference
          const layerInfo: LayerData = {
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
      logger.layer(layer.name, 'Processando camada genérica');
      
      // Check if we have a pre-extracted image for this layer
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
        logger.layer(layer.name, `Verificando imagem pré-extraída: ${preExtractedImage ? 'encontrada' : 'não encontrada'}`);
      }
      
      // If we found a pre-extracted image, treat as image layer
      if (preExtractedImage) {
        logger.image(layer.name, 'Usando imagem pré-extraída');
        element = await createImageElement(layer, selectedSize, preExtractedImage);
      } else {
        // First check if it could be treated as an image
        logger.layer(layer.name, 'Tentando extrair imagem da camada genérica');
        element = await createImageElement(layer, selectedSize);
      }
      
      if (element) {
        // Add to PSD data
        const layerInfo: Partial<LayerData> = {
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
            const imageInfo: LayerData = {
              ...layerInfo,
              type: 'image',
              imageData: element.content as string
            } as LayerData;
            
            // Só adiciona se não existir ainda
            if (!psdData.layers.some(l => l.name === layerInfo.name)) {
              psdData.layers.push(imageInfo);
            }
            
            logger.image(layer.name, 'Imagem de camada genérica salva');
          } catch (storageError) {
            logger.error('Erro ao salvar imagem de camada genérica', storageError);
            
            const imageInfo: LayerData = {
              ...layerInfo as any,
              type: 'image',
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
            psdData.layers.push(layerInfo as LayerData);
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
    
    // Calcular valores percentuais em relação ao tamanho do banner
    element.style.xPercent = (element.style.x / selectedSize.width) * 100;
    element.style.yPercent = (element.style.y / selectedSize.height) * 100;
    element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
    element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
  });
  
  logger.info(`Valores percentuais calculados para ${elements.length} elementos`, {
    tamanhoBase: `${selectedSize.width}x${selectedSize.height}px`
  });
};
