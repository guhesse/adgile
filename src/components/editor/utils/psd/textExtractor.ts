
import { TextLayerStyle } from './types';

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
      fontFamily: 'Arial',
      fontSize: 14,
      color: '#000000',
      alignment: 'left',
      bold: false,
      italic: false,
      underline: false,
      letterSpacing: 0,
      lineHeight: 1.2
    };

    // Extrair o texto
    if (textData.textValue) {
      textStyle.text = textData.textValue;
    } else if (textData.text) {
      textStyle.text = textData.text;
    }

    // Usar os dados do engineData quando disponíveis
    if (textData.engineData && typeof textData.engineData === 'object') {
      console.log("Extraindo dados detalhados do engineData");
      
      // Extrair informações de fonte do ResourceDict
      if (textData.engineData.ResourceDict) {
        if (textData.engineData.ResourceDict.FontSet && 
            textData.engineData.ResourceDict.FontSet.length > 0) {
          // Pegar o primeiro valor da FontSet que não tenha "Adobe" ou "Myriad"
          const fonts = textData.engineData.ResourceDict.FontSet;
          for (const fontObj of fonts) {
            if (fontObj.Name && 
                !fontObj.Name.includes('Adobe') && 
                !fontObj.Name.includes('Myriad')) {
              textStyle.fontFamily = fontObj.Name;
              console.log(`Fonte encontrada no ResourceDict: ${textStyle.fontFamily}`);
              break;
            }
          }
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

          // Extrair tamanho da fonte (convertendo para px)
          if (styleData.FontSize !== undefined) {
            textStyle.fontSize = parseFloat(styleData.FontSize);
            console.log(`Tamanho da fonte extraído: ${textStyle.fontSize}`);
          }

          // Extrair negrito
          if (styleData.FauxBold !== undefined) {
            textStyle.bold = styleData.FauxBold === true;
          }
          
          // Extrair itálico
          if (styleData.FauxItalic !== undefined) {
            textStyle.italic = styleData.FauxItalic === true;
          }
          
          // Extrair sublinhado
          if (styleData.Underline !== undefined) {
            textStyle.underline = styleData.Underline === true;
          }
          
          // Extrair espaçamento entre letras
          if (styleData.Tracking !== undefined) {
            textStyle.letterSpacing = parseFloat(styleData.Tracking) / 1000;
          }
          
          // Extrair altura da linha
          if (styleData.Leading !== undefined) {
            textStyle.lineHeight = parseFloat(styleData.Leading) / textStyle.fontSize;
          }
          
          // Extrair cor
          if (styleData.FillColor && styleData.FillColor.Values) {
            const values = styleData.FillColor.Values;
            if (Array.isArray(values) && values.length >= 3) {
              // Converter cores RGB (normalmente 0-1) para formato hex
              const r = Math.round(values[0] * 255);
              const g = Math.round(values[1] * 255);
              const b = Math.round(values[2] * 255);
              textStyle.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
          }
        }
      }
    }

    // Se não conseguimos extrair a fonte do engineData, tentamos através dos métodos auxiliares
    if (textStyle.fontFamily === 'Arial' && typeof textData.fonts === 'function') {
      const fonts = textData.fonts();
      if (fonts && Array.isArray(fonts) && fonts.length > 0) {
        // Filtrar fontes Adobe/invisíveis
        const realFonts = fonts.filter((font: string) => 
          font && !font.includes('Adobe') && !font.includes('Myriad'));
        
        if (realFonts.length > 0) {
          textStyle.fontFamily = realFonts[0];
          console.log(`Fonte alternativa encontrada via fonts(): ${textStyle.fontFamily}`);
        }
      }
    }

    // Se não conseguimos extrair o tamanho da fonte, tentamos através dos métodos auxiliares
    if (textStyle.fontSize === 14 && typeof textData.sizes === 'function') {
      const sizes = textData.sizes();
      if (sizes && Array.isArray(sizes) && sizes.length > 0) {
        textStyle.fontSize = sizes[0];
        console.log(`Tamanho alternativo encontrado via sizes(): ${textStyle.fontSize}`);
      }
    }

    // Se não conseguimos extrair a cor, tentamos através dos métodos auxiliares
    if (textStyle.color === '#000000' && typeof textData.colors === 'function') {
      const colors = textData.colors();
      if (colors && Array.isArray(colors) && colors.length > 0) {
        const color = colors[0];
        if (Array.isArray(color) && color.length >= 3) {
          const [r, g, b] = color;
          textStyle.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          console.log(`Cor alternativa encontrada via colors(): ${textStyle.color}`);
        }
      }
    }

    // Se não conseguimos extrair o alinhamento, tentamos através dos métodos auxiliares
    if (textStyle.alignment === 'left' && typeof textData.alignment === 'function') {
      const alignment = textData.alignment();
      if (alignment !== undefined) {
        const alignmentMap: {[key: string]: string} = {
          '0': 'left',
          '1': 'right',
          '2': 'center',
          '3': 'justify'
        };
        textStyle.alignment = alignmentMap[alignment.toString()] || 'left';
        console.log(`Alinhamento encontrado via alignment(): ${textStyle.alignment}`);
      }
    }

    console.log("Estilo final de texto para " + node.name + ":", textStyle);
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
        // Tentar extrair texto
        if (textData.textValue) {
            result.text = textData.textValue;
        } else if (textData.textData && textData.textData["Txt "]) {
            result.text = textData.textData["Txt "];
        }

        // Tentar extrair informações de engineData
        if (textData.engineData) {
            result.engineData = {};
            
            // Extrair informações de fonte
            if (textData.engineData.ResourceDict && textData.engineData.ResourceDict.FontSet) {
                result.engineData.fonts = textData.engineData.ResourceDict.FontSet.map((font: any) => font.Name);
            }
            
            // Extrair informações de estilo
            if (textData.engineData.EngineDict && 
                textData.engineData.EngineDict.StyleRun && 
                textData.engineData.EngineDict.StyleRun.RunArray && 
                textData.engineData.EngineDict.StyleRun.RunArray.length > 0) {
                
                const styleRun = textData.engineData.EngineDict.StyleRun.RunArray[0];
                if (styleRun.StyleSheet && styleRun.StyleSheet.StyleSheetData) {
                    result.engineData.styleData = styleRun.StyleSheet.StyleSheetData;
                }
            }
        }

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
