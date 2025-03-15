
// Layer type detection utility functions
import { saveImageToStorage } from './storage';
import pako from 'pako';

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
    const canvas = createTempCanvas(Math.max(width, 100), Math.max(height, 100));
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Fill background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(layerName, canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating placeholder image:', error);
    return '';
  }
};

/**
 * Gets image data from image resource blocks
 * @param layer The PSD layer
 * @returns Image data in base64 format or null
 */
const getImageFromResources = (layer: any): string | null => {
  try {
    if (!layer || !layer.resources) return null;
    
    console.log("Checking layer resources for image data");
    
    // Look for image resource blocks
    for (const resourceId in layer.resources) {
      const resource = layer.resources[resourceId];
      
      // Process image data if found
      if (resource && resource.data && (resource.type === 'imageData' || resource.id === 1061)) {
        console.log("Found image resource block");
        
        // Convert to base64
        const base64Data = arrayBufferToBase64(resource.data);
        if (base64Data) {
          return `data:image/png;base64,${base64Data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting image from resources:", error);
    return null;
  }
};

/**
 * Get image from layer pixels
 * @param layer The PSD layer
 * @returns Image data as base64 URL or null
 */
const getImageFromPixels = (layer: any): string | null => {
  try {
    if (!layer || !layer.imageData || !layer.width || !layer.height) return null;
    
    console.log("Using layer.imageData for extraction");
    
    const { imageData, width, height } = layer;
    const canvas = createTempCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Create image data from pixels
    const imgData = ctx.createImageData(width, height);
    
    // Copy pixel data
    for (let i = 0; i < imageData.length && i < imgData.data.length; i++) {
      imgData.data[i] = imageData[i];
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error extracting from pixels:", error);
    return null;
  }
};

/**
 * Get image from layer channel data
 * @param layer The PSD layer
 * @returns Image data as base64 URL or null
 */
const getImageFromChannels = (layer: any): string | null => {
  try {
    if (!layer || !layer.channels || !layer.width || !layer.height) return null;
    
    console.log("Trying to extract image from channel data");
    
    const { width, height, channels } = layer;
    const canvas = createTempCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Create image data
    const imgData = ctx.createImageData(width, height);
    const redChannel = channels[0]?.channelData;
    const greenChannel = channels[1]?.channelData;
    const blueChannel = channels[2]?.channelData;
    const alphaChannel = channels[3]?.channelData;
    
    if (!redChannel || !greenChannel || !blueChannel) {
      console.log("Missing RGB channels for image data");
      return null;
    }
    
    // Combine channels into RGBA
    for (let i = 0; i < width * height; i++) {
      imgData.data[i * 4] = redChannel[i] || 0;         // R
      imgData.data[i * 4 + 1] = greenChannel[i] || 0;   // G
      imgData.data[i * 4 + 2] = blueChannel[i] || 0;    // B
      imgData.data[i * 4 + 3] = alphaChannel ? alphaChannel[i] : 255; // A
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error extracting from channel data:", error);
    return null;
  }
};

/**
 * Try to extract image using direct PSD methods
 * @param layer The PSD layer
 * @returns Image data as base64 URL or null
 */
const getImageFromPSDMethods = (layer: any): string | null => {
  try {
    if (!layer) return null;
    
    // Try using psd.js toCanvas() method
    if (typeof layer.toCanvas === 'function') {
      console.log("Using layer.toCanvas() method");
      const canvas = layer.toCanvas();
      if (canvas && canvas.toDataURL) {
        return canvas.toDataURL('image/png');
      }
    }
    
    // Try using layer.toPng() method
    if (typeof layer.toPng === 'function') {
      console.log("Using layer.toPng() method");
      const pngData = layer.toPng();
      if (pngData) {
        // Convert PNG binary data to base64
        const base64Data = arrayBufferToBase64(pngData);
        if (base64Data) {
          return `data:image/png;base64,${base64Data}`;
        }
      }
    }
    
    // Try using layer.saveAsPng() method if available
    if (typeof layer.saveAsPng === 'function') {
      console.log("Using layer.saveAsPng() method");
      const result = layer.saveAsPng();
      if (result && result.url) {
        return result.url;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error using PSD methods:", error);
    return null;
  }
};

/**
 * Convert array buffer to base64 string
 * @param buffer The array buffer to convert
 * @returns Base64 string
 */
const arrayBufferToBase64 = (buffer: Uint8Array | ArrayBuffer): string => {
  try {
    // Ensure we have a Uint8Array
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    
    // Convert to base64
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.error("Error converting to base64:", error);
    return '';
  }
};

/**
 * Extract image data from a PSD layer using multiple methods
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
    
    // Try multiple approaches to extract image data
    // Method 1: Get image from PSD image resource blocks
    resultImageData = getImageFromResources(layer) || resultImageData;
    
    // Method 2: Get image from direct PSD methods
    if (!resultImageData) {
      resultImageData = getImageFromPSDMethods(layer) || resultImageData;
    }
    
    // Method 3: Try to get image from canvas() method if available
    if (!resultImageData && typeof layer.canvas === 'function') {
      try {
        const canvas = layer.canvas();
        console.log("Successfully created canvas for layer");
        resultImageData = canvas.toDataURL('image/png');
      } catch (canvasError) {
        console.error("Error using canvas method:", canvasError);
      }
    }
    
    // Method 4: Try to get pixel data from layer
    if (!resultImageData) {
      resultImageData = getImageFromPixels(layer) || resultImageData;
    }
    
    // Method 5: Try to construct image from channel data
    if (!resultImageData) {
      resultImageData = getImageFromChannels(layer) || resultImageData;
    }
    
    // Method 6: Manual pixel extraction if available
    if (!resultImageData && layer.pixelData && Array.isArray(layer.pixelData)) {
      try {
        console.log("Trying manual pixel extraction");
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
        }
      } catch (pixelError) {
        console.error("Error during manual pixel extraction:", pixelError);
      }
    }
    
    // Method 7: Try to extract from layer.image property
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
    
    // Method 8: If we have layer.rawImage or layer.imageRaw, try to use it
    if (!resultImageData && (layer.rawImage || layer.imageRaw)) {
      try {
        console.log("Trying to extract from rawImage data");
        const imageData = layer.rawImage || layer.imageRaw;
        if (imageData && imageData.length > 0) {
          const canvas = createTempCanvas(width, height);
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            const imgData = ctx.createImageData(width, height);
            
            // Assume RGBA format
            for (let i = 0; i < imageData.length && i < imgData.data.length; i++) {
              imgData.data[i] = imageData[i];
            }
            
            ctx.putImageData(imgData, 0, 0);
            resultImageData = canvas.toDataURL('image/png');
          }
        }
      } catch (rawImageError) {
        console.error("Error extracting from raw image data:", rawImageError);
      }
    }
    
    // Method 9: Create placeholder image if all other methods fail
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
  
  // Process this node if it's an image layer
  if (node.type === 'layer' && shouldBeImageLayer(node.layer)) {
    const { imageData } = await extractLayerImageData(node.layer, node.name);
    if (imageData) {
      onImageExtracted(imageData, node.name);
    }
  }
  
  // Process children recursively
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      await processImageLayers(child, onImageExtracted);
    }
  }
};
