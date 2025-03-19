/**
 * Interface for storing information about a PSD file
 */
export interface PSDFileData {
  /** The original filename of the PSD */
  fileName: string;

  /** The width of the PSD in pixels */
  width: number;

  /** The height of the PSD in pixels */
  height: number;

  /** The date when the PSD was uploaded */
  uploadDate: string;

  /** Key used to store the PSD data */
  storageKey: string;

  /** Background color extracted from the PSD */
  backgroundColor?: string;

  /** Information about layers in the PSD */
  layers: PSDLayer[];
}

/**
 * Interface for storing metadata about PSD files
 */
export interface PSDMetadata {
  /** List of PSD file storage keys */
  storageKeys: string[];

  /** Date when the metadata was last updated */
  lastUpdated: string;
}

/**
 * Interface for storing information about a layer in a PSD file
 */
export interface PSDLayerInfo {
  /** The ID assigned to this layer in the editor */
  id: string;

  /** The name of the layer in the PSD */
  name: string;

  /** The type of the layer (text, image, etc.) */
  type: string;

  /** The position and dimensions of the layer */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /** For text layers, the text content */
  content?: string;

  /** For image layers, the URL of the image */
  imageUrl?: string;

  /** For image layers, the storage key of the image */
  imageKey?: string;

  /** Text styling information */
  textStyle?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
    lineHeight?: number;
    letterSpacing?: number;
    fontStyle?: string;
    textDecoration?: string;
  };
}

/**
 * Representa o estilo de uma camada de texto
 */
export interface TextLayerStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | string;
  fontStyle: 'normal' | 'italic' | string;
  color: string;
  alignment: 'left' | 'center' | 'right' | 'justify' | string;
  letterSpacing: number; // em EM
  lineHeight: number; // multiplicador da altura da fonte
}

/**
 * Interface for PSD layer
 */
export interface PSDLayer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  textContent?: string;
  textStyle?: TextLayerStyle;
  imageData?: string;
}
