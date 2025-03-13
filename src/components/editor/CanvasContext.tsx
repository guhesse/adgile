import { createContext, useContext, useState, useEffect } from "react";
import { EditorElement, BannerSize, BANNER_SIZES, CanvasNavigationMode, EditingMode } from "./types";
import { organizeElementsInContainers } from "./utils/gridUtils";
import { createNewElement, createLayoutElement, handleImageUpload } from "./context/elementOperations";
import { linkElementsAcrossSizes, unlinkElement, updateAllLinkedElements, createLinkedVersions } from "./context/responsiveOperations";
import { removeElement, updateElementStyle, updateElementContent, animationOperations } from "./context/modificationOperations";
import { CanvasContextType } from "./context/CanvasContextTypes";

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
      unlinkElement: handleUnlinkElement
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
