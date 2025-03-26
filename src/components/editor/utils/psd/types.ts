
export interface TextLayerStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
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

export interface LayerData {
  id: string;
  name: string;
  type: 'text' | 'image' | 'group' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string;
  textContent?: string;
  textStyle?: TextLayerStyle;
  mask?: any;
  imageData?: string;
}
