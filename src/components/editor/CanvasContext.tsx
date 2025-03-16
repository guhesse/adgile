
import React, { createContext, useContext, useState } from "react";
import { 
  BannerSize, 
  EditorElement, 
  BANNER_SIZES, 
  EditingMode, 
  CanvasNavigationMode
} from "./types";
import { animationOperations } from "./context/modificationOperations";
import { generateRandomId } from "./utils/idGenerator";
import { CanvasContextType } from "./context/CanvasContextTypes";

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
  
  // Add artboardBackgroundColor state
  const [artboardBackgroundColor, setArtboardBackgroundColor] = useState<string>('#ffffff');

  const organizeElements = () => {
    setKey(prevKey => prevKey + 1);
  };

  const removeElement = (elementId: string) => {
    setElements(prevElements => {
      return prevElements.filter(el => el.id !== elementId);
    });
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
    const newId = `${type}-${generateRandomId()}`;
    
    let newElement: EditorElement = {
      id: newId,
      type,
      content: type === 'text' ? 'Add text here' : '',
      style: {
        x: 50,
        y: 50,
        width: type === 'text' ? 200 : 300,
        height: type === 'text' ? 50 : 200,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: type === 'button' ? '#3b82f6' : (type === 'container' ? '#f9fafb' : 'transparent'),
        padding: type === 'button' ? '8px 16px' : '0px',
        borderRadius: type === 'button' ? 4 : 0,
      },
      sizeId: selectedSize.name === 'All' ? 'global' : selectedSize.name,
    };
    
    // For specific types, customize the default properties
    if (type === 'button') {
      newElement.content = 'Button';
    } else if (type === 'image') {
      newElement.content = 'https://via.placeholder.com/300x200';
    } else if (type === 'container') {
      newElement.style.width = 500;
      newElement.style.height = 300;
      newElement.style.backgroundColor = '#f9fafb';
      newElement.style.borderWidth = 1;
      newElement.style.borderColor = '#e5e7eb';
      newElement.style.borderStyle = 'solid';
    }
    
    setElements(prevElements => [...prevElements, newElement]);
    setSelectedElement(newElement);
  };

  const handleAddLayout = (template: any) => {
    console.log("Adding layout template:", template);
    // Simple implementation - can be expanded for different layout types
    const containerId = `container-${generateRandomId()}`;
    const containerElement: EditorElement = {
      id: containerId,
      type: 'container',
      content: '',
      style: {
        x: 50,
        y: 50,
        width: 600,
        height: 300,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'solid',
        padding: '16px',
      },
      columns: template.columns,
      sizeId: selectedSize.name === 'All' ? 'global' : selectedSize.name,
    };
    
    setElements(prevElements => [...prevElements, containerElement]);
    setSelectedElement(containerElement);
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
    // Simulate image upload - in a real app, you'd upload to a server/storage
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
    // Implementation will be added later if needed
    return elements;
  };

  const linkElementsAcrossSizes = (element: EditorElement) => {
    // Implementation will be added later if needed
    console.log("Link elements across sizes for:", element.id);
  };

  const unlinkElement = (element: EditorElement) => {
    // Implementation will be added later if needed
    console.log("Unlink element:", element.id);
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

  const undo = () => {
    console.log('Undo triggered');
    // Implementation will be added later if needed
  };

  // Update artboard background color
  const updateArtboardBackground = (color: string) => {
    setArtboardBackgroundColor(color);
  };

  // Value object
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
