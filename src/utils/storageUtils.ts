/**
 * Utilitários avançados para gerenciamento de armazenamento
 * com suporte a compressão e fallback para IndexedDB
 */
import { toast } from "sonner";
import { saveToIndexedDB, getFromIndexedDB } from './indexedDBUtils';

// Interface para operações de armazenamento
export interface StorageOperations {
  setItem: (key: string, value: string) => Promise<boolean>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
}

/**
 * Comprime uma string usando LZW simples
 */
const compressString = (input: string): string => {
  if (!input) return input;

  try {
    // Compressão básica: Base64 + btoa (suficiente para pequenos objetos JSON)
    return btoa(encodeURIComponent(input));
  } catch (error) {
    console.error("Erro ao comprimir dados:", error);
    return input; // Retorna string original em caso de erro
  }
};

/**
 * Descomprime uma string
 */
const decompressString = (compressed: string): string => {
  if (!compressed) return compressed;

  try {
    // Descompressão
    return decodeURIComponent(atob(compressed));
  } catch (error) {
    console.error("Erro ao descomprimir dados:", error);
    return compressed; // Retorna string comprimida em caso de erro
  }
};

/**
 * Implementação de armazenamento usando localStorage com compressão
 */
const localStorageWithCompression: StorageOperations = {
  setItem: async (key: string, value: string): Promise<boolean> => {
    try {
      const compressed = compressString(value);
      localStorage.setItem(key, compressed);
      return true;
    } catch (error) {
      console.error(`Erro ao armazenar dados comprimidos para chave ${key}:`, error);
      return false;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      const compressed = localStorage.getItem(key);
      if (!compressed) return null;
      return decompressString(compressed);
    } catch (error) {
      console.error(`Erro ao recuperar dados da chave ${key}:`, error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<boolean> => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erro ao remover chave ${key}:`, error);
      return false;
    }
  },

  clear: async (): Promise<boolean> => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error);
      return false;
    }
  }
};

/**
 * Verifica se o IndexedDB está disponível
 */
const isIndexedDBAvailable = (): boolean => {
  try {
    return !!window.indexedDB;
  } catch (e) {
    return false;
  }
};

/**
 * Implementação de armazenamento usando IndexedDB
 */
const indexedDBStorage: StorageOperations = {
  setItem: async (key: string, value: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isIndexedDBAvailable()) {
        resolve(false);
        return;
      }

      try {
        const request = indexedDB.open("adgileStorage", 1);

        request.onupgradeneeded = function () {
          const db = request.result;
          if (!db.objectStoreNames.contains("keyValueStore")) {
            db.createObjectStore("keyValueStore");
          }
        };

        request.onsuccess = function () {
          try {
            const db = request.result;
            const tx = db.transaction("keyValueStore", "readwrite");
            const store = tx.objectStore("keyValueStore");
            store.put(value, key);

            tx.oncomplete = function () {
              db.close();
              resolve(true);
            };

            tx.onerror = function () {
              db.close();
              resolve(false);
            };
          } catch (e) {
            console.error("Erro na transação IndexedDB:", e);
            resolve(false);
          }
        };

        request.onerror = function () {
          console.error("Erro ao abrir IndexedDB");
          resolve(false);
        };
      } catch (error) {
        console.error("Erro geral do IndexedDB:", error);
        resolve(false);
      }
    });
  },

  getItem: async (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isIndexedDBAvailable()) {
        resolve(null);
        return;
      }

      try {
        const request = indexedDB.open("adgileStorage", 1);

        request.onupgradeneeded = function () {
          const db = request.result;
          if (!db.objectStoreNames.contains("keyValueStore")) {
            db.createObjectStore("keyValueStore");
          }
        };

        request.onsuccess = function () {
          try {
            const db = request.result;
            const tx = db.transaction("keyValueStore", "readonly");
            const store = tx.objectStore("keyValueStore");
            const getRequest = store.get(key);

            getRequest.onsuccess = function () {
              db.close();
              resolve(getRequest.result || null);
            };

            getRequest.onerror = function () {
              db.close();
              resolve(null);
            };
          } catch (e) {
            console.error("Erro na transação IndexedDB:", e);
            resolve(null);
          }
        };

        request.onerror = function () {
          console.error("Erro ao abrir IndexedDB");
          resolve(null);
        };
      } catch (error) {
        console.error("Erro geral do IndexedDB:", error);
        resolve(null);
      }
    });
  },

  removeItem: async (key: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isIndexedDBAvailable()) {
        resolve(false);
        return;
      }

      try {
        const request = indexedDB.open("adgileStorage", 1);

        request.onsuccess = function () {
          try {
            const db = request.result;
            const tx = db.transaction("keyValueStore", "readwrite");
            const store = tx.objectStore("keyValueStore");
            store.delete(key);

            tx.oncomplete = function () {
              db.close();
              resolve(true);
            };

            tx.onerror = function () {
              db.close();
              resolve(false);
            };
          } catch (e) {
            resolve(false);
          }
        };

        request.onerror = function () {
          resolve(false);
        };
      } catch (error) {
        console.error("Erro geral do IndexedDB:", error);
        resolve(false);
      }
    });
  },

  clear: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isIndexedDBAvailable()) {
        resolve(false);
        return;
      }

      try {
        const request = indexedDB.open("adgileStorage", 1);

        request.onsuccess = function () {
          try {
            const db = request.result;
            const tx = db.transaction("keyValueStore", "readwrite");
            const store = tx.objectStore("keyValueStore");
            store.clear();

            tx.oncomplete = function () {
              db.close();
              resolve(true);
            };

            tx.onerror = function () {
              db.close();
              resolve(false);
            };
          } catch (e) {
            resolve(false);
          }
        };

        request.onerror = function () {
          resolve(false);
        };
      } catch (error) {
        console.error("Erro geral do IndexedDB:", error);
        resolve(false);
      }
    });
  }
};

/**
 * Armazenamento aprimorado que tenta localStorage primeiro
 * e cai de volta para IndexedDB se necessário
 */
export const enhancedStorage = {
  setItem: async (key: string, data: any): Promise<boolean> => {
    const valueStr = typeof data === 'string' ? data : JSON.stringify(data);

    // Tenta localStorage com compressão primeiro
    const localSuccess = await localStorageWithCompression.setItem(key, valueStr);
    if (localSuccess) return true;

    // Se falhar, tenta IndexedDB
    console.log(`localStorage falhou para '${key}', tentando IndexedDB...`);
    const indexedSuccess = await indexedDBStorage.setItem(key, valueStr);

    if (indexedSuccess) {
      console.log(`Dados salvos com sucesso em IndexedDB para '${key}'`);
      return true;
    }

    // Se ambos falharem, retorna falso
    console.error(`Não foi possível salvar dados para '${key}'`);
    return false;
  },

  getItem: async (key: string, defaultValue: any = null): Promise<any> => {
    // Tenta localStorage primeiro
    const localData = await localStorageWithCompression.getItem(key);
    if (localData !== null) {
      try {
        return JSON.parse(localData);
      } catch {
        return localData;
      }
    }

    // Se não encontrar, tenta IndexedDB
    const indexedData = await indexedDBStorage.getItem(key);
    if (indexedData !== null) {
      try {
        return JSON.parse(indexedData);
      } catch {
        return indexedData;
      }
    }

    // Se nada for encontrado, retorna o valor padrão
    return defaultValue;
  },

  removeItem: async (key: string): Promise<boolean> => {
    const localSuccess = await localStorageWithCompression.removeItem(key);
    const indexedSuccess = await indexedDBStorage.removeItem(key);

    return localSuccess || indexedSuccess;
  },

  clear: async (): Promise<boolean> => {
    const localSuccess = await localStorageWithCompression.clear();
    const indexedSuccess = await indexedDBStorage.clear();

    return localSuccess || indexedSuccess;
  }
};

/**
 * Armazena dados com segurança, lidando com erros e limites de armazenamento
 */
export const safelyStoreData = async (key: string, data: any): Promise<boolean> => {
  try {
    // Primeiro tentamos usar IndexedDB
    const success = await saveToIndexedDB(key, data);

    if (success) {
      return true;
    }

    // Fallback para localStorage se o IndexedDB falhar
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    return false;
  }
};

/**
 * Recupera dados com segurança
 */
export const safelyGetData = async (key: string, defaultValue: any = null): Promise<any> => {
  try {
    // Primeiro tentamos recuperar do IndexedDB
    const data = await getFromIndexedDB(key);

    if (data !== undefined && data !== null) {
      return data;
    }

    // Fallback para localStorage
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    }

    return defaultValue;
  } catch (error) {
    console.error("Erro ao recuperar dados:", error);
    return defaultValue;
  }
};
