
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AIFormatSuggestionProps {
  currentFormat: {
    width: number;
    height: number;
    orientation: 'vertical' | 'horizontal' | 'square';
  };
}

// Helper function to determine orientation
const getFormatOrientation = (format: { width: number; height: number }): 'vertical' | 'horizontal' | 'square' => {
  const ratio = format.width / format.height;
  if (ratio > 1.05) return 'horizontal';
  if (ratio < 0.95) return 'vertical';
  return 'square';
};

export const AIFormatSuggestion: React.FC<AIFormatSuggestionProps> = ({ currentFormat }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>IA temporariamente desativada</AlertTitle>
        <AlertDescription>
          A geração automática de layout foi temporariamente desativada para evitar elementos duplicados.
          Por favor, use a função "Desdobrar Formatos" com formatos da mesma orientação.
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
    orientation: 'vertical' as const
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
              <AIFormatSuggestion currentFormat={currentFormat} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
