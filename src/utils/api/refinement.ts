import axios from 'axios';
import { apiBaseUrl } from '@/config';
import { BannerSize, EditorElement } from '@/components/editor/types';

const API_URL = `${apiBaseUrl}/ai`;

// Interface para os dados enviados para refinamento
interface RefinementRequest {
  currentFormat: BannerSize;
  elements: Partial<EditorElement>[];
  targetFormats: BannerSize[];
}

// Interface para um layout refinado
export interface RefinedLayout {
  format: BannerSize;
  elements: EditorElement[];
}

// Função para refinar layouts
export const refineLayouts = async (data: RefinementRequest): Promise<RefinedLayout[]> => {
  try {
    console.log(`Enviando requisição para ${API_URL}/refine-layouts`);
    
    // Otimizar os dados para envio
    const optimizedData = {
      ...data,
      elements: data.elements.map(el => {
        // Reduzir tamanho de data URLs muito grandes em imagens
        if (el.type === 'image' && typeof el.content === 'string' && el.content.startsWith('data:image') && el.content.length > 10000) {
          return {
            ...el,
            content: 'image-data-placeholder' // Substitui por placeholder temporário
          };
        }
        return el;
      })
    };
    
    const response = await axios.post(`${API_URL}/refine-layouts`, optimizedData);
    console.log('Resposta recebida do serviço de refinamento', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao refinar layouts:', error);
    
    // Fazer um mock se estiver em desenvolvimento ou se a API falhar
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.warn('Usando resposta simulada para refinamento em desenvolvimento');
      return mockRefinement(data);
    }
    
    throw error;
  }
};

// Função mock para desenvolvimento
const mockRefinement = (data: RefinementRequest): RefinedLayout[] => {
  return data.targetFormats.map(format => {
    // Simula elementos adaptados para o novo formato
    const mockElements = data.elements.map(el => {
      // Calcular proporcionalmente novos tamanhos e posições
      const widthRatio = format.width / data.currentFormat.width;
      const heightRatio = format.height / data.currentFormat.height;
      
      // Gerar um novo ID para este elemento
      const newId = `${el.id}-${format.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Criar elemento adaptado
      return {
        ...el,
        id: newId,
        originalId: el.id,
        sizeId: format.name,
        style: {
          ...el.style,
          x: (el.style?.x || 0) * widthRatio,
          y: (el.style?.y || 0) * heightRatio,
          width: (el.style?.width || 100) * widthRatio,
          height: (el.style?.height || 100) * heightRatio,
        }
      } as EditorElement;
    });
    
    return {
      format,
      elements: mockElements
    };
  });
};