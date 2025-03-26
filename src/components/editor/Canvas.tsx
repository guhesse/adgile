
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
            
            {/* Orientation indicator with improved styling */}
            <button 
              className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                isVerticalLayout 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
              }`}
              onClick={toggleOrientationHelp}
              title={isVerticalLayout ? "Formato Vertical" : "Formato Horizontal"}
            >
              {isVerticalLayout ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-4-4l4 4 4-4" />
                  </svg>
                  <span>Vertical</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-4 4l4-4-4-4" />
                  </svg>
                  <span>Horizontal</span>
                </>
              )}
            </button>
            
            {/* Multiple sizes indicator - shows how many active sizes exist */}
            {activeSizes.length > 1 && (
              <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                <span>{activeSizes.length} tamanhos ativos</span>
              </div>
            )}
          </div>
          <PSDImport />
        </div>
        
        {/* Orientation help tooltip com exemplos mais detalhados */}
        {showOrientationHelp && (
          <div className="bg-gray-800 text-white p-4 max-w-md mx-auto mt-2 rounded-md shadow-lg z-10">
            <h3 className="font-semibold mb-2 text-sm">
              {isVerticalLayout 
                ? "Formato Vertical → Horizontal" 
                : "Formato Horizontal → Vertical"}
            </h3>
            
            <ul className="text-xs space-y-2">
              <li className="flex items-start">
                <span className="text-purple-300 mr-2">•</span>
                {isVerticalLayout 
                  ? "Elementos no topo da imagem são posicionados à esquerda em layouts horizontais" 
                  : "Elementos à esquerda são posicionados no topo em layouts verticais"}
              </li>
              <li className="flex items-start">
                <span className="text-purple-300 mr-2">•</span>
                {isVerticalLayout 
                  ? "Elementos na parte inferior são posicionados à direita em layouts horizontais" 
                  : "Elementos à direita são posicionados na parte inferior em layouts verticais"}
              </li>
              <li className="flex items-start">
                <span className="text-purple-300 mr-2">•</span>
                {isVerticalLayout 
                  ? "Textos são redimensionados para maior legibilidade no formato horizontal" 
                  : "Textos são ajustados para ocupar a largura disponível no formato vertical"}
              </li>
              <li className="flex items-start">
                <span className="text-purple-300 mr-2">•</span>
                {isVerticalLayout 
                  ? "Imagens mantêm proporção e são distribuídas nos lados esquerdo/direito" 
                  : "Imagens mantêm proporção e são distribuídas nos espaços superior/inferior"}
              </li>
              <li className="flex items-start">
                <span className="text-purple-300 mr-2">•</span>
                {isVerticalLayout 
                  ? "CTAs (botões) são posicionados estrategicamente conforme seu local original" 
                  : "CTAs (botões) são posicionados no final do layout vertical quando possível"}
              </li>
            </ul>
            
            <div className="pt-2 mt-2 border-t border-gray-600 text-xs text-gray-400">
              Dica: Ajuste manualmente os elementos após a conversão para resultados otimizados.
            </div>
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
    </div>
  );
};

export const Canvas = ({ editorMode }: CanvasProps) => {
  return (
    <CanvasContent editorMode={editorMode} />
  );
};
