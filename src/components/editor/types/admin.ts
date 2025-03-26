
import { EditorElement } from "../types";

export interface LayoutTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation: 'vertical' | 'horizontal' | 'square';
  elements: EditorElement[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingData {
  id: string;
  templates: LayoutTemplate[];
  modelMetadata?: {
    trainedAt?: string;
    iterations?: number;
    accuracy?: number;
    loss?: number;
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
