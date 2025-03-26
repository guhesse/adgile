
import { useState } from 'react';
import { EditorElement, BANNER_SIZES } from '../../types';

export const useLayerManagement = (
    elements: EditorElement[],
    setElements: (elements: EditorElement[]) => void
) => {
    const [collapsedContainers, setCollapsedContainers] = useState<Record<string, boolean>>({});

    // Toggle container collapse state
    const toggleCollapse = (containerId: string) => {
        setCollapsedContainers(prev => ({
            ...prev,
            [containerId]: !prev[containerId]
        }));
    };

    // Use BANNER_SIZES to get artboard name from its dimensions 
    const getArtboardName = (size: string) => {
        if (!size) return 'Sem tamanho';

        // Try to match with known banner sizes
        const bannerSize = BANNER_SIZES.find(bs => bs.name === size);
        if (bannerSize) return bannerSize.name;
        
        return size;
    };

    // Move element up in the layers panel (decrease z-index visually, but increase in rendering)
    const moveElementUp = (elementId: string, parentId?: string) => {
        const updatedElements = [...elements];

        if (parentId) {
            // Move inside container
            const containerIndex = updatedElements.findIndex(el => el.id === parentId);
            if (containerIndex !== -1 && updatedElements[containerIndex].childElements) {
                const childElements = updatedElements[containerIndex].childElements!;
                const childIndex = childElements.findIndex(c => c.id === elementId);

                if (childIndex < childElements.length - 1) {
                    const newChildElements = [...childElements];
                    [newChildElements[childIndex], newChildElements[childIndex + 1]] =
                        [newChildElements[childIndex + 1], newChildElements[childIndex]];

                    updatedElements[containerIndex] = {
                        ...updatedElements[containerIndex],
                        childElements: newChildElements
                    };

                    setElements(updatedElements);
                }
            }
        } else {
            // Move standalone element
            const elementIndex = updatedElements.findIndex(el => el.id === elementId);

            if (elementIndex < updatedElements.length - 1 && elementIndex !== -1) {
                [updatedElements[elementIndex], updatedElements[elementIndex + 1]] =
                    [updatedElements[elementIndex + 1], updatedElements[elementIndex]];

                setElements(updatedElements);
            }
        }
    };

    // Move element down in the layers panel (increase z-index visually, but decrease in rendering)
    const moveElementDown = (elementId: string, parentId?: string) => {
        const updatedElements = [...elements];

        if (parentId) {
            // Move inside container
            const containerIndex = updatedElements.findIndex(el => el.id === parentId);
            if (containerIndex !== -1 && updatedElements[containerIndex].childElements) {
                const childElements = updatedElements[containerIndex].childElements!;
                const childIndex = childElements.findIndex(c => c.id === elementId);

                if (childIndex > 0) {
                    const newChildElements = [...childElements];
                    [newChildElements[childIndex], newChildElements[childIndex - 1]] =
                        [newChildElements[childIndex - 1], newChildElements[childIndex]];

                    updatedElements[containerIndex] = {
                        ...updatedElements[containerIndex],
                        childElements: newChildElements
                    };

                    setElements(updatedElements);
                }
            }
        } else {
            // Move standalone element
            const elementIndex = updatedElements.findIndex(el => el.id === elementId);

            if (elementIndex > 0) {
                [updatedElements[elementIndex], updatedElements[elementIndex - 1]] =
                    [updatedElements[elementIndex - 1], updatedElements[elementIndex]];

                setElements(updatedElements);
            }
        }
    };

    // Extract artboards from elements
    const getArtboards = () => {
        // Collect all unique size IDs from elements
        const artboardSizes = Array.from(new Set(elements
            .filter(el => el.sizeId)
            .map(el => el.sizeId || 'global')));
            
        // If no specific sizes, default to global
        if (artboardSizes.length === 0) {
            artboardSizes.push('global');
        }

        return artboardSizes;
    };

    // Group elements by artboard
    const groupElementsByArtboard = () => {
        const artboards = getArtboards();
        const elementsByArtboard: Record<string, EditorElement[]> = {};

        artboards.forEach(size => {
            elementsByArtboard[size] = elements.filter(el =>
                (el.sizeId === size || (!el.sizeId && size === artboards[0]))
            );

            // Reverse order so z-index matches the visual hierarchy
            // Elements higher in the list render last (appear on top)
            elementsByArtboard[size] = [...elementsByArtboard[size]].reverse();
        });

        return elementsByArtboard;
    };

    // Find all container/layout elements by artboard
    const getContainersByArtboard = () => {
        const artboards = getArtboards();
        const elementsByArtboard = groupElementsByArtboard();
        const containersByArtboard: Record<string, EditorElement[]> = {};

        artboards.forEach(size => {
            containersByArtboard[size] = elementsByArtboard[size].filter(el =>
                el.type === "layout" || el.type === "container"
            );
        });

        return containersByArtboard;
    };

    // Find elements not inside any container, excluding artboard backgrounds
    const getStandaloneElementsByArtboard = () => {
        const artboards = getArtboards();
        const elementsByArtboard = groupElementsByArtboard();
        const containersByArtboard = getContainersByArtboard();
        const standaloneElementsByArtboard: Record<string, EditorElement[]> = {};

        artboards.forEach(size => {
            const containersInArtboard = containersByArtboard[size];
            standaloneElementsByArtboard[size] = elementsByArtboard[size].filter(el =>
                el.type !== "layout" &&
                el.type !== "container" &&
                el.type !== "artboard-background" &&
                !containersInArtboard.some(container =>
                    container.childElements?.some(child => child.id === el.id)
                )
            );
        });

        return standaloneElementsByArtboard;
    };

    return {
        collapsedContainers,
        setCollapsedContainers,
        toggleCollapse,
        getArtboardName,
        moveElementUp,
        moveElementDown,
        getArtboards,
        getElementsByArtboard: groupElementsByArtboard,
        getContainersByArtboard,
        getStandaloneElementsByArtboard
    };
};
