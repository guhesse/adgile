
import { BannerSize, EditorElement } from "../../types";
import { parsePSDFile } from "./psdParser";
import { processLayer } from "./elementProcessor";
import { toast } from "sonner";

export const importPSDFile = async (
  file: File,
  selectedSize: BannerSize
): Promise<EditorElement[]> => {
  try {
    // Parse the PSD file
    const parsedData = await parsePSDFile(file);
    
    const elements: EditorElement[] = [];
    
    // Extract layers from the PSD file
    if (parsedData.psd && parsedData.psd.tree && typeof parsedData.psd.tree === 'function') {
      const tree = parsedData.psd.tree();
      
      // Process regular layers
      if (tree.children && tree.children.length > 0) {
        for (const layer of tree.children) {
          try {
            // Skip if layer is a group or is hidden
            if ((layer.isGroup && layer.isGroup()) || (layer.hidden && layer.hidden())) {
              continue;
            }
            
            const element = await processLayer(layer, selectedSize, parsedData.psdData, parsedData.extractedImages);
            if (element) {
              elements.push(element);
            }
          } catch (layerError) {
            console.error(`Error processing layer ${layer?.name || 'unnamed'}:`, layerError);
          }
        }
      }
    }
    
    // Make sure elements stay within the boundaries
    elements.forEach(element => {
      // Ensure all elements have the 'global' sizeId
      element.sizeId = 'global';
      
      // If element extends beyond right edge
      if (element.style.x + element.style.width > selectedSize.width) {
        // If wider than canvas, resize it
        if (element.style.width > selectedSize.width) {
          element.style.width = selectedSize.width * 0.9;
        }
        // Position correctly
        element.style.x = Math.min(element.style.x, selectedSize.width - element.style.width);
      }
      
      // If element extends beyond bottom edge
      if (element.style.y + element.style.height > selectedSize.height) {
        // If taller than canvas, resize it
        if (element.style.height > selectedSize.height) {
          element.style.height = selectedSize.height * 0.9;
        }
        // Position correctly
        element.style.y = Math.min(element.style.y, selectedSize.height - element.style.height);
      }
      
      // Set percentage-based positions for responsive handling
      element.style.xPercent = (element.style.x / selectedSize.width) * 100;
      element.style.yPercent = (element.style.y / selectedSize.height) * 100;
      element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
      element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
    });
    
    return elements;
  } catch (error) {
    console.error("Error importing PSD:", error);
    toast.error("Erro ao processar o arquivo PSD");
    return [];
  }
};
