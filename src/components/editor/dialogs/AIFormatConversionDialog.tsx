
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
import { generateRandomId } from "@/components/editor/utils/idGenerator";

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
  
  // Determine orientation based on aspect ratio
  const determineOrientation = (width: number, height: number): 'vertical' | 'horizontal' | 'square' => {
    const ratio = width / height;
    if (ratio > 1.2) return 'horizontal';
    if (ratio < 0.8) return 'vertical';
    return 'square';
  };
  
  useEffect(() => {
    if (currentFormat) {
      // Add orientation to currentFormat if not already set
      const currentOrientation = currentFormat.orientation || determineOrientation(currentFormat.width, currentFormat.height);
      const currentFormatWithOrientation: BannerSize = {
        ...currentFormat,
        orientation: currentOrientation
      };
      
      // Get more recommended formats based on the current format dimensions
      const similarFormats = getSimilarFormats(currentFormat.width, currentFormat.height);
      
      // Add orientation to all formats
      const formatsWithOrientation = similarFormats.map(format => ({
        ...format,
        orientation: determineOrientation(format.width, format.height)
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
        { name: "Medium Rectangle", width: 300, height: 250, orientation: 'square' }
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
    setSelectedFormats([...recommendedFormats]);
  };
  
  const handleUnselectAll = () => {
    setSelectedFormats([]);
  };
  
  // Improved function to generate elements for different format orientations
  const generateNewElementForFormat = (originalElement: EditorElement, targetFormat: BannerSize, sourceFormat: BannerSize): EditorElement => {
    // Generate a new unique ID for each new element
    const newId = `${originalElement.type}-${targetFormat.name.toLowerCase().replace(/\s+/g, '-')}-${generateRandomId()}`;
    
    // Determine orientations with fallbacks
    const sourceOrientation = sourceFormat.orientation || determineOrientation(sourceFormat.width, sourceFormat.height);
    const targetOrientation = targetFormat.orientation || determineOrientation(targetFormat.width, targetFormat.height);
    
    // Handle orientation change - especially vertical to horizontal conversion
    const isOrientationChange = sourceOrientation !== targetOrientation;
    
    // Clone the original element
    let newWidth = originalElement.style.width;
    let newHeight = originalElement.style.height;
    let newX = originalElement.style.x;
    let newY = originalElement.style.y;
    
    // Calculate aspect ratios and scaling factors
    const widthRatio = targetFormat.width / sourceFormat.width;
    const heightRatio = targetFormat.height / sourceFormat.height;
    
    // Determine relative positions in source format (as percentages)
    const relativeX = originalElement.style.x / sourceFormat.width;
    const relativeY = originalElement.style.y / sourceFormat.height;
    const relativeRight = (originalElement.style.x + originalElement.style.width) / sourceFormat.width;
    const relativeBottom = (originalElement.style.y + originalElement.style.height) / sourceFormat.height;
    
    // Check if element is in top, middle, or bottom third of source
    const isTopThird = relativeY < 0.33;
    const isMiddleThird = relativeY >= 0.33 && relativeY < 0.66;
    const isBottomThird = relativeY >= 0.66;
    
    // Check if element is in left, center, or right third of source
    const isLeftThird = relativeX < 0.33;
    const isCenterThird = relativeX >= 0.33 && relativeX < 0.66;
    const isRightThird = relativeX >= 0.66;
    
    // Check element size relative to canvas
    const isLargeElement = originalElement.style.width > sourceFormat.width * 0.5 || 
                          originalElement.style.height > sourceFormat.height * 0.5;
    
    // Special handling for vertical to horizontal conversion
    if (sourceOrientation === 'vertical' && targetOrientation === 'horizontal') {
      // Different strategies based on element type
      if (originalElement.type === 'text') {
        // Adjust font size for text elements when changing orientation
        const fontSizeRatio = Math.min(widthRatio, heightRatio) * 0.85; // Reduce slightly to avoid overflow
        const newFontSize = originalElement.style.fontSize ? originalElement.style.fontSize * fontSizeRatio : undefined;
        
        // Keep text elements proportionally sized
        newWidth = Math.min(originalElement.style.width * widthRatio * 0.8, targetFormat.width * 0.7);
        
        // Position text by logical zones
        if (isTopThird) {
          // Top text goes to top area
          newY = targetFormat.height * 0.1;
          newX = targetFormat.width * 0.05;
        } else if (isMiddleThird) {
          // Middle text is centered
          newY = (targetFormat.height - newHeight) / 2;
          newX = targetFormat.width * 0.05;
        } else {
          // Bottom text stays at bottom
          newY = targetFormat.height * 0.75;
          newX = targetFormat.width * 0.05;
        }
        
        // Return the updated text element with adjusted font size
        return {
          ...originalElement,
          id: newId,
          sizeId: targetFormat.name,
          linkedElementId: undefined,
          style: {
            ...originalElement.style,
            x: newX,
            y: newY,
            width: newWidth,
            height: originalElement.style.height * heightRatio,
            fontSize: newFontSize,
            xPercent: undefined,
            yPercent: undefined,
            widthPercent: undefined,
            heightPercent: undefined
          }
        };
      } 
      else if (originalElement.type === 'image') {
        // For images in vertical to horizontal conversion
        const aspectRatio = originalElement.style.width / originalElement.style.height;
        
        if (isLargeElement) {
          // Large hero images need special treatment
          // Make image fill the right side of the horizontal format
          newWidth = targetFormat.width * 0.6;
          newHeight = newWidth / aspectRatio;
          
          // Position on the right side
          newX = targetFormat.width * 0.4;
          newY = (targetFormat.height - newHeight) / 2;
          
          // If image is too tall, adjust height and center vertically
          if (newHeight > targetFormat.height * 1.2) {
            newHeight = targetFormat.height * 1.2;
            newWidth = newHeight * aspectRatio;
            newY = (targetFormat.height - newHeight) / 2;
          }
        } else {
          // Smaller images
          newWidth = originalElement.style.width * widthRatio * 0.5;
          newHeight = newWidth / aspectRatio;
          
          // Position based on original location
          if (isTopThird) {
            newY = targetFormat.height * 0.1;
          } else if (isMiddleThird) {
            newY = (targetFormat.height - newHeight) / 2;
          } else {
            newY = targetFormat.height - newHeight - (targetFormat.height * 0.1);
          }
          
          newX = targetFormat.width * 0.6;
        }
        
        // Make sure image doesn't extend too far beyond canvas (allow slight overflow for visual impact)
        if (newY + newHeight > targetFormat.height * 1.2) {
          newY = targetFormat.height - newHeight;
        }
      }
      else if (originalElement.type === 'button') {
        // Buttons maintain a reasonable size
        newWidth = Math.min(targetFormat.width * 0.3, originalElement.style.width * widthRatio);
        newHeight = Math.min(targetFormat.height * 0.12, originalElement.style.height * heightRatio);
        
        // Position buttons based on original position
        if (isBottomThird) {
          // Bottom buttons stay at bottom
          newY = targetFormat.height - newHeight - (targetFormat.height * 0.1);
          newX = targetFormat.width * 0.05;
        } else {
          // Other buttons get positioned in the left zone
          newY = targetFormat.height * 0.6;
          newX = targetFormat.width * 0.05;
        }
      }
      else {
        // Default handling for other element types
        newWidth = originalElement.style.width * widthRatio * 0.5;
        newHeight = originalElement.style.height * heightRatio;
        newX = targetFormat.width * 0.1;
        newY = targetFormat.height * 0.1;
      }
    }
    // Horizontal to vertical conversion
    else if (sourceOrientation === 'horizontal' && targetOrientation === 'vertical') {
      // Stack elements vertically
      if (originalElement.type === 'text') {
        // Scale text appropriately
        const fontSizeRatio = Math.min(widthRatio, heightRatio);
        const newFontSize = originalElement.style.fontSize ? originalElement.style.fontSize * fontSizeRatio : undefined;
        
        // Adjust width to fit vertical format
        newWidth = Math.min(targetFormat.width * 0.9, originalElement.style.width * widthRatio);
        
        // Position based on original horizontal position
        if (isLeftThird) {
          newY = targetFormat.height * 0.1;
        } else if (isCenterThird) {
          newY = targetFormat.height * 0.3;
        } else {
          newY = targetFormat.height * 0.5;
        }
        
        // Center horizontally
        newX = (targetFormat.width - newWidth) / 2;
        
        // Return the updated text element
        return {
          ...originalElement,
          id: newId,
          sizeId: targetFormat.name,
          linkedElementId: undefined,
          style: {
            ...originalElement.style,
            x: newX,
            y: newY,
            width: newWidth,
            height: originalElement.style.height * heightRatio,
            fontSize: newFontSize,
            xPercent: undefined,
            yPercent: undefined,
            widthPercent: undefined,
            heightPercent: undefined
          }
        };
      }
      else if (originalElement.type === 'image') {
        // For images in horizontal to vertical conversion
        const aspectRatio = originalElement.style.width / originalElement.style.height;
        
        if (isLargeElement) {
          // Make image fit width with proportional height
          newWidth = targetFormat.width;
          newHeight = newWidth / aspectRatio;
          newX = 0;
          
          // Position image in top half
          newY = targetFormat.height * 0.3;
        } else {
          // Smaller images
          newWidth = targetFormat.width * 0.8;
          newHeight = newWidth / aspectRatio;
          
          // Center horizontally
          newX = (targetFormat.width - newWidth) / 2;
          
          // Position in top half
          newY = targetFormat.height * 0.2;
        }
      }
      else if (originalElement.type === 'button') {
        // Buttons maintain proper size
        newWidth = Math.min(targetFormat.width * 0.7, originalElement.style.width * widthRatio);
        newHeight = Math.min(targetFormat.height * 0.07, originalElement.style.height * heightRatio);
        
        // Position at bottom
        newY = targetFormat.height * 0.85;
        newX = (targetFormat.width - newWidth) / 2;
      }
      else {
        // Default handling for other element types
        newWidth = originalElement.style.width * widthRatio;
        newHeight = originalElement.style.height * heightRatio;
        newX = (targetFormat.width - newWidth) / 2;
        newY = targetFormat.height * 0.5;
      }
    }
    // Similar orientation (just scaling)
    else {
      // When orientations match, use simpler scaling logic
      if (originalElement.type === 'text') {
        // Scale text with format
        const fontSizeRatio = Math.min(widthRatio, heightRatio);
        const newFontSize = originalElement.style.fontSize ? originalElement.style.fontSize * fontSizeRatio : undefined;
        
        // Maintain relative position
        newX = relativeX * targetFormat.width;
        newY = relativeY * targetFormat.height;
        newWidth = originalElement.style.width * widthRatio;
        
        // Return the updated text element
        return {
          ...originalElement,
          id: newId,
          sizeId: targetFormat.name,
          linkedElementId: undefined,
          style: {
            ...originalElement.style,
            x: newX,
            y: newY,
            width: newWidth,
            height: originalElement.style.height * heightRatio,
            fontSize: newFontSize,
            xPercent: undefined,
            yPercent: undefined,
            widthPercent: undefined,
            heightPercent: undefined
          }
        };
      }
      else if (originalElement.type === 'image') {
        // Maintain aspect ratio for images
        const aspectRatio = originalElement.style.width / originalElement.style.height;
        
        // Scale proportionally
        if (widthRatio < heightRatio) {
          newWidth = originalElement.style.width * widthRatio;
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = originalElement.style.height * heightRatio;
          newWidth = newHeight * aspectRatio;
        }
        
        // Maintain relative position
        newX = relativeX * targetFormat.width;
        newY = relativeY * targetFormat.height;
      }
      else {
        // Standard scaling for other elements
        newWidth = originalElement.style.width * widthRatio;
        newHeight = originalElement.style.height * heightRatio;
        newX = relativeX * targetFormat.width;
        newY = relativeY * targetFormat.height;
      }
    }
    
    // Ensure elements remain within canvas (with small margin)
    const margin = 0;
    newX = Math.max(margin * -1, Math.min(newX, targetFormat.width - newWidth - margin));
    newY = Math.max(margin * -1, Math.min(newY, targetFormat.height - newHeight - margin));
    
    // Create the new element with calculated dimensions
    return {
      ...originalElement,
      id: newId,
      sizeId: targetFormat.name,
      linkedElementId: undefined,
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
  };
  
  const handleConvert = async () => {
    if (selectedFormats.length === 0) {
      toast.error("Selecione pelo menos um formato para converter");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get elements for the current format
      const currentElements = elements.filter(el => 
        el.sizeId === currentFormat.name
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
        
        // Add orientation if missing
        const targetFormatWithOrientation: BannerSize = {
          ...targetFormat,
          orientation: targetFormat.orientation || determineOrientation(targetFormat.width, targetFormat.height)
        };
        
        // Current format with orientation
        const sourceFormatWithOrientation: BannerSize = {
          ...currentFormat,
          orientation: currentFormat.orientation || determineOrientation(currentFormat.width, currentFormat.height)
        };
        
        // Create new elements for this format based on the current elements
        currentElements.forEach(element => {
          // Generate a completely new independent element for this format
          const newElement = generateNewElementForFormat(
            element, 
            targetFormatWithOrientation,
            sourceFormatWithOrientation
          );
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
                {currentFormat.orientation ? ` - ${currentFormat.orientation}` : ''}
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
                          {format.orientation ? ` - ${format.orientation}` : ''}
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
