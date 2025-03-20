import { EditorElement } from "./types";
import {
  ChevronDown,
  ChevronRight,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [layerName, setLayerName] = useState<string>("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const { setElements } = useCanvas();

  // Agrupar elementos por artboard/tamanho
  const getArtboardName = (size: string) => {
    // Mapear tamanhos para nomes mais descritivos
    const sizeToName: Record<string, string> = {
      '300x250': 'MPU 300x250',
      '728x90': 'Leaderboard 728x90',
      '970x250': 'Billboard 970x250',
      '320x100': 'Mobile Leaderboard 320x100',
      '600x800': 'Email Template 600x800',
      // Adicione mais mapeamentos conforme necessário
    };
    
    return sizeToName[size] || size;
  };
  
  // Extrair artboards dos elementos
  const artboards = Array.from(new Set(elements
    .filter(el => el.artboardSize)
    .map(el => el.artboardSize || '300x250')));
  
  if (artboards.length === 0) {
    // Se não houver artboards definidos, assumir um padrão
    artboards.push('300x250');
  }

  // Toggle container collapse state
  const toggleCollapse = (containerId: string) => {
    setCollapsedContainers(prev => ({
      ...prev,
      [containerId]: !prev[containerId]
    }));
  };

  // Agrupar elementos por artboard
  const elementsByArtboard: Record<string, EditorElement[]> = {};
  
  artboards.forEach(size => {
    elementsByArtboard[size] = elements.filter(el => 
      (el.artboardSize === size || (!el.artboardSize && size === artboards[0]))
    );
    
    // Inverter a ordem para que o z-index corresponda à visualização
    // Os elementos mais acima na lista são renderizados por último (aparecem no topo)
    elementsByArtboard[size] = [...elementsByArtboard[size]].reverse();
  });

  // Find all container/layout elements por artboard
  const containersByArtboard: Record<string, EditorElement[]> = {};
  
  artboards.forEach(size => {
    containersByArtboard[size] = elementsByArtboard[size].filter(el => 
      el.type === "layout" || el.type === "container"
    );
  });

  // Find elements not inside any container, excluding artboard backgrounds
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

  // Get icon based on element type
  const renderElementIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'paragraph':
        return (
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8333 4.06665H2.5M14.5 8.06665H2.5M10.5667 11.9999H2.5" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        );
      case 'image':
      case 'logo':
        return (
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 9.99996L12.4427 7.94263C12.1926 7.69267 11.8536 7.55225 11.5 7.55225C11.1464 7.55225 10.8074 7.69267 10.5573 7.94263L4.5 14M3.83333 2H13.1667C13.903 2 14.5 2.59695 14.5 3.33333V12.6667C14.5 13.403 13.903 14 13.1667 14H3.83333C3.09695 14 2.5 13.403 2.5 12.6667V3.33333C2.5 2.59695 3.09695 2 3.83333 2ZM7.83333 6C7.83333 6.73638 7.23638 7.33333 6.5 7.33333C5.76362 7.33333 5.16667 6.73638 5.16667 6C5.16667 5.26362 5.76362 4.66667 6.5 4.66667C7.23638 4.66667 7.83333 5.26362 7.83333 6Z" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        );
      case 'button':
        return (
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8333 4H3.16666C2.43028 4 1.83333 4.59695 1.83333 5.33333V10.6667C1.83333 11.403 2.43028 12 3.16666 12H13.8333C14.5697 12 15.1667 11.403 15.1667 10.6667V5.33333C15.1667 4.59695 14.5697 4 13.8333 4Z" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        );
      case 'layout':
      case 'container':
        return (
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.83333 2.66667H14.5M9.83333 6H14.5M9.83333 10H14.5M9.83333 13.3333H14.5M3.16667 2H6.5C6.86819 2 7.16667 2.29848 7.16667 2.66667V6C7.16667 6.36819 6.86819 6.66667 6.5 6.66667H3.16667C2.79848 6.66667 2.5 6.36819 2.5 6V2.66667C2.5 2.29848 2.79848 2 3.16667 2ZM3.16667 9.33333H6.5C6.86819 9.33333 7.16667 9.63181 7.16667 10V13.3333C7.16667 13.7015 6.86819 14 6.5 14H3.16667C2.79848 14 2.5 13.7015 2.5 13.3333V10C2.5 9.63181 2.79848 9.33333 3.16667 9.33333Z" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        );
      default:
        return (
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.1667 3.99992H1.83333M15.1667 11.9999H1.83333M4.49999 1.33325V14.6666M12.5 1.33325V14.6666" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        );
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

  // Truncate layer name for display
  const truncateName = (name: string, maxLength: number = 20) => {
    if (!name) return '';
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  // Iniciar edição de nome da camada
  const startEditing = (element: EditorElement) => {
    setEditingLayerId(element.id);
    setLayerName(element.content || element.name || element.type);
    
    // Focar no input após renderização
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 10);
  };

  // Salvar nome da camada
  const saveLayerName = () => {
    if (!editingLayerId) return;
    
    const updatedElements = elements.map(el => {
      if (el.id === editingLayerId) {
        return { ...el, content: layerName, name: layerName };
      }
      
      // Verificar também elementos dentro de containers
      if (el.childElements) {
        const updatedChildren = el.childElements.map(child => {
          if (child.id === editingLayerId) {
            return { ...child, content: layerName, name: layerName };
          }
          return child;
        });
        
        return { ...el, childElements: updatedChildren };
      }
      
      return el;
    });
    
    setElements(updatedElements);
    setEditingLayerId(null);
  };

  // Manipular keydown para F2 ou Enter/Escape durante edição
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se estiver editando, não propague eventos de teclado para o canvas
      if (editingLayerId) {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveLayerName();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setEditingLayerId(null);
        } else if (e.key === ' ' || e.key === 'Backspace') {
          // Impedir que o espaço ou backspace sejam capturados pelo canvas
          e.stopPropagation();
        }
        return;
      }
      
      // Se não estiver editando, verificar por F2
      if (e.key === 'F2' && selectedElement) {
        e.preventDefault();
        startEditing(selectedElement);
      }
    };
    
    // Adicionar handler de evento de teclado
    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase para pegar antes do canvas
    
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedElement, editingLayerId, layerName]);

  // Adicionar handler para clicar fora do input de edição
  useEffect(() => {
    if (!editingLayerId) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (editInputRef.current && !editInputRef.current.contains(e.target as Node)) {
        saveLayerName();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingLayerId, layerName]);

  // Renderizar um artboard/tamanho
  const renderArtboardHeader = (size: string) => {
    const isCollapsed = collapsedContainers[`artboard-${size}`];
    const displayName = getArtboardName(size);
    
    return (
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-col items-start gap-2 w-full">
          <div 
            className="flex min-w-[128px] p-[4px_8px] items-center gap-2 w-full rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => toggleCollapse(`artboard-${size}`)}
          >
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.1667 3.99992H1.83333M15.1667 11.9999H1.83333M4.49999 1.33325V14.6666M12.5 1.33325V14.6666" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <div className="flex-1 overflow-hidden text-[#414651] font-sans text-xs font-normal leading-5">
              {displayName}
            </div>
            <svg 
              width="17" height="16" 
              viewBox="0 0 17 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className={`transform ${isCollapsed ? '' : 'rotate-90'}`}
            >
              <path d="M4.5 6L8.5 10L12.5 6" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar um elemento
  const renderElement = (element: EditorElement, isChild: boolean = false, parentId?: string) => {
    const isSelected = selectedElement?.id === element.id;
    const isEditing = editingLayerId === element.id;
    
    return (
      <div
        key={element.id}
        className={`flex h-8 min-w-[128px] p-[4px_8px] items-center gap-2 rounded-md w-full 
                   ${isSelected ? 'bg-purple-100' : 'hover:bg-gray-50'} 
                   ${isChild ? 'ml-5' : ''}`}
        onClick={() => setSelectedElement(element)}
        onDoubleClick={() => startEditing(element)}
        draggable
        onDragStart={(e) => handleDragStart(e, element)}
      >
        {renderElementIcon(element.type)}
        
        {isEditing ? (
          <input
            ref={editInputRef}
            className="flex-1 bg-white border border-gray-300 rounded px-1 text-xs focus:outline-none focus:border-blue-500"
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            onBlur={saveLayerName}
            onKeyDown={(e) => {
              // Parar propagação de qualquer evento de teclado durante a edição
              e.stopPropagation();
              if (e.key === 'Enter') {
                saveLayerName();
              } else if (e.key === 'Escape') {
                setEditingLayerId(null);
              }
            }}
          />
        ) : (
          <div className="flex-1 overflow-hidden text-[#414651] font-sans text-xs font-normal leading-5">
            {truncateName(element.content || element.name) || element.type}
          </div>
        )}
        
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                moveElementDown(element.id, parentId);
              }}
              title="Mover para cima"
            >
              <ArrowUpIcon className="h-3 w-3" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                moveElementUp(element.id, parentId);
              }}
              title="Mover para baixo"
            >
              <ArrowDownIcon className="h-3 w-3" />
            </button>
            <button
              className="ml-1 text-gray-400 hover:text-gray-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
              title="Remover"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  };

  // Renderizar um container com seus elementos filho
  const renderContainer = (container: EditorElement) => {
    const isCollapsed = collapsedContainers[container.id];
    const isSelected = selectedElement?.id === container.id;
    const isDropTarget = dragTargetId === container.id;
    const childElements = container.childElements || [];
    const isEditing = editingLayerId === container.id;
    
    return (
      <div
        key={container.id}
        className={`flex flex-col w-full ${isDropTarget ? 'bg-blue-50' : ''}`}
        onDragOver={(e) => handleDragOver(e, container.id)}
        onDrop={(e) => handleDrop(e, container.id)}
        onDragLeave={() => setDragTargetId(null)}
      >
        <div
          className={`flex min-w-[128px] p-[4px_8px] items-center gap-2 w-full rounded-md 
                     ${isSelected ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
          onClick={() => setSelectedElement(container)}
          onDoubleClick={() => startEditing(container)}
          draggable
          onDragStart={(e) => handleDragStart(e, container)}
        >
          {renderElementIcon(container.type)}
          
          {isEditing ? (
            <input
              ref={editInputRef}
              className="flex-1 bg-white border border-gray-300 rounded px-1 text-xs focus:outline-none focus:border-blue-500"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              onBlur={saveLayerName}
              onKeyDown={(e) => {
                // Parar propagação de qualquer evento de teclado durante a edição
                e.stopPropagation();
                if (e.key === 'Enter') {
                  saveLayerName();
                } else if (e.key === 'Escape') {
                  setEditingLayerId(null);
                }
              }}
            />
          ) : (
            <div className="flex-1 overflow-hidden text-[#414651] font-sans text-xs font-normal leading-5">
              {truncateName(container.content || container.name) || `Container ${container.columns || 1}×`}
            </div>
          )}
          
          {!isEditing && (
            <>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementDown(container.id);
                  }}
                  title="Mover para cima"
                >
                  <ArrowUpIcon className="h-3 w-3" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementUp(container.id);
                  }}
                  title="Mover para baixo"
                >
                  <ArrowDownIcon className="h-3 w-3" />
                </button>
                <button
                  className="ml-1 text-gray-400 hover:text-gray-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(container.id);
                  }}
                  title="Remover"
                >
                  ×
                </button>
                <div
                  className="cursor-pointer ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(container.id);
                  }}
                >
                  <svg 
                    width="17" height="16" 
                    viewBox="0 0 17 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`transform ${isCollapsed ? '' : 'rotate-90'}`}
                  >
                    <path d="M4.5 6L8.5 10L12.5 6" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="flex flex-col w-full">
            {childElements.map((child) => renderElement(child, true, container.id))}
            
            {childElements.length === 0 && (
              <div className="text-xs text-gray-400 py-1 px-2 ml-5">
                Arraste elementos para aqui
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="flex w-[261px] p-[8px_0px] flex-col items-center gap-2 border border-[#D5D7DA] bg-[#FDFDFD] h-full">
        {/* Panel header */}
        <div className="flex w-[245px] p-[0px_8px] flex-col justify-center items-start">
          <div className="flex p-2 items-center gap-2 w-full rounded-md">
            <div className="flex p-2 items-center rounded-lg bg-[#414651]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.53328 6.66678C5.44734 6.67147 5.36177 6.6523 5.28605 6.6114C5.21032 6.57049 5.14738 6.50944 5.10419 6.43499C5.061 6.36055 5.03924 6.27561 5.04131 6.18956C5.04339 6.10352 5.06922 6.01973 5.11594 5.94745L7.59994 2.00011C7.63898 1.92983 7.69551 1.87082 7.76405 1.8288C7.8326 1.78679 7.91084 1.76319 7.99118 1.76031C8.07153 1.75743 8.15126 1.77535 8.22264 1.81234C8.29402 1.84933 8.35464 1.90414 8.39861 1.97145L10.8666 5.93345C10.9153 6.00331 10.9439 6.08515 10.9493 6.1701C10.9548 6.25505 10.937 6.33989 10.8977 6.41542C10.8584 6.49094 10.7992 6.55429 10.7265 6.5986C10.6538 6.6429 10.5704 6.66648 10.4853 6.66678H5.53328Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M6 9.33341H2.66667C2.29848 9.33341 2 9.63189 2 10.0001V13.3334C2 13.7016 2.29848 14.0001 2.66667 14.0001H6C6.36819 14.0001 6.66667 13.7016 6.66667 13.3334V10.0001C6.66667 9.63189 6.36819 9.33341 6 9.33341Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M11.6667 14.0001C12.9553 14.0001 14 12.9554 14 11.6667C14 10.3781 12.9553 9.33341 11.6667 9.33341C10.378 9.33341 9.33333 10.3781 9.33333 11.6667C9.33333 12.9554 10.378 14.0001 11.6667 14.0001Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <div className="flex flex-col items-start gap-[2px] flex-1">
              <div className="overflow-hidden text-[#414651] font-sans text-sm font-bold leading-[14px] w-full">
                Nome do cliente
              </div>
              <div className="overflow-hidden text-[#414651] font-sans text-xs font-normal leading-4 w-full">
                Nome da campanha
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="flex flex-col justify-center items-center w-full">
          <div className="w-full h-[1px] bg-[#E9EAEB]"></div>
        </div>
        
        {/* Content section - one section per artboard */}
        <div className="flex flex-col w-[240px] p-[8px_0px] gap-4 overflow-y-auto flex-1">
          {artboards.map((size) => (
            <div key={size} className="flex flex-col w-full gap-2">
              {renderArtboardHeader(size)}
              
              {!collapsedContainers[`artboard-${size}`] && (
                <div className="flex flex-col px-[10px] gap-2 w-full">
                  {/* Container elements */}
                  {containersByArtboard[size].map(renderContainer)}
                  
                  {/* Standalone elements section */}
                  {standaloneElementsByArtboard[size].length > 0 && (
                    <div
                      className={`flex flex-col w-full ${dragTargetId === 'standalone' ? 'bg-blue-50 border-blue-300' : ''}`}
                      onDragOver={(e) => handleDragOver(e, 'standalone')}
                      onDrop={(e) => handleDrop(e, 'standalone')}
                      onDragLeave={() => setDragTargetId(null)}
                    >
                      {standaloneElementsByArtboard[size].map((element) => renderElement(element))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
