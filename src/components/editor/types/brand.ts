
export interface BrandItem {
  id: number;
  name: string;
  value: string;
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
