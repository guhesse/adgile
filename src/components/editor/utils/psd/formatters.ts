
/**
 * Utility function to convert PSD color format to hex
 * @param colors PSD color array or object
 * @returns Hex color string
 */
export const convertPSDColorToHex = (colors: any): string => {
  try {
    if (Array.isArray(colors) && colors.length >= 3) {
      const [r, g, b] = colors.map(val => Math.min(255, Math.max(0, Math.round(val))));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return '#000000';
  } catch (error) {
    console.error("Error converting PSD color to hex:", error);
    return '#000000';
  }
};

/**
 * Utility function to convert PSD text alignment to CSS
 * @param alignment PSD alignment string
 * @returns CSS alignment value
 */
export const convertPSDAlignmentToCSS = (alignment: string): "left" | "center" | "right" => {
  switch (alignment) {
    case 'right':
      return 'right';
    case 'center':
      return 'center';
    case 'left':
    default:
      return 'left';
  }
};
