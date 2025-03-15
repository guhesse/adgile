
import { EditorElement, BannerSize } from '../../types';
import { createNewElement } from '../../context/elements';
import { convertPSDColorToHex, convertPSDAlignmentToCSS } from './formatters';
import { extractLayerImageData } from './layerDetection';

/**
 * Create a text element from a PSD layer
 * @param layer The PSD layer
 * @param selectedSize The selected banner size
 * @returns A text element for the canvas
 */
export const createTextElement = async (layer: any, selectedSize: BannerSize): Promise<EditorElement | null> => {
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
    let textContent = extractTextContent(layer);
    textElement.content = textContent;
    
    // Extract and apply text styling
    extractAndApplyTextStyling(layer, textElement);
    
    return textElement;
  } catch (error) {
    console.error("Error creating text element:", error);
    return null;
  }
};

/**
 * Extract text content from a PSD layer
 * @param layer The PSD layer
 * @returns The extracted text content
 */
const extractTextContent = (layer: any): string => {
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
  // Try to get text from typeTool function
  else if (typeof layer.typeTool === 'function') {
    try {
      const typeToolData = layer.typeTool();
      console.log(`TypeTool data for "${layer.name}":`, typeToolData);
      
      if (typeToolData) {
        // Check for various text properties in the typeTool data
        if (typeToolData.textData && typeToolData.textData.text) {
          textContent = typeToolData.textData.text;
          console.log(`Extracted text from typeTool().textData.text: ${textContent}`);
        } else if (typeToolData.text) {
          textContent = typeToolData.text;
          console.log(`Extracted text from typeTool().text: ${textContent}`);
        } else if (typeToolData.textValue) {
          textContent = typeToolData.textValue;
          console.log(`Extracted text from typeTool().textValue: ${textContent}`);
        }
      }
    } catch (e) {
      console.error("Error extracting data from typeTool function:", e);
    }
  }
  // Try to get text from adjustments.typeTool
  else if (layer.adjustments && layer.adjustments.typeTool) {
    try {
      if (typeof layer.adjustments.typeTool === 'function') {
        const typeToolData = layer.adjustments.typeTool();
        console.log(`TypeTool data from adjustments for "${layer.name}":`, typeToolData);
        
        if (typeToolData && typeToolData.textData && typeToolData.textData.text) {
          textContent = typeToolData.textData.text;
          console.log(`Extracted text from adjustments.typeTool().textData.text: ${textContent}`);
        } else if (typeToolData && typeToolData.text) {
          textContent = typeToolData.text;
          console.log(`Extracted text from adjustments.typeTool().text: ${textContent}`);
        }
      } else if (layer.adjustments.typeTool.obj) {
        console.log(`TypeTool object from adjustments for "${layer.name}":`, layer.adjustments.typeTool.obj);
        // Try to force load the lazy object
        if (layer.adjustments.typeTool.loaded === false && layer.adjustments.typeTool.load) {
          try {
            layer.adjustments.typeTool.load();
            console.log(`Loaded typeTool LazyExecute object`);
            
            if (layer.adjustments.typeTool.obj && layer.adjustments.typeTool.obj.textData) {
              textContent = layer.adjustments.typeTool.obj.textData.text;
              console.log(`Extracted text from loaded typeTool object: ${textContent}`);
            }
          } catch (loadErr) {
            console.error("Error loading typeTool LazyExecute object:", loadErr);
          }
        }
      }
    } catch (e) {
      console.error("Error extracting data from adjustments.typeTool:", e);
    }
  }
  
  // If we still don't have text content, extract from layer name as fallback
  if (!textContent || textContent.trim() === '') {
    // For layers that have text indicators in their name, use the name without the prefix
    const nameWithoutPrefix = layer.name.replace(/^(heading|h1|h2|h3|paragraph|text|title|subtitle)\s*/i, '');
    
    // Check if the layer has a legacyName property which could contain the text
    if (layer.legacyName && layer.legacyName.trim() !== '') {
      textContent = layer.legacyName;
      console.log(`Using layer.legacyName as text content: ${textContent}`);
    } else {
      textContent = nameWithoutPrefix || layer.name;
      console.log(`Using layer name as text content: ${textContent}`);
    }
  }
  
  return textContent;
};

/**
 * Extract and apply text styling from a PSD layer to a text element
 * @param layer The PSD layer
 * @param textElement The text element to style
 */
const extractAndApplyTextStyling = (layer: any, textElement: EditorElement): void => {
  try {
    // First try to extract style from layer.text
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
    
    // Try to extract from typeTool data if available
    if (typeof layer.typeTool === 'function') {
      try {
        const typeToolData = layer.typeTool();
        
        if (typeToolData && typeToolData.textData) {
          // Font information
          if (typeToolData.textData.fontName && !textElement.style.fontFamily) {
            textElement.style.fontFamily = typeToolData.textData.fontName;
          }
          
          // Font size
          if (typeToolData.textData.fontSize && !textElement.style.fontSize) {
            textElement.style.fontSize = parseInt(typeToolData.textData.fontSize, 10);
          }
          
          // Text color
          if (typeToolData.textData.color && !textElement.style.color) {
            textElement.style.color = convertPSDColorToHex(typeToolData.textData.color);
          }
          
          // Text alignment
          if (typeToolData.textData.justification && !textElement.style.textAlign) {
            textElement.style.textAlign = convertPSDAlignmentToCSS(typeToolData.textData.justification);
          }
        }
      } catch (e) {
        console.error("Error extracting styling from typeTool function:", e);
      }
    }
  } catch (styleError) {
    console.error("Error extracting text style:", styleError);
  }
  
  // Apply default styling if needed
  if (!textElement.style.fontSize) textElement.style.fontSize = 16;
  if (!textElement.style.fontFamily) textElement.style.fontFamily = 'Arial';
  if (!textElement.style.color) textElement.style.color = '#000000';
  if (!textElement.style.textAlign) textElement.style.textAlign = 'left';
};

/**
 * Create an image element from a PSD layer
 * @param layer The PSD layer
 * @param selectedSize The selected banner size
 * @returns An image element for the canvas
 */
export const createImageElement = async (layer: any, selectedSize: BannerSize): Promise<EditorElement | null> => {
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
    
    // Use the extractLayerImageData function
    const imageDataUrl = await extractLayerImageData(layer, layer.name || 'image');
    
    if (imageDataUrl) {
      imageElement.content = imageDataUrl;
      console.log("Set image content successfully");
    } else {
      console.log("Could not extract image data from layer");
    }
    
    return imageElement;
  } catch (error) {
    console.error("Error creating image element:", error);
    return null;
  }
};

/**
 * Create a fallback element when layer type can't be determined
 * @param layer The PSD layer
 * @param selectedSize The selected banner size
 * @returns A generic container element for the canvas
 */
export const createFallbackElement = (layer: any, selectedSize: BannerSize): EditorElement | null => {
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
