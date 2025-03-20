export interface ColorGroup {
  id: number;
  name: string;
  colors: ColorItem[];
  isOpen?: boolean;
  icon?: string;
}

export interface ColorItem {
  id: number;
  name: string;
  color: string;
  textStyle?: TextStyle;
}

export interface TextStyleGroup {
  id: number;
  name: string;
  styles: TextStyle[];
  isOpen?: boolean;
  icon?: string;
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
