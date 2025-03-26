
import { useState } from "react";
import PropertyPanel from "./PropertyPanel";
import { CanvasControls } from "./CanvasControls";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { useCanvas } from "./CanvasContext";
import { LeftSidebar } from "./LeftSidebar";
import { PSDImport } from "./PSDImport";
import { EditorMode } from "./types";

interface CanvasProps {
  editorMode: EditorMode;
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
    selectedSize,
    activeSizes
  } = useCanvas();

  // Add state to control orientation indicator
  const [showOrientationHelp, setShowOrientationHelp] = useState(false);
  
  // Determine if the selected size has vertical orientation
  const isVerticalLayout = selectedSize && selectedSize.height > selectedSize.width;

  // Toggle orientation help
  const toggleOrientationHelp = () => {
    setShowOrientationHelp(!showOrientationHelp);
  };

  return (
    <div className="flex flex-1">
      {/* Left Sidebar with Elements and Layers Panel */}
      <LeftSidebar editorMode={editorMode} />

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <div className="flex items-center space-x-4">
            <CanvasControls />
            
            {/* Orientation indicator */}
            <button 
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                isVerticalLayout 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              onClick={toggleOrientationHelp}
              title={isVerticalLayout ? "Formato Vertical" : "Formato Horizontal"}
            >
              {isVerticalLayout ? "Vertical" : "Horizontal"}
            </button>
            
            {/* Multiple sizes indicator - shows how many active sizes exist */}
            {activeSizes.length > 1 && (
              <div className="text-xs text-gray-500">
                {activeSizes.length} tamanhos ativos
              </div>
            )}
          </div>
          <PSDImport />
        </div>
        
        {/* Orientation help tooltip */}
        {showOrientationHelp && (
          <div className="bg-gray-800 text-white p-3 text-xs max-w-md mx-auto mt-2 rounded-md shadow-lg">
            <p className="font-semibold mb-1">
              {isVerticalLayout 
                ? "Formato Vertical" 
                : "Formato Horizontal"}
            </p>
            <p className="mb-2">
              {isVerticalLayout 
                ? "Elementos no topo são posicionados à esquerda em layouts horizontais." 
                : "Elementos à esquerda são posicionados no topo em layouts verticais."}
            </p>
            <p>
              {isVerticalLayout 
                ? "Elementos na parte inferior são posicionados à direita em layouts horizontais." 
                : "Elementos à direita são posicionados na parte inferior em layouts verticais."}
            </p>
          </div>
        )}
        
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
