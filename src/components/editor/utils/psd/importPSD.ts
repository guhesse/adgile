import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { parsePSDFile } from './psdParser';
import { processLayer, calculatePercentageValues } from './elementProcessor';
import { savePSDDataToStorage, getPSDMetadata } from './storage';
import { PSDFileData } from './types';
import { convertPSDColorToHex } from './formatters';
import axios from 'axios';

/**
 * Re-export the PSDFileData type for backward compatibility
 */
export type { PSDFileData } from './types';

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Configuração de log - altere para controlar o nível de informações
const LOG_LEVEL = LogLevel.NONE;

/**
 * Função de log centralizada para PSD Import
 */
const psdLogger = {
  debug: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.DEBUG) {
      console.log(`[PSD Debug] ${message}`, ...data);
    }
  },
  info: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.INFO) {
      console.log(`[PSD Info] ${message}`, ...data);
    }
  },
  warn: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.WARN) {
      console.warn(`[PSD Warning] ${message}`, ...data);
    }
  },
  error: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.ERROR) {
      console.error(`[PSD Error] ${message}`, ...data);
    }
  }
};

/**
 * Interface que representa os dados de máscara de uma camada PSD
 */
export interface PSDMaskData {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
  defaultColor?: number;
  relative?: boolean;
  disabled?: boolean;
  invert?: boolean;
  hasValidMask: boolean;
}

/**
 * Converte uma string base64 para ArrayBuffer
 * @param base64 String base64 da imagem
 * @returns ArrayBuffer da imagem
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  // Remover o prefixo de data URL se existir
  const base64Content = base64.includes('base64,') 
    ? base64.split('base64,')[1] 
    : base64;
  
  const binaryString = window.atob(base64Content);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
};

/**
 * Envia uma imagem para o CDN
 * @param imageBuffer ArrayBuffer da imagem
 * @param filename Nome do arquivo
 * @returns URL da imagem no CDN
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
      psdLogger.info(`Imagem enviada para o CDN com sucesso: ${response.data.url}`);
      return response.data.url;
    } else {
      throw new Error('Resposta do backend não contém uma URL válida.');
    }
  } catch (error) {
    psdLogger.error('Erro ao enviar imagem para o CDN:', error);
    toast.error('Erro ao enviar imagem para o CDN.');
    throw error;
  }
};

/**
 * Processa elemento de imagem, enviando para o CDN se for base64
 * @param element Elemento editor a ser processado
 * @returns Elemento com URL do CDN em vez de base64
 */
const processImageElement = async (element: EditorElement): Promise<EditorElement> => {
  // Se não for imagem ou não tiver conteúdo, retorna o elemento sem alterações
  if (element.type !== 'image' || !element.content || typeof element.content !== 'string') {
    return element;
  }

  const content = element.content as string;
  
  // Verifica se o conteúdo é base64 com detecção mais robusta
  const isBase64 = 
    content.startsWith('data:image') || 
    content.startsWith('/9j/') ||
    content.includes('base64');
  
  if (isBase64) {
    try {
      psdLogger.debug(`Convertendo imagem base64 para CDN: ${element._layerName || 'sem nome'} (${content.length} caracteres)`);
      
      // Criar um nome de arquivo baseado no nome da camada ou gerar um aleatório
      const safeLayerName = element._layerName 
        ? element._layerName.replace(/[^a-zA-Z0-9]/g, '_') 
        : 'image';
      const filename = `psd_${safeLayerName}_${Date.now()}.png`;
      
      // Garantir que o conteúdo está em formato correto para conversão
      let processedContent = content;
      if (!content.includes('base64,') && content.startsWith('/9j/')) {
        processedContent = `data:image/jpeg;base64,${content}`;
      } else if (!content.includes('base64,')) {
        processedContent = `data:image/png;base64,${content}`;
      }
      
      // Converter base64 para ArrayBuffer com tratamento de erro
      try {
        const imageBuffer = base64ToArrayBuffer(processedContent);
        
        // Enviar para o CDN
        const cdnUrl = await uploadImageToCDN(imageBuffer, filename);
        
        // Atualizar o elemento com a URL do CDN
        psdLogger.debug(`Sucesso! Imagem "${safeLayerName}" convertida de base64 (${content.length} caracteres) para URL CDN (${cdnUrl.length} caracteres)`);
        
        return {
          ...element,
          content: cdnUrl,
          _originalBase64Length: content.length // Guardar referência do tamanho original para debugging
        };
      } catch (conversionError) {
        psdLogger.error(`Erro ao converter base64 para ArrayBuffer: ${conversionError}`);
        return element;
      }
    } catch (error) {
      psdLogger.error(`Erro ao processar imagem para CDN: ${error}`);
      // Em caso de falha, manter o base64 original
      return element;
    }
  }
  
  // Se não for base64, retorna o elemento sem alterações
  return element;
};

/**
 * Processa as informações de máscara de uma camada PSD
 * @param layer Camada do PSD
 * @returns Informações da máscara processadas
 */
export const extractMaskData = (layer: any): PSDMaskData | null => {
  // Verificar se a camada tem informações de máscara
  if (!layer || !layer.mask) {
    return null;
  }

  try {
    const mask = layer.mask;
    psdLogger.debug(`Processando máscara para camada: ${layer.name || 'sem nome'}`, mask);
    
    // Verifica se a máscara tem dimensões válidas
    const hasValidDimensions = 
      typeof mask.width === 'number' && 
      typeof mask.height === 'number' && 
      mask.width > 0 && 
      mask.height > 0;
    
    if (!hasValidDimensions) {
      // Se mask existe mas não tem dimensões válidas, pode ser outro tipo de objeto
      if (typeof mask.export === 'function') {
        // Tenta usar o método export() se disponível
        try {
          const exportedMask = mask.export();
          psdLogger.debug(`Máscara exportada para camada ${layer.name}:`, exportedMask);
          
          if (exportedMask && 
              typeof exportedMask.width === 'number' && 
              typeof exportedMask.height === 'number' && 
              exportedMask.width > 0 && 
              exportedMask.height > 0) {
            return {
              top: exportedMask.top || 0,
              left: exportedMask.left || 0,
              bottom: exportedMask.bottom || 0,
              right: exportedMask.right || 0,
              width: exportedMask.width,
              height: exportedMask.height,
              defaultColor: exportedMask.defaultColor,
              relative: exportedMask.relative,
              disabled: exportedMask.disabled,
              invert: exportedMask.invert,
              hasValidMask: true
            };
          }
        } catch (exportError) {
          psdLogger.warn(`Erro ao exportar máscara para camada ${layer.name}:`, exportError);
        }
      }
      
      return null;
    }
    
    const maskData: PSDMaskData = {
      top: mask.top || 0,
      left: mask.left || 0,
      bottom: mask.bottom || 0,
      right: mask.right || 0,
      width: mask.width,
      height: mask.height,
      defaultColor: mask.defaultColor,
      relative: mask.relative,
      disabled: mask.disabled,
      invert: mask.invert,
      hasValidMask: true
    };
    
    psdLogger.debug(`Máscara válida encontrada para camada ${layer.name}: ${maskData.width}×${maskData.height}`);
    return maskData;
  } catch (error) {
    psdLogger.warn(`Erro ao processar máscara para camada ${layer.name || 'sem nome'}:`, error);
    return null;
  }
};

/**
 * Ajusta a posição e dimensões de um elemento com base na máscara
 * @param element Elemento a ser ajustado
 * @param maskData Dados da máscara
 * @param canvasSize Tamanho do canvas
 */
const adjustElementWithMask = (element: any, maskData: PSDMaskData, canvasSize: BannerSize): any => {
  if (!maskData.hasValidMask) return element;
  
  const originalElement = { ...element };
  
  // Log detalhado antes do ajuste
  psdLogger.debug(`AJUSTE DE MÁSCARA - ANTES:`, {
    elemento: element._layerName || 'sem nome',
    tipo: element.type,
    posição_original: { x: element.style.x, y: element.style.y },
    dimensões_originais: { w: element.style.width, h: element.style.height },
    máscara: {
      posição: { top: maskData.top, left: maskData.left },
      dimensões: { width: maskData.width, height: maskData.height }
    }
  });
  
  // Ajustar posição com base na máscara
  const adjustedElement = {
    ...element,
    style: {
      ...element.style,
      // Usar dimensions da máscara
      width: maskData.width,
      height: maskData.height,
      // Ajustar posição para refletir a máscara
      x: maskData.left,
      y: maskData.top,
      // Manter informações da máscara para uso posterior
      hasMask: true,
      maskInfo: {
        top: maskData.top,
        left: maskData.left,
        bottom: maskData.bottom,
        right: maskData.right,
        width: maskData.width,
        height: maskData.height,
        invert: maskData.invert || false,
        disabled: maskData.disabled || false
      },
      // Ajustes especiais para posicionamento
      objectFit: 'cover',
      // Usar clipPath para mascaramento visual quando renderizado
      clipPath: `inset(0px 0px 0px 0px)`
    }
  };
  
  // Cálculos especiais para ocupar toda a largura/altura do canvas quando necessário
  const isFullWidth = Math.abs(maskData.width - canvasSize.width) < 10; // Margem de tolerância
  const isAtBottom = Math.abs((maskData.top + maskData.height) - canvasSize.height) < 10;
  
  if (isFullWidth) {
    psdLogger.debug(`Elemento ${element._layerName || 'sem nome'} parece ocupar toda a largura do canvas.`);
    adjustedElement.style.width = canvasSize.width;
    adjustedElement.style.x = 0;
  }
  
  if (isAtBottom) {
    psdLogger.debug(`Elemento ${element._layerName || 'sem nome'} parece estar no limite inferior do canvas.`);
    adjustedElement.style.y = canvasSize.height - maskData.height;
  }
  
  // Log detalhado após o ajuste
  psdLogger.debug(`AJUSTE DE MÁSCARA - DEPOIS:`, {
    elemento: element._layerName || 'sem nome',
    posição_ajustada: { x: adjustedElement.style.x, y: adjustedElement.style.y },
    dimensões_ajustadas: { w: adjustedElement.style.width, h: adjustedElement.style.height },
    ocupaTodaLargura: isFullWidth,
    estáNoLimiteInferior: isAtBottom,
    percentual_canvas: {
      x: Math.round((adjustedElement.style.x / canvasSize.width) * 100),
      y: Math.round((adjustedElement.style.y / canvasSize.height) * 100),
      width: Math.round((adjustedElement.style.width / canvasSize.width) * 100),
      height: Math.round((adjustedElement.style.height / canvasSize.height) * 100)
    }
  });
  
  return adjustedElement;
};

/**
 * Import a PSD file and convert it to editor elements
 * @param file The PSD file to import
 * @param selectedSize The selected banner size
 * @returns A promise resolving to an array of editor elements
 */
export const importPSDFile = async (file: File, selectedSize: BannerSize): Promise<EditorElement[]> => {
  try {
    // Parse the PSD file
    const { psd, psdData, extractedImages, textLayers } = await parsePSDFile(file);

    // Log summary of extracted assets
    psdLogger.info(`PSD Parser extraiu ${extractedImages.size} imagens e ${textLayers?.size || 0} camadas de texto`);
    if (extractedImages.size === 0) {
      psdLogger.warn("Nenhuma imagem foi extraída do PSD. Verifique se o arquivo contém camadas de imagem.");
    } else {
      psdLogger.debug(`Imagens extraídas: ${Array.from(extractedImages.keys()).join(', ')}`);
    }

    // Tenta buscar camadas de imagem diretamente do PSD quando extractedImages está vazio
    if (extractedImages.size === 0 && psd.layers && psd.layers.length > 0) {
      psdLogger.debug("Tentando identificar camadas de imagem diretamente do PSD...");
      let imageLayersFound = 0;

      for (const layer of psd.layers) {
        // Pular camadas de texto já identificadas
        if (layer.name && textLayers.has(layer.name)) continue;
        
        // Verificar se a camada pode conter uma imagem
        if (layer.image || layer.canvas || (layer.width > 0 && layer.height > 0)) {
          imageLayersFound++;
          const layerName = layer.name || `unknown_layer_${imageLayersFound}`;
          psdLogger.debug(`Camada potencial de imagem encontrada: ${layerName} (${layer.width}x${layer.height})`);
          
          // Tentar extrair dados da imagem
          try {
            if (layer.image && typeof layer.image.toBase64 === 'function') {
              const base64Data = layer.image.toBase64();
              if (base64Data) {
                extractedImages.set(layerName, base64Data);
                psdLogger.debug(`Imagem extraída com sucesso da camada: ${layerName}`);
              }
            } else if (layer.canvas) {
              psdLogger.debug(`Camada ${layerName} tem canvas. Tentando extrair...`);
              // Implementação adicional pode ser necessária para extrair de canvas
            }
          } catch (imgError) {
            psdLogger.warn(`Erro ao extrair imagem da camada ${layerName}:`, imgError);
          }
        }
      }
      
      psdLogger.info(`Identificação direta encontrou ${imageLayersFound} camadas potenciais de imagem e extraiu ${extractedImages.size} imagens.`);
    }

    // Extract background color if available
    let backgroundColor = '#ffffff'; // Default white
    try {
      if (psd.tree) {
        const tree = psd.tree();
        // Try to find a background layer
        const bgLayer = tree.children?.find((child: any) =>
          child.name?.toLowerCase().includes('background') ||
          child.name?.toLowerCase().includes('bg')
        );

        if (bgLayer && bgLayer.fill && bgLayer.fill.color) {
          backgroundColor = convertPSDColorToHex(bgLayer.fill.color);
          psdLogger.debug(`Extracted background color: ${backgroundColor}`);
        }

        // Store in psdData
        psdData.backgroundColor = backgroundColor;
      }
    } catch (bgError) {
      psdLogger.error("Error extracting background color:", bgError);
    }

    // Log raw PSD data for debugging (complete structure in one place)
    psdLogger.debug("=== RAW PSD DATA ===");
    try {
      // Get comprehensive PSD data
      const rawData = {
        header: psd.header,
        resources: psd.resources,
        layersCount: psd.layers.length,
        dimensions: { width: psd.header.width, height: psd.header.height },
        extractedImages: Array.from(extractedImages.keys()),
        treeStructure: psd.tree && typeof psd.tree === 'function' ? psd.tree() : null
      };
      psdLogger.debug("PSD Structure:", rawData);
    } catch (logError) {
      psdLogger.error("Error logging full PSD structure:", logError);
    }

    // Process layers
    const elements: EditorElement[] = [];
    const maskedElementsCount = { count: 0 };

    // Processar camadas de texto primeiro usando a nova abordagem
    const processedTextLayerNames = new Set<string>(); // Rastrear camadas de texto processadas

    if (textLayers.size > 0) {
      psdLogger.debug("=== PROCESSANDO CAMADAS DE TEXTO EXTRAÍDAS ===");
      for (const [layerName, textStyle] of textLayers.entries()) {
        psdLogger.debug(`Processando camada de texto: ${layerName}`);

        // Encontrar informações da camada nos dados do PSD
        const layerInfo = psdData.layers.find(layer => layer.name === layerName && layer.type === 'text');

        if (layerInfo) {
          const element: EditorElement = {
            id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'text',
            content: textStyle.text || 'Texto',
            _layerName: layerName,
            style: {
              ...textStyle, // Preserve os estilos extraídos do textExtractor
              x: layerInfo.x,
              y: layerInfo.y,
              width: layerInfo.width,
              height: layerInfo.height
            },
            sizeId: selectedSize.name // Corrigido para usar o nome do formato selecionado
          };

          psdLogger.debug(`Elemento de texto criado:`, {
            id: element.id,
            content: element.content,
            fontFamily: element.style.fontFamily,
            fontSize: element.style.fontSize,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            color: element.style.color
          });

          elements.push(element);
          processedTextLayerNames.add(layerName); // Marcar camada como processada
        } else {
          psdLogger.warn(`Informações de posição não encontradas para camada de texto: ${layerName}`);
        }
      }
    }

    // Processar todas as camadas, ignorando as camadas de texto já processadas
    const layerPromises = psd.layers.map(async (layer) => {
      if (layer.name && processedTextLayerNames.has(layer.name)) {
        psdLogger.debug(`Pulando camada de texto já processada: ${layer.name}`);
        return null; // Ignorar camadas de texto já processadas
      }

      // Verificar se a camada tem máscara antes de processar
      const maskData = extractMaskData(layer);
      
      // Processar a camada normalmente
      const element = await processLayer(layer, selectedSize, psdData, extractedImages);
      
      if (element) {
        // Assign the sizeId as the selected size name instead of 'global'
        element.sizeId = selectedSize.name;

        // Se encontramos dados de máscara válidos, anexamos ao elemento
        if (maskData && maskData.hasValidMask) {
          element.psdLayerData = element.psdLayerData || {};
          element.psdLayerData.mask = maskData;

          // Aplicar ajustes específicos para elementos com máscara
          const adjustedElement = adjustElementWithMask(element, maskData, selectedSize);
          
          // Se for uma imagem, processar para CDN
          const processedElement = element.type === 'image' 
            ? await processImageElement(adjustedElement)
            : adjustedElement;
            
          maskedElementsCount.count++;
          psdLogger.debug(`Aplicada máscara à camada "${layer.name || 'sem nome'}": ${maskData.width}×${maskData.height}`);

          return processedElement;
        } else {
          // Se for uma imagem, processar para CDN
          const processedElement = element.type === 'image'
            ? await processImageElement(element)
            : element;
            
          return processedElement;
        }
      }
      return null;
    });

    // Aguarda o processamento de todas as camadas
    const processedLayers = await Promise.all(layerPromises);
    elements.push(...processedLayers.filter((el) => el !== null));

    // Verificar imagens em elements para diagnóstico
    const imageElements = elements.filter(el => el.type === 'image');
    if (imageElements.length === 0 && extractedImages.size > 0) {
      psdLogger.warn("Extraímos imagens, mas nenhum elemento de imagem foi criado. Problema na conversão.");
      
      // Tentar criar elementos de imagem diretamente das imagens extraídas
      for (const [layerName, imageData] of extractedImages.entries()) {
        const layerInfo = psdData.layers.find(layer => layer.name === layerName);
        if (layerInfo) {
          psdLogger.debug(`Criando elemento de imagem para: ${layerName}`);
          
          // Criar elemento de imagem diretamente
          const imageElement: EditorElement = {
            id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'image',
            content: imageData,
            _layerName: layerName,
            style: {
              x: layerInfo.x || 0,
              y: layerInfo.y || 0,
              width: layerInfo.width || 100,
              height: layerInfo.height || 100,
              objectFit: 'cover'
            },
            sizeId: selectedSize.name
          };
          
          // Processar para CDN
          const processedElement = await processImageElement(imageElement);
          elements.push(processedElement);
          psdLogger.debug(`Elemento de imagem criado manualmente para: ${layerName}`);
        }
      }
    }

    // If no elements were processed directly from psd.layers,
    // try to use the tree() to get layers
    if (elements.length === 0 && psd.tree && typeof psd.tree === 'function') {
      const tree = psd.tree();
      psdLogger.info("Processando árvore do PSD para extração de camadas");

      // Check if the tree has descendants method
      if (tree.descendants && typeof tree.descendants === 'function') {
        const descendants = tree.descendants();
        psdLogger.info(`Encontrados ${descendants.length} descendentes na árvore do PSD`);

        for (const node of descendants) {
          if (!node.isGroup || (typeof node.isGroup === 'function' && !node.isGroup())) {
            psdLogger.debug(`Processando nó: ${node.name}`);
            
            // Verificar se o nó tem máscara
            const maskData = extractMaskData(node);
            
            const element = await processLayer(node, selectedSize, psdData, extractedImages);
            if (element) {
              // Assign 'global' sizeId for visibility in all artboards
              element.sizeId = 'global';
              
              // Se encontramos dados de máscara válidos, anexamos ao elemento
              if (maskData && maskData.hasValidMask) {
                element.psdLayerData = element.psdLayerData || {};
                element.psdLayerData.mask = maskData;
                
                // Aplicar ajustes específicos para elementos com máscara
                const adjustedElement = adjustElementWithMask(element, maskData, selectedSize);
                
                // Se for uma imagem, processar para CDN
                const processedElement = element.type === 'image'
                  ? await processImageElement(adjustedElement)
                  : adjustedElement;
                  
                maskedElementsCount.count++;
                psdLogger.debug(`Aplicada máscara ao nó "${node.name || 'sem nome'}": ${maskData.width}×${maskData.height}`);
                
                elements.push(processedElement);
              } else {
                // Se for uma imagem, processar para CDN
                const processedElement = element.type === 'image'
                  ? await processImageElement(element)
                  : element;
                  
                elements.push(processedElement);
              }
            }
          }
        }
      } else if (tree.children && Array.isArray(tree.children)) {
        // If tree has children property, process them recursively
        const processChildrenRecursively = async (children: any[]) => {
          for (const child of children) {
            if (!child.isGroup || (typeof child.isGroup === 'function' && !child.isGroup())) {
              psdLogger.debug(`Processando filho: ${child.name}`);
              
              // Verificar se o nó tem máscara
              const maskData = extractMaskData(child);
              
              const element = await processLayer(child, selectedSize, psdData, extractedImages);
              if (element) {
                // Assign 'global' sizeId for visibility in all artboards
                element.sizeId = 'global';
                
                // Se encontramos dados de máscara válidos, anexamos ao elemento
                if (maskData && maskData.hasValidMask) {
                  element.psdLayerData = element.psdLayerData || {};
                  element.psdLayerData.mask = maskData;
                  
                  // Aplicar ajustes específicos para elementos com máscara
                  const adjustedElement = adjustElementWithMask(element, maskData, selectedSize);
                  
                  // Se for uma imagem, processar para CDN
                  const processedElement = element.type === 'image'
                    ? await processImageElement(adjustedElement)
                    : adjustedElement;
                    
                  maskedElementsCount.count++;
                  psdLogger.debug(`Aplicada máscara ao filho "${child.name || 'sem nome'}": ${maskData.width}×${maskData.height}`);
                  
                  elements.push(processedElement);
                } else {
                  // Se for uma imagem, processar para CDN
                  const processedElement = element.type === 'image'
                    ? await processImageElement(element)
                    : element;
                    
                  elements.push(processedElement);
                }
              }
            }

            if (child.children && Array.isArray(child.children)) {
              await processChildrenRecursively(child.children);
            }
          }
        };

        await processChildrenRecursively(tree.children);
      }
    }

    // Calculate percentage values - important for responsive behavior
    calculatePercentageValues(elements, selectedSize);

    // Adicionar logs detalhados para posicionamento de todos os elementos
    psdLogger.debug("=== RESUMO DE POSICIONAMENTO DOS ELEMENTOS ===");
    elements.forEach((element, index) => {
      psdLogger.debug(`Elemento #${index + 1}: ${element._layerName || element.type}`, {
        tipo: element.type,
        tem_máscara: element.style.hasMask || false,
        posição: {
          x: Math.round(element.style.x),
          y: Math.round(element.style.y),
          percentualX: Math.round(element.style.xPercent || 0),
          percentualY: Math.round(element.style.yPercent || 0)
        },
        dimensões: {
          largura: Math.round(element.style.width),
          altura: Math.round(element.style.height),
          percentualLargura: Math.round(element.style.widthPercent || 0),
          percentualAltura: Math.round(element.style.heightPercent || 0)
        }
      });
    });

    // Após processar todos os elementos, verificar se alguma imagem foi enviada para o CDN
    const cdnImages = elements.filter(el => 
      el.type === 'image' && 
      el.content && 
      typeof el.content === 'string' && 
      !el.content.startsWith('data:')
    ).length;
    
    if (cdnImages > 0) {
      psdLogger.info(`${cdnImages} imagens foram enviadas para o CDN`);
    }

    // Try to save PSD data to localStorage
    try {
      const storageKey = savePSDDataToStorage(file.name, psdData);

      // Display information about saved PSD data
      const psdDataKeys = getPSDMetadata();
      if (psdDataKeys.length > 0) {
        psdLogger.debug(`PSD data disponíveis no localStorage: ${psdDataKeys.length}`);
      }
    } catch (error) {
      psdLogger.error("Error saving PSD data to localStorage:", error);
      // This is non-critical, so we can continue even if storage fails
    }

    // Log summary of imported elements
    const textElements = elements.filter(el => el.type === 'text').length;
    const imageElementsCount = elements.filter(el => el.type === 'image').length;
    const maskedElements = elements.filter(el => el.style && el.style.hasMask).length;

    psdLogger.info(`Importação finalizada: ${elements.length} elementos (${textElements} textos, ${imageElementsCount} imagens, ${maskedElements} com máscaras)`);

    if (elements.length === 0) {
      toast.warning("Nenhuma camada visível encontrada no arquivo PSD.");
    } else {
      toast.success(`Importados ${elements.length} elementos do arquivo PSD.`);
    }

    // Invertendo a ordem dos elementos para corresponder à ordem de camadas do Photoshop
    const reversedElements = [...elements].reverse();
    psdLogger.info(`Ordem das camadas invertida para corresponder à ordem de renderização do Photoshop`);

    // Return just the elements - artboard background will be managed separately
    return reversedElements;
  } catch (error) {
    psdLogger.error("Error importing PSD file:", error);
    toast.error("Falha ao interpretar o arquivo PSD. Verifique se é um PSD válido.");
    throw error;
  }
};
