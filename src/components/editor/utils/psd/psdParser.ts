
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
          uploadDate: new Date().toISOString(),
          storageKey: '',
          layers: []
        };

        // Extract images from PSD
        const extractedImages: Map<string, string> = new Map();
        
        console.log("Processing PSD tree for images...");
        
        // First try the direct approach similar to the example code
        if (psd.tree && typeof psd.tree === 'function') {
          const tree = psd.tree();
          console.log("PSD tree obtained:", tree);
          
          if (tree.descendants && typeof tree.descendants === 'function') {
            console.log("Processing tree descendants");
            const descendants = tree.descendants();
            
            for (const node of descendants) {
              try {
                if (!node.isGroup()) {
                  console.log(`Processing node: ${node.name}`);
                  
                  if (node.layer && node.layer.image) {
                    try {
                      console.log(`Extracting image from node: ${node.name}`);
                      const png = node.layer.image.toPng();
                      
                      if (png) {
                        const imageData = png.src || png;
                        console.log(`Successfully extracted image from node: ${node.name}`);
                        extractedImages.set(node.name, imageData);
                      }
                    } catch (nodeError) {
                      console.error(`Error processing direct extraction for node ${node.name}:`, nodeError);
                    }
                  }
                }
              } catch (error) {
                console.error(`Error processing node:`, error);
              }
            }
          }
          
          // If no images were extracted using the direct approach, use our fallback
          if (extractedImages.size === 0) {
            console.log("No images extracted with direct approach, using fallback method");
            await processImageLayers(tree, (imageData, nodeName) => {
              console.log(`Extracted image from node: ${nodeName}`);
              extractedImages.set(nodeName, imageData);
            });
          }
        }
        
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
