
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
          
          // NEW: Log the RAW tree data for better debugging
          console.log("====== RAW PSD TREE DATA ======");
          console.log(JSON.stringify(tree, null, 2));
          
          // Log the full tree structure recursively to identify text layers
          console.log("====== COMPLETE PSD TREE STRUCTURE ======");
          logLayerTree(tree, 0);
          
          // NEW: Special text layer debugging
          console.log("====== TEXT LAYER EXTRACTION TESTING ======");
          recursivelyFindTextLayers(tree);
          
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
                  
                  // NEW: Try to extract text with the format we're looking for
                  debugTextLayerFormat(node);
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
 * Recursively search for text layers in the PSD tree
 * @param node The current node to check
 */
function recursivelyFindTextLayers(node: any) {
  // Check if current node is a text layer through various methods
  if (node) {
    const nodeName = node.name || 'unnamed';
    // Check for any text-related properties
    const hasText = node.text || 
                   (node.get && node.get('typeTool')) || 
                   (node.typeTool) || 
                   (node.adjustments && node.adjustments.typeTool) ||
                   (node.type && node.type.toLowerCase().includes('text'));
    
    if (hasText) {
      console.log(`\n===== FOUND TEXT LAYER: ${nodeName} =====`);
      
      // Try all possible ways to extract text content and styling
      
      // Method 1: Direct text property
      if (node.text) {
        console.log("METHOD 1: Direct text property");
        console.log("text property type:", typeof node.text);
        
        if (typeof node.text === 'function') {
          try {
            const textResult = node.text();
            console.log("Text function result:", textResult);
          } catch (e) {
            console.log("Error calling text function:", e);
          }
        } else {
          // This is the format we're looking for! 
          // { value: 'text', font: { name: 'font', sizes: [], colors: [], alignment: [] }}
          console.log("Text object:", node.text);
          
          if (node.text.value) {
            console.log("TEXT CONTENT FROM VALUE:", node.text.value);
          }
          
          if (node.text.font) {
            console.log("FONT INFO FROM TEXT.FONT:");
            console.log("Font name:", node.text.font.name);
            console.log("Font sizes:", node.text.font.sizes);
            console.log("Font colors:", node.text.font.colors);
            console.log("Font alignment:", node.text.font.alignment);
          }
        }
      }
      
      // Method 2: Using get('typeTool')
      if (node.get && typeof node.get === 'function') {
        console.log("METHOD 2: Using get('typeTool')");
        try {
          const typeTool = node.get('typeTool');
          console.log("TypeTool result:", typeTool);
          
          // Check for any text properties
          if (typeTool) {
            if (typeTool.fonts) console.log("Fonts from typeTool:", typeTool.fonts);
            if (typeTool.text) console.log("Text from typeTool:", typeTool.text);
            if (typeTool.textData) console.log("TextData from typeTool:", typeTool.textData);
          }
        } catch (e) {
          console.log("Error using get('typeTool'):", e);
        }
      }
      
      // Method 3: Using typeTool function
      if (node.typeTool) {
        console.log("METHOD 3: Using typeTool property/function");
        if (typeof node.typeTool === 'function') {
          try {
            const typeToolResult = node.typeTool();
            console.log("TypeTool function result:", typeToolResult);
            
            // Look for useful properties
            if (typeToolResult) {
              if (typeToolResult.textData) {
                console.log("TextData from typeTool():", typeToolResult.textData);
                
                // Extract specific font information
                const textData = typeToolResult.textData;
                if (textData.fontName) console.log("Font name:", textData.fontName);
                if (textData.fontSize) console.log("Font size:", textData.fontSize);
                if (textData.fontFace) console.log("Font face:", textData.fontFace);
                if (textData.color) console.log("Font color:", textData.color);
              }
              
              if (typeToolResult.text) {
                console.log("Text from typeTool():", typeToolResult.text);
              }
            }
          } catch (e) {
            console.log("Error calling typeTool function:", e);
          }
        } else {
          console.log("TypeTool object:", node.typeTool);
        }
      }
      
      // Method 4: Check for info in adjustments
      if (node.adjustments && node.adjustments.typeTool) {
        console.log("METHOD 4: Using adjustments.typeTool");
        if (typeof node.adjustments.typeTool === 'function') {
          try {
            const adjustTypeToolResult = node.adjustments.typeTool();
            console.log("Adjustments typeTool function result:", adjustTypeToolResult);
          } catch (e) {
            console.log("Error calling adjustments.typeTool function:", e);
          }
        } else {
          console.log("Adjustments typeTool object:", node.adjustments.typeTool);
        }
      }
      
      // Method 5: Check raw layer object
      if (node.layer) {
        console.log("METHOD 5: Examining raw layer object");
        console.log("Layer object keys:", Object.keys(node.layer));
        
        // Look for text-related properties in layer
        if (node.layer.text) console.log("Layer.text:", node.layer.text);
        if (node.layer.textInfo) console.log("Layer.textInfo:", node.layer.textInfo);
        if (node.layer.textData) console.log("Layer.textData:", node.layer.textData);
        if (node.layer.styles) console.log("Layer.styles:", node.layer.styles);
        if (node.layer.font) console.log("Layer.font:", node.layer.font);
      }
      
      // Method 6: Check for textInfo property
      if (node.textInfo) {
        console.log("METHOD 6: Using textInfo property");
        console.log("TextInfo:", node.textInfo);
      }
      
      // Method 7: Check for export() data
      try {
        const exportData = node.export ? node.export() : null;
        if (exportData) {
          console.log("METHOD 7: Export data for text layer");
          console.log("Export data:", exportData);
          
          // Look for text-related properties
          if (exportData.text) console.log("Export text:", exportData.text);
          if (exportData.textInfo) console.log("Export textInfo:", exportData.textInfo);
          if (exportData.font) console.log("Export font:", exportData.font);
        }
      } catch (e) {
        console.log("Error exporting layer:", e);
      }
      
      // Method 8: Other node properties that might contain text info
      const possibleTextProperties = [
        'textElement', 'textValue', 'fontInfo', 'styleInfo', 
        'textDescriptor', 'textStyle', 'fontStyle'
      ];
      
      console.log("METHOD 8: Checking other possible text properties");
      for (const prop of possibleTextProperties) {
        if (node[prop]) {
          console.log(`Property ${prop}:`, node[prop]);
        }
      }
      
      console.log("=========================================");
    }
    
    // Recursively process children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        recursivelyFindTextLayers(child);
      });
    }
  }
}

/**
 * Attempt to extract text in the specific format we're looking for
 * @param node The node to extract text from
 */
function debugTextLayerFormat(node: any) {
  console.log(`\n===== DEBUGGING TEXT FORMAT FOR: ${node.name} =====`);
  
  // Try to construct the format we're looking for
  const textFormat = {
    value: '',
    font: {
      name: '',
      sizes: [],
      colors: [],
      alignment: []
    }
  };
  
  let foundValue = false;
  let foundFont = false;
  
  // Step 1: Try to find text value
  if (node.text && typeof node.text === 'object' && node.text.value) {
    textFormat.value = node.text.value;
    foundValue = true;
    console.log("Found text.value:", node.text.value);
  } else if (node.get && typeof node.get === 'function') {
    try {
      const typeTool = node.get('typeTool');
      if (typeTool && typeTool.text) {
        textFormat.value = typeTool.text;
        foundValue = true;
        console.log("Found typeTool.text:", typeTool.text);
      }
    } catch (e) {}
  } else if (node.typeTool && typeof node.typeTool === 'function') {
    try {
      const typeToolData = node.typeTool();
      if (typeToolData) {
        if (typeToolData.text) {
          textFormat.value = typeToolData.text;
          foundValue = true;
          console.log("Found typeTool().text:", typeToolData.text);
        } else if (typeToolData.textData && typeToolData.textData.text) {
          textFormat.value = typeToolData.textData.text;
          foundValue = true;
          console.log("Found typeTool().textData.text:", typeToolData.textData.text);
        }
      }
    } catch (e) {}
  }
  
  // Step 2: Try to find font information
  // Method A: From text.font
  if (node.text && node.text.font) {
    console.log("Found text.font:", node.text.font);
    
    if (node.text.font.name) {
      textFormat.font.name = node.text.font.name;
      foundFont = true;
      console.log("Found font name:", node.text.font.name);
    }
    
    if (node.text.font.sizes && Array.isArray(node.text.font.sizes)) {
      textFormat.font.sizes = node.text.font.sizes;
      console.log("Found font sizes:", node.text.font.sizes);
    }
    
    if (node.text.font.colors && Array.isArray(node.text.font.colors)) {
      textFormat.font.colors = node.text.font.colors;
      console.log("Found font colors:", node.text.font.colors);
    }
    
    if (node.text.font.alignment && Array.isArray(node.text.font.alignment)) {
      textFormat.font.alignment = node.text.font.alignment;
      console.log("Found font alignment:", node.text.font.alignment);
    }
  }
  
  // Method B: From typeTool
  if (!foundFont && node.typeTool && typeof node.typeTool === 'function') {
    try {
      const typeToolData = node.typeTool();
      console.log("TypeTool data for font extraction:", typeToolData);
      
      if (typeToolData && typeToolData.textData) {
        const textData = typeToolData.textData;
        
        if (textData.fontName) {
          textFormat.font.name = textData.fontName;
          foundFont = true;
          console.log("Found font name from typeTool:", textData.fontName);
        }
        
        if (textData.fontSize) {
          textFormat.font.sizes = [textData.fontSize];
          console.log("Found font size from typeTool:", textData.fontSize);
        }
        
        if (textData.color) {
          textFormat.font.colors = [textData.color];
          console.log("Found font color from typeTool:", textData.color);
        }
        
        if (textData.justification) {
          textFormat.font.alignment = [textData.justification];
          console.log("Found alignment from typeTool:", textData.justification);
        }
      }
    } catch (e) {
      console.log("Error extracting font data from typeTool:", e);
    }
  }
  
  // Output the final structure
  if (foundValue || foundFont) {
    console.log("\nCONSTRUCTED TEXT FORMAT:");
    console.log(JSON.stringify(textFormat, null, 2));
    
    // Check if matches what we're looking for
    const hasCorrectStructure = 
      textFormat.value && 
      textFormat.font.name && 
      textFormat.font.sizes.length > 0 && 
      textFormat.font.colors.length > 0;
    
    console.log("Has correct structure:", hasCorrectStructure);
  } else {
    console.log("Could not extract text in expected format");
  }
  
  console.log("==========================================\n");
}

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

