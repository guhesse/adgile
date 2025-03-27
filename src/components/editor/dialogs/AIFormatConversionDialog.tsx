
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
import { BannerSize } from "@/components/editor/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  const handleConvert = async () => {
    if (selectedFormats.length === 0) {
      toast.error("Selecione pelo menos um formato para converter");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onConvert(selectedFormats);
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
