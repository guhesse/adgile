
import PSD from 'psd.js';
import { toast } from 'sonner';
import { PSDFileData } from './types';
import { processImageLayers } from './layerDetection';

/**
 * Parse a PSD file and extract its structure
 * @param file The PSD file to parse
 * @returns A promise resolving to the parsed PSD data
 */
export const parsePSDFile = async (file: File): Promise<{
  psd: any;
  psdData: PSDFileData;
  extractedImages: Map<string, string>;
}> => {
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

        // Extract images from PSD
        const extractedImages: Map<string, string> = new Map();
        
        console.log("Processing PSD tree for images...");
        processImageLayers(psd.tree(), (imageData, nodeName) => {
          console.log(`Extracted image from node: ${nodeName}`);
          extractedImages.set(nodeName, imageData);
        });
        
        console.log(`Extracted ${extractedImages.size} images from PSD tree`);
        
        resolve({ psd, psdData, extractedImages });
      } catch (error) {
        console.error("Error parsing PSD file:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
