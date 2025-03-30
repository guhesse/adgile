import { EditorElement, BannerSize } from "../types";

export interface LayoutTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical' | 'square';
  elements: any[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingData {
  id: string;
  templates: LayoutTemplate[];
  modelMetadata: {
    trainedAt: string | null;
    iterations: number;
    accuracy: number;
    loss: number;
  };
}

export interface AdminStats {
  totalTemplates: number;
  verticalTemplates: number;
  horizontalTemplates: number;
  squareTemplates: number;
  lastTrainingDate?: string;
  modelAccuracy?: number;
}

export interface AdminLayoutListProps {
  templates: LayoutTemplate[];
  onDeleteTemplate: (id: string) => void;
}
