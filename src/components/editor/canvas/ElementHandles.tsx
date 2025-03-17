
import { EditorElement } from "../types";

interface ElementHandlesProps {
  element: EditorElement;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
}

export const ElementHandles = ({ element, handleResizeStart }: ElementHandlesProps) => {
  // Define uma função para criar handles com um estilo consistente
  const handleStyle = {
    width: '12px', 
    height: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    border: '2px solid #4299e1',
    position: 'absolute' as const,
    zIndex: 10,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
    pointerEvents: 'all' as const
  };

  return (
    <>
      {/* Norte */}
      <div 
        className="resize-handle resize-handle-n" 
        onMouseDown={(e) => handleResizeStart(e, 'n', element)}
        style={{
          ...handleStyle,
          cursor: 'n-resize',
          top: '-6px',
          left: 'calc(50% - 6px)',
        }}
      />
      
      {/* Leste */}
      <div 
        className="resize-handle resize-handle-e" 
        onMouseDown={(e) => handleResizeStart(e, 'e', element)}
        style={{
          ...handleStyle,
          cursor: 'e-resize',
          top: 'calc(50% - 6px)',
          right: '-6px',
        }}
      />
      
      {/* Sul */}
      <div 
        className="resize-handle resize-handle-s" 
        onMouseDown={(e) => handleResizeStart(e, 's', element)}
        style={{
          ...handleStyle,
          cursor: 's-resize',
          bottom: '-6px',
          left: 'calc(50% - 6px)',
        }}
      />
      
      {/* Oeste */}
      <div 
        className="resize-handle resize-handle-w" 
        onMouseDown={(e) => handleResizeStart(e, 'w', element)}
        style={{
          ...handleStyle,
          cursor: 'w-resize',
          top: 'calc(50% - 6px)',
          left: '-6px',
        }}
      />
      
      {/* Noroeste */}
      <div 
        className="resize-handle resize-handle-nw" 
        onMouseDown={(e) => handleResizeStart(e, 'nw', element)}
        style={{
          ...handleStyle,
          cursor: 'nw-resize',
          top: '-6px',
          left: '-6px',
        }}
      />
      
      {/* Nordeste */}
      <div 
        className="resize-handle resize-handle-ne" 
        onMouseDown={(e) => handleResizeStart(e, 'ne', element)}
        style={{
          ...handleStyle,
          cursor: 'ne-resize',
          top: '-6px',
          right: '-6px',
        }}
      />
      
      {/* Sudeste */}
      <div 
        className="resize-handle resize-handle-se" 
        onMouseDown={(e) => handleResizeStart(e, 'se', element)}
        style={{
          ...handleStyle,
          cursor: 'se-resize',
          bottom: '-6px',
          right: '-6px',
        }}
      />
      
      {/* Sudoeste */}
      <div 
        className="resize-handle resize-handle-sw" 
        onMouseDown={(e) => handleResizeStart(e, 'sw', element)}
        style={{
          ...handleStyle,
          cursor: 'sw-resize',
          bottom: '-6px',
          left: '-6px',
        }}
      />
    </>
  );
};
