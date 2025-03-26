
export interface BrandItem {
  id: number;
  name: string;
  value: string;  // Required property
  type?: "color" | "textStyle";
  color?: string;
  textStyle?: TextStyle;
}

export interface TextStyle {
  // Core required properties
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  
  // Optional properties
  id?: number;
  name?: string;
  fontStyle?: string;
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
  icon?: string; // Changed from ReactNode to string for compatibility
  styles?: TextStyle[];
  colors?: BrandItem[];
}

export interface ColorItem extends BrandItem {
  type: "color";
  color: string;
}

export interface ColorGroup extends BrandGroup {
  colors: ColorItem[];
  isOpen?: boolean;
  icon?: string;
}

export interface TextStyleGroup extends BrandGroup {
  styles: TextStyle[];
  isOpen?: boolean;
  icon?: string;
}
