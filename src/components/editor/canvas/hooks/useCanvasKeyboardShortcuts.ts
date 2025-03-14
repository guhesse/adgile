
import { useEffect } from 'react';
import { CanvasNavigationMode } from '../../types';

interface UseCanvasKeyboardShortcutsProps {
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: (mode: CanvasNavigationMode) => void;
  selectedElement: any;
  removeElement: (id: string) => void;
  undo: () => void;
}

export const useCanvasKeyboardShortcuts = ({
  canvasNavMode,
  setCanvasNavMode,
  selectedElement,
  removeElement,
  undo
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

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace to remove selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        removeElement(selectedElement.id);
      }
      
      // Ctrl+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); // Prevent browser's default undo
        console.log("Undo shortcut triggered");
        undo();
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
  }, [canvasNavMode, setCanvasNavMode, selectedElement, removeElement, undo]);
};
