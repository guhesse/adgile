import { EditorElement } from "../types";

// Tipos para o painel de camadas
export interface LayersPanelProps {
    elements: EditorElement[];
    selectedElement: EditorElement | null;
    setSelectedElement: (element: EditorElement) => void;
    removeElement: (elementId: string) => void;
}

export interface LayerItemProps {
    element: EditorElement;
    isSelected: boolean;
    isChild?: boolean;
    parentId?: string;
    onSelect: (element: EditorElement) => void;
    onRemove: (elementId: string) => void;
    onMoveUp: (elementId: string, parentId?: string) => void;
    onMoveDown: (elementId: string, parentId?: string) => void;
    onStartEditing: (element: EditorElement) => void;
    isEditing: boolean;
    layerName: string;
    onLayerNameChange: (name: string) => void;
    onSaveLayerName: () => void;
    onCancelEditing: () => void;
    editInputRef: React.RefObject<HTMLInputElement>;
    handleDragStart: (e: React.DragEvent, element: EditorElement) => void;
    getLayerDisplayName: (element: EditorElement) => string;
    truncateName: (name: string, maxLength?: number) => string;
}

export interface ContainerLayerProps extends Omit<LayerItemProps, 'isChild' | 'parentId'> {
    childElements: EditorElement[];
    isCollapsed: boolean;
    onToggleCollapse: (containerId: string) => void;
    renderLayerItem: (element: EditorElement, isChild: boolean, parentId?: string) => JSX.Element;
    isDropTarget: boolean;
    onDragOver: (e: React.DragEvent, targetId: string) => void;
    onDrop: (e: React.DragEvent, targetContainerId: string) => void;
    onDragLeave: () => void;
}

export interface ArtboardHeaderProps {
    size: string;
    displayName: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export interface StandaloneElementsProps {
    elements: EditorElement[];
    renderLayerItem: (element: EditorElement) => JSX.Element;
    isDropTarget: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragLeave: () => void;
}

export interface LayersContextType {
    collapsedContainers: Record<string, boolean>;
    toggleCollapse: (containerId: string) => void;
    draggedElement: EditorElement | null;
    setDraggedElement: (element: EditorElement | null) => void;
    dragTargetId: string | null;
    setDragTargetId: (id: string | null) => void;
    editingLayerId: string | null;
    setEditingLayerId: (id: string | null) => void;
    layerName: string;
    setLayerName: (name: string) => void;
    moveElementToContainer: (element: EditorElement, targetContainerId: string) => void;
    moveElementUp: (elementId: string, parentId?: string) => void;
    moveElementDown: (elementId: string, parentId?: string) => void;
}
