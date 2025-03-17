
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

  const handleMouseDown = (e: React.MouseEvent, element: EditorElement) => {
    // Prevent the normal browser image dragging behavior
    e.preventDefault();
    
    if (canvasNavMode === 'pan') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      });
      return;
    }

    e.stopPropagation();

    setSelectedElement(element);
    setIsDragging(true);
    isDraggingRef.current = true;

    // Store the element's initial position and size
    setElementInitialPos({
      x: element.style.x,
      y: element.style.y,
      width: element.style.width,
      height: element.style.height
    });

    // Calculate the offset between mouse position and element's top-left corner
    const rect = e.currentTarget.getBoundingClientRect();
    const zoomLevel = parseFloat((e.currentTarget.closest('[data-canvas-wrapper]') as HTMLElement)?.dataset.zoomLevel || '1');
    
    // Calculate the offset from the mouse to the top-left corner of the element
    const offsetX = (e.clientX - rect.left) / zoomLevel;
    const offsetY = (e.clientY - rect.top) / zoomLevel;
    
    setDragOffset({
      x: offsetX,
      y: offsetY
    });
    
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
    
    setIsResizing(true);
    setResizeDirection(direction);
    setSelectedElement(element);
    
    // Store the element's initial position and size
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

    if (!selectedElement) return;

    if (isDragging) {
      const canvas = e.currentTarget as HTMLElement;
      const canvasRect = canvas.getBoundingClientRect();
      const zoomLevel = parseFloat(canvas.style.transform?.match(/scale\((.+)\)/)?.[1] || '1');
      
      // Get the mouse position in canvas coordinates
      const mouseX = (e.clientX - canvasRect.left) / zoomLevel;
      const mouseY = (e.clientY - canvasRect.top) / zoomLevel;
      
      // Calculate new position based on mouse position and the initial offset
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;

      // Apply constraints if inside a container
      const parentElement = selectedElement.inContainer ?
        elements.find(el => el.id === selectedElement.parentId) : null;

      if (parentElement && selectedElement.inContainer) {
        const isOutside = (
          newX < 0 ||
          newY < 0 ||
          newX + selectedElement.style.width > parentElement.style.width ||
          newY + selectedElement.style.height > parentElement.style.height
        );

        handleElementExitContainer(selectedElement, isOutside);

        if (!isElementOutsideContainer) {
          newX = Math.max(0, Math.min(newX, parentElement.style.width - selectedElement.style.width));
          newY = Math.max(0, Math.min(newY, parentElement.style.height - selectedElement.style.height));
        }
      } else {
        // Allow some overflow for elements on the artboard
        const overflowAllowance = 0; // No overflow allowance
        newX = Math.max(-overflowAllowance, Math.min(newX, selectedSize.width - selectedElement.style.width + overflowAllowance));
        newY = Math.max(-overflowAllowance, Math.min(newY, selectedSize.height - selectedElement.style.height + overflowAllowance));
      }

      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      const xPercent = (newX / selectedSize.width) * 100;
      const yPercent = (newY / selectedSize.height) * 100;

      let updatedElements = [...elements];

      if (editingMode === 'global' && selectedElement.linkedElementId) {
        // Use our improved linked elements function
        updatedElements = updateLinkedElementsIntelligently(
          updatedElements,
          {
            ...selectedElement,
            style: {
              ...selectedElement.style,
              x: newX,
              y: newY,
              xPercent,
              yPercent
            }
          },
          activeSizes
        );
      } else {
        updatedElements = updatedElements.map(el => {
          if (el.id === selectedElement.id) {
            return { 
              ...el, 
              style: { 
                ...el.style, 
                x: newX, 
                y: newY,
                xPercent,
                yPercent 
              },
              isIndividuallyPositioned: editingMode === 'individual'
            };
          }

          if (el.childElements && selectedElement.parentId === el.id) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === selectedElement.id
                  ? { 
                      ...child, 
                      style: { 
                        ...child.style, 
                        x: newX, 
                        y: newY,
                        xPercent,
                        yPercent
                      },
                      isIndividuallyPositioned: editingMode === 'individual'
                    }
                  : child
              )
            };
          }

          return el;
        });
      }

      setElements(updatedElements);

      setSelectedElement({
        ...selectedElement,
        style: { 
          ...selectedElement.style, 
          x: newX, 
          y: newY,
          xPercent,
          yPercent
        },
        isIndividuallyPositioned: editingMode === 'individual'
      });
    } else if (isResizing) {
      const canvas = e.currentTarget as HTMLElement;
      const zoomLevel = parseFloat(canvas.style.transform?.match(/scale\((.+)\)/)?.[1] || '1');

      const deltaX = (e.clientX - dragStart.x) / zoomLevel;
      const deltaY = (e.clientY - dragStart.y) / zoomLevel;

      let newWidth = elementInitialPos.width;
      let newHeight = elementInitialPos.height;
      let newX = elementInitialPos.x;
      let newY = elementInitialPos.y;

      // Calculate the new dimensions and position based on the resize direction
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

      // Apply constraints if the element is inside a container
      if (selectedElement.inContainer && selectedElement.parentId) {
        const parentElement = elements.find(el => el.id === selectedElement.parentId);
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
        // For artboard elements, strictly enforce boundaries
        if (newX < 0) {
          newX = 0;
          newWidth = elementInitialPos.width;
        }
        if (newY < 0) {
          newY = 0;
          newHeight = elementInitialPos.height;
        }
        if (newX + newWidth > selectedSize.width) {
          newWidth = selectedSize.width - newX;
        }
        if (newY + newHeight > selectedSize.height) {
          newHeight = selectedSize.height - newY;
        }
      }

      const widthPercent = (newWidth / selectedSize.width) * 100;
      const heightPercent = (newHeight / selectedSize.height) * 100;
      const xPercent = (newX / selectedSize.width) * 100;
      const yPercent = (newY / selectedSize.height) * 100;

      let updatedElements;
      
      if (editingMode === 'global' && selectedElement.linkedElementId) {
        // Use our improved linked elements function
        updatedElements = updateLinkedElementsIntelligently(
          elements,
          {
            ...selectedElement,
            style: {
              ...selectedElement.style,
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
        updatedElements = elements.map(el => {
          if (el.id === selectedElement.id) {
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
              isIndividuallyPositioned: editingMode === 'individual'
            };
          }

          if (el.childElements && selectedElement.parentId === el.id) {
            return {
              ...el,
              childElements: el.childElements.map(child =>
                child.id === selectedElement.id
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
                    isIndividuallyPositioned: editingMode === 'individual'
                  }
                  : child
              )
            };
          }

          return el;
        });
      }

      setElements(updatedElements);

      setSelectedElement({
        ...selectedElement,
        style: { 
          ...selectedElement.style, 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight,
          xPercent,
          yPercent,
          widthPercent,
          heightPercent
        },
        isIndividuallyPositioned: editingMode === 'individual'
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging || isResizing) {
      // Apply container changes if needed
      if (hoveredContainer && selectedElement && selectedElement.type !== 'container' && selectedElement.type !== 'layout') {
        moveElementToContainer(selectedElement, hoveredContainer, elements, setElements, setSelectedElement);
      } else {
        // Ensure elements stay within bounds
        let updatedElements = [...elements];
        let needsUpdate = false;
        
        updatedElements = updatedElements.map(element => {
          // For elements in container, don't apply constraints directly
          if (element.inContainer) return element;
          
          // Check if the element is too far outside the bounds
          if (isElementOutOfBounds(element, selectedSize.width, selectedSize.height)) {
            needsUpdate = true;
            return constrainElementToArtboard(element, selectedSize.width, selectedSize.height);
          }
          
          return element;
        });
        
        if (needsUpdate) {
          setElements(updatedElements);
          
          // Update the selected element if it was modified
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

    // Clear any timers
    if (containerExitTimer) {
      clearTimeout(containerExitTimer);
      setContainerExitTimer(null);
      setIsElementOutsideContainer(false);
    }

    // Reset the state variables
    setIsDragging(false);
    isDraggingRef.current = false;
    setIsResizing(false);
    handleContainerHoverEnd();
  };

  // Add a global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, hoveredContainer, selectedElement]);

  return {
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    resizeDirection,
    setResizeDirection,
    dragStart,
    setDragStart,
    containerHoverTimer,
    containerExitTimer,
    hoveredContainer,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    panPosition,
    setPanPosition,
    isElementOutsideContainer,
    handleMouseDown,
    handleCanvasMouseDown,
    handleResizeStart,
    handleContainerHover,
    handleContainerHoverEnd,
    handleElementExitContainer,
    handleMouseMove,
    handleMouseUp
  };
};
