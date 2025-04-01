import { BannerSize, EditorElement } from "@/components/editor/types";

const CACHE_PREFIX = 'adgile_format_cache_';
const CACHE_VERSION = 'v1';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 dias em milissegundos

interface FormatCacheItem {
  sourceFormat: BannerSize;
  targetFormat: BannerSize;
  elements: EditorElement[];
  createdAt: number;
  similarityScore?: number;
}

interface FormatCacheIndex {
  keys: string[];
  lastUpdated: number;
  version: string;
}

/**
 * Gera uma chave de cache para um par de formatos
 */
const generateCacheKey = (sourceFormatName: string, targetFormatName: string): string => {
  return `${CACHE_PREFIX}${sourceFormatName.toLowerCase().replace(/\s+/g, '_')}_to_${targetFormatName.toLowerCase().replace(/\s+/g, '_')}`;
};

/**
 * Obtém ou cria o índice de cache
 */
const getCacheIndex = (): FormatCacheIndex => {
  try {
    const indexKey = `${CACHE_PREFIX}index`;
    const storedIndex = localStorage.getItem(indexKey);
    
    if (storedIndex) {
      const index = JSON.parse(storedIndex);
      if (index.version !== CACHE_VERSION) {
        // Se a versão do cache mudou, limpar índice antigo
        return { keys: [], lastUpdated: Date.now(), version: CACHE_VERSION };
      }
      return index;
    }
    
    return { keys: [], lastUpdated: Date.now(), version: CACHE_VERSION };
  } catch (error) {
    console.error('Erro ao recuperar índice de cache:', error);
    return { keys: [], lastUpdated: Date.now(), version: CACHE_VERSION };
  }
};

/**
 * Salva o índice de cache
 */
const saveCacheIndex = (index: FormatCacheIndex): void => {
  try {
    const indexKey = `${CACHE_PREFIX}index`;
    localStorage.setItem(indexKey, JSON.stringify({
      ...index,
      lastUpdated: Date.now()
    }));
  } catch (error) {
    console.error('Erro ao salvar índice de cache:', error);
  }
};

/**
 * Adiciona um layout ao cache de formatos
 */
export const cacheFormatLayout = (
  sourceFormat: BannerSize,
  targetFormat: BannerSize,
  elements: EditorElement[],
  similarityScore?: number
): void => {
  try {
    // Limpar elementos para armazenamento
    const cleanedElements = elements.map(el => {
      const { isNew, isSelected, _isAnimating, ...cleanElement } = el as any;
      
      // Otimizar conteúdo de imagens
      if (cleanElement.type === 'image' && 
          typeof cleanElement.content === 'string' && 
          cleanElement.content.startsWith('data:image')) {
        cleanElement.content = cleanElement.content.substring(0, 64) + '...';
      }
      
      return cleanElement;
    });
    
    // Gerar chave de cache
    const cacheKey = generateCacheKey(sourceFormat.name, targetFormat.name);
    
    // Criar item de cache
    const cacheItem: FormatCacheItem = {
      sourceFormat,
      targetFormat,
      elements: cleanedElements,
      createdAt: Date.now(),
      similarityScore
    };
    
    // Salvar no localStorage
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    
    // Atualizar índice
    const index = getCacheIndex();
    if (!index.keys.includes(cacheKey)) {
      index.keys.push(cacheKey);
      saveCacheIndex(index);
    }
    
    console.log(`Layout cached: ${sourceFormat.name} to ${targetFormat.name}`);
  } catch (error) {
    console.error('Erro ao armazenar layout em cache:', error);
  }
};

/**
 * Recupera um layout do cache de formatos
 */
export const getFormatLayoutFromCache = (
  sourceFormatName: string,
  targetFormatName: string
): FormatCacheItem | null => {
  try {
    const cacheKey = generateCacheKey(sourceFormatName, targetFormatName);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const cacheItem: FormatCacheItem = JSON.parse(cachedData);
      
      // Verificar se o cache expirou
      if (Date.now() - cacheItem.createdAt > CACHE_TTL) {
        // Cache expirado, remover
        localStorage.removeItem(cacheKey);
        
        // Atualizar índice
        const index = getCacheIndex();
        index.keys = index.keys.filter(key => key !== cacheKey);
        saveCacheIndex(index);
        
        return null;
      }
      
      return cacheItem;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao recuperar layout do cache:', error);
    return null;
  }
};

/**
 * Encontra formatos similares no cache
 */
export const findSimilarFormatsInCache = (
  formatName: string
): { sourceFormat: BannerSize, targetFormats: BannerSize[] }[] => {
  try {
    const index = getCacheIndex();
    const results: { sourceFormat: BannerSize, targetFormats: BannerSize[] }[] = [];
    
    // Buscar como formato de origem
    const asSourceKeys = index.keys.filter(key => 
      key.includes(`${CACHE_PREFIX}${formatName.toLowerCase().replace(/\s+/g, '_')}_to_`)
    );
    
    if (asSourceKeys.length > 0) {
      const sourceResult = {
        sourceFormat: null as BannerSize,
        targetFormats: [] as BannerSize[]
      };
      
      for (const key of asSourceKeys) {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
          const cacheItem: FormatCacheItem = JSON.parse(cachedData);
          
          // Verificar expiração
          if (Date.now() - cacheItem.createdAt > CACHE_TTL) continue;
          
          if (!sourceResult.sourceFormat) {
            sourceResult.sourceFormat = cacheItem.sourceFormat;
          }
          
          sourceResult.targetFormats.push(cacheItem.targetFormat);
        }
      }
      
      if (sourceResult.sourceFormat && sourceResult.targetFormats.length > 0) {
        results.push(sourceResult);
      }
    }
    
    // Buscar como formato de destino
    const asTargetKeys = index.keys.filter(key => 
      key.includes(`_to_${formatName.toLowerCase().replace(/\s+/g, '_')}`)
    );
    
    const targetSourceMap = new Map<string, { 
      sourceFormat: BannerSize, 
      targetFormats: BannerSize[] 
    }>();
    
    for (const key of asTargetKeys) {
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        const cacheItem: FormatCacheItem = JSON.parse(cachedData);
        
        // Verificar expiração
        if (Date.now() - cacheItem.createdAt > CACHE_TTL) continue;
        
        const sourceFormatName = cacheItem.sourceFormat.name;
        
        if (!targetSourceMap.has(sourceFormatName)) {
          targetSourceMap.set(sourceFormatName, {
            sourceFormat: cacheItem.sourceFormat,
            targetFormats: [cacheItem.targetFormat]
          });
        } else {
          const entry = targetSourceMap.get(sourceFormatName);
          if (!entry.targetFormats.some(f => f.name === cacheItem.targetFormat.name)) {
            entry.targetFormats.push(cacheItem.targetFormat);
          }
        }
      }
    }
    
    targetSourceMap.forEach(value => {
      results.push(value);
    });
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar formatos similares no cache:', error);
    return [];
  }
};

/**
 * Calcula a similaridade entre dois formatos
 * Retorna um valor entre 0 e 1, onde 1 é idêntico
 */
export const calculateFormatSimilarity = (format1: BannerSize, format2: BannerSize): number => {
  // Calcular a proporção (aspect ratio)
  const ratio1 = format1.width / format1.height;
  const ratio2 = format2.width / format2.height;
  
  // Diferença de proporção (invertida para que 1 seja mais similar)
  const ratioDiff = Math.abs(ratio1 - ratio2);
  const ratioSimilarity = 1 / (1 + ratioDiff);
  
  // Calcular similaridade de escala (tamanho)
  const area1 = format1.width * format1.height;
  const area2 = format2.width * format2.height;
  const areaRatio = Math.min(area1, area2) / Math.max(area1, area2);
  
  // Pesos para cada fator (ponderação)
  const RATIO_WEIGHT = 0.7;  // Aspecto é mais importante
  const AREA_WEIGHT = 0.3;   // Tamanho é menos importante
  
  // Similaridade ponderada
  const similarity = (ratioSimilarity * RATIO_WEIGHT) + (areaRatio * AREA_WEIGHT);
  
  return Math.min(1, Math.max(0, similarity));
};
