
import { EditorElement } from "../types";

interface ElementHandlesProps {
  element: EditorElement;
  handleResizeStart: (e: React.MouseEvent, direction: string, element: EditorElement) => void;
}

export const ElementHandles = ({ element, handleResizeStart }: ElementHandlesProps) => {
  return (
    <>
      <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n', element)}></div>
      <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e', element)}></div>
      <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's', element)}></div>
      <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w', element)}></div>
      <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw', element)}></div>
      <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne', element)}></div>
      <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se', element)}></div>
      <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw', element)}></div>
    </>
  );
};
