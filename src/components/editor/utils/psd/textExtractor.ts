
import { TextLayerStyle } from './types';
import { mapPSDFontToWebFont } from './fontMapper';

/**
 * Extrai o estilo de texto de uma camada PSD
 * @param textData Dados de texto obtidos do método typeTool()
 * @param node Nó da camada
 * @returns Estilo de texto extraído ou null se não for possível extrair
 */
export const extractTextLayerStyle = (textData: any, node: any): TextLayerStyle | null => {
    if (!textData) {
        console.log(`Sem dados de texto para a camada: ${node.name}`);
        return null;
    }

    try {
        console.log(`Extraindo estilo de texto para: ${node.name}`);

        // Inicializar o objeto de estilo de texto com valores padrão
        const textStyle: TextLayerStyle = {
            text: '',
            fontFamily: 'Roboto, sans-serif', // Default to Roboto
            fontSize: 14,
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            alignment: 'left',
            letterSpacing: 0,
            lineHeight: 1.2
        };

        // Extrair o texto
        if (textData.textValue) {
            textStyle.text = textData.textValue;
        } else if (textData.text) {
            textStyle.text = textData.text;
        }

        // Tentar obter informações via métodos auxiliares da biblioteca
        try {
            if (typeof textData.fonts === 'function') {
                const fonts = textData.fonts();
                if (fonts && fonts.length > 0) {
                    // Usar a primeira fonte válida e remover possíveis variantes no nome
                    const validFonts = fonts.filter((font: string) => 
                        font !== 'AdobeInvisFont' && font !== 'MyriadPro-Regular');
                    
                    if (validFonts.length > 0) {
                        console.log(`Fonte válida encontrada: ${validFonts[0]}`);
                        
                        // Mapear a fonte do PSD para uma fonte web
                        const mappedFont = mapPSDFontToWebFont(validFonts[0]);
                        textStyle.fontFamily = mappedFont;
                        console.log(`Fonte mapeada: ${validFonts[0]} -> ${mappedFont}`);
                        
                        // Detectar variantes da fonte para definir o estilo e o peso corretamente
                        if (validFonts[0].includes('-Bold')) {
                            textStyle.fontWeight = 'bold';
                            console.log('Fonte em negrito detectada');
                        } else if (validFonts[0].includes('-Light')) {
                            textStyle.fontWeight = '300';
                            console.log('Fonte light detectada');
                        } else if (validFonts[0].includes('-Medium')) {
                            textStyle.fontWeight = '500';
                            console.log('Fonte medium detectada');
                        } else if (validFonts[0].includes('-Black')) {
                            textStyle.fontWeight = '900';
                            console.log('Fonte black detectada');
                        }
                        
                        if (validFonts[0].includes('-Italic')) {
                            textStyle.fontStyle = 'italic';
                            console.log('Fonte itálica detectada');
                        }
                    }
                }
                console.log(`Fontes encontradas via método fonts(): ${fonts}`);
                console.log(`Fonte processada e aplicada: ${textStyle.fontFamily} (${textStyle.fontWeight}, ${textStyle.fontStyle})`);
            }

            if (typeof textData.sizes === 'function') {
                const sizes = textData.sizes();
                if (sizes && sizes.length > 0) {
                    textStyle.fontSize = sizes[0];
                    console.log(`Tamanho de fonte aplicado: ${textStyle.fontSize}px`);
                }
                console.log(`Tamanhos encontrados via método sizes(): ${sizes}`);
            }

            if (typeof textData.colors === 'function') {
                const colors = textData.colors();
                if (colors && colors.length > 0) {
                    // Converta a cor para o formato hexadecimal
                    const color = colors[0];
                    if (Array.isArray(color) && color.length >= 3) {
                        const r = Math.min(255, Math.max(0, Math.round(color[0])));
                        const g = Math.min(255, Math.max(0, Math.round(color[1])));
                        const b = Math.min(255, Math.max(0, Math.round(color[2])));
                        textStyle.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                        console.log(`Cor aplicada: ${textStyle.color} [R:${r}, G:${g}, B:${b}]`);
                    }
                }
                console.log(`Cores encontradas via método colors(): ${colors}`);
            }

            if (typeof textData.alignment === 'function') {
                const alignment = textData.alignment();
                if (alignment) {
                    // Mapeie o valor numérico para string: 'left', 'center', 'right', 'justify'
                    const alignmentMap: { [key: string]: string } = {
                        '0': 'left',
                        '1': 'right',
                        '2': 'center',
                        '3': 'justify'
                    };
                    textStyle.alignment = alignmentMap[alignment.toString()] || 'left';
                    console.log(`Alinhamento aplicado: ${textStyle.alignment}`);
                }
                console.log(`Alinhamento encontrado via método alignment(): ${alignment}`);
            }
        } catch (methodError) {
            console.error("Erro ao acessar métodos auxiliares:", methodError);
        }

        // Tentar extrair informações do engineData se disponível
        if (textData.engineData) {
            console.log("EngineData disponível para extração adicional");

            if (typeof textData.engineData === 'object') {
                try {
                    // Extrair informações de fonte do ResourceDict
                    if (textData.engineData.ResourceDict &&
                        textData.engineData.ResourceDict.FontSet &&
                        textData.engineData.ResourceDict.FontSet.length > 0) {
                        const fontName = textData.engineData.ResourceDict.FontSet[0].Name;
                        if (fontName) {
                            console.log(`Fonte encontrada no ResourceDict: ${fontName}`);
                            // Mapear a fonte do ResourceDict
                            const mappedFont = mapPSDFontToWebFont(fontName);
                            console.log(`Fonte mapeada do ResourceDict: ${fontName} -> ${mappedFont}`);
                            textStyle.fontFamily = mappedFont;
                        }
                    }

                    // Extrair informações de estilo da fonte do StyleRun
                    if (textData.engineData.EngineDict &&
                        textData.engineData.EngineDict.StyleRun &&
                        textData.engineData.EngineDict.StyleRun.RunArray &&
                        textData.engineData.EngineDict.StyleRun.RunArray.length > 0) {

                        const styleRun = textData.engineData.EngineDict.StyleRun.RunArray[0];
                        if (styleRun.StyleSheet && styleRun.StyleSheet.StyleSheetData) {
                            const styleData = styleRun.StyleSheet.StyleSheetData;

                            // Tamanho da fonte
                            if (styleData.FontSize !== undefined) {
                                textStyle.fontSize = parseFloat(styleData.FontSize);
                                console.log(`Tamanho de fonte do engineData: ${textStyle.fontSize}px`);
                            }

                            // Negrito/Peso
                            if (styleData.FauxBold !== undefined) {
                                textStyle.fontWeight = styleData.FauxBold ? "bold" : "normal";
                                console.log(`Peso da fonte do engineData: ${textStyle.fontWeight}`);
                            }

                            // Itálico
                            if (styleData.FauxItalic !== undefined) {
                                textStyle.fontStyle = styleData.FauxItalic ? "italic" : "normal";
                                console.log(`Estilo da fonte do engineData: ${textStyle.fontStyle}`);
                            }

                            // Espaçamento entre letras
                            if (styleData.Tracking !== undefined) {
                                textStyle.letterSpacing = parseFloat(styleData.Tracking) / 1000; // Convertendo para em
                                console.log(`Espaçamento de letras do engineData: ${textStyle.letterSpacing}em`);
                            }

                            // Altura da linha
                            if (styleData.Leading !== undefined) {
                                textStyle.lineHeight = parseFloat(styleData.Leading) / textStyle.fontSize;
                                console.log(`Altura da linha do engineData: ${textStyle.lineHeight}`);
                            }
                        }
                    }
                } catch (engineDataError) {
                    console.error("Erro ao processar engineData:", engineDataError);
                }
            }
        }

        // Tentar obter informações adicionais das propriedades do nó
        if (node.left !== undefined && node.top !== undefined) {
            console.log(`Posição da camada: x=${node.left}, y=${node.top}`);
        }

        console.log("Estilo de texto extraído:", textStyle);
        return textStyle;
    } catch (error) {
        console.error("Erro ao extrair estilo de texto:", error);
        return null;
    }
};

/**
 * Parseia um objeto textData para extrair informações específicas
 * @param textData Dados de texto da camada
 * @returns Um objeto contendo propriedades extraídas
 */
export function parseTextData(textData: any): any {
    const result: Record<string, any> = {};

    try {
        // Extrair texto
        if (textData.textValue) {
            result.text = textData.textValue;
        } else if (textData.textData && textData.textData["Txt "]) {
            result.text = textData.textData["Txt "];
        }

        // Extrair transform
        if (textData.transform) {
            result.transform = textData.transform;
        }

        // Extrair outros dados disponíveis
        ['warpData', 'textVersion', 'descriptorVersion', 'textGridding'].forEach(key => {
            if (textData[key] !== undefined) {
                result[key] = textData[key];
            }
        });

        // Extrair métodos especiais se disponíveis
        ['fonts', 'sizes', 'colors', 'alignment', 'leading'].forEach(key => {
            if (typeof textData[key] === 'function') {
                try {
                    result[key] = textData[key]();
                } catch (e) {
                    console.log(`Erro ao chamar método ${key}():`, e);
                }
            }
        });

        return result;
    } catch (error) {
        console.error("Error parsing text data:", error);
        return { error: String(error) };
    }
}
