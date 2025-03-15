
import PSD from 'psd.js';
import { EditorElement, BannerSize } from '../../types';
import { toast } from 'sonner';
import { createNewElement } from '../../context/elements';
import { detectLayerType } from './layerDetection';
import { createTextElement, createImageElement, createFallbackElement } from './elementCreation';

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
        console.log("Tree structure:", psd.tree().export());
        console.log("Layers count:", psd.layers.length);
        
        // Log detailed layer information
        console.log("DETAILED LAYER INFO:");
        psd.layers.forEach((layer, index) => {
          console.log(`Layer ${index}: Name: "${layer.name}"`);
          console.log(`Layer ${index}: Type:`, layer.type);
          
          if (layer.export) {
            const exported = layer.export();
            console.log(`Layer ${index}: Export data:`, exported);
          }
          
          console.log(`Layer ${index}: Is group?`, layer.isGroup && layer.isGroup());
          console.log(`Layer ${index}: Is root?`, layer.isRoot && layer.isRoot());
          
          console.log(`--------------------------------`);
        });
        
        const elements: EditorElement[] = [];
        
        // Process all layers directly from the PSD file
        console.log("Direct layer processing mode...");
        
        for (const layer of psd.layers) {
          try {
            console.log(`Direct processing layer: ${layer.name || 'unnamed'}`);
            console.log(`Layer type:`, layer.type);
            
            // Additional debug information
            console.log(`Is group layer?`, layer.isGroup && layer.isGroup());
            
            if (layer.export) {
              try {
                const exportData = layer.export();
                console.log(`Layer export data:`, exportData);
                
                // Check layer type
                const layerType = detectLayerType(layer);
                console.log(`Detected layer type: ${layerType}`);
                
                if (!layer.hidden || (typeof layer.hidden === 'function' && !layer.hidden())) {
                  if (layerType === 'text') {
                    console.log(`DIRECT: Creating text element for ${layer.name || 'unnamed'}`);
                    const textElement = await createTextElement(layer, selectedSize);
                    if (textElement) {
                      console.log(`DIRECT: Created text element from layer: ${layer.name}`, textElement);
                      elements.push(textElement);
                    }
                  } else if (layerType === 'image') {
                    console.log(`DIRECT: Creating image element for ${layer.name || 'unnamed'}`);
                    const imageElement = await createImageElement(layer, selectedSize);
                    if (imageElement) {
                      console.log(`DIRECT: Created image element from layer: ${layer.name}`, imageElement);
                      elements.push(imageElement);
                    }
                  } else {
                    console.log(`DIRECT: Creating fallback element for ${layer.name || 'unnamed'}`);
                    const fallbackElement = createFallbackElement(layer, selectedSize);
                    if (fallbackElement) {
                      console.log(`DIRECT: Created fallback element from layer: ${layer.name}`);
                      elements.push(fallbackElement);
                    }
                  }
                } else {
                  console.log(`DIRECT: Skipping hidden layer: ${layer.name || 'unnamed'}`);
                }
              } catch (err) {
                console.log(`Error exporting layer:`, err);
              }
            }
          } catch (layerError) {
            console.error(`Error processing direct layer ${layer?.name || 'unnamed'}:`, layerError);
          }
        }
        
        console.log("After direct processing, elements count:", elements.length);
        
        // Calculate percentage values and set unique IDs
        elements.forEach((element, index) => {
          element.style.xPercent = (element.style.x / selectedSize.width) * 100;
          element.style.yPercent = (element.style.y / selectedSize.height) * 100;
          element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
          element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
          
          const timestamp = Date.now();
          element.id = `${timestamp}-${index}-${selectedSize.name}`;
        });
        
        const textElements = elements.filter(el => el.type === 'text').length;
        const imageElements = elements.filter(el => el.type === 'image').length;
        const containerElements = elements.filter(el => el.type === 'container').length;
        
        console.log("FINAL IMPORT SUMMARY:");
        console.log("Total elements:", elements.length);
        console.log("Text elements:", textElements);
        console.log("Image elements:", imageElements);
        console.log("Container elements:", containerElements);
        console.log("Element types breakdown:", elements.map(el => el.type));
        
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
