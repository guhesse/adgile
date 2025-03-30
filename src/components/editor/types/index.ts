
export interface EditorElementStyle {
  x: number;
  y: number;
  width: number;
  height: number;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  padding?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  clipPath?: string;
  hasMask?: boolean;
  maskInfo?: any;
  originalWidth?: number;
  originalHeight?: number;
  objectPosition?: string;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'artboard-background' | 'logo' | 'layout';
  content: string;
  style: EditorElementStyle;
  sizeId: string;
  _layerName?: string;
  psdLayerData?: any;
  linkedElementId?: string;
  isIndividuallyPositioned?: boolean;
  alt?: string;
  childElements?: EditorElement[];
  parentId?: string;
  columns?: number;
}

export interface BannerSize {
  name: string;
  width: number;
  height: number;
  thumbnail?: string;
  orientation?: 'horizontal' | 'vertical' | 'square';
}

export type EditorMode = "banner" | "template";
export type CanvasNavigationMode = 'edit' | 'pan' | 'zoom';
export type EditingMode = 'global' | 'single';
