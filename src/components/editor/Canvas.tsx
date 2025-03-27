
import { useState, useRef, useEffect } from "react";
import PropertyPanel from "./PropertyPanel";
import { CanvasControls } from "./CanvasControls";
import { CanvasWorkspace } from "./CanvasWorkspace";
import { useCanvas } from "./CanvasContext";
import { LeftSidebar } from "./LeftSidebar";
import { PSDImport } from "./PSDImport";
import { BannerSize, EditorMode } from "./types";
import { FormatSelectionDialog } from "./dialogs/FormatSelectionDialog";
import { AIFormatConversionDialog } from "./dialogs/AIFormatConversionDialog";
import { Button } from "@/components/ui/button";
import { Split, Cpu, Maximize } from "lucide-react";
import { toast } from "sonner";

interface CanvasProps {
  editorMode: EditorMode;
  fixedSize?: BannerSize;
  canvasRef?: React.RefObject<HTMLDivElement>;
  hideImportPSD?: boolean;
  onPSDImport?: (elements: any[], psdSize: BannerSize) => void;
}

const CanvasContent = ({ editorMode, canvasRef, hideImportPSD, onPSDImport }: CanvasProps) => {
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
    setSelectedSize,
    activeSizes,
    addCustomSize,
    modelState
  } = useCanvas();

  const [showFormatDialog, setShowFormatDialog] = useState(!selectedSize || selectedSize.name === 'All');
  
  // Effect to show format dialog initially if no size is selected
  useEffect(() => {
    if (!selectedSize || selectedSize.name === 'All') {
      setShowFormatDialog(true);
    }
  }, [selectedSize]);
  
  const handleSelectFormat = (format: BannerSize) => {
    setSelectedSize(format);
    setShowFormatDialog(false);
  };
  
  const handleFormatConversion = (targetFormats: BannerSize[]) => {
    // Add the target formats to the active sizes
    targetFormats.forEach(format => {
      addCustomSize(format);
    });
    
    toast.success(`Layouts adaptados para ${targetFormats.length} formatos adicionais`);
  };

  return (
    <div className="flex flex-1 h-full">
      {/* Left Sidebar with Elements and Layers Panel */}
      <LeftSidebar editorMode={editorMode} />

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col h-full">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <CanvasControls />
          
          <div className="flex items-center gap-2">
            {/* Show PSD import for non-admin mode */}
            {!hideImportPSD && <PSDImport />}
            
            {/* Show format conversion button */}
            <AIFormatConversionDialog 
              currentFormat={selectedSize} 
              onConvert={handleFormatConversion}
              isAITrained={modelState?.trained}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                disabled={!modelState?.trained}
              >
                <Maximize className="h-4 w-4" />
                Desdobrar Formatos
              </Button>
            </AIFormatConversionDialog>
            
            {/* Button to open format selection dialog */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowFormatDialog(true)}
            >
              <Split className="h-4 w-4" />
              Alterar Formato
            </Button>
          </div>
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

      {/* Format Selection Dialog */}
      <FormatSelectionDialog
        open={showFormatDialog}
        onOpenChange={setShowFormatDialog}
        onSelectFormat={handleSelectFormat}
      />
    </div>
  );
};

export const Canvas = ({ editorMode, fixedSize, canvasRef, hideImportPSD, onPSDImport }: CanvasProps) => {
  return (
    <CanvasContent 
      editorMode={editorMode} 
      canvasRef={canvasRef} 
      hideImportPSD={hideImportPSD} 
      onPSDImport={onPSDImport}
    />
  );
};
