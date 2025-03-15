
import { EditorElement, BannerSize } from "../../types";
import { parsePSDFile } from "./psdParser";
import { processLayer } from "./elementProcessor";
import { savePSDDataToStorage } from "./storage";
import { optimizeLayout } from "../ai/layoutOptimizer";

/**
 * Import a PSD file and extract elements from it
 * @param file The PSD file to import
 * @param selectedSize The selected banner size
 * @returns A promise resolving to an array of editor elements
 */
export const importPSDFile = async (
  file: File,
  selectedSize: BannerSize,
  activeSizes: BannerSize[] = []
): Promise<EditorElement[]> => {
  try {
    console.log("=== PSD IMPORT STARTED ===");
    console.log("Importing PSD file:", file.name);
    
    // Parse the PSD file
    const { psd, psdData, extractedImages } = await parsePSDFile(file);
    
    // Process each layer in the PSD
    const processedElements: EditorElement[] = [];
    const tree = psd.tree();
    
    console.log("Extracting elements from PSD layers...");
    
    // Process the root node and its children
    if (tree.children) {
      // Handle different PSD library implementations
      let children = [];
      if (typeof tree.children === 'function') {
        children = tree.children();
      } else {
        children = tree.children;
      }
      
      // Process each child layer to extract elements
      for (const layer of children) {
        const element = await processLayer(layer, selectedSize, psdData, extractedImages);
        if (element) {
          processedElements.push(element);
          
          // Log element creation
          console.log(`Created ${element.type} element from layer: ${layer.name || 'unnamed'}`);
        }
      }
    }
    
    // If we have descendant() function, use it to process all layers
    if (tree.descendants && typeof tree.descendants === 'function') {
      const allLayers = tree.descendants();
      
      for (const layer of allLayers) {
        // Skip group layers and already processed layers
        if ((layer.isGroup && layer.isGroup()) || 
            processedElements.some(el => el.id === `psd-${layer.name}`)) {
          continue;
        }
        
        const element = await processLayer(layer, selectedSize, psdData, extractedImages);
        if (element) {
          processedElements.push(element);
        }
      }
    }
    
    // Save PSD data to storage
    psdData.storageKey = `psd-import-${Date.now()}`;
    savePSDDataToStorage(psdData);
    
    console.log("Elements extracted:", processedElements.length);
    
    // For each active size, apply AI layout optimization
    let allOptimizedElements = [...processedElements];
    
    if (activeSizes.length > 0) {
      console.log("Applying AI layout optimization for all active sizes...");
      
      // For each active size that isn't the current one
      activeSizes.forEach(size => {
        if (size.name !== selectedSize.name) {
          // Create optimized elements for this size
          const optimizedElements = optimizeLayout(
            processedElements, 
            size, 
            selectedSize
          );
          
          // Set the correct size ID
          optimizedElements.forEach(element => {
            element.id = `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`;
            element.sizeId = size.name;
          });
          
          // Add to the collection
          allOptimizedElements = [...allOptimizedElements, ...optimizedElements];
        }
      });
    }
    
    // Log information about imported elements for debugging
    const textElements = allOptimizedElements.filter(el => el.type === 'text').length;
    const imageElements = allOptimizedElements.filter(el => el.type === 'image').length;
    const containerElements = allOptimizedElements.filter(el => el.type === 'container').length;
    
    console.log("FINAL IMPORT SUMMARY:");
    console.log("Total elements:", allOptimizedElements.length);
    console.log("Text elements:", textElements);
    console.log("Image elements:", imageElements);
    console.log("Container elements:", containerElements);
    
    return allOptimizedElements;
  } catch (error) {
    console.error("Error importing PSD file:", error);
    throw error;
  }
};
