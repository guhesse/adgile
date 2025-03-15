
import { EditorElement, BannerSize } from '../../types';
import { createNewElement } from '../../context/elements';
import { convertPSDColorToHex, convertPSDAlignmentToCSS } from './formatters';

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
