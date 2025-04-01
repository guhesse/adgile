import axios from 'axios';
import { BannerSize, EditorElement } from '@/components/editor/types';
import { 
  findSimilarFormatsInCache, 
  getFormatLayoutFromCache, 
  calculateFormatSimilarity 
} from './formatCache';

interface RefinementRequest {
  currentFormat: BannerSize;
  elements: EditorElement[];
  targetFormats: BannerSize[];
  cachedExamples?: {
    sourceFormat: BannerSize;
    targetFormat: BannerSize;
    elements: EditorElement[];
    similarityScore?: number;
  }[];
}

interface RefinedLayout {
  format: BannerSize;
  elements: EditorElement[];
}

/**
 * Busca exemplos em cache que podem ser úteis para a IA
 */
const findCachedExamplesForRefinement = (
  currentFormat: BannerSize,
  targetFormats: BannerSize[]
): RefinementRequest['cachedExamples'] => {
  // Buscar formatos similares no cache
  const cachedFormats = findSimilarFormatsInCache(currentFormat.name);
  
  if (cachedFormats.length === 0) {
    console.log('Nenhum formato similar encontrado no cache');
    return [];
  }
  
  // Lista para armazenar exemplos relevantes
  const examples: RefinementRequest['cachedExamples'] = [];
  
  // Para cada formato alvo, buscar exemplos relevantes do cache
  for (const targetFormat of targetFormats) {
    // Calcular similaridade entre o formato atual e o formato de destino
    const similarityCurrentToTarget = calculateFormatSimilarity(currentFormat, targetFormat);
    
    // Verificar se há exemplos diretos para este formato específico
    const directExample = getFormatLayoutFromCache(currentFormat.name, targetFormat.name);
    if (directExample) {
      examples.push({
        sourceFormat: directExample.sourceFormat,
        targetFormat: directExample.targetFormat,
        elements: directExample.elements,
        similarityScore: 1.0 // Exemplo direto tem similaridade máxima
      });
      continue; // Se temos um exemplo direto, não precisamos buscar exemplos similares
    }
    
    // Buscar exemplos similares
    for (const cachedFormat of cachedFormats) {
      // Para cada formato de destino no cache
      for (const cachedTargetFormat of cachedFormat.targetFormats) {
        // Calcular similaridade entre o formato alvo atual e o formato alvo do cache
        const similarityTargets = calculateFormatSimilarity(targetFormat, cachedTargetFormat);
        
        // Calcular similaridade entre o formato de origem do cache e o formato atual
        const similaritySources = calculateFormatSimilarity(currentFormat, cachedFormat.sourceFormat);
        
        // Combinar similaridades para uma pontuação final
        const combinedSimilarity = (similarityTargets * 0.7) + (similaritySources * 0.3);
        
        // Se a similaridade combinada for alta o suficiente
        if (combinedSimilarity > 0.65) {
          // Buscar o layout do cache
          const cachedLayout = getFormatLayoutFromCache(
            cachedFormat.sourceFormat.name, 
            cachedTargetFormat.name
          );
          
          if (cachedLayout) {
            examples.push({
              sourceFormat: cachedLayout.sourceFormat,
              targetFormat: cachedLayout.targetFormat,
              elements: cachedLayout.elements,
              similarityScore: combinedSimilarity
            });
          }
        }
      }
    }
  }
  
  // Ordenar exemplos por similaridade (do mais similar para o menos)
  const sortedExamples = examples.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
  
  // Limitar a quantidade de exemplos para não sobrecarregar o prompt
  const limitedExamples = sortedExamples.slice(0, 5);
  
  console.log(`Encontrados ${examples.length} exemplos em cache, usando os ${limitedExamples.length} mais relevantes`);
  return limitedExamples;
};

/**
 * Serviço para refinar layouts usando o backend com IA
 */
const refineLayoutWithAI = async (
  currentFormat: BannerSize,
  elements: EditorElement[],
  targetFormats: BannerSize[]
): Promise<RefinedLayout[]> => {
  try {
    console.log('Iniciando refinamento de layout com IA');
    
    // Buscar exemplos relevantes do cache
    const cachedExamples = findCachedExamplesForRefinement(currentFormat, targetFormats);
    
    // Preparar dados da requisição
    const requestData: RefinementRequest = {
      currentFormat,
      elements,
      targetFormats,
      cachedExamples
    };
    
    // Fazer requisição ao backend
    const response = await axios.post('/api/refinement', requestData);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Resposta inválida do servidor de refinamento');
    }
    
    console.log(`Refinamento concluído com sucesso: ${response.data.length} layouts gerados`);
    return response.data;
  } catch (error) {
    console.error('Erro ao refinar layout:', error);
    throw new Error('Falha ao refinar layout com IA');
  }
};

export {
  refineLayoutWithAI,
  findCachedExamplesForRefinement
};
