
import { useEffect } from 'react';
import { CanvasNavigationMode } from '../../types';

interface UseCanvasKeyboardShortcutsProps {
  canvasNavMode: CanvasNavigationMode;
  setCanvasNavMode: (mode: CanvasNavigationMode) => void;
}

export const useCanvasKeyboardShortcuts = ({
  canvasNavMode,
  setCanvasNavMode
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

    document.addEventListener('canvas-spacebar-down', handleSpacebarDown);
    document.addEventListener('canvas-spacebar-up', handleSpacebarUp);

    return () => {
      document.removeEventListener('canvas-spacebar-down', handleSpacebarDown);
      document.removeEventListener('canvas-spacebar-up', handleSpacebarUp);
    };
  }, [canvasNavMode, setCanvasNavMode]);
};
