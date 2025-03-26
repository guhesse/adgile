
export interface PSDFileData {
  width: number;
  height: number;
  layers: LayerData[];
  metadata: {
    fileName: string;
    fileSize: number;
    importedAt: string;
  };
}

export interface PSDMetadata {
  storageKeys: string[];
  lastUpdated: string;
  length?: number;
}

export interface LayerData {
  id: string;
  name: string;
  type: "text" | "image" | "group" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  imageData?: string;
  src?: string;
  mask?: any;
  textContent?: string;
  textStyle?: TextLayerStyle;
}

export interface TextLayerStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  textDecoration?: string;
  textTransform?: string;
}
