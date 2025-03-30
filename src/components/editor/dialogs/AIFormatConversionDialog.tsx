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
import { Maximize, Check, ArrowRight, Brain, Columns, Rows } from "lucide-react";
import { getSimilarFormats } from "@/utils/formatGenerator";
import { BannerSize, EditorElement } from "@/components/editor/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useCanvas } from "@/components/editor/CanvasContext";
import { generateRandomId } from "@/components/editor/utils/idGenerator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [useHorizontalLayout, setUseHorizontalLayout] = useState(true);
  const [useResponsiveText, setUseResponsiveText] = useState(true);
  
  const { 
    elements, 
    setElements, 
    addCustomSize, 
    selectedSize 
  } = useCanvas();
  
  useEffect(() => {
    if (currentFormat) {
      // Get more recommended formats based on the current format dimensions
      const similarFormats = getSimilarFormats(currentFormat.width, currentFormat.height);
      
      // Add more format options for testing
      const additionalFormats: BannerSize[] = [
        { name: "Facebook Story", width: 1080, height: 1920 },
        { name: "LinkedIn Post", width: 1200, height: 627 },
        { name: "Pinterest Pin", width: 1000, height: 1500 },
        { name: "YouTube Thumbnail", width: 1280, height: 720 },
        { name: "Twitter Header", width: 1500, height: 500 },
        { name: "Email Banner", width: 600, height: 200 },
        { name: "Billboard", width: 970, height: 250 },
        { name: "Medium Rectangle", width: 300, height: 250 }
      ];
      
      // Filter out formats that might be duplicates
      const allFormats = [...similarFormats];
      
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
    setSelectedFormats([...recommendedFormats]);
  };
  
  const handleUnselectAll = () => {
    setSelectedFormats([]);
  };
  
  const calculateResponsiveTextSize = (
    originalFontSize: number,
    sourceFormat: BannerSize,
    targetFormat: BannerSize
  ): number => {
    if (!useResponsiveText) return originalFontSize;
    
    // Base the scaling primarily on width for horizontal formats
    // and height for vertical formats
    const isSourceHorizontal = sourceFormat.width > sourceFormat.height;
    const isTargetHorizontal = targetFormat.width > targetFormat.height;
    
    let scaleFactor = 1;
    
    if (isSourceHorizontal && isTargetHorizontal) {
      // Both horizontal - scale primarily based on width
      scaleFactor = (targetFormat.width / sourceFormat.width) * 0.8 + 
                   (targetFormat.height / sourceFormat.height) * 0.2;
    } else if (!isSourceHorizontal && !isTargetHorizontal) {
      // Both vertical - scale primarily based on height
      scaleFactor = (targetFormat.height / sourceFormat.height) * 0.8 + 
                   (targetFormat.width / sourceFormat.width) * 0.2;
    } else {
      // Mixed orientations - use a balanced approach
      scaleFactor = (targetFormat.width / sourceFormat.width) * 0.5 + 
                   (targetFormat.height / sourceFormat.height) * 0.5;
    }
    
    // Apply limits to prevent too small or too large text
    const minFontSize = 12;
    const maxFactor = 1.8;
    const minFactor = 0.6;
    
    // Constrain scale factor
    scaleFactor = Math.max(minFactor, Math.min(maxFactor, scaleFactor));
    
    // Calculate and round new font size
    let newFontSize = Math.round(originalFontSize * scaleFactor);
    
    // Ensure minimum readable size
    newFontSize = Math.max(minFontSize, newFontSize);
    
    return newFontSize;
  };
  
  const generateNewElementForFormat = (originalElement: EditorElement, targetFormat: BannerSize): EditorElement => {
    // Generate a new unique ID for each new element
    const newId = `${originalElement.type}-${targetFormat.name.toLowerCase().replace(/\s+/g, '-')}-${generateRandomId()}`;
    
    // For this example, we'll use a smart algorithm to position elements based on format dimensions
    // In a real implementation, this would use AI predictions from a trained model
    
    // Clone the original element but generate new position and size
    const widthRatio = targetFormat.width / currentFormat.width;
    const heightRatio = targetFormat.height / currentFormat.height;
    
    // Determine orientations
    const isSourceHorizontal = currentFormat.width > currentFormat.height;
    const isTargetHorizontal = targetFormat.width > targetFormat.height;
    const isOrientationChange = isSourceHorizontal !== isTargetHorizontal;
    
    // Base positioning categories
    const isHeaderElement = originalElement.style.y < currentFormat.height * 0.25;
    const isFooterElement = originalElement.style.y > currentFormat.height * 0.7;
    const isCenterElement = !isHeaderElement && !isFooterElement;
    
    // Determine if element is on left/right side
    const isLeftElement = originalElement.style.x < currentFormat.width * 0.33;
    const isRightElement = originalElement.style.x > currentFormat.width * 0.66;
    const isMiddleHElement = !isLeftElement && !isRightElement;
    
    // Base sizing (use different scaling for different format types)
    let newWidth = originalElement.style.width;
    let newHeight = originalElement.style.height;
    let newX = originalElement.style.x;
    let newY = originalElement.style.y;
    
    // Different rules for different element types
    if (originalElement.type === 'text') {
      // Calculate a responsive font size based on the format change
      const newFontSize = calculateResponsiveTextSize(
        originalElement.style.fontSize || 16, 
        currentFormat, 
        targetFormat
      );
      
      // Text elements should maintain reasonable size for readability
      if (isTargetHorizontal && useHorizontalLayout) {
        // In horizontal layouts, we want to maintain column structure
        if (isLeftElement) {
          // Keep left column text on the left
          newX = targetFormat.width * 0.05;
          newWidth = targetFormat.width * 0.45;
        } else if (isRightElement) {
          // Keep right column text on the right
          newX = targetFormat.width * 0.55;
          newWidth = targetFormat.width * 0.4;
        } else {
          // Center text stays centered
          newX = (targetFormat.width - newWidth * widthRatio) / 2;
          newWidth = newWidth * widthRatio;
        }
      } else if (isOrientationChange) {
        // Handle orientation change differently
        newWidth = Math.min(targetFormat.width * 0.8, originalElement.style.width * widthRatio);
        
        // Center horizontally
        newX = (targetFormat.width - newWidth) / 2;
      } else {
        // Standard scaling
        newWidth = Math.min(targetFormat.width * 0.8, originalElement.style.width * widthRatio);
      }
      
      // Position differently based on original location
      if (isHeaderElement) {
        // Keep header text at the top
        newY = originalElement.style.y * heightRatio;
      } else if (isFooterElement) {
        // Keep footer text at the bottom
        newY = targetFormat.height - (currentFormat.height - originalElement.style.y) * heightRatio;
      } else if (isTargetHorizontal && useHorizontalLayout) {
        // In horizontal layouts, vertically center within the column
        newY = targetFormat.height * 0.3;
      } else {
        // Center content vertically with relative positioning
        const relativeY = originalElement.style.y / currentFormat.height;
        newY = relativeY * targetFormat.height;
      }
      
      // Special handling for different text sizes
      if (originalElement.style.fontSize && originalElement.style.fontSize > 24) {
        // This is likely a heading or title - make it more prominent
        if (isTargetHorizontal) {
          newY = Math.min(newY, targetFormat.height * 0.4);
        } else {
          newY = Math.min(newY, targetFormat.height * 0.3);
        }
      }
      
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        linkedElementId: null, // No linking to other elements
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          fontSize: newFontSize,
          // Remove percentage values so elements stay fixed in their own format
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        }
      };
    } else if (originalElement.type === 'image') {
      // Images should maintain aspect ratio
      const aspectRatio = originalElement.style.width / originalElement.style.height;
      
      // Size differently based on format change
      if (isTargetHorizontal && useHorizontalLayout) {
        // In horizontal layouts, try to maintain a column structure
        if (isRightElement) {
          // If image was on right side, keep it there
          newX = targetFormat.width * 0.55;
          newWidth = targetFormat.width * 0.4;
          newHeight = newWidth / aspectRatio;
          
          // Vertically center the image
          newY = (targetFormat.height - newHeight) / 2;
        } else {
          // Width constraint
          newWidth = Math.min(targetFormat.width * 0.45, originalElement.style.width * widthRatio);
          newHeight = newWidth / aspectRatio;
          
          // Position on left if it was left originally
          newX = isLeftElement ? targetFormat.width * 0.05 : (targetFormat.width - newWidth) / 2;
          newY = (targetFormat.height - newHeight) / 2;
        }
      } else if (widthRatio < heightRatio) {
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
      } else if (!isTargetHorizontal || !useHorizontalLayout) {
        // Default position centers the image for non-horizontal layouts
        newX = (targetFormat.width - newWidth) / 2;
      }
      
      // Background images or banners should stay at the top
      if (isHeaderElement && originalElement.style.width > currentFormat.width * 0.7) {
        newY = 0;
      } else if (!isTargetHorizontal || !useHorizontalLayout) {
        // Default position is based on relative positioning
        const relativeY = originalElement.style.y / currentFormat.height;
        newY = relativeY * targetFormat.height;
      }
      
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        linkedElementId: null,
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        }
      };
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
        newY = targetFormat.height - newHeight - 20;
      } else if (isTargetHorizontal && useHorizontalLayout && isRightElement) {
        // In horizontal layouts with column structure, put button on bottom of right column
        newY = targetFormat.height * 0.7;
        newX = targetFormat.width * 0.7;
      } else {
        const relativeY = originalElement.style.y / currentFormat.height;
        newY = relativeY * targetFormat.height;
      }
      
      // Center buttons horizontally if not in column layout
      if (!isTargetHorizontal || !useHorizontalLayout || !isRightElement) {
        newX = (targetFormat.width - newWidth) / 2;
      }
      
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        linkedElementId: null,
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        }
      };
    } else {
      // Default scaling for other element types
      newWidth = originalElement.style.width * widthRatio;
      newHeight = originalElement.style.height * heightRatio;
      
      // Maintain relative positioning
      const relativeX = originalElement.style.x / currentFormat.width;
      const relativeY = originalElement.style.y / currentFormat.height;
      
      newX = relativeX * targetFormat.width;
      newY = relativeY * targetFormat.height;
      
      // Ensure elements don't go outside the canvas
      newX = Math.max(0, Math.min(newX, targetFormat.width - newWidth));
      newY = Math.max(0, Math.min(newY, targetFormat.height - newHeight));
      
      return {
        ...originalElement,
        id: newId,
        sizeId: targetFormat.name,
        linkedElementId: null,
        style: {
          ...originalElement.style,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          xPercent: undefined,
          yPercent: undefined,
          widthPercent: undefined,
          heightPercent: undefined
        }
      };
    }
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
          // Generate a completely new independent element for this format
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
          
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium mb-3">Configurações de conversão</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Columns className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="horizontal-layout">Usar layout em colunas para formatos horizontais</Label>
                </div>
                <Switch 
                  id="horizontal-layout" 
                  checked={useHorizontalLayout} 
                  onCheckedChange={setUseHorizontalLayout}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rows className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="responsive-text">Aplicar tamanhos de texto responsivos</Label>
                </div>
                <Switch 
                  id="responsive-text" 
                  checked={useResponsiveText} 
                  onCheckedChange={setUseResponsiveText}
                />
              </div>
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
