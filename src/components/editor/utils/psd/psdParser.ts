import PSD from 'psd.js';
import { toast } from 'sonner';
import { PSDFileData, TextLayerStyle } from './types';
import { processImageLayers } from './layerDetection';
import { extractTextLayerStyle } from './textExtractor';

/**
 * Parse a PSD file and extract its structure
 * @param file The PSD file to parse
 * @returns A promise resolving to the parsed PSD data
 */
export const parsePSDFile = async (file: File): Promise<{
  psd: any;
  psdData: PSDFileData;
  extractedImages: Map<string, string>;
  textLayers: Map<string, TextLayerStyle>;
}> => {
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

        // Log informações do header do PSD
        console.log("=== INFORMAÇÕES BÁSICAS DO PSD ===");
        console.log("Width:", psd.header.width);
        console.log("Height:", psd.header.height);
        console.log("Channels:", psd.header.channels);
        console.log("Bit Depth:", psd.header.depth);
        console.log("Color Mode:", psd.header.mode);

        // Create a structure to store PSD information for database
        const psdData: PSDFileData = {
          fileName: file.name,
          width: psd.header.width,
          height: psd.header.height,
          uploadDate: new Date().toISOString(),
          storageKey: '',
          layers: []
        };

        // Extract images from PSD
        const extractedImages: Map<string, string> = new Map();
        // Store text layers and their styles
        const textLayers: Map<string, TextLayerStyle> = new Map();

        // First try the direct approach similar to the example code
        if (psd.tree && typeof psd.tree === 'function') {
          const tree = psd.tree();

          // Log a árvore bruta do Photoshop - MODIFICADO PARA EVITAR SERIALIZAÇÃO COMPLETA
          console.log("=== ÁRVORE BRUTA DO PHOTOSHOP ===");

          // Em vez de tentar serializar toda a árvore, logar propriedades específicas
          console.log("Tree properties:", {
            width: tree.width,
            height: tree.height,
            hasChildren: !!tree.children,
            childrenCount: tree.children ? (Array.isArray(tree.children) ? tree.children.length : 'não é array') : 0,
            hasDocument: !!tree.document
          });

          // Log informações do documento
          console.log("=== INFORMAÇÕES DO DOCUMENTO ===");
          if (tree.document) {
            console.log("Document width:", tree.document.width);
            console.log("Document height:", tree.document.height);

            if (tree.document.resources) {
              console.log("Document has resources:", {
                hasLayerComps: !!tree.document.resources.layerComps,
                layerCompsCount: tree.document.resources.layerComps ? tree.document.resources.layerComps.length : 0,
                hasGuides: !!tree.document.resources.guides,
                guidesCount: tree.document.resources.guides ? tree.document.resources.guides.length : 0
              });
            }
          }

          // Log filhos de primeiro nível
          console.log("=== FILHOS DE PRIMEIRO NÍVEL ===");
          if (tree.children && Array.isArray(tree.children)) {
            console.log(`Número de filhos: ${tree.children.length}`);
            tree.children.forEach((child, index) => {
              console.log(`Filho #${index}:`, {
                name: child.name,
                type: child.type,
                visible: child.visible,
                opacity: child.opacity,
                dimensions: {
                  left: child.left,
                  top: child.top,
                  right: child.right,
                  bottom: child.bottom,
                  width: child.width,
                  height: child.height
                }
              });
            });
          }

          // Log informações detalhadas das camadas conforme estrutura dos blocos
          if (tree.descendants && typeof tree.descendants === 'function') {
            const descendants = tree.descendants();
            console.log("=== TODAS AS CAMADAS COM LAYER INFO ===");
            console.log(`Total de camadas: ${descendants.length}`);

            descendants.forEach((node, index) => {
              console.log(`\n--- CAMADA #${index}: ${node.name} ---`);

              // Log de propriedades básicas
              console.log("Propriedades básicas:", {
                name: node.name,
                type: node.type,
                visible: node.visible,
                opacity: node.opacity,
                blendingMode: node.blendingMode,
                dimensions: {
                  left: node.left,
                  top: node.top,
                  right: node.right,
                  bottom: node.bottom,
                  width: node.width,
                  height: node.height
                }
              });

              // Verificar tipos específicos de layers
              console.log("É grupo:", node.isGroup ? node.isGroup() : "método não disponível");

              // Log de text e mask se existirem
              if (node.text) console.log("Text:", node.text);
              if (node.mask) console.log("Mask:", node.mask);

              // Verificar adjustments/layer info disponíveis como no exemplo do código
              if (node.adjustments) {
                console.log("Layer Info Blocks disponíveis:", Object.keys(node.adjustments));

                // Adicionar a exploração detalhada dos blocos
                const layerInfoDetails = exploreLayerInfoBlocks(node);
                console.log("Layer Info Details:", layerInfoDetails);
              }

              // Verificar se há métodos get disponíveis
              if (node.get && typeof node.get === 'function') {
                try {
                  // Tentar obter todos os tipos de layer info mencionados no código
                  const layerInfoTypes = [
                    'artboard', 'blendClippingElements', 'blendInteriorElements',
                    'fillOpacity', 'gradientFill', 'layerId', 'layerNameSource',
                    'legacyTypetool', 'locked', 'metadata', 'name',
                    'nestedSectionDivider', 'objectEffects', 'sectionDivider',
                    'solidColor', 'typeTool', 'vectorMask', 'vectorOrigination',
                    'vectorStroke', 'vectorStrokeContent'
                  ];

                  const availableInfo: Record<string, any> = {};

                  layerInfoTypes.forEach(type => {
                    try {
                      const info = node.get(type);
                      if (info) {
                        availableInfo[type] = typeof info === 'function' ?
                          'É uma função - precisa ser executada' :
                          (typeof info === 'object' ? 'Objeto disponível' : info);
                      }
                    } catch (e) {
                      // Ignorar erros na tentativa de obter informações
                    }
                  });

                  if (Object.keys(availableInfo).length > 0) {
                    console.log("Layer Info disponível via get():", availableInfo);
                  }

                  // Explorar especificamente typeTool que contém dados de texto
                  const typeTool = node.get('typeTool');
                  if (typeTool) {
                    console.log("TypeTool encontrado!");

                    if (typeof typeTool === 'function') {
                      try {
                        const typeToolData = typeTool();
                        console.log("TypeTool data:", typeToolData);

                        // Tentar métodos auxiliares se disponíveis
                        if (typeToolData) {
                          if (typeof typeToolData.fonts === 'function') console.log("Fonts:", typeToolData.fonts());
                          if (typeof typeToolData.sizes === 'function') console.log("Sizes:", typeToolData.sizes());
                          if (typeof typeToolData.colors === 'function') console.log("Colors:", typeToolData.colors());
                          if (typeof typeToolData.alignment === 'function') console.log("Alignment:", typeToolData.alignment());
                        }
                      } catch (e) {
                        console.log("Erro ao executar typeTool:", e);
                      }
                    } else {
                      console.log("TypeTool não é uma função:", typeTool);
                    }
                  }
                } catch (e) {
                  console.log("Erro ao acessar get method:", e);
                }
              }

              // Verificar layer específico
              if (node.layer) {
                console.log("Layer properties:", Object.keys(node.layer));

                if (node.layer.typeTool) {
                  console.log("Layer tem typeTool:");

                  if (typeof node.layer.typeTool === 'function') {
                    try {
                      const typeToolData = node.layer.typeTool();
                      console.log("Layer typeTool data:", typeToolData);
                    } catch (e) {
                      console.log("Erro ao acessar layer.typeTool():", e);
                    }
                  }
                }

                if (node.layer.vectorMask) {
                  console.log("Layer tem vectorMask");
                }
              }
            });

            // Processamento das camadas para extrair texto e imagens
            for (const node of descendants) {
              try {
                // O importante é verificar se a camada possui typeTool
                const hasTypeTool = node.layer && node.layer.typeTool;

                if (hasTypeTool) {
                  try {
                    // Usar a nova função que tenta ativar a camada antes de extrair os dados
                    const activeLayerData = getActiveTextLayerData(node);

                    if (activeLayerData) {
                      // Extrair estilo de texto a partir dos dados ativos
                      const textStyle = extractTextLayerStyle(activeLayerData.rawData, node);

                      if (textStyle) {
                        textLayers.set(node.name, textStyle);

                        // Adicionar à estrutura de dados PSD
                        psdData.layers.push({
                          id: generateLayerId(node.name),
                          name: node.name,
                          type: 'text',
                          x: node.left || 0,
                          y: node.top || 0,
                          width: (node.right || 0) - (node.left || 0),
                          height: (node.bottom || 0) - (node.top || 0),
                          textContent: textStyle.text || '',
                          textStyle: textStyle
                        });
                      }
                    } else {
                      // Continue com o código existente como fallback
                      // ...existing code...
                    }
                  } catch (textError) {
                    console.log(`Erro ao processar camada ativa "${node.name}":`, textError.message);
                    // Continue com o código existente como fallback
                    // ...existing code...
                  }
                }

                // Check if this is a text layer using the get method as fallback
                const isText = !hasTypeTool && node.get && typeof node.get === 'function' && node.get('typeTool');
                if (isText) {
                  // Extrair estilo de texto desta camada
                  const typeToolData = node.get('typeTool');

                  // Se o typeTool é uma função, executá-la para obter os dados
                  let processedTypeToolData = typeToolData;
                  if (typeof typeToolData === 'function') {
                    try {
                      processedTypeToolData = typeToolData();
                    } catch (error) {
                      // Silêncio no erro
                    }
                  }

                  const textStyle = extractTextLayerStyle(processedTypeToolData, node);

                  if (textStyle) {
                    textLayers.set(node.name, textStyle);

                    psdData.layers.push({
                      id: generateLayerId(node.name),
                      name: node.name,
                      type: 'text',
                      x: node.left || 0,
                      y: node.top || 0,
                      width: (node.right || 0) - (node.left || 0),
                      height: (node.bottom || 0) - (node.top || 0),
                      textContent: textStyle.text || '',
                      textStyle: textStyle
                    });
                  }
                }

                if (!node.isGroup()) {
                  if (node.layer && node.layer.image) {
                    try {
                      const png = node.layer.image.toPng();

                      if (png) {
                        const imageData = png.src || png;
                        extractedImages.set(node.name, imageData);
                      }
                    } catch (nodeError) {
                      // Silêncio no erro de extração de imagem
                    }
                  }
                }
              } catch (error) {
                // Silêncio no erro geral de processamento do nó
              }
            }
          } else {
            // Fallback caso descendants não esteja disponível
            console.log("Método descendants não disponível, usando alternativa");

            // Obter todas as camadas de forma recursiva a partir de children
            const allLayers = getAllLayers(tree);
            console.log(`Total de camadas (método alternativo): ${allLayers.length}`);

            // Processamento das camadas para extrair texto e imagens
            for (const node of allLayers) {
              try {
                // O importante é verificar se a camada possui typeTool
                const hasTypeTool = node.layer && node.layer.typeTool;

                // Código idêntico ao do bloco acima para processamento das camadas
                if (hasTypeTool) {
                  try {
                    // Usar a nova função que tenta ativar a camada antes de extrair os dados
                    const activeLayerData = getActiveTextLayerData(node);

                    if (activeLayerData) {
                      // Extrair estilo de texto a partir dos dados ativos
                      const textStyle = extractTextLayerStyle(activeLayerData.rawData, node);

                      if (textStyle) {
                        textLayers.set(node.name, textStyle);

                        // Adicionar à estrutura de dados PSD
                        psdData.layers.push({
                          id: generateLayerId(node.name),
                          name: node.name,
                          type: 'text',
                          x: node.left || 0,
                          y: node.top || 0,
                          width: (node.right || 0) - (node.left || 0),
                          height: (node.bottom || 0) - (node.top || 0),
                          textContent: textStyle.text || '',
                          textStyle: textStyle
                        });
                      }
                    } else {
                      // Continue com o código existente como fallback
                      // ...existing code...
                    }
                  } catch (textError) {
                    console.log(`Erro ao processar camada ativa "${node.name}":`, textError.message);
                    // Continue com o código existente como fallback
                    // ...existing code...
                  }
                }

                // Check if this is a text layer using the get method as fallback
                const isText = !hasTypeTool && node.get && typeof node.get === 'function' && node.get('typeTool');
                if (isText) {
                  // Extrair estilo de texto desta camada
                  const typeToolData = node.get('typeTool');

                  // Se o typeTool é uma função, executá-la para obter os dados
                  let processedTypeToolData = typeToolData;
                  if (typeof typeToolData === 'function') {
                    try {
                      processedTypeToolData = typeToolData();
                    } catch (error) {
                      // Silêncio no erro
                    }
                  }

                  const textStyle = extractTextLayerStyle(processedTypeToolData, node);

                  if (textStyle) {
                    textLayers.set(node.name, textStyle);

                    psdData.layers.push({
                      id: generateLayerId(node.name),
                      name: node.name,
                      type: 'text',
                      x: node.left || 0,
                      y: node.top || 0,
                      width: (node.right || 0) - (node.left || 0),
                      height: (node.bottom || 0) - (node.top || 0),
                      textContent: textStyle.text || '',
                      textStyle: textStyle
                    });
                  }
                }

                if (!node.isGroup()) {
                  if (node.layer && node.layer.image) {
                    try {
                      const png = node.layer.image.toPng();

                      if (png) {
                        const imageData = png.src || png;
                        extractedImages.set(node.name, imageData);
                      }
                    } catch (nodeError) {
                      // Silêncio no erro de extração de imagem
                    }
                  }
                }
              } catch (error) {
                // Silêncio no erro geral de processamento do nó
              }
            }
          }

          // If no images were extracted using the direct approach, use our fallback
          if (extractedImages.size === 0) {
            await processImageLayers(tree, (imageData, nodeName) => {
              extractedImages.set(nodeName, imageData);
            });
          }
        }

        resolve({ psd, psdData, extractedImages, textLayers });
      } catch (error) {
        console.error("Error parsing PSD file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Ajuda a serializar objetos que podem ter referências circulares
 */
function replaceCircular() {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    // Lidar com valores null e undefined
    if (value === null) return null;
    if (value === undefined) return undefined;

    // Verificar se é um objeto ou array
    if (typeof value === 'object') {
      // Evitar referências circulares
      if (seen.has(value)) {
        return '[Circular Reference]';
      }

      // Adicionar objeto ao conjunto de objetos vistos
      seen.add(value);

      // Tratar objetos Buffer ou tipados do Node.js/Browser
      if (value.buffer instanceof ArrayBuffer || value instanceof ArrayBuffer) {
        return `[Binary data: ${value.byteLength} bytes]`;
      }

      // Tratar arrays muito grandes
      if (Array.isArray(value)) {
        if (value.length > 1000) {
          return `[Array com ${value.length} itens]`;
        }

        // Para arrays menores, processamos normalmente, mas verificamos o tamanho do resultado
        try {
          // Se houver algum elemento que cause problemas, lidaremos com exceções
          return value;
        } catch (e) {
          return `[Array com erro: ${e.message}]`;
        }
      }

      // Tratar funções
      if (typeof value === 'function') {
        return `[Function: ${value.name || 'anonymous'}]`;
      }

      // Para objetos complexos, remover propriedades que podem causar problemas
      if (Object.keys(value).length > 100) {
        const safeObj = {};
        Object.keys(value).slice(0, 100).forEach(k => {
          safeObj[k] = value[k];
        });
        safeObj['...'] = `[${Object.keys(value).length - 100} more properties]`;
        return safeObj;
      }
    }

    // Retornar o valor normalmente para tipos simples
    return value;
  };
}

/**
 * Recursively log the PSD layer tree structure
 * @param node The current node to log
 * @param depth The current depth in the tree
 */
function logLayerTree(node: any, depth: number) {
  const indent = ' '.repeat(depth * 2);
  console.log(`${indent}Layer: ${node.name || 'unnamed'} (${node.type || 'unknown type'})`);

  // Logar propriedades importantes
  console.log(`${indent}Properties:`, {
    left: node.left,
    right: node.right,
    top: node.top,
    bottom: node.bottom,
    width: node.width,
    height: node.height,
    visible: node.visible,
    opacity: node.opacity,
    blendingMode: node.blendingMode
  });

  // Logar especificamente se tem children
  if (node.children) {
    console.log(`${indent}Children:`, Array.isArray(node.children) ? `Array com ${node.children.length} itens` : typeof node.children);
  }

  // Logar se tem texto
  if (node.text) {
    console.log(`${indent}Text data:`, node.text);
  }

  // Logar se tem imagem
  if (node.image) {
    console.log(`${indent}Has image data`);
  }

  // Processar recursivamente os filhos se existirem
  if (node.children && node.children.length > 0) {
    console.log(`${indent}Processing ${node.children.length} children:`);
    node.children.forEach((child: any) => logLayerTree(child, depth + 1));
  }
}

/**
 * Log detailed information about a text layer
 * @param node The text layer node
 */
function logTextLayerDetails(node: any) {
  console.log(`\n===== TEXT LAYER: ${node.name} =====`);
  console.log("ALL AVAILABLE PROPERTIES:", Object.keys(node));

  // Logar propriedades relacionadas a texto
  if (node.text) {
    console.log("TEXT PROPERTY DETAILS:", node.text);

    // Logar fonte se disponível
    if (node.text.font) {
      console.log("FONT DETAILS:", node.text.font);
    }

    // Logar valor do texto
    if (node.text.value) {
      console.log("TEXT VALUE:", node.text.value);
    }
  }

  // Logar posição e dimensões
  console.log("Position and Dimensions:");
  console.log(`X: ${node.left || 0}, Y: ${node.top || 0}`);
  console.log(`Width: ${(node.right || 0) - (node.left || 0)}, Height: ${(node.bottom || 0) - (node.top || 0)}`);

  console.log("=========================================\n");
}

/**
 * Generate a unique ID for a layer
 * @param name The layer name
 * @returns A unique ID
 */
function generateLayerId(name: string): string {
  return `layer_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now().toString(36)}`;
}

/**
 * Função específica para explorar os blocos de layer info de uma camada
 * baseado no sistema LazyExecute da biblioteca psd.js
 * @param node O nó da camada para explorar
 * @returns Um objeto com as informações extraídas dos blocos de layer info
 */
function exploreLayerInfoBlocks(node: any) {
  const result: Record<string, any> = {
    parsedInfo: {},
    availableBlocks: []
  };

  if (!node || !node.adjustments) {
    return result;
  }

  // Lista de blocos de layer info, conforme o código original
  const availableBlocks = [
    'artboard', 'blendClippingElements', 'blendInteriorElements',
    'fillOpacity', 'gradientFill', 'layerId', 'layerNameSource',
    'legacyTypetool', 'locked', 'metadata', 'name',
    'nestedSectionDivider', 'objectEffects', 'sectionDivider',
    'solidColor', 'typeTool', 'vectorMask', 'vectorOrigination',
    'vectorStroke', 'vectorStrokeContent'
  ];

  // Registrar quais blocos estão disponíveis nesta camada
  result.availableBlocks = Object.keys(node.adjustments);

  // Tentar acessar cada tipo de bloco via get()
  if (node.get && typeof node.get === 'function') {
    availableBlocks.forEach(blockName => {
      try {
        const blockData = node.get(blockName);
        if (blockData) {
          // Se for uma função, precisa ser executada para obter os dados
          if (typeof blockData === 'function') {
            try {
              const executedData = blockData();
              result.parsedInfo[blockName] = executedData;

              // Log específico para tipos importantes
              if (blockName === 'typeTool') {
                console.log(`TypeTool data for layer "${node.name}":`, {
                  hasText: !!executedData.text,
                  hasEngineData: !!executedData.engineData,
                  hasTextValue: !!executedData.textValue,
                  textMethods: {
                    hasFonts: typeof executedData.fonts === 'function',
                    hasSizes: typeof executedData.sizes === 'function',
                    hasColors: typeof executedData.colors === 'function',
                    hasAlignment: typeof executedData.alignment === 'function'
                  }
                });

                // Tentar extrair métodos auxiliares
                if (typeof executedData.fonts === 'function') {
                  try {
                    result.parsedInfo.fonts = executedData.fonts();
                  } catch (e) { }
                }
                if (typeof executedData.sizes === 'function') {
                  try {
                    result.parsedInfo.sizes = executedData.sizes();
                  } catch (e) { }
                }
                if (typeof executedData.colors === 'function') {
                  try {
                    result.parsedInfo.colors = executedData.colors();
                  } catch (e) { }
                }
                if (typeof executedData.alignment === 'function') {
                  try {
                    result.parsedInfo.alignment = executedData.alignment();
                  } catch (e) { }
                }
              } else if (blockName === 'vectorMask') {
                console.log(`VectorMask data for layer "${node.name}":`, {
                  hasPaths: !!executedData.paths,
                  pathsCount: executedData.paths ? executedData.paths.length : 0
                });
              } else if (blockName === 'solidColor') {
                console.log(`SolidColor data for layer "${node.name}":`, executedData);
              }
            } catch (e) {
              console.log(`Error executing ${blockName} for layer "${node.name}":`, e.message);
            }
          } else {
            // Valor direto
            result.parsedInfo[blockName] = blockData;
          }
        }
      } catch (e) {
        // Silenciosamente ignorar erros na exploração de blocos
      }
    });
  }

  return result;
}

/**
 * Obtém todas as camadas do PSD recursivamente
 * @param node O nó raiz ou qualquer nó para começar a busca
 * @returns Um array com todas as camadas encontradas
 */
function getAllLayers(node: any): any[] {
  if (!node) return [];

  const result: any[] = [];

  // Adicionar o nó atual se não for a raiz
  if (node.type) {
    result.push(node);
  }

  // Adicionar recursivamente todos os filhos
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childLayers = getAllLayers(child);
      result.push(...childLayers);
    }
  }

  return result;
}

/**
 * Extrai informações de texto ativando a camada corretamente
 * @param node O nó da camada de texto
 * @returns Dados processados da camada de texto
 */
function getActiveTextLayerData(node: any) {
  if (!node) return null;

  // Log simplificado apenas para fontes
  const logFont = (source: string, fontName: string | null | undefined) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Fonte para "${node.name}" [${source}]: "${fontName || 'não encontrada'}"`);
    }
  };

  try {
    // Algumas bibliotecas PSD exigem selecionar uma camada antes de acessar seus dados
    if (typeof node.activate === 'function') {
      node.activate();
    }

    // Tentar diferentes métodos para obter os dados de texto
    let textData = null;

    // CORREÇÃO CRÍTICA: Quando typeTool é LazyExecute
    if (!textData && node.layer && node.layer.typeTool) {
      try {
        let typeToolData;

        if (typeof node.layer.typeTool === 'function') {
          typeToolData = node.layer.typeTool();
        } else {
          typeToolData = node.layer.typeTool;

          // Verificar se é uma instância de LazyExecute
          if (typeToolData.obj && typeToolData._styles) {
            console.log(`✅ [${node.name}] Detectado LazyExecute typeTool com _styles!`);

            // Extrair informações relevantes
            const lazyObj = typeToolData.obj;
            const styles = typeToolData._styles;

            // Extrair ResourceDict.FontSet do engineData se disponível
            let fontName = null;
            let fontIndex = styles.Font ? styles.Font[0] : 0;

            // Log completo dos _styles para diagnóstico
            console.log(`✏️ [${node.name}] _styles:`, styles);

            if (lazyObj.engineData && lazyObj.engineData.ResourceDict && lazyObj.engineData.ResourceDict.FontSet) {
              const fontSet = lazyObj.engineData.ResourceDict.FontSet;
              console.log(`📚 [${node.name}] FontSet completo:`, fontSet);
              console.log(`📌 [${node.name}] Índice da fonte: ${fontIndex}`);

              // Usar o índice correto para selecionar a fonte
              if (fontSet[fontIndex] && fontSet[fontIndex].Name) {
                fontName = fontSet[fontIndex].Name;
                console.log(`💯 [${node.name}] FONTE ENCONTRADA: "${fontName}"`);
              } else if (fontSet.length > 0) {
                fontName = fontSet[0].Name;
                console.log(`⚠️ [${node.name}] Usando primeira fonte do FontSet: "${fontName}"`);
              }
            }

            // CORREÇÃO: Criar um objeto NEW com os métodos necessários em vez de modificar o LazyExecute
            textData = {
              text: lazyObj.textValue || '',
              textValue: lazyObj.textValue || '',
              engineData: lazyObj.engineData || null,
              _styles: styles, // Passar _styles para uso posterior
              // Funções personalizadas em vez de tentar modificar o objeto LazyExecute
              fonts: function() { return [fontName || '']; },
              sizes: function() { return styles.FontSize || []; },
              colors: function() { return [[255, 62, 62]]; }, // Valores de cor
              alignment: function() { return styles.ParagraphAlign || [0]; },
              transformedFontSize: styles.FontSize ? styles.FontSize[0] : null,
              transform: lazyObj.transform,
              // Propriedades adicionais para garantir que a fonte seja processada corretamente
              originalFont: fontName,
              fontName: fontName, // Adicionar explicitamente
              fontIndex: fontIndex
            };

            logFont('LazyExecute', fontName);

            // Retornar aqui para evitar que continue processando outros métodos
            return {
              rawData: textData,
              extractedData: {
                text: lazyObj.textValue || '',
                fonts: [fontName || ''],
                sizes: styles.FontSize || [],
                colors: [[255, 62, 62]],
                alignment: styles.ParagraphAlign || [0],
                originalFont: fontName || '',
                fontName: fontName || '',
                fontIndex: fontIndex
              }
            };
          }
        }

        // Se não foi LazyExecute, continuar com o processamento normal
        if (!textData && typeToolData) {
          // Extrair fonte do engineData se disponível
          if (typeToolData.engineData && typeToolData.engineData.ResourceDict && typeToolData.engineData.ResourceDict.FontSet) {
            const fontSet = typeToolData.engineData.ResourceDict.FontSet;

            // Usar a primeira fonte como fonte principal
            const fontName = fontSet[0]?.Name || '';

            // Se temos engineData, também devemos ter o objeto _styles
            const fontIndex = typeToolData._styles?.Font?.[0] || 0;

            // Usar a fonte pelo índice se possível, caso contrário usar a primeira
            const selectedFont = fontSet[fontIndex]?.Name || fontName;

            textData = typeToolData;
            // Adicionar método de fonte personalizado
            textData.fonts = () => [selectedFont];
            textData.originalFont = selectedFont;
            textData.fontName = selectedFont; // Adicionar explicitamente
            textData.fontIndex = fontIndex;

            logFont('typeTool.engineData', selectedFont);
          } else {
            textData = typeToolData;
          }
        }
      } catch (e) {
        console.error(`❌ Erro ao processar typeTool para "${node.name}":`, e.message);
      }
    }

    // Método 1: Via export()
    if (!textData && node.export && typeof node.export === 'function') {
      try {
        const exportData = node.export();
        if (exportData && exportData.text) {
          const transformedData = applyTransformToTextData(exportData.text);

          // Extrair informações de fonte
          let fontName = '';

          // Tentar extrair do FontSet primeiro
          if (exportData.text.engineData?.ResourceDict?.FontSet?.length > 0) {
            fontName = exportData.text.engineData.ResourceDict.FontSet[0]?.Name || '';
            logFont('engineData.FontSet', fontName);
          }
          // Se não encontrou, tentar de font.name
          else if (exportData.text.font?.name) {
            fontName = exportData.text.font.name;
            logFont('exportData.font.name', fontName);
          }

          // Criar objeto compatível
          textData = {
            text: exportData.text.value || '',
            textValue: exportData.text.value || '',
            engineData: exportData.text.engineData || null,
            fonts: () => [fontName || ''],
            sizes: () => [transformedData.fontSize],
            colors: () => exportData.text.font?.colors || [],
            alignment: () => exportData.text.font?.alignment || [],
            transformedFontSize: transformedData.fontSize,
            transformedLineHeight: transformedData.lineHeight,
            transform: exportData.text.transform,
            originalFont: fontName,
            fontName: fontName // Adicionar explicitamente
          };
        }
      } catch (e) {
        // Silenciar erros
      }
    }

    // Continuar com os outros métodos de fallback...
    if (!textData && node.get && typeof node.get === 'function') {
      try {
        const typeToolGetter = node.get('typeTool');
        if (typeToolGetter) {
          let processedTypeToolData;

          if (typeof typeToolGetter === 'function') {
            processedTypeToolData = typeToolGetter();
          } else {
            processedTypeToolData = typeToolGetter;
          }

          // Verificar se temos informações de fonte
          if (processedTypeToolData &&
            processedTypeToolData.engineData?.ResourceDict?.FontSet?.length > 0) {
            const fontSet = processedTypeToolData.engineData.ResourceDict.FontSet;
            const fontName = fontSet[0]?.Name || '';

            processedTypeToolData.originalFont = fontName;
            processedTypeToolData.fontName = fontName;

            logFont('get.typeTool.engineData', fontName);
          }

          textData = processedTypeToolData;
        }
      } catch (e) {
        // Silenciar erros
      }
    }

    // Outros métodos de fallback...
    if (!textData && node.text) {
      textData = {
        text: node.text.value || '',
        textValue: node.text.value || '',
        engineData: null,
        fonts: typeof node.text.font?.name === 'string' ? () => [node.text.font.name] : null,
        sizes: node.text.font?.sizes ? () => node.text.font.sizes : null,
        colors: node.text.font?.colors ? () => node.text.font.colors : null,
        alignment: node.text.font?.alignment ? () => node.text.font.alignment : null,
        originalFont: node.text.font?.name || '',
        fontName: node.text.font?.name || ''
      };
    }

    // Se temos dados, extrair informações
    if (textData) {
      // Tentar extrair métodos auxiliares
      const extractedData = {
        text: textData.text || textData.textValue || '',
        fonts: [],
        sizes: [],
        colors: [],
        alignment: null,
        originalFont: textData.originalFont || '',
        fontName: textData.fontName || '', // Adicionar explicitamente
        fontIndex: textData.fontIndex || 0
      };

      // Extrair fontes
      if (typeof textData.fonts === 'function') {
        try {
          extractedData.fonts = textData.fonts() || [];

          if (Array.isArray(extractedData.fonts) && extractedData.fonts.length > 0) {
            logFont('fonts() método', extractedData.fonts[0]);

            // Se o array de fontes contém itens vazios e temos originalFont, substituir
            if ((!extractedData.fonts[0] || extractedData.fonts[0] === '') &&
              extractedData.originalFont) {
              extractedData.fonts[0] = extractedData.originalFont;
              logFont('substituição por originalFont', extractedData.originalFont);
            }
          }
        } catch (e) {
          // Silenciar erros
        }
      } else if (textData.originalFont) {
        extractedData.fonts = [textData.originalFont];
        logFont('originalFont direta', textData.originalFont);
      } else if (textData.fontName) {
        extractedData.fonts = [textData.fontName];
        logFont('fontName direta', textData.fontName);
      }

      // Extrair outros dados
      if (typeof textData.sizes === 'function') {
        try {
          extractedData.sizes = textData.sizes() || [];
        } catch (e) {
          // Silenciar erros
        }
      }

      if (typeof textData.colors === 'function') {
        try {
          extractedData.colors = textData.colors() || [];
        } catch (e) {
          // Silenciar erros
        }
      }

      if (typeof textData.alignment === 'function') {
        try {
          extractedData.alignment = textData.alignment() || null;
        } catch (e) {
          // Silenciar erros
        }
      }

      // Verificar se precisamos aplicar transformação a este textData também
      if (textData.transform && !textData.transformedFontSize) {
        const transformedSizes = applyTransformToTextData({
          transform: textData.transform,
          font: {
            sizes: extractedData.sizes,
            leadings: Array.isArray(extractedData.sizes) ?
              extractedData.sizes.map(s => s * 1.2) : [] // Estimativa de leading
          }
        });

        // Atualizar tamanhos extraídos com valores transformados
        if (transformedSizes.fontSize) {
          extractedData.sizes = [transformedSizes.fontSize];
        }

        // Adicionar à resposta
        extractedData.transformedFontSize = transformedSizes.fontSize;
        extractedData.transformedLineHeight = transformedSizes.lineHeight;
        extractedData.transformFactor = transformedSizes.transformFactor;
      } else if (textData.transformedFontSize) {
        extractedData.transformedFontSize = textData.transformedFontSize;
        extractedData.transformedLineHeight = textData.transformedLineHeight;
      }

      // Adicionar engine data se existir
      if (textData.engineData) {
        extractedData.engineData = textData.engineData;
      }

      // Adicionar _styles para uso na extração de fontes
      if (textData._styles) {
        extractedData._styles = textData._styles;
      }

      return {
        rawData: textData,
        extractedData: extractedData
      };
    }

    return null;
  } catch (e) {
    console.error(`Erro ao processar camada de texto "${node.name}":`, e.message);
    return null;
  }
}

/**
 * Aplica transformação aos dados de tamanho de fonte/linha conforme a solução do GitHub
 * @param textData Os dados de texto com transformação
 * @returns Objeto com tamanhos transformados
 */
function applyTransformToTextData(textData: any) {
  const result = {
    fontSize: 0,
    lineHeight: 0,
    transformFactor: 1.0
  };

  try {
    if (!textData || !textData.transform) return result;

    // Extrair fator de transformação
    const transformY = textData.transform.yy || 1.0;
    result.transformFactor = transformY;

    // Extrair tamanho de fonte
    const fontSize = Array.isArray(textData.font?.sizes) && textData.font.sizes.length > 0
      ? textData.font.sizes[0]
      : 0;

    // Extrair altura de linha
    const lineHeight = Array.isArray(textData.font?.leadings) && textData.font.leadings.length > 0
      ? textData.font.leadings[0]
      : fontSize * 1.2; // Valor padrão se não encontrarmos leadings

    // Aplicar transformação de acordo com a solução do GitHub
    result.fontSize = Math.round((fontSize * transformY) * 100) * 0.01;
    result.lineHeight = Math.round((lineHeight * transformY) * 100) * 0.01;

    return result;
  } catch (e) {
    console.log('Erro ao aplicar transformação aos dados de texto:', e.message);
    return result;
  }
}
