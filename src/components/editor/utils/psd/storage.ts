
import { PSDFileData, PSDMetadata } from "./types";

// Get PSD metadata from storage
export const getPSDMetadata = (): string[] => {
  try {
    const keys = localStorage.getItem('psd_metadata');
    return keys ? JSON.parse(keys) : [];
  } catch (error) {
    console.error('Error reading PSD metadata from storage:', error);
    return [];
  }
};

// Save PSD metadata to storage
export const savePSDMetadata = (storageKeys: string[]): void => {
  try {
    localStorage.setItem('psd_metadata', JSON.stringify(storageKeys));
  } catch (error) {
    console.error('Error saving PSD metadata to storage:', error);
  }
};

// For backward compatibility
export const getPSDStorageKeys = getPSDMetadata;

// Save PSD data to storage
export const savePSDDataToStorage = (key: string, data: PSDFileData): string => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    
    // Update metadata list
    const metadataList = getPSDMetadata();
    if (!metadataList.includes(key)) {
      metadataList.push(key);
      savePSDMetadata(metadataList);
    }
    return key;
  } catch (error) {
    console.error('Error saving PSD data to storage:', error);
    return key;
  }
};

// Get PSD data from storage
export const getPSDDataFromStorage = (key: string): PSDFileData | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading PSD data from storage:', error);
    return null;
  }
};

// Remove PSD data from storage
export const removePSDData = (key: string): void => {
  try {
    localStorage.removeItem(key);
    
    // Update metadata list
    const metadataList = getPSDMetadata();
    savePSDMetadata(metadataList.filter(k => k !== key));
  } catch (error) {
    console.error('Error removing PSD data from storage:', error);
  }
};

// For backward compatibility
export const removePSDDataFromStorage = removePSDData;

// Save image data to storage and return a key
export const saveImageToStorage = (imageData: string, name: string): string => {
  try {
    const key = `img_${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    localStorage.setItem(key, imageData);
    
    // Update an image index if needed
    const imageIndex = localStorage.getItem('image_index');
    const index = imageIndex ? JSON.parse(imageIndex) : [];
    if (!index.includes(key)) {
      index.push(key);
      localStorage.setItem('image_index', JSON.stringify(index));
    }
    
    return key;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    return '';
  }
};

// Get image data from storage
export const getImageFromStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting image from storage:', error);
    return null;
  }
};
