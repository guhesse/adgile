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
