
/**
 * Mapeia fontes do Photoshop para fontes web equivalentes
 */
const fontMappings: Record<string, string> = {
  'Roboto': 'Roboto, sans-serif',
  'Roboto-Regular': 'Roboto, sans-serif',
  'Roboto-Bold': 'Roboto, sans-serif',
  'Roboto-Light': 'Roboto, sans-serif',
  'Roboto-Medium': 'Roboto, sans-serif',
  'Roboto-Black': 'Roboto, sans-serif',
  'Roboto-Italic': 'Roboto, sans-serif',
  'Arial': 'Arial, sans-serif',
  'Helvetica': 'Helvetica, Arial, sans-serif',
  'Times': 'Times New Roman, serif',
  'Times-Roman': 'Times New Roman, serif',
  'Courier': 'Courier New, monospace',
  'Verdana': 'Verdana, sans-serif',
  'Georgia': 'Georgia, serif',
  'Palatino': 'Palatino Linotype, Book Antiqua, Palatino, serif',
  'Garamond': 'Garamond, serif',
  'Bookman': 'Bookman, URW Bookman L, serif',
  'Trebuchet': 'Trebuchet MS, sans-serif',
  'Arial-Black': 'Arial Black, Gadget, sans-serif',
  'Impact': 'Impact, Charcoal, sans-serif',
  'Tahoma': 'Tahoma, Geneva, sans-serif',
  'Inter': 'Inter, sans-serif',
  'Open-Sans': 'Open Sans, sans-serif',
  'Montserrat': 'Montserrat, sans-serif',
  'Lato': 'Lato, sans-serif',
};

/**
 * Mapeia uma fonte do PSD para uma fonte web utilizável
 * @param psdFontName Nome da fonte no PSD
 * @returns Nome da fonte web equivalente ou a fonte original se não houver mapeamento
 */
export const mapPSDFontToWebFont = (psdFontName: string): string => {
  if (!psdFontName) return 'Arial, sans-serif';

  console.log(`Mapeando fonte PSD: "${psdFontName}"`);

  // Verificar se existe um mapeamento direto para esta fonte
  if (fontMappings[psdFontName]) {
    console.log(`Mapeamento direto encontrado: "${fontMappings[psdFontName]}"`);
    return fontMappings[psdFontName];
  }

  // Extrair nome base da fonte (removendo variantes como Bold, Light, etc.)
  const baseFontName = psdFontName.replace(/-Bold|-Light|-Regular|-Italic|-Medium|-Black/gi, '');
  
  // Verificar se existe um mapeamento para o nome base
  if (fontMappings[baseFontName]) {
    console.log(`Mapeamento de nome base encontrado: "${fontMappings[baseFontName]}"`);
    return fontMappings[baseFontName];
  }
  
  // Se não encontrou mapeamento, retornar a fonte original com fallbacks
  console.log(`Nenhum mapeamento encontrado, usando fonte original com fallbacks: "${psdFontName}, Arial, sans-serif"`);
  return `${psdFontName}, Arial, sans-serif`;
};

/**
 * Adicionar links de importação de fontes ao documento HTML
 * @param fontFamily Nome da família de fonte
 */
export const addFontImportToDocument = (fontFamily: string): void => {
  // Extrair o nome principal da fonte (antes da primeira vírgula)
  const primaryFont = fontFamily.split(',')[0].trim();
  
  // Prevenção para não adicionar a mesma fonte várias vezes
  const fontId = `font-import-${primaryFont.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

  if (document.getElementById(fontId)) {
    console.log(`Fonte já importada: ${primaryFont}`);
    return;
  }

  const commonWebFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New',
    'Courier', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma'
  ];

  // Se for uma fonte padrão do sistema, não precisa importar
  if (commonWebFonts.some(font => primaryFont.includes(font))) {
    console.log(`Fonte padrão do sistema, não necessita importação: ${primaryFont}`);
    return;
  }

  // Para fontes do Google Fonts
  const googleFonts = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Inter', 'Poppins'];

  if (googleFonts.some(font => primaryFont.includes(font))) {
    const fontName = googleFonts.find(font => primaryFont.includes(font));
    
    if (fontName) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      
      // Incluir várias variantes de peso para Roboto
      if (fontName === 'Roboto') {
        link.href = `https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap`;
      } else {
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700&display=swap`;
      }
      
      document.head.appendChild(link);
      console.log(`Adicionada importação de fonte: ${fontName}`);
    }
  }
};
