
import { useState } from "react";
import { PropertyPanel } from "./PropertyPanel";
import { LayersPanel } from "./LayersPanel";
import { ElementsPanel } from "./ElementsPanel";
import { Timeline } from "./Timeline";
import { CanvasProvider } from "./CanvasContext";
import { CanvasControls } from "./CanvasControls";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { useCanvas } from "./CanvasContext";

const CanvasContent = () => {
  const [showLayers, setShowLayers] = useState(false);
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

  return (
    <div className="flex flex-1">
      {/* Left Sidebar */}
      <div className="w-14 bg-white border-r flex flex-col items-center pt-4 space-y-4">
        <div className={`sidebar-item ${!showLayers ? 'active' : ''}`} onClick={() => setShowLayers(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className={`sidebar-item ${showLayers ? 'active' : ''}`} onClick={() => setShowLayers(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="sidebar-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="sidebar-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Elements Panel */}
      <div className="w-64 bg-white border-r flex flex-col">
        {showLayers ? (
          <LayersPanel 
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            removeElement={removeElement}
          />
        ) : (
          <ElementsPanel 
            addElement={handleAddElement}
            addLayout={handleAddLayout}
          />
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <CanvasControls />
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
          <PropertyPanel 
            selectedElement={selectedElement}
            updateElementStyle={updateElementStyle}
            updateElementContent={updateElementContent}
          />
        </div>
      </div>

      {/* Timeline */}
      <Timeline 
        elements={elements} 
        currentTime={currentTime} 
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        setCurrentTime={setCurrentTime}
        updateAnimations={updateAnimations}
        setSelectedElement={setSelectedElement}
      />
    </div>
  );
};

export const Canvas = () => {
  return (
    <CanvasProvider>
      <CanvasContent />
    </CanvasProvider>
  );
};
