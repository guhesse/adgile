import PSD from 'psd.js';
import { toast } from 'sonner';
import { PSDFileData, TextLayerStyle } from './types';
import { processImageLayers } from './layerDetection';
import { extractTextLayerStyle } from './textExtractor';
import { logBasicPSDInfo, logTreeStructure } from './psdLogger';
import { getDescendants, processLayers } from './psdProcessor';

/**
 * Parse a PSD file and extract its structure
 * @param file The PSD file to parse
 * @returns A promise resolving to the parsed PSD data
 */
export const parsePSDFile = async (file: File): Promise<{
  psd: any;
  psdData: PSDFileData;
  extractedImages: Map<string, string>;
  textLayers: Map<string, TextLayerStyle>;
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

        logBasicPSDInfo(psd);

        const psdData: PSDFileData = {
          fileName: file.name,
          width: psd.header.width,
          height: psd.header.height,
          uploadDate: new Date().toISOString(),
          storageKey: '',
          layers: []
        };

        const extractedImages: Map<string, string> = new Map();
        const textLayers: Map<string, TextLayerStyle> = new Map();

        if (psd.tree && typeof psd.tree === 'function') {
          const tree = psd.tree();
          logTreeStructure(tree);

          const descendants = getDescendants(tree);
          processLayers(descendants, psdData, textLayers, extractedImages);

          if (extractedImages.size === 0) {
            await processImageLayers(tree, (imageData, nodeName) => {
              extractedImages.set(nodeName, imageData);
            });
          }
        }

        resolve({ psd, psdData, extractedImages, textLayers });
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
