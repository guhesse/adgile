import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { LayerItemProps } from '../types';
import { ElementIcon } from './ElementIcon';

export const LayerItem: React.FC<LayerItemProps> = ({
  element,
  isSelected,
  isChild = false,
  parentId,
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
  truncateName
}) => {
  return (
    <div
      className={`flex h-8 min-w-[128px] p-[4px_8px] items-center gap-2 rounded-md w-full 
                 ${isSelected ? 'bg-purple-100' : 'hover:bg-gray-50'} 
                 ${isChild ? 'ml-5' : ''}`}
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
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="p-1 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(element.id, parentId);
            }}
            title="Mover para cima"
          >
            <ArrowUpIcon className="h-3 w-3" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(element.id, parentId);
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
        </div>
      )}
    </div>
  );
};
