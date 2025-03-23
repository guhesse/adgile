import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { ContainerLayerProps } from '../types';
import { ElementIcon } from './ElementIcon';

export const ContainerLayer: React.FC<ContainerLayerProps> = ({
  element,
  isSelected,
  childElements,
  isCollapsed,
  onToggleCollapse,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onStartEditing,
  isEditing,
  layerName,
  onLayerNameChange,
  onSaveLayerName,
  onCancelEditing,
  editInputRef,
  handleDragStart,
  getLayerDisplayName,
  truncateName,
  renderLayerItem,
  isDropTarget,
  onDragOver,
  onDrop,
  onDragLeave
}) => {
  return (
    <div
      className={`flex flex-col w-full ${isDropTarget ? 'bg-blue-50' : ''}`}
      onDragOver={(e) => onDragOver(e, element.id)}
      onDrop={(e) => onDrop(e, element.id)}
      onDragLeave={onDragLeave}
    >
      <div
        className={`flex min-w-[128px] p-[4px_8px] items-center gap-2 w-full rounded-md 
                   ${isSelected ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
        onClick={() => onSelect(element)}
        onDoubleClick={() => onStartEditing(element)}
        draggable
        onDragStart={(e) => handleDragStart(e, element)}
      >
        <ElementIcon type={element.type} />

        {isEditing ? (
          <input
            ref={editInputRef}
            className="flex-1 bg-white border border-gray-300 rounded px-1 text-xs focus:outline-none focus:border-blue-500"
            value={layerName}
            onChange={(e) => onLayerNameChange(e.target.value)}
            onBlur={onSaveLayerName}
            onKeyDown={(e) => {
              // Parar propagação de qualquer evento de teclado durante a edição
              e.stopPropagation();
              if (e.key === 'Enter') {
                onSaveLayerName();
              } else if (e.key === 'Escape') {
                onCancelEditing();
              }
            }}
          />
        ) : (
          <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#414651] font-sans text-xs font-normal leading-5">
            {truncateName(getLayerDisplayName(element))}
          </div>
        )}

        {!isEditing && (
          <>
            <div className="flex items-center gap-1 shrink-0">
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown(element.id);
                }}
                title="Mover para cima"
              >
                <ArrowUpIcon className="h-3 w-3" />
              </button>
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp(element.id);
                }}
                title="Mover para baixo"
              >
                <ArrowDownIcon className="h-3 w-3" />
              </button>
              <button
                className="ml-1 text-gray-400 hover:text-gray-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(element.id);
                }}
                title="Remover"
              >
                ×
              </button>
              <div
                className="cursor-pointer ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(element.id);
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
          {childElements.map((child) => renderLayerItem(child, true, element.id))}

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
