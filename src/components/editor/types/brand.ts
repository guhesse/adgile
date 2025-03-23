
// Tipos de dados para o gerenciamento de marca e estilos

export interface ColorItem {
  id: string;
  name: string;
  value: string;
}

export interface ColorGroup {
  id: string;
  name: string;
  colors: ColorItem[];
}

export interface TextStyleItem {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: string;
  textTransform?: string;
}

export interface TextStyleGroup {
  id: string;
  name: string;
  styles: TextStyleItem[];
}

export interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'image' | 'icon';
  url: string;
  description?: string;
  tags?: string[];
}

export interface BrandAssetGroup {
  id: string;
  name: string;
  assets: BrandAsset[];
}

export interface BrandData {
  id: string;
  name: string;
  colorGroups: ColorGroup[];
  textStyleGroups: TextStyleGroup[];
  assetGroups: BrandAssetGroup[];
}
