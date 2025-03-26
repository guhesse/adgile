
import { PSDFileData, LayerData, PSDMetadata } from './types';

// Storage key for PSD metadata
const PSD_METADATA_KEY = 'psd_metadata';

/**
 * Saves PSD data to local storage
 */
export const savePSDData = (psdData: PSDFileData): string => {
  const key = `psd_${Date.now()}`;
  
  // Process and optimize layer data for storage
  const optimizedLayers = psdData.layers.map(layer => {
    // For image layers, store image data separately
    if (layer.type === 'image' && layer.imageData) {
      const imageKey = `img_${layer.id}_${Date.now()}`;
      localStorage.setItem(imageKey, layer.imageData);
      
      return {
        ...layer,
        imageData: null, // Clear the image data from the layer object
        imageKey // Store reference to the image data
      };
    }
    return layer;
  });
  
  // Store the optimized PSD data
  localStorage.setItem(key, JSON.stringify({
    ...psdData,
    layers: optimizedLayers
  }));
  
  // Update metadata
  savePSDMetadata(key);
  
  return key;
};

/**
 * Saves PSD metadata to local storage
 */
export const savePSDMetadata = (newKey: string): void => {
  // Get existing metadata
  const metadata = getPSDMetadata();
  
  // Add new key if it doesn't exist
  if (!metadata.storageKeys.includes(newKey)) {
    metadata.storageKeys.push(newKey);
  }
  
  // Update timestamp
  metadata.lastUpdated = new Date().toISOString();
  
  // Save updated metadata
  localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
};

/**
 * Gets PSD metadata from local storage
 */
export const getPSDMetadata = (): PSDMetadata => {
  const storedMetadata = localStorage.getItem(PSD_METADATA_KEY);
  
  if (!storedMetadata) {
    // Return default metadata if none exists
    return {
      storageKeys: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  return JSON.parse(storedMetadata);
};

/**
 * Gets PSD data from local storage
 */
export const getPSDData = (key: string): PSDFileData | null => {
  const storedData = localStorage.getItem(key);
  
  if (!storedData) {
    return null;
  }
  
  const psdData = JSON.parse(storedData) as PSDFileData;
  
  // Restore image data for image layers
  const layersWithImages = psdData.layers.map(layer => {
    if (layer.type === 'image' && (layer as any).imageKey) {
      const imageKey = (layer as any).imageKey;
      const imageData = localStorage.getItem(imageKey);
      
      return {
        ...layer,
        imageData: imageData || null
      };
    }
    return layer;
  });
  
  return {
    ...psdData,
    layers: layersWithImages
  };
};

/**
 * Removes PSD data from local storage
 */
export const removePSDData = (key: string): void => {
  // Remove the PSD data
  localStorage.removeItem(key);
  
  // Update metadata
  const metadata = getPSDMetadata();
  metadata.storageKeys = metadata.storageKeys.filter(k => k !== key);
  metadata.lastUpdated = new Date().toISOString();
  
  localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
};

/**
 * Clears all PSD data from local storage
 */
export const clearAllPSDData = (): void => {
  const metadata = getPSDMetadata();
  
  // Remove all PSD data
  metadata.storageKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Reset metadata
  localStorage.setItem(PSD_METADATA_KEY, JSON.stringify({
    storageKeys: [],
    lastUpdated: new Date().toISOString()
  }));
};
