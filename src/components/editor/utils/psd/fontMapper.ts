
/**
 * Maps PSD font names to web-safe alternatives
 */
const FONT_MAPPING: Record<string, string> = {
  'Arial': 'Arial',
  'ArialMT': 'Arial',
  'Helvetica': 'Helvetica, Arial',
  'HelveticaNeue': 'Helvetica Neue, Helvetica, Arial',
  'TimesNewRoman': 'Times New Roman',
  'Times': 'Times New Roman',
  'Courier': 'Courier New',
  'CourierNew': 'Courier New',
  'Georgia': 'Georgia',
  'Verdana': 'Verdana',
  'Tahoma': 'Tahoma',
  'Impact': 'Impact',
  'Roboto': 'Roboto',
  'OpenSans': 'Open Sans',
  'Poppins': 'Poppins',
  'Montserrat': 'Montserrat',
  'Lato': 'Lato',
  'SourceSansPro': 'Source Sans Pro',
  'Oswald': 'Oswald',
  'Raleway': 'Raleway',
  'Ubuntu': 'Ubuntu',
  'PTSans': 'PT Sans',
  'NotoSans': 'Noto Sans',
  'Inter': 'Inter'
};

/**
 * Maps a font name from PSD to a web-safe alternative
 * @param fontName The original font name from the PSD
 * @returns Web-safe font name
 */
export const mapFontName = (fontName: string): string => {
  // Check if the font is in our mapping
  const normalizedName = fontName.replace(/[-\s]/g, '');
  
  for (const [key, value] of Object.entries(FONT_MAPPING)) {
    if (normalizedName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // If not found, remove any styles (like -Bold, -Italic) and return the base font
  const baseFontName = fontName.split('-')[0];
  
  // Return as-is if we don't have a mapping
  return baseFontName;
};

/**
 * Gets a list of all fonts used in the editor elements
 * @param elements Array of editor elements
 * @returns Array of unique font names
 */
export const getUniqueFonts = (elements: any[]): string[] => {
  const fontSet = new Set<string>();
  
  elements.forEach(element => {
    if (element.type === 'text' && element.style.fontFamily) {
      fontSet.add(element.style.fontFamily);
    }
    
    // Check for text in child elements
    if (element.childElements && element.childElements.length > 0) {
      getUniqueFonts(element.childElements).forEach(font => fontSet.add(font));
    }
  });
  
  return Array.from(fontSet);
};
