
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
        // Only process imageData if it exists on the layer
        ...(layer.imageData && { 
          imageData: layer.imageData.length > 1000 ?
            layer.imageData.substring(0, 100) + '...[truncated]' :
            layer.imageData 
        })
      }))
    };

    try {
      localStorage.setItem(key, JSON.stringify(safeData));
      console.log(`PSD data saved to localStorage with key: ${key}`);
    } catch (storageError) {
      // Não emitir erro, apenas registrar no console
      console.warn('Não foi possível salvar os dados PSD no localStorage, armazenamento temporário não disponível');
    }

    // Atualizar o registro de metadados
    try {
      updatePSDMetadata(key, filename);
    } catch (metadataError) {
      // Silenciar erro de metadata
      console.warn('Não foi possível atualizar metadados de PSD');
    }

    return key;
  } catch (error) {
    console.warn('Erro ao preparar dados do PSD para armazenamento');

    // Em caso de erro, tentar uma versão ainda mais simplificada sem os dados de imagem
    try {
      const minimalData = {
        ...data,
        layers: data.layers.map(layer => ({
          ...layer,
          imageData: undefined
        }))
      };

      try {
        localStorage.setItem(key, JSON.stringify(minimalData));
        updatePSDMetadata(key, filename);
      } catch (minimalError) {
        // Silenciar erro
        console.warn('Não foi possível salvar dados mínimos do PSD');
      }

      return key;
    } catch (minimalPreparationError) {
      // Silenciar erro de preparação de dados mínimos
      console.warn('Erro ao preparar dados mínimos do PSD');
      return key; // Retornar a chave mesmo assim
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
  } catch (error) {
    // Silenciar erro, apenas registrar aviso no console 
    console.warn(`Não foi possível salvar imagem "${layerName}" no localStorage, cota excedida.`);
  }

  return key; // Retornar a chave mesmo em caso de erro
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
export const getPSDMetadata = (): Array<{ key: string, filename: string, date: string }> => {
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
