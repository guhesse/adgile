import { useState } from 'react';
import { EditorElement } from '../../types';

export const useDragAndDrop = (
    elements: EditorElement[],
    setElements: (elements: EditorElement[]) => void,
    selectedElement: EditorElement | null,
    setSelectedElement: (element: EditorElement) => void,
    collapsedContainers: Record<string, boolean>,
    setCollapsedContainers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) => {
    const [draggedElement, setDraggedElement] = useState<EditorElement | null>(null);
    const [dragTargetId, setDragTargetId] = useState<string | null>(null);

    // Handle drag start
    const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
        e.stopPropagation();
        setDraggedElement(element);
        e.dataTransfer.setData('text/plain', element.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();

        setDragTargetId(targetId);

        if (collapsedContainers[targetId]) {
            setCollapsedContainers(prev => ({
                ...prev,
                [targetId]: false
            }));
        }
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent, targetContainerId: string) => {
        e.preventDefault();
        e.stopPropagation();

        setDragTargetId(null);

        if (!draggedElement) return;

        moveElementToContainer(draggedElement, targetContainerId);

        setDraggedElement(null);
    };

    // Move element to a different container
    const moveElementToContainer = (element: EditorElement, targetContainerId: string) => {
        const updatedElements = [...elements];

        // Se o elemento estiver em um container, remova-o dali
        if (element.inContainer && element.parentId) {
            const sourceContainerIndex = updatedElements.findIndex(el => el.id === element.parentId);
            if (sourceContainerIndex !== -1 && updatedElements[sourceContainerIndex].childElements) {
                updatedElements[sourceContainerIndex] = {
                    ...updatedElements[sourceContainerIndex],
                    childElements: updatedElements[sourceContainerIndex].childElements?.filter(child => child.id !== element.id) || []
                };
            }
        } else {
            // Remover elemento autônomo
            const elementIndex = updatedElements.findIndex(el => el.id === element.id);
            if (elementIndex !== -1) {
                updatedElements.splice(elementIndex, 1);
            }
        }

        // Handle drop to standalone area
        if (targetContainerId === 'standalone') {
            const updatedElement = {
                ...element,
                inContainer: false,
                parentId: undefined,
                style: {
                    ...element.style,
                    x: 100,
                    y: 100
                }
            };

            updatedElements.push(updatedElement);
            setElements(updatedElements);

            if (selectedElement?.id === element.id) {
                setSelectedElement(updatedElement);
            }
            return;
        }

        // Adicionar elemento ao container de destino
        const targetContainerIndex = updatedElements.findIndex(el => el.id === targetContainerId);
        if (targetContainerIndex === -1) return;

        const targetChildren = updatedElements[targetContainerIndex].childElements || [];

        const updatedElement = {
            ...element,
            inContainer: true,
            parentId: targetContainerId,
            style: {
                ...element.style,
                x: 0,
                y: 0
            }
        };

        updatedElements[targetContainerIndex] = {
            ...updatedElements[targetContainerIndex],
            childElements: [...targetChildren, updatedElement]
        };

        setElements(updatedElements);

        if (selectedElement?.id === element.id) {
            setSelectedElement(updatedElement);
        }
    };

    return {
        draggedElement,
        setDraggedElement,
        dragTargetId,
        setDragTargetId,
        handleDragStart,
        handleDragOver,
        handleDrop,
        moveElementToContainer
    };
};
