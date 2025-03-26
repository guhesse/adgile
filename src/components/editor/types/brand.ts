
export interface BrandItem {
  id: number;
  name: string;
  value: string;  // Adding this required property
  type?: "color" | "textStyle";
  color?: string;
  textStyle?: TextStyle;
}

export interface TextStyle {
  id?: number;
  name?: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  fontStyle?: string; // Adding missing properties used in the PSD processor
  text?: string;
  alignment?: "left" | "center" | "right";
  textAlign?: "left" | "center" | "right";
  textDecoration?: string;
  textTransform?: string;
  style?: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    lineHeight: number;
    letterSpacing: number;
    color: string;
    textTransform?: string;
  };
}

export interface BrandGroup {
  id: number;
  name: string;
  items: BrandItem[];
  isOpen?: boolean;
  icon?: React.ReactNode;
  styles?: TextStyle[];
  colors?: BrandItem[];
}

export interface ColorItem extends BrandItem {
  type: "color";
  color: string;
}

export interface ColorGroup {
  id: number;
  name: string;
  colors: ColorItem[];
}

export interface TextStyleGroup {
  id: number;
  name: string;
  styles: TextStyle[];
}
