
import PSD from 'psd.js';
import { EditorElement, BannerSize } from '../types';
import { toast } from 'sonner';
import { createNewElement } from '../context/elements';

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
          
          // Determine if it's a text layer by checking name patterns (temporary approach)
          const hasTextIndicatorInName = /heading|h1|h2|h3|h4|h5|h6|paragraph|text|title|subtitle|button|label|caption/i.test(layer.name);
          console.log(`Layer ${index}: Has text indicators in name:`, hasTextIndicatorInName);
          
          if (layer.export) {
            const exported = layer.export();
            console.log(`Layer ${index}: Export data:`, exported);
            if (exported.type) {
              console.log(`Layer ${index}: Export type:`, exported.type);
            }
          }
          
          // Check for text content directly in the layer
          if (layer.text) {
            console.log(`Layer ${index}: Has text property`);
            if (typeof layer.text === 'function') {
              try {
                const textValue = layer.text();
                console.log(`Layer ${index}: Text function result:`, textValue);
              } catch (err) {
                console.log(`Layer ${index}: Error calling text() function:`, err);
              }
            } else {
              console.log(`Layer ${index}: Text value:`, layer.text);
            }
          }
          
          // Try to get typeTool information
          if (layer.get) {
            try {
              const typeTool = layer.get('typeTool');
              if (typeTool) {
                console.log(`Layer ${index}: Has typeTool:`, typeTool);
              }
            } catch (err) {
              console.log(`Layer ${index}: Error getting typeTool:`, err);
            }
          }
          
          // Log any additional info that might help identify text layers
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
                
                // Check if this is a text layer
                // For PSD.js, there are multiple ways to identify text layers
                const isText = isTextLayer(layer);
                console.log(`Is text layer? ${isText}`);
                
                if (!layer.hidden || (typeof layer.hidden === 'function' && !layer.hidden())) {
                  if (isText) {
                    console.log(`DIRECT: Creating text element for ${layer.name || 'unnamed'}`);
                    const textElement = await createTextElement(layer, selectedSize);
                    if (textElement) {
                      console.log(`DIRECT: Created text element from layer: ${layer.name}`, textElement);
                      elements.push(textElement);
                    }
                  } else if (shouldBeImageLayer(layer)) {
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

// Enhanced text layer detection - combines multiple approaches
const isTextLayer = (layer: any): boolean => {
  try {
    if (!layer) return false;
    
    console.log(`Checking text indicators for "${layer.name || 'unnamed'}" layer`);
    
    // Check 1: Direct type identification
    if (layer.type === 'type' || layer.type === 'text' || layer.type === 'TextLayer') {
      console.log(`Layer "${layer.name}" is text by type property: ${layer.type}`);
      return true;
    }
    
    // Check 2: Text patterns in layer name
    const textPatterns = /heading|h1|h2|h3|h4|h5|h6|paragraph|text|body|title|subtitle|button|label|caption/i;
    if (layer.name && textPatterns.test(layer.name)) {
      console.log(`Layer "${layer.name}" is text by name pattern`);
      return true;
    }
    
    // Check 3: Layer kind (3 is text in PSD spec)
    if (layer.info && layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layerKind: 3`);
      return true;
    }
    
    if (layer.layer && layer.layer.info && layer.layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is text by layer.info.layerKind: 3`);
      return true;
    }
    
    // Check 4: Export data
    if (layer.export && typeof layer.export === 'function') {
      try {
        const exportData = layer.export();
        
        if (exportData && (exportData.type === 'type' || exportData.type === 'text')) {
          console.log(`Layer "${layer.name}" is text by export().type: ${exportData.type}`);
          return true;
        }
        
        if (exportData && exportData.layerKind === 3) {
          console.log(`Layer "${layer.name}" is text by export().layerKind: 3`);
          return true;
        }
        
        // Check for text content in export data
        if (exportData && exportData.text) {
          console.log(`Layer "${layer.name}" is text - has text in export data`);
          return true;
        }
      } catch (err) {
        console.log(`Error exporting layer "${layer.name}":`, err);
      }
    }
    
    // Check 5: Text function or property
    if (layer.text) {
      console.log(`Layer "${layer.name}" has text property`);
      return true;
    }
    
    // Check 6: typeTool presence
    if (layer.get && typeof layer.get === 'function') {
      try {
        const typeTool = layer.get('typeTool');
        if (typeTool) {
          console.log(`Layer "${layer.name}" is text - has typeTool property`);
          return true;
        }
      } catch (err) {
        console.log(`Error getting typeTool from "${layer.name}":`, err);
      }
    }
    
    console.log(`Layer "${layer.name}" is NOT text - no text indicators found`);
    return false;
  } catch (error) {
    console.error(`Error in text layer detection for ${layer?.name || 'unnamed'}:`, error);
    return false;
  }
};

// Check if a layer should be treated as an image
const shouldBeImageLayer = (layer: any): boolean => {
  if (!layer) return false;
  
  // Skip group layers or layers without dimensions
  if (layer.isGroup && layer.isGroup()) return false;
  
  const exportData = layer.export();
  if (!exportData.width || !exportData.height || exportData.width <= 0 || exportData.height <= 0) {
    return false;
  }
  
  return true;
};

// Create a text element from a layer
const createTextElement = async (layer: any, selectedSize: BannerSize): Promise<EditorElement | null> => {
  try {
    console.log(`Creating text element for layer: ${layer.name || 'unnamed'}`);
    
    let exportData;
    try {
      exportData = layer.export();
      console.log(`Text layer export data:`, exportData);
    } catch (error) {
      console.error(`Error exporting text layer data:`, error);
      exportData = {
        width: 200,
        height: 50,
        left: 0,
        top: 0
      };
    }
    
    const { width, height, left, top } = exportData;
    
    const textElement = createNewElement('text', selectedSize);
    
    textElement.style.x = left || 0;
    textElement.style.y = top || 0;
    textElement.style.width = width > 0 ? width : 200;
    textElement.style.height = height > 0 ? height : 50;
    
    // Extract text content from the layer
    let textContent = '';
    
    // Try multiple approaches to extract text content
    if (layer.text && typeof layer.text === 'object' && layer.text.value) {
      // Direct text.value property
      textContent = layer.text.value;
      console.log(`Extracted text from text.value: ${textContent}`);
    } 
    else if (layer.text && typeof layer.text === 'function') {
      // Text function that returns text data
      try {
        const textData = layer.text();
        if (typeof textData === 'string') {
          textContent = textData;
          console.log(`Extracted text from text() function (string): ${textContent}`);
        } else if (textData && textData.value) {
          textContent = textData.value;
          console.log(`Extracted text from text().value: ${textContent}`);
        }
      } catch (e) {
        console.error("Error getting text content from text() function:", e);
      }
    }
    else if (layer.get && typeof layer.get === 'function') {
      // Try to get text from typeTool
      try {
        const typeTool = layer.get('typeTool');
        if (typeTool && typeTool.text) {
          textContent = typeTool.text;
          console.log(`Extracted text from typeTool: ${textContent}`);
        }
      } catch (e) {
        console.error("Error getting text from typeTool:", e);
      }
    }
    
    // If we still don't have text content, extract from layer name as fallback
    if (!textContent || textContent.trim() === '') {
      // For layers that have text indicators in their name, use the name without the prefix
      const nameWithoutPrefix = layer.name.replace(/^(heading|h1|h2|h3|paragraph|text|title|subtitle)\s*/i, '');
      textContent = nameWithoutPrefix || layer.name;
      console.log(`Using layer name as text content: ${textContent}`);
    }
    
    textElement.content = textContent;
    
    // Try to extract text styling
    try {
      if (layer.text && layer.text.font) {
        textElement.style.fontFamily = layer.text.font;
      }
      
      if (layer.text && layer.text.fontSize) {
        textElement.style.fontSize = parseInt(layer.text.fontSize, 10);
      }
      
      if (layer.text && layer.text.color) {
        textElement.style.color = convertPSDColorToHex(layer.text.color);
      }
      
      if (layer.text && layer.text.justification) {
        textElement.style.textAlign = convertPSDAlignmentToCSS(layer.text.justification);
      }
    } catch (styleError) {
      console.error("Error extracting text style:", styleError);
      // Default styling
      textElement.style.fontSize = 16;
      textElement.style.fontFamily = 'Arial';
      textElement.style.color = '#000000';
      textElement.style.textAlign = 'left';
    }
    
    return textElement;
  } catch (error) {
    console.error("Error creating text element:", error);
    return null;
  }
};

// Create an image element from a layer
const createImageElement = async (layer: any, selectedSize: BannerSize): Promise<EditorElement | null> => {
  try {
    console.log(`Creating image element for layer: ${layer.name || 'unnamed'}`);
    
    let exportData;
    try {
      exportData = layer.export();
      console.log(`Image layer export data:`, exportData);
    } catch (error) {
      console.error(`Error exporting image layer data:`, error);
      return null;
    }
    
    const { width, height, left, top } = exportData;
    
    if (!width || !height || width <= 0 || height <= 0) {
      console.log(`Skipping layer with invalid dimensions: ${width}x${height}`);
      return null;
    }
    
    const imageElement = createNewElement('image', selectedSize);
    imageElement.style.x = left;
    imageElement.style.y = top;
    imageElement.style.width = width;
    imageElement.style.height = height;
    imageElement.alt = layer.name || 'Image Layer';
    
    // Try to get image data
    let imageDataUrl = '';
    
    try {
      // Method 1: Use canvas() function if available
      if (typeof layer.canvas === 'function') {
        const canvas = layer.canvas();
        console.log("Successfully created canvas for layer");
        imageDataUrl = canvas.toDataURL('image/png');
        console.log("Got image data URL from canvas, length:", imageDataUrl.length);
      } 
      // Method 2: Use toPng() function if available
      else if (layer.toPng && typeof layer.toPng === 'function') {
        console.log("Trying toPng method");
        const pngData = layer.toPng();
        if (pngData) {
          const blob = new Blob([pngData], { type: 'image/png' });
          imageDataUrl = URL.createObjectURL(blob);
          console.log("Created object URL from PNG data:", imageDataUrl);
        }
      }
      // Method 3: Try image property if available
      else if (layer.image) {
        console.log("Layer has image property");
        if (typeof layer.image === 'function') {
          const imageData = layer.image();
          if (imageData) {
            const blob = new Blob([imageData], { type: 'image/png' });
            imageDataUrl = URL.createObjectURL(blob);
            console.log("Created object URL from image() data");
          }
        }
      }
      
      if (imageDataUrl) {
        imageElement.content = imageDataUrl;
        console.log("Set image content successfully");
      } else {
        console.log("Could not extract image data from layer");
      }
    } catch (imageError) {
      console.error(`Error extracting image data:`, imageError);
    }
    
    return imageElement;
  } catch (error) {
    console.error("Error creating image element:", error);
    return null;
  }
};

// Create a fallback element when layer type can't be determined
const createFallbackElement = (layer: any, selectedSize: BannerSize): EditorElement | null => {
  try {
    console.log(`Creating fallback element for layer: ${layer.name || 'unnamed'}`);
    
    let exportData;
    try {
      exportData = layer.export();
    } catch (error) {
      console.error(`Error exporting layer for fallback:`, error);
      return null;
    }
    
    const { width, height, left, top } = exportData;
    
    if (!width || !height || width <= 0 || height <= 0) {
      return null;
    }
    
    const genericElement = createNewElement('container', selectedSize);
    genericElement.content = layer.name || 'Layer';
    genericElement.style.x = left || 0;
    genericElement.style.y = top || 0;
    genericElement.style.width = width;
    genericElement.style.height = height;
    genericElement.style.backgroundColor = "#e5e7eb"; // Light gray background
    
    return genericElement;
  } catch (error) {
    console.error("Error creating fallback element:", error);
    return null;
  }
};

// Utility function to convert PSD color format to hex
const convertPSDColorToHex = (colors: any): string => {
  try {
    if (Array.isArray(colors) && colors.length >= 3) {
      const [r, g, b] = colors;
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return '#000000';
  } catch (error) {
    console.error("Error converting PSD color to hex:", error);
    return '#000000';
  }
};

// Utility function to convert PSD text alignment to CSS
const convertPSDAlignmentToCSS = (alignment: string): "left" | "center" | "right" => {
  switch (alignment) {
    case 'right':
      return 'right';
    case 'center':
      return 'center';
    case 'left':
    default:
      return 'left';
  }
};
