
import { useState } from "react";
import PropertyPanel from "./PropertyPanel";
import { CanvasControls } from "./CanvasControls";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { useCanvas } from "./CanvasContext";
import { LeftSidebar } from "./LeftSidebar";
import { PSDImport } from "./PSDImport";
import { OrientationIndicator } from "./utils/OrientationIndicator";

interface CanvasProps {
  editorMode: "email" | "banner";
}

const CanvasContent = ({ editorMode }: CanvasProps) => {
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
    updateAnimations,
    selectedSize
  } = useCanvas();

  // Determine if the current format is horizontal or vertical
  const isHorizontal = selectedSize.width > selectedSize.height;

  return (
    <div className="flex flex-1">
      {/* Left Sidebar with Elements and Layers Panel */}
      <LeftSidebar editorMode={editorMode} />

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <CanvasControls />
          <OrientationIndicator isHorizontal={isHorizontal} />
          <PSDImport />
        </div>
        <CanvasWorkspace />
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
};

export const Canvas = ({ editorMode }: CanvasProps) => {
  return (
    <CanvasContent editorMode={editorMode} />
  );
};
