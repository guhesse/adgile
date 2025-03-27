import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cpu, Maximize, Check, ArrowRight, Brain } from "lucide-react";
import { getSimilarFormats } from "@/utils/formatGenerator";
import { BannerSize, EditorElement } from "@/components/editor/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCanvas } from "@/components/editor/CanvasContext";

interface AIFormatConversionDialogProps {
  currentFormat: BannerSize;
  onConvert: (targetFormats: BannerSize[]) => void;
  isAITrained?: boolean;
  children?: React.ReactNode;
}

export const AIFormatConversionDialog = ({
  currentFormat,
  onConvert,
  isAITrained = false,
  children
}: AIFormatConversionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<BannerSize[]>([]);
  const [recommendedFormats, setRecommendedFormats] = useState<BannerSize[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    elements, 
    setElements, 
    addCustomSize, 
    selectedSize 
  } = useCanvas();
  
  useEffect(() => {
    if (currentFormat) {
      // Get recommended formats based on the current format dimensions
      setRecommendedFormats(getSimilarFormats(currentFormat.width, currentFormat.height));
    }
  }, [currentFormat]);
  
  const handleToggleFormat = (format: BannerSize) => {
    setSelectedFormats(prev => {
      // Check if the format is already selected
      const isSelected = prev.some(f => 
        f.name === format.name && f.width === format.width && f.height === format.height
      );
      
      if (isSelected) {
        // Remove the format
        return prev.filter(f => 
          !(f.name === format.name && f.width === format.width && f.height === format.height)
        );
      } else {
        // Add the format
        return [...prev, format];
      }
    });
  };
  
  const handleSelectAll = () => {
    setSelectedFormats([...recommendedFormats]);
  };
  
  const handleUnselectAll = () => {
    setSelectedFormats([]);
  };
  
  const generateNewElementForFormat = (originalElement: EditorElement, targetFormat: BannerSize): EditorElement => {
    const newId = `${originalElement.id}-${targetFormat.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // For this example, we'll use a simple algorithm to position elements based on format dimensions
    // In a real implementation, this would use AI predictions from a trained model
    
    // Clone the original element but generate new position and size
    const widthRatio = targetFormat.width / currentFormat.width;
    const heightRatio = targetFormat.height / currentFormat.height;
    
    // Base positioning categories
    const isHeaderElement = originalElement.style.y < currentFormat.height * 0.2;
    const isFooterElement = originalElement.style.y > currentFormat.height * 0.7;
    const isCenterElement = !isHeaderElement && !isFooterElement;
    
    // Base sizing (use different scaling for different format types)
    let newWidth = originalElement.style.width;
    let newHeight = originalElement.style.height;
    let newX = originalElement.style.x;
    let newY = originalElement.style.y;
    
    // Different rules for different element types
    if (originalElement.type === 'text') {
      // Text elements should maintain reasonable size for readability
      newWidth = Math.min(targetFormat.width * 0.8, originalElement.style.width * widthRatio);
      
      // Position differently based on original location
      if (isHeaderElement) {
        // Keep header text at the top
        newY = originalElement.style.y * heightRatio;
      } else if (isFooterElement) {
        // Keep footer text at the bottom
        newY = targetFormat.height - (currentFormat.height - originalElement.style.y) * heightRatio;
      } else {
        // Center content vertically with relative positioning
        const relativeY = originalElement.style.y / currentFormat.height;
        newY = relativeY * targetFormat.height;
      }
      
      // Horizontal positioning
      if (originalElement.style.x < currentFormat.width * 0.3) {
        // Keep left alignment
        newX = originalElement.style.x * widthRatio;
      } else if (originalElement.style.x > currentFormat.width * 0.7) {
        // Keep right alignment
        newX = targetFormat.width - (currentFormat.width - originalElement.style.x) * widthRatio;
      } else {
        // Center horizontally
        newX = (targetFormat.width - newWidth) / 2;
      }
    } else if (originalElement.type === 'image') {
      // Images should maintain aspect ratio
      const aspectRatio = originalElement.style.width / originalElement.style.height;
      
      // Size differently based on format change
      if (widthRatio < heightRatio) {
        // Width constraint
        newWidth = Math.min(targetFormat.width * 0.9, originalElement.style.width * widthRatio);
        newHeight = newWidth / aspectRatio;
      } else {
        // Height constraint
        newHeight = Math.min(targetFormat.height * 0.9, originalElement.style.height * heightRatio);
        newWidth = newHeight * aspectRatio;
      }
      
      // Images taking up the entire width should stay that way
      if (originalElement.style.width > currentFormat.width * 0.9) {
        newWidth = targetFormat.width;
        newHeight = newWidth / aspectRatio;
        newX = 0;
      } else {
        // Default position centers the image
        newX = (targetFormat.width - newWidth) / 2;
      }
      
      // Background images or banners should stay at the top
      if (isHeaderElement && originalElement.style.width > currentFormat.width * 0.7) {
        newY = 0;
      } else {
        // Default position is based on relative positioning
        const relativeY = originalElement.style.y / currentFormat.height;
        newY = relativeY * targetFormat.height;
      }
    } else if (originalElement.type === 'button') {
      // Buttons should have reasonable sizes
      newWidth = Math.min(
        Math.max(originalElement.style.width * widthRatio, 120), 
        targetFormat.width * 0.6
      );
      newHeight = Math.min(
        Math.max(originalElement.style.height * heightRatio, 40),
        targetFormat.height * 0.1
      );
      
      // Buttons often at the bottom
      if (isFooterElement) {
        newY = targetFormat.height - (currentFormat.height - originalElement.style.y) * heightRatio;
      } else {
        const relativeY = originalElement.style.y / currentFormat.height;
        newY = relativeY * targetFormat.height;
      }
      
      // Center buttons horizontally
      newX = (targetFormat.width - newWidth) / 2;
    } else {
      // Default scaling for other element types
      newWidth = originalElement.style.width * widthRatio;
      newHeight = originalElement.style.height * heightRatio;
      
      // Maintain relative positioning
      const relativeX = originalElement.style.x / currentFormat.width;
      const relativeY = originalElement.style.y / currentFormat.height;
      
      newX = relativeX * targetFormat.width;
      newY = relativeY * targetFormat.height;
    }
    
    // Ensure elements don't go outside the canvas
    newX = Math.max(0, Math.min(newX, targetFormat.width - newWidth));
    newY = Math.max(0, Math.min(newY, targetFormat.height - newHeight));
    
    // Create a new element with the calculated dimensions for this format
    return {
      ...originalElement,
      id: newId,
      sizeId: targetFormat.name,
      linkedElementId: null, // Important: don't link elements across formats
      style: {
        ...originalElement.style,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        // We're creating independent elements, so we don't need percentage values
      }
    };
  };
  
  const handleConvert = async () => {
    if (selectedFormats.length === 0) {
      toast.error("Selecione pelo menos um formato para converter");
      return;
    }
    
    if (!currentFormat || !isAITrained) {
      toast.error("Modelo de IA não treinado ou formato atual não definido");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get elements for the current format
      const currentElements = elements.filter(el => 
        el.sizeId === currentFormat.name || el.sizeId === 'global'
      );
      
      if (currentElements.length === 0) {
        toast.error("Não há elementos no formato atual para converter");
        setIsProcessing(false);
        return;
      }
      
      // Create new elements for each selected format
      const newElements: EditorElement[] = [];
      
      selectedFormats.forEach(targetFormat => {
        // Add the format to active sizes
        addCustomSize(targetFormat);
        
        // Create new elements for this format based on the current elements
        currentElements.forEach(element => {
          // Generate a new element with AI-informed positioning for this format
          const newElement = generateNewElementForFormat(element, targetFormat);
          newElements.push(newElement);
        });
        
        toast.info(`Criando layout para ${targetFormat.name}`);
      });
      
      // Add all new elements to the canvas
      setElements(prev => [...prev, ...newElements]);
      
      setOpen(false);
      toast.success(`${newElements.length} elementos criados em ${selectedFormats.length} novos formatos`);
    } catch (error) {
      console.error("Error converting formats:", error);
      toast.error("Ocorreu um erro ao converter os formatos");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const isFormatSelected = (format: BannerSize) => {
    return selectedFormats.some(f => 
      f.name === format.name && f.width === format.width && f.height === format.height
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2" disabled={!isAITrained}>
            <Maximize className="h-4 w-4" />
            Desdobrar Formatos
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Adaptar layout para outros formatos com IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-medium">Formato atual</h3>
              <p className="text-xs text-gray-500">
                {currentFormat.name} ({currentFormat.width} × {currentFormat.height}px)
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleUnselectAll}>
                Limpar seleção
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Selecionar todos
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-3 gap-4">
            {recommendedFormats.map((format, index) => (
              <Card 
                key={`${format.name}-${index}`}
                className={`cursor-pointer transition-all ${
                  isFormatSelected(format) ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => handleToggleFormat(format)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <Checkbox
                    checked={isFormatSelected(format)}
                    onCheckedChange={() => handleToggleFormat(format)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">{format.name}</h4>
                        <p className="text-xs text-gray-500">
                          {format.width} × {format.height}px
                        </p>
                      </div>
                      {isFormatSelected(format) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <div className="mt-3 aspect-[4/3] bg-gray-50 rounded border flex items-center justify-center relative">
                      <div 
                        className="bg-gray-200 rounded"
                        style={{
                          width: '70%',
                          height: '70%',
                          aspectRatio: `${format.width}/${format.height}`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {(!isAITrained || recommendedFormats.length === 0) && (
            <div className="mt-4 bg-amber-50 p-4 rounded-md">
              <p className="text-amber-800 text-sm">
                {!isAITrained ? (
                  'O modelo de IA precisa ser treinado antes de usar esta funcionalidade. Vá para o painel de administração para treinar o modelo.'
                ) : (
                  'Não foi possível encontrar formatos recomendados para o layout atual.'
                )}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleConvert} 
            disabled={selectedFormats.length === 0 || isProcessing || !isAITrained}
            className="gap-2"
          >
            {isProcessing ? (
              'Processando...'
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Adaptar para {selectedFormats.length} formato{selectedFormats.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
