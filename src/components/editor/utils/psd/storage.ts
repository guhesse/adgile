
/**
 * Utility functions for handling PSD storage in localStorage
 */

// Armazenamento em memória para dados de imagem
const imageStorage: Record<string, string> = {};

/**
 * Salva dados de imagem no armazenamento e retorna uma chave de acesso
 * @param imageData Dados da imagem (dataURL ou src)
 * @param layerName Nome da camada para gerar uma chave única
 * @returns Chave para acessar a imagem posteriormente
 */
export const saveImageToStorage = (imageData: string, layerName: string): string => {
  // Gera uma chave única baseada no nome da camada e timestamp
  const timestamp = Date.now();
  const key = `img_${layerName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;
  
  // Armazena os dados da imagem
  imageStorage[key] = imageData;
  
  return key;
};

/**
 * Recupera dados de imagem do armazenamento
 * @param key Chave de acesso à imagem
 * @returns Dados da imagem ou string vazia se não encontrada
 */
export const getImageFromStorage = (key: string): string => {
  return imageStorage[key] || '';
};

/**
 * Remove uma imagem do armazenamento
 * @param key Chave da imagem a ser removida
 */
export const removeImageFromStorage = (key: string): void => {
  if (key in imageStorage) {
    delete imageStorage[key];
  }
};

// Prefixo para as chaves do localStorage utilizadas para dados PSD
const PSD_STORAGE_PREFIX = 'psd-';

/**
 * Salva dados do PSD no localStorage com metadados
 * @param fileName Nome do arquivo PSD
 * @param psdData Dados do PSD a serem armazenados
 * @returns Chave utilizada para armazenar os dados
 */
export const savePSDDataToStorage = (fileName: string, psdData: any): string => {
  try {
    // Gera uma chave única baseada no nome do arquivo e timestamp
    const timestamp = Date.now();
    const key = `${PSD_STORAGE_PREFIX}${fileName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;
    
    // Converte os dados para string JSON
    const psdDataString = JSON.stringify({
      fileName,
      createdAt: new Date().toISOString(),
      data: psdData
    });
    
    // Armazena no localStorage
    localStorage.setItem(key, psdDataString);
    
    return key;
  } catch (error) {
    console.error('Erro ao salvar dados do PSD no localStorage:', error);
    return '';
  }
};

/**
 * Obtém metadados de todos os PSDs armazenados
 * @returns Lista de metadados dos PSDs
 */
export const getPSDMetadata = (): Array<{key: string, fileName: string, createdAt: string}> => {
  try {
    const keys = getAllPSDStorageKeys();
    const metadata = [];
    
    for (const key of keys) {
      const data = getPSDDataFromStorage(key);
      if (data && data.fileName && data.createdAt) {
        metadata.push({
          key,
          fileName: data.fileName,
          createdAt: data.createdAt
        });
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Erro ao obter metadados de PSD:', error);
    return [];
  }
};

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
      if (key && key.startsWith(PSD_STORAGE_PREFIX)) {
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

// Alias para compatibilidade
export const removePSDData = removePSDDataFromStorage;
export const loadPSDDataFromStorage = getPSDDataFromStorage;
