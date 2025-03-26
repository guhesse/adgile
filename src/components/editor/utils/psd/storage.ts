
import { PSDFileData, PSDMetadata } from "./types";

// Storage keys
const PSD_DATA_KEY = 'psd_data';
const PSD_METADATA_KEY = 'psd_metadata';
const PSD_IMAGES_KEY_PREFIX = 'psd_image_';

// Save PSD data to storage
export const savePSDDataToStorage = async (psdData: PSDFileData): Promise<void> => {
  try {
    // Store PSD data
    localStorage.setItem(PSD_DATA_KEY, JSON.stringify(psdData));
    
    // Update metadata
    const metadata = getPSDMetadata();
    const newMetadata: PSDMetadata = {
      storageKeys: metadata ? metadata.storageKeys : [],
      lastUpdated: new Date().toISOString(),
      length: psdData.layers.length
    };
    
    // Add the main data key if it's not already there
    if (!newMetadata.storageKeys.includes(PSD_DATA_KEY)) {
      newMetadata.storageKeys.push(PSD_DATA_KEY);
    }
    
    // Update metadata
    localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(newMetadata));
  } catch (error) {
    console.error('Error saving PSD data to storage:', error);
    throw new Error('Failed to save PSD data to storage');
  }
};

// Get PSD data from storage
export const getPSDDataFromStorage = (): PSDFileData | null => {
  try {
    const storedData = localStorage.getItem(PSD_DATA_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Error retrieving PSD data from storage:', error);
    return null;
  }
};

// Get PSD metadata
export const getPSDMetadata = (): PSDMetadata | null => {
  try {
    const storedMetadata = localStorage.getItem(PSD_METADATA_KEY);
    return storedMetadata ? JSON.parse(storedMetadata) : null;
  } catch (error) {
    console.error('Error retrieving PSD metadata from storage:', error);
    return null;
  }
};

// Save image data to storage
export const saveImageToStorage = async (imageId: string, imageData: string): Promise<string> => {
  try {
    const storageKey = `${PSD_IMAGES_KEY_PREFIX}${imageId}`;
    localStorage.setItem(storageKey, imageData);
    
    // Update metadata to include this key
    const metadata = getPSDMetadata();
    if (metadata) {
      if (!metadata.storageKeys.includes(storageKey)) {
        metadata.storageKeys.push(storageKey);
        localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
      }
    }
    
    return storageKey;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    throw new Error('Failed to save image to storage');
  }
};

// Get image data from storage
export const getImageFromStorage = (storageKey: string): string | null => {
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error('Error retrieving image from storage:', error);
    return null;
  }
};

// Clear all PSD-related data from storage
export const clearPSDStorage = (): void => {
  try {
    const metadata = getPSDMetadata();
    if (metadata && metadata.storageKeys) {
      // Remove all stored keys
      metadata.storageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    }
    
    // Clear metadata itself
    localStorage.removeItem(PSD_METADATA_KEY);
  } catch (error) {
    console.error('Error clearing PSD storage:', error);
  }
};
