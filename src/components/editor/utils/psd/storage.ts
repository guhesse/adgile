import { PSDFileData } from './types';

/**
 * Prefixo para chaves no localStorage
 */
const PSD_DATA_PREFIX = 'adgile_psd_data_';
const PSD_IMAGE_PREFIX = 'adgile_psd_image_';

/**
 * Salva os dados do PSD no localStorage
 * @param filename Nome do arquivo PSD
 * @param data Dados do PSD a serem salvos
 * @returns A chave usada para salvar os dados
 */
export const savePSDDataToStorage = (filename: string, data: PSDFileData): string => {
  const cleanName = filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const key = `${PSD_DATA_PREFIX}${cleanName}_${Date.now()}`;
  
  try {
    // Limitar o tamanho dos dados a serem armazenados
    const safeData = {
      ...data,
      layers: data.layers.map(layer => ({
        ...layer,
        // Limitar tamanho dos dados de imagem para evitar estouro de armazenamento
        imageData: layer.imageData && layer.imageData.length > 1000 ? 
          layer.imageData.substring(0, 100) + '...[truncated]' : 
          layer.imageData
      }))
    };
    
    localStorage.setItem(key, JSON.stringify(safeData));
    console.log(`PSD data saved to localStorage with key: ${key}`);
    
    // Atualizar o registro de metadados
    updatePSDMetadata(key, filename);
    
    return key;
  } catch (error) {
    console.error('Error saving PSD data to localStorage:', error);
    
    // Em caso de erro, tentar uma versão ainda mais simplificada sem os dados de imagem
    try {
      const minimalData = {
        ...data,
        layers: data.layers.map(layer => ({
          ...layer,
          imageData: undefined
        }))
      };
      
      localStorage.setItem(key, JSON.stringify(minimalData));
      updatePSDMetadata(key, filename);
      return key;
    } catch (minimalError) {
      console.error('Erro ao salvar dados mínimos do PSD:', minimalError);
      throw minimalError;
    }
  }
};

/**
 * Salva uma imagem no localStorage
 * @param imageData Dados da imagem (base64 ou URL)
 * @param layerName Nome da camada que contém a imagem
 * @returns A chave usada para salvar a imagem
 */
export const saveImageToStorage = (imageData: string, layerName: string): string => {
  const cleanName = layerName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const key = `${PSD_IMAGE_PREFIX}${cleanName}_${Date.now()}`;
  
  try {
    localStorage.setItem(key, imageData);
    console.log(`Image saved to localStorage with key: ${key}`);
    return key;
  } catch (error) {
    console.error('Error saving image to localStorage:', error);
    throw error;
  }
};

/**
 * Recupera uma imagem do localStorage
 * @param key Chave da imagem no localStorage
 * @returns Dados da imagem ou null se não encontrada
 */
export const getImageFromStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

/**
 * Atualiza os metadados dos PSDs salvos
 * @param key Chave do PSD no localStorage
 * @param filename Nome do arquivo PSD
 */
const updatePSDMetadata = (key: string, filename: string): void => {
  const metadata = getPSDMetadata();
  metadata.push({
    key,
    filename,
    date: new Date().toISOString()
  });
  
  // Manter apenas os 10 mais recentes
  while (metadata.length > 10) {
    metadata.shift();
  }
  
  localStorage.setItem('adgile_psd_metadata', JSON.stringify(metadata));
};

/**
 * Recupera metadados dos PSDs salvos
 * @returns Lista de metadados dos PSDs
 */
export const getPSDMetadata = (): Array<{key: string, filename: string, date: string}> => {
  const metadata = localStorage.getItem('adgile_psd_metadata');
  return metadata ? JSON.parse(metadata) : [];
};

/**
 * Recupera dados de um PSD do localStorage
 * @param key Chave do PSD no localStorage
 * @returns Dados do PSD ou null se não encontrado
 */
export const getPSDDataFromStorage = (key: string): PSDFileData | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
