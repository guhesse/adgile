import { EditorElement } from "./types";
import { useState } from "react";
import { useCanvas } from "./CanvasContext";

// Importando os componentes modulares
import { LayerItem } from "./layers/components/LayerItem";
import { ContainerLayer } from "./layers/components/ContainerLayer";
import { ArtboardHeader } from "./layers/components/ArtboardHeader";

// Importando os hooks customizados
import { useLayerName } from "./layers/hooks/useLayerName";
import { useDragAndDrop } from "./layers/hooks/useDragAndDrop";
import { useLayerManagement } from "./layers/hooks/useLayerManagement";

// Importando tipos
import { LayersPanelProps } from "./layers/types";

export const LayersPanel = ({
  elements,
  selectedElement,
  setSelectedElement,
  removeElement
}: LayersPanelProps) => {
  const { setElements } = useCanvas();

  // Utilizando os hooks customizados
  const {
    collapsedContainers,
    setCollapsedContainers,
    toggleCollapse,
    getArtboardName,
    moveElementUp,
    moveElementDown,
    getArtboards,
    getElementsByArtboard,
    getContainersByArtboard,
    getStandaloneElementsByArtboard
  } = useLayerManagement(elements, setElements);

  const {
    editingLayerId,
    setEditingLayerId,
    layerName,
    setLayerName,
    editInputRef,
    startEditing,
    saveLayerName,
    getLayerDisplayName,
    truncateName
  } = useLayerName(elements, setElements);

  const {
    draggedElement,
    setDraggedElement,
    dragTargetId,
    setDragTargetId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    moveElementToContainer
  } = useDragAndDrop(
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    collapsedContainers,
    setCollapsedContainers
  );

  // Obter dados organizados
  const artboards = getArtboards();
  const elementsByArtboard = getElementsByArtboard();
  const containersByArtboard = getContainersByArtboard();
  const standaloneElementsByArtboard = getStandaloneElementsByArtboard();

  // Renderizar um elemento
  const renderElement = (element: EditorElement, isChild: boolean = false, parentId?: string) => {
    return (
      <LayerItem
        key={element.id}
        element={element}
        isSelected={selectedElement?.id === element.id}
        isChild={isChild}
        parentId={parentId}
        onSelect={setSelectedElement}
        onRemove={removeElement}
        onMoveUp={moveElementUp}
        onMoveDown={moveElementDown}
        onStartEditing={startEditing}
        isEditing={editingLayerId === element.id}
        layerName={layerName}
        onLayerNameChange={setLayerName}
        onSaveLayerName={saveLayerName}
        onCancelEditing={() => setEditingLayerId(null)}
        editInputRef={editInputRef}
        handleDragStart={handleDragStart}
        getLayerDisplayName={getLayerDisplayName}
        truncateName={truncateName}
      />
    );
  };

  // Renderizar um container com seus elementos filho
  const renderContainer = (container: EditorElement) => {
    return (
      <ContainerLayer
        key={container.id}
        element={container}
        isSelected={selectedElement?.id === container.id}
        childElements={container.childElements || []}
        isCollapsed={!!collapsedContainers[container.id]}
        onToggleCollapse={toggleCollapse}
        onSelect={setSelectedElement}
        onRemove={removeElement}
        onMoveUp={moveElementUp}
        onMoveDown={moveElementDown}
        onStartEditing={startEditing}
        isEditing={editingLayerId === container.id}
        layerName={layerName}
        onLayerNameChange={setLayerName}
        onSaveLayerName={saveLayerName}
        onCancelEditing={() => setEditingLayerId(null)}
        editInputRef={editInputRef}
        handleDragStart={handleDragStart}
        getLayerDisplayName={getLayerDisplayName}
        truncateName={truncateName}
        renderLayerItem={renderElement}
        isDropTarget={dragTargetId === container.id}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setDragTargetId(null)}
      />
    );
  };

  // Renderizar um artboard/tamanho
  const renderArtboardHeader = (size: string) => {
    const isCollapsed = !!collapsedContainers[`artboard-${size}`];
    const displayName = getArtboardName(size);

    return (
      <ArtboardHeader
        size={size}
        displayName={displayName}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => toggleCollapse(`artboard-${size}`)}
      />
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
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[#414651] font-sans text-sm font-bold leading-[14px] w-full">
                Nome do cliente
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[#414651] font-sans text-xs font-normal leading-4 w-full">
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
