import { TextLayerStyle } from './types';
import { mapPSDFontToWebFont } from './fontMapper';

/**
 * Extracts style information from a text layer
 * @param textData The text data extracted from the PSD layer
 * @param node The layer node
 * @returns A TextLayerStyle object with the extracted style information
 */
export const extractTextLayerStyle = (textData: any, node: any): TextLayerStyle => {
  console.log(`Extraindo estilo de texto para: ${node.name}`);
  
  // Default style - usando Roboto como padrão, não Inter
  const textStyle: TextLayerStyle = {
    text: node.name || '',
    fontFamily: 'Roboto', // Garantir que o padrão seja Roboto
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
    alignment: 'left',
    letterSpacing: 0,
    lineHeight: 1.2
  };

  // Extract text content
  if (textData && textData.textValue) {
    textStyle.text = textData.textValue;
  }

  try {
    // Extract font information
    if (textData && typeof textData.fonts === 'function') {
      const fonts = textData.fonts();
      console.log(`Fontes encontradas via método fonts(): ${fonts}`);
      
      if (fonts && fonts.length > 0) {
        const primaryFont = fonts[0];
        console.log(`Fonte primária do PSD: "${primaryFont}"`);
        
        // Extrair família da fonte, peso e estilo
        if (primaryFont.includes('Roboto')) {
          textStyle.fontFamily = 'Roboto';
          
          // Extrair peso da fonte
          if (primaryFont.includes('-Bold')) {
            textStyle.fontWeight = 'bold';
            console.log(`Aplicando peso bold para fonte Roboto`);
          } else if (primaryFont.includes('-Light')) {
            textStyle.fontWeight = '300';
            console.log(`Aplicando peso light para fonte Roboto`);
          } else if (primaryFont.includes('-Medium')) {
            textStyle.fontWeight = '500';
            console.log(`Aplicando peso medium para fonte Roboto`);
          } else if (primaryFont.includes('-Black')) {
            textStyle.fontWeight = '900';
            console.log(`Aplicando peso black para fonte Roboto`);
          } else {
            textStyle.fontWeight = 'normal';
            console.log(`Aplicando peso normal para fonte Roboto`);
          }
          
          // Extrair estilo da fonte
          if (primaryFont.includes('-Italic')) {
            textStyle.fontStyle = 'italic';
            console.log(`Aplicando estilo italic para fonte Roboto`);
          }
        } else {
          // Para outras fontes que não são Roboto
          const fontMapping = mapPSDFontToWebFont(primaryFont);
          console.log(`Mapeando fonte "${primaryFont}" para "${fontMapping}"`);
          textStyle.fontFamily = fontMapping.split(',')[0].trim(); // Pegar apenas o nome principal
        }
        
        console.log(`Fonte processada e aplicada: ${textStyle.fontFamily} (${textStyle.fontWeight}, ${textStyle.fontStyle})`);
      }
    }

    // Extract font size
    if (textData && typeof textData.sizes === 'function') {
      const sizes = textData.sizes();
      console.log(`Tamanhos encontrados via método sizes(): ${sizes}`);
      
      if (sizes && sizes.length > 0) {
        // Converter de pontos para pixels (aproximadamente)
        // O fator de conversão pode variar, mas geralmente é cerca de 1.33
        const fontSize = Math.round(sizes[0] / 1.33);
        textStyle.fontSize = fontSize;
        console.log(`Tamanho da fonte: ${sizes[0]} pontos -> ${fontSize} pixels`);
      }
    }

    // Extract color
    if (textData && typeof textData.colors === 'function') {
      const colors = textData.colors();
      console.log(`Cores encontradas via método colors(): ${colors}`);
      
      if (colors && colors.length > 0 && Array.isArray(colors[0])) {
        const [r, g, b] = colors[0].slice(0, 3);
        // Converter RGB para hexadecimal
        textStyle.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        console.log(`Cor da fonte: rgb(${r},${g},${b}) -> ${textStyle.color}`);
      }
    }

    // Extract alignment
    if (textData && typeof textData.alignment === 'function') {
      const alignments = textData.alignment();
      console.log(`Alinhamento encontrado via método alignment(): ${alignments}`);
      
      if (alignments && alignments.length > 0) {
        const alignment = alignments[0];
        if (typeof alignment === 'string') {
          textStyle.alignment = alignment;
        } else {
          // Map numeric alignment values to strings
          const alignmentMap: {[key: string]: string} = {
            '0': 'left',
            '1': 'right',
            '2': 'center',
            '3': 'justify'
          };
          textStyle.alignment = alignmentMap[alignment.toString()] || 'left';
        }
        console.log(`Alinhamento aplicado: ${textStyle.alignment}`);
      }
    }

    // Try to access engineData for additional info
    if (textData && textData.engineData) {
      console.log("EngineData disponível para extração adicional");

      // Additional letter spacing and line height could be extracted here
      try {
        if (textData.engineData.EngineDict &&
            textData.engineData.EngineDict.StyleRun &&
            textData.engineData.EngineDict.StyleRun.RunArray &&
            textData.engineData.EngineDict.StyleRun.RunArray.length > 0) {

          const styleRun = textData.engineData.EngineDict.StyleRun.RunArray[0];

          // Extract letter spacing
          if (styleRun.StyleSheet &&
              styleRun.StyleSheet.StyleSheetData &&
              styleRun.StyleSheet.StyleSheetData.Tracking) {

            const tracking = styleRun.StyleSheet.StyleSheetData.Tracking;
            // Convert tracking to CSS letter-spacing (approximation)
            textStyle.letterSpacing = tracking / 1000;
            console.log(`Letter spacing extraído: ${tracking} -> ${textStyle.letterSpacing}em`);
          }

          // Extract line height
          if (styleRun.StyleSheet &&
              styleRun.StyleSheet.StyleSheetData &&
              styleRun.StyleSheet.StyleSheetData.Leading) {

            const leading = styleRun.StyleSheet.StyleSheetData.Leading;
            // Convert leading to CSS line-height ratio (approximation)
            if (textStyle.fontSize > 0) {
              textStyle.lineHeight = leading / textStyle.fontSize;
              console.log(`Line height extraído: ${leading}px -> ${textStyle.lineHeight}`);
            }
          }
        }
      } catch (engineDataError) {
        console.error("Erro ao extrair dados avançados do engineData:", engineDataError);
      }
    }

    // Log node position for debugging
    console.log(`Posição da camada: x=${node.left || 0}, y=${node.top || 0}`);

  } catch (error) {
    console.error(`Erro ao extrair estilos de texto para ${node.name}:`, error);
  }

  console.log("Estilo de texto extraído:", textStyle);
  return textStyle;
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
