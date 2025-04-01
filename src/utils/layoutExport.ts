import { EditorElement, BannerSize } from "@/components/editor/types";

/**
 * Interface para o formato de exportação de layout
 */
export interface LayoutExport {
  format: BannerSize;
  elements: EditorElement[];
  metadata?: {
    exportedAt: string;
    version: string;
    tags?: string[];
  };
}

/**
 * Interface para um cache de layouts similares
 */
export interface LayoutCache {
  sourceFormat: BannerSize;
  targetFormats: {
    format: BannerSize;
    elements: EditorElement[];
    similarityScore?: number;
  }[];
  lastUpdated: string;
}

/**
 * Limpa um elemento para exportação, removendo propriedades desnecessárias
 */
const cleanElementForExport = (element: EditorElement): EditorElement => {
  // Cria uma cópia profunda para não modificar o original
  const cleanedElement = JSON.parse(JSON.stringify(element));
  
  // Remover propriedades efêmeras ou específicas da aplicação
  delete cleanedElement.isNew;
  delete cleanedElement.isSelected;
  delete cleanedElement._isAnimating;
  
  // Otimização para conteúdo de imagens grandes
  if (cleanedElement.type === 'image' && 
      typeof cleanedElement.content === 'string' && 
      cleanedElement.content.startsWith('data:image')) {
    // Para demonstração, mantemos o início da URL para identificar que é uma imagem
    // Em produção pode ser mais adequado armazenar uma referência ou hash
    cleanedElement.content = cleanedElement.content.substring(0, 64) + '...';
  }
  
  return cleanedElement;
};

/**
 * Exporta um layout para JSON
 */
export const exportLayoutToJson = (
  format: BannerSize,
  elements: EditorElement[],
  filename = 'layout-export.json',
  tags?: string[]
): void => {
  const cleanedElements = elements
    .filter(el => !el.sizeId || el.sizeId === format.name || el.sizeId === 'global')
    .map(cleanElementForExport);
  
  const layoutExport: LayoutExport = {
    format,
    elements: cleanedElements,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      tags
    }
  };
  
  // Criar um blob a partir do JSON
  const jsonStr = JSON.stringify(layoutExport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  
  // Criar um link de download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Limpar
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  return jsonStr;
};

/**
 * Copia o JSON do layout para a área de transferência
 */
export const copyLayoutJsonToClipboard = async (
  format: BannerSize,
  elements: EditorElement[],
  tags?: string[]
): Promise<boolean> => {
  const cleanedElements = elements
    .filter(el => !el.sizeId || el.sizeId === format.name || el.sizeId === 'global')
    .map(cleanElementForExport);
  
  const layoutExport: LayoutExport = {
    format,
    elements: cleanedElements,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      tags
    }
  };
  
  const jsonStr = JSON.stringify(layoutExport, null, 2);
  
  try {
    await navigator.clipboard.writeText(jsonStr);
    return true;
  } catch (err) {
    console.error('Failed to copy layout to clipboard:', err);
    return false;
  }
};
