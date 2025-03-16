import React, { createContext, useContext, useState } from "react";
import { 
  BannerSize, 
  EditorElement, 
  BANNER_SIZES, 
  EditingMode, 
  CanvasNavigationMode
} from "./types";

interface CanvasContextInterface {
  elements: EditorElement[];
  setElements: React.Dispatch<React.SetStateAction<EditorElement[]>>;
  selectedElement: EditorElement | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<EditorElement | null>>;
  selectedSize: BannerSize;
  setSelectedSize: React.Dispatch<React.SetStateAction<BannerSize>>;
  key: number;
  setKey: React.Dispatch<React.SetStateAction<number>>;
  organizeElements: () => void;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: React.Dispatch<React.SetStateAction<CanvasNavigationMode>>;
  activeSizes: BannerSize[];
  addCustomSize: (size: BannerSize) => void;
  removeCustomSize: (size: BannerSize) => void;
  editingMode: EditingMode;
  setEditingMode: React.Dispatch<React.SetStateAction<EditingMode>>;
  updateAllLinkedElements: (element: EditorElement, property: string, value: any) => void;
  removeElement: (elementId: string) => void;
  undo: () => void;
  artboardBackgroundColor: string;
  updateArtboardBackground: (color: string) => void;
}

interface CanvasProviderProps {
  children: React.ReactNode;
}

const defaultSize = BANNER_SIZES[0];

export const CanvasContext = createContext<CanvasContextInterface | undefined>(undefined);

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize>(defaultSize);
  const [key, setKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasNavMode, setCanvasNavMode] = useState<CanvasNavigationMode>('edit');
  const [activeSizes, setActiveSizes] = useState<BannerSize[]>([defaultSize]);
  const [editingMode, setEditingMode] = useState<EditingMode>('global');
  
  // Add artboardBackgroundColor state
  const [artboardBackgroundColor, setArtboardBackgroundColor] = useState<string>('#ffffff');

  const organizeElements = () => {
    setKey(prevKey => prevKey + 1);
  };

  const updateAllLinkedElements = (element: EditorElement, property: string, value: any) => {
    if (!element.linkedElementId) return;

    setElements(prevElements => {
      return prevElements.map(el => {
        if (el.id === element.linkedElementId) {
          return {
            ...el,
            style: {
              ...el.style,
              [property]: value
            }
          };
        }
        return el;
      });
    });
  };

  const removeElement = (elementId: string) => {
    setElements(prevElements => {
      return prevElements.filter(el => el.id !== elementId);
    });
  };

  const undo = () => {
    console.log('Undo triggered');
  };

  const addCustomSize = (size: BannerSize) => {
    setActiveSizes(prevSizes => {
      if (prevSizes.find(s => s.name === size.name)) {
        return prevSizes;
      }
      return [...prevSizes, size];
    });
  };

  const removeCustomSize = (size: BannerSize) => {
    setActiveSizes(prevSizes => {
      return prevSizes.filter(s => s.name !== size.name);
    });
  };

  // Update artboard background color
  const updateArtboardBackground = (color: string) => {
    setArtboardBackgroundColor(color);
  };

  // Value object
  const value = {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    selectedSize,
    setSelectedSize,
    key,
    setKey,
    organizeElements,
    zoomLevel,
    setZoomLevel,
    canvasNavMode,
    setCanvasNavMode,
    activeSizes,
    addCustomSize,
    removeCustomSize,
    editingMode,
    setEditingMode,
    updateAllLinkedElements,
    removeElement,
    undo,
    
    // Add artboardBackgroundColor
    artboardBackgroundColor,
    updateArtboardBackground
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
