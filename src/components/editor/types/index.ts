
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
  scale?: number;
  opacity?: number;
  clipPath?: string;
  hasMask?: boolean;
  maskInfo?: any;
  // Support for original dimensions for correct aspect ratio
  originalWidth?: number;
  originalHeight?: number;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'artboard-background';
  content: string;
  style: EditorElementStyle;
  sizeId: string;
  _layerName?: string;
  psdLayerData?: any;
  // Add link properties
  link?: string;
  openInNewTab?: boolean;
  alt?: string;
}

export interface BannerSize {
  name: string;
  width: number;
  height: number;
  thumbnail?: string;
  orientation: 'vertical' | 'horizontal' | 'square';
}

export type EditorMode = "banner" | "template";
