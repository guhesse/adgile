
import { TextLayerStyle } from '../../types';
import { mapFontName } from './fontMapper';
import { logDebug, logInfo } from './psdLogger';

// Extract font style information from a font name like "Poppins-Bold", "Montserrat-Regular", etc.
const extractFontStyle = (fontName: string): { weight: string, style: string } => {
  const parts = fontName.split('-');
  let weight = 'normal';
  let style = 'normal';

  if (parts.length > 1) {
    const stylePart = parts[1].toLowerCase();
    
    // Extract font weight
    if (stylePart.includes('thin')) weight = '100';
    else if (stylePart.includes('extralight') || stylePart.includes('ultralight')) weight = '200';
    else if (stylePart.includes('light')) weight = '300';
    else if (stylePart.includes('regular') || stylePart.includes('normal')) weight = 'normal';
    else if (stylePart.includes('medium')) weight = '500';
    else if (stylePart.includes('semibold') || stylePart.includes('demibold')) weight = '600';
    else if (stylePart.includes('bold')) weight = 'bold';
    else if (stylePart.includes('extrabold') || stylePart.includes('ultrabold')) weight = '800';
    else if (stylePart.includes('black') || stylePart.includes('heavy')) weight = '900';
    
    // Extract font style
    if (stylePart.includes('italic')) style = 'italic';
    else if (stylePart.includes('oblique')) style = 'oblique';
  }

  return { weight, style };
};

// Function to calculate font size based on transform scale
const calculateFontSize = (textData: any): number => {
  if (!textData || !textData.transform) return 16; // Default font size
  
  // Extract the vertical scale from transform
  const scaleFactor = textData.transform.yy;
  
  // Base font size before scaling
  const baseFontSize = 87; // Typical base size used in PSDs
  
  // Apply scale factor to get rendered font size
  const fontSize = Math.round(baseFontSize * scaleFactor * 100) / 100;
  
  return fontSize;
};

/**
 * Extracts text layer styles from PSD data
 * @param textData Text layer data from PSD
 * @param layerName Name of the text layer
 * @returns TextLayerStyle object with font properties
 */
export const extractTextLayerStyles = (textData: any, layerName: string): TextLayerStyle => {
  console.log(`📋 DIAGNÓSTICO DE FONTE [${layerName}]`);
  logDebug('originalFont:', textData.font ? textData.font : 'não definida');
  logDebug('fontName:', textData.fontName ? textData.fontName : 'não definida');
  logDebug('fontIndex:', textData.fontIndex);
  logDebug('_styles:', textData._styles);
  
  let fontFamily = 'Arial';
  let fontWeight = 'normal';
  let fontStyle = 'normal';
  
  try {
    // Check if we have FontSet data available (preferred method)
    if (textData.FontSet && textData.FontSet.length > 0) {
      const fontIndex = textData._styles?.Font ? textData._styles.Font[0] : 0;
      logDebug('font:', textData.font ? textData.font : 'não disponível');
      logDebug('FontSet disponível:', !!textData.FontSet);
      logDebug('Índice da fonte:', fontIndex);
      logDebug('FontSet.length:', textData.FontSet.length);
      
      if (textData.FontSet[fontIndex] && textData.FontSet[fontIndex].Name) {
        const fontName = textData.FontSet[fontIndex].Name;
        logDebug('FontSet[0].Name:', fontName);
        
        // Extract font family (removing style suffixes like "-Bold", "-Italic")
        const fontParts = fontName.split('-');
        fontFamily = fontParts[0];
        
        // Extract style information
        const styleInfo = extractFontStyle(fontName);
        fontWeight = styleInfo.weight;
        fontStyle = styleInfo.style;
      }
    }
  } catch (error) {
    console.error(`Error extracting font for ${layerName}:`, error);
    // Fallback to defaults
    fontFamily = 'Arial';
    fontWeight = 'normal';
    fontStyle = 'normal';
  }
  
  // Map the font name to a web-safe alternative if necessary
  fontFamily = mapFontName(fontFamily);
  
  logDebug('transform:', textData.transform);
  
  // Calculate font size using transform scale
  const fontSize = calculateFontSize(textData);
  
  // Log the font processing steps
  logDebug(`🔤 Fonte "${layerName}": Usando fonts(): ${fontFamily} `);
  logDebug(`🔤 Fonte "${layerName}": Mapeamento: "${fontFamily}" → "${mapFontName(fontFamily)}" `);
  logDebug(`🔤 Fonte "${layerName}": Estilo extraído do nome da fonte: peso=${fontWeight}, estilo=${fontStyle} `);
  logDebug(`🔤 Fonte "${layerName}": Tamanho da fonte com nova transformação: ${Math.round(baseFontSize * 100) / 100} → ${fontSize}, fator=${textData.transform?.yy} `);
  
  logInfo(`📝 Texto extraído "${layerName}": Fonte=${fontFamily}, Tamanho=${fontSize}px`);
  
  // Create text style object
  const textStyle: TextLayerStyle = {
    text: textData.text || '',
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    color: '#000000', // Default color, should be overridden later
    alignment: textData.textAlign || 'left',
    letterSpacing: textData.letterSpacing || 0,
    lineHeight: textData.lineHeight || 1.2
  };
  
  return textStyle;
};

// Base font size used in calculations
const baseFontSize = 87;

export const extractTextFromPSD = (psdData: any): Map<string, TextLayerStyle> => {
  const textLayers = new Map<string, TextLayerStyle>();
  
  if (!psdData || !psdData.textData) {
    return textLayers;
  }
  
  // Process each text layer
  Object.entries(psdData.textData).forEach(([layerName, textData]: [string, any]) => {
    try {
      console.log(`🔍 Fonte para "${layerName}" [fonts() método]: "${textData.FontSet?.[0]?.Name || 'desconhecido'}"`);
      
      const textStyle = extractTextLayerStyles(textData, layerName);
      textLayers.set(layerName, textStyle);
    } catch (error) {
      console.error(`❌ Erro ao processar typeTool para "${layerName}":`, error);
    }
  });
  
  return textLayers;
};
