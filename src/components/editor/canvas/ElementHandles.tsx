
import { EditorElement } from "../types";

interface ElementHandlesProps {
  element: EditorElement;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
}

export const ElementHandles = ({ element, handleResizeStart }: ElementHandlesProps) => {
  return (
    <>
      <div 
        className="resize-handle resize-handle-n" 
        onMouseDown={(e) => handleResizeStart(e, 'n', element)}
        style={{ cursor: 'n-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-e" 
        onMouseDown={(e) => handleResizeStart(e, 'e', element)}
        style={{ cursor: 'e-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-s" 
        onMouseDown={(e) => handleResizeStart(e, 's', element)}
        style={{ cursor: 's-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-w" 
        onMouseDown={(e) => handleResizeStart(e, 'w', element)}
        style={{ cursor: 'w-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-nw" 
        onMouseDown={(e) => handleResizeStart(e, 'nw', element)}
        style={{ cursor: 'nw-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-ne" 
        onMouseDown={(e) => handleResizeStart(e, 'ne', element)}
        style={{ cursor: 'ne-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-se" 
        onMouseDown={(e) => handleResizeStart(e, 'se', element)}
        style={{ cursor: 'se-resize', width: '12px', height: '12px' }}
      ></div>
      <div 
        className="resize-handle resize-handle-sw" 
        onMouseDown={(e) => handleResizeStart(e, 'sw', element)}
        style={{ cursor: 'sw-resize', width: '12px', height: '12px' }}
      ></div>
    </>
  );
};
