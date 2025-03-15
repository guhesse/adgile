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
        
        console.log("PSD parsed successfully");
        console.log("Tree structure:", psd.tree().export());
        console.log("Layers count:", psd.layers.length);
        
        const elements: EditorElement[] = [];
        
        const flattenLayers = async (node: any, parentId?: string): Promise<void> => {
          if (!node) {
            console.log("Node is undefined, skipping");
            return;
          }
          
          const nodeName = node.name || "Unnamed";
          console.log(`Processing node: ${nodeName}`);
          
          try {
            console.log(`Node visible:`, node.visible && node.visible());
            console.log(`Node hidden:`, node.hidden && node.hidden());
            console.log(`Node type:`, node.type);
            console.log(`Node data:`, node.export());
          } catch (err) {
            console.error(`Error logging node ${nodeName}:`, err);
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
                const textElement = await createTextElement(node, selectedSize, parentId);
                if (textElement) {
                  console.log(`Created text element from layer: ${nodeName}`, textElement);
                  elements.push(textElement);
                }
              } else {
                const imageElement = await createImageElement(node, selectedSize, parentId);
                if (imageElement) {
                  console.log(`Created image element from layer: ${nodeName}`, imageElement);
                  elements.push(imageElement);
                } else {
                  const fallbackElement = createFallbackElement(node, selectedSize, parentId);
                  if (fallbackElement) {
                    console.log(`Created fallback element for layer: ${nodeName}`);
                    elements.push(fallbackElement);
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
              if (!layer.hidden || !layer.hidden()) {
                const isTextLayer = isLayerTypeText(layer);
                
                if (isTextLayer) {
                  const textElement = await createTextElement(layer, selectedSize);
                  if (textElement) {
                    console.log(`Created text element from direct layer: ${layer.name}`, textElement);
                    elements.push(textElement);
                  }
                } else {
                  const imageElement = await createImageElement(layer, selectedSize);
                  if (imageElement) {
                    console.log(`Created image element from direct layer: ${layer.name}`, imageElement);
                    elements.push(imageElement);
                  } else {
                    const fallbackElement = createFallbackElement(layer, selectedSize);
                    if (fallbackElement) {
                      console.log(`Created fallback element from direct layer: ${layer.name}`);
                      elements.push(fallbackElement);
                    }
                  }
                }
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
        
        console.log("Resumo da importação:", {
          total: elements.length,
          textos: textElements,
          imagens: imageElements,
          containers: containerElements
        });
        
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
    
    if (layer.type === 'type' || layer.type === 'text' || layer.type === 'TextLayer') {
      console.log(`Layer ${layer.name} is a text layer by type property: ${layer.type}`);
      return true;
    }
    
    if (layer.layer && layer.layer.info && layer.layer.info.layerKind === 3) {
      console.log(`Layer ${layer.name} is a text layer by layerKind: 3`);
      return true;
    }
    
    if (layer.info && layer.info.layerKind === 3) {
      console.log(`Layer ${layer.name} is a text layer by direct layerKind: 3`);
      return true;
    }
    
    if (layer.export && typeof layer.export === 'function') {
      const exportData = layer.export();
      if (exportData && exportData.type === 'type') {
        console.log(`Layer ${layer.name} is a text layer by export().type: type`);
        return true;
      }
      
      if (exportData && exportData.layerKind === 3) {
        console.log(`Layer ${layer.name} is a text layer by export().layerKind: 3`);
        return true;
      }
    }
    
    if (layer.text && typeof layer.text === 'function') {
      try {
        const textValue = layer.text();
        if (textValue && textValue.value && textValue.value.trim().length > 0) {
          console.log(`Layer ${layer.name} is a text layer - has text() with value: ${textValue.value}`);
          return true;
        }
        
        if (typeof textValue === 'string' && textValue.trim().length > 0) {
          console.log(`Layer ${layer.name} is a text layer - has text() returning string: ${textValue}`);
          return true;
        }
      } catch (e) {
        console.error("Error getting text content from text() function:", e);
      }
    }
    
    if (layer.get && layer.get('typeTool')) {
      console.log(`Layer ${layer.name} is a text layer - has typeTool property`);
      return true;
    }
    
    if (layer.text && typeof layer.text !== 'function' && layer.text.value) {
      console.log(`Layer ${layer.name} is a text layer - has text.value property: ${layer.text.value}`);
      return true;
    }
    
    console.log(`Layer ${layer.name} is NOT a text layer - no text indicators found`);
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
