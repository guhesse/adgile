
import { EditorElement, BannerSize } from '../../types';
import { createNewElement } from '../../context/elements';
import { convertPSDColorToHex, convertPSDAlignmentToCSS } from './formatters';
import { extractLayerImageData, extractTextContent } from './layerDetection';

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
    
    // Extract text content and styling using the enhanced function
    const { text, fontFamily, fontSize, color, textAlign } = extractTextContent(layer);
    textElement.content = text;
    
    // Apply extracted styles or defaults
    if (fontFamily) {
      textElement.style.fontFamily = fontFamily;
    }
    
    if (fontSize) {
      textElement.style.fontSize = fontSize;
    }
    
    if (color) {
      textElement.style.color = convertPSDColorToHex(color);
    }
    
    if (textAlign) {
      textElement.style.textAlign = convertPSDAlignmentToCSS(textAlign);
    }
    
    // Apply default styling if needed
    if (!textElement.style.fontSize) textElement.style.fontSize = 16;
    if (!textElement.style.fontFamily) textElement.style.fontFamily = 'Arial';
    if (!textElement.style.color) textElement.style.color = '#000000';
    if (!textElement.style.textAlign) textElement.style.textAlign = 'left';
    
    // Make sure we have a sizeid set
    textElement.sizeId = selectedSize.name;
    
    return textElement;
  } catch (error) {
    console.error("Error creating text element:", error);
    return null;
  }
};

/**
 * Create an image element from a PSD layer
 * @param layer The PSD layer
 * @param selectedSize The selected banner size
 * @param preExtractedImage Optional pre-extracted image data
 * @returns An image element for the canvas
 */
export const createImageElement = async (
  layer: any, 
  selectedSize: BannerSize,
  preExtractedImage?: string
): Promise<EditorElement | null> => {
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
    
    // Make sure we have a sizeId set
    imageElement.sizeId = selectedSize.name;
    
    // Use pre-extracted image if available
    if (preExtractedImage) {
      console.log(`Using pre-extracted image for layer: ${layer.name}`);
      imageElement.content = preExtractedImage;
    } else {
      // Use the enhanced extractLayerImageData function that includes storage
      const { imageData, imageKey } = await extractLayerImageData(layer, layer.name || 'image');
      
      if (imageData) {
        imageElement.content = imageData;
        console.log("Set image content successfully", { imageKey });
      } else {
        console.log("Could not extract image data from layer");
        return null;
      }
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
    
    // Make sure we have a sizeId set
    genericElement.sizeId = selectedSize.name;
    
    return genericElement;
  } catch (error) {
    console.error("Error creating fallback element:", error);
    return null;
  }
};
