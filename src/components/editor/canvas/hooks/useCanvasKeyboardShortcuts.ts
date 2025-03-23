
import { useEffect } from 'react';
import { CanvasNavigationMode, EditorElement } from '../../types';

interface UseCanvasKeyboardShortcutsProps {
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: (mode: CanvasNavigationMode) => void;
  selectedElement: EditorElement | null;
  removeElement: (id: string) => void;
  undo: () => void;
  updateElementStyle?: (property: string, value: any, elementId?: string) => void;
}

export const useCanvasKeyboardShortcuts = ({
  canvasNavMode,
  setCanvasNavMode,
  selectedElement,
  removeElement,
  undo,
  updateElementStyle
}: UseCanvasKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleSpacebarDown = () => {
      if (canvasNavMode !== 'pan') {
        setCanvasNavMode('pan');
      }
    };

    const handleSpacebarUp = () => {
      if (canvasNavMode === 'pan') {
        setCanvasNavMode('edit');
      }
    };

    // Manipular movimento com setas
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!selectedElement || !updateElementStyle) return;
      
      // Ignorar quando o usuário está editando texto ou em algum campo de entrada
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      
      const moveStep = e.shiftKey ? 10 : 1; // Move mais rápido com Shift pressionado
      let moveX = 0;
      let moveY = 0;
      
      switch (e.key) {
        case 'ArrowLeft':
          moveX = -moveStep;
          break;
        case 'ArrowRight':
          moveX = moveStep;
          break;
        case 'ArrowUp':
          moveY = -moveStep;
          break;
        case 'ArrowDown':
          moveY = moveStep;
          break;
        default:
          return; // Não é uma tecla de seta, sair
      }
      
      // Verificar se é uma imagem com objectFit cover e estamos movendo a imagem dentro do container
      if (selectedElement.type === 'image' && 
          selectedElement.style.objectFit === 'cover' && 
          e.altKey) {
        
        e.preventDefault(); // Prevenir comportamento padrão
        
        // Mover a posição da imagem dentro do container
        const currentX = selectedElement.style.objectPositionX ?? 50;
        const currentY = selectedElement.style.objectPositionY ?? 50;
        
        // Limitar valores entre 0 e 100
        const newX = Math.max(0, Math.min(100, currentX + moveX));
        const newY = Math.max(0, Math.min(100, currentY + moveY));
        
        if (moveX !== 0) {
          updateElementStyle("objectPositionX", newX, selectedElement.id);
        }
        
        if (moveY !== 0) {
          updateElementStyle("objectPositionY", newY, selectedElement.id);
        }
      } else {
        e.preventDefault(); // Prevenir rolagem da página
        
        // Mover a posição do elemento no canvas
        const currentX = selectedElement.style.x;
        const currentY = selectedElement.style.y;
        
        if (moveX !== 0) {
          updateElementStyle("x", currentX + moveX, selectedElement.id);
        }
        
        if (moveY !== 0) {
          updateElementStyle("y", currentY + moveY, selectedElement.id);
        }
      }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace to remove selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        // Ignorar quando o usuário está editando texto
        if (
          document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }
        
        removeElement(selectedElement.id);
      }
      
      // Ctrl+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); // Prevent browser's default undo
        console.log("Undo shortcut triggered");
        undo();
      }
      
      // Arrow keys to move elements
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        handleArrowKeys(e);
      }
    };

    document.addEventListener('canvas-spacebar-down', handleSpacebarDown);
    document.addEventListener('canvas-spacebar-up', handleSpacebarUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('canvas-spacebar-down', handleSpacebarDown);
      document.removeEventListener('canvas-spacebar-up', handleSpacebarUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasNavMode, setCanvasNavMode, selectedElement, removeElement, undo, updateElementStyle]);
};
