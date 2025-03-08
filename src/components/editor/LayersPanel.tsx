
import { EditorElement } from "./types";
import { 
  ChevronDown,
  ChevronRight,
  TextIcon,
  ImageIcon,
  Square,
  LayoutGrid
} from "lucide-react";
import { useState } from "react";
import { useCanvas } from "./CanvasContext";

interface LayersPanelProps {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  setSelectedElement: (element: EditorElement) => void;
  removeElement: (elementId: string) => void;
}

export const LayersPanel = ({ elements, selectedElement, setSelectedElement, removeElement }: LayersPanelProps) => {
  const [collapsedContainers, setCollapsedContainers] = useState<Record<string, boolean>>({});
  const [draggedElement, setDraggedElement] = useState<EditorElement | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const { setElements } = useCanvas();

  // Função para alternar o estado de colapso de um container
  const toggleCollapse = (containerId: string) => {
    setCollapsedContainers(prev => ({
      ...prev,
      [containerId]: !prev[containerId]
    }));
  };

  // Encontra todos os elementos do tipo layout (containers)
  const containers = elements.filter(el => el.type === "layout");
  
  // Elementos que não estão dentro de um container
  const standaloneElements = elements.filter(el => 
    el.type !== "layout" && 
    !containers.some(container => 
      container.childElements?.some(child => child.id === el.id)
    )
  );

  // Renderiza ícone baseado no tipo do elemento
  const renderElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextIcon className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'button':
        return <Square className="h-4 w-4" />;
      case 'layout':
        return <LayoutGrid className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Handle drag start for layer items
  const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
    e.stopPropagation();
    setDraggedElement(element);
    // Add data to the drag operation
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over container/area
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show visual indication of where the item will be dropped
    setDragTargetId(targetId);
    
    // Expand the container if collapsed
    if (collapsedContainers[targetId]) {
      setCollapsedContainers(prev => ({
        ...prev,
        [targetId]: false
      }));
    }
  };

  // Handle drop into container
  const handleDrop = (e: React.DragEvent, targetContainerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag state
    setDragTargetId(null);
    
    // Ensure we have a dragged element
    if (!draggedElement) return;
    
    // Move element from source to target container
    moveElementToContainer(draggedElement, targetContainerId);
    
    setDraggedElement(null);
  };

  // Move element from one container to another
  const moveElementToContainer = (element: EditorElement, targetContainerId: string) => {
    // Create a copy of the elements array to modify
    const updatedElements = [...elements];
    
    // If the element is in a container, remove it from there
    if (element.inContainer && element.parentId) {
      const sourceContainerIndex = updatedElements.findIndex(el => el.id === element.parentId);
      if (sourceContainerIndex !== -1 && updatedElements[sourceContainerIndex].childElements) {
        updatedElements[sourceContainerIndex] = {
          ...updatedElements[sourceContainerIndex],
          childElements: updatedElements[sourceContainerIndex].childElements?.filter(child => child.id !== element.id) || []
        };
      }
    } else {
      // If it's a standalone element, remove it from main elements array
      const elementIndex = updatedElements.findIndex(el => el.id === element.id);
      if (elementIndex !== -1) {
        updatedElements.splice(elementIndex, 1);
      }
    }
    
    // Find the target container
    const targetContainerIndex = updatedElements.findIndex(el => el.id === targetContainerId);
    if (targetContainerIndex === -1) return;
    
    // Add the element to the target container
    const targetChildren = updatedElements[targetContainerIndex].childElements || [];
    
    // Update the element with its new container relationship
    const updatedElement = {
      ...element,
      inContainer: true,
      parentId: targetContainerId,
      style: {
        ...element.style,
        // Reset position to top-left of container
        x: 0,
        y: 0
      }
    };
    
    // Add to target container
    updatedElements[targetContainerIndex] = {
      ...updatedElements[targetContainerIndex],
      childElements: [...targetChildren, updatedElement]
    };
    
    // Update the elements state
    setElements(updatedElements);
    
    // Update selection if the moved element was selected
    if (selectedElement?.id === element.id) {
      setSelectedElement(updatedElement);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Camadas</h3>
      </div>
      
      <div className="space-y-1">
        {/* Containers (layouts) com seus elementos filhos */}
        {containers.map((container) => (
          <div 
            key={container.id} 
            className={`border rounded-md mb-2 overflow-hidden ${dragTargetId === container.id ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragOver={(e) => handleDragOver(e, container.id)}
            onDrop={(e) => handleDrop(e, container.id)}
            onDragLeave={() => setDragTargetId(null)}
          >
            <div 
              className={`px-3 py-2 flex items-center justify-between cursor-pointer ${selectedElement?.id === container.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-50'}`}
              onClick={() => setSelectedElement(container)}
              draggable
              onDragStart={(e) => handleDragStart(e, container)}
            >
              <div className="flex items-center">
                <button 
                  className="mr-2 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(container.id);
                  }}
                >
                  {collapsedContainers[container.id] ? 
                    <ChevronRight className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
                <div className="flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {container.content || `Container ${container.columns || 1}×`}
                  </span>
                </div>
              </div>
              <div>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(container.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            {!collapsedContainers[container.id] && container.childElements && (
              <div className="ml-6 pl-2 border-l border-gray-200 py-1">
                {container.childElements.map((child) => (
                  <div 
                    key={child.id}
                    className={`px-3 py-2 text-sm rounded-md flex items-center justify-between cursor-pointer my-1 ${selectedElement?.id === child.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'} ${draggedElement?.id === child.id ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedElement(child)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, child)}
                  >
                    <div className="flex items-center">
                      {renderElementIcon(child.type)}
                      <span className="ml-2 truncate">
                        {child.content || child.type}
                      </span>
                    </div>
                    <div>
                      <button 
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(child.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Standalone elements section that can also receive drops */}
        <div 
          className={`border rounded-md p-2 bg-gray-50 ${dragTargetId === 'standalone' ? 'bg-blue-50 border-blue-300' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'standalone')}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Reset drag state
            setDragTargetId(null);
            
            // Ensure we have a dragged element
            if (!draggedElement) return;
            
            // Create a copy of elements
            const updatedElements = [...elements];
            
            // If the element is in a container, remove it from there
            if (draggedElement.inContainer && draggedElement.parentId) {
              const sourceContainerIndex = updatedElements.findIndex(el => el.id === draggedElement.parentId);
              if (sourceContainerIndex !== -1 && updatedElements[sourceContainerIndex].childElements) {
                updatedElements[sourceContainerIndex] = {
                  ...updatedElements[sourceContainerIndex],
                  childElements: updatedElements[sourceContainerIndex].childElements?.filter(child => child.id !== draggedElement.id) || []
                };
              }
              
              // Add the element to standalone elements
              const updatedElement = {
                ...draggedElement,
                inContainer: false,
                parentId: undefined,
                style: {
                  ...draggedElement.style,
                  // Position at some default coordinates
                  x: 100,
                  y: 100
                }
              };
              
              updatedElements.push(updatedElement);
              
              // Update elements state
              setElements(updatedElements);
              
              // Update selection if needed
              if (selectedElement?.id === draggedElement.id) {
                setSelectedElement(updatedElement);
              }
            }
            
            setDraggedElement(null);
          }}
          onDragLeave={() => setDragTargetId(null)}
        >
          <div className="text-sm font-medium mb-2 text-gray-500">Elementos sem container</div>
          {standaloneElements.map((element) => (
            <div 
              key={element.id}
              className={`px-3 py-2 text-sm rounded-md flex items-center justify-between cursor-pointer my-1 ${selectedElement?.id === element.id ? 'bg-purple-100' : 'hover:bg-gray-50'} ${draggedElement?.id === element.id ? 'opacity-50' : ''}`}
              onClick={() => setSelectedElement(element)}
              draggable
              onDragStart={(e) => handleDragStart(e, element)}
            >
              <div className="flex items-center">
                {renderElementIcon(element.type)}
                <span className="ml-2 truncate">
                  {element.content || element.type}
                </span>
              </div>
              <div>
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(element.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {standaloneElements.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-2">
              Arraste elementos para aqui
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
