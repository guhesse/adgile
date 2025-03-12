
import { useEffect } from 'react';
import { CanvasNavigationMode } from '../../types';

interface UseCanvasKeyboardShortcutsProps {
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: (mode: CanvasNavigationMode) => void;
  selectedElement: any;
  removeElement: (id: string) => void;
}

export const useCanvasKeyboardShortcuts = ({
  canvasNavMode,
  setCanvasNavMode,
  selectedElement,
  removeElement
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

    // Handle delete key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        removeElement(selectedElement.id);
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
  }, [canvasNavMode, setCanvasNavMode, selectedElement, removeElement]);
};
