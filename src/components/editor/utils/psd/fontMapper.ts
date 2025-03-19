
/**
 * Mapeia fontes do PSD para fontes web
 * @param psdFont Nome da fonte no arquivo PSD
 * @returns Nome da fonte adequada para web
 */
export const mapPSDFontToWebFont = (psdFont: string): string => {
  // Remove any text after a dash (like -Bold, -Regular)
  // to get the base font name for mapping
  const baseFontName = psdFont.split('-')[0];
  
  // Map common PSD fonts to web-safe fonts
  // Priorizamos Roboto para compatibilidade com o design
  const fontMap: Record<string, string> = {
    'Arial': 'Arial, sans-serif',
    'ArialMT': 'Arial, sans-serif',
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'HelveticaNeue': 'Helvetica Neue, Helvetica, Arial, sans-serif',
    'TimesNewRoman': 'Times New Roman, serif',
    'Times': 'Times New Roman, serif',
    'Courier': 'Courier New, monospace',
    'CourierNew': 'Courier New, monospace',
    'Georgia': 'Georgia, serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Tahoma': 'Tahoma, Geneva, sans-serif',
    'Trebuchet': 'Trebuchet MS, sans-serif',
    'TrebuchetMS': 'Trebuchet MS, sans-serif',
    'Impact': 'Impact, Charcoal, sans-serif',
    'ComicSans': 'Comic Sans MS, cursive',
    'ComicSansMS': 'Comic Sans MS, cursive',
    'Palatino': 'Palatino Linotype, Book Antiqua, Palatino, serif',
    'Garamond': 'Garamond, serif',
    'Bookman': 'Bookman, URW Bookman L, serif',
    'AvantGarde': 'Avant Garde, Century Gothic, sans-serif',
    'Roboto': 'Roboto, sans-serif', // Ensure Roboto maps to Roboto
    'Montserrat': 'Montserrat, sans-serif',
    'OpenSans': 'Open Sans, sans-serif',
    'Lato': 'Lato, sans-serif',
    'Raleway': 'Raleway, sans-serif',
    'PTSans': 'PT Sans, sans-serif',
    'SourceSansPro': 'Source Sans Pro, sans-serif',
    'Oswald': 'Oswald, sans-serif',
    'PlayfairDisplay': 'Playfair Display, serif',
    'Merriweather': 'Merriweather, serif',
    'Ubuntu': 'Ubuntu, sans-serif',
    'Nunito': 'Nunito, sans-serif',
  };

  // Check if we have the font in our map
  if (baseFontName in fontMap) {
    console.log(`Font '${psdFont}' mapped to '${fontMap[baseFontName]}'`);
    return fontMap[baseFontName];
  }
  
  // Roboto-specific handling
  if (psdFont.startsWith('Roboto') || psdFont.includes('Roboto')) {
    console.log(`Roboto font detected: '${psdFont}', using 'Roboto, sans-serif'`);
    return 'Roboto, sans-serif';
  }

  // For fonts we don't recognize, default to specifying the original font with fallback
  console.log(`Unknown font '${psdFont}', using as-is with fallbacks`);
  return `${psdFont}, Roboto, sans-serif`;
};

/**
 * Adiciona a importação de uma fonte ao documento
 * @param fontFamily Nome da fonte a ser importada
 */
export const addFontImportToDocument = (fontFamily: string): void => {
  try {
    // Extrair o nome base da fonte (antes da primeira vírgula)
    const baseFontName = fontFamily.split(',')[0].trim();
    
    // Remover aspas se presentes
    const cleanFontName = baseFontName.replace(/['"]/g, '');
    
    // Ajustar para o formato de URL do Google Fonts (substituir espaços por +)
    const googleFontName = cleanFontName.replace(/\s+/g, '+');
    
    // Verificar se a fonte já está carregada (evitar duplicação)
    const existingLink = document.querySelector(`link[href*="${googleFontName}"]`);
    if (existingLink) {
      console.log(`Font '${cleanFontName}' already loaded`);
      return;
    }
    
    // Verificar fontes que não precisam ser carregadas (system fonts)
    const systemFonts = ['Arial', 'Helvetica', 'Times', 'Times New Roman', 'Courier', 'Courier New', 
                         'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Tahoma', 'Verdana', 
                         'Trebuchet', 'Trebuchet MS', 'Impact', 'Comic Sans', 'Comic Sans MS'];
    
    if (systemFonts.includes(cleanFontName)) {
      console.log(`System font '${cleanFontName}' doesn't need to be loaded`);
      return;
    }
    
    // Para fontes personalizadas, carregar do Google Fonts
    console.log(`Loading font '${cleanFontName}' from Google Fonts`);
    
    // Criar elemento link para a fonte
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = `https://fonts.googleapis.com/css2?family=${googleFontName}:wght@300;400;500;700;900&display=swap`;
    
    // Adicionar ao head do documento
    document.head.appendChild(linkElement);
    
    console.log(`Font '${cleanFontName}' imported successfully`);
  } catch (error) {
    console.error(`Error importing font '${fontFamily}':`, error);
  }
};
