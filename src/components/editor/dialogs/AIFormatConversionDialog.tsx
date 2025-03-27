
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
  
  const createConvertedElement = (element: EditorElement, targetFormat: BannerSize, sourceFormat: BannerSize): EditorElement => {
    // Create a new ID for the converted element
    const newId = `${element.id}-${targetFormat.name.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Calculate new dimensions and positions based on aspect ratio and scale
    const widthScale = targetFormat.width / sourceFormat.width;
    const heightScale = targetFormat.height / sourceFormat.height;
    
    // Use AI to determine best position (simplified example)
    // In a real implementation, this would use AI model predictions
    let newX, newY, newWidth, newHeight;
    
    // For different element types, handle conversion differently
    if (element.type === 'image') {
      // Images often need to maintain aspect ratio
      const aspectRatio = element.style.width / element.style.height;
      
      // Determine if the image should be centered or positioned relative to edges
      if (element.style.x < sourceFormat.width * 0.2) {
        // Left-aligned element
        newX = element.style.x * widthScale;
      } else if (element.style.x + element.style.width > sourceFormat.width * 0.8) {
        // Right-aligned element
        newX = targetFormat.width - (sourceFormat.width - element.style.x) * widthScale - element.style.width * widthScale;
      } else {
        // Center-aligned horizontally
        newX = (targetFormat.width - element.style.width * widthScale) / 2;
      }
      
      if (element.style.y < sourceFormat.height * 0.2) {
        // Top-aligned element
        newY = element.style.y * heightScale;
      } else if (element.style.y + element.style.height > sourceFormat.height * 0.8) {
        // Bottom-aligned element
        newY = targetFormat.height - (sourceFormat.height - element.style.y) * heightScale - element.style.height * heightScale;
      } else {
        // Center-aligned vertically
        newY = (targetFormat.height - element.style.height * heightScale) / 2;
      }
      
      // Maintain aspect ratio while scaling
      newWidth = element.style.width * Math.min(widthScale, heightScale);
      newHeight = element.style.height * Math.min(widthScale, heightScale);
    } else if (element.type === 'text') {
      // Text elements often need to be adjusted for readability
      if (element.style.x < sourceFormat.width * 0.2) {
        // Left-aligned text
        newX = element.style.x * widthScale;
      } else if (element.style.x + element.style.width > sourceFormat.width * 0.8) {
        // Right-aligned text
        newX = targetFormat.width - (sourceFormat.width - element.style.x) * widthScale - element.style.width * widthScale;
      } else {
        // Center-aligned horizontally
        newX = (targetFormat.width - element.style.width * widthScale) / 2;
      }
      
      // Vertical positioning
      newY = element.style.y * heightScale;
      
      // Adjust width based on content
      newWidth = Math.min(element.style.width * widthScale, targetFormat.width * 0.9);
      newHeight = element.style.height * heightScale;
      
      // Adjust font size for readability in new format
      const fontScaleFactor = Math.min(widthScale, heightScale);
      const newFontSize = element.style.fontSize ? Math.max(12, Math.round(element.style.fontSize * fontScaleFactor)) : undefined;
      
      return {
        ...element,
        id: newId,
        sizeId: targetFormat.name,
        style: {
          ...element.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          fontSize: newFontSize,
          // Use percentage values for future reference but not for direct positioning
          xPercent: (newX / targetFormat.width) * 100,
          yPercent: (newY / targetFormat.height) * 100,
          widthPercent: (newWidth / targetFormat.width) * 100,
          heightPercent: (newHeight / targetFormat.height) * 100
        }
      };
    } else if (element.type === 'button') {
      // Buttons often need to be properly sized and positioned
      // Bottom area is common for buttons
      if (element.style.y > sourceFormat.height * 0.7) {
        newY = targetFormat.height - (sourceFormat.height - element.style.y) * heightScale - element.style.height * heightScale;
      } else {
        newY = element.style.y * heightScale;
      }
      
      // Horizontal positioning
      if (element.style.x < sourceFormat.width * 0.2) {
        newX = element.style.x * widthScale;
      } else if (element.style.x + element.style.width > sourceFormat.width * 0.8) {
        newX = targetFormat.width - (sourceFormat.width - element.style.x) * widthScale - element.style.width * widthScale;
      } else {
        newX = (targetFormat.width - element.style.width * widthScale) / 2;
      }
      
      // Buttons shouldn't be too small or too large
      newWidth = Math.min(Math.max(element.style.width * widthScale, 100), targetFormat.width * 0.5);
      newHeight = Math.min(Math.max(element.style.height * heightScale, 40), targetFormat.height * 0.2);
    } else {
      // Default scaling for other element types
      newX = element.style.x * widthScale;
      newY = element.style.y * heightScale;
      newWidth = element.style.width * widthScale;
      newHeight = element.style.height * heightScale;
    }
    
    // Ensure elements don't go outside the canvas
    newX = Math.max(0, Math.min(newX, targetFormat.width - newWidth));
    newY = Math.max(0, Math.min(newY, targetFormat.height - newHeight));
    
    return {
      ...element,
      id: newId,
      sizeId: targetFormat.name,
      style: {
        ...element.style,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        // Store percentage values for reference
        xPercent: (newX / targetFormat.width) * 100,
        yPercent: (newY / targetFormat.height) * 100,
        widthPercent: (newWidth / targetFormat.width) * 100,
        heightPercent: (newHeight / targetFormat.height) * 100
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
      const currentElements = elements.filter(el => el.sizeId === currentFormat.name);
      
      // Create new elements for each selected format
      const newElements: EditorElement[] = [];
      
      selectedFormats.forEach(targetFormat => {
        // Add the format to active sizes
        addCustomSize(targetFormat);
        
        // Create converted elements for this format
        currentElements.forEach(element => {
          const convertedElement = createConvertedElement(element, targetFormat, currentFormat);
          newElements.push(convertedElement);
        });
      });
      
      // Add all converted elements to the canvas
      setElements(prev => [...prev, ...newElements]);
      
      setOpen(false);
      toast.success(`Layout adaptado para ${selectedFormats.length} formatos com IA`);
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
            disabled={selectedFormats.length === 0 || isProcessing}
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
