
export interface PSDFileData {
  width: number;
  height: number;
  layers: LayerData[];
  metadata: {
    fileName: string;
    fileSize: number;
    importedAt: string;
  };
  backgroundColor?: string;
}

export interface PSDMetadata {
  storageKeys: string[];
  lastUpdated: string;
  length?: number;
}

export interface LayerData {
  id: string;
  name: string;
  type: "text" | "image" | "group" | "shape" | string; // Added generic string to be compatible with existing code
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
  // Additional properties
  text?: string;
  fontStyle?: string;
  alignment?: "left" | "center" | "right";
}
