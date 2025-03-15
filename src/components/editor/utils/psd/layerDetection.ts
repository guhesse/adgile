
// Layer type detection utility functions

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
 * Extract image data from a PSD layer 
 * @param layer The PSD layer
 * @param layerName Name to use for the extracted image
 * @returns Promise resolving to a data URL of the image
 */
export const extractLayerImageData = async (layer: any, layerName: string): Promise<string | null> => {
  try {
    console.log(`Extracting image data for layer: ${layerName}`);
    
    // Method 1: Use canvas() function if available
    if (typeof layer.canvas === 'function') {
      const canvas = layer.canvas();
      console.log("Successfully created canvas for layer");
      return canvas.toDataURL('image/png');
    } 
    
    // Method 2: Use toPng() function if available
    if (layer.toPng && typeof layer.toPng === 'function') {
      console.log("Trying toPng method");
      const pngData = layer.toPng();
      if (pngData) {
        const blob = new Blob([pngData], { type: 'image/png' });
        return URL.createObjectURL(blob);
      }
    }
    
    // Method 3: Try image property if available
    if (layer.image) {
      console.log("Layer has image property");
      if (typeof layer.image === 'function') {
        const imageData = layer.image();
        if (imageData) {
          const blob = new Blob([imageData], { type: 'image/png' });
          return URL.createObjectURL(blob);
        }
      }
    }
    
    console.log("Could not extract image data from layer");
    return null;
  } catch (error) {
    console.error(`Error extracting image data:`, error);
    return null;
  }
};

/**
 * Process all image layers in a PSD tree
 * @param node The current PSD tree node
 * @param onImageExtracted Callback function receiving the image data URL and node
 */
export const processImageLayers = (node: any, onImageExtracted: (imageData: string, nodeName: string) => void) => {
  if (!node) return;
  
  // Process this node if it's an image layer
  if (node.type === 'layer' && shouldBeImageLayer(node.layer)) {
    extractLayerImageData(node.layer, node.name).then(imageData => {
      if (imageData) {
        onImageExtracted(imageData, node.name);
      }
    });
  }
  
  // Process children recursively
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      processImageLayers(child, onImageExtracted);
    });
  }
};
