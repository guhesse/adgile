
export type BannerSize = {
  name: string;
  width: number;
  height: number;
};

export type EditorElement = {
  id: string;
  type: "text" | "image" | "button" | "layout";
  content: string;
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    fontFamily?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    backgroundColor?: string;
    padding?: string;
    animation?: string;
    animationDuration?: number;
    animationDelay?: number;
    animationPlayState?: "running" | "paused";
  };
  columns?: number;
  childElements?: EditorElement[];
};

export const BANNER_SIZES: BannerSize[] = [
  { name: "Email Template", width: 600, height: 800 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Twitter Post", width: 1024, height: 512 },
  { name: "LinkedIn Banner", width: 1584, height: 396 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
];

export const ANIMATION_PRESETS = [
  { name: "Fade In", value: "animate-fade-in" },
  { name: "Fade Out", value: "animate-fade-out" },
  { name: "Scale In", value: "animate-scale-in" },
  { name: "Scale Out", value: "animate-scale-out" },
  { name: "Slide In Right", value: "animate-slide-in-right" },
  { name: "Slide Out Right", value: "animate-slide-out-right" },
  { name: "Bounce", value: "animate-bounce" },
  { name: "Pulse", value: "animate-pulse" },
];

export type LayoutTemplate = {
  id: string;
  name: string;
  columns: number;
  preview: string;
  type: "blank" | "preset";
};

export const BLANK_LAYOUTS: LayoutTemplate[] = [
  { id: "blank-1", name: "1 coluna", columns: 1, preview: "1", type: "blank" },
  { id: "blank-2-left", name: "2 colunas (E)", columns: 2, preview: "2", type: "blank" },
  { id: "blank-2-right", name: "2 colunas (D)", columns: 2, preview: "2", type: "blank" },
  { id: "blank-2-equal", name: "2 colunas iguais", columns: 2, preview: "2", type: "blank" },
  { id: "blank-3", name: "3 colunas", columns: 3, preview: "3", type: "blank" },
  { id: "blank-4", name: "4 colunas", columns: 4, preview: "4", type: "blank" },
];

export const PRESET_LAYOUTS: LayoutTemplate[] = [
  { id: "preset-image-text", name: "Imagem e texto", columns: 2, preview: "IT", type: "preset" },
  { id: "preset-text-text", name: "Texto e texto", columns: 2, preview: "TT", type: "preset" },
];
