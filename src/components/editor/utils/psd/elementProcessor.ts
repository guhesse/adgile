
import { EditorElement, BannerSize } from '../../../types';
import { detectLayerType } from './layerDetection';
import { createTextElement, createImageElement, createFallbackElement } from './elementCreation';
import { PSDFileData, PSDLayerInfo } from './types';

/**
 * Process a single PSD layer into an editor element
 * @param layer The PSD layer
 * @param selectedSize The selected banner size
 * @param psdData The PSD data to update with layer info
 * @returns The created element, or null if creation failed
 */
export const processLayer = async (
  layer: any, 
  selectedSize: BannerSize, 
  psdData: PSDFileData
): Promise<EditorElement | null> => {
  try {
    console.log(`Processing layer: ${layer.name || 'unnamed'}`);
    
    // Skip hidden layers
    if (layer.hidden && typeof layer.hidden !== 'function') return null;
    if (typeof layer.hidden === 'function' && layer.hidden()) return null;
    
    // Check layer type
    const layerType = detectLayerType(layer);
    console.log(`Detected layer type: ${layerType}`);
    
    // Create element based on type
    let element: EditorElement | null = null;
    
    if (layerType === 'text') {
      element = await createTextElement(layer, selectedSize);
      if (element) {
        console.log(`Created text element from layer: ${layer.name}`);
        
        // Add to PSD data
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
    } else if (layerType === 'image') {
      element = await createImageElement(layer, selectedSize);
      if (element) {
        console.log(`Created image element from layer: ${layer.name}`);
        
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
          imageUrl: element.content as string
        };
        
        psdData.layers.push(layerInfo);
      }
    } else {
      element = createFallbackElement(layer, selectedSize);
      if (element) {
        console.log(`Created fallback element from layer: ${layer.name}`);
        
        // Add to PSD data
        const layerInfo: PSDLayerInfo = {
          id: element.id,
          name: layer.name || 'Generic Layer',
          type: 'container',
          position: {
            x: element.style.x,
            y: element.style.y,
            width: element.style.width,
            height: element.style.height
          }
        };
        
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
