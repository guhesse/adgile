
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, Loader, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCanvas } from '../CanvasContext';
import { AIFormatConversionDialog } from '../dialogs/AIFormatConversionDialog';

interface AIFormatSuggestionProps {
  currentFormat: {
    width: number;
    height: number;
    orientation?: 'vertical' | 'horizontal' | 'square';
  };
}

export const AIFormatSuggestion: React.FC<AIFormatSuggestionProps> = ({ currentFormat }) => {
  // Determinar orientação se não estiver definida
  const orientation = currentFormat.orientation || 
                      (currentFormat.width > currentFormat.height ? 'horizontal' : 
                      (currentFormat.width < currentFormat.height ? 'vertical' : 'square'));
                      
  return (
    <div className="space-y-4">
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>IA em treinamento</AlertTitle>
        <AlertDescription>
          O modelo de IA ainda está sendo treinado com seus templates. Adicione mais templates para obter melhores sugestões.
        </AlertDescription>
      </Alert>
      
      <div className="text-sm text-gray-500">
        Formato atual: {currentFormat.width} × {currentFormat.height}px ({orientation})
      </div>
      
      <Button className="w-full" disabled>
        <Sparkles className="mr-2 h-4 w-4" />
        Gerar sugestões de layout
      </Button>
    </div>
  );
};

export const AIPanel = () => {
  // Estado para controlar quando a IA está gerando sugestões
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use Canvas context to get current format
  const { selectedSize, modelState } = useCanvas();
  
  // Função para gerar sugestões de layout
  const generateLayoutSuggestions = () => {
    setIsGenerating(true);
    // Simulação de processamento de IA
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  // Determine o formato atual
  const currentFormat = selectedSize || { 
    width: 1080, 
    height: 1920, 
    orientation: 'vertical' as const,
    name: 'Default'
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
          {/* Informações sobre o sistema de IA */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assistente de Layout</CardTitle>
              <CardDescription>
                Use IA para sugerir layouts com base nos seus designs anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelState?.trained ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    Formato atual: {currentFormat.width} × {currentFormat.height}px 
                    ({currentFormat.orientation || 
                      (currentFormat.width > currentFormat.height ? 'horizontal' : 
                      (currentFormat.width < currentFormat.height ? 'vertical' : 'square'))})
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={generateLayoutSuggestions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Gerando sugestões...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar sugestões de layout
                      </>
                    )}
                  </Button>
                  
                  <AIFormatConversionDialog 
                    currentFormat={currentFormat} 
                    onConvert={() => {}}
                    isAITrained={modelState?.trained}
                  >
                    <Button className="w-full mt-2 gap-2" variant="outline">
                      <Brain className="h-4 w-4" />
                      Desdobrar para outros formatos
                    </Button>
                  </AIFormatConversionDialog>
                </div>
              ) : (
                <AIFormatSuggestion currentFormat={currentFormat} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
