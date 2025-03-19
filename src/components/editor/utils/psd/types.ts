
/**
 * Tipo para armazenar estilo de texto de uma camada PSD
 */
export interface TextLayerStyle {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string | number;
    fontStyle: string;
    color: string;
    alignment: string;
    letterSpacing: number;
    lineHeight: number;
}

/**
 * Tipos de camadas de PSD
 */
export enum PSDLayerType {
    TEXT = 'text',
    IMAGE = 'image',
    SHAPE = 'shape',
    GROUP = 'group',
    ADJUSTMENT = 'adjustment',
    UNKNOWN = 'unknown'
}

/**
 * Interface para representar uma camada PSD
 */
export interface PSDLayer {
    name: string;
    type: PSDLayerType;
    visible: boolean;
    opacity: number;
    left: number;
    top: number;
    width: number;
    height: number;
    textData?: any;
    textStyle?: TextLayerStyle;
    imageData?: ImageData;
    children?: PSDLayer[];
}

/**
 * Interface de dados para elementos importados de PSD
 */
export interface ImportedPSDData {
    width: number;
    height: number;
    elements: any[];
}
