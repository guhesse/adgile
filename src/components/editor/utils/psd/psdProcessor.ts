import { PSDFileData, TextLayerStyle } from './types';
import { extractTextLayerStyle } from './textExtractor';
import { getAllLayers } from './psdUtils';

export function getDescendants(tree: any): any[] {
    if (tree.descendants && typeof tree.descendants === 'function') {
        return tree.descendants();
    }
    console.log("Método descendants não disponível, usando alternativa");
    return getAllLayers(tree);
}

export function processLayers(
    layers: any[],
    psdData: PSDFileData,
    textLayers: Map<string, TextLayerStyle>,
    extractedImages: Map<string, string>
) {
    layers.forEach((node) => {
        try {
            if (isTextLayer(node)) {
                processTextLayer(node, psdData, textLayers);
            } else if (!node.isGroup() && node.layer?.image) {
                processImageLayer(node, extractedImages);
            }
        } catch (error) {
            console.error(`Erro ao processar camada "${node.name}":`, error);
        }
    });
}

function isTextLayer(node: any): boolean {
    return node.layer?.typeTool || (node.get && typeof node.get === 'function' && node.get('typeTool'));
}

function processTextLayer(
    node: any,
    psdData: PSDFileData,
    textLayers: Map<string, TextLayerStyle>
) {
    const activeLayerData = getActiveTextLayerData(node);
    if (activeLayerData) {
        const textStyle = extractTextLayerStyle(activeLayerData.rawData, node);

        if (!textStyle) {
            console.warn(`⚠️ Estilo de texto não encontrado para a camada "${node.name}". Verifique o textExtractor.`);
            return;
        }

        if (!textStyle.text) {
            console.warn(`⚠️ Texto vazio ou ausente na camada "${node.name}".`);
        }

        textLayers.set(node.name, textStyle);
        psdData.layers.push(createTextLayerData(node, textStyle));
    } else {
        console.warn(`⚠️ Dados da camada ativa não encontrados para "${node.name}".`);
    }
}

function processImageLayer(node: any, extractedImages: Map<string, string>) {
    try {
        const png = node.layer.image.toPng();
        if (png) {
            const imageData = png.src || png;
            extractedImages.set(node.name, imageData);
        }
    } catch {
        // Silêncio no erro de extração de imagem
    }
}

function createTextLayerData(node: any, textStyle: TextLayerStyle) {
    return {
        id: generateLayerId(node.name),
        name: node.name,
        type: 'text',
        x: node.left || 0,
        y: node.top || 0,
        width: (node.right || 0) - (node.left || 0) + 15,
        height: (node.bottom || 0) - (node.top || 0) + 10,
        textContent: textStyle.text || '',
        textStyle: textStyle
    };
}

function generateLayerId(name: string): string {
    return `layer_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now().toString(36)}`;
}

function getActiveTextLayerData(node: any) {
    if (!node) return null;

    try {
        // Algumas bibliotecas PSD exigem selecionar uma camada antes de acessar seus dados
        if (typeof node.activate === 'function') {
            node.activate();
        }

        // Verificar se a camada possui dados de texto
        if (node.layer?.typeTool) {
            const typeToolData = typeof node.layer.typeTool === 'function'
                ? node.layer.typeTool()
                : node.layer.typeTool;

            return {
                rawData: typeToolData,
                extractedData: {
                    text: typeToolData.textValue || '',
                    fonts: typeToolData.fonts ? typeToolData.fonts() : [],
                    sizes: typeToolData.sizes ? typeToolData.sizes() : [],
                    colors: typeToolData.colors ? typeToolData.colors() : [],
                    alignment: typeToolData.alignment ? typeToolData.alignment() : null
                }
            };
        }

        // Fallback para o método `get`
        if (node.get && typeof node.get === 'function') {
            const typeToolData = node.get('typeTool');
            if (typeToolData) {
                return {
                    rawData: typeToolData,
                    extractedData: {
                        text: typeToolData.textValue || '',
                        fonts: typeToolData.fonts ? typeToolData.fonts() : [],
                        sizes: typeToolData.sizes ? typeToolData.sizes() : [],
                        colors: typeToolData.colors ? typeToolData.colors() : [],
                        alignment: typeToolData.alignment ? typeToolData.alignment() : null
                    }
                };
            }
        }
    } catch (error) {
        console.error(`Erro ao obter dados da camada ativa "${node.name}":`, error);
    }

    return null;
}
