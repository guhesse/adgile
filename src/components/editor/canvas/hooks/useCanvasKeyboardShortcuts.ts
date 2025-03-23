
import { useEffect } from 'react';
import { CanvasNavigationMode, EditorElement } from '../../types';

interface UseCanvasKeyboardShortcutsProps {
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: (mode: CanvasNavigationMode) => void;
  selectedElement: EditorElement | null;
  removeElement: (elementId: string) => void;
  undo: () => void;
  updateElementStyle?: (property: string, value: any) => void;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if editing a text field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't handle keyboard shortcuts when meta key (Command on Mac, Ctrl on Windows) is pressed
      // to avoid interfering with browser shortcuts (except for Undo)
      if (e.metaKey || e.ctrlKey) {
        // Handle undo with Command/Ctrl+Z
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        }
        return;
      }

      // Toggle canvas mode with Spacebar
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        setCanvasNavMode(canvasNavMode === 'edit' ? 'pan' : 'edit');
      }

      // Delete selected element with Delete or Backspace
      if (selectedElement && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        removeElement(selectedElement.id);
      }

      // Use arrow keys to move selected element
      if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const shiftKey = e.shiftKey;
        const step = shiftKey ? 10 : 1;
        
        // Move the entire element
        if (updateElementStyle) {
          const currentX = selectedElement.style.x;
          const currentY = selectedElement.style.y;
          
          switch (e.key) {
            case 'ArrowLeft':
              updateElementStyle('x', currentX - step);
              break;
            case 'ArrowRight':
              updateElementStyle('x', currentX + step);
              break;
            case 'ArrowUp':
              updateElementStyle('y', currentY - step);
              break;
            case 'ArrowDown':
              updateElementStyle('y', currentY + step);
              break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasNavMode, setCanvasNavMode, selectedElement, removeElement, undo, updateElementStyle]);
};
