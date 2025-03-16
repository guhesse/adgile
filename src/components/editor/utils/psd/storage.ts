import { PSDFileData, PSDMetadata } from './types';

// Storage keys
const PSD_METADATA_KEY = 'psd_metadata';
const PSD_DATA_PREFIX = 'psd_data_';
const IMAGE_DATA_PREFIX = 'psd_image_';

/**
 * Save PSD data to local storage
 * @param psdData The PSD data to save
 * @returns The storage key used
 */
export const savePSDDataToStorage = (psdData: PSDFileData): string => {
  try {
    // Generate a unique storage key
    const timestamp = new Date().getTime();
    const storageKey = `${PSD_DATA_PREFIX}${timestamp}`;
    
    // Save the PSD data to local storage
    localStorage.setItem(storageKey, JSON.stringify(psdData));
    
    // Update metadata
    const metadata = getPSDMetadata();
    metadata.storageKeys.push(storageKey);
    metadata.lastUpdated = new Date().toISOString();
    
    // Save updated metadata
    localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
    
    return storageKey;
  } catch (error) {
    console.error('Error saving PSD data to storage:', error);
    throw error;
  }
};

/**
 * Get PSD metadata from local storage
 * @returns The PSD metadata
 */
export const getPSDMetadata = (): PSDMetadata => {
  try {
    // Get metadata from local storage
    const metadataString = localStorage.getItem(PSD_METADATA_KEY);
    
    // If metadata exists, parse and return it
    if (metadataString) {
      return JSON.parse(metadataString) as PSDMetadata;
    }
    
    // Otherwise, return default metadata
    return {
      storageKeys: [],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting PSD metadata from storage:', error);
    
    // Return default metadata on error
    return {
      storageKeys: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Get PSD data from local storage
 * @param storageKey The storage key
 * @returns The PSD data, or null if not found
 */
export const getPSDDataFromStorage = (storageKey: string): PSDFileData | null => {
  try {
    // Get PSD data from local storage
    const psdDataString = localStorage.getItem(storageKey);
    
    // If data exists, parse and return it
    if (psdDataString) {
      return JSON.parse(psdDataString) as PSDFileData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting PSD data from storage:', error);
    return null;
  }
};

/**
 * Save image data to local storage
 * @param imageData The image data (base64 string)
 * @param name Optional name for the image
 * @returns The storage key used
 */
export const saveImageToStorage = (imageData: string, name?: string): string => {
  try {
    // Generate a unique storage key
    const timestamp = new Date().getTime();
    const safeName = name ? name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'img';
    const storageKey = `${IMAGE_DATA_PREFIX}${safeName}_${timestamp}`;
    
    // Save the image data to local storage
    localStorage.setItem(storageKey, imageData);
    
    return storageKey;
  } catch (error) {
    console.error('Error saving image data to storage:', error);
    throw error;
  }
};

/**
 * Get image data from local storage
 * @param storageKey The storage key
 * @returns The image data, or null if not found
 */
export const getImageFromStorage = (storageKey: string): string | null => {
  try {
    // Get image data from local storage
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error('Error getting image data from storage:', error);
    return null;
  }
};

/**
 * Get all PSD storage keys
 * @returns Array of storage keys
 */
export const getPSDStorageKeys = (): string[] => {
  try {
    const metadata = getPSDMetadata();
    return metadata.storageKeys;
  } catch (error) {
    console.error('Error getting PSD storage keys:', error);
    return [];
  }
};

/**
 * Delete PSD data from local storage
 * @param storageKey The storage key
 */
export const deletePSDDataFromStorage = (storageKey: string): void => {
  try {
    // Remove the PSD data
    localStorage.removeItem(storageKey);
    
    // Update metadata
    const metadata = getPSDMetadata();
    metadata.storageKeys = metadata.storageKeys.filter(key => key !== storageKey);
    metadata.lastUpdated = new Date().toISOString();
    
    // Save updated metadata
    localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error deleting PSD data from storage:', error);
  }
};

/**
 * Clear all PSD data from local storage
 */
export const clearAllPSDDataFromStorage = (): void => {
  try {
    // Get metadata
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
  } catch (error) {
    console.error('Error clearing all PSD data from storage:', error);
  }
};
