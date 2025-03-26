
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  textTransform?: string;
}

export interface BrandItem {
  id: number;
  name: string;
  type: 'color' | 'textStyle';
  color?: string;
  textStyle?: TextStyle;
}

export interface BrandGroup {
  id: number;
  name: string;
  items: BrandItem[];
}

// For backward compatibility
export type ColorItem = BrandItem;
export type TextStyleGroup = BrandGroup;
export type ColorGroup = BrandGroup;
