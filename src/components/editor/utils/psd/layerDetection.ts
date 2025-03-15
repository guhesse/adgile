
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
    
    // Check 1: Direct type identification
    if (layer.type === 'type' || layer.type === 'text' || layer.type === 'TextLayer') {
      console.log(`Layer "${layer.name}" is text by type property: ${layer.type}`);
      return true;
    }
    
    // Check 2: Text patterns in layer name
    const textPatterns = /heading|h1|h2|h3|h4|h5|h6|paragraph|text|body|title|subtitle|button|label|caption/i;
    if (layer.name && textPatterns.test(layer.name)) {
      console.log(`Layer "${layer.name}" is text by name pattern`);
      return true;
    }
    
    // Check 3: Layer kind (3 is text in PSD spec)
    if (layer.info && layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layerKind: 3`);
      return true;
    }
    
    if (layer.layer && layer.layer.info && layer.layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layer.info.layerKind: 3`);
      return true;
    }
    
    // Check 4: Export data
    if (layer.export && typeof layer.export === 'function') {
      try {
        const exportData = layer.export();
        
        if (exportData && (exportData.type === 'type' || exportData.type === 'text')) {
          console.log(`Layer "${layer.name}" is text by export().type: ${exportData.type}`);
          return true;
        }
        
        if (exportData && exportData.layerKind === 3) {
          console.log(`Layer "${layer.name}" is text by export().layerKind: 3`);
          return true;
        }
        
        // Check for text content in export data
        if (exportData && exportData.text) {
          console.log(`Layer "${layer.name}" is text - has text in export data`);
          return true;
        }
      } catch (err) {
        console.log(`Error exporting layer "${layer.name}":`, err);
      }
    }
    
    // Check 5: Text function or property
    if (layer.text) {
      console.log(`Layer "${layer.name}" has text property`);
      return true;
    }
    
    // Check 6: typeTool presence
    if (layer.get && typeof layer.get === 'function') {
      try {
        const typeTool = layer.get('typeTool');
        if (typeTool) {
          console.log(`Layer "${layer.name}" is text - has typeTool property`);
          return true;
        }
      } catch (err) {
        console.log(`Error getting typeTool from "${layer.name}":`, err);
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
    
    return true;
  } catch (error) {
    console.error(`Error checking if layer is image:`, error);
    return false;
  }
};
