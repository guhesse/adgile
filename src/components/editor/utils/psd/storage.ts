import axios from "axios";

/**
 * Faz upload de uma imagem extraída para o backend e retorna a URL do CDN
 * @param imageBuffer Buffer da imagem extraída
 * @param filename Nome do arquivo
 */
const uploadImageToCDN = async (imageBuffer: ArrayBuffer, filename: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]), filename);

    const response = await axios.post('http://localhost:3333/api/cdn/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.url) {
      console.log(`Imagem enviada para o CDN com sucesso: ${response.data.url}`);
      return response.data.url;
    } else {
      throw new Error('Resposta do backend não contém uma URL válida.');
    }
  } catch (error) {
    console.error('Erro ao enviar imagem para o CDN:', error);
    throw error;
  }
};

/**
 * Salva dados de imagem no BunnyCDN e retorna a URL
 * @param imageData Dados da imagem (ArrayBuffer)
 * @param layerName Nome da camada para gerar um nome de arquivo único
 * @returns URL da imagem no CDN
 */
export const saveImageToStorage = async (imageData: ArrayBuffer, layerName: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const filename = `${layerName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.png`;
    const cdnUrl = await uploadImageToCDN(imageData, filename);
    return cdnUrl;
  } catch (error) {
    console.error(`Erro ao salvar imagem no BunnyCDN para a camada ${layerName}:`, error);
    throw error;
  }
};

/**
 * Remove uma imagem do BunnyCDN
 * @param imageUrl URL da imagem a ser removida
 */
export const removeImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    await axios.delete('http://localhost:3333/api/cdn/images', {
      data: { url: imageUrl },
    });
    console.log(`Imagem removida do CDN: ${imageUrl}`);
  } catch (error) {
    console.error(`Erro ao remover imagem do CDN: ${imageUrl}`, error);
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
    // Remover qualquer dado de imagem base64 antes de salvar
    const sanitizedData = {
      ...psdData,
      layers: psdData.layers.map((layer: any) => ({
        ...layer,
        imageData: undefined, // Remover dados de imagem base64
      })),
    };

    // Gera uma chave única baseada no nome do arquivo e timestamp
    const timestamp = Date.now();
    const key = `${PSD_STORAGE_PREFIX}${fileName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;

    // Converte os dados para string JSON
    const psdDataString = JSON.stringify({
      fileName,
      createdAt: new Date().toISOString(),
      data: sanitizedData,
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

/**
 * Recupera dados do PSD do localStorage
 * @param key Chave para recuperar os dados
 * @returns Dados do PSD ou null
 */
export const getPSDDataFromStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    // Garantir que não haja dados de imagem base64 no retorno
    if (parsedData?.data?.layers) {
      parsedData.data.layers = parsedData.data.layers.map((layer: any) => ({
        ...layer,
        imageData: undefined, // Remover dados de imagem base64
      }));
    }

    return parsedData;
  } catch (error) {
    console.error(`Erro ao recuperar dados do PSD com a chave ${key}:`, error);
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
