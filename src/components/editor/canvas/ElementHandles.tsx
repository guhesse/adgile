
import { EditorElement } from "../types";

interface ElementHandlesProps {
  element: EditorElement;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
}

export const ElementHandles = ({ element, handleResizeStart }: ElementHandlesProps) => {
  // Definir estilo consistente para manipuladores
  const handleStyle = {
    width: '10px', 
    height: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    border: '2px solid #4299e1',
    position: 'absolute' as const,
    zIndex: 10,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
    pointerEvents: 'all' as const,
    cursor: 'pointer'
  };

  // Usar stopPropagation para evitar que eventos de clique se propaguem
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    handleResizeStart(e, direction, element);
  };

  return (
    <>
      {/* Norte */}
      <div 
        className="resize-handle resize-handle-n" 
        onMouseDown={(e) => handleMouseDown(e, 'n')}
        style={{
          ...handleStyle,
          cursor: 'n-resize',
          top: '-5px',
          left: 'calc(50% - 5px)',
        }}
      />
      
      {/* Leste */}
      <div 
        className="resize-handle resize-handle-e" 
        onMouseDown={(e) => handleMouseDown(e, 'e')}
        style={{
          ...handleStyle,
          cursor: 'e-resize',
          top: 'calc(50% - 5px)',
          right: '-5px',
        }}
      />
      
      {/* Sul */}
      <div 
        className="resize-handle resize-handle-s" 
        onMouseDown={(e) => handleMouseDown(e, 's')}
        style={{
          ...handleStyle,
          cursor: 's-resize',
          bottom: '-5px',
          left: 'calc(50% - 5px)',
        }}
      />
      
      {/* Oeste */}
      <div 
        className="resize-handle resize-handle-w" 
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        style={{
          ...handleStyle,
          cursor: 'w-resize',
          top: 'calc(50% - 5px)',
          left: '-5px',
        }}
      />
      
      {/* Noroeste */}
      <div 
        className="resize-handle resize-handle-nw" 
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
        style={{
          ...handleStyle,
          cursor: 'nw-resize',
          top: '-5px',
          left: '-5px',
        }}
      />
      
      {/* Nordeste */}
      <div 
        className="resize-handle resize-handle-ne" 
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
        style={{
          ...handleStyle,
          cursor: 'ne-resize',
          top: '-5px',
          right: '-5px',
        }}
      />
      
      {/* Sudeste */}
      <div 
        className="resize-handle resize-handle-se" 
        onMouseDown={(e) => handleMouseDown(e, 'se')}
        style={{
          ...handleStyle,
          cursor: 'se-resize',
          bottom: '-5px',
          right: '-5px',
        }}
      />
      
      {/* Sudoeste */}
      <div 
        className="resize-handle resize-handle-sw" 
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
        style={{
          ...handleStyle,
          cursor: 'sw-resize',
          bottom: '-5px',
          left: '-5px',
        }}
      />
    </>
  );
};
