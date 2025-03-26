
import React from 'react';
import { StandaloneElementsProps } from '../types';

export const StandaloneElements: React.FC<StandaloneElementsProps> = ({
    elements,
    renderLayerItem,
    isDropTarget,
    onDragOver,
    onDragLeave,
    onDrop
}) => {
    return (
        <div
            className={`flex flex-col w-full ${isDropTarget ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={onDragLeave}
        >
            {elements.map((element) => renderLayerItem(element))}
            {elements.length === 0 && (
                <div className="text-xs text-gray-400 py-1 px-2">
                    Sem elementos independentes
                </div>
            )}
        </div>
    );
};
