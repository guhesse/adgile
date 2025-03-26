
/**
 * Utility functions for handling PSD storage in localStorage
 */

export const storePSDData = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to store PSD data with key ${key}:`, error);
    return false;
  }
};

export const getPSDDataFromStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to retrieve PSD data with key ${key}:`, error);
    return null;
  }
};

export const removePSDDataFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove PSD data with key ${key}:`, error);
    return false;
  }
};

// Helper to get all PSD storage keys
export const getAllPSDStorageKeys = (): string[] => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('psd-')) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.error('Failed to get all PSD storage keys:', error);
    return [];
  }
};

// Clear all PSD data from storage
export const clearAllPSDData = (): boolean => {
  try {
    const keys = getAllPSDStorageKeys();
    keys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear all PSD data:', error);
    return false;
  }
};
