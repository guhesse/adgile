
import { EditorElement } from "../../types";
import { generateRandomId } from "../idGenerator";
import { mapFontName } from "./fontMapper";
import { logInfo } from "./psdLogger";

const TEXT_COLOR_MAPPING: Record<string, string> = {
  "black": "#000000",
  "white": "#ffffff",
  "red": "#ff3e3e",
  "blue": "#3e66ff",
  "green": "#3eff7e",
  "yellow": "#f7ff3e",
  "purple": "#b13eff",
  "orange": "#ff9d3e",
  "gray": "#808080",
};

export const processTextLayer = (
  name: string,
  textInfo: any,
  timestamp: number
): EditorElement => {
  // Create a unique ID for this text element
  const elementId = `text_${timestamp}_${generateRandomId(10)}`;
  
  // Get the font family, trying from FontSet first
  let fontFamily = 'Arial';
  let fontWeight = 'normal';
  let fontStyle = 'normal';
  
  try {
    if (textInfo.fontFamily) {
      fontFamily = textInfo.fontFamily;
      fontWeight = textInfo.fontWeight || 'normal';
      fontStyle = textInfo.fontStyle || 'normal';
    }
  } catch (error) {
    console.error(`Error processing font for ${name}:`, error);
  }
  
  // Text content from the layer
  const textContent = textInfo.text || name;
  
  // Create text element with style information
  const textElement: EditorElement = {
    id: elementId,
    type: "text",
    content: textContent,
    _layerName: name,
    style: {
      x: textInfo.x || 0,
      y: textInfo.y || 0,
      width: textInfo.width || 200,
      height: textInfo.height || 50,
      fontFamily: fontFamily,
      fontSize: textInfo.fontSize || 16,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      color: TEXT_COLOR_MAPPING[name.toLowerCase()] || "#000000",
      textAlign: textInfo.alignment || "left",
      lineHeight: textInfo.lineHeight || 1.2,
      letterSpacing: textInfo.letterSpacing || 0,
      backgroundColor: "transparent",
    },
    sizeId: 'global',
  };
  
  console.log(`Elemento de texto criado:`, textElement);
  
  return textElement;
};

export const processImageLayer = (
  name: string,
  imageInfo: any,
  timestamp: number
): EditorElement => {
  // Create a unique ID for this image element
  const elementId = `image_${timestamp}_${generateRandomId(10)}`;
  
  // Create image element
  const imageElement: EditorElement = {
    id: elementId,
    type: "image",
    content: imageInfo.src || "",
    _layerName: name,
    style: {
      x: imageInfo.x || 0,
      y: imageInfo.y || 0,
      width: imageInfo.width || 200,
      height: imageInfo.height || 200,
      backgroundColor: "transparent",
      objectFit: "cover"
    },
    alt: name,
    sizeId: 'global',
  };
  
  return imageElement;
};

export const processElements = (elements: EditorElement[], baseSize: string): EditorElement[] => {
  // Calculate percentage-based values for responsive positioning
  const [width, height] = baseSize.split('x').map(Number);
  
  if (!width || !height) {
    console.warn('Invalid base size format. Expected "widthxheight"');
    return elements;
  }
  
  const processedElements = elements.map(element => {
    // Skip elements that already have percentage values
    if (
      element.style.xPercent !== undefined &&
      element.style.yPercent !== undefined &&
      element.style.widthPercent !== undefined &&
      element.style.heightPercent !== undefined
    ) {
      return element;
    }
    
    // Calculate percentage values
    const xPercent = (element.style.x / width) * 100;
    const yPercent = (element.style.y / height) * 100;
    const widthPercent = (element.style.width / width) * 100;
    const heightPercent = (element.style.height / height) * 100;
    
    // Add percentage values to the element
    return {
      ...element,
      style: {
        ...element.style,
        xPercent,
        yPercent,
        widthPercent,
        heightPercent
      }
    };
  });
  
  logInfo(`ℹ️ Valores percentuais calculados para ${processedElements.length} elementos`);
  logInfo(`   {tamanhoBase: '${baseSize}px'}`);
  
  return processedElements;
};
