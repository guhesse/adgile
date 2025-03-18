
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
                // Check if this is a text layer
                const isText = node.get && node.get('typeTool');
                if (isText) {
                  console.log(`Text Layer Found: ${node.name}`);
                  // Log all available properties and text-related data
                  logTextLayerDetails(node);
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
  
  // Check for typeTool data
  if (node.typeTool) {
    console.log("TYPETOOL PROPERTY FOUND:");
    if (typeof node.typeTool === 'function') {
      try {
        const typeToolFnResult = node.typeTool();
        console.log("TypeTool Function Result:", typeToolFnResult);
        
        // Log specific font-related information if available
        if (typeToolFnResult && typeToolFnResult.textData) {
          console.log("FONT INFORMATION:");
          console.log("Font Name:", typeToolFnResult.textData.fontName);
          console.log("Font Size:", typeToolFnResult.textData.fontSize);
          console.log("Font Color:", typeToolFnResult.textData.color);
          console.log("Text:", typeToolFnResult.textData.text);
        }
      } catch (e) {
        console.log("Error calling typeTool function:", e);
      }
    } else {
      console.log("TypeTool Object:", node.typeTool);
    }
  } else {
    console.log("No 'typeTool' property found");
  }
  
  // Check for resource data which might contain font information
  if (node.resource && node.resource.data) {
    console.log("RESOURCE DATA FOUND:");
    console.log("Resource Data:", node.resource.data);
  }
  
  // Check if node has 'get' method to retrieve typeTool object
  if (node.get && typeof node.get === 'function') {
    try {
      const typeTool = node.get('typeTool');
      console.log("TypeTool from get() method:", typeTool);
    } catch (e) {
      console.log("Error getting typeTool via get() method:", e);
    }
  }
  
  // Try to get raw layer data
  if (node.layer) {
    console.log("LAYER PROPERTY FOUND:");
    console.log("Layer Object Keys:", Object.keys(node.layer));
    
    // Check for additional text-related properties
    if (node.layer.text) {
      console.log("Layer Text:", node.layer.text);
    }
    
    if (node.layer.typeTool) {
      console.log("Layer TypeTool:", node.layer.typeTool);
    }
    
    if (node.layer.textInfo) {
      console.log("Layer TextInfo:", node.layer.textInfo);
    }
  }
  
  console.log("=========================================\n");
}
