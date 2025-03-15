import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { parsePSDFile } from './psdParser';
import { processLayer, calculatePercentageValues } from './elementProcessor';
import { savePSDDataToStorage, getPSDStorageKeys } from './storage';
import { PSDFileData } from './types';

/**
 * Re-export the PSDFileData type for backward compatibility
 */
export { PSDFileData } from './types';

/**
 * Import a PSD file and convert it to editor elements
 * @param file The PSD file to import
 * @param selectedSize The selected banner size
 * @returns A promise resolving to an array of editor elements
 */
export const importPSDFile = async (file: File, selectedSize: BannerSize): Promise<EditorElement[]> => {
  try {
    // Parse the PSD file
    const { psd, psdData, extractedImages } = await parsePSDFile(file);
    
    // Process layers
    const elements: EditorElement[] = [];
    console.log("=== PROCESSING LAYERS ===");
    console.log("Layers count:", psd.layers.length);
    
    // Now process all layers
    for (const layer of psd.layers) {
      const element = await processLayer(layer, selectedSize, psdData);
      if (element) {
        elements.push(element);
      }
    }
    
    // Calculate percentage values
    calculatePercentageValues(elements, selectedSize);
    
    // Save PSD data to localStorage
    console.log("=== PSD DATA FOR DATABASE ===");
    console.log(JSON.stringify(psdData, null, 2));
    
    const storageKey = savePSDDataToStorage(psdData);
    
    // Display information about saved PSD data
    const psdDataKeys = getPSDStorageKeys();
    if (psdDataKeys.length > 0) {
      console.log(`PSD data disponíveis no localStorage: ${psdDataKeys.length}`);
      console.log(`Último PSD salvo: ${psdDataKeys[psdDataKeys.length - 1]}`);
    }
    
    // Log summary of imported elements
    const textElements = elements.filter(el => el.type === 'text').length;
    const imageElements = elements.filter(el => el.type === 'image').length;
    const containerElements = elements.filter(el => el.type === 'container').length;
    
    console.log("FINAL IMPORT SUMMARY:");
    console.log("Total elements:", elements.length);
    console.log("Text elements:", textElements);
    console.log("Image elements:", imageElements);
    console.log("Container elements:", containerElements);
    
    if (elements.length === 0) {
      toast.warning("Nenhuma camada visível encontrada no arquivo PSD.");
    } else {
      toast.success(`Importados ${elements.length} elementos do arquivo PSD. (${textElements} textos, ${imageElements} imagens, ${containerElements} containers)`);
    }
    
    return elements;
  } catch (error) {
    console.error("Error importing PSD file:", error);
    toast.error("Falha ao interpretar o arquivo PSD. Verifique se é um PSD válido.");
    throw error;
  }
};

/**
 * Save PSD data to database or storage
 * This is a placeholder function that can be implemented when a database is available
 */
export const savePSDDataToStorage = async (psdData: PSDFileData): Promise<void> => {
  // Redirect to the more specific function in storage.ts
  savePSDDataToStorage(psdData);
  return Promise.resolve();
};
