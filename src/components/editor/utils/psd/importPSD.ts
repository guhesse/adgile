
import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { parsePSDFile } from './psdParser';
import { processLayer, calculatePercentageValues } from './elementProcessor';
import { savePSDDataToStorage, getPSDMetadata } from './storage';
import { PSDFileData } from './types';
import { convertPSDColorToHex } from './formatters';

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
    
    // Extract background color if available
    let backgroundColor = '#ffffff'; // Default white
    try {
      if (psd.tree) {
        const tree = psd.tree();
        // Try to find a background layer
        const bgLayer = tree.children?.find((child: any) => 
          child.name?.toLowerCase().includes('background') || 
          child.name?.toLowerCase().includes('bg')
        );
        
        if (bgLayer && bgLayer.fill && bgLayer.fill.color) {
          backgroundColor = convertPSDColorToHex(bgLayer.fill.color);
          console.log(`Extracted background color: ${backgroundColor}`);
        }
        
        // Store in psdData
        psdData.backgroundColor = backgroundColor;
      }
    } catch (bgError) {
      console.error("Error extracting background color:", bgError);
    }
    
    // Log raw PSD data for debugging (complete structure in one place)
    console.log("=== RAW PSD DATA ===");
    try {
      // Get comprehensive PSD data
      const rawData = {
        header: psd.header,
        resources: psd.resources,
        layersCount: psd.layers.length,
        dimensions: { width: psd.header.width, height: psd.header.height },
        extractedImages: Array.from(extractedImages.keys()),
        treeStructure: psd.tree && typeof psd.tree === 'function' ? psd.tree() : null
      };
      console.log(rawData);
    } catch (logError) {
      console.error("Error logging full PSD structure:", logError);
    }
    
    // Process layers
    const elements: EditorElement[] = [];
    
    // Now process all layers
    for (const layer of psd.layers) {
      const element = await processLayer(layer, selectedSize, psdData, extractedImages);
      if (element) {
        // Assign the sizeId as 'global' to ensure elements are visible in all artboards
        element.sizeId = 'global';
        elements.push(element);
      }
    }
    
    // If no elements were processed directly from psd.layers,
    // try to use the tree() to get layers
    if (elements.length === 0 && psd.tree && typeof psd.tree === 'function') {
      const tree = psd.tree();
      
      // Check if the tree has descendants method
      if (tree.descendants && typeof tree.descendants === 'function') {
        const descendants = tree.descendants();
        
        for (const node of descendants) {
          if (!node.isGroup || (typeof node.isGroup === 'function' && !node.isGroup())) {
            const element = await processLayer(node.layer || node, selectedSize, psdData, extractedImages);
            if (element) {
              // Assign 'global' sizeId for visibility in all artboards
              element.sizeId = 'global';
              elements.push(element);
            }
          }
        }
      } else if (tree.children && Array.isArray(tree.children)) {
        // If tree has children property, process them recursively
        const processChildrenRecursively = async (children: any[]) => {
          for (const child of children) {
            if (!child.isGroup || (typeof child.isGroup === 'function' && !child.isGroup())) {
              const element = await processLayer(child.layer || child, selectedSize, psdData, extractedImages);
              if (element) {
                // Assign 'global' sizeId for visibility in all artboards
                element.sizeId = 'global';
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
    
    // Allow elements to extend slightly beyond artboard boundaries
    // but still ensure they're connected to the artboard
    elements.forEach(element => {
      // Ensure all elements have the 'global' sizeId
      element.sizeId = 'global';
      
      // If element extends beyond right edge by more than 50%
      if (element.style.x > selectedSize.width * 1.5) {
        element.style.x = selectedSize.width - element.style.width / 2;
      }
      
      // If element extends beyond bottom edge by more than 50%
      if (element.style.y > selectedSize.height * 1.5) {
        element.style.y = selectedSize.height - element.style.height / 2;
      }
      
      // If element is completely off-screen to the left
      if (element.style.x + element.style.width < -element.style.width * 0.5) {
        element.style.x = -element.style.width / 2;
      }
      
      // If element is completely off-screen to the top
      if (element.style.y + element.style.height < -element.style.height * 0.5) {
        element.style.y = -element.style.height / 2;
      }
      
      // Recalculate percentages after adjustments
      element.style.xPercent = (element.style.x / selectedSize.width) * 100;
      element.style.yPercent = (element.style.y / selectedSize.height) * 100;
      element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
      element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
    });
    
    // Don't create the artboard background element as it will be managed separately
    
    // Try to save PSD data to localStorage
    try {
      const storageKey = savePSDDataToStorage(file.name, psdData);
      
      // Display information about saved PSD data
      const psdDataKeys = getPSDMetadata();
      if (psdDataKeys.length > 0) {
        console.log(`PSD data disponíveis no localStorage: ${psdDataKeys.length}`);
      }
    } catch (error) {
      console.error("Error saving PSD data to localStorage:", error);
      // This is non-critical, so we can continue even if storage fails
    }
    
    // Log summary of imported elements
    const textElements = elements.filter(el => el.type === 'text').length;
    const imageElements = elements.filter(el => el.type === 'image').length;
    
    if (elements.length === 0) {
      toast.warning("Nenhuma camada visível encontrada no arquivo PSD.");
    } else {
      toast.success(`Importados ${elements.length} elementos do arquivo PSD.`);
    }
    
    // Return just the elements - artboard background will be managed separately
    return elements;
  } catch (error) {
    console.error("Error importing PSD file:", error);
    toast.error("Falha ao interpretar o arquivo PSD. Verifique se é um PSD válido.");
    throw error;
  }
};
