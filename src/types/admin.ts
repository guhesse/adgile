
import { BannerSize } from '@/components/editor/types';
import { AdminStats, LayoutTemplate } from '@/components/editor/types/admin';

export interface AdminFormatSelectorProps {
  formats: BannerSize[];
  onSelectFormat: (format: BannerSize) => void;
  selectedFormat: BannerSize | null;
}

export interface AdminLayoutListProps {
  templates: LayoutTemplate[];
  onDeleteTemplate: (templateId: string) => void;
}

export interface AIModelManagerProps {
  templates: LayoutTemplate[];
  isModelTrained: boolean;
  modelMetadata: {
    trainedAt: any;
    iterations: number;
    accuracy: number;
    loss: number;
  };
  onTrainModel: () => Promise<void>;
}

export interface AdminLayoutStatsProps {
  stats: AdminStats;
  layouts?: LayoutTemplate[];
}
