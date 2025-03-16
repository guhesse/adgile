import { useState, useEffect, useRef } from 'react';
import { snapToGrid } from '../utils/gridUtils';
import { BannerSize, CanvasNavigationMode, EditingMode, EditorElement } from '../types';
import { moveElementOutOfContainer, constrainElementToCanvas } from '../utils/containerUtils';

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
  canvasNavMode
}: UseDragAndResizeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerHoverTimer, setContainerHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [containerExitTimer, setContainerExitTimer] = useState<NodeJS.Timeout | null>(null);
  const [hoveredContainer, setHoveredContainer] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isElementOutsideContainer, setIsElementOutsideContainer] = useState(false);

  const handleMouseDown = (e: React.MouseEvent, element: EditorElement) => {
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

    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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
    setIsResizing(true);
    setResizeDirection(direction);
    setSelectedElement(element);
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
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const canvas = e.currentTarget as HTMLElement;
      const canvasRect = canvas.getBoundingClientRect();
      const parentElement = selectedElement.inContainer ?
        elements.find(el => el.id === selectedElement.parentId) : null;

      const zoomLevel = parseFloat(canvas.style.transform?.match(/scale\((.+)\)/)?.[1] || '1');
      
      const canvasX = (mouseX - canvasRect.left) / zoomLevel;
      const canvasY = (mouseY - canvasRect.top) / zoomLevel;

      let newX = canvasX - dragStart.x / zoomLevel;
      let newY = canvasY - dragStart.y / zoomLevel;

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
        newX = Math.max(0, Math.min(newX, selectedSize.width - selectedElement.style.width));
        newY = Math.max(0, Math.min(newY, selectedSize.height - selectedElement.style.height));
      }

      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      const xPercent = (newX / selectedSize.width) * 100;
      const yPercent = (newY / selectedSize.height) * 100;

      let updatedElements = [...elements];

      if (editingMode === 'global' && selectedElement.linkedElementId) {
        updatedElements = updateAllLinkedElements(
          updatedElements,
          selectedElement,
          { xPercent, yPercent },
          { x: newX, y: newY }
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
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = selectedElement.style.width;
      let newHeight = selectedElement.style.height;
      let newX = selectedElement.style.x;
      let newY = selectedElement.style.y;

      const canvas = e.currentTarget as HTMLElement;
      const zoomLevel = parseFloat(canvas.style.transform?.match(/scale\((.+)\)/)?.[1] || '1');

      const scaledDeltaX = deltaX / zoomLevel;
      const scaledDeltaY = deltaY / zoomLevel;

      if (resizeDirection.includes('e')) {
        newWidth = snapToGrid(Math.max(50, selectedElement.style.width + scaledDeltaX));
      }
      if (resizeDirection.includes('w')) {
        const possibleWidth = snapToGrid(Math.max(50, selectedElement.style.width - scaledDeltaX));
        newX = snapToGrid(selectedElement.style.x + (selectedElement.style.width - possibleWidth));
        newWidth = possibleWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = snapToGrid(Math.max(20, selectedElement.style.height + scaledDeltaY));
      }
      if (resizeDirection.includes('n')) {
        const possibleHeight = snapToGrid(Math.max(20, selectedElement.style.height - scaledDeltaY));
        newY = snapToGrid(selectedElement.style.y + (selectedElement.style.height - possibleHeight));
        newHeight = possibleHeight;
      }

      if (selectedElement.inContainer && selectedElement.parentId) {
        const parentElement = elements.find(el => el.id === selectedElement.parentId);
        if (parentElement) {
          if (newX < 0) {
            newX = 0;
            newWidth = selectedElement.style.width;
          }
          if (newY < 0) {
            newY = 0;
            newHeight = selectedElement.style.height;
          }
          if (newX + newWidth > parentElement.style.width) {
            newWidth = parentElement.style.width - newX;
          }
          if (newY + newHeight > parentElement.style.height) {
            newHeight = parentElement.style.height - newY;
          }
        }
      }

      const widthPercent = (newWidth / selectedSize.width) * 100;
      const heightPercent = (newHeight / selectedSize.height) * 100;
      const xPercent = (newX / selectedSize.width) * 100;
      const yPercent = (newY / selectedSize.height) * 100;

      let updatedElements;
      
      if (editingMode === 'global' && selectedElement.linkedElementId) {
        updatedElements = updateAllLinkedElements(
          elements,
          selectedElement,
          { xPercent, yPercent, widthPercent, heightPercent },
          { x: newX, y: newY, width: newWidth, height: newHeight }
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

      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
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
        const updatedElements = elements.map(el => 
          !el.inContainer ? constrainElementToCanvas(el, selectedSize.width, selectedSize.height) : el
        );
        setElements(updatedElements);
        
        if (selectedElement && !selectedElement.inContainer) {
          const constrainedElement = constrainElementToCanvas(
            selectedElement, 
            selectedSize.width, 
            selectedSize.height
          );
          
          if (constrainedElement !== selectedElement) {
            setSelectedElement(constrainedElement);
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
    setIsResizing(false);
    handleContainerHoverEnd();
  };

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
