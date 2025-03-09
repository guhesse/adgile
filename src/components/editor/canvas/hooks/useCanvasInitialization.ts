
import { useEffect } from 'react';
import { EditorElement } from '../../types';

interface UseCanvasInitializationProps {
  elements: EditorElement[];
  organizeElements: () => void;
}

export const useCanvasInitialization = ({ 
  elements, 
  organizeElements 
}: UseCanvasInitializationProps) => {
  useEffect(() => {
    if (elements.length > 0) {
      organizeElements();
    }
  }, []);
};
