
import { PSDFileData, LayerData } from './types';

// Storage keys
const PSD_DATA_PREFIX = 'adgile_psd_data_';
const PSD_METADATA_KEY = 'adgile_psd_metadata';

// Save a generated image to localStorage storage
export const saveImageToStorage = (imageData: string, name: string): string => {
  try {
    const key = `adgile_image_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
    localStorage.setItem(key, imageData);
    return key;
  } catch (error) {
    console.error('Error saving image to storage:', error);
    return '';
  }
};

// Save PSD file data to localStorage
export const savePSDDataToStorage = (fileName: string, psdData: PSDFileData): string => {
  try {
    // Create a copy of the data without large image data
    const minimalPSDData: PSDFileData = {
      ...psdData,
      layers: psdData.layers.map(layer => {
        if (layer.type === 'image' && layer.imageData) {
          // Store image key reference instead of full data
          const minimalLayer = { ...layer };
          // Delete the imageData property if it exists
          delete minimalLayer.imageData;
          return minimalLayer;
        }
        return layer;
      })
    };

    const key = `${PSD_DATA_PREFIX}${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
    
    try {
      localStorage.setItem(key, JSON.stringify(minimalPSDData));
      
      // Update metadata
      updatePSDMetadata(key, fileName);
      
      return key;
    } catch (storageError) {
      console.error('Error saving PSD data to localStorage:', storageError);
      
      // Try with even more minimal data if quota exceeded
      try {
        const superMinimalPSDData = {
          fileName: psdData.fileName,
          width: psdData.width,
          height: psdData.height,
          uploadDate: psdData.uploadDate,
          layerCount: psdData.layers.length
        };
        
        localStorage.setItem(key, JSON.stringify(superMinimalPSDData));
        console.error('Erro de cota do localStorage excedida, salvando apenas metadados mínimos');
        return key;
      } catch (minimalError) {
        console.error('Erro ao salvar dados mínimos do PSD:', minimalError);
        return '';
      }
    }
  } catch (error) {
    console.error('Error preparing PSD data for storage:', error);
    return '';
  }
};

// Update PSD metadata registry
const updatePSDMetadata = (key: string, fileName: string) => {
  try {
    const metadataStr = localStorage.getItem(PSD_METADATA_KEY);
    let metadata: Record<string, { fileName: string, date: string }> = {};
    
    if (metadataStr) {
      metadata = JSON.parse(metadataStr);
    }
    
    metadata[key] = {
      fileName,
      date: new Date().toISOString()
    };
    
    localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error updating PSD metadata:', error);
  }
};

// Get PSD file metadata
export const getPSDMetadata = (): string[] => {
  try {
    const metadataStr = localStorage.getItem(PSD_METADATA_KEY);
    if (!metadataStr) return [];
    
    const metadata = JSON.parse(metadataStr);
    return Object.keys(metadata);
  } catch (error) {
    console.error('Error getting PSD metadata:', error);
    return [];
  }
};

// Custom error to handle PSD not found
class PSDNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PSDNotFoundError';
  }
}

// Get PSD file data by storage key
export const getPSDDataByKey = (key: string): PSDFileData => {
  const dataStr = localStorage.getItem(key);
  if (!dataStr) {
    throw new PSDNotFoundError(`PSD data with key ${key} not found`);
  }
  
  return JSON.parse(dataStr);
};

// Remove PSD data from storage
export const removePSDData = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    
    // Update metadata
    const metadataStr = localStorage.getItem(PSD_METADATA_KEY);
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      if (metadata[key]) {
        delete metadata[key];
        localStorage.setItem(PSD_METADATA_KEY, JSON.stringify(metadata));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error removing PSD data:', error);
    return false;
  }
};

// Save PSD metadata for easier retrieval
export const savePSDMetadata = (fileName: string, width: number, height: number): string => {
  try {
    const key = `${PSD_DATA_PREFIX}meta_${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
    const metadata = {
      fileName,
      width,
      height,
      date: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(metadata));
    updatePSDMetadata(key, fileName);
    
    return key;
  } catch (error) {
    console.error('Error saving PSD metadata:', error);
    return '';
  }
};
