
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

interface LayersPanelProps {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  setSelectedElement: (element: EditorElement) => void;
  removeElement: (elementId: string) => void;
}

export const LayersPanel = ({ elements, selectedElement, setSelectedElement, removeElement }: LayersPanelProps) => {
  const [collapsedContainers, setCollapsedContainers] = useState<Record<string, boolean>>({});

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

  // Rendeniza ícone baseado no tipo do elemento
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

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Camadas</h3>
      </div>
      
      <div className="space-y-1">
        {/* Containers (layouts) com seus elementos filhos */}
        {containers.map((container) => (
          <div key={container.id} className="border rounded-md mb-2 overflow-hidden">
            <div 
              className={`px-3 py-2 flex items-center justify-between cursor-pointer ${selectedElement?.id === container.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-50'}`}
              onClick={() => setSelectedElement(container)}
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
                    className={`px-3 py-2 text-sm rounded-md flex items-center justify-between cursor-pointer my-1 ${selectedElement?.id === child.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedElement(child)}
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

        {/* Elementos soltos (sem container) */}
        {standaloneElements.length > 0 && (
          <div className="border rounded-md p-2 bg-gray-50">
            <div className="text-sm font-medium mb-2 text-gray-500">Elementos sem container</div>
            {standaloneElements.map((element) => (
              <div 
                key={element.id}
                className={`px-3 py-2 text-sm rounded-md flex items-center justify-between cursor-pointer my-1 ${selectedElement?.id === element.id ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedElement(element)}
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
          </div>
        )}
      </div>
    </div>
  );
};
