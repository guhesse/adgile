import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { parsePSDFile } from './psdParser';
import { processLayer, calculatePercentageValues } from './elementProcessor';
import { savePSDDataToStorage, getPSDStorageKeys } from './storage';
import { PSDFileData } from './types';

/**
 * Re-export the PSDFileData type for backward compatibility
 */
export type { PSDFileData } from './types';

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
    console.log("Pre-extracted images:", extractedImages.size);
    
    // Now process all layers
    for (const layer of psd.layers) {
      const element = await processLayer(layer, selectedSize, psdData, extractedImages);
      if (element) {
        // Assign the sizeId to ensure elements are bound to this specific canvas size
        element.sizeId = selectedSize.name;
        elements.push(element);
      }
    }
    
    // If no elements were processed directly from psd.layers,
    // try to use the tree() to get layers
    if (elements.length === 0 && psd.tree && typeof psd.tree === 'function') {
      console.log("No elements found in direct layers array, trying tree approach");
      const tree = psd.tree();
      
      // Check if the tree has descendants method (similar to the example)
      if (tree.descendants && typeof tree.descendants === 'function') {
        const descendants = tree.descendants();
        console.log("Processing descendants:", descendants.length);
        
        for (const node of descendants) {
          if (!node.isGroup || (typeof node.isGroup === 'function' && !node.isGroup())) {
            console.log(`Processing descendant: ${node.name}`);
            
            // Process this node with pre-extracted images
            const element = await processLayer(node.layer || node, selectedSize, psdData, extractedImages);
            if (element) {
              // Assign the sizeId for proper artboard association
              element.sizeId = selectedSize.name;
              elements.push(element);
            }
          }
        }
      } else if (tree.children && Array.isArray(tree.children)) {
        // If tree has children property, process them recursively
        console.log("Processing tree children");
        const processChildrenRecursively = async (children: any[]) => {
          for (const child of children) {
            if (!child.isGroup || (typeof child.isGroup === 'function' && !child.isGroup())) {
              const element = await processLayer(child.layer || child, selectedSize, psdData, extractedImages);
              if (element) {
                // Assign the sizeId for proper artboard association
                element.sizeId = selectedSize.name;
                elements.push(element);
              }
            }
            
            if (child.children && Array.isArray(child.children)) {
              await processChildrenRecursively(child.children);
            }
          }
        };
        
        await processChildrenRecursively(tree.children);
      }
    }
    
    // Calculate percentage values - important for responsive behavior
    calculatePercentageValues(elements, selectedSize);
    
    // Make sure elements stay within the boundaries
    elements.forEach(element => {
      // If element extends beyond right edge
      if (element.style.x + element.style.width > selectedSize.width) {
        // If wider than canvas, resize it
        if (element.style.width > selectedSize.width) {
          element.style.width = selectedSize.width - 20; // Leave some margin
          element.style.x = 10; // Position with margin
        } else {
          // Otherwise just position it within bounds
          element.style.x = selectedSize.width - element.style.width - 10;
        }
      }
      
      // If element extends beyond bottom edge
      if (element.style.y + element.style.height > selectedSize.height) {
        // If taller than canvas, resize it
        if (element.style.height > selectedSize.height) {
          element.style.height = selectedSize.height - 20; // Leave some margin
          element.style.y = 10; // Position with margin
        } else {
          // Otherwise just position it within bounds
          element.style.y = selectedSize.height - element.style.height - 10;
        }
      }
      
      // Recalculate percentages after adjustments
      element.style.xPercent = (element.style.x / selectedSize.width) * 100;
      element.style.yPercent = (element.style.y / selectedSize.height) * 100;
      element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
      element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
    });
    
    // Try to save PSD data to localStorage
    try {
      const storageKey = savePSDDataToStorage(psdData);
      
      // Display information about saved PSD data
      const psdDataKeys = getPSDStorageKeys();
      if (psdDataKeys.length > 0) {
        console.log(`PSD data disponíveis no localStorage: ${psdDataKeys.length}`);
        console.log(`Último PSD salvo: ${psdDataKeys[psdDataKeys.length - 1]}`);
      }
    } catch (error) {
      console.error("Error saving PSD data to localStorage:", error);
      // This is non-critical, so we can continue even if storage fails
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
