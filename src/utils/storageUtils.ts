import axios from "axios";
import { toast } from "sonner";
import { saveToIndexedDB, getFromIndexedDB } from './indexedDBUtils';

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
    toast.error('Erro ao enviar imagem para o CDN.');
    throw error;
  }
};

/**
 * Salva dados de imagem no BunnyCDN e retorna a URL
 * @param imageData Dados da imagem (ArrayBuffer)
 * @param layerName Nome da camada para gerar um nome de arquivo único
 * @returns URL da imagem no CDN
 */
export const saveImageToCDN = async (imageData: ArrayBuffer, layerName: string): Promise<string> => {
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
 * Salva dados no IndexedDB ou no CDN, dependendo do tipo de dado
 * @param key Chave para armazenar os dados
 * @param data Dados a serem armazenados (ArrayBuffer para imagens ou JSON para outros dados)
 * @returns URL do CDN ou confirmação de armazenamento local
 */
export const saveData = async (key: string, data: any): Promise<string | boolean> => {
  try {
    if (data instanceof ArrayBuffer) {
      // Se os dados forem uma imagem, enviar para o CDN
      const cdnUrl = await saveImageToCDN(data, key);
      console.log(`Imagem salva no CDN com URL: ${cdnUrl}`);
      return cdnUrl;
    } else {
      // Para outros dados, garantir que não haja base64 antes de salvar
      const sanitizedData = {
        ...data,
        layers: data.layers?.map((layer: any) => ({
          ...layer,
          imageData: undefined, // Remover dados de imagem base64
        })),
      };

      const success = await saveToIndexedDB(key, sanitizedData);
      if (success) {
        console.log(`Dados salvos no IndexedDB com a chave: ${key}`);
        return true;
      } else {
        throw new Error('Falha ao salvar dados no IndexedDB.');
      }
    }
  } catch (error) {
    console.error(`Erro ao salvar dados para a chave ${key}:`, error);
    throw error;
  }
};

/**
 * Recupera dados do IndexedDB ou do CDN
 * @param key Chave para recuperar os dados
 * @returns Dados recuperados ou null
 */
export const getData = async (key: string): Promise<any> => {
  try {
    const data = await getFromIndexedDB(key);
    if (data) {
      console.log(`Dados recuperados do IndexedDB para a chave: ${key}`);
      return data;
    } else {
      console.warn(`Nenhum dado encontrado no IndexedDB para a chave: ${key}`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao recuperar dados para a chave ${key}:`, error);
    return null;
  }
};
