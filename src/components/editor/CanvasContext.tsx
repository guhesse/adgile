
import { createContext, useContext, useState, useEffect } from "react";
import { EditorElement, BannerSize, BANNER_SIZES, CanvasNavigationMode, EditingMode } from "./types";
import { organizeElementsInContainers, snapToGrid, convertElementToPercentage, applyPercentageToElement } from "./utils/gridUtils";
import { toast } from "sonner";

interface CanvasContextType {
  elements: EditorElement[];
  setElements: React.Dispatch<React.SetStateAction<EditorElement[]>>;
  selectedElement: EditorElement | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<EditorElement | null>>;
  selectedSize: BannerSize;
  setSelectedSize: React.Dispatch<React.SetStateAction<BannerSize>>;
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
  activeSizes: BannerSize[];
  setActiveSizes: React.Dispatch<React.SetStateAction<BannerSize[]>>;
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: React.Dispatch<React.SetStateAction<CanvasNavigationMode>>;
  editingMode: EditingMode;
  setEditingMode: React.Dispatch<React.SetStateAction<EditingMode>>;
  removeElement: (elementId: string) => void;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  handleAddElement: (type: EditorElement["type"]) => void;
  handleAddLayout: (template: any) => void;
  handlePreviewAnimation: () => void;
  togglePlayPause: () => void;
  updateAnimations: (time: number) => void;
  organizeElements: () => void;
  handleImageUpload: (file: File) => Promise<string>;
  updateAllLinkedElements: (
    elements: EditorElement[],
    sourceElement: EditorElement,
    percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
    absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>
  ) => EditorElement[];
  linkElementsAcrossSizes: (element: EditorElement) => void;
  unlinkElement: (element: EditorElement) => void;
}

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

  // Update element positions when size changes
  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, [selectedSize]);

  // Link an element across all active sizes
  const linkElementsAcrossSizes = (element: EditorElement) => {
    if (!element || activeSizes.length <= 1) return;
    
    // Create a unique linked ID for this group of elements
    const linkedId = `linked-${Date.now()}`;
    
    // Convert the source element to percentage-based values
    const sourceElementWithPercentages = convertElementToPercentage(
      element,
      selectedSize.width,
      selectedSize.height
    );
    
    // Update the elements array with linked versions across all sizes
    const updatedElements = [...elements];
    
    // Find the element in the array and update it
    const sourceIndex = updatedElements.findIndex(el => el.id === element.id);
    if (sourceIndex !== -1) {
      updatedElements[sourceIndex] = {
        ...updatedElements[sourceIndex],
        linkedElementId: linkedId,
        style: {
          ...updatedElements[sourceIndex].style,
          xPercent: sourceElementWithPercentages.style.xPercent,
          yPercent: sourceElementWithPercentages.style.yPercent,
          widthPercent: sourceElementWithPercentages.style.widthPercent,
          heightPercent: sourceElementWithPercentages.style.heightPercent
        }
      };
    }
    
    // Create clones for each other active size
    activeSizes.forEach(size => {
      // Skip the current size (source element's size)
      if (size.name === selectedSize.name) return;
      
      // Create a clone for this size
      const clone: EditorElement = {
        ...element,
        id: `${element.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeId: size.name,
        linkedElementId: linkedId,
        style: {
          ...element.style,
          // Apply the percentage values to the new size
          xPercent: sourceElementWithPercentages.style.xPercent,
          yPercent: sourceElementWithPercentages.style.yPercent,
          widthPercent: sourceElementWithPercentages.style.widthPercent,
          heightPercent: sourceElementWithPercentages.style.heightPercent,
          // Calculate the absolute values for this size
          x: (sourceElementWithPercentages.style.xPercent! * size.width) / 100,
          y: (sourceElementWithPercentages.style.yPercent! * size.height) / 100,
          width: (sourceElementWithPercentages.style.widthPercent! * size.width) / 100,
          height: (sourceElementWithPercentages.style.heightPercent! * size.height) / 100
        }
      };
      
      // Add the clone to the elements array
      updatedElements.push(clone);
    });
    
    // Update the elements state
    setElements(updatedElements);
    
    // Update the selected element reference
    if (selectedElement && selectedElement.id === element.id) {
      setSelectedElement({
        ...selectedElement,
        linkedElementId: linkedId,
        style: {
          ...selectedElement.style,
          xPercent: sourceElementWithPercentages.style.xPercent,
          yPercent: sourceElementWithPercentages.style.yPercent,
          widthPercent: sourceElementWithPercentages.style.widthPercent,
          heightPercent: sourceElementWithPercentages.style.heightPercent
        }
      });
    }
    
    toast.success('Elemento vinculado em todos os tamanhos');
  };
  
  // Unlink an element from its linked elements
  const unlinkElement = (element: EditorElement) => {
    if (!element || !element.linkedElementId) return;
    
    // Make this element independently positionable
    const updatedElements = elements.map(el => {
      if (el.id === element.id) {
        return {
          ...el,
          linkedElementId: undefined,
          isIndividuallyPositioned: true
        };
      }
      return el;
    });
    
    setElements(updatedElements);
    
    // Update the selected element reference
    if (selectedElement && selectedElement.id === element.id) {
      setSelectedElement({
        ...selectedElement,
        linkedElementId: undefined,
        isIndividuallyPositioned: true
      });
    }
    
    toast.success('Elemento desvinculado');
  };
  
  // Update all linked elements when one is modified
  const updateAllLinkedElements = (
    elements: EditorElement[],
    sourceElement: EditorElement,
    percentageChanges: Partial<{ xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }>,
    absoluteChanges: Partial<{ x: number; y: number; width: number; height: number }>
  ): EditorElement[] => {
    if (!sourceElement.linkedElementId) return elements;
    
    return elements.map(el => {
      // Update source element
      if (el.id === sourceElement.id) {
        return {
          ...el,
          style: {
            ...el.style,
            ...absoluteChanges,
            ...percentageChanges
          }
        };
      }
      
      // Update linked elements
      if (el.linkedElementId === sourceElement.linkedElementId && !el.isIndividuallyPositioned) {
        const size = activeSizes.find(size => size.name === el.sizeId);
        
        if (size) {
          // Calculate absolute values for this size
          const newAbsoluteValues: Record<string, number> = {};
          
          if (percentageChanges.xPercent !== undefined) {
            newAbsoluteValues.x = (percentageChanges.xPercent * size.width) / 100;
          }
          
          if (percentageChanges.yPercent !== undefined) {
            newAbsoluteValues.y = (percentageChanges.yPercent * size.height) / 100;
          }
          
          if (percentageChanges.widthPercent !== undefined) {
            newAbsoluteValues.width = (percentageChanges.widthPercent * size.width) / 100;
          }
          
          if (percentageChanges.heightPercent !== undefined) {
            newAbsoluteValues.height = (percentageChanges.heightPercent * size.height) / 100;
          }
          
          return {
            ...el,
            style: {
              ...el.style,
              ...newAbsoluteValues,
              ...percentageChanges
            }
          };
        }
      }
      
      return el;
    });
  };

  const handleAddElement = (type: EditorElement["type"]) => {
    const newElement: EditorElement = {
      id: Date.now().toString(),
      type,
      content: type === "text" || type === "paragraph" ? "Text Element" : 
               type === "button" ? "Button Element" : 
               type === "divider" ? "" : 
               type === "spacer" ? "" : 
               type === "logo" ? "" : 
               type === "video" ? "" : "",
      inContainer: false,
      style: {
        x: snapToGrid(100),
        y: snapToGrid(100),
        width: snapToGrid(
          type === "text" || type === "paragraph" ? 200 : 
          type === "image" || type === "logo" ? 150 : 
          type === "video" ? 320 : 
          type === "divider" ? 300 : 
          type === "spacer" ? 100 : 200
        ),
        height: snapToGrid(
          type === "text" ? 40 : 
          type === "paragraph" ? 100 : 
          type === "image" || type === "logo" ? 150 : 
          type === "video" ? 180 : 
          type === "divider" ? 2 : 
          type === "spacer" ? 50 : 50
        ),
        fontSize: type === "text" || type === "paragraph" ? 16 : undefined,
        color: type === "text" || type === "paragraph" ? "#000000" : undefined,
        fontFamily: type === "text" || type === "paragraph" ? "Inter" : undefined,
        lineHeight: type === "text" || type === "paragraph" ? 1.5 : undefined,
        textAlign: type === "text" || type === "paragraph" ? "left" : undefined,
        backgroundColor: type === "button" ? "#1a1f2c" : 
                         type === "divider" ? "#d1d5db" : 
                         type === "spacer" ? undefined : undefined,
        padding: type === "button" ? "8px 16px" : undefined,
      },
      sizeId: selectedSize.name,
    };
    
    // Calculate percentage values for the element
    const xPercent = (newElement.style.x / selectedSize.width) * 100;
    const yPercent = (newElement.style.y / selectedSize.height) * 100;
    const widthPercent = (newElement.style.width / selectedSize.width) * 100;
    const heightPercent = (newElement.style.height / selectedSize.height) * 100;
    
    // Add percentage values
    newElement.style.xPercent = xPercent;
    newElement.style.yPercent = yPercent;
    newElement.style.widthPercent = widthPercent;
    newElement.style.heightPercent = heightPercent;
    
    let updatedElements = [...elements, newElement];
    
    // If in global editing mode and multiple sizes active, create linked versions
    if (editingMode === 'global' && activeSizes.length > 1) {
      const linkedId = `linked-${Date.now()}`;
      newElement.linkedElementId = linkedId;
      
      // Create linked elements for other sizes
      activeSizes.forEach(size => {
        // Skip the current size
        if (size.name === selectedSize.name) return;
        
        const linkedElement: EditorElement = {
          ...newElement,
          id: `${newElement.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
          sizeId: size.name,
          linkedElementId: linkedId,
          style: {
            ...newElement.style,
            // Apply percentage values to calculate absolute positions for this size
            x: (xPercent * size.width) / 100,
            y: (yPercent * size.height) / 100,
            width: (widthPercent * size.width) / 100,
            height: (heightPercent * size.height) / 100
          }
        };
        
        updatedElements.push(linkedElement);
      });
    }
    
    setElements(updatedElements);
    setSelectedElement(newElement);
  };

  const handleAddLayout = (template: any) => {
    const lastY = elements.length > 0 
      ? Math.max(...elements.map(el => el.style.y + el.style.height)) + 20
      : 20;

    const layoutWidth = selectedSize.width - 40;
    const layoutElement: EditorElement = {
      id: Date.now().toString(),
      type: "layout",
      content: template.name,
      inContainer: false,
      style: {
        x: 20,
        y: snapToGrid(lastY),
        width: layoutWidth,
        height: 150,
        backgroundColor: "#ffffff",
        padding: "10px",
      },
      columns: template.columns,
      childElements: [],
      sizeId: selectedSize.name,
    };

    // Calculate percentage values
    layoutElement.style.xPercent = (layoutElement.style.x / selectedSize.width) * 100;
    layoutElement.style.yPercent = (layoutElement.style.y / selectedSize.height) * 100;
    layoutElement.style.widthPercent = (layoutElement.style.width / selectedSize.width) * 100;
    layoutElement.style.heightPercent = (layoutElement.style.height / selectedSize.height) * 100;

    // Add preset content if needed
    if (template.type === "preset") {
      if (template.id === "preset-image-text") {
        layoutElement.childElements = [
          {
            id: Date.now().toString() + "-1",
            type: "image",
            content: "",
            inContainer: true,
            parentId: layoutElement.id,
            style: {
              x: 0,
              y: 0,
              width: layoutWidth / 2 - 5,
              height: 130,
              xPercent: 0,
              yPercent: 0,
              widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
              heightPercent: (130 / 150) * 100
            },
            sizeId: selectedSize.name
          },
          {
            id: Date.now().toString() + "-2",
            type: "text",
            content: "Add your text here",
            inContainer: true,
            parentId: layoutElement.id,
            style: {
              x: layoutWidth / 2 + 5,
              y: 0,
              width: layoutWidth / 2 - 5,
              height: 130,
              fontSize: 16,
              color: "#000000",
              fontFamily: "Inter",
              lineHeight: 1.5,
              textAlign: "left",
              xPercent: ((layoutWidth / 2 + 5) / layoutWidth) * 100,
              yPercent: 0,
              widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
              heightPercent: (130 / 150) * 100
            },
            sizeId: selectedSize.name
          }
        ];
      } else if (template.id === "preset-text-text") {
        layoutElement.childElements = [
          {
            id: Date.now().toString() + "-1",
            type: "text",
            content: "First column text",
            inContainer: true,
            parentId: layoutElement.id,
            style: {
              x: 0,
              y: 0,
              width: layoutWidth / 2 - 5,
              height: 130,
              fontSize: 16,
              color: "#000000",
              fontFamily: "Inter",
              lineHeight: 1.5,
              textAlign: "left",
              xPercent: 0,
              yPercent: 0,
              widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
              heightPercent: (130 / 150) * 100
            },
            sizeId: selectedSize.name
          },
          {
            id: Date.now().toString() + "-2",
            type: "text",
            content: "Second column text",
            inContainer: true,
            parentId: layoutElement.id,
            style: {
              x: layoutWidth / 2 + 5,
              y: 0,
              width: layoutWidth / 2 - 5,
              height: 130,
              fontSize: 16,
              color: "#000000",
              fontFamily: "Inter",
              lineHeight: 1.5,
              textAlign: "left",
              xPercent: ((layoutWidth / 2 + 5) / layoutWidth) * 100,
              yPercent: 0,
              widthPercent: ((layoutWidth / 2 - 5) / layoutWidth) * 100,
              heightPercent: (130 / 150) * 100
            },
            sizeId: selectedSize.name
          }
        ];
      }
    }

    let updatedElements = [...elements, layoutElement];
    
    // If in global editing mode and multiple sizes active, create linked versions
    if (editingMode === 'global' && activeSizes.length > 1) {
      const linkedId = `linked-${Date.now()}`;
      layoutElement.linkedElementId = linkedId;
      
      // Create linked layouts for other sizes
      activeSizes.forEach(size => {
        // Skip the current size
        if (size.name === selectedSize.name) return;
        
        // Calculate absolute values for this size
        const newX = (layoutElement.style.xPercent! * size.width) / 100;
        const newY = (layoutElement.style.yPercent! * size.height) / 100;
        const newWidth = (layoutElement.style.widthPercent! * size.width) / 100;
        const newHeight = (layoutElement.style.heightPercent! * size.height) / 100;
        
        const linkedLayout: EditorElement = {
          ...layoutElement,
          id: `${layoutElement.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
          sizeId: size.name,
          linkedElementId: linkedId,
          style: {
            ...layoutElement.style,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          },
          childElements: layoutElement.childElements?.map(child => ({
            ...child,
            id: `${child.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
            parentId: `${layoutElement.id}-${size.name.replace(/\s+/g, '-').toLowerCase()}`,
            sizeId: size.name
          }))
        };
        
        updatedElements.push(linkedLayout);
      });
    }

    setElements(updatedElements);
    setSelectedElement(layoutElement);
  };

  const removeElement = (elementId: string) => {
    const elementToRemove = elements.find(el => el.id === elementId);
    if (!elementToRemove) return;
    
    let newElements = [...elements];
    
    // If the element is linked, ask if user wants to remove all linked instances
    if (elementToRemove.linkedElementId && editingMode === 'global') {
      const linkedIds = elements
        .filter(el => el.linkedElementId === elementToRemove.linkedElementId)
        .map(el => el.id);
      
      // Remove all linked elements
      newElements = newElements.map(el => {
        if (el.childElements) {
          el.childElements = el.childElements.filter(child => !linkedIds.includes(child.id));
        }
        return el;
      }).filter(el => !linkedIds.includes(el.id));
    } else {
      // Just remove this element
      newElements = newElements.map(el => {
        if (el.childElements) {
          el.childElements = el.childElements.filter(child => child.id !== elementId);
        }
        return el;
      }).filter(el => el.id !== elementId);
    }
    
    setElements(newElements);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    let updatedElements = [...elements];
    
    // If editing linked element in global mode, update all linked elements
    if (editingMode === 'global' && selectedElement.linkedElementId) {
      const linkedElementIds = elements
        .filter(el => el.linkedElementId === selectedElement.linkedElementId)
        .map(el => el.id);
      
      // Update each linked element
      updatedElements = updatedElements.map(el => {
        // Update standalone elements
        if (linkedElementIds.includes(el.id) && !el.isIndividuallyPositioned) {
          return { ...el, style: { ...el.style, [property]: value } };
        }
        
        // Update elements in containers
        if (el.childElements) {
          return {
            ...el,
            childElements: el.childElements.map(child =>
              linkedElementIds.includes(child.id) && !child.isIndividuallyPositioned
                ? { ...child, style: { ...child.style, [property]: value } }
                : child
            )
          };
        }
        
        return el;
      });
    } else {
      // Update just the selected element
      if (!selectedElement.inContainer) {
        updatedElements = updatedElements.map(el =>
          el.id === selectedElement.id
            ? { ...el, style: { ...el.style, [property]: value } }
            : el
        );
      } else {
        updatedElements = updatedElements.map(el => {
          if (el.childElements && el.id === selectedElement.parentId) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === selectedElement.id
                  ? { ...child, style: { ...child.style, [property]: value } }
                  : child
              )
            };
          }
          return el;
        });
      }
    }
    
    setElements(updatedElements);
    setSelectedElement({ ...selectedElement, style: { ...selectedElement.style, [property]: value } });
  };

  const updateElementContent = (content: string) => {
    if (!selectedElement) return;

    let updatedElements = [...elements];
    
    // If editing linked element in global mode, update all linked elements
    if (editingMode === 'global' && selectedElement.linkedElementId) {
      const linkedElementIds = elements
        .filter(el => el.linkedElementId === selectedElement.linkedElementId)
        .map(el => el.id);
      
      // Update each linked element
      updatedElements = updatedElements.map(el => {
        // Update standalone elements
        if (linkedElementIds.includes(el.id)) {
          return { ...el, content };
        }
        
        // Update elements in containers
        if (el.childElements) {
          return {
            ...el,
            childElements: el.childElements.map(child =>
              linkedElementIds.includes(child.id)
                ? { ...child, content }
                : child
            )
          };
        }
        
        return el;
      });
    } else {
      // Update just the selected element
      if (!selectedElement.inContainer) {
        updatedElements = updatedElements.map(el =>
          el.id === selectedElement.id
            ? { ...el, content }
            : el
        );
      } else {
        updatedElements = updatedElements.map(el => {
          if (el.childElements && el.id === selectedElement.parentId) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === selectedElement.id
                  ? { ...child, content }
                  : child
              )
            };
          }
          return el;
        });
      }
    }
    
    setElements(updatedElements);
    setSelectedElement({ ...selectedElement, content });
  };

  const handlePreviewAnimation = () => {
    setKey(prev => prev + 1);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setElements(elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: isPlaying ? "paused" : "running"
      }
    })));
  };

  const updateAnimations = (time: number) => {
    setElements(elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: "paused",
        animationDelay: -time
      }
    })));
  };

  const organizeElements = () => {
    const organizedElements = organizeElementsInContainers(elements, selectedSize.width);
    setElements(organizedElements);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to load image"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      reader.readAsDataURL(file);
    });
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
      removeElement,
      updateElementStyle,
      updateElementContent,
      handleAddElement,
      handleAddLayout,
      handlePreviewAnimation,
      togglePlayPause,
      updateAnimations,
      organizeElements,
      handleImageUpload,
      updateAllLinkedElements,
      linkElementsAcrossSizes,
      unlinkElement
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
