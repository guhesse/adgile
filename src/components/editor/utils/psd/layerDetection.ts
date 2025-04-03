import axios from "axios";
import { toast } from "sonner";

// Layer type detection utility functions
type LayerType = 'text' | 'image' | 'generic';

/**
 * Detects the type of a PSD layer
 * @param layer The PSD layer to analyze
 * @returns The detected layer type
 */
export const detectLayerType = (layer: any): LayerType => {
  if (isTextLayer(layer)) {
    return 'text';
  } else if (shouldBeImageLayer(layer)) {
    return 'image';
  }
  return 'generic';
};

/**
 * Enhanced text layer detection - combines multiple approaches
 * @param layer The PSD layer to analyze
 * @returns Whether the layer is a text layer
 */
export const isTextLayer = (layer: any): boolean => {
  try {
    if (!layer) return false;
    
    console.log(`Checking text indicators for "${layer.name || 'unnamed'}" layer`);
    
    // Fastest check: Look for TySh in infoKeys (PSD marker for text layers)
    if (layer.infoKeys && Array.isArray(layer.infoKeys) && layer.infoKeys.includes('TySh')) {
      console.log(`Layer "${layer.name}" is text - has TySh in infoKeys`);
      return true;
    }
    
    // Check: Direct type identification
    if (layer.type === 'type' || layer.type === 'text' || layer.type === 'TextLayer') {
      console.log(`Layer "${layer.name}" is text by type property: ${layer.type}`);
      return true;
    }
    
    // Check: Text patterns in layer name
    const textPatterns = /heading|h1|h2|h3|h4|h5|h6|paragraph|text|body|title|subtitle|button|label|caption/i;
    if (layer.name && textPatterns.test(layer.name)) {
      console.log(`Layer "${layer.name}" is text by name pattern`);
      return true;
    }
    
    // Check: Layer kind (3 is text in PSD spec)
    if (layer.info && layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layerKind: 3`);
      return true;
    }
    
    if (layer.layer && layer.layer.info && layer.layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layer.info.layerKind: 3`);
      return true;
    }
    
    // Check: typeTool presence in adjustments
    if (layer.adjustments && layer.adjustments.typeTool) {
      console.log(`Layer "${layer.name}" is text - has typeTool in adjustments`);
      return true;
    }
    
    // Check: Text function or property
    if (layer.text) {
      console.log(`Layer "${layer.name}" has text property`);
      return true;
    }
    
    // Check: typeTool function
    if (typeof layer.typeTool === 'function') {
      try {
        const typeToolData = layer.typeTool();
        if (typeToolData) {
          console.log(`Layer "${layer.name}" is text - has valid typeTool function`);
          return true;
        }
      } catch (err) {
        console.log(`Error executing typeTool function for "${layer.name}":`, err);
      }
    }
    
    console.log(`Layer "${layer.name}" is NOT a text layer - no text indicators found`);
    return false;
  } catch (error) {
    console.error(`Error in text layer detection for ${layer?.name || 'unnamed'}:`, error);
    return false;
  }
};

/**
 * Check if a layer should be treated as an image
 * @param layer The PSD layer to analyze
 * @returns Whether the layer should be treated as an image
 */
export const shouldBeImageLayer = (layer: any): boolean => {
  if (!layer) return false;
  
  // Skip group layers or layers without dimensions
  if (layer.isGroup && layer.isGroup()) return false;
  
  try {
    const exportData = layer.export();
    if (!exportData.width || !exportData.height || exportData.width <= 0 || exportData.height <= 0) {
      return false;
    }
    
    // Check if this is NOT a text layer (since text layers have dimensions too)
    if (isTextLayer(layer)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if layer is image:`, error);
    return false;
  }
};

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
 * Extrai os dados da imagem de uma camada do PSD e faz upload para o CDN
 * @param layer A camada do PSD
 * @param layerName O nome da camada
 * @returns Promise resolvendo para a URL da imagem no CDN
 */
export const extractLayerImageData = async (layer: any, layerName: string): Promise<string> => {
  try {
    console.log(`Extraindo dados da imagem para a camada: ${layerName}`);

    // Obter dimensões da camada
    const exportData = layer.export();
    const { width, height } = exportData;

    // Método 1: Usar toPng() diretamente
    if (layer.image && typeof layer.image.toPng === "function") {
      try {
        const pngBuffer = layer.image.toPng().buffer;
        return await uploadImageToCDN(pngBuffer, `${layerName}.png`);
      } catch (error) {
        console.error(`Erro ao usar toPng() para a camada ${layerName}:`, error);
      }
    }

    // Método 2: Usar canvas() se disponível
    if (typeof layer.canvas === "function") {
      try {
        const canvas = layer.canvas();
        const dataUrl = canvas.toDataURL("image/png");
        const buffer = await fetch(dataUrl).then(res => res.arrayBuffer());
        return await uploadImageToCDN(buffer, `${layerName}.png`);
      } catch (error) {
        console.error(`Erro ao usar canvas() para a camada ${layerName}:`, error);
      }
    }

    throw new Error(`Não foi possível extrair ou enviar a imagem da camada ${layerName}`);
  } catch (error) {
    console.error(`Erro ao extrair dados da imagem para ${layerName}:`, error);
    throw error;
  }
};

/**
 * Processa todas as camadas de imagem em uma árvore PSD
 * @param node O nó atual da árvore PSD
 * @param onImageExtracted Callback recebendo a URL da imagem no CDN e o nome do nó
 */
export const processImageLayers = async (node: any, onImageExtracted: (imageUrl: string, nodeName: string) => void) => {
  if (!node) return;

  try {
    if (node.isLayer && !node.isGroup()) {
      if (shouldBeImageLayer(node)) {
        console.log(`Processando camada de imagem: ${node.name}`);

        try {
          const imageUrl = await extractLayerImageData(node, node.name);
          onImageExtracted(imageUrl, node.name);
        } catch (error) {
          console.error(`Erro ao processar camada de imagem ${node.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao processar nó ${node?.name}:`, error);
  }

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      await processImageLayers(child, onImageExtracted);
    }
  }
};
