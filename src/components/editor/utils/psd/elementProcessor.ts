
import { EditorElement, BannerSize } from '../../types';
import { detectLayerType } from './layerDetection';
import { createTextElement, createImageElement, createFallbackElement } from './elementCreation';
import { PSDFileData, PSDLayerInfo } from './types';
import { saveImageToStorage } from './storage';
import { convertPSDColorToHex, convertPSDAlignmentToCSS } from './formatters';

/**
 * Process a single PSD layer into an editor element
 * @param layer The PSD layer
 * @param selectedSize The selected banner size
 * @param psdData The PSD data to update with layer info
 * @param extractedImages Optional map of pre-extracted images
 * @returns The created element, or null if creation failed
 */
export const processLayer = async (
  layer: any, 
  selectedSize: BannerSize, 
  psdData: PSDFileData,
  extractedImages?: Map<string, string>
): Promise<EditorElement | null> => {
  try {
    // Skip hidden layers
    if (layer.hidden && typeof layer.hidden !== 'function') {
      console.log(`Ignorando camada oculta: ${layer.name || 'sem nome'}`);
      return null;
    }
    if (typeof layer.hidden === 'function' && layer.hidden()) {
      console.log(`Ignorando camada oculta (função): ${layer.name || 'sem nome'}`);
      return null;
    }
    
    // Check if this is a group layer with no dimensions
    if (layer.isGroup && typeof layer.isGroup === 'function' && layer.isGroup()) {
      console.log(`Ignorando camada de grupo: ${layer.name || 'sem nome'}`);
      return null;
    }
    
    console.log(`Processando camada: ${layer.name || 'sem nome'}`);
    
    // Get layer export data to check dimensions
    let exportData;
    try {
      exportData = layer.export();
      console.log(`Dados de exportação da camada:`, exportData);
      
      if (!exportData.width || !exportData.height || exportData.width <= 0 || exportData.height <= 0) {
        console.log(`Ignorando camada com dimensões inválidas: ${layer.name || 'sem nome'}`);
        return null;
      }
    } catch (exportError) {
      console.error(`Erro ao exportar dados da camada: ${layer.name || 'sem nome'}`, exportError);
      return null;
    }
    
    // Check layer type
    console.log(`Detectando tipo da camada: ${layer.name || 'sem nome'}`);
    const layerType = detectLayerType(layer);
    console.log(`Tipo detectado: ${layerType}`);
    
    // Create element based on type
    let element: EditorElement | null = null;
    
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
          const layerInfo: PSDLayerInfo = {
            id: element.id,
            name: layer.name || 'Text Layer',
            type: 'text',
            position: {
              x: element.style.x,
              y: element.style.y,
              width: element.style.width,
              height: element.style.height
            },
            content: element.content as string,
            textStyle: {
              fontSize: element.style.fontSize,
              fontFamily: element.style.fontFamily,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign,
              lineHeight: element.style.lineHeight,
              letterSpacing: element.style.letterSpacing,
              fontStyle: element.style.fontStyle,
              textDecoration: element.style.textDecoration
            }
          };
          
          psdData.layers.push(layerInfo);
          console.log(`Estilos de texto salvos nos dados do PSD`);
        } catch (textStyleError) {
          console.error('Erro ao extrair estilos de texto:', textStyleError);
          
          // Still add basic layer info to PSD data
          const layerInfo: PSDLayerInfo = {
            id: element.id,
            name: layer.name || 'Text Layer',
            type: 'text',
            position: {
              x: element.style.x,
              y: element.style.y,
              width: element.style.width,
              height: element.style.height
            },
            content: element.content as string
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
          const layerInfo: PSDLayerInfo = {
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
          
          psdData.layers.push(layerInfo);
        } catch (storageError) {
          console.error('Erro ao salvar imagem no storage:', storageError);
          
          // Still add the element but without storage reference
          const layerInfo: PSDLayerInfo = {
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
          
          psdData.layers.push(layerInfo);
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
        
        // If image creation failed, create a fallback element
        if (!element) {
          console.log(`Criando elemento de fallback para camada genérica`);
          element = createFallbackElement(layer, selectedSize);
        }
      }
      
      if (element) {
        // Add to PSD data
        const layerInfo: PSDLayerInfo = {
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
            layerInfo.imageUrl = element.content as string;
            layerInfo.imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
            console.log(`Imagem de camada genérica salva no storage`);
          } catch (storageError) {
            console.error('Erro ao salvar imagem de camada genérica no storage:', storageError);
            layerInfo.imageUrl = element.content as string;
          }
        }
        
        psdData.layers.push(layerInfo);
        console.log(`Informações da camada genérica adicionadas aos dados do PSD`);
      }
    }
    
    return element;
  } catch (layerError) {
    console.error(`Erro ao processar camada ${layer?.name || 'sem nome'}:`, layerError);
    return null;
  }
};

/**
 * Calculate percentage values for element positioning
 * @param elements Array of editor elements
 * @param selectedSize The selected banner size
 */
export const calculatePercentageValues = (elements: EditorElement[], selectedSize: BannerSize): void => {
  elements.forEach((element) => {
    element.style.xPercent = (element.style.x / selectedSize.width) * 100;
    element.style.yPercent = (element.style.y / selectedSize.height) * 100;
    element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
    element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
  });
};
