import PSD from 'psd.js';
import { toast } from 'sonner';
import { PSDFileData, TextLayerStyle } from './types';
import { processImageLayers } from './layerDetection';
import { extractTextLayerStyle } from './textExtractor';

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
        // Store text layers and their styles
        const textLayers: Map<string, TextLayerStyle> = new Map();

        console.log("Processing PSD tree for images and text layers...");

        // First try the direct approach similar to the example code
        if (psd.tree && typeof psd.tree === 'function') {
          const tree = psd.tree();
          console.log("PSD tree obtained:", tree);

          // Log the full tree structure recursively to identify text layers
          console.log("====== COMPLETE PSD TREE STRUCTURE ======");
          logLayerTree(tree, 0);

          if (tree.descendants && typeof tree.descendants === 'function') {
            console.log("Processing tree descendants");
            const descendants = tree.descendants();

            // Log all text layers specifically
            console.log("====== TEXT LAYERS DETAILS ======");
            for (const node of descendants) {
              try {
                // O importante é verificar se a camada possui typeTool
                const hasTypeTool = node.layer && node.layer.typeTool;

                if (hasTypeTool) {
                  console.log(`Text Layer Found: ${node.name}`);
                  logTextLayerDetails(node);

                  // Extrair informações de texto e estilo
                  try {
                    // Executar a função typeTool() para obter os dados de texto
                    const textData = node.layer.typeTool();
                    console.log("Text data obtained:", textData);

                    // Log adicional para ajudar a debugar a estrutura
                    console.log("Text data structure:", JSON.stringify(textData, null, 2));
                    
                    // Tentar acessar métodos auxiliares da biblioteca
                    if (textData) {
                      console.log("Explorando métodos auxiliares do textData:");
                      if (typeof textData.fonts === 'function') console.log("Fonts:", textData.fonts());
                      if (typeof textData.sizes === 'function') console.log("Sizes:", textData.sizes());
                      if (typeof textData.colors === 'function') console.log("Colors:", textData.colors());
                      if (typeof textData.alignment === 'function') console.log("Alignment:", textData.alignment());
                      if (textData.textValue) console.log("Text Value:", textData.textValue);
                      if (textData.engineData) console.log("Engine Data Available:", Object.keys(textData.engineData));
                    }

                    // Extrair estilo de texto a partir dos dados
                    const textStyle = extractTextLayerStyle(textData, node);

                    if (textStyle) {
                      textLayers.set(node.name, textStyle);

                      // Adicionar à estrutura de dados PSD
                      psdData.layers.push({
                        id: generateLayerId(node.name),
                        name: node.name,
                        type: 'text',
                        x: node.left || 0,
                        y: node.top || 0,
                        width: (node.right || 0) - (node.left || 0),
                        height: (node.bottom || 0) - (node.top || 0),
                        textContent: textStyle.text || '',
                        textStyle: textStyle
                      });
                    }
                  } catch (textError) {
                    console.error(`Error extracting text data from ${node.name}:`, textError);
                  }
                }

                // Check if this is a text layer using the get method as fallback
                const isText = !hasTypeTool && node.get && typeof node.get === 'function' && node.get('typeTool');
                if (isText) {
                  console.log(`Text Layer Found via get() method: ${node.name}`);

                  // Log all available properties and text-related data
                  logTextLayerDetails(node);

                  // Extrair estilo de texto desta camada
                  const typeToolData = node.get('typeTool');
                  const textStyle = extractTextLayerStyle(typeToolData, node);

                  if (textStyle) {
                    textLayers.set(node.name, textStyle);

                    psdData.layers.push({
                      id: generateLayerId(node.name),
                      name: node.name,
                      type: 'text',
                      x: node.left || 0,
                      y: node.top || 0,
                      width: (node.right || 0) - (node.left || 0),
                      height: (node.bottom || 0) - (node.top || 0),
                      textContent: textStyle.text || '',
                      textStyle: textStyle
                    });
                  }
                }

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

        console.log(`Extracted ${extractedImages.size} images and ${textLayers.size} text layers from PSD tree`);

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

/**
 * Recursively log the PSD layer tree structure
 * @param node The current node to log
 * @param depth The current depth in the tree
 */
function logLayerTree(node: any, depth: number) {
  const indent = ' '.repeat(depth * 2);

  if (!node) {
    console.log(`${indent}[NULL NODE]`);
    return;
  }

  // Log node basic information
  console.log(`${indent}Layer: ${node.name || 'unnamed'} (${node.type || 'unknown type'})`);

  // If it's a text node, log detailed text information
  if (node.text) {
    console.log(`${indent}  [TEXT LAYER]`);
    if (typeof node.text === 'function') {
      try {
        const textData = node.text();
        console.log(`${indent}  Text Function Result:`, textData);
      } catch (e) {
        console.log(`${indent}  Error getting text function result:`, e);
      }
    } else {
      console.log(`${indent}  Text Object:`, node.text);
    }
  }

  // If node has typeTool data, log it
  if (node.typeTool) {
    console.log(`${indent}  [TYPE TOOL DATA]`);
    if (typeof node.typeTool === 'function') {
      try {
        const typeToolData = node.typeTool();
        console.log(`${indent}  TypeTool Function Result:`, typeToolData);
      } catch (e) {
        console.log(`${indent}  Error getting typeTool function result:`, e);
      }
    } else {
      console.log(`${indent}  TypeTool Object:`, node.typeTool);
    }
  }

  // If node has adjustments with typeTool, log that too
  if (node.adjustments && node.adjustments.typeTool) {
    console.log(`${indent}  [ADJUSTMENTS TYPE TOOL]`);
    if (typeof node.adjustments.typeTool === 'function') {
      try {
        const adjustmentsTypeToolData = node.adjustments.typeTool();
        console.log(`${indent}  Adjustments TypeTool Function Result:`, adjustmentsTypeToolData);
      } catch (e) {
        console.log(`${indent}  Error getting adjustments typeTool function result:`, e);
      }
    } else {
      console.log(`${indent}  Adjustments TypeTool Object:`, node.adjustments.typeTool);
    }
  }

  // Recursively log children
  if (node.children && node.children.length > 0) {
    console.log(`${indent}Children (${node.children.length}):`);
    node.children.forEach((child: any) => logLayerTree(child, depth + 1));
  }
}

/**
 * Log detailed information about a text layer
 * @param node The text layer node
 */
function logTextLayerDetails(node: any) {
  console.log(`\n===== TEXT LAYER: ${node.name} =====`);

  // Try different ways to access text data
  console.log("ALL AVAILABLE PROPERTIES:", Object.keys(node));

  // Check for 'text' property (as object or function)
  if (node.text) {
    console.log("TEXT PROPERTY FOUND:");
    if (typeof node.text === 'function') {
      try {
        const textFnResult = node.text();
        console.log("Text Function Result:", textFnResult);
      } catch (e) {
        console.log("Error calling text function:", e);
      }
    } else {
      console.log("Text Object:", node.text);
    }
  } else {
    console.log("No 'text' property found");
  }

  // Check for layer.typeTool data - importante usar como função
  if (node.layer && node.layer.typeTool) {
    console.log("LAYER TYPETOOL PROPERTY FOUND:");
    if (typeof node.layer.typeTool === 'function') {
      try {
        const typeToolFnResult = node.layer.typeTool();
        console.log("Layer TypeTool Function Result:", typeToolFnResult);

        // Examine engineData structure
        if (typeToolFnResult && typeToolFnResult.engineData) {
          console.log("ENGINE DATA FOUND:");
          
          // Tentar acessar informações de fonte
          if (typeToolFnResult.engineData.ResourceDict) {
            console.log("Font Resources:", typeToolFnResult.engineData.ResourceDict);
          }
          
          // Tentar acessar informações de estilo
          if (typeToolFnResult.engineData.EngineDict && 
              typeToolFnResult.engineData.EngineDict.StyleRun) {
            console.log("Style Information:", typeToolFnResult.engineData.EngineDict.StyleRun);
          }
        }

        // Testar métodos auxiliares
        if (typeof typeToolFnResult.fonts === 'function') {
          console.log("Fonts:", typeToolFnResult.fonts());
        }
        if (typeof typeToolFnResult.sizes === 'function') {
          console.log("Sizes:", typeToolFnResult.sizes());
        }
        if (typeof typeToolFnResult.colors === 'function') {
          console.log("Colors:", typeToolFnResult.colors());
        }
        if (typeof typeToolFnResult.alignment === 'function') {
          console.log("Alignment:", typeToolFnResult.alignment());
        }
      } catch (e) {
        console.log("Error calling layer.typeTool function:", e);
      }
    } else {
      console.log("Layer TypeTool is not a function. This is unexpected:", node.layer.typeTool);
    }
  } else {
    console.log("No 'layer.typeTool' property found");
  }

  // Check for node.typeTool data
  if (node.typeTool) {
    console.log("NODE TYPETOOL PROPERTY FOUND:");
    if (typeof node.typeTool === 'function') {
      try {
        const typeToolFnResult = node.typeTool();
        console.log("Node TypeTool Function Result:", typeToolFnResult);
      } catch (e) {
        console.log("Error calling node.typeTool function:", e);
      }
    } else {
      console.log("Node TypeTool is not a function:", node.typeTool);
    }
  }

  // Check if node has 'get' method to retrieve typeTool object
  if (node.get && typeof node.get === 'function') {
    try {
      const typeTool = node.get('typeTool');
      if (typeTool) {
        console.log("TypeTool from get() method found:");
        
        // Se typeTool é uma função, executá-la
        if (typeof typeTool === 'function') {
          try {
            const typeToolData = typeTool();
            console.log("TypeTool data from get() method:", typeToolData);
          } catch (e) {
            console.log("Error executing typeTool from get() method:", e);
          }
        } else {
          console.log("TypeTool from get() is not a function:", typeTool);
        }
      } else {
        console.log("No typeTool found via get() method");
      }
    } catch (e) {
      console.log("Error getting typeTool via get() method:", e);
    }
  }

  // Log node position and dimensions
  console.log("Position and Dimensions:");
  console.log(`X: ${node.left || 0}, Y: ${node.top || 0}`);
  console.log(`Width: ${(node.right || 0) - (node.left || 0)}, Height: ${(node.bottom || 0) - (node.top || 0)}`);

  console.log("=========================================\n");
}

/**
 * Generate a unique ID for a layer
 * @param name The layer name
 * @returns A unique ID
 */
function generateLayerId(name: string): string {
  return `layer_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now().toString(36)}`;
}
