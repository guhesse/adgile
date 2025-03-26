
import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import PropertyPanel from "./PropertyPanel";
import { CanvasControls } from "./CanvasControls";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { useCanvas } from "./CanvasContext";
import { LeftSidebar } from "./LeftSidebar";
import { PSDImport } from "./PSDImport";
import { BannerSize, EditorMode } from "./types";
import { AdminCanvasWorkspace } from "./admin/AdminCanvasWorkspace";

interface CanvasProps {
  editorMode: EditorMode; // Changed to use the EditorMode type
  fixedSize?: BannerSize;
  className?: string;
}

const CanvasContent = forwardRef(({ editorMode, fixedSize, className }: CanvasProps, ref) => {
  const { 
    elements, 
    selectedElement, 
    setSelectedElement,
    removeElement, 
    updateElementStyle,
    updateElementContent,
    handleAddElement,
    handleAddLayout,
    currentTime,
    isPlaying,
    togglePlayPause,
    setCurrentTime,
    updateAnimations
  } = useCanvas();

  // Pass the elements up to any component that needs them
  useImperativeHandle(ref, () => ({
    elements
  }));

  // Admin workspace ref
  const adminWorkspaceRef = useRef<any>(null);

  return (
    <div className={`flex flex-1 h-full ${className || ''}`}>
      {/* Left Sidebar with Elements and Layers Panel */}
      <LeftSidebar editorMode={editorMode} />

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col h-full">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <CanvasControls />
          <PSDImport />
        </div>
        
        {fixedSize ? (
          <AdminCanvasWorkspace fixedSize={fixedSize} ref={adminWorkspaceRef} />
        ) : (
          <CanvasWorkspace />
        )}
      </div>

      {/* Right Properties Panel */}
      <div className="w-72 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">
            {selectedElement ? (
              selectedElement.type === 'text' ? 'Texto' :
              selectedElement.type === 'image' ? 'Imagem' :
              selectedElement.type === 'button' ? 'Botão' : 
              selectedElement.type === 'layout' ? 'Layout' : 'Propriedades'
            ) : 'Propriedades'}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <PropertyPanel />
        </div>
      </div>

      {/* Timeline - Currently disabled */}
      {/* 
      <Timeline 
        elements={elements} 
        currentTime={currentTime} 
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        setCurrentTime={setCurrentTime}
        updateAnimations={updateAnimations}
        setSelectedElement={setSelectedElement}
      /> 
      */}
    </div>
  );
});

CanvasContent.displayName = "CanvasContent";

export const Canvas = forwardRef<{ elements: any[] }, CanvasProps>(({ editorMode, fixedSize, className }, ref) => {
  return (
    <CanvasContent editorMode={editorMode} fixedSize={fixedSize} className={className} ref={ref} />
  );
});

Canvas.displayName = "Canvas";
