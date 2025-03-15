
import { PSDFileData } from './types';

/**
 * Save PSD data to localStorage
 * @param psdData The PSD data to save
 * @returns The key under which the data was saved
 */
export const savePSDDataToStorage = (psdData: PSDFileData): string => {
  try {
    const storageKey = `psd-import-${Date.now()}`;
    localStorage.setItem(storageKey, JSON.stringify(psdData));
    console.log("PSD data saved to localStorage under key:", storageKey);
    return storageKey;
  } catch (storageError) {
    console.error("Error saving PSD data to localStorage:", storageError);
    return '';
  }
};

/**
 * Get list of all stored PSD data keys
 * @returns Array of storage keys for PSD data
 */
export const getPSDStorageKeys = (): string[] => {
  return Object.keys(localStorage).filter(key => key.startsWith('psd-import-'));
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
 * Remove PSD data from localStorage by key
 * @param key The storage key to remove
 */
export const removePSDDataFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
    console.log("Removed PSD data with key:", key);
  } catch (error) {
    console.error("Error removing PSD data from localStorage:", error);
  }
};
