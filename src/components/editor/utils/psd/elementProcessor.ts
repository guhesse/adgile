import { EditorElement, BannerSize } from '../../types';
import { detectLayerType } from './layerDetection';
import { createTextElement, createImageElement, createFallbackElement } from './elementCreation';
import { PSDFileData, PSDLayerInfo, PSDLayer } from './types';
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
      console.log(`Criando elemento de texto para camada: ${layer.name || 'sem nome'}`);
      element = await createTextElement(layer, selectedSize);
      
      if (element) {
        // Extract text styling with enhanced logging
        console.log(`Extraindo estilos de texto para: ${layer.name || 'sem nome'}`);
        try {
          // Log raw layer object for better debugging
          console.log(`Camada de texto completa:`, layer);
          
          // Extract text information directly from layer if possible
          if (layer.text) {
            console.log(`Propriedades de texto (layer.text):`, layer.text);
            
            // NEW: Check if text is in the format we're looking for from the example
            if (typeof layer.text === 'object' && layer.text.value && layer.text.font) {
              console.log(`FOUND EXACT TEXT FORMAT WE'RE LOOKING FOR:`, layer.text);
              console.log(`Text Value: "${layer.text.value}"`);
              console.log(`Font Name: ${layer.text.font.name}`);
              console.log(`Font Sizes:`, layer.text.font.sizes);
              console.log(`Font Colors:`, layer.text.font.colors);
              console.log(`Text Alignment:`, layer.text.font.alignment);
              
              // Update the element content with text value
              element.content = layer.text.value;
              
              // Apply font styling
              if (layer.text.font.name) {
                element.style.fontFamily = layer.text.font.name;
                console.log(`Applying fontFamily: ${element.style.fontFamily}`);
              }
              
              // Apply font size (use first size in the array)
              if (layer.text.font.sizes && layer.text.font.sizes.length > 0) {
                element.style.fontSize = layer.text.font.sizes[0];
                console.log(`Applying fontSize: ${element.style.fontSize}`);
              }
              
              // Apply color (use first color in the array)
              if (layer.text.font.colors && layer.text.font.colors.length > 0) {
                const colorArray = layer.text.font.colors[0];
                element.style.color = convertPSDColorToHex(colorArray);
                console.log(`Applying color: ${element.style.color}`);
              }
              
              // Apply text alignment (use first alignment in the array)
              if (layer.text.font.alignment && layer.text.font.alignment.length > 0) {
                const alignment = layer.text.font.alignment[0];
                element.style.textAlign = convertPSDAlignmentToCSS(alignment);
                console.log(`Applying textAlign: ${element.style.textAlign}`);
              }
            }
          }
          
          // If we haven't found the exact format, try other methods
          if (!element.style.fontFamily) {
            // Check if the layer has the text property in the expected format from psd.js
            if (layer.text && layer.text.value) {
              console.log(`Texto encontrado: "${layer.text.value}"`);
              
              // Update element content with the actual text
              element.content = layer.text.value;
              
              // Extract font information
              if (layer.text.font) {
                console.log(`Informações de fonte encontradas:`, layer.text.font);
                
                // Font family
                if (layer.text.font.name) {
                  element.style.fontFamily = layer.text.font.name;
                  console.log(`Aplicando fontFamily: ${element.style.fontFamily}`);
                }
                
                // Font size - get first size from sizes array
                if (layer.text.font.sizes && layer.text.font.sizes.length > 0) {
                  const fontSize = layer.text.font.sizes[0];
                  element.style.fontSize = fontSize;
                  console.log(`Aplicando fontSize: ${element.style.fontSize}`);
                }
                
                // Font color - get first color from colors array and convert to hex
                if (layer.text.font.colors && layer.text.font.colors.length > 0) {
                  const colorArray = layer.text.font.colors[0];
                  element.style.color = convertPSDColorToHex(colorArray);
                  console.log(`Aplicando color: ${element.style.color}`);
                }
                
                // Text alignment - get from alignment array
                if (layer.text.font.alignment && layer.text.font.alignment.length > 0) {
                  const alignment = layer.text.font.alignment[0].toLowerCase();
                  // Convert to our supported alignment values
                  element.style.textAlign = convertPSDAlignmentToCSS(alignment);
                  console.log(`Aplicando textAlign: ${element.style.textAlign}`);
                }
              }
            } else {
              // Fallback to old style extraction method
              console.log(`Usando método alternativo de extração de estilo`);
              
              // Get text styling information if available
              if (layer.text) {
                const textStyle = {
                  fontSize: layer.text.fontSize || layer.text.size,
                  fontFamily: layer.text.font,
                  fontWeight: layer.text.fontWeight,
                  color: layer.text.color,
                  textAlign: layer.text.alignment,
                  lineHeight: layer.text.leading,
                  letterSpacing: layer.text.tracking,
                  fontStyle: layer.text.italic ? 'italic' : 'normal',
                  textDecoration: layer.text.underline ? 'underline' : 'none'
                };
                
                console.log(`Estilos de texto encontrados:`, textStyle);
                
                // Apply text styles to the element
                if (textStyle.fontSize) {
                  element.style.fontSize = typeof textStyle.fontSize === 'number' 
                    ? textStyle.fontSize 
                    : parseInt(textStyle.fontSize);
                  console.log(`Aplicando fontSize: ${element.style.fontSize}`);
                }
                
                if (textStyle.fontFamily) {
                  element.style.fontFamily = textStyle.fontFamily;
                  console.log(`Aplicando fontFamily: ${element.style.fontFamily}`);
                }
                
                if (textStyle.fontWeight) {
                  // Convert PSD font weight to CSS weight
                  const weight = typeof textStyle.fontWeight === 'string' 
                    ? textStyle.fontWeight.toLowerCase()
                    : textStyle.fontWeight;
                    
                  // Convert named weights to values
                  if (weight === 'bold' || weight >= 700) {
                    element.style.fontWeight = 'bold';
                  } else if (weight === 'medium' || (weight >= 500 && weight < 700)) {
                    element.style.fontWeight = 'medium';
                  } else {
                    element.style.fontWeight = 'normal';
                  }
                  
                  console.log(`Aplicando fontWeight: ${element.style.fontWeight}`);
                }
                
                if (textStyle.color) {
                  element.style.color = textStyle.color;
                  console.log(`Aplicando color: ${element.style.color}`);
                }
                
                if (textStyle.textAlign) {
                  // Convert PSD alignment to editor alignment
                  const alignment = textStyle.textAlign.toString().toLowerCase();
                  if (alignment.includes('left')) {
                    element.style.textAlign = 'left';
                  } else if (alignment.includes('right')) {
                    element.style.textAlign = 'right';
                  } else if (alignment.includes('center')) {
                    element.style.textAlign = 'center';
                  }
                  // Remove 'justify' as it's not a supported option in our type
                  
                  console.log(`Aplicando textAlign: ${element.style.textAlign}`);
                }
                
                if (textStyle.lineHeight) {
                  // Convert to number if needed
                  element.style.lineHeight = typeof textStyle.lineHeight === 'number'
                    ? textStyle.lineHeight
                    : parseFloat(textStyle.lineHeight);
                  
                  console.log(`Aplicando lineHeight: ${element.style.lineHeight}`);
                }
                
                if (textStyle.letterSpacing) {
                  // Convert to number if needed
                  element.style.letterSpacing = typeof textStyle.letterSpacing === 'number'
                    ? textStyle.letterSpacing
                    : parseFloat(textStyle.letterSpacing);
                  
                  console.log(`Aplicando letterSpacing: ${element.style.letterSpacing}`);
                }
                
                if (textStyle.fontStyle) {
                  element.style.fontStyle = textStyle.fontStyle;
                  console.log(`Aplicando fontStyle: ${element.style.fontStyle}`);
                }
                
                if (textStyle.textDecoration) {
                  element.style.textDecoration = textStyle.textDecoration;
                  console.log(`Aplicando textDecoration: ${element.style.textDecoration}`);
                }
              }
            }
          }
          
          // Store text style info in PSD data
          const layerInfo: PSDLayer = {
            id: element.id,
            name: layer.name || 'Text Layer',
            type: 'text',
            x: element.style.x,
            y: element.style.y,
            width: element.style.width,
            height: element.style.height,
            textContent: element.content as string,
            textStyle: {
              fontSize: element.style.fontSize || 14,
              fontFamily: element.style.fontFamily || 'Arial',
              fontWeight: element.style.fontWeight || 'normal',
              color: element.style.color || '#000000',
              alignment: element.style.textAlign || 'left',
              lineHeight: element.style.lineHeight || 1.2,
              letterSpacing: element.style.letterSpacing || 0,
              fontStyle: element.style.fontStyle || 'normal'
            }
          };
          
          psdData.layers.push(layerInfo);
          console.log(`Estilos de texto salvos nos dados do PSD`);
        } catch (textStyleError) {
          console.error('Erro ao extrair estilos de texto:', textStyleError);
          
          // Still add basic layer info to PSD data
          const layerInfo: PSDLayer = {
            id: element.id,
            name: layer.name || 'Text Layer',
            type: 'text',
            x: element.style.x,
            y: element.style.y,
            width: element.style.width,
            height: element.style.height,
            textContent: element.content as string
          };
          
          psdData.layers.push(layerInfo);
        }
      }
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
          const layerInfo: PSDLayer = {
            id: element.id,
            name: layer.name || 'Image Layer',
            type: 'image',
            position: {
              x: element.style.x,
              y: element.style.y,
              width: element.style.width,
              height: element.style.height
            },
            imageUrl: element.content as string,
            imageKey: imageKey
          };
          
          // Só adiciona se não existir ainda
          if (!psdData.layers.some(l => l.name === layerInfo.name)) {
            psdData.layers.push(layerInfo);
          }
        } catch (storageError) {
          console.error('Erro ao salvar imagem no storage:', storageError);
          
          // Still add the element but without storage reference
          const layerInfo: PSDLayer = {
            id: element.id,
            name: layer.name || 'Image Layer',
            type: 'image',
            position: {
              x: element.style.x,
              y: element.style.y,
              width: element.style.width,
              height: element.style.height
            },
            imageUrl: element.content as string
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
        const layerInfo: PSDLayer = {
          id: element.id,
          name: layer.name || 'Generic Layer',
          type: element.type,
          position: {
            x: element.style.x,
            y: element.style.y,
            width: element.style.width,
            height: element.style.height
          }
        };
        
        if (element.type === 'image' && element.content) {
          try {
            layerInfo.imageData = element.content as string;
            console.log(`Imagem de camada genérica salva no storage`);
          } catch (storageError) {
            console.error('Erro ao salvar imagem de camada genérica no storage:', storageError);
            layerInfo.imageData = element.content as string;
          }
        }
        
        psdData.layers.push(layerInfo);
        console.log(`Informações da camada genérica adicionadas aos dados do PSD`);
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
