
/**
 * Utility functions for storing and retrieving PSD data from localStorage
 */

import { PSDFileData, PSDMetadata } from "../../types/psd/types";

const PSD_DATA_PREFIX = 'adgile_psd_data_';
const PSD_IMAGE_PREFIX = 'adgile_psd_image_';
const PSD_METADATA_KEY = 'adgile_psd_metadata';

/**
 * Save PSD file data to localStorage
 * @param psdData The PSD file data to save
 * @returns The storage key where the data was saved
 */
export const savePSDDataToStorage = (psdData: PSDFileData): string => {
  try {
    const timestamp = Date.now();
    const storageKey = `${PSD_DATA_PREFIX}${psdData.fileName.replace(/\s+/g, '_').toLowerCase()}_${timestamp}`;
    
    // Save the PSD data
    const serializedData = JSON.stringify(psdData);
    localStorage.setItem(storageKey, serializedData);
    
    // Update metadata
    updatePSDMetadata(storageKey);
    
    return storageKey;
  } catch (error) {
    console.error('Error saving PSD data to localStorage:', error);
    
    // Try to save minimal data if quota exceeded
    try {
      const timestamp = Date.now();
      const storageKey = `${PSD_DATA_PREFIX}${psdData.fileName.replace(/\s+/g, '_').toLowerCase()}_${timestamp}`;
      
      // Create minimal PSD data
      const minimalPSDData = {
        fileName: psdData.fileName,
        width: psdData.width,
        height: psdData.height,
        uploadDate: psdData.uploadDate,
        storageKey: storageKey,
        backgroundColor: psdData.backgroundColor,
        layers: [] // Don't store layers
      };
      
      localStorage.setItem(storageKey, JSON.stringify(minimalPSDData));
      updatePSDMetadata(storageKey);
      
      return storageKey;
    } catch (error) {
      console.error('Erro ao salvar dados mínimos do PSD:', error);
      return '';
    }
  }
};

/**
 * Update PSD metadata with a new storage key
 * @param storageKey The storage key to add to metadata
 */
const updatePSDMetadata = (storageKey: string): void => {
  try {
    // Get existing metadata
    const metadataJson = localStorage.getItem(PSD_METADATA_KEY);
    let metadata: PSDMetadata;
    
    if (metadataJson) {
      metadata = JSON.parse(metadataJson);
    } else {
      metadata = {
        storageKeys: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Add new storage key (if it doesn't exist already)
    if (!metadata.storageKeys.includes(storageKey)) {
      metadata.storageKeys.push(storageKey);
      metadata.lastUpdated = new Date().toISOString();
      
      // Save updated metadata
      localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
    }
  } catch (error) {
    console.error('Error updating PSD metadata:', error);
  }
};

/**
 * Save image data to localStorage
 * @param imageName The name of the image
 * @param imageData The base64 encoded image data
 * @returns The storage key where the image was saved
 */
export const saveImageToStorage = (imageName: string, imageData: string): string => {
  try {
    const timestamp = Date.now();
    const storageKey = `${PSD_IMAGE_PREFIX}${imageName.replace(/\s+/g, '_').toLowerCase()}_${timestamp}`;
    
    // Save the image data
    localStorage.setItem(storageKey, imageData);
    
    return storageKey;
  } catch (error) {
    console.error('Error saving image to localStorage:', error);
    return '';
  }
};

/**
 * Get PSD file data from localStorage
 * @param storageKey The storage key where the PSD data is stored
 * @returns The PSD file data, or null if not found
 */
export const getPSDFileData = (storageKey: string): PSDFileData | null => {
  try {
    const serializedData = localStorage.getItem(storageKey);
    
    if (!serializedData) {
      return null;
    }
    
    return JSON.parse(serializedData) as PSDFileData;
  } catch (error) {
    console.error('Error retrieving PSD data from localStorage:', error);
    return null;
  }
};

/**
 * Get image data from localStorage
 * @param storageKey The storage key where the image is stored
 * @returns The base64 encoded image data, or null if not found
 */
export const getImageFromStorage = (storageKey: string): string | null => {
  try {
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error('Error retrieving image from localStorage:', error);
    return null;
  }
};

/**
 * Get all stored PSD file data
 * @returns Array of PSD file data
 */
export const getAllPSDFiles = (): PSDFileData[] => {
  try {
    const metadataJson = localStorage.getItem(PSD_METADATA_KEY);
    
    if (!metadataJson) {
      return [];
    }
    
    const metadata: PSDMetadata = JSON.parse(metadataJson);
    const psdFiles: PSDFileData[] = [];
    
    for (const storageKey of metadata.storageKeys) {
      const psdData = getPSDFileData(storageKey);
      
      if (psdData) {
        psdFiles.push(psdData);
      }
    }
    
    return psdFiles;
  } catch (error) {
    console.error('Error retrieving all PSD files:', error);
    return [];
  }
};
