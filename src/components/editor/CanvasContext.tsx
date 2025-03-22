import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { 
  BannerSize, 
  EditorElement, 
  BANNER_SIZES, 
  EditingMode, 
  CanvasNavigationMode
} from "./types";
import { animationOperations, removeElement as removeElementOp } from "./context/modificationOperations";
import { generateRandomId } from "./utils/idGenerator";
import { CanvasContextType } from "./context/CanvasContextTypes";
import { updateLinkedElementsIntelligently } from "./utils/grid/responsivePosition";
import { toast } from "sonner";
import { linkElementsToNewSizes } from "./context/responsiveOperations";
import { createNewElement, createLayoutElement } from "./context/elements/createElements";

interface CanvasProviderProps {
  children: React.ReactNode;
}

const defaultSize = BANNER_SIZES[0];

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [key, setKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasNavMode, setCanvasNavMode] = useState<CanvasNavigationMode>('edit');
  const [activeSizes, setActiveSizes] = useState<BannerSize[]>([defaultSize]);
  const [editingMode, setEditingMode] = useState<EditingMode>('global');
  const [gridLayout, setGridLayout] = useState(false);
  const [artboardBackgroundColor, setArtboardBackgroundColor] = useState<string>('#ffffff');
  
  const historyRef = useRef<{elements: EditorElement[], selectedElement: EditorElement | null}[]>([]);
  const currentHistoryIndexRef = useRef<number>(-1);
  const maxHistoryLength = 50;

  const organizeElements = () => {
    setKey(prevKey => prevKey + 1);
  };

  const removeElement = (elementId: string) => {
    const { updatedElements, newSelectedElement } = removeElementOp(
      elementId,
      elements,
      selectedElement,
      editingMode
    );

    setElements(updatedElements);
    setSelectedElement(newSelectedElement);
  };

  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    setElements(prevElements => {
      return prevElements.map(el => {
        if (editingMode === 'global' && selectedElement.linkedElementId && 
            el.linkedElementId === selectedElement.linkedElementId) {
          return {
            ...el,
            style: {
              ...el.style,
              [property]: value
            }
          };
        }
        else if (el.id === selectedElement.id) {
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

    if (selectedElement) {
      setSelectedElement({
        ...selectedElement,
        style: {
          ...selectedElement.style,
          [property]: value
        }
      });
    }
  };

  const updateElementContent = (content: string) => {
    if (!selectedElement) return;

    setElements(prevElements => {
      return prevElements.map(el => {
        if (editingMode === 'global' && selectedElement.linkedElementId && 
            el.linkedElementId === selectedElement.linkedElementId) {
          return {
            ...el,
            content
          };
        }
        else if (el.id === selectedElement.id) {
          return {
            ...el,
            content
          };
        }
        return el;
      });
    });

    if (selectedElement) {
      setSelectedElement({
        ...selectedElement,
        content
      });
    }
  };

  const handleAddElement = (type: EditorElement["type"]) => {
    // Usando importação direta em vez de require
    const newElements = [createNewElement(type, selectedSize)];
    
    // Add the new elements to the state
    setElements(prevElements => [...prevElements, ...newElements]);
    
    // Select the first element (the primary one)
    setSelectedElement(newElements[0]);
  };

  const handleAddLayout = (template: any) => {
    console.log("Adding layout template:", template);
    // Usando importação direta em vez de require
    const newLayoutElements = [createLayoutElement(template, selectedSize, elements)];
    
    // Add the new elements to the state
    setElements(prevElements => [...prevElements, ...newLayoutElements]);
    
    // Select the first element (the primary one)
    setSelectedElement(newLayoutElements[0]);
  };

  const handlePreviewAnimation = () => {
    setKey(key + 1);
  };

  const { togglePlayPause: toggleAnimation, updateAnimations: updateAnimationStates } = animationOperations;

  const togglePlayPause = () => {
    const { newIsPlaying, updatedElements } = toggleAnimation(isPlaying, elements);
    setIsPlaying(newIsPlaying);
    setElements(updatedElements);
  };

  const updateAnimations = (time: number) => {
    const updatedElements = updateAnimationStates(time, elements);
    setElements(updatedElements);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleGridLayout = () => {
    setGridLayout(!gridLayout);
  };

  const updateAllLinkedElements = (
    elements: EditorElement[],
    sourceElement: EditorElement,
    percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
    absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>
  ): EditorElement[] => {
    if (!sourceElement.linkedElementId) return elements;
    
    const calculatedPercentChanges = { ...percentageChanges };
    
    if (absoluteChanges.x !== undefined && percentageChanges.xPercent === undefined) {
      calculatedPercentChanges.xPercent = (absoluteChanges.x / selectedSize.width) * 100;
    }
    
    if (absoluteChanges.y !== undefined && percentageChanges.yPercent === undefined) {
      calculatedPercentChanges.yPercent = (absoluteChanges.y / selectedSize.height) * 100;
    }
    
    if (absoluteChanges.width !== undefined && percentageChanges.widthPercent === undefined) {
      calculatedPercentChanges.widthPercent = (absoluteChanges.width / selectedSize.width) * 100;
    }
    
    if (absoluteChanges.height !== undefined && percentageChanges.heightPercent === undefined) {
      calculatedPercentChanges.heightPercent = (absoluteChanges.height / selectedSize.height) * 100;
    }
    
    const updatedSourceElement = {
      ...sourceElement,
      style: {
        ...sourceElement.style,
        ...absoluteChanges,
        ...calculatedPercentChanges
      }
    };
    
    return updateLinkedElementsIntelligently(elements, updatedSourceElement, activeSizes);
  };

  const linkElementsAcrossSizes = (element: EditorElement) => {
    const { linkElementsAcrossSizes: linkElements } = require('./context/responsiveOperations');
    const updatedElements = linkElements(element, elements, selectedSize, activeSizes);
    setElements(updatedElements);
  };

  const unlinkElement = (element: EditorElement) => {
    const { unlinkElement: unlink } = require('./context/responsiveOperations');
    const updatedElements = unlink(element, elements);
    setElements(updatedElements);
  };

  const addCustomSize = (size: BannerSize) => {
    setActiveSizes(prevSizes => {
      if (prevSizes.find(s => s.name === size.name)) {
        return prevSizes;
      }
      
      const newSizes = [...prevSizes, size];
      
      // Link existing elements to the new size
      setTimeout(() => {
        setElements(prevElements => {
          const updatedElements = linkElementsToNewSizes(prevElements, size, newSizes);
          return updatedElements;
        });
      }, 100);
      
      return newSizes;
    });
  };

  const removeCustomSize = (size: BannerSize) => {
    setActiveSizes(prevSizes => {
      // Filter out elements specific to this size when removing it
      setElements(prevElements => 
        prevElements.filter(el => el.sizeId !== size.name)
      );
      return prevSizes.filter(s => s.name !== size.name);
    });
  };

  const addToHistory = (newElements: EditorElement[], newSelectedElement: EditorElement | null) => {
    if (currentHistoryIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, currentHistoryIndexRef.current + 1);
    }

    if (historyRef.current.length >= maxHistoryLength) {
      historyRef.current.shift();
    } else {
      currentHistoryIndexRef.current++;
    }

    historyRef.current.push({
      elements: JSON.parse(JSON.stringify(newElements)),
      selectedElement: newSelectedElement ? JSON.parse(JSON.stringify(newSelectedElement)) : null
    });
  };

  useEffect(() => {
    if (elements.length > 0) {
      addToHistory(elements, selectedElement);
    }
  }, [elements]);

  const undo = () => {
    console.log('Undo triggered');
    
    if (currentHistoryIndexRef.current <= 0) {
      toast.info("No more actions to undo");
      return;
    }
    
    currentHistoryIndexRef.current--;
    const previousState = historyRef.current[currentHistoryIndexRef.current];
    
    if (previousState) {
      setElements(previousState.elements);
      setSelectedElement(previousState.selectedElement);
      toast.info("Last action undone");
    }
  };

  const updateArtboardBackground = (color: string) => {
    setArtboardBackgroundColor(color);
  };

  const value: CanvasContextType = {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    selectedSize,
    setSelectedSize,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    resizeDirection,
    setResizeDirection,
    dragStart,
    setDragStart,
    key,
    setKey,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    zoomLevel,
    setZoomLevel,
    canvasNavMode,
    setCanvasNavMode,
    activeSizes,
    setActiveSizes,
    editingMode,
    setEditingMode,
    gridLayout,
    toggleGridLayout,
    organizeElements,
    removeElement,
    updateElementStyle,
    updateElementContent,
    handleAddElement,
    handleAddLayout,
    handlePreviewAnimation,
    togglePlayPause,
    updateAnimations,
    handleImageUpload,
    updateAllLinkedElements,
    linkElementsAcrossSizes,
    unlinkElement,
    addCustomSize,
    removeCustomSize,
    undo,
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
