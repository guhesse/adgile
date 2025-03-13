
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
          // Skip if node is undefined
          if (!node) {
            console.log("Node is undefined, skipping");
            return;
          }
          
          const nodeName = node.name || "Unnamed";
          console.log(`Processing node: ${nodeName}`);
          
          // Log node properties for debugging
          try {
            console.log(`Node visible:`, node.visible && node.visible());
            console.log(`Node hidden:`, node.hidden && node.hidden());
            console.log(`Node data:`, node.export());
          } catch (err) {
            console.error(`Error logging node ${nodeName}:`, err);
          }
          
          // Fix: Only skip if we can confirm the layer is hidden
          const isHidden = node.hidden && typeof node.hidden === 'function' && node.hidden();
          if (isHidden) {
            console.log(`Skipping hidden layer: ${nodeName}`);
            return;
          }
          
          // Process this layer if it has image data or is a text layer
          if (node.isLayer && node.isLayer()) {
            console.log(`Converting layer to element: ${nodeName}`);
            try {
              const element = convertLayerToElement(node, selectedSize, parentId);
              if (element) {
                console.log(`Created element from layer: ${nodeName}`, element);
                elements.push(element);
              } else {
                console.log(`Failed to convert layer to element: ${nodeName}`);
              }
            } catch (error) {
              console.error(`Error converting layer ${nodeName}:`, error);
              // Create a fallback generic container for this layer
              try {
                const fallbackElement = createFallbackElement(node, selectedSize, parentId);
                if (fallbackElement) {
                  console.log(`Created fallback element for layer: ${nodeName}`);
                  elements.push(fallbackElement);
                }
              } catch (fallbackError) {
                console.error(`Could not create fallback for ${nodeName}:`, fallbackError);
              }
            }
          }
          
          // Process children if this is a group
          if (node.hasChildren && node.hasChildren()) {
            console.log(`Node has children: ${nodeName}, Children count:`, node.children().length);
            
            // If it's not the root and is a group, create a container element
            let containerElement = undefined;
            try {
              containerElement = (!node.isRoot || !node.isRoot()) ? createContainerFromGroup(node, selectedSize) : undefined;
            } catch (err) {
              console.error(`Error creating container for group ${nodeName}:`, err);
            }
            
            if (containerElement) {
              console.log(`Created container from group: ${nodeName}`);
              elements.push(containerElement);
              // Process all children and associate them with this container
              node.children().forEach((child: any) => {
                try {
                  flattenLayers(child, containerElement.id);
                } catch (err) {
                  console.error(`Error processing child of ${nodeName}:`, err);
                }
              });
            } else {
              // Process all children without a parent container
              console.log(`Processing children without container for ${nodeName}`);
              node.children().forEach((child: any) => {
                try {
                  flattenLayers(child, parentId);
                } catch (err) {
                  console.error(`Error processing child of ${nodeName}:`, err);
                }
              });
            }
          }
        };
        
        // Start processing from the root
        try {
          flattenLayers(psd.tree());
        } catch (error) {
          console.error("Error during layer processing:", error);
        }
        
        console.log("Final elements count:", elements.length);
        
        // Fallback: If no elements were extracted, try to process all layers directly
        if (elements.length === 0 && psd.layers && psd.layers.length > 0) {
          console.log("No elements were created from tree structure. Trying direct layer processing...");
          
          for (const layer of psd.layers) {
            try {
              if (!layer.hidden || !layer.hidden()) {
                const element = convertLayerToElement(layer, selectedSize);
                if (element) {
                  console.log(`Created element from direct layer: ${layer.name}`, element);
                  elements.push(element);
                }
              }
            } catch (layerError) {
              console.error(`Error processing direct layer ${layer?.name || 'unnamed'}:`, layerError);
            }
          }
          
          console.log("After direct processing, elements count:", elements.length);
        }
        
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
    const layerName = layer.name || "Unnamed layer";
    console.log(`Converting layer: ${layerName}`);
    
    // Get layer export data
    let exportData;
    try {
      exportData = layer.export();
      console.log(`Layer export data for ${layerName}:`, exportData);
    } catch (error) {
      console.error(`Error exporting layer ${layerName}:`, error);
      return null;
    }
    
    // Get dimensions and position
    const { width, height, left, top } = exportData;
    
    // Safety check for valid dimensions
    if (!width || !height || width <= 0 || height <= 0) {
      console.log(`Skipping layer with invalid dimensions: ${width}x${height}`);
      return null;
    }
    
    // Handle text layers
    if (layer.get && layer.get('typeTool')) {
      console.log(`Processing text layer: ${layerName}`);
      
      const textData = layer.get('typeTool');
      const textElement = createNewElement('text', selectedSize);
      
      textElement.content = textData.text || layerName;
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
    if (layer.isLayer && layer.isLayer()) {
      try {
        console.log(`Creating canvas for layer: ${layerName}`);
        let canvas;
        
        try {
          canvas = layer.canvas();
        } catch (canvasError) {
          console.error(`Error creating canvas for ${layerName}:`, canvasError);
          console.log(`Falling back to alternative method for layer: ${layerName}`);
          
          // Alternative method to try to get image data
          try {
            if (layer.toPng) {
              const pngData = layer.toPng();
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = width;
              tempCanvas.height = height;
              const ctx = tempCanvas.getContext('2d');
              
              if (ctx && pngData) {
                const img = new Image();
                img.src = URL.createObjectURL(new Blob([pngData]));
                ctx.drawImage(img, 0, 0);
                canvas = tempCanvas;
              }
            }
          } catch (altError) {
            console.error(`Alternative method failed for ${layerName}:`, altError);
          }
        }
        
        if (canvas) {
          console.log(`Canvas created for ${layerName}`);
          const imageElement = createNewElement('image', selectedSize);
          
          try {
            imageElement.content = canvas.toDataURL();
          } catch (dataUrlError) {
            console.error(`Error getting dataURL for ${layerName}:`, dataUrlError);
            imageElement.content = '';
          }
          
          imageElement.style.x = left;
          imageElement.style.y = top;
          imageElement.style.width = width;
          imageElement.style.height = height;
          imageElement.alt = layerName;
          
          if (parentId) {
            imageElement.parentId = parentId;
            imageElement.inContainer = true;
          }
          
          return imageElement;
        } else {
          console.log(`Could not create canvas for ${layerName}, creating generic element instead`);
          return createFallbackElement(layer, selectedSize, parentId);
        }
      } catch (e) {
        console.error(`Error converting layer to image: ${layerName}`, e);
        return createFallbackElement(layer, selectedSize, parentId);
      }
    }
    
    return createFallbackElement(layer, selectedSize, parentId);
  } catch (error) {
    console.error("Error in convertLayerToElement:", error);
    return null;
  }
};

const createFallbackElement = (layer: any, selectedSize: any, parentId?: string): EditorElement | null => {
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
    
    if (parentId) {
      genericElement.parentId = parentId;
      genericElement.inContainer = true;
    }
    
    return genericElement;
  } catch (error) {
    console.error("Error creating fallback element:", error);
    return null;
  }
};

const createContainerFromGroup = (group: any, selectedSize: any): EditorElement | null => {
  try {
    console.log(`Creating container from group: ${group.name || 'unnamed'}`);
    
    let exportData;
    try {
      exportData = group.export();
    } catch (error) {
      console.error(`Error exporting group data:`, error);
      return null;
    }
    
    let { width, height, left, top } = exportData;
    
    // Ensure we have valid dimensions
    width = Math.max(width || 50, 50);
    height = Math.max(height || 50, 50);
    left = left || 0;
    top = top || 0;
    
    const containerElement = createNewElement('container', selectedSize);
    containerElement.content = group.name || 'Group';
    containerElement.style.x = left;
    containerElement.style.y = top;
    containerElement.style.width = width;
    containerElement.style.height = height;
    containerElement.childElements = [];
    
    return containerElement;
  } catch (error) {
    console.error("Error creating container from group:", error);
    return null;
  }
};

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

