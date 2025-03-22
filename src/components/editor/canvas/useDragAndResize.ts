
import { useState, useEffect, useRef } from 'react';
import { snapToGrid } from '../utils/gridUtils';
import { BannerSize, CanvasNavigationMode, EditingMode, EditorElement } from '../types';
import { moveElementOutOfContainer, moveElementToContainer, constrainElementToArtboard, isElementOutOfBounds } from '../utils/containerUtils';
import { updateLinkedElementsIntelligently } from '../utils/grid/responsivePosition';

interface UseDragAndResizeProps {
  elements: EditorElement[];
  setElements: (elements: EditorElement[]) => void;
  selectedElement: EditorElement | null;
  setSelectedElement: (element: EditorElement | null) => void;
  selectedSize: BannerSize;
  editingMode: EditingMode;
  updateAllLinkedElements: (
    elements: EditorElement[],
    selectedElement: EditorElement,
    percentages: any,
    absoluteValues: any
  ) => EditorElement[];
  organizeElements: () => void;
  canvasNavMode: CanvasNavigationMode;
  activeSizes: BannerSize[];
}

export const useDragAndResize = ({
  elements,
  setElements,
  selectedElement,
  setSelectedElement,
  selectedSize,
  editingMode,
  updateAllLinkedElements,
  organizeElements,
  canvasNavMode,
  activeSizes
}: UseDragAndResizeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [elementInitialPos, setElementInitialPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [containerHoverTimer, setContainerHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [containerExitTimer, setContainerExitTimer] = useState<NodeJS.Timeout | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isElementOutsideContainer, setIsElementOutsideContainer] = useState(false);
  const isDraggingRef = useRef(false);
  const selectedElementRef = useRef<EditorElement | null>(null);
  const currentZoomLevelRef = useRef<number>(1);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  const handleMouseDown = (e: React.MouseEvent, element: EditorElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (canvasNavMode === 'pan') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
      return;
    }

    // Get the zoom level either from event (if available) or use default
    const zoomLevel = (e as any).zoomLevel || 1;
    currentZoomLevelRef.current = zoomLevel;
    
    setElementInitialPos({
      x: element.style.x,
      y: element.style.y,
      width: element.style.width,
      height: element.style.height
    });

    if (!selectedElement || selectedElement.id !== element.id) {
      setSelectedElement(element);
    }
    
    setIsDragging(true);
    isDraggingRef.current = true;

    // Use the element offset if available (stored by CanvasElement component)
    // This ensures accurate positioning, especially with zooming
    if ((e as any).elementOffset) {
      setDragOffset((e as any).elementOffset);
    } else {
      // Fallback to calculating offset from rect
      const rect = e.currentTarget.getBoundingClientRect();
      
      // Account for zoom level when calculating offsets
      const offsetX = (e.clientX - rect.left) / zoomLevel;
      const offsetY = (e.clientY - rect.top) / zoomLevel;
      
      setDragOffset({
        x: offsetX,
        y: offsetY
      });
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (canvasNavMode === 'pan') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string, element: EditorElement) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Get the zoom level either from event (if available) or from the element's dataset
    const zoomLevel = (e as any).zoomLevel || 
                      parseFloat((e.currentTarget.closest('[data-canvas-wrapper]') as HTMLElement)?.dataset.zoomLevel || '1');
    currentZoomLevelRef.current = zoomLevel;
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    if (!selectedElement || selectedElement.id !== element.id) {
      setSelectedElement(element);
    }
    
    setElementInitialPos({
      x: element.style.x,
      y: element.style.y,
      width: element.style.width,
      height: element.style.height
    });
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleContainerHover = (e: React.MouseEvent, containerId: string) => {
    if (!isDragging || !selectedElement || selectedElement.id === containerId) {
      return;
    }

    if (containerHoverTimer) {
      clearTimeout(containerHoverTimer);
    }

    const timer = setTimeout(() => {
      setHoveredContainer(containerId);
    }, 300);

    setContainerHoverTimer(timer as unknown as NodeJS.Timeout);
  };

  const handleContainerHoverEnd = () => {
    if (containerHoverTimer) {
      clearTimeout(containerHoverTimer);
      setContainerHoverTimer(null);
    }
    setHoveredContainer(null);
  };

  const handleElementExitContainer = (element: EditorElement, isOutside: boolean) => {
    if (!element.inContainer) return;

    if (containerExitTimer && !isOutside) {
      clearTimeout(containerExitTimer);
      setContainerExitTimer(null);
      setIsElementOutsideContainer(false);
      return;
    }

    if (isOutside && !containerExitTimer) {
      setIsElementOutsideContainer(true);
      const timer = setTimeout(() => {
        moveElementOutOfContainer(element, elements, setElements, setSelectedElement);
        setContainerExitTimer(null);
        setIsElementOutsideContainer(false);
      }, 500);

      setContainerExitTimer(timer as unknown as NodeJS.Timeout);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (!isDragging && !isResizing) return;
    
    const element = selectedElementRef.current;
    if (!element) return;

    // Find the target canvas (artboard) element is on
    const canvas = e.currentTarget as HTMLElement;
    
    // Get the canvas size from the data attribute
    const canvasSizeStr = canvas.dataset.canvasSize || `${selectedSize.width}x${selectedSize.height}`;
    const [canvasWidth, canvasHeight] = canvasSizeStr.split('x').map(Number);
    
    // Get the zoom level from the data attribute
    const zoomLevel = currentZoomLevelRef.current || 
                     parseFloat(canvas.dataset.zoomLevel || '1');

    if (isDragging) {
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate mouse position within the canvas, accounting for zoom
      const mouseX = (e.clientX - canvasRect.left) / zoomLevel;
      const mouseY = (e.clientY - canvasRect.top) / zoomLevel;
      
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;
      
      // Maintain the original width and height during dragging
      let newWidth = element.style.width;
      let newHeight = element.style.height;

      const parentElement = element.inContainer ?
        elements.find(el => el.id === element.parentId) : null;

      if (parentElement && element.inContainer) {
        const isOutside = (
          newX < 0 ||
          newY < 0 ||
          newX + element.style.width > parentElement.style.width ||
          newY + element.style.height > parentElement.style.height
        );

        handleElementExitContainer(element, isOutside);

        if (!isElementOutsideContainer) {
          newX = Math.max(0, Math.min(newX, parentElement.style.width - element.style.width));
          newY = Math.max(0, Math.min(newY, parentElement.style.height - element.style.height));
        }
      } else {
        // Allow slight overflow for easier placement
        const overflowAllowance = 0;
        newX = Math.max(-overflowAllowance, Math.min(newX, canvasWidth - element.style.width + overflowAllowance));
        newY = Math.max(-overflowAllowance, Math.min(newY, canvasHeight - element.style.height + overflowAllowance));
      }

      // Snap to grid
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      // Calculate percentages relative to the canvas size
      const xPercent = (newX / canvasWidth) * 100;
      const yPercent = (newY / canvasHeight) * 100;
      const widthPercent = (newWidth / canvasWidth) * 100;
      const heightPercent = (newHeight / canvasHeight) * 100;

      // For images, maintain aspect ratio if needed during resize operations
      if ((element.type === "image" || element.type === "logo")) {
        if (resizeDirection === 'nw' || resizeDirection === 'ne' || 
            resizeDirection === 'sw' || resizeDirection === 'se') {
          const aspectRatio = elementInitialPos.width / elementInitialPos.height;
          
          if (!element.style.originalWidth) {
            element.style.originalWidth = elementInitialPos.width;
            element.style.originalHeight = elementInitialPos.height;
          }
          
          if (resizeDirection === 'se' || resizeDirection === 'ne') {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
      }

      let updatedElements = [...elements];
      
      // Determine if we're updating all linked elements or just this one
      const isIndividualUpdate = editingMode === 'individual' || !element.linkedElementId;

      if (!isIndividualUpdate) {
        // Update all linked elements using the intelligent update function
        updatedElements = updateLinkedElementsIntelligently(
          updatedElements,
          {
            ...element,
            style: {
              ...element.style,
              x: newX,
              y: newY,
              xPercent,
              yPercent,
              width: newWidth,
              height: newHeight,
              widthPercent,
              heightPercent
            }
          },
          activeSizes
        );
      } else {
        // Update only the current element
        updatedElements = updatedElements.map(el => {
          if (el.id === element.id) {
            return { 
              ...el, 
              style: { 
                ...el.style, 
                x: newX, 
                y: newY,
                xPercent,
                yPercent,
                width: newWidth,
                height: newHeight,
                widthPercent,
                heightPercent
              },
              isIndividuallyPositioned: true
            };
          }

          // Handle child elements in containers
          if (el.childElements && element.parentId === el.id) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === element.id
                  ? { 
                      ...child, 
                      style: { 
                        ...child.style, 
                        x: newX, 
                        y: newY,
                        xPercent,
                        yPercent,
                        width: newWidth,
                        height: newHeight,
                        widthPercent,
                        heightPercent
                      },
                      isIndividuallyPositioned: true
                    }
                  : child
              )
            };
          }

          return el;
        });
      }

      setElements(updatedElements);

      // Update the selected element reference
      const updatedElement = {
        ...element,
        style: { 
          ...element.style, 
          x: newX, 
          y: newY,
          xPercent,
          yPercent,
          width: newWidth,
          height: newHeight,
          widthPercent,
          heightPercent
        },
        isIndividuallyPositioned: isIndividualUpdate
      };
      
      selectedElementRef.current = updatedElement;
      setSelectedElement(updatedElement);
      
    } else if (isResizing) {
      // Calculate the delta accounting for zoom level
      const deltaX = (e.clientX - dragStart.x) / zoomLevel;
      const deltaY = (e.clientY - dragStart.y) / zoomLevel;

      // Start with the initial dimensions (before resizing started)
      let newWidth = elementInitialPos.width;
      let newHeight = elementInitialPos.height;
      let newX = elementInitialPos.x;
      let newY = elementInitialPos.y;

      // Adjust dimensions and position based on resize direction
      if (resizeDirection.includes('e')) {
        newWidth = snapToGrid(Math.max(50, elementInitialPos.width + deltaX));
      }
      if (resizeDirection.includes('w')) {
        const possibleWidth = snapToGrid(Math.max(50, elementInitialPos.width - deltaX));
        newX = snapToGrid(elementInitialPos.x + (elementInitialPos.width - possibleWidth));
        newWidth = possibleWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = snapToGrid(Math.max(20, elementInitialPos.height + deltaY));
      }
      if (resizeDirection.includes('n')) {
        const possibleHeight = snapToGrid(Math.max(20, elementInitialPos.height - deltaY));
        newY = snapToGrid(elementInitialPos.y + (elementInitialPos.height - possibleHeight));
        newHeight = possibleHeight;
      }

      // Handle container constraints
      if (element.inContainer && element.parentId) {
        const parentElement = elements.find(el => el.id === element.parentId);
        if (parentElement) {
          if (newX < 0) {
            newX = 0;
            newWidth = elementInitialPos.width;
          }
          if (newY < 0) {
            newY = 0;
            newHeight = elementInitialPos.height;
          }
          if (newX + newWidth > parentElement.style.width) {
            newWidth = parentElement.style.width - newX;
          }
          if (newY + newHeight > parentElement.style.height) {
            newHeight = parentElement.style.height - newY;
          }
        }
      } else {
        // Canvas boundary constraints
        if (newX < 0) {
          newX = 0;
          newWidth = elementInitialPos.width;
        }
        if (newY < 0) {
          newY = 0;
          newHeight = elementInitialPos.height;
        }
        if (newX + newWidth > canvasWidth) {
          newWidth = canvasWidth - newX;
        }
        if (newY + newHeight > canvasHeight) {
          newHeight = canvasHeight - newY;
        }
      }

      // Calculate percentage values
      const widthPercent = (newWidth / canvasWidth) * 100;
      const heightPercent = (newHeight / canvasHeight) * 100;
      const xPercent = (newX / canvasWidth) * 100;
      const yPercent = (newY / canvasHeight) * 100;

      // For images and logos, maintain aspect ratio during corner resizing
      if ((element.type === "image" || element.type === "logo") && 
          (resizeDirection === 'nw' || resizeDirection === 'ne' || 
           resizeDirection === 'sw' || resizeDirection === 'se')) {
        
        // Get original aspect ratio
        const aspectRatio = element.style.originalWidth && element.style.originalHeight
          ? element.style.originalWidth / element.style.originalHeight
          : elementInitialPos.width / elementInitialPos.height;
        
        // Adjust height or width based on the aspect ratio
        if (resizeDirection === 'se' || resizeDirection === 'ne') {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      let updatedElements;
      
      // Determine if we're updating all linked elements or just this one
      const isIndividualUpdate = editingMode === 'individual' || !element.linkedElementId;

      if (!isIndividualUpdate) {
        // Update all linked elements using the intelligent update function
        updatedElements = updateLinkedElementsIntelligently(
          elements,
          {
            ...element,
            style: {
              ...element.style,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
              xPercent,
              yPercent,
              widthPercent,
              heightPercent
            }
          },
          activeSizes
        );
      } else {
        // Update only this specific element
        updatedElements = elements.map(el => {
          if (el.id === element.id) {
            return { 
              ...el, 
              style: { 
                ...el.style, 
                x: newX, 
                y: newY, 
                width: newWidth, 
                height: newHeight,
                xPercent,
                yPercent,
                widthPercent,
                heightPercent
              },
              isIndividuallyPositioned: true
            };
          }

          // Handle child elements in containers
          if (el.childElements && element.parentId === el.id) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === element.id
                  ? {
                    ...child,
                    style: {
                      ...child.style,
                      x: newX,
                      y: newY,
                      width: newWidth,
                      height: newHeight,
                      xPercent,
                      yPercent,
                      widthPercent,
                      heightPercent
                    },
                    isIndividuallyPositioned: true
                  }
                  : child
              )
            };
          }

          return el;
        });
      }

      setElements(updatedElements);

      // Update the selected element reference
      const updatedElement = {
        ...element,
        style: { 
          ...element.style, 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
        },
        isIndividuallyPositioned: isIndividualUpdate
      };
      
      selectedElementRef.current = updatedElement;
      setSelectedElement(updatedElement);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging || isResizing) {
      if (hoveredContainer && selectedElement && selectedElement.type !== 'container' && selectedElement.type !== 'layout') {
        moveElementToContainer(selectedElement, hoveredContainer, elements, setElements, setSelectedElement);
      } else {
        let updatedElements = [...elements];
        let needsUpdate = false;
        
        updatedElements = updatedElements.map(element => {
          if (element.inContainer) return element;
          
          if (isElementOutOfBounds(element, selectedSize.width, selectedSize.height)) {
            needsUpdate = true;
            return constrainElementToArtboard(element, selectedSize.width, selectedSize.height);
          }
          
          return element;
        });
        
        if (needsUpdate) {
          setElements(updatedElements);
          
          if (selectedElement && !selectedElement.inContainer) {
            const updatedSelectedElement = updatedElements.find(el => el.id === selectedElement.id);
            if (updatedSelectedElement) {
              setSelectedElement(updatedSelectedElement);
            }
          }
        }
        
        organizeElements();
      }
    }

    if (containerExitTimer) {
      clearTimeout(containerExitTimer);
      setContainerExitTimer(null);
      setIsElementOutsideContainer(false);
    }

    setIsDragging(false);
    isDraggingRef.current = false;
    setIsResizing(false);
    setResizeDirection("");
    handleContainerHoverEnd();
  };

  return {
    isDragging,
    isResizing,
    hoveredContainer,
    isElementOutsideContainer,
    handleMouseDown,
    handleCanvasMouseDown,
    handleResizeStart,
    handleContainerHover,
    handleContainerHoverEnd,
    handleMouseMove,
    handleMouseUp
  };
};
