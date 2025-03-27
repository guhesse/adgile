
import { LayoutTemplate } from "@/components/editor/types/admin";
import { BannerSize } from "@/components/editor/types";

export interface AdminLayoutListProps {
  templates: LayoutTemplate[];
  onDeleteTemplate: (templateId: string) => void;
  onImportTemplates?: (templates: LayoutTemplate[]) => void;
}

export interface AdminFormatSelectorProps {
  formats: BannerSize[];
  selectedFormat: BannerSize | null;
  onSelectFormat: (format: BannerSize) => void;
}

export interface AdminPSDImportProps {
  onPSDImport: (elements: any[], psdSize: BannerSize) => void;
}

export interface AdminLayoutStatsProps {
  stats: any;
  layouts: LayoutTemplate[];
}

export interface ImportedLayoutData {
  key: string;
  data: LayoutTemplate[];
}
