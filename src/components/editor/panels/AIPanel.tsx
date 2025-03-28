
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AIFormatSuggestionProps {
  currentFormat: {
    width: number;
    height: number;
    orientation: string;
  };
}

export const AIFormatSuggestion: React.FC<AIFormatSuggestionProps> = ({ currentFormat }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>IA em treinamento</AlertTitle>
        <AlertDescription>
          O modelo de IA ainda está sendo treinado com seus templates. Adicione mais templates para obter melhores sugestões.
        </AlertDescription>
      </Alert>
      
      <div className="text-sm text-gray-500">
        Formato atual: {currentFormat.width} × {currentFormat.height}px ({currentFormat.orientation})
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
  
  // Formato atual (exemplo)
  const currentFormat = {
    width: 1080,
    height: 1920,
    orientation: 'vertical'
  };
  
  // Verificar se o modelo está treinado
  const isModelTrained = false; // Vamos supor que ainda não está treinado
  
  // Função para gerar sugestões de layout
  const generateLayoutSuggestions = () => {
    setIsGenerating(true);
    // Simulação de processamento de IA
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
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
              {isModelTrained ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">
                    Formato atual: {currentFormat.width} × {currentFormat.height}px ({currentFormat.orientation})
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
