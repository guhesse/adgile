
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useCanvas } from "../CanvasContext";
import { AdminDraggableElement } from "./AdminDraggableElement";
import { ElementRender } from "../elements/ElementRender";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { BannerSize } from "../types";

interface AdminCanvasWorkspaceProps {
  fixedSize: BannerSize;
}

export const AdminCanvasWorkspace = forwardRef(({ fixedSize }: AdminCanvasWorkspaceProps, ref) => {
  const { 
    elements,
    selectedElement,
    setSelectedElement,
    updateElementStyle,
    zoomLevel,
    setZoomLevel
  } = useCanvas();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({
    width: fixedSize.width,
    height: fixedSize.height,
    scale: 1,
    left: 0,
    top: 0
  });
  
  // Expose elements to parent components
  useImperativeHandle(ref, () => ({
    elements
  }));
  
  // Observer para ajustar o canvas ao tamanho do container
  useResizeObserver(containerRef, (entry) => {
    const { width, height } = entry.contentRect;
    setContainerSize({ width, height });
  });
  
  // Calcular a escala para o canvas
  useEffect(() => {
    if (containerRef.current && containerSize.width > 0) {
      const containerWidth = containerSize.width;
      const containerHeight = containerSize.height;
      
      // Calcular a escala mantendo a proporção
      const scaleX = (containerWidth - 60) / fixedSize.width;
      const scaleY = (containerHeight - 60) / fixedSize.height;
      const scale = Math.min(scaleX, scaleY, 1); // Limitar a 100%
      
      // Centralizar o canvas
      const left = (containerWidth - (fixedSize.width * scale)) / 2;
      const top = (containerHeight - (fixedSize.height * scale)) / 2;
      
      setCanvasSize({
        width: fixedSize.width,
        height: fixedSize.height,
        scale,
        left,
        top
      });
    }
  }, [containerSize, fixedSize.width, fixedSize.height, zoomLevel]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Só desselecione se o clique foi diretamente no canvas, não em um elemento
    if (e.currentTarget === e.target) {
      setSelectedElement(null);
    }
  };
  
  // Estilo para o container do workspace
  const workspaceStyle = {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    overflow: 'auto' as const,
  };
  
  // Estilo para o canvas
  const canvasStyle = {
    position: 'absolute' as const,
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    transform: `scale(${canvasSize.scale * zoomLevel})`,
    transformOrigin: '0 0',
    left: `${canvasSize.left}px`,
    top: `${canvasSize.top}px`,
    background: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    overflow: 'hidden' as const
  };

  return (
    <div ref={containerRef} style={workspaceStyle} className="bg-gray-100">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-md shadow-md p-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.1))}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            -
          </button>
          <div className="text-sm">
            {Math.round(zoomLevel * 100)}%
          </div>
          <button 
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>
      
      <div 
        style={canvasStyle} 
        onClick={handleCanvasClick}
        className="canvas-content"
      >
        {elements.map((element) => (
          <AdminDraggableElement 
            key={element.id} 
            element={element}
            isSelected={selectedElement?.id === element.id}
            onClick={() => setSelectedElement(element)}
            onPositionChange={(position) => 
              updateElementStyle(element.id, { 
                left: position.left, 
                top: position.top 
              })
            }
            onResize={(size) => 
              updateElementStyle(element.id, { 
                width: size.width, 
                height: size.height 
              })
            }
            scale={canvasSize.scale * zoomLevel}
          />
        ))}
      </div>
    </div>
  );
});

AdminCanvasWorkspace.displayName = "AdminCanvasWorkspace";
