
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { EditorElement, BannerSize, BANNER_SIZES, CanvasNavigationMode, EditingMode } from "./types";
import { organizeElementsInContainers } from "./utils/gridUtils";
import { createNewElement, createLayoutElement, handleImageUpload } from "./context/elements";
import { linkElementsAcrossSizes, unlinkElement, updateAllLinkedElements, createLinkedVersions } from "./context/responsiveOperations";
import { removeElement, updateElementStyle, updateElementContent, animationOperations } from "./context/modificationOperations";
import { CanvasContextType } from "./context/CanvasContextTypes";
import { toast } from "sonner";

// Define a history interface
interface HistoryState {
  elements: EditorElement[];
  selectedElementId: string | null;
}

const MAX_HISTORY_SIZE = 30;

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0]);
  const [activeSizes, setActiveSizes] = useState<BannerSize[]>([BANNER_SIZES[0]]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [key, setKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasNavMode, setCanvasNavMode] = useState<CanvasNavigationMode>('edit');
  const [editingMode, setEditingMode] = useState<EditingMode>('global');
  const [gridLayout, setGridLayout] = useState<boolean>(false);
  
  // History state for undo functionality
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const historyActionInProgress = useRef(false);
  
  // Initialize history with the current empty state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ elements: [], selectedElementId: null }]);
      setCurrentHistoryIndex(0);
    }
  }, []);

  // Add current state to history when elements change
  useEffect(() => {
    // Skip history recording if this change is due to an undo/redo operation
    if (historyActionInProgress.current) {
      historyActionInProgress.current = false;
      return;
    }

    // Skip if there are no elements and we haven't done anything yet
    if (elements.length === 0 && currentHistoryIndex === 0) {
      return;
    }

    const newHistoryState: HistoryState = {
      elements: [...elements],
      selectedElementId: selectedElement?.id || null,
    };

    // Add to history only if the state has changed
    const lastHistoryState = history[currentHistoryIndex];
    if (
      lastHistoryState && 
      JSON.stringify(lastHistoryState.elements) === JSON.stringify(newHistoryState.elements)
    ) {
      return;
    }

    // Cut off any future history if we've gone back in time and now made a new change
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    
    // Add new state and limit history size
    const updatedHistory = [...newHistory, newHistoryState].slice(-MAX_HISTORY_SIZE);
    
    setHistory(updatedHistory);
    setCurrentHistoryIndex(updatedHistory.length - 1);
  }, [elements]);

  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, [selectedSize]);

  const handleAddElement = (type: EditorElement["type"]) => {
    const newElement = createNewElement(type, selectedSize);
    
    let updatedElements = [...elements, newElement];
    
    if (editingMode === 'global' && activeSizes.length > 1) {
      const linkedElements = createLinkedVersions(newElement, activeSizes, selectedSize);
      updatedElements = [...elements, ...linkedElements];
    } else {
      updatedElements = [...elements, newElement];
    }
    
    setElements(updatedElements);
    setSelectedElement(newElement);
  };

  const handleAddLayout = (template: any) => {
    const layoutElement = createLayoutElement(template, selectedSize, elements);
    
    let updatedElements = [...elements, layoutElement];
    
    if (editingMode === 'global' && activeSizes.length > 1) {
      const linkedElements = createLinkedVersions(layoutElement, activeSizes, selectedSize);
      updatedElements = [...elements, ...linkedElements];
    } else {
      updatedElements = [...elements, layoutElement];
    }

    setElements(updatedElements);
    setSelectedElement(layoutElement);
  };

  const handleRemoveElement = (elementId: string) => {
    const result = removeElement(elementId, elements, selectedElement, editingMode);
    setElements(result.updatedElements);
    setSelectedElement(result.newSelectedElement);
  };

  const handleUpdateElementStyle = (property: string, value: any) => {
    const result = updateElementStyle(property, value, selectedElement, elements, editingMode);
    setElements(result.updatedElements);
    setSelectedElement(result.updatedSelectedElement);
  };

  const handleUpdateElementContent = (content: string) => {
    const result = updateElementContent(content, selectedElement, elements, editingMode);
    setElements(result.updatedElements);
    setSelectedElement(result.updatedSelectedElement);
  };

  const handlePreviewAnimation = () => {
    setKey(animationOperations.handlePreviewAnimation(key));
  };

  const togglePlayPause = () => {
    const result = animationOperations.togglePlayPause(isPlaying, elements);
    setIsPlaying(result.newIsPlaying);
    setElements(result.updatedElements);
  };

  const updateAnimations = (time: number) => {
    setCurrentTime(time);
    setElements(animationOperations.updateAnimations(time, elements));
  };

  const organizeElements = () => {
    const organizedElements = organizeElementsInContainers(elements, selectedSize.width);
    setElements(organizedElements);
  };

  const handleLinkElementsAcrossSizes = (element: EditorElement) => {
    const updatedElements = linkElementsAcrossSizes(element, elements, selectedSize, activeSizes);
    setElements(updatedElements);
    
    if (selectedElement && selectedElement.id === element.id) {
      const updatedSelectedElement = updatedElements.find(el => el.id === element.id);
      if (updatedSelectedElement) {
        setSelectedElement(updatedSelectedElement);
      }
    }
  };
  
  const handleUnlinkElement = (element: EditorElement) => {
    const updatedElements = unlinkElement(element, elements);
    setElements(updatedElements);
    
    if (selectedElement && selectedElement.id === element.id) {
      const updatedSelectedElement = updatedElements.find(el => el.id === element.id);
      if (updatedSelectedElement) {
        setSelectedElement(updatedSelectedElement);
      }
    }
  };
  
  const handleUpdateAllLinkedElements = (
    elementsList: EditorElement[],
    sourceElement: EditorElement,
    percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
    absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>
  ) => {
    return updateAllLinkedElements(
      elementsList,
      sourceElement,
      percentageChanges,
      absoluteChanges,
      activeSizes
    );
  };
  
  // Implement undo functionality
  const handleUndo = () => {
    if (currentHistoryIndex <= 0) {
      toast.info("Não há mais ações para desfazer");
      return;
    }
    
    const newIndex = currentHistoryIndex - 1;
    const previousState = history[newIndex];
    
    // Mark that we're performing an undo/redo operation
    historyActionInProgress.current = true;
    
    setCurrentHistoryIndex(newIndex);
    setElements(previousState.elements);
    
    // Restore the selected element if it exists
    if (previousState.selectedElementId) {
      const selectedEl = previousState.elements.find(
        (el) => el.id === previousState.selectedElementId
      );
      setSelectedElement(selectedEl || null);
    } else {
      setSelectedElement(null);
    }
    
    toast.success("Ação desfeita", { duration: 1500 });
  };

  // Add a new custom size
  const handleAddCustomSize = (newSize: BannerSize) => {
    // Validate the size
    if (!newSize.name || !newSize.width || !newSize.height) {
      toast.error("Tamanho personalizado inválido");
      return;
    }

    // Check if it already exists
    if (activeSizes.some(s => s.name === newSize.name)) {
      toast.error("Já existe um tamanho com este nome");
      return;
    }

    // Add to active sizes
    const updatedSizes = [...activeSizes, newSize];
    setActiveSizes(updatedSizes);
    
    // Select the new size
    setSelectedSize(newSize);

    toast.success(`Tamanho personalizado "${newSize.name}" criado`);
  };

  const toggleGridLayout = () => {
    setGridLayout(!gridLayout);
  };

  return (
    <CanvasContext.Provider value={{
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
      activeSizes,
      setActiveSizes,
      canvasNavMode,
      setCanvasNavMode,
      editingMode,
      setEditingMode,
      gridLayout,
      toggleGridLayout,
      removeElement: handleRemoveElement,
      updateElementStyle: handleUpdateElementStyle,
      updateElementContent: handleUpdateElementContent,
      handleAddElement,
      handleAddLayout,
      handlePreviewAnimation,
      togglePlayPause,
      updateAnimations,
      organizeElements,
      handleImageUpload,
      updateAllLinkedElements: handleUpdateAllLinkedElements,
      linkElementsAcrossSizes: handleLinkElementsAcrossSizes,
      unlinkElement: handleUnlinkElement,
      addCustomSize: handleAddCustomSize,
      undo: handleUndo
    }}>
      {children}
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
