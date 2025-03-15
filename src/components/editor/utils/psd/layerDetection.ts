
// Layer type detection utility functions
import { saveImageToStorage } from './storage';

type LayerType = 'text' | 'image' | 'generic';

/**
 * Detects the type of a PSD layer
 * @param layer The PSD layer to analyze
 * @returns The detected layer type
 */
export const detectLayerType = (layer: any): LayerType => {
  if (isTextLayer(layer)) {
    return 'text';
  } else if (shouldBeImageLayer(layer)) {
    return 'image';
  }
  return 'generic';
};

/**
 * Enhanced text layer detection - combines multiple approaches
 * @param layer The PSD layer to analyze
 * @returns Whether the layer is a text layer
 */
export const isTextLayer = (layer: any): boolean => {
  try {
    if (!layer) return false;
    
    console.log(`Checking text indicators for "${layer.name || 'unnamed'}" layer`);
    
    // Fastest check: Look for TySh in infoKeys (PSD marker for text layers)
    if (layer.infoKeys && Array.isArray(layer.infoKeys) && layer.infoKeys.includes('TySh')) {
      console.log(`Layer "${layer.name}" is text - has TySh in infoKeys`);
      return true;
    }
    
    // Check: Direct type identification
    if (layer.type === 'type' || layer.type === 'text' || layer.type === 'TextLayer') {
      console.log(`Layer "${layer.name}" is text by type property: ${layer.type}`);
      return true;
    }
    
    // Check: Text patterns in layer name
    const textPatterns = /heading|h1|h2|h3|h4|h5|h6|paragraph|text|body|title|subtitle|button|label|caption/i;
    if (layer.name && textPatterns.test(layer.name)) {
      console.log(`Layer "${layer.name}" is text by name pattern`);
      return true;
    }
    
    // Check: Layer kind (3 is text in PSD spec)
    if (layer.info && layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layerKind: 3`);
      return true;
    }
    
    if (layer.layer && layer.layer.info && layer.layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layer.info.layerKind: 3`);
      return true;
    }
    
    // Check: typeTool presence in adjustments
    if (layer.adjustments && layer.adjustments.typeTool) {
      console.log(`Layer "${layer.name}" is text - has typeTool in adjustments`);
      return true;
    }
    
    // Check: Text function or property
    if (layer.text) {
      console.log(`Layer "${layer.name}" has text property`);
      return true;
    }
    
    // Check: typeTool function
    if (typeof layer.typeTool === 'function') {
      try {
        const typeToolData = layer.typeTool();
        if (typeToolData) {
          console.log(`Layer "${layer.name}" is text - has valid typeTool function`);
          return true;
        }
      } catch (err) {
        console.log(`Error executing typeTool function for "${layer.name}":`, err);
      }
    }
    
    console.log(`Layer "${layer.name}" is NOT a text layer - no text indicators found`);
    return false;
  } catch (error) {
    console.error(`Error in text layer detection for ${layer?.name || 'unnamed'}:`, error);
    return false;
  }
};

/**
 * Check if a layer should be treated as an image
 * @param layer The PSD layer to analyze
 * @returns Whether the layer should be treated as an image
 */
export const shouldBeImageLayer = (layer: any): boolean => {
  if (!layer) return false;
  
  // Skip group layers or layers without dimensions
  if (layer.isGroup && layer.isGroup()) return false;
  
  try {
    const exportData = layer.export();
    if (!exportData.width || !exportData.height || exportData.width <= 0 || exportData.height <= 0) {
      return false;
    }
    
    // Check if this is NOT a text layer (since text layers have dimensions too)
    if (isTextLayer(layer)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if layer is image:`, error);
    return false;
  }
};

/**
 * Creates a temporary canvas element for image data extraction
 * @param width Canvas width
 * @param height Canvas height
 * @returns HTMLCanvasElement
 */
const createTempCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Create a placeholder image with layer name when extraction fails
 * @param layerName The name of the layer
 * @param width Image width
 * @param height Image height
 * @returns Data URL of the generated placeholder image
 */
const createPlaceholderImage = (layerName: string, width: number, height: number): string => {
  try {
    const canvas = createTempCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Fill background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(layerName, width / 2, height / 2);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating placeholder image:', error);
    return '';
  }
};

/**
 * Extract image data from a PSD layer using the most reliable approach
 * @param layer The PSD layer
 * @param layerName The layer name for reference
 * @returns Promise resolving to an object containing the image data URL and storage key
 */
export const extractLayerImageData = async (layer: any, layerName: string): Promise<{imageData: string, imageKey: string}> => {
  try {
    console.log(`Extracting image data for layer: ${layerName}`);
    
    // Get layer dimensions
    const exportData = layer.export();
    const { width, height } = exportData;
    
    let resultImageData = '';
    
    // Method 1: First try to use direct image.toPng() approach (most reliable)
    if (layer.image) {
      try {
        console.log("Using direct image.toPng() method");
        const pngData = layer.image.toPng();
        if (pngData) {
          console.log("Successfully extracted PNG with image.toPng()");
          // The result might be an object with src or a direct data URL
          resultImageData = pngData.src || pngData;
        }
      } catch (toPngError) {
        console.error("Error using direct image.toPng() method:", toPngError);
      }
    }
    
    // Method 2: Use canvas() function if available
    if (!resultImageData && typeof layer.canvas === 'function') {
      try {
        console.log("Using canvas() function method");
        const canvas = layer.canvas();
        resultImageData = canvas.toDataURL('image/png');
        console.log("Successfully created canvas for layer");
      } catch (canvasError) {
        console.error("Error using canvas method:", canvasError);
      }
    }
    
    // Method 3: Use toPng() function if available on the layer itself
    if (!resultImageData && layer.toPng && typeof layer.toPng === 'function') {
      try {
        console.log("Using layer.toPng() method");
        const pngData = layer.toPng();
        if (pngData) {
          console.log("Successfully extracted PNG with layer.toPng()");
          // Check if it's a string (data URL) or an object with src property
          if (typeof pngData === 'string') {
            resultImageData = pngData;
          } else if (pngData.src) {
            resultImageData = pngData.src;
          } else if (pngData instanceof Blob) {
            resultImageData = URL.createObjectURL(pngData);
          } else {
            const blob = new Blob([pngData], { type: 'image/png' });
            resultImageData = URL.createObjectURL(blob);
          }
        }
      } catch (pngError) {
        console.error("Error using toPng method:", pngError);
      }
    }
    
    // Method 4: Try to extract using saveAsPng if available
    if (!resultImageData && layer.saveAsPng && typeof layer.saveAsPng === 'function') {
      try {
        console.log("Using saveAsPng method");
        // This might return a Promise with the file path or the data directly
        const pngData = await layer.saveAsPng(`${layerName}.png`);
        if (pngData) {
          console.log("Successfully saved PNG with saveAsPng()", pngData);
          if (typeof pngData === 'string') {
            resultImageData = pngData;
          }
        }
      } catch (saveError) {
        console.error("Error using saveAsPng method:", saveError);
      }
    }
    
    // Method 5: Manual pixel extraction if available
    if (!resultImageData && layer.pixelData && Array.isArray(layer.pixelData)) {
      try {
        console.log("Using manual pixel extraction");
        const canvas = createTempCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const canvasImageData = ctx.createImageData(width, height);
          // Copy pixel data
          for (let i = 0; i < layer.pixelData.length && i < canvasImageData.data.length; i++) {
            canvasImageData.data[i] = layer.pixelData[i];
          }
          
          ctx.putImageData(canvasImageData, 0, 0);
          resultImageData = canvas.toDataURL('image/png');
          console.log("Successfully extracted image with pixel data");
        }
      } catch (pixelError) {
        console.error("Error during manual pixel extraction:", pixelError);
      }
    }
    
    // Method 6: Try to extract from layer.image property
    if (!resultImageData && layer.image) {
      try {
        console.log("Layer has image property");
        if (typeof layer.image === 'function') {
          const imageObj = layer.image();
          console.log("Image function result:", imageObj);
          
          // Try to convert the image object to data URL
          if (imageObj) {
            if (imageObj.toDataURL) {
              resultImageData = imageObj.toDataURL('image/png');
            } else if (imageObj.data && imageObj.width && imageObj.height) {
              // Create canvas and put image data
              const canvas = createTempCanvas(imageObj.width, imageObj.height);
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                const imgData = ctx.createImageData(imageObj.width, imageObj.height);
                // Copy pixel data
                for (let i = 0; i < imageObj.data.length && i < imgData.data.length; i++) {
                  imgData.data[i] = imageObj.data[i];
                }
                
                ctx.putImageData(imgData, 0, 0);
                resultImageData = canvas.toDataURL('image/png');
              }
            }
          }
        }
      } catch (imageError) {
        console.error("Error extracting from image property:", imageError);
      }
    }
    
    // Method 7: Create placeholder image if all other methods fail
    if (!resultImageData) {
      console.log("Using placeholder image as fallback");
      resultImageData = createPlaceholderImage(layerName, width, height);
    }
    
    // Store the image data
    const imageKey = saveImageToStorage(resultImageData, layerName);
    
    return { imageData: resultImageData, imageKey };
  } catch (error) {
    console.error(`Error extracting image data:`, error);
    // Create and return a placeholder image
    const placeholder = createPlaceholderImage(layerName, 200, 200);
    const imageKey = saveImageToStorage(placeholder, layerName);
    return { imageData: placeholder, imageKey };
  }
};

/**
 * Process all image layers in a PSD tree
 * @param node The current PSD tree node
 * @param onImageExtracted Callback function receiving the image data URL and node
 */
export const processImageLayers = async (node: any, onImageExtracted: (imageData: string, nodeName: string) => void) => {
  if (!node) return;
  
  try {
    // Process this node if it's an image layer
    if (node.isLayer && !node.isGroup()) {
      if (shouldBeImageLayer(node)) {
        console.log(`Processing image layer: ${node.name}`);
        
        // Try to use the direct toPng method from the example
        if (node.layer && node.layer.image && node.layer.image.toPng) {
          try {
            const png = node.layer.image.toPng();
            const imageData = png.src || png;
            console.log(`Successfully extracted image using toPng for ${node.name}`);
            onImageExtracted(imageData, node.name);
          } catch (pngError) {
            console.error(`Error using direct toPng for ${node.name}:`, pngError);
            
            // Fallback to our regular extraction method
            const { imageData } = await extractLayerImageData(node.layer, node.name);
            if (imageData) {
              onImageExtracted(imageData, node.name);
            }
          }
        } else {
          // Use regular extraction method
          const { imageData } = await extractLayerImageData(node.layer, node.name);
          if (imageData) {
            onImageExtracted(imageData, node.name);
          }
        }
      }
    }
  } catch (nodeError) {
    console.error(`Error processing node ${node?.name}:`, nodeError);
  }
  
  // Process children recursively
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      await processImageLayers(child, onImageExtracted);
    }
  }
};
