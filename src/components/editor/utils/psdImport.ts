import PSD from 'psd.js';
import { EditorElement } from '../types';
import { toast } from 'sonner';
import { createNewElement } from '../context/elements';

export const importPSDFile = (file: File, selectedSize: any): Promise<EditorElement[]> => {
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
        psd.parse();
        
        const elements: EditorElement[] = [];
        
        const flattenLayers = (node: any, parentId?: string): void => {
          if (node.hidden) return;
          
          if (node.isLayer()) {
            const element = convertLayerToElement(node, selectedSize, parentId);
            if (element) elements.push(element);
          }
          
          if (node.hasChildren()) {
            const containerElement = node.isRoot() ? undefined : createContainerFromGroup(node, selectedSize);
            
            if (containerElement) {
              elements.push(containerElement);
              node.children().forEach((child: any) => flattenLayers(child, containerElement.id));
            } else {
              node.children().forEach((child: any) => flattenLayers(child, parentId));
            }
          }
        };
        
        flattenLayers(psd.tree());

        elements.forEach(element => {
          element.style.xPercent = (element.style.x / selectedSize.width) * 100;
          element.style.yPercent = (element.style.y / selectedSize.height) * 100;
          element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
          element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
        });
        
        toast.success("PSD file imported successfully!");
        resolve(elements);
      } catch (error) {
        console.error("Error parsing PSD file:", error);
        toast.error("Failed to parse the PSD file. Make sure it's a valid PSD.");
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      toast.error("Error reading the file.");
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const convertLayerToElement = (layer: any, selectedSize: any, parentId?: string): EditorElement | null => {
  const { width, height, left, top } = layer.export();
  
  if (width <= 0 || height <= 0) return null;
  
  if (layer.get('typeTool')) {
    const textData = layer.get('typeTool');
    const textElement = createNewElement('text', selectedSize);
    
    textElement.content = textData.text || layer.name;
    textElement.style.x = left;
    textElement.style.y = top;
    textElement.style.width = width;
    textElement.style.height = height;
    
    if (textData.styles && textData.styles.length > 0) {
      const style = textData.styles[0];
      if (style.fontSize) textElement.style.fontSize = style.fontSize;
      if (style.fontName) textElement.style.fontFamily = style.fontName;
      if (style.colors) textElement.style.color = convertPSDColorToHex(style.colors);
    }
    
    if (parentId) {
      textElement.parentId = parentId;
      textElement.inContainer = true;
    }
    
    return textElement;
  }
  
  if (layer.isLayer()) {
    try {
      const canvas = layer.canvas();
      if (canvas) {
        const imageElement = createNewElement('image', selectedSize);
        imageElement.content = canvas.toDataURL();
        imageElement.style.x = left;
        imageElement.style.y = top;
        imageElement.style.width = width;
        imageElement.style.height = height;
        imageElement.alt = layer.name;
        
        if (parentId) {
          imageElement.parentId = parentId;
          imageElement.inContainer = true;
        }
        
        return imageElement;
      }
    } catch (e) {
      console.error("Error converting layer to image:", e);
    }
  }
  
  return null;
};

const createContainerFromGroup = (group: any, selectedSize: any): EditorElement => {
  const { width, height, left, top } = group.export();
  
  const containerElement = createNewElement('container', selectedSize);
  containerElement.content = group.name;
  containerElement.style.x = left;
  containerElement.style.y = top;
  containerElement.style.width = Math.max(width, 50);
  containerElement.style.height = Math.max(height, 50);
  containerElement.childElements = [];
  
  return containerElement;
};

const convertPSDColorToHex = (colors: any): string => {
  if (Array.isArray(colors) && colors.length >= 3) {
    const [r, g, b] = colors;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return '#000000';
};
