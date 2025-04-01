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
import { refineLayouts } from '@/utils/api/refinement';

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
        newWidth = Math.min(targetFormat.width * 1, originalElement.style.width * widthRatio);
        newHeight = newWidth / aspectRatio;
      } else {
        // Height constraint
        newHeight = Math.min(targetFormat.height * 1, originalElement.style.height * heightRatio);
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
      
      // Otimiza os elementos para reduzir o tamanho do payload
      const optimizedElements = currentElements.map(el => ({
        id: el.id,
        type: el.type,
        content: el.type === 'image' ? (
          // Para imagens grandes, apenas envie uma referência em vez do data URL completo
          el.content.startsWith('data:image') && el.content.length > 1000 
            ? 'image-data-url' 
            : el.content
        ) : el.content,
        style: el.style,
        sizeId: el.sizeId,
        // Remova propriedades desnecessárias para o refinamento
        animation: undefined,
        columns: el.columns,
      }));
      
      // Prepare data to send to the API
      const layoutData = {
        currentFormat,
        elements: optimizedElements,
        targetFormats: selectedFormats
      };
      
      console.log('Enviando dados para refinamento:', JSON.stringify(layoutData).substring(0, 200) + '...');
      
      // Criar toast único para acompanhamento do progresso
      const toastId = "refinement-progress-toast";
      
      // Mostrar uma mensagem inicial de progresso
      const formatNames = selectedFormats.map(f => f.name).join(', ');
      toast.loading(`Iniciando adaptação dos formatos: ${formatNames}`, {
        id: toastId,
        duration: Infinity
      });
      
      // Call the API to refine layouts
      const refinedLayouts = await refineLayouts(layoutData);
      
      console.log('Layouts refinados recebidos:', refinedLayouts);
      
      // Add refined layouts to the canvas
      if (refinedLayouts && Array.isArray(refinedLayouts)) {
        // Adicionar todos os formatos alvo ao Canvas
        selectedFormats.forEach(format => {
          addCustomSize(format);
        });
        
        // Processar os elementos de cada layout refinado
        const newElements = [];
        const totalLayouts = refinedLayouts.length;
        
        for (let i = 0; i < refinedLayouts.length; i++) {
          const layout = refinedLayouts[i];
          
          // Atualizar o toast com o progresso detalhado
          toast.loading(`Processando ${i+1}/${totalLayouts}: ${layout.format.name} (${layout.format.width}×${layout.format.height})`, {
            id: toastId
          });
          
          // Garantir que o formato está adicionado ao canvas
          const format = layout.format;
          
          // Processar os elementos deste layout
          const layoutElements = layout.elements.map(el => {
            // Restaurar conteúdo das imagens se necessário
            if (el.type === 'image' && el.content === 'image-data-url') {
              // Encontrar o elemento original com essa ID para obter o data URL
              const originalElement = currentElements.find(orig => 
                orig.id === el.originalId || orig.id === el.id.replace(`-${format.name.toLowerCase().replace(/\s+/g, '-')}`, '')
              );
              
              if (originalElement) {
                return {
                  ...el,
                  content: originalElement.content
                };
              }
            }
            
            // Garantir que todas as propriedades necessárias estão presentes
            return {
              ...el,
              sizeId: format.name, // Garantir que o sizeId está definido corretamente
              // Remover potenciais propriedades undefined ou null
              style: {
                ...el.style,
                // Garantir valores numéricos para coordenadas e dimensões
                x: typeof el.style.x === 'number' ? el.style.x : 0,
                y: typeof el.style.y === 'number' ? el.style.y : 0,
                width: typeof el.style.width === 'number' ? el.style.width : 100,
                height: typeof el.style.height === 'number' ? el.style.height : 100,
              }
            };
          });
          
          newElements.push(...layoutElements);
          
          // Pequena pausa para garantir que o usuário veja o progresso de cada formato
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log(`Adicionando ${newElements.length} novos elementos ao canvas`);
        
        // Adicionar todos os elementos de uma vez
        setElements(prev => [...prev, ...newElements]);
        
        // Remover o toast de carregamento e mostrar sucesso com detalhes
        toast.success(`Layouts refinados com sucesso: ${refinedLayouts.map(l => l.format.name).join(', ')}`, {
          id: toastId,
          duration: 5000 // Deixar visível por 5 segundos
        });
        
        setOpen(false);
      } else {
        toast.error("Resposta inválida do servidor", {
          id: toastId
        });
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error("Erro ao refinar layouts:", error);
      // Atualizar o toast de carregamento para mostrar o erro
      toast.error(`Ocorreu um erro ao refinar os layouts: ${error.message || 'Erro desconhecido'}`, {
        id: "refinement-progress-toast"
      });
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
              <>
                <span className="animate-pulse">Processando</span>
                <span className="animate-pulse">...</span>
              </>
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
