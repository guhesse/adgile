
export interface BrandGroup {
  id: number;
  name: string;
  items: BrandItem[];
  isOpen?: boolean;
  icon?: string;
}

export interface BrandItem {
  id: number;
  name: string;
  type: 'color' | 'textStyle';
  color?: string;
  textStyle?: TextStyle;
}

export interface TextStyle {
  id: number;
  name: string;
  style: {
    fontSize: number;
    fontWeight: string;
    fontFamily: string;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
  };
}

export interface FolderIcon {
  name: string;
  icon: React.ReactNode;
  value: string;
}

export interface ColorGroup {
  id: number;
  name: string;
  items: ColorItem[];
  isOpen?: boolean;
  icon?: string;
}

export interface ColorItem {
  id: number;
  name: string;
  color?: string;
  textStyle?: TextStyle;
}

export interface TextStyleGroup {
  id: number;
  name: string;
  items: TextStyleItem[];
  isOpen?: boolean;
  icon?: string;
}

export interface TextStyleItem {
  id: number;
  name: string;
  style?: {
    fontSize: number;
    fontWeight: string;
    fontFamily: string;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
  };
}
