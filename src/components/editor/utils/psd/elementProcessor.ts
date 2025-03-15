import { EditorElement, BannerSize } from '../../types';
import { detectLayerType, isTextLayer } from './layerDetection';
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
    console.log(`Processing layer: ${layer.name || 'unnamed'}`);
    
    // Skip hidden layers
    if (layer.hidden && typeof layer.hidden !== 'function') return null;
    if (typeof layer.hidden === 'function' && layer.hidden()) return null;
    
    // Check if this is a group layer with no dimensions
    if (layer.isGroup && typeof layer.isGroup === 'function' && layer.isGroup()) {
      console.log(`Layer "${layer.name}" is a group layer - skipping`);
      return null;
    }
    
    // Get layer export data to check dimensions
    let exportData;
    try {
      exportData = layer.export();
      if (!exportData.width || !exportData.height || exportData.width <= 0 || exportData.height <= 0) {
        console.log(`Layer "${layer.name}" has invalid dimensions - skipping`);
        return null;
      }
    } catch (exportError) {
      console.error(`Could not export layer data for "${layer.name}":`, exportError);
      return null;
    }
    
    // CRITICAL: First check if this is a text layer using our improved detection
    if (isTextLayer(layer)) {
      console.log(`Detected text layer "${layer.name}" - processing as text`);
      const element = await createTextElement(layer, selectedSize);
      
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
        
        // Ensure the element has the correct sizeId
        element.sizeId = selectedSize.name;
        return element;
      }
      return null;
    }
    
    // For non-text layers, continue with regular detection
    const layerType = detectLayerType(layer);
    console.log(`Detected layer type for "${layer.name}": ${layerType}`);
    
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
      // Check if we already have this image pre-extracted
      let preExtractedImage: string | undefined;
      if (extractedImages && layer.name) {
        preExtractedImage = extractedImages.get(layer.name);
      }
      
      // Create image element using pre-extracted image data if available
      element = await createImageElement(layer, selectedSize, preExtractedImage);
      
      if (element) {
        console.log(`Created image element from layer: ${layer.name}`);
        
        // Store image in our application storage
        let imageKey = '';
        try {
          imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
        } catch (storageError) {
          console.error("Error saving image to localStorage:", storageError);
          // Continue with default key
          imageKey = `psd-image-${Date.now()}-${(layer.name || 'image').replace(/\s+/g, '-').toLowerCase()}`;
        }
        
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
        console.log(`Created ${element.type} element from layer: ${layer.name}`);
        
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
          try {
            layerInfo.imageKey = saveImageToStorage(element.content as string, layer.name || 'image');
          } catch (storageError) {
            console.error("Error saving image to localStorage:", storageError);
            // Continue with default key
            layerInfo.imageKey = `psd-image-${Date.now()}-${(layer.name || 'image').replace(/\s+/g, '-').toLowerCase()}`;
          }
        }
        
        psdData.layers.push(layerInfo);
      }
    }
    
    // Ensure the element has the correct sizeId
    if (element) {
      element.sizeId = selectedSize.name;
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
