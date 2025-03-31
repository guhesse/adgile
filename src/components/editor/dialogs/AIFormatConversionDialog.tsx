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
import { Cpu, Maximize, Check, ArrowRight, Brain, AlertTriangle } from "lucide-react";
import { getSimilarFormats } from "@/utils/formatGenerator";
import { BannerSize, EditorElement } from "@/components/editor/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCanvas } from "@/components/editor/CanvasContext";
import { generateRandomId } from "@/components/editor/utils/idGenerator";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AIFormatConversionDialogProps {
  currentFormat: BannerSize;
  onConvert: (targetFormats: BannerSize[]) => void;
  isAITrained?: boolean;
  children?: React.ReactNode;
}

// Helper function to determine the orientation of a format
const getFormatOrientation = (format: BannerSize): 'vertical' | 'horizontal' | 'square' => {
  if (format.orientation) return format.orientation;
  
  const ratio = format.width / format.height;
  if (ratio > 1.05) return 'horizontal';
  if (ratio < 0.95) return 'vertical';
  return 'square';
};

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
  const [showDifferentOrientations, setShowDifferentOrientations] = useState(false);
  const [confirmDifferentOrientation, setConfirmDifferentOrientation] = useState(false);
  
  const { 
    elements, 
    setElements, 
    addCustomSize, 
    selectedSize 
  } = useCanvas();
  
  // Get current format orientation
  const currentOrientation = getFormatOrientation(currentFormat);
  
  useEffect(() => {
    if (currentFormat) {
      // Get more recommended formats based on the current format dimensions
      const similarFormats = getSimilarFormats(currentFormat.width, currentFormat.height);
      
      // Add orientation to each format
      const formatsWithOrientation = similarFormats.map(format => ({
        ...format,
        orientation: getFormatOrientation(format)
      }));
      
      // Add more format options for testing
      const additionalFormats: BannerSize[] = [
        { name: "Facebook Story", width: 1080, height: 1920, orientation: 'vertical' },
        { name: "LinkedIn Post", width: 1200, height: 627, orientation: 'horizontal' },
        { name: "Pinterest Pin", width: 1000, height: 1500, orientation: 'vertical' },
        { name: "YouTube Thumbnail", width: 1280, height: 720, orientation: 'horizontal' },
        { name: "Twitter Header", width: 1500, height: 500, orientation: 'horizontal' },
        { name: "Email Banner", width: 600, height: 200, orientation: 'horizontal' },
        { name: "Billboard", width: 970, height: 250, orientation: 'horizontal' },
        { name: "Medium Rectangle", width: 300, height: 250, orientation: 'horizontal' }
      ];
      
      // Filter out formats that might be duplicates
      const allFormats = [...formatsWithOrientation];
      
      additionalFormats.forEach(format => {
        const isDuplicate = allFormats.some(f => 
          f.name === format.name || 
          (f.width === format.width && f.height === format.height)
        );
        
        if (!isDuplicate) {
          allFormats.push(format);
        }
      });
      
      setRecommendedFormats(allFormats);
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
    // Only select formats with the same orientation by default
    const formatsToSelect = showDifferentOrientations 
      ? recommendedFormats 
      : recommendedFormats.filter(format => getFormatOrientation(format) === currentOrientation);
    
    setSelectedFormats([...formatsToSelect]);
  };
  
  const handleUnselectAll = () => {
    setSelectedFormats([]);
  };
  
  const generateNewElementForFormat = (originalElement: EditorElement, targetFormat: BannerSize): EditorElement => {
    // Generate a new unique ID for each new element
    const newId = `${originalElement.type}-${targetFormat.name.toLowerCase().replace(/\s+/g, '-')}-${generateRandomId()}`;
    
    // Clone the original element but generate new position and size
    const widthRatio = targetFormat.width / currentFormat.width;
    const heightRatio = targetFormat.height / currentFormat.height;
    
    // Start with proportional scaling
    let newWidth = originalElement.style.width * widthRatio;
    let newHeight = originalElement.style.height * heightRatio;
    let newX = originalElement.style.x * widthRatio;
    let newY = originalElement.style.y * heightRatio;
    
    // Different rules for different element types
    if (originalElement.type === 'text') {
      // Adjust text size proportionally but with limits
      const newFontSize = originalElement.style.fontSize 
        ? Math.max(10, Math.min(72, originalElement.style.fontSize * Math.min(widthRatio, heightRatio)))
        : undefined;
      
      // Create a new element with the calculated dimensions for this format
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          fontSize: newFontSize,
          // Remove percentage values since we don't want shared elements
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        },
        linkedElementId: undefined, // Explicitly remove any linking
      };
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
      
      // Center the image if it would overflow
      if (newX + newWidth > targetFormat.width) {
        newX = Math.max(0, (targetFormat.width - newWidth) / 2);
      }
      
      if (newY + newHeight > targetFormat.height) {
        newY = Math.max(0, (targetFormat.height - newHeight) / 2);
      }
      
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          // Remove percentage values
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        },
        linkedElementId: undefined, // Explicitly remove any linking
      };
    } else {
      // Default scaling for other element types
      // Ensure elements don't go outside the canvas
      newX = Math.max(0, Math.min(newX, targetFormat.width - newWidth));
      newY = Math.max(0, Math.min(newY, targetFormat.height - newHeight));
      
      // Create a new element with the calculated dimensions for this format
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          // Remove percentage values
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        },
        linkedElementId: undefined, // Explicitly remove any linking
      };
    }
  };
  
  const handleConvert = async () => {
    if (selectedFormats.length === 0) {
      toast.error("Selecione pelo menos um formato para converter");
      return;
    }
    
    if (!currentFormat) {
      toast.error("Formato atual não definido");
      return;
    }
    
    // Check if there are different orientations selected
    const hasDifferentOrientations = selectedFormats.some(format => 
      getFormatOrientation(format) !== currentOrientation
    );
    
    if (hasDifferentOrientations && !confirmDifferentOrientation) {
      setConfirmDifferentOrientation(true);
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
          // Generate a completely new independent element for this format
          const newElement = generateNewElementForFormat(element, targetFormat);
          newElements.push(newElement);
        });
        
        toast.info(`Criando layout para ${targetFormat.name}`);
      });
      
      // Add all new elements to the canvas
      setElements(prev => [...prev, ...newElements]);
      
      setOpen(false);
      setConfirmDifferentOrientation(false);
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

  // Filter formats based on orientation
  const filteredFormats = showDifferentOrientations 
    ? recommendedFormats 
    : recommendedFormats.filter(format => getFormatOrientation(format) === currentOrientation);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Maximize className="h-4 w-4" />
            Desdobrar Formatos
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Adaptar layout para outros formatos
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-medium">Formato atual</h3>
              <p className="text-xs text-gray-500">
                {currentFormat.name} ({currentFormat.width} × {currentFormat.height}px) - {
                  currentOrientation === 'vertical' ? 'Vertical' : 
                  currentOrientation === 'horizontal' ? 'Horizontal' : 'Quadrado'
                }
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
          
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="show-different-orientations"
              checked={showDifferentOrientations}
              onCheckedChange={setShowDifferentOrientations}
            />
            <Label htmlFor="show-different-orientations">
              Mostrar formatos de orientação diferente
            </Label>
          </div>

          {showDifferentOrientations && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Converter para formatos com orientação diferente pode resultar em layouts com posicionamento inadequado.
                Recomendamos criar um layout específico para cada orientação.
              </AlertDescription>
            </Alert>
          )}
          
          {confirmDifferentOrientation && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Confirmação necessária</AlertTitle>
              <AlertDescription>
                Você selecionou formatos com orientação diferente do formato atual.
                A probabilidade dos layouts não saírem como o esperado é alta.
                Deseja continuar mesmo assim?
              </AlertDescription>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirmDifferentOrientation(false);
                    handleConvert();
                  }}
                >
                  Sim, continuar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDifferentOrientation(false)}
                >
                  Cancelar
                </Button>
              </div>
            </Alert>
          )}
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-3 gap-4">
            {filteredFormats.map((format, index) => (
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
                          <span className="ml-1">
                            ({getFormatOrientation(format) === 'vertical' ? 'Vertical' : 
                              getFormatOrientation(format) === 'horizontal' ? 'Horizontal' : 'Quadrado'})
                          </span>
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
          
          {filteredFormats.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Não há formatos disponíveis com a mesma orientação do formato atual.
              </p>
              <p className="text-gray-500 mt-2">
                Ative "Mostrar formatos de orientação diferente" para ver todos os formatos disponíveis.
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
