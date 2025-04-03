/**
 * Utilidades para trabalhar diretamente com IndexedDB
 */

const DB_NAME = 'adgile-storage';
const DB_VERSION = 1;
const STORE_NAME = 'templates-store';

export const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Não foi possível abrir o banco de dados");
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      };
    };
  });
};

export const saveToIndexedDB = async (key: string, data: any): Promise<boolean> => {
  try {
    const db = await initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Sanitizar dados antes de salvar
      const sanitizedData = {
        ...data,
        layers: data.layers?.map((layer: any) => ({
          ...layer,
          imageData: undefined, // Remover dados de imagem base64
        })),
      };

      const request = store.put({ key, data: sanitizedData });

      request.onsuccess = () => {
        console.log(`Dados salvos com sucesso para '${key}' no IndexedDB`);
        resolve(true);
      };

      request.onerror = (event) => {
        console.error(`Erro ao salvar dados para '${key}':`, event);
        reject(false);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Erro ao salvar no IndexedDB:", error);
    return false;
  }
};

export const getFromIndexedDB = async (key: string, defaultValue?: any): Promise<any> => {
  try {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(key);
      
      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          console.log(`Dados recuperados com sucesso para '${key}' do IndexedDB`);
          resolve(result.data);
        } else {
          console.log(`Nenhum dado encontrado para '${key}', usando valor padrão`);
          resolve(defaultValue);
        }
      };
      
      request.onerror = (event) => {
        console.error(`Erro ao recuperar dados para '${key}':`, event);
        reject(event);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Erro ao acessar IndexedDB:", error);
    return defaultValue;
  }
};

export const deleteFromIndexedDB = async (key: string): Promise<boolean> => {
  try {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(key);
      
      request.onsuccess = () => {
        console.log(`Dados excluídos com sucesso para '${key}' do IndexedDB`);
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`Erro ao excluir dados para '${key}':`, event);
        reject(false);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Erro ao excluir do IndexedDB:", error);
    return false;
  }
};
