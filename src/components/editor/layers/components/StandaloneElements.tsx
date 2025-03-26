
import React from 'react';
import { StandaloneElementsProps } from '../types';
import { Badge } from '@/components/ui/badge';
import { useCanvas } from '../../CanvasContext';
import { hasFormatSpecificStyles } from '../../utils/formatConversion';

export const StandaloneElements: React.FC<StandaloneElementsProps> = ({
    elements,
    renderLayerItem,
    isDropTarget,
    onDragOver,
    onDrop,
    onDragLeave
}) => {
    const { selectedSize } = useCanvas();

    return (
        <div
            className={`flex flex-col w-full ${isDropTarget ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragOver={(e) => onDragOver(e, 'standalone')}
            onDrop={(e) => onDrop(e, 'standalone')}
            onDragLeave={onDragLeave}
        >
            {elements.map((element) => {
                // Verificar se o elemento possui estilos específicos para este formato
                const hasSpecificStyles = hasFormatSpecificStyles(element, selectedSize.name);
                
                return (
                    <div key={element.id} className="relative">
                        {hasSpecificStyles && (
                            <div className="absolute right-1 top-1 z-10">
                                <Badge variant="outline" className="bg-green-50 text-green-600 text-[10px] h-4 px-1">
                                    Adaptado
                                </Badge>
                            </div>
                        )}
                        {renderLayerItem(element)}
                    </div>
                );
            })}
            {elements.length === 0 && (
                <div className="text-xs text-gray-400 py-1 px-2">
                    Sem elementos independentes
                </div>
            )}
        </div>
    );
};
