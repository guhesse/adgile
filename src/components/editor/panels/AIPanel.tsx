
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, Loader, Check, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as tf from '@tensorflow/tfjs';
import { BannerSize } from '../types';
import { useCanvas } from '../CanvasContext';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface AIFormatSuggestionProps {
  currentFormat: {
    width: number;
    height: number;
    orientation: string;
  };
  onModelLoaded: (isLoaded: boolean) => void;
}

export const AIFormatSuggestion: React.FC<AIFormatSuggestionProps> = ({ 
  currentFormat,
  onModelLoaded
}) => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [model, setModel] = useState<tf.GraphModel | null>(null);

  useEffect(() => {
    const loadMobileNetModel = async () => {
      if (isModelReady || isModelLoading) return;
      
      try {
        setIsModelLoading(true);
        
        // Load MobileNet model
        await tf.ready();
        const mobileNet = await tf.loadLayersModel(
          'https://storage.googleapis.com/tfjs-models/tfhub/mobilenet_v2_100_224/1/model.json'
        );
        
        setModel(mobileNet);
        setIsModelReady(true);
        onModelLoaded(true);
        console.log("MobileNet model loaded successfully");
        
      } catch (error) {
        console.error("Error loading MobileNet model:", error);
        toast.error("Não foi possível carregar o modelo MobileNet");
      } finally {
        setIsModelLoading(false);
      }
    };

    loadMobileNetModel();
    
    // Cleanup tensor memory when component unmounts
    return () => {
      if (model) {
        try {
          // Clean up tensors
          tf.dispose(model);
        } catch (e) {
          console.error("Error disposing model:", e);
        }
      }
    };
  }, []);
  
  return (
    <div className="space-y-4">
      <Alert variant={isModelReady ? "default" : "warning"}>
        {isModelReady ? (
          <>
            <Check className="h-4 w-4" />
            <AlertTitle>Modelo carregado</AlertTitle>
            <AlertDescription>
              O modelo MobileNet está pronto para uso na análise de layouts.
            </AlertDescription>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Carregando modelo</AlertTitle>
            <AlertDescription>
              {isModelLoading ? 
                "Carregando modelo MobileNet para análise de elementos..." :
                "O modelo de IA ainda não está pronto."}
            </AlertDescription>
          </>
        )}
      </Alert>
      
      <div className="text-sm text-gray-500">
        Formato atual: {currentFormat.width} × {currentFormat.height}px ({currentFormat.orientation})
      </div>
      
      <Button className="w-full" disabled={!isModelReady || isModelLoading}>
        <Sparkles className="mr-2 h-4 w-4" />
        Gerar sugestões de layout
      </Button>
    </div>
  );
};

export const AIPanel = () => {
  // Estado para controlar quando a IA está gerando sugestões
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModelAvailable, setIsModelAvailable] = useState(false);
  const [responsiveMode, setResponsiveMode] = useState<'intelligent' | 'independent'>('independent');
  
  const { selectedSize, activeSizes } = useCanvas();
  
  // Formato atual (da seleção do usuário)
  const currentFormat = {
    width: selectedSize?.width || 1080,
    height: selectedSize?.height || 1920,
    orientation: selectedSize?.orientation || 'vertical'
  };
  
  // Função para gerar sugestões de layout
  const generateLayoutSuggestions = () => {
    setIsGenerating(true);
    // Simulação de processamento de IA
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Sugestões de layout geradas com sucesso!");
    }, 3000);
  };

  const handleModelLoaded = (loaded: boolean) => {
    setIsModelAvailable(loaded);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">
          Sugestões de IA
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Mode Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Modo de Responsividade</CardTitle>
              <CardDescription>
                Selecione como os elementos devem ser tratados em diferentes tamanhos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleGroup 
                type="single" 
                value={responsiveMode} 
                onValueChange={(value) => {
                  if (value) setResponsiveMode(value as 'intelligent' | 'independent');
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="independent" className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Independente
                </ToggleGroupItem>
                <ToggleGroupItem value="intelligent" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Inteligente
                </ToggleGroupItem>
              </ToggleGroup>
              
              <div className="mt-4 text-xs text-gray-500">
                {responsiveMode === 'intelligent' ? (
                  <p>
                    Modo inteligente: Elementos são vinculados entre formatos e se ajustam proporcionalmente.
                  </p>
                ) : (
                  <p>
                    Modo independente: Cada artboard tem seus próprios elementos sem vinculação.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Informações sobre o sistema de IA */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assistente de Layout</CardTitle>
              <CardDescription>
                Use IA para sugerir layouts com base nos seus designs anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIFormatSuggestion 
                currentFormat={currentFormat} 
                onModelLoaded={handleModelLoaded} 
              />
            </CardContent>
          </Card>
          
          {/* Layout References */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Referências de Layout</CardTitle>
              <CardDescription>
                Use templates existentes como referência para novos formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  A IA analisará seus layouts existentes para sugerir posicionamentos ideais
                </div>
                <Button 
                  className="w-full" 
                  onClick={generateLayoutSuggestions}
                  disabled={isGenerating || !isModelAvailable}
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Analisando templates...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar com base em templates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
