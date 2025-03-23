import { TextLayerStyle } from './types';
import { mapPSDFontToWebFont } from './fontMapper';

// Sistema de logs centralizado - simplificado apenas para fontes
const logger = {
  enabled: false, // Desabilitar logs alterando para false

  // Log apenas para informações de fonte
  font: (layerName: string, message: string, data?: any) => {
    if (logger.enabled) {
      console.log(`🔤 Fonte "${layerName}": ${message}`, data || '');
    }
  },

  // Log para resumo final de extração
  summary: (layerName: string, fontFamily: string, fontSize: number) => {
    if (logger.enabled) {
      console.log(`📝 Texto extraído "${layerName}": Fonte=${fontFamily}, Tamanho=${fontSize}px`);
    }
  }
};

/**
 * Extracts style information from a text layer
 * @param textData The text data extracted from the PSD layer
 * @param node The layer node
 * @returns A TextLayerStyle object with the extracted style information
 */
export const extractTextLayerStyle = (textData: any, node: any): TextLayerStyle | null => {
  if (!textData) {
    console.error(`❌ Dados brutos ausentes para a camada "${node.name}".`);
    return null;
  }

  try {
    // Informações detalhadas para diagnóstico
    // console.group(`📋 DIAGNÓSTICO DE FONTE [${node.name}]`);
    // console.log(`originalFont: "${textData.originalFont || 'não definida'}"`);
    // console.log(`fontName: "${textData.fontName || 'não definida'}"`);
    // console.log(`fontIndex: ${textData.fontIndex || 'não definido'}`);
    // console.log(`_styles: ${JSON.stringify(textData._styles ? { Font: textData._styles.Font } : 'não disponível')}`);

    // Verificar disponibilidade de FontSet
    const hasFontSet = !!(textData.engineData?.ResourceDict?.FontSet);
    // console.log(`FontSet disponível: ${hasFontSet}`);

    if (hasFontSet) {
      const fontSet = textData.engineData.ResourceDict.FontSet;
      const fontIndex = textData._styles?.Font?.[0] || textData.fontIndex || 0;

      // console.log(`Índice da fonte: ${fontIndex}`);
      // console.log(`FontSet.length: ${fontSet.length}`);

      // if (fontSet[fontIndex]) {
      //   console.log(`FontSet[${fontIndex}].Name: "${fontSet[fontIndex].Name}"`);
      // } else if (fontSet.length > 0) {
      //   console.log(`FontSet[0].Name: "${fontSet[0].Name}"`);
      // }
    }
    console.groupEnd();

    // Inicializar com valores padrão
    let textStyle: TextLayerStyle = {
      text: '',
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      alignment: 'left',
      letterSpacing: 0,
      lineHeight: 1.2
    };

    // Extrair texto
    if (textData) {
      // Tentar obter o valor do texto
      if (textData.textValue) {
        textStyle.text = textData.textValue;
      } else if (typeof textData.value === 'function') {
        textStyle.text = textData.value() || '';
      } else if (textData.text) {
        textStyle.text = textData.text;
      }

      // ABORDAGEM DIRETA PARA OBTER A FONTE
      let fontFound = false;

      // Opção 1: Usar fontName diretamente (a mais confiável)
      if (textData.fontName) {
        textStyle.fontFamily = textData.fontName.split('-')[0]; // Remover sufixo como "-Regular"
        logger.font(node.name, `Usando fontName direto: ${textStyle.fontFamily}`);
        fontFound = true;
      }
      // Opção 2: Usar originalFont 
      else if (textData.originalFont) {
        textStyle.fontFamily = textData.originalFont.split('-')[0];
        logger.font(node.name, `Usando fonte original: ${textStyle.fontFamily}`);
        fontFound = true;
      }
      // Opção 3: Usar _styles e FontSet (específico para LazyExecute)
      else if (textData._styles?.Font && textData.engineData?.ResourceDict?.FontSet) {
        const fontIndex = textData._styles.Font[0] || 0;
        const fontSet = textData.engineData.ResourceDict.FontSet;

        if (fontSet[fontIndex] && fontSet[fontIndex].Name) {
          textStyle.fontFamily = fontSet[fontIndex].Name.split('-')[0];
          logger.font(node.name, `Usando fonte do FontSet[${fontIndex}]: ${textStyle.fontFamily}`);
          fontFound = true;
        } else if (fontSet.length > 0 && fontSet[0].Name) {
          textStyle.fontFamily = fontSet[0].Name.split('-')[0];
          logger.font(node.name, `Usando primeira fonte do FontSet: ${textStyle.fontFamily}`);
          fontFound = true;
        }
      }

      // SUPER FORÇA A FONTE PARA ROBOTO COMO ÚLTIMO RECURSO
      if (!fontFound || textStyle.fontFamily === 'Arial') {
        if (textData.engineData?.ResourceDict?.FontSet) {
          // Se temos FontSet, é quase certo que deveria ser Roboto
          textStyle.fontFamily = 'Roboto';
          logger.font(node.name, `Forçando a fonte para Roboto (tem FontSet mas não conseguimos extrair)`);
        }
      }

      // Aplicar mapeamento de fontes para uso na web
      const originalFont = textStyle.fontFamily;
      const mappedFont = mapPSDFontToWebFont(originalFont);
      if (mappedFont !== originalFont) {
        textStyle.fontFamily = mappedFont.split(',')[0].trim();
        logger.font(node.name, `Mapeamento: "${originalFont}" → "${textStyle.fontFamily}"`);
      }

      // Detectar peso e estilo baseado no nome completo da fonte
      // Verificar se estamos lidando com Roboto e definir corretamente
      if (textData.originalFont && textData.originalFont.includes('Roboto')) {
        const fullName = textData.originalFont.toLowerCase();
        if (fullName.includes('bold')) textStyle.fontWeight = 'bold';
        else if (fullName.includes('light')) textStyle.fontWeight = '300';
        else if (fullName.includes('medium')) textStyle.fontWeight = '500';
        else if (fullName.includes('regular')) textStyle.fontWeight = 'normal';

        if (fullName.includes('italic')) textStyle.fontStyle = 'italic';

        logger.font(node.name, `Estilo da fonte Roboto: peso=${textStyle.fontWeight}, estilo=${textStyle.fontStyle}`);
      }

      // Extrair tamanho da fonte - priorizar valores transformados
      if (textData.transformedFontSize && textData.transformedFontSize > 0) {
        textStyle.fontSize = Math.round(textData.transformedFontSize); // Usar tamanho transformado diretamente
      } else if (typeof textData.sizes === 'function') {
        try {
          const sizes = textData.sizes();
          if (sizes && sizes.length > 0) {
            textStyle.fontSize = Math.round(sizes[0]); // Usar tamanho sem conversão
          }
        } catch (e) {
          // Silenciar erros
        }
      }

      // Ajustar tamanho da fonte e lineHeight usando transformações
      if (textData.transform && textData.transform.yy) {
        const transY = textData.transform.yy; // Fator de transformação vertical
        if (textStyle.fontSize) {
          textStyle.fontSize = Math.round((textStyle.fontSize * transY) * 100) * 0.01; // Ajustar tamanho da fonte
        }
        if (textStyle.lineHeight) {
          textStyle.lineHeight = Math.round((textStyle.lineHeight * transY) * 100) * 0.01; // Ajustar lineHeight
        }
        logger.font(node.name, `Tamanho ajustado: fontSize=${textStyle.fontSize}, lineHeight=${textStyle.lineHeight}`);
      }

      // Extrair outras propriedades...
      if (typeof textData.colors === 'function') {
        const colors = textData.colors();

        if (colors && colors.length > 0 && Array.isArray(colors[0]) && colors[0].length >= 3) {
          // Converter RGB para hexadecimal
          const [r, g, b] = colors[0].slice(0, 3).map(Math.round);
          textStyle.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
      }

      if (typeof textData.alignment === 'function') {
        const alignmentValue = textData.alignment();

        if (alignmentValue !== undefined) {
          // Mapear valores de alinhamento
          const alignmentMap: Record<string, string> = {
            '0': 'left',
            '1': 'right',
            '2': 'center',
            '3': 'justify'
          };

          const alignment = alignmentMap[alignmentValue.toString()] || 'left';
          textStyle.alignment = alignment;
        }
      }

      if (textData.tracking !== undefined) {
        textStyle.letterSpacing = textData.tracking / 1000; // Convertendo para em
      }

      if (textData.engineData) {
        if (textData.engineData.ResourceDict &&
          textData.engineData.ResourceDict.FontSet &&
          textData.engineData.ResourceDict.FontSet[0] &&
          textData.engineData.ResourceDict.FontSet[0].FontDict &&
          textData.engineData.ResourceDict.FontSet[0].FontDict.Leading) {
          const leadingValue = textData.engineData.ResourceDict.FontSet[0].FontDict.Leading;
          if (!textStyle.lineHeight && textStyle.fontSize) {
            textStyle.lineHeight = leadingValue / textStyle.fontSize;
          }
        }

        if (textData.engineData.ResourceDict &&
          textData.engineData.ResourceDict.FontSet &&
          textData.engineData.ResourceDict.FontSet[0] &&
          textData.engineData.ResourceDict.FontSet[0].FontDict &&
          textData.engineData.ResourceDict.FontSet[0].FontDict.Tracking) {
          const trackingValue = textData.engineData.ResourceDict.FontSet[0].FontDict.Tracking;
          textStyle.letterSpacing = trackingValue / 1000; // Convertendo para em
        }
      }
    }

    // Verificação final para garantir valores válidos
    if (textStyle.fontSize <= 0) textStyle.fontSize = 14;
    if (textStyle.lineHeight <= 0) textStyle.lineHeight = 1.2;

    // Certifique-se de retornar todos os estilos extraídos
    return {
      ...textStyle,
      text: textStyle.text || '', // Garante que o texto esteja presente
      fontFamily: textStyle.fontFamily || 'Arial', // Fonte padrão
      fontSize: textStyle.fontSize || 14, // Tamanho padrão
      fontWeight: textStyle.fontWeight || 'normal',
      fontStyle: textStyle.fontStyle || 'normal',
      color: textStyle.color || '#000000',
      alignment: textStyle.alignment || 'left',
      letterSpacing: textStyle.letterSpacing || 0,
      lineHeight: textStyle.lineHeight || 1.2
    };
  } catch (error) {
    console.error("Erro ao extrair estilo de texto:", error);
    return null;
  }
};

// Função auxiliar para buscar propriedades em objetos aninhados
function findAllPropertiesDeep(obj: any, propertyNames: string[]): Array<{ path: string, value: any }> {
  const result: Array<{ path: string, value: any }> = [];

  function search(currentObj: any, currentPath: string = '') {
    if (!currentObj || typeof currentObj !== 'object') return;

    for (const key in currentObj) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (propertyNames.includes(key) && currentObj[key]) {
        result.push({
          path: newPath,
          value: currentObj[key]
        });
      }

      if (typeof currentObj[key] === 'object') {
        search(currentObj[key], newPath);
      }
    }
  }

  search(obj);
  return result;
}

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
          // Silenciar erro
        }
      }
    });

    return result;
  } catch (error) {
    return { error: String(error) };
  }
}
