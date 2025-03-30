
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

    // Usar BANNER_SIZES para obter nome do artboard a partir do tamanho
    const getArtboardName = (size: string) => {
        if (!size) return 'Sem tamanho';

        // Extrair largura e altura do formato "widthxheight"
        const dimensions = size.split('x');
        if (dimensions.length !== 2) return size;

        const width = parseInt(dimensions[0]);
        const height = parseInt(dimensions[1]);

        // Encontrar o tamanho correspondente em BANNER_SIZES
        const bannerSize = BANNER_SIZES.find(
            bs => bs.width === width && bs.height === height
        );

        return bannerSize ? bannerSize.name : size;
    };

    // Move element up in the layers panel (decrease z-index visualmente, mas aumenta na renderização)
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

    // Move element down in the layers panel (increase z-index visualmente, mas diminui na renderização)
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

    // Extrair artboards dos elementos
    const getArtboards = () => {
        const artboards = Array.from(new Set(elements
            .filter(el => el.artboardSize)
            .map(el => el.artboardSize || '300x250')));

        if (artboards.length === 0) {
            // Se não houver artboards definidos, assumir um padrão
            artboards.push('300x250');
        }

        return artboards;
    };

    // Agrupar elementos por artboard
    const groupElementsByArtboard = () => {
        const artboards = getArtboards();
        const elementsByArtboard: Record<string, EditorElement[]> = {};

        artboards.forEach(size => {
            elementsByArtboard[size] = elements.filter(el =>
                (el.artboardSize === size || (!el.artboardSize && size === artboards[0]))
            );

            // Inverter a ordem para que o z-index corresponda à visualização
            // Os elementos mais acima na lista são renderizados por último (aparecem no topo)
            elementsByArtboard[size] = [...elementsByArtboard[size]].reverse();
        });

        return elementsByArtboard;
    };

    // Find all container/layout elements por artboard
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
