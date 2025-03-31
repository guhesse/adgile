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
import { Split, Cpu, Maximize, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface CanvasProps {
  editorMode: EditorMode;
  fixedSize?: BannerSize;
  canvasRef?: React.RefObject<HTMLDivElement>;
  hideImportPSD?: boolean;
  onPSDImport?: (elements: any[], psdSize: BannerSize) => void;
}

// Function to determine orientation based on dimensions
const getOrientationFromDimensions = (width: number, height: number): 'vertical' | 'horizontal' | 'square' => {
  const ratio = width / height;
  if (ratio > 1.05) return 'horizontal';
  if (ratio < 0.95) return 'vertical';
  return 'square';
};

interface NewOrientationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSize: BannerSize | null;
  onCreateNewOrientation: (newSize: BannerSize) => void;
}

const NewOrientationDialog = ({ 
  open, 
  onOpenChange, 
  currentSize, 
  onCreateNewOrientation 
}: NewOrientationDialogProps) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal" | "square">("horizontal");

  // Reset form when dialog opens
  useEffect(() => {
    if (open && currentSize) {
      // If we have a current vertical size, suggest a horizontal one (and vice versa)
      if (currentSize.orientation === 'vertical') {
        setOrientation('horizontal');
        // Swap dimensions as a suggestion
        setWidth(currentSize.height.toString());
        setHeight(currentSize.width.toString());
        setName(`${currentSize.name} (Horizontal)`);
      } else if (currentSize.orientation === 'horizontal') {
        setOrientation('vertical');
        // Swap dimensions as a suggestion
        setWidth(currentSize.height.toString());
        setHeight(currentSize.width.toString());
        setName(`${currentSize.name} (Vertical)`);
      } else {
        // For square, just use the same dimensions but allow selection of orientation
        setWidth(currentSize.width.toString());
        setHeight(currentSize.height.toString());
        setName(`${currentSize.name} (Alternativo)`);
      }
    } else {
      // Default values if no current size
      setName("");
      setWidth("");
      setHeight("");
      setOrientation("horizontal");
    }
  }, [open, currentSize]);

  const handleCreate = () => {
    if (!name || !width || !height) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newWidth = parseInt(width);
    const newHeight = parseInt(height);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
      toast.error("Dimensões inválidas");
      return;
    }

    // We'll use the selected orientation rather than calculating it
    // This gives the user more control
    const newSize: BannerSize = {
      name,
      width: newWidth,
      height: newHeight,
      orientation
    };

    onCreateNewOrientation(newSize);
    onOpenChange(false);
  };

  // Calculate the actual orientation based on the dimensions
  const calculatedOrientation = getOrientationFromDimensions(
    parseInt(width) || 0, 
    parseInt(height) || 0
  );

  // Check if the selected orientation doesn't match calculated
  const orientationMismatch = orientation !== calculatedOrientation && width && height;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar nova orientação</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">Largura (px)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">Altura (px)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orientation" className="text-right">Orientação</Label>
            <Select
              value={orientation}
              onValueChange={(value) => setOrientation(value as any)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a orientação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="square">Quadrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orientationMismatch && (
            <div className="col-span-4 text-amber-500 text-sm">
              Atenção: As dimensões informadas sugerem uma orientação {calculatedOrientation}, 
              diferente da selecionada ({orientation}).
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleCreate}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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

  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [showStartProjectDialog, setShowStartProjectDialog] = useState(!selectedSize);
  const [showNewOrientationDialog, setShowNewOrientationDialog] = useState(false);
  
  // Function to handle format selection
  const handleSelectFormat = (format: BannerSize) => {
    setSelectedSize(format);
    setShowFormatDialog(false);
  };
  
  // Function to handle PSD import
  const handlePSDImportSelection = () => {
    setShowStartProjectDialog(false);
    // The PSD import component will handle the actual import
  };
  
  // Function to handle format selection from start dialog
  const handleFormatSelectionFromStart = () => {
    setShowStartProjectDialog(false);
    setShowFormatDialog(true);
  };
  
  const handleFormatConversion = (targetFormats: BannerSize[]) => {
    if (!modelState?.trained) {
      toast.error("Modelo de IA ainda não foi treinado");
      return;
    }
    
    // Add the target formats to the active sizes
    targetFormats.forEach(format => {
      addCustomSize(format);
    });
    
    toast.success(`Layouts adaptados para ${targetFormats.length} formatos adicionais`);
  };

  // Function to create a new orientation
  const handleCreateNewOrientation = (newSize: BannerSize) => {
    addCustomSize(newSize);
    toast.success(`Novo formato "${newSize.name}" adicionado com orientação ${newSize.orientation}`);
  };

  // If the start project dialog should be shown
  if (showStartProjectDialog) {
    return (
      <FormatSelectionDialog
        open={showStartProjectDialog}
        onOpenChange={setShowStartProjectDialog}
        onSelectFormat={(format) => {
          handleSelectFormat(format);
          setShowStartProjectDialog(false);
        }}
        onUploadPSD={() => {
          handlePSDImportSelection();
          setShowStartProjectDialog(false);
        }}
      />
    );
  }


  // If there is still no selected size, return null to prevent rendering
  if (!selectedSize) {
    return null;
  }

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
            
            {/* Show new orientation button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowNewOrientationDialog(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Nova Orientação
            </Button>

            {/* Show format conversion button */}
            <AIFormatConversionDialog 
              currentFormat={selectedSize} 
              onConvert={handleFormatConversion}
              isAITrained={modelState?.trained || false}
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

      {/* New Orientation Dialog */}
      <NewOrientationDialog
        open={showNewOrientationDialog}
        onOpenChange={setShowNewOrientationDialog}
        currentSize={selectedSize}
        onCreateNewOrientation={handleCreateNewOrientation}
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
