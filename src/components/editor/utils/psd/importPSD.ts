
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

        // More detailed layer debugging
        console.log("=== DETAILED LAYER INFO ===");
        console.log("Layers count:", psd.layers.length);
        
        // NEW: Add more detailed text layer detection debug info
        console.log("=== TEXT LAYER DETECTION DEBUG ===");
        psd.layers.forEach((layer, index) => {
          console.log(`\n--- LAYER ${index}: "${layer.name || 'unnamed'}" ---`);
          
          // Check for text layer indicators
          const hasTypeTool = layer.adjustments && layer.adjustments.typeTool;
          const hasTyShKey = layer.infoKeys && layer.infoKeys.includes('TySh');
          const hasTypeToolFunction = typeof layer.typeTool === 'function';
          const isTextType = layer.type === 'text' || layer.type === 'type' || layer.type === 'TextLayer';
          
          console.log(`Text layer indicators for "${layer.name || 'unnamed'}":`);
          console.log(`- Has adjustments.typeTool: ${hasTypeTool ? 'YES' : 'NO'}`);
          console.log(`- Has 'TySh' in infoKeys: ${hasTyShKey ? 'YES' : 'NO'}`);
          console.log(`- Has typeTool function: ${hasTypeToolFunction ? 'YES' : 'NO'}`);
          console.log(`- Is text by type property: ${isTextType ? 'YES' : 'NO'}`);
          console.log(`- Has legacyName: ${layer.legacyName ? 'YES' : 'NO'}`);
          
          if (hasTypeTool) {
            console.log(`- typeTool details:`, layer.adjustments.typeTool);
          }
          
          if (hasTypeToolFunction) {
            try {
              const typeToolData = layer.typeTool();
              console.log(`- typeTool() result:`, typeToolData);
              
              if (typeToolData && typeToolData.textData) {
                console.log(`- Text content from typeTool:`, typeToolData.textData.text);
                console.log(`- Text styling:`, {
                  font: typeToolData.textData.fontName,
                  fontSize: typeToolData.textData.fontSize,
                  color: typeToolData.textData.color,
                  alignment: typeToolData.textData.justification
                });
              }
            } catch (err) {
              console.log(`- Error calling typeTool():`, err);
            }
          }
          
          // Check layer type using our detection function
          const detectedType = detectLayerType(layer);
          console.log(`- Detected layer type: ${detectedType}`);
        });
        
        psd.layers.forEach((layer, index) => {
          console.log(`\n--- LAYER ${index}: "${layer.name}" ---`);
          console.log("Layer object:", layer);
          
          // Try to log all the properties of the layer
          console.log("Layer properties:");
          for (const prop in layer) {
            try {
              const value = typeof layer[prop] === 'function' 
                ? '[Function]' 
                : layer[prop];
              console.log(`- ${prop}:`, value);
            } catch (err) {
              console.log(`- ${prop}: [Error accessing property]`);
            }
          }
          
          // Log additional layer info
          if (layer.export) {
            try {
              const exported = layer.export();
              console.log("Exported layer data:", exported);
              
              // Log dimensions and position
              console.log("- Position:", {
                top: exported.top,
                left: exported.left,
                bottom: exported.bottom,
                right: exported.right,
                width: exported.width,
                height: exported.height
              });
            } catch (err) {
              console.log("Error exporting layer:", err);
            }
          }
          
          // Try to log text data if it exists
          if (layer.text || (layer.get && typeof layer.get === 'function')) {
            console.log("Text data:");
            try {
              if (typeof layer.text === 'function') {
                console.log("- text() result:", layer.text());
              } else if (layer.text) {
                console.log("- text property:", layer.text);
              }
              
              try {
                const typeTool = layer.get && layer.get('typeTool');
                console.log("- typeTool:", typeTool);
              } catch (e) {
                console.log("- Error accessing typeTool:", e);
              }
            } catch (err) {
              console.log("Error accessing text data:", err);
            }
          }
          
          // Try to log image/canvas data if it exists
          try {
            console.log("Image/canvas data:");
            if (typeof layer.canvas === 'function') {
              console.log("- canvas() available: Yes");
            }
            if (layer.toPng && typeof layer.toPng === 'function') {
              console.log("- toPng() available: Yes");
            }
            if (layer.image) {
              console.log("- image property available: Yes");
            }
          } catch (err) {
            console.log("Error checking image data:", err);
          }
          
          console.log("--- END LAYER INFO ---");
        });
        
        // Tree structure
        console.log("Tree structure:", psd.tree().export());
        console.log("Layers count:", psd.layers.length);
        
        // Continue with existing processing...
        // ... keep existing code (layer processing and element creation)
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
