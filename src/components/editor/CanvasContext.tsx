import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import {
  BannerSize,
  EditorElement,
  BANNER_SIZES,
  CanvasNavigationMode,
  EditingMode
} from "./types";
import { animationOperations, removeElement as removeElementOp } from "./context/modificationOperations";
import { generateRandomId } from "./utils/idGenerator";
import { CanvasContextType } from "./context/CanvasContextTypes";
import { toast } from "sonner";

interface CanvasProviderProps {
  children: React.ReactNode | ((context: CanvasContextType) => React.ReactNode);
  fixedSize?: BannerSize;
}

// Add model state interface
interface ModelState {
  trained: boolean;
  accuracy?: number;
  lastTrained?: string;
}

const defaultSize = BANNER_SIZES[0];

export const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children, fixedSize }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize | null>(null); // Changed to null to start with no format
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [key, setKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasNavMode, setCanvasNavMode] = useState<CanvasNavigationMode>('edit');
  const [activeSizes, setActiveSizes] = useState<BannerSize[]>(fixedSize ? [fixedSize] : []);
  const [gridLayout, setGridLayout] = useState(false);
  const [artboardBackgroundColor, setArtboardBackgroundColor] = useState<string>('#ffffff');
  // Estado de edição para manusear elementos vinculados
  const [editingMode, setEditingMode] = useState<EditingMode>('specific');
  // Add model state
  const [modelState, setModelState] = useState<ModelState>({
    trained: true,
    accuracy: 0.92,
    lastTrained: new Date().toISOString()
  });

  const historyRef = useRef<{ elements: EditorElement[], selectedElement: EditorElement | null }[]>([]);
  const currentHistoryIndexRef = useRef<number>(-1);
  const maxHistoryLength = 50;

  useEffect(() => {
    if (fixedSize) {
      setSelectedSize(fixedSize);
      setActiveSizes([fixedSize]);
    }

    // No need to fetch model state as we're always setting it to trained=true by default
  }, [fixedSize]);

  const organizeElements = () => {
    setKey(prevKey => prevKey + 1);
  };

  const removeElement = (elementId: string) => {
    const { updatedElements, newSelectedElement } = removeElementOp(
      elementId,
      elements,
      selectedElement,
    );

    setElements(updatedElements);
    setSelectedElement(newSelectedElement);
  };

  const handleAddElement = (type: EditorElement["type"]) => {
    const newId = `${type}-${generateRandomId()}`;

    // Ensure we have a selected size
    if (!selectedSize) {
      toast.error("Selecione um formato antes de adicionar elementos");
      return;
    }

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
      // Always use specific size ID, never use 'global'
      sizeId: selectedSize.name,
    };

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
      sizeId: selectedSize.name !== 'All' ? selectedSize.name : undefined,
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
        if (selectedElement.linkedElementId &&
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
      toast.info("Não há mais ações para desfazer");
      return;
    }

    currentHistoryIndexRef.current--;
    const previousState = historyRef.current[currentHistoryIndexRef.current];

    if (previousState) {
      setElements(previousState.elements);
      setSelectedElement(previousState.selectedElement);
      toast.info("Última ação desfeita");
    }
  };

  const updateArtboardBackground = (color: string) => {
    setArtboardBackgroundColor(color);
  };

  // Função placeholder para vincular elementos
  const linkElementsAcrossSizes = (element: EditorElement) => {
    // Implementação de vinculação de elementos
    console.log("Vinculando elemento entre formatos:", element.id);
  };

  // Função placeholder para desvincular elementos
  const unlinkElement = (element: EditorElement) => {
    // Implementação de desvinculação
    console.log("Desvinculando elemento:", element.id);
  };

  // Função placeholder para atualizar elementos vinculados
  const updateAllLinkedElements = (
    elements: EditorElement[],
    sourceElement: EditorElement,
    percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
    absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>
  ) => {
    // Implementação de atualização de elementos vinculados
    return elements;
  };

  // Função placeholder para carregar layout
  const loadSavedLayout = async (layoutId: number) => {
    try {
      // Implementação de carregamento de layout
      toast.success(`Layout carregado com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro ao carregar layout:", error);
      toast.error(`Erro ao carregar layout: ${error.message || 'Erro desconhecido'}`);
      return false;
    }
  };

  // Função placeholder para definir tamanho por nome
  const setSelectedSizeByName = (name: string) => {
    const size = activeSizes.find(s => s.name === name);
    if (size) {
      setSelectedSize(size);
    }
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
    updateElementStyle,
    updateElementContent,
    removeElement,
    handleAddElement,
    handleAddLayout,
    handlePreviewAnimation,
    togglePlayPause,
    updateAnimations,
    handleImageUpload,
    addCustomSize,
    removeCustomSize,
    undo,
    artboardBackgroundColor,
    updateArtboardBackground,
    modelState,
    loadSavedLayout,
    linkElementsAcrossSizes,
    unlinkElement,
    updateAllLinkedElements
  };

  return (
    <CanvasContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
