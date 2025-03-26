
import { PSDFileData, PSDMetadata, LayerData } from './types';

// Store PSD data in localStorage
export const savePSDDataToStorage = (fileName: string, data: PSDFileData): string => {
  const storageKey = `psd_${Date.now()}_${fileName.replace(/[^a-z0-9]/gi, '_')}`;
  
  try {
    // Store the PSD data
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    // Update the metadata
    const metadata = getPSDMetadata();
    metadata.storageKeys.push(storageKey);
    metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem('psd_metadata', JSON.stringify(metadata));
    
    return storageKey;
  } catch (error) {
    console.error('Error saving PSD data to storage:', error);
    return '';
  }
};

// Get metadata about stored PSD files
export const getPSDMetadata = (): PSDMetadata => {
  try {
    const metadata = localStorage.getItem('psd_metadata');
    if (metadata) {
      const parsed = JSON.parse(metadata) as PSDMetadata;
      // Add length property to support array-like behavior
      parsed.length = parsed.storageKeys.length;
      return parsed;
    }
  } catch (error) {
    console.error('Error retrieving PSD metadata:', error);
  }
  
  // Return empty metadata if none exists
  return { 
    storageKeys: [], 
    lastUpdated: new Date().toISOString(),
    length: 0
  };
};

// Load PSD data from localStorage
export const loadPSDDataFromStorage = (storageKey: string): PSDFileData | null => {
  try {
    const data = localStorage.getItem(storageKey);
    if (data) {
      return JSON.parse(data) as PSDFileData;
    }
  } catch (error) {
    console.error('Error loading PSD data from storage:', error);
  }
  
  return null;
};

// Save image data to storage
export const saveImageToStorage = (imageData: string, layerName: string): string => {
  const storageKey = `img_${Date.now()}_${layerName.replace(/[^a-z0-9]/gi, '_')}`;
  
  try {
    localStorage.setItem(storageKey, imageData);
    return storageKey;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    return '';
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

// Clear PSD data from storage
export const removePSDData = (storageKey: string): boolean => {
  try {
    // Remove the PSD data
    localStorage.removeItem(storageKey);
    
    // Update the metadata
    const metadata = getPSDMetadata();
    metadata.storageKeys = metadata.storageKeys.filter(key => key !== storageKey);
    metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem('psd_metadata', JSON.stringify(metadata));
    
    return true;
  } catch (error) {
    console.error('Error removing PSD data from storage:', error);
    return false;
  }
};

// For layers with images, clean up their image data to avoid duplication
export const preprocessLayersForStorage = (layers: LayerData[]): LayerData[] => {
  return layers.map(layer => {
    if (layer.type === 'image' && layer.imageData) {
      // Store the image data separately
      const imageKey = saveImageToStorage(layer.imageData, layer.name);
      
      // Return layer without the imageData property
      const { imageData, ...layerWithoutImage } = layer;
      return {
        ...layerWithoutImage,
        src: imageKey
      };
    }
    return layer;
  });
};
