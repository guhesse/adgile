
import { createContext, useContext, useState } from "react";
import { EditorElement, BannerSize, BANNER_SIZES } from "./types";
import { organizeElementsInContainers, snapToGrid } from "./utils/gridUtils";

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
  removeElement: (elementId: string) => void;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  handleAddElement: (type: EditorElement["type"]) => void;
  handleAddLayout: (template: any) => void;
  handlePreviewAnimation: () => void;
  togglePlayPause: () => void;
  updateAnimations: (time: number) => void;
  organizeElements: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [key, setKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleAddElement = (type: EditorElement["type"]) => {
    const newElement: EditorElement = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "Text Element" : type === "button" ? "Button Element" : "",
      inContainer: false,
      style: {
        x: snapToGrid(100),
        y: snapToGrid(100),
        width: snapToGrid(type === "text" ? 200 : type === "image" ? 150 : 200),
        height: snapToGrid(type === "text" ? 40 : type === "image" ? 150 : 50),
        fontSize: 16,
        color: "#000000",
        fontFamily: "Inter",
        lineHeight: 1.5,
        textAlign: "left",
        backgroundColor: type === "button" ? "#1a1f2c" : undefined,
        padding: type === "button" ? "8px 16px" : undefined,
      },
    };
    
    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    setSelectedElement(newElement);
  };

  const handleAddLayout = (template: any) => {
    // Calculate vertical position after last element
    const lastY = elements.length > 0 
      ? Math.max(...elements.map(el => el.style.y + el.style.height)) + 20
      : 20;

    const layoutWidth = selectedSize.width - 40; // 20px padding on each side
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
      childElements: []
    };

    if (template.type === "preset") {
      // Add children based on the template type
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
            }
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
            }
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
            }
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
            }
          }
        ];
      }
    }

    setElements([...elements, layoutElement]);
    setSelectedElement(layoutElement);
  };

  const removeElement = (elementId: string) => {
    // Remove the element and update parent references if needed
    const newElements = elements.map(el => {
      if (el.childElements) {
        el.childElements = el.childElements.filter(child => child.id !== elementId);
      }
      return el;
    }).filter(el => el.id !== elementId);
    
    setElements(newElements);
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    // Update the element in the main elements array if it's not in a container
    if (!selectedElement.inContainer) {
      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      ));
    } else {
      // Update the element in its parent's childElements array
      setElements(elements.map(el => {
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
      }));
    }
    
    setSelectedElement({ ...selectedElement, style: { ...selectedElement.style, [property]: value } });
  };

  const updateElementContent = (content: string) => {
    if (!selectedElement) return;

    // Update content in main elements or in parent's childElements
    if (!selectedElement.inContainer) {
      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, content }
          : el
      ));
    } else {
      setElements(elements.map(el => {
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
      }));
    }
    
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
      removeElement,
      updateElementStyle,
      updateElementContent,
      handleAddElement,
      handleAddLayout,
      handlePreviewAnimation,
      togglePlayPause,
      updateAnimations,
      organizeElements,
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
