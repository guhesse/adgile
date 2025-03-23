
// Tipos para o processamento de arquivos PSD
export interface TextLayerStyle {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  fontFeatures?: string[];
}

export interface LayerData {
  id: string;
  name: string;
  type: 'text' | 'image' | 'group' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  textContent?: string;
  textStyle?: TextLayerStyle;
  src?: string;
  mask?: any;
  imageData?: string;
}

export interface PSDFileData {
  fileName: string;
  width: number;
  height: number;
  uploadDate: string;
  storageKey: string;
  backgroundColor?: string;
  layers: LayerData[];
}

export interface PSDMaskData {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
  defaultColor?: number;
  relative?: boolean;
  disabled?: boolean;
  invert?: boolean;
  hasValidMask: boolean;
}
