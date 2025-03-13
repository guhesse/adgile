
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
        await psd.parse();
        
        console.log("PSD parsed successfully");
        console.log("Tree structure:", psd.tree().export());
        console.log("Layers count:", psd.layers.length);
        
        const elements: EditorElement[] = [];
        
        // Flatten all layers recursively
        const flattenLayers = (node: any, parentId?: string): void => {
          console.log("Processing node:", node.name, "Hidden:", node.hidden, "Type:", node.type);
          
          // Skip hidden layers
          if (node.hidden) {
            console.log("Skipping hidden layer:", node.name);
            return;
          }
          
          // Process this layer if it's not a group or is a visible layer
          if (node.isLayer()) {
            console.log("Converting layer to element:", node.name);
            const element = convertLayerToElement(node, selectedSize, parentId);
            if (element) {
              console.log("Created element from layer:", node.name, element);
              elements.push(element);
            } else {
              console.log("Failed to convert layer to element:", node.name);
            }
          }
          
          // Process children if this is a group
          if (node.hasChildren()) {
            console.log("Node has children:", node.name, "Children count:", node.children().length);
            
            // If it's not the root and is a group, create a container element
            const containerElement = node.isRoot() ? undefined : createContainerFromGroup(node, selectedSize);
            
            if (containerElement) {
              console.log("Created container from group:", node.name);
              elements.push(containerElement);
              // Process all children and associate them with this container
              node.children().forEach((child: any) => flattenLayers(child, containerElement.id));
            } else {
              // Process all children without a parent container
              console.log("Processing children without container");
              node.children().forEach((child: any) => flattenLayers(child, parentId));
            }
          }
        };
        
        // Start processing from the root
        flattenLayers(psd.tree());
        
        console.log("Final elements count:", elements.length);
        
        // Calculate percentage values for responsive handling
        elements.forEach(element => {
          element.style.xPercent = (element.style.x / selectedSize.width) * 100;
          element.style.yPercent = (element.style.y / selectedSize.height) * 100;
          element.style.widthPercent = (element.style.width / selectedSize.width) * 100;
          element.style.heightPercent = (element.style.height / selectedSize.height) * 100;
        });
        
        if (elements.length === 0) {
          toast.warning("No visible layers found in the PSD file.");
        } else {
          toast.success(`Imported ${elements.length} elements from PSD file.`);
        }
        
        resolve(elements);
      } catch (error) {
        console.error("Error parsing PSD file:", error);
        toast.error("Failed to parse the PSD file. Make sure it's a valid PSD.");
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Error reading the file.");
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const convertLayerToElement = (layer: any, selectedSize: any, parentId?: string): EditorElement | null => {
  try {
    console.log("Converting layer:", layer.name, "Layer export:", layer.export());
    
    const { width, height, left, top } = layer.export();
    
    if (width <= 0 || height <= 0) {
      console.log("Skipping layer with invalid dimensions:", width, height);
      return null;
    }
    
    // Handle text layers
    if (layer.get('typeTool')) {
      console.log("Processing text layer:", layer.name, "Text data:", layer.get('typeTool'));
      
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
    
    // Handle image layers
    if (layer.isLayer()) {
      try {
        console.log("Creating canvas for layer:", layer.name);
        const canvas = layer.canvas();
        console.log("Canvas created:", !!canvas);
        
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
    
    // If not handled as text or image but is still a valid layer, create a generic element
    if (layer.isLayer() && width > 0 && height > 0) {
      console.log("Creating generic element for layer:", layer.name);
      const genericElement = createNewElement('container', selectedSize);
      genericElement.content = layer.name;
      genericElement.style.x = left;
      genericElement.style.y = top;
      genericElement.style.width = width;
      genericElement.style.height = height;
      
      if (parentId) {
        genericElement.parentId = parentId;
        genericElement.inContainer = true;
      }
      
      return genericElement;
    }
    
    console.log("Layer not converted to any element:", layer.name);
    return null;
  } catch (error) {
    console.error("Error in convertLayerToElement:", error);
    return null;
  }
};

const createContainerFromGroup = (group: any, selectedSize: any): EditorElement => {
  console.log("Creating container from group:", group.name);
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
