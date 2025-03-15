import PSD from 'psd.js';
import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { createNewElement } from '../../context/elements';
import { detectLayerType, processImageLayers } from './layerDetection';
import { createTextElement, createImageElement, createFallbackElement } from './elementCreation';

/**
 * Structure for storing PSD file data
 */
export interface PSDFileData {
  fileName: string;
  width: number;
  height: number;
  layers: {
    id: string;
    name: string;
    type: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    content?: string; // For text layers
    imageUrl?: string; // For image layers
  }[];
}

/**
 * Import a PSD file and convert it to editor elements
 * @param file The PSD file to import
 * @param selectedSize The selected banner size
 * @returns A promise resolving to an array of editor elements
 */
export const importPSDFile = (file: File, selectedSize: BannerSize): Promise<EditorElement[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      if (!e.target?.result) {
        toast.error("Failed to read the PSD file.");
        reject(new Error("Failed to read the PSD file."));
        return;
      }
      
      try {
        const buffer = e.target.result as ArrayBuffer;
        const psd = new PSD(new Uint8Array(buffer));
        await psd.parse();
        
        console.log("====== PSD PARSING DEBUG INFO ======");
        console.log("PSD parsed successfully");
        
        // Log full PSD structure in raw format
        console.log("=== FULL RAW PSD TREE STRUCTURE ===");
        const rawTree = psd.tree().export();
        console.log("Raw PSD Tree:", rawTree);
        
        // Log detailed information about the PSD file
        console.log("PSD Width:", psd.header.width);
        console.log("PSD Height:", psd.header.height);
        console.log("PSD Channels:", psd.header.channels);
        console.log("PSD BitDepth:", psd.header.depth);
        console.log("PSD ColorMode:", psd.header.mode);

        // Create a structure to store PSD information for database
        const psdData: PSDFileData = {
          fileName: file.name,
          width: psd.header.width,
          height: psd.header.height,
          layers: []
        };

        // Process layers directly from the PSD file
        const elements: EditorElement[] = [];
        const extractedImages: Map<string, string> = new Map();
        
        console.log("=== PROCESSING LAYERS ===");
        console.log("Layers count:", psd.layers.length);
        
        // Process the PSD tree to extract images first
        console.log("Processing PSD tree for images...");
        processImageLayers(psd.tree(), (imageData, nodeName) => {
          console.log(`Extracted image from node: ${nodeName}`);
          extractedImages.set(nodeName, imageData);
        });
        
        console.log(`Extracted ${extractedImages.size} images from PSD tree`);
        
        // Now process all layers
        for (const layer of psd.layers) {
          try {
            console.log(`Processing layer: ${layer.name || 'unnamed'}`);
            
            // Skip hidden layers
            if (layer.hidden && typeof layer.hidden !== 'function') continue;
            if (typeof layer.hidden === 'function' && layer.hidden()) continue;
            
            // Check layer type
            const layerType = detectLayerType(layer);
            console.log(`Detected layer type: ${layerType}`);
            
            // Create element based on type
            let element: EditorElement | null = null;
            
            if (layerType === 'text') {
              element = await createTextElement(layer, selectedSize);
              if (element) {
                console.log(`Created text element from layer: ${layer.name}`);
                elements.push(element);
                
                // Add to PSD data for database
                psdData.layers.push({
                  id: element.id,
                  name: layer.name || 'Text Layer',
                  type: 'text',
                  position: {
                    x: element.style.x,
                    y: element.style.y,
                    width: element.style.width,
                    height: element.style.height
                  },
                  content: element.content as string
                });
              }
            } else if (layerType === 'image') {
              element = await createImageElement(layer, selectedSize);
              if (element) {
                console.log(`Created image element from layer: ${layer.name}`);
                elements.push(element);
                
                // Add to PSD data for database
                psdData.layers.push({
                  id: element.id,
                  name: layer.name || 'Image Layer',
                  type: 'image',
                  position: {
                    x: element.style.x,
                    y: element.style.y,
                    width: element.style.width,
                    height: element.style.height
                  },
                  imageUrl: element.content as string
                });
              }
            } else {
              element = createFallbackElement(layer, selectedSize);
              if (element) {
                console.log(`Created fallback element from layer: ${layer.name}`);
                elements.push(element);
                
                // Add to PSD data for database
                psdData.layers.push({
                  id: element.id,
                  name: layer.name || 'Generic Layer',
                  type: 'container',
                  position: {
                    x: element.style.x,
                    y: element.style.y,
                    width: element.style.width,
                    height: element.style.height
                  }
                });
              }
            }
          } catch (layerError) {
            console.error(`Error processing layer ${layer?.name || 'unnamed'}:`, layerError);
          }
        }
        
        // Calculate percentage values and set unique IDs
        elements.forEach((element) => {
          element.style.xPercent = (element.style.x / selectedSize.width) * 100;
          element.style.yPercent = (element.style.y / selectedSize.height) * 100;
          element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
          element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
        });
        
        console.log("=== PSD DATA FOR DATABASE ===");
        console.log(JSON.stringify(psdData, null, 2));
        
        // This data could be sent to a database or localStorage
        // For now, we'll store it in localStorage as an example
        try {
          localStorage.setItem(`psd-import-${Date.now()}`, JSON.stringify(psdData));
          console.log("PSD data saved to localStorage");
        } catch (storageError) {
          console.error("Error saving PSD data to localStorage:", storageError);
        }
        
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
        
        resolve(elements);
      } catch (error) {
        console.error("Error parsing PSD file:", error);
        toast.error("Falha ao interpretar o arquivo PSD. Verifique se é um PSD válido.");
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Erro ao ler o arquivo.");
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Save PSD data to database or storage
 * This is a placeholder function that can be implemented when a database is available
 */
export const savePSDDataToStorage = async (psdData: PSDFileData): Promise<void> => {
  // This would be implemented when a proper database integration is available
  // For now, we're using localStorage in the importPSDFile function
  console.log("Saving PSD data to storage...");
  console.log(psdData);
  
  // Placeholder for actual database implementation
  // await db.psdFiles.add(psdData);
  
  return Promise.resolve();
};
