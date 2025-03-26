
// Format layer names by removing any special characters and making them URL-safe
export const formatLayerName = (name: string): string => {
  return name
    .replace(/[^a-z0-9\s-]/gi, '')  // Remove special characters
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .toLowerCase();
};

// Normalize layer names for consistent handling
export const normalizeLayerName = (name: string): string => {
  if (!name) return 'unnamed-layer';
  
  // Remove common PSD layer naming conventions
  const cleanName = name
    .replace(/^(Layer\s+\d+|Copy(\s+\d+)?|Group(\s+\d+)?)/i, '')
    .trim();
  
  return cleanName || 'layer';
};

// Format file size in a human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format timestamps in a human-readable format
export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (e) {
    return 'Invalid date';
  }
};

// Convert PSD color values to CSS colors
export const formatColor = (color: any): string => {
  if (!color) return '#000000';
  
  if (typeof color === 'string') {
    return color;
  }
  
  if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }
  
  return '#000000';
};
