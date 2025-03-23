import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { parsePSDFile } from './psdParser';
import { processLayer, calculatePercentageValues } from './elementProcessor';
import { savePSDDataToStorage, getPSDMetadata } from './storage';
import { PSDFileData } from './types';
import { convertPSDColorToHex } from './formatters';

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
const LOG_LEVEL = LogLevel.INFO;

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
    psdLogger.debug(`Imagens extraídas: ${Array.from(extractedImages.keys()).join(', ')}`);

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
            sizeId: 'global'
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
    for (const layer of psd.layers) {
      if (layer.name && processedTextLayerNames.has(layer.name)) {
        psdLogger.debug(`Pulando camada de texto já processada: ${layer.name}`);
        continue; // Ignorar camadas de texto já processadas
      }

      // Verificar se a camada tem máscara antes de processar
      const maskData = extractMaskData(layer);
      
      // Processar a camada normalmente
      const element = await processLayer(layer, selectedSize, psdData, extractedImages);
      
      if (element) {
        // Assign the sizeId as 'global' to ensure elements are visible in all artboards
        element.sizeId = 'global';
        
        // Se encontramos dados de máscara válidos, anexamos ao elemento
        if (maskData && maskData.hasValidMask) {
          element.psdLayerData = element.psdLayerData || {};
          element.psdLayerData.mask = maskData;
          
          // Aplicar ajustes específicos para elementos com máscara
          const adjustedElement = adjustElementWithMask(element, maskData, selectedSize);
          maskedElementsCount.count++;
          psdLogger.debug(`Aplicada máscara à camada "${layer.name || 'sem nome'}": ${maskData.width}×${maskData.height}`);
          
          elements.push(adjustedElement);
        } else {
          elements.push(element);
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
                maskedElementsCount.count++;
                psdLogger.debug(`Aplicada máscara ao nó "${node.name || 'sem nome'}": ${maskData.width}×${maskData.height}`);
                
                elements.push(adjustedElement);
              } else {
                elements.push(element);
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
                  maskedElementsCount.count++;
                  psdLogger.debug(`Aplicada máscara ao filho "${child.name || 'sem nome'}": ${maskData.width}×${maskData.height}`);
                  
                  elements.push(adjustedElement);
                } else {
                  elements.push(element);
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

    // Allow elements to extend slightly beyond artboard boundaries
    // but still ensure they're connected to the artboard
    elements.forEach(element => {
      // Ensure all elements have the 'global' sizeId
      element.sizeId = 'global';

      // If element extends beyond right edge by more than 50%
      if (element.style.x > selectedSize.width * 1.5) {
        element.style.x = selectedSize.width - element.style.width / 2;
      }

      // If element extends beyond bottom edge by more than 50%
      if (element.style.y > selectedSize.height * 1.5) {
        element.style.y = selectedSize.height - element.style.height / 2;
      }

      // If element is completely off-screen to the left
      if (element.style.x + element.style.width < -element.style.width * 0.5) {
        element.style.x = -element.style.width / 2;
      }

      // If element is completely off-screen to the top
      if (element.style.y + element.style.height < -element.style.height * 0.5) {
        element.style.y = -element.style.height / 2;
      }

      // Recalculate percentages after adjustments
      element.style.xPercent = (element.style.x / selectedSize.width) * 100;
      element.style.yPercent = (element.style.y / selectedSize.height) * 100;
      element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
      element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
    });

    // Don't create the artboard background element as it will be managed separately

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
    const imageElements = elements.filter(el => el.type === 'image').length;
    const maskedElements = elements.filter(el => el.style && el.style.hasMask).length;

    psdLogger.info(`Importação finalizada: ${elements.length} elementos (${textElements} textos, ${imageElements} imagens, ${maskedElements} com máscaras)`);

    if (elements.length === 0) {
      toast.warning("Nenhuma camada visível encontrada no arquivo PSD.");
    } else {
      toast.success(`Importados ${elements.length} elementos do arquivo PSD.`);
    }

    // Return just the elements - artboard background will be managed separately
    return elements;
  } catch (error) {
    psdLogger.error("Error importing PSD file:", error);
    toast.error("Falha ao interpretar o arquivo PSD. Verifique se é um PSD válido.");
    throw error;
  }
};
