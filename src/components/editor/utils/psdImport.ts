
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
          
          if (layer.export) {
            const exported = layer.export();
            console.log(`Layer ${index}: Export data:`, exported);
            if (exported.type) {
              console.log(`Layer ${index}: Export type:`, exported.type);
            }
          }
          
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
          
          // Log layer type info
          if (layer.info) {
            console.log(`Layer ${index}: Info object:`, layer.info);
            if (layer.info.layerKind) {
              console.log(`Layer ${index}: Layer kind:`, layer.info.layerKind);
            }
          }
          
          // If layer has an image
          if (layer.canvas && typeof layer.canvas === 'function') {
            console.log(`Layer ${index}: Has canvas function`);
          }
          
          if (layer.toPng && typeof layer.toPng === 'function') {
            console.log(`Layer ${index}: Has toPng function`);
          }
          
          console.log(`--------------------------------`);
        });
        
        const elements: EditorElement[] = [];
        
        const flattenLayers = async (node: any, parentId?: string): Promise<void> => {
          if (!node) {
            console.log("Node is undefined, skipping");
            return;
          }
          
          const nodeName = node.name || "Unnamed";
          console.log(`\nProcessing node: ${nodeName}`);
          
          try {
            const nodeExport = node.export();
            console.log(`Node ${nodeName}: Export data:`, nodeExport);
            console.log(`Node ${nodeName}: Type:`, nodeExport.type);
            if (nodeExport.text) {
              console.log(`Node ${nodeName}: Has text in export data:`, nodeExport.text);
            }
          } catch (err) {
            console.log(`Error exporting node ${nodeName}:`, err);
          }
          
          try {
            // Debug text detection
            const isText = isLayerTypeText(node);
            console.log(`Node ${nodeName}: Is text layer?`, isText);
            if (isText) {
              console.log(`Node ${nodeName}: TEXT LAYER DETECTED!`);
            }
          } catch (err) {
            console.log(`Error in text detection for ${nodeName}:`, err);
          }
          
          const isHidden = node.hidden && typeof node.hidden === 'function' && node.hidden();
          if (isHidden) {
            console.log(`Skipping hidden layer: ${nodeName}`);
            return;
          }
          
          if (node.isLayer && node.isLayer()) {
            console.log(`Converting layer to element: ${nodeName}`);
            try {
              const isTextLayer = isLayerTypeText(node);
              
              if (isTextLayer) {
                console.log(`CREATING TEXT ELEMENT for ${nodeName}`);
                const textElement = await createTextElement(node, selectedSize, parentId);
                if (textElement) {
                  console.log(`Created text element from layer: ${nodeName}`, textElement);
                  elements.push(textElement);
                } else {
                  console.log(`Failed to create text element for ${nodeName}`);
                }
              } else {
                console.log(`Attempting to create image element for ${nodeName}`);
                const imageElement = await createImageElement(node, selectedSize, parentId);
                if (imageElement) {
                  console.log(`Created image element from layer: ${nodeName}`, imageElement);
                  elements.push(imageElement);
                } else {
                  console.log(`Creating fallback element for ${nodeName}`);
                  const fallbackElement = createFallbackElement(node, selectedSize, parentId);
                  if (fallbackElement) {
                    console.log(`Created fallback element for layer: ${nodeName}`);
                    elements.push(fallbackElement);
                  } else {
                    console.log(`Failed to create any element for ${nodeName}`);
                  }
                }
              }
            } catch (error) {
              console.error(`Error converting layer ${nodeName}:`, error);
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
          
          if (node.hasChildren && node.hasChildren()) {
            console.log(`Node has children: ${nodeName}, Children count:`, node.children().length);
            
            let containerElement = undefined;
            try {
              containerElement = (!node.isRoot || !node.isRoot()) ? createContainerFromGroup(node, selectedSize) : undefined;
            } catch (err) {
              console.error(`Error creating container for group ${nodeName}:`, err);
            }
            
            if (containerElement) {
              console.log(`Created container from group: ${nodeName}`);
              elements.push(containerElement);
              for (const child of node.children()) {
                try {
                  await flattenLayers(child, containerElement.id);
                } catch (err) {
                  console.error(`Error processing child of ${nodeName}:`, err);
                }
              }
            } else {
              console.log(`Processing children without container for ${nodeName}`);
              for (const child of node.children()) {
                try {
                  await flattenLayers(child, parentId);
                } catch (err) {
                  console.error(`Error processing child of ${nodeName}:`, err);
                }
              }
            }
          }
        };
        
        try {
          await flattenLayers(psd.tree());
        } catch (error) {
          console.error("Error during layer processing:", error);
        }
        
        console.log("Final elements count:", elements.length);
        
        if (elements.length === 0 && psd.layers && psd.layers.length > 0) {
          console.log("No elements were created from tree structure. Trying direct layer processing...");
          
          for (const layer of psd.layers) {
            try {
              console.log(`Direct processing layer: ${layer.name || 'unnamed'}`);
              console.log(`Layer type:`, layer.type);
              
              if (layer.export) {
                try {
                  const exportData = layer.export();
                  console.log(`Layer export data:`, exportData);
                  if (exportData.type) {
                    console.log(`Layer export type:`, exportData.type);
                  }
                } catch (err) {
                  console.log(`Error exporting layer:`, err);
                }
              }
              
              if (!layer.hidden || !layer.hidden()) {
                // Enhanced text layer detection in direct processing
                const isTextLayer = isLayerTypeText(layer);
                console.log(`Is text layer? ${isTextLayer}`);
                
                if (isTextLayer) {
                  console.log(`DIRECT: Creating text element for ${layer.name || 'unnamed'}`);
                  const textElement = await createTextElement(layer, selectedSize);
                  if (textElement) {
                    console.log(`DIRECT: Created text element from layer: ${layer.name}`, textElement);
                    elements.push(textElement);
                  } else {
                    console.log(`DIRECT: Failed to create text element for ${layer.name}`);
                  }
                } else {
                  console.log(`DIRECT: Creating image element for ${layer.name || 'unnamed'}`);
                  const imageElement = await createImageElement(layer, selectedSize);
                  if (imageElement) {
                    console.log(`DIRECT: Created image element from layer: ${layer.name}`, imageElement);
                    elements.push(imageElement);
                  } else {
                    console.log(`DIRECT: Creating fallback element for ${layer.name || 'unnamed'}`);
                    const fallbackElement = createFallbackElement(layer, selectedSize);
                    if (fallbackElement) {
                      console.log(`DIRECT: Created fallback element from layer: ${layer.name}`);
                      elements.push(fallbackElement);
                    } else {
                      console.log(`DIRECT: Failed to create any element for ${layer.name}`);
                    }
                  }
                }
              } else {
                console.log(`DIRECT: Skipping hidden layer: ${layer.name || 'unnamed'}`);
              }
            } catch (layerError) {
              console.error(`Error processing direct layer ${layer?.name || 'unnamed'}:`, layerError);
            }
          }
          
          console.log("After direct processing, elements count:", elements.length);
        }
        
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

const isLayerTypeText = (layer: any): boolean => {
  try {
    if (!layer) return false;
    
    console.log(`Checking if layer "${layer.name || 'unnamed'}" is text type`);
    
    // Check by direct type property
    if (layer.type === 'type' || layer.type === 'text' || layer.type === 'TextLayer') {
      console.log(`Layer "${layer.name}" is a text layer by type property: ${layer.type}`);
      return true;
    }
    
    // Check by layer kind (3 is text in PSD spec)
    if (layer.layer && layer.layer.info && layer.layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is a text layer by layerKind: 3`);
      return true;
    }
    
    if (layer.info && layer.info.layerKind === 3) {
      console.log(`Layer "${layer.name}" is a text layer by direct layerKind: 3`);
      return true;
    }
    
    // Check by export data
    if (layer.export && typeof layer.export === 'function') {
      try {
        const exportData = layer.export();
        console.log(`Layer "${layer.name}" export data:`, exportData);
        
        if (exportData && exportData.type === 'type') {
          console.log(`Layer "${layer.name}" is a text layer by export().type: type`);
          return true;
        }
        
        if (exportData && exportData.layerKind === 3) {
          console.log(`Layer "${layer.name}" is a text layer by export().layerKind: 3`);
          return true;
        }
        
        // Check if there's text content in export data
        if (exportData && exportData.text && exportData.text.value) {
          console.log(`Layer "${layer.name}" is a text layer - has text in export data: ${exportData.text.value}`);
          return true;
        }
      } catch (err) {
        console.log(`Error exporting layer "${layer.name}":`, err);
      }
    }
    
    // Check by text function or property
    if (layer.text) {
      console.log(`Layer "${layer.name}" has text property`);
      
      if (typeof layer.text === 'function') {
        try {
          const textValue = layer.text();
          console.log(`Layer "${layer.name}" text() result:`, textValue);
          
          if (textValue && textValue.value && textValue.value.trim().length > 0) {
            console.log(`Layer "${layer.name}" is a text layer - has text() with value: ${textValue.value}`);
            return true;
          }
          
          if (typeof textValue === 'string' && textValue.trim().length > 0) {
            console.log(`Layer "${layer.name}" is a text layer - has text() returning string: ${textValue}`);
            return true;
          }
        } catch (e) {
          console.log(`Error getting text from "${layer.name}":`, e);
        }
      } else {
        // text is a direct property
        if (layer.text.value) {
          console.log(`Layer "${layer.name}" is a text layer - has text.value property: ${layer.text.value}`);
          return true;
        }
      }
    }
    
    // Check by typeTool
    if (layer.get && layer.get('typeTool')) {
      console.log(`Layer "${layer.name}" is a text layer - has typeTool property`);
      return true;
    }
    
    // One final check for node.nodeName (used in some PSD libraries)
    if (layer.nodeName === 'typeTool' || (layer.node && layer.node.type === 'text')) {
      console.log(`Layer "${layer.name}" is a text layer - by nodeName`);
      return true;
    }
    
    console.log(`Layer "${layer.name}" is NOT a text layer - no text indicators found`);
    return false;
  } catch (error) {
    console.error(`Error in text layer detection for ${layer?.name || 'unnamed'}:`, error);
    return false;
  }
};

const createTextElement = async (layer: any, selectedSize: BannerSize, parentId?: string): Promise<EditorElement | null> => {
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
    
    let textContent = '';
    let textStyles = null;
    
    if (layer.text && layer.text.value) {
      textContent = layer.text.value;
      console.log(`Extracted text from text.value: ${textContent}`);
    } 
    else if (layer.text && typeof layer.text === 'function') {
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
    else if (layer.get && layer.get('typeTool') && layer.get('typeTool').text) {
      textContent = layer.get('typeTool').text;
      textStyles = layer.get('typeTool').styles;
      console.log(`Extracted text from typeTool: ${textContent}`);
    }
    else if (exportData && exportData.text) {
      textContent = exportData.text;
      console.log(`Extracted text from export().text: ${textContent}`);
    }
    
    if (!textContent || textContent.trim() === '') {
      textContent = layer.name || 'Text Layer';
      console.log(`Using layer name as text content: ${textContent}`);
    }
    
    textElement.content = textContent;
    
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
      textElement.style.fontSize = 16;
      textElement.style.fontFamily = 'Arial';
      textElement.style.color = '#000000';
      textElement.style.textAlign = 'left';
    }
    
    if (parentId) {
      textElement.parentId = parentId;
      textElement.inContainer = true;
    }
    
    return textElement;
  } catch (error) {
    console.error("Error creating text element:", error);
    return null;
  }
};

const createImageElement = async (layer: any, selectedSize: BannerSize, parentId?: string): Promise<EditorElement | null> => {
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
    
    const isSmartObject = layer.smartObject || 
                          (layer.get && layer.get('smartObject')) ||
                          (layer.name && layer.name.toLowerCase().includes('smart object'));
    
    const imageElement = createNewElement('image', selectedSize);
    imageElement.style.x = left;
    imageElement.style.y = top;
    imageElement.style.width = width;
    imageElement.style.height = height;
    imageElement.alt = layer.name || 'Image Layer';
    
    if (isSmartObject) {
      imageElement.alt = `Smart Object: ${layer.name || 'Unnamed'}`;
    }
    
    let imageDataUrl = '';
    let canvas;
    
    try {
      if (typeof layer.canvas === 'function') {
        canvas = layer.canvas();
        console.log("Successfully created canvas for layer");
        imageDataUrl = canvas.toDataURL();
        imageElement.content = imageDataUrl;
      } else if (layer.toPng && typeof layer.toPng === 'function') {
        console.log("Trying toPng method");
        try {
          const pngData = layer.toPng();
          if (pngData) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const ctx = tempCanvas.getContext('2d');
            
            if (ctx) {
              const img = new Image();
              const blob = new Blob([pngData], { type: 'image/png' });
              img.src = URL.createObjectURL(blob);
              
              await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                  ctx.drawImage(img, 0, 0);
                  imageDataUrl = tempCanvas.toDataURL();
                  imageElement.content = imageDataUrl;
                  URL.revokeObjectURL(img.src);
                  resolve();
                };
                
                img.onerror = () => {
                  console.error("Failed to load PNG image data");
                  reject(new Error("Failed to load PNG image data"));
                };
                
                setTimeout(() => reject(new Error("Image loading timeout")), 3000);
              });
            }
          }
        } catch (toPngError) {
          console.error("Error using toPng method:", toPngError);
        }
      }
    } catch (canvasError) {
      console.error(`Error creating canvas:`, canvasError);
    }
    
    if (parentId) {
      imageElement.parentId = parentId;
      imageElement.inContainer = true;
    }
    
    return imageElement;
  } catch (error) {
    console.error("Error creating image element:", error);
    return null;
  }
};

const createFallbackElement = (layer: any, selectedSize: BannerSize, parentId?: string): EditorElement | null => {
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

const createContainerFromGroup = (group: any, selectedSize: BannerSize): EditorElement | null => {
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
