
import { PSDFileData, PSDMetadata } from './types';

const PSD_STORAGE_PREFIX = 'psd-import-';
const PSD_IMAGE_PREFIX = 'psd-image-';

/**
 * Save PSD data to localStorage
 * @param psdData The PSD data to save
 * @returns The key under which the data was saved
 */
export const savePSDDataToStorage = (psdData: PSDFileData): string => {
  try {
    const timestamp = Date.now();
    const storageKey = `${PSD_STORAGE_PREFIX}${timestamp}`;
    
    // Update the PSD data with storage information
    psdData.uploadDate = new Date(timestamp).toISOString();
    psdData.storageKey = storageKey;
    
    // Store the PSD data
    localStorage.setItem(storageKey, JSON.stringify(psdData));
    console.log("PSD data saved to localStorage under key:", storageKey);
    
    // Also update the PSD index for quick retrieval
    updatePSDIndex(psdData, storageKey);
    
    return storageKey;
  } catch (storageError) {
    console.error("Error saving PSD data to localStorage:", storageError);
    return '';
  }
};

/**
 * Update the PSD index with metadata for quick listing
 * @param psdData The PSD data 
 * @param storageKey The storage key
 */
const updatePSDIndex = (psdData: PSDFileData, storageKey: string): void => {
  try {
    // Get existing index
    const indexKey = 'psd-index';
    const existingIndex = localStorage.getItem(indexKey);
    const index: PSDMetadata[] = existingIndex ? JSON.parse(existingIndex) : [];
    
    // Add new entry
    index.push({
      key: storageKey,
      fileName: psdData.fileName,
      uploadDate: psdData.uploadDate,
      width: psdData.width,
      height: psdData.height
    });
    
    // Save updated index
    localStorage.setItem(indexKey, JSON.stringify(index));
    console.log("PSD index updated with new entry");
  } catch (error) {
    console.error("Error updating PSD index:", error);
  }
};

/**
 * Save an image extracted from a PSD to localStorage
 * @param imageData The image data URL
 * @param layerName The name of the layer for reference
 * @returns The key under which the image was saved
 */
export const saveImageToStorage = (imageData: string, layerName: string): string => {
  try {
    const imageKey = `${PSD_IMAGE_PREFIX}${Date.now()}-${layerName.replace(/\s+/g, '-').toLowerCase()}`;
    localStorage.setItem(imageKey, imageData);
    console.log(`Image saved to localStorage: ${imageKey}`);
    return imageKey;
  } catch (error) {
    console.error("Error saving image to localStorage:", error);
    return '';
  }
};

/**
 * Get list of all stored PSD data keys
 * @returns Array of storage keys for PSD data
 */
export const getPSDStorageKeys = (): string[] => {
  return Object.keys(localStorage).filter(key => key.startsWith(PSD_STORAGE_PREFIX));
};

/**
 * Get PSD metadata from index
 * @returns Array of PSD metadata
 */
export const getPSDMetadataList = (): PSDMetadata[] => {
  try {
    const indexKey = 'psd-index';
    const indexData = localStorage.getItem(indexKey);
    if (!indexData) return [];
    return JSON.parse(indexData) as PSDMetadata[];
  } catch (error) {
    console.error("Error retrieving PSD index:", error);
    return [];
  }
};

/**
 * Get PSD data from localStorage by key
 * @param key The storage key
 * @returns The PSD data, or null if not found
 */
export const getPSDDataFromStorage = (key: string): PSDFileData | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as PSDFileData;
  } catch (error) {
    console.error("Error retrieving PSD data from localStorage:", error);
    return null;
  }
};

/**
 * Get image data from localStorage
 * @param imageKey The image storage key
 * @returns The image data URL, or null if not found
 */
export const getImageFromStorage = (imageKey: string): string | null => {
  try {
    return localStorage.getItem(imageKey);
  } catch (error) {
    console.error("Error retrieving image from localStorage:", error);
    return null;
  }
};

/**
 * Remove PSD data from localStorage by key
 * @param key The storage key to remove
 */
export const removePSDDataFromStorage = (key: string): void => {
  try {
    // Get the PSD data to find associated images
    const psdData = getPSDDataFromStorage(key);
    if (psdData) {
      // Remove any associated images
      psdData.layers.forEach(layer => {
        if (layer.imageKey) {
          localStorage.removeItem(layer.imageKey);
          console.log(`Removed associated image: ${layer.imageKey}`);
        }
      });
    }
    
    // Remove the PSD data itself
    localStorage.removeItem(key);
    console.log("Removed PSD data with key:", key);
    
    // Update the index
    updatePSDIndexAfterRemoval(key);
  } catch (error) {
    console.error("Error removing PSD data from localStorage:", error);
  }
};

/**
 * Update the PSD index after removal
 * @param removedKey The key that was removed
 */
const updatePSDIndexAfterRemoval = (removedKey: string): void => {
  try {
    const indexKey = 'psd-index';
    const existingIndex = localStorage.getItem(indexKey);
    if (!existingIndex) return;
    
    const index: PSDMetadata[] = JSON.parse(existingIndex);
    const updatedIndex = index.filter(item => item.key !== removedKey);
    
    localStorage.setItem(indexKey, JSON.stringify(updatedIndex));
    console.log("PSD index updated after removal");
  } catch (error) {
    console.error("Error updating PSD index after removal:", error);
  }
};
