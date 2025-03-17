
import { EditorElement } from "../types";

interface ElementHandlesProps {
  element: EditorElement;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
}

export const ElementHandles = ({ element, handleResizeStart }: ElementHandlesProps) => {
  // Define consistent style for handles
  const handleStyle = {
    width: '12px', 
    height: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    border: '2px solid #4299e1',
    position: 'absolute' as const,
    zIndex: 10,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
    pointerEvents: 'all' as const,
    cursor: 'pointer'
  };

  // Use stopPropagation to prevent click events from bubbling
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
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
          top: '-6px',
          left: 'calc(50% - 6px)',
        }}
      />
      
      {/* Leste */}
      <div 
        className="resize-handle resize-handle-e" 
        onMouseDown={(e) => handleMouseDown(e, 'e')}
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
        onMouseDown={(e) => handleMouseDown(e, 's')}
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
        onMouseDown={(e) => handleMouseDown(e, 'w')}
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
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
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
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
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
        onMouseDown={(e) => handleMouseDown(e, 'se')}
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
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
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
