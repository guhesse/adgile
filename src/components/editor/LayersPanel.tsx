
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

  // Toggle container collapse state
  const toggleCollapse = (containerId: string) => {
    setCollapsedContainers(prev => ({
      ...prev,
      [containerId]: !prev[containerId]
    }));
  };

  // Find all container/layout elements
  const containers = elements.filter(el => el.type === "layout");
  
  // Find elements not inside any container
  const standaloneElements = elements.filter(el => 
    el.type !== "layout" && 
    !containers.some(container => 
      container.childElements?.some(child => child.id === el.id)
    )
  );

  // Get icon based on element type
  const renderElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <TextIcon className="h-4 w-4 text-[#414651]" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-[#414651]" />;
      case 'button':
        return <Square className="h-4 w-4 text-[#414651]" />;
      case 'layout':
        return <LayoutGrid className="h-4 w-4 text-[#414651]" />;
      default:
        return null;
    }
  };

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
    
    // If element is in a container, remove it from there
    if (element.inContainer && element.parentId) {
      const sourceContainerIndex = updatedElements.findIndex(el => el.id === element.parentId);
      if (sourceContainerIndex !== -1 && updatedElements[sourceContainerIndex].childElements) {
        updatedElements[sourceContainerIndex] = {
          ...updatedElements[sourceContainerIndex],
          childElements: updatedElements[sourceContainerIndex].childElements?.filter(child => child.id !== element.id) || []
        };
      }
    } else {
      // Remove standalone element
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
    
    // Add element to target container
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

  // Render a container with its child elements
  const renderContainer = (container: EditorElement) => {
    const isCollapsed = collapsedContainers[container.id];
    const isSelected = selectedElement?.id === container.id;
    const isDropTarget = dragTargetId === container.id;
    const childElements = container.childElements || [];

    return (
      <div 
        key={container.id} 
        className={`mb-2 overflow-hidden ${isDropTarget ? 'bg-blue-50' : ''}`}
        onDragOver={(e) => handleDragOver(e, container.id)}
        onDrop={(e) => handleDrop(e, container.id)}
        onDragLeave={() => setDragTargetId(null)}
      >
        <div 
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md ${isSelected ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'}`}
          onClick={() => setSelectedElement(container)}
          draggable
          onDragStart={(e) => handleDragStart(e, container)}
        >
          <button 
            className="focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(container.id);
            }}
          >
            {isCollapsed ? 
              <ChevronRight className="h-4 w-4 text-[#414651]" /> : 
              <ChevronDown className="h-4 w-4 text-[#414651]" />
            }
          </button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-[#414651]" />
            <span className="text-sm font-medium truncate">
              {container.content || `Container ${container.columns || 1}×`}
            </span>
          </div>
          <button 
            className="ml-auto text-gray-400 hover:text-gray-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              removeElement(container.id);
            }}
          >
            ×
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="ml-6 pl-2 border-l border-gray-200 py-1">
            {childElements.map((child) => (
              <div 
                key={child.id}
                className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md cursor-pointer my-1 ${selectedElement?.id === child.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'} ${draggedElement?.id === child.id ? 'opacity-50' : ''}`}
                onClick={() => setSelectedElement(child)}
                draggable
                onDragStart={(e) => handleDragStart(e, child)}
              >
                {renderElementIcon(child.type)}
                <span className="truncate">
                  {child.content || child.type}
                </span>
                <button 
                  className="ml-auto text-gray-400 hover:text-gray-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(child.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {childElements.length === 0 && (
              <div className="text-xs text-gray-400 py-1 px-2">
                Arraste elementos para aqui
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#414651] rounded-lg">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.53328 6.66666C5.44734 6.67135 5.36177 6.65218 5.28605 6.61128C5.21032 6.57037 5.14738 6.50932 5.10419 6.43487C5.061 6.36043 5.03924 6.27548 5.04131 6.18944C5.04339 6.1034 5.06922 6.0196 5.11594 5.94733L7.59994 1.99999C7.63898 1.92971 7.69551 1.87069 7.76405 1.82868C7.8326 1.78666 7.91084 1.76307 7.99118 1.76019C8.07153 1.7573 8.15126 1.77523 8.22264 1.81222C8.29402 1.84921 8.35464 1.90402 8.39861 1.97133L10.8666 5.93333C10.9153 6.00319 10.9439 6.08502 10.9493 6.16998C10.9548 6.25493 10.937 6.33976 10.8977 6.41529C10.8584 6.49082 10.7992 6.55417 10.7265 6.59848C10.6538 6.64278 10.5704 6.66636 10.4853 6.66666H5.53328Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M6 9.33329H2.66667C2.29848 9.33329 2 9.63177 2 9.99996V13.3333C2 13.7015 2.29848 14 2.66667 14H6C6.36819 14 6.66667 13.7015 6.66667 13.3333V9.99996C6.66667 9.63177 6.36819 9.33329 6 9.33329Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M11.6667 14C12.9553 14 14 12.9553 14 11.6666C14 10.378 12.9553 9.33329 11.6667 9.33329C10.378 9.33329 9.33333 10.378 9.33333 11.6666C9.33333 12.9553 10.378 14 11.6667 14Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-bold text-[#414651]">Nome do cliente</div>
            <div className="text-xs text-[#414651]">Nome da campanha</div>
          </div>
        </div>
      </div>

      {/* Layer content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <h3 className="font-medium text-sm mb-2">Camadas</h3>
        
        {/* Container elements */}
        <div className="space-y-1 mb-4">
          {containers.map(renderContainer)}
        </div>
        
        {/* Standalone elements section */}
        <div 
          className={`border rounded-md p-2 bg-gray-50 ${dragTargetId === 'standalone' ? 'bg-blue-50 border-blue-300' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'standalone')}
          onDrop={(e) => handleDrop(e, 'standalone')}
          onDragLeave={() => setDragTargetId(null)}
        >
          <div className="text-sm font-medium mb-2 text-gray-500">Elementos sem container</div>
          
          {standaloneElements.map((element) => (
            <div 
              key={element.id}
              className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md cursor-pointer my-1 ${selectedElement?.id === element.id ? 'bg-purple-100' : 'hover:bg-gray-50'} ${draggedElement?.id === element.id ? 'opacity-50' : ''}`}
              onClick={() => setSelectedElement(element)}
              draggable
              onDragStart={(e) => handleDragStart(e, element)}
            >
              {renderElementIcon(element.type)}
              <span className="truncate">
                {element.content || element.type}
              </span>
              <button 
                className="ml-auto text-gray-400 hover:text-gray-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  removeElement(element.id);
                }}
              >
                ×
              </button>
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
