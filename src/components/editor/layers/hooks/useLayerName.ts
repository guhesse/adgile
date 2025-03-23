import { useState, useEffect, useRef } from 'react';
import { EditorElement } from '../../types';

export const useLayerName = (elements: EditorElement[], setElements: (elements: EditorElement[]) => void) => {
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [layerName, setLayerName] = useState<string>("");
    const editInputRef = useRef<HTMLInputElement>(null);

    // Obter nome padrão com base no tipo de elemento
    const getDefaultNameByType = (type: string, element: EditorElement) => {
        switch (type) {
            case 'text':
            case 'paragraph':
                return 'Texto';
            case 'image':
                return 'Imagem';
            case 'logo':
                return 'Logo';
            case 'button':
                return 'Botão';
            case 'container':
            case 'layout':
                return `Container ${element.columns || 1}×`;
            default:
                return type.charAt(0).toUpperCase() + type.slice(1);
        }
    };

    // Truncate layer name for display
    const truncateName = (name: string, maxLength: number = 15) => {
        if (!name) return '';
        return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
    };

    // Iniciar edição de nome da camada
    const startEditing = (element: EditorElement) => {
        setEditingLayerId(element.id);

        // Usar o nome personalizado da camada se existir, ou o nome padrão
        const displayName = element._layerName || getDefaultNameByType(element.type, element);
        setLayerName(displayName);

        // Focar no input após renderização
        setTimeout(() => {
            if (editInputRef.current) {
                editInputRef.current.focus();
                editInputRef.current.select();
            }
        }, 10);
    };

    // Obter o nome para exibição no painel de camadas
    const getLayerDisplayName = (element: EditorElement) => {
        return element._layerName || getDefaultNameByType(element.type, element);
    };

    // Salvar nome da camada
    const saveLayerName = () => {
        if (!editingLayerId) return;

        const updatedElements = elements.map(el => {
            if (el.id === editingLayerId) {
                // Adicionar somente o campo _layerName sem modificar outros atributos
                return { ...el, _layerName: layerName };
            }

            // Verificar também elementos dentro de containers
            if (el.childElements) {
                const updatedChildren = el.childElements.map(child => {
                    if (child.id === editingLayerId) {
                        // Adicionar somente o campo _layerName sem modificar outros atributos
                        return { ...child, _layerName: layerName };
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
            }
        };

        // Adicionar handler de evento de teclado
        window.addEventListener('keydown', handleKeyDown, true); // Use capture phase para pegar antes do canvas

        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [editingLayerId, layerName]);

    return {
        editingLayerId,
        setEditingLayerId,
        layerName,
        setLayerName,
        editInputRef,
        startEditing,
        saveLayerName,
        getLayerDisplayName,
        truncateName
    };
};
