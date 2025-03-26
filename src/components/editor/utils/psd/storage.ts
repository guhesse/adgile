
import { PSDFileData, PSDMetadata, LayerData } from './types';

/**
 * Save PSD file data to localStorage
 * @param fileName Original file name
 * @param psdData PSD data to store
 * @returns Storage key used for the data
 */
export const savePSDDataToStorage = (fileName: string, psdData: PSDFileData): string => {
  // Generate a storage key using the file name and a timestamp
  const storageKey = `psd_${fileName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
  
  // Simplify large data before storing
  const simplifiedData: PSDFileData = {
    ...psdData,
    fileName,
    storageKey,
    uploadDate: new Date().toISOString(),
    // Compress layer data to reduce storage size
    layers: psdData.layers.map(layer => {
      // For image layers, remove the image data to save space
      if (layer.type === 'image' && 'imageData' in layer) {
        // Store image data separately
        const imageKey = `img_${layer.id}`;
        localStorage.setItem(imageKey, layer.imageData as string);
        
        // Return layer without image data
        return {
          ...layer,
          imageData: imageKey // Store reference to image key instead
        };
      }
      return layer;
    })
  };
  
  try {
    // Store the PSD data
    localStorage.setItem(storageKey, JSON.stringify(simplifiedData));
    
    // Update metadata
    updatePSDMetadata(storageKey);
    
    return storageKey;
  } catch (error) {
    console.error("Error saving PSD data to localStorage:", error);
    throw new Error("Failed to save PSD data to storage");
  }
};

/**
 * Update PSD metadata in localStorage
 * @param storageKey Key of a newly added PSD
 */
const updatePSDMetadata = (newStorageKey: string): void => {
  try {
    // Get existing metadata or create new
    const metadataKey = 'psd_metadata';
    const existingMetadataJson = localStorage.getItem(metadataKey);
    
    let metadata: PSDMetadata;
    if (existingMetadataJson) {
      metadata = JSON.parse(existingMetadataJson);
      
      // Add new key if not already in the list
      if (!metadata.storageKeys.includes(newStorageKey)) {
        metadata.storageKeys.push(newStorageKey);
      }
    } else {
      metadata = {
        storageKeys: [newStorageKey],
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Update last updated timestamp
    metadata.lastUpdated = new Date().toISOString();
    
    // Save updated metadata
    localStorage.setItem(metadataKey, JSON.stringify(metadata));
  } catch (error) {
    console.error("Error updating PSD metadata:", error);
  }
};

/**
 * Get all PSD storage keys from metadata
 * @returns Array of PSD storage keys
 */
export const getPSDMetadata = (): string[] => {
  try {
    const metadataKey = 'psd_metadata';
    const metadataJson = localStorage.getItem(metadataKey);
    
    if (metadataJson) {
      const metadata: PSDMetadata = JSON.parse(metadataJson);
      return metadata.storageKeys;
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching PSD metadata:", error);
    return [];
  }
};

/**
 * Get PSD data from localStorage
 * @param storageKey The key used to store the PSD data
 * @returns PSD file data or null if not found
 */
export const getPSDDataFromStorage = (storageKey: string): PSDFileData | null => {
  try {
    const dataJson = localStorage.getItem(storageKey);
    
    if (!dataJson) {
      return null;
    }
    
    const data: PSDFileData = JSON.parse(dataJson);
    
    // Restore image data for image layers
    data.layers = data.layers.map(layer => {
      if (layer.type === 'image' && layer.imageData && layer.imageData.startsWith('img_')) {
        const imageKey = layer.imageData;
        const imageData = localStorage.getItem(imageKey);
        
        if (imageData) {
          return {
            ...layer,
            imageData
          };
        }
      }
      return layer;
    });
    
    return data;
  } catch (error) {
    console.error("Error fetching PSD data from localStorage:", error);
    return null;
  }
};

/**
 * Save an image to localStorage
 * @param imageData Base64 image data
 * @param name Optional name for reference
 * @returns Storage key for the image
 */
export const saveImageToStorage = (imageData: string, name: string = 'image'): string => {
  // Generate a key for the image
  const key = `img_${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
  
  try {
    // Store the image data
    localStorage.setItem(key, imageData);
    return key;
  } catch (error) {
    console.error("Error saving image to storage:", error);
    throw new Error("Failed to save image to storage");
  }
};

/**
 * Get an image from localStorage
 * @param key Storage key for the image
 * @returns Base64 image data or null if not found
 */
export const getImageFromStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const removePSDData = (storageKey: string): boolean => {
  try {
    // Remove PSD data
    localStorage.removeItem(storageKey);
    
    // Update metadata
    const metadataKey = 'psd_metadata';
    const metadataJson = localStorage.getItem(metadataKey);
    
    if (metadataJson) {
      const metadata: PSDMetadata = JSON.parse(metadataJson);
      metadata.storageKeys = metadata.storageKeys.filter(key => key !== storageKey);
      metadata.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(metadataKey, JSON.stringify(metadata));
    }
    
    return true;
  } catch (error) {
    console.error("Error removing PSD data:", error);
    return false;
  }
};

export const savePSDMetadata = (metadata: PSDMetadata): boolean => {
  try {
    const metadataKey = 'psd_metadata';
    localStorage.setItem(metadataKey, JSON.stringify({
      ...metadata,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error("Error saving PSD metadata:", error);
    return false;
  }
};
