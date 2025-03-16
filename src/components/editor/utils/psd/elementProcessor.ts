
import { EditorElement, BannerSize } from '../../types';
import { detectLayerType } from './layerDetection';
import { createTextElement, createImageElement, createFallbackElement } from './elementCreation';
import { PSDFileData, PSDLayerInfo } from './types';
import { saveImageToStorage } from './storage';

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
    if (layer.hidden && typeof layer.hidden !== 'function') return null;
    if (typeof layer.hidden === 'function' && layer.hidden()) return null;
    
    // Check if this is a group layer with no dimensions
    if (layer.isGroup && typeof layer.isGroup === 'function' && layer.isGroup()) {
      return null;
    }
    
    // Get layer export data to check dimensions
    let exportData;
    try {
      exportData = layer.export();
      if (!exportData.width || !exportData.height || exportData.width <= 0 || exportData.height <= 0) {
        return null;
      }
    } catch (exportError) {
      return null;
    }
    
    // Check layer type
    const layerType = detectLayerType(layer);
    
    // Create element based on type
    let element: EditorElement | null = null;
    
    if (layerType === 'text') {
      element = await createTextElement(layer, selectedSize);
      if (element) {
        // Extract text styling
        try {
          // Get text styling information if available
          if (layer.text && layer.text.font) {
            const textStyle = {
              fontSize: layer.text.fontSize || layer.text.size,
              fontFamily: layer.text.font,
              fontWeight: layer.text.fontWeight,
              color: layer.text.color,
              textAlign: layer.text.alignment,
              lineHeight: layer.text.leading,
              letterSpacing: layer.text.tracking
            };
            
            // Apply text styles to the element
            if (textStyle.fontSize) element.style.fontSize = textStyle.fontSize;
            if (textStyle.fontFamily) element.style.fontFamily = textStyle.fontFamily;
            if (textStyle.fontWeight) element.style.fontWeight = textStyle.fontWeight;
            if (textStyle.color) element.style.color = textStyle.color;
            if (textStyle.textAlign) {
              // Convert PSD alignment to editor alignment
              const alignment = textStyle.textAlign.toString().toLowerCase();
              if (alignment.includes('left')) element.style.textAlign = 'left';
              else if (alignment.includes('right')) element.style.textAlign = 'right';
              else if (alignment.includes('center')) element.style.textAlign = 'center';
            }
            if (textStyle.lineHeight) element.style.lineHeight = textStyle.lineHeight;
            if (textStyle.letterSpacing) element.style.letterSpacing = textStyle.letterSpacing;
            
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
              textStyle: textStyle
            };
            
            psdData.layers.push(layerInfo);
          }
        } catch (textStyleError) {
          console.error('Error extracting text styles:', textStyleError);
          
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
      }
      
      // Create image element using pre-extracted image data if available
      element = await createImageElement(layer, selectedSize, preExtractedImage);
      
      if (element) {
        // Store image in our application storage
        const imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
        
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
      }
    } else {
      // For generic layers that might contain images or other content
      // Check if we have a pre-extracted image for this layer
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
      }
      
      // If we found a pre-extracted image, treat as image layer
      if (preExtractedImage) {
        element = await createImageElement(layer, selectedSize, preExtractedImage);
      } else {
        // First check if it could be treated as an image
        element = await createImageElement(layer, selectedSize);
        
        // If image creation failed, create a fallback element
        if (!element) {
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
          layerInfo.imageUrl = element.content as string;
          layerInfo.imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
        }
        
        psdData.layers.push(layerInfo);
      }
    }
    
    return element;
  } catch (layerError) {
    console.error(`Error processing layer ${layer?.name || 'unnamed'}:`, layerError);
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
