
export interface LayoutTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation?: 'vertical' | 'horizontal' | 'square';
  elements: any[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalLayouts: number;
  totalElements: number;
  lastUpdated: string;
  layoutsByFormat: {
    format: string;
    count: number;
  }[];
  elementTypes: {
    type: string;
    count: number;
  }[];
}
