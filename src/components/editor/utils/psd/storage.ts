
import { PSDFileData } from "./types";

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

// Save PSD data to storage
export const savePSDDataToStorage = (key: string, data: PSDFileData): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    
    // Update metadata list
    const metadataList = getPSDMetadata();
    if (!metadataList.includes(key)) {
      metadataList.push(key);
      savePSDMetadata(metadataList);
    }
  } catch (error) {
    console.error('Error saving PSD data to storage:', error);
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
