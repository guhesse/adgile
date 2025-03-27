
import { EditorElement, BannerSize, CanvasNavigationMode, EditingMode } from "../types";

// Add model state interface
interface ModelState {
  trained: boolean;
  accuracy?: number;
  lastTrained?: string;
}

export interface CanvasContextType {
  elements: EditorElement[];
  setElements: React.Dispatch<React.SetStateAction<EditorElement[]>>;
  selectedElement: EditorElement | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<EditorElement | null>>;
  selectedSize: BannerSize | null;
  setSelectedSize: React.Dispatch<React.SetStateAction<BannerSize | null>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isResizing: boolean;
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  resizeDirection: string;
  setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
  dragStart: { x: number; y: number };
  setDragStart: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  key: number;
  setKey: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: React.Dispatch<React.SetStateAction<CanvasNavigationMode>>;
  activeSizes: BannerSize[];
  setActiveSizes: React.Dispatch<React.SetStateAction<BannerSize[]>>;
  editingMode: EditingMode;
  setEditingMode: React.Dispatch<React.SetStateAction<EditingMode>>;
  gridLayout: boolean;
  toggleGridLayout: () => void;
  organizeElements: () => void;
  removeElement: (elementId: string) => void;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  handleAddElement: (type: EditorElement["type"]) => void;
  handleAddLayout: (template: any) => void;
  handlePreviewAnimation: () => void;
  togglePlayPause: () => void;
  updateAnimations: (time: number) => void;
  handleImageUpload: (file: File) => Promise<string>;
  updateAllLinkedElements: (
    elements: EditorElement[],
    sourceElement: EditorElement,
    percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
    absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>
  ) => EditorElement[];
  linkElementsAcrossSizes: (element: EditorElement) => void;
  unlinkElement: (element: EditorElement) => void;
  addCustomSize: (size: BannerSize) => void;
  removeCustomSize: (size: BannerSize) => void;
  undo: () => void;
  artboardBackgroundColor: string;
  updateArtboardBackground: (color: string) => void;
  // Add model state to context type
  modelState?: ModelState;
}
