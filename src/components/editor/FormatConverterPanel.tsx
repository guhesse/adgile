import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BannerSize, 
  EditorElement 
} from '@/components/editor/types';
import { 
  findSimilarFormatsInCache, 
  cacheFormatLayout,
  calculateFormatSimilarity
} from '@/utils/formatCache';
import { refineLayoutWithAI } from '@/utils/refinementService';
import { Loader2, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FormatConverterPanelProps {
  currentFormat: BannerSize;
  elements: EditorElement[];
  formatOptions: BannerSize[];
  onApplyFormat: (format: BannerSize, adaptedElements: EditorElement[]) => void;
}

const FormatConverterPanel: React.FC<FormatConverterPanelProps> = ({
  currentFormat,
  elements,
  formatOptions,
  onApplyFormat
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<BannerSize | null>(null);
  const [refinedLayouts, setRefinedLayouts] = useState<
    { format: BannerSize; elements: EditorElement[] }[]
  >([]);
  const [similarFormats, setSimilarFormats] = useState<
    { format: BannerSize; similarity: number }[]
  >([]);
  const [activeTab, setActiveTab] = useState('recommended');

  // Carregar formatos similares do cache ao iniciar
  useEffect(() => {
    if (currentFormat) {
      const similarFromCache = findSimilarFormatsInCache(currentFormat.name);
      
      // Preparar lista de formatos similares com pontuação
      const formatsWithSimilarity = formatOptions.map(format => ({
        format,
        similarity: calculateFormatSimilarity(currentFormat, format)
      }));
      
      // Ordenar do mais similar ao menos similar
      formatsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
      
      // Remover o formato atual da lista
      const filteredFormats = formatsWithSimilarity.filter(
        item => item.format.name !== currentFormat.name
      );
      
      setSimilarFormats(filteredFormats);
      
      // Selecionar o formato mais similar por padrão, se houver
      if (filteredFormats.length > 0 && !selectedFormat) {
        setSelectedFormat(filteredFormats[0].format);
      }
      
      console.log(`Encontrados ${similarFromCache.length} formatos similares no cache`);
    }
  }, [currentFormat, formatOptions]);

  const handleConvert = async () => {
    if (!selectedFormat) {
      toast.error('Selecione um formato de destino');
      return;
    }

    setIsLoading(true);
    try {
      const results = await refineLayoutWithAI(
        currentFormat, 
        elements, 
        [selectedFormat]
      );
      
      setRefinedLayouts(results);
      
      // Se temos resultados, mostrar mensagem de sucesso
      if (results.length > 0) {
        toast.success(`Layout convertido para ${results.length} formato(s)`);
        
        // Armazenar os resultados no cache para uso futuro
        results.forEach(layout => {
          cacheFormatLayout(
            currentFormat, 
            layout.format, 
            layout.elements, 
            calculateFormatSimilarity(currentFormat, layout.format)
          );
        });
      }
    } catch (error) {
      console.error('Erro ao converter formato:', error);
      toast.error('Falha ao converter formato. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFormat = (layout: { format: BannerSize; elements: EditorElement[] }) => {
    onApplyFormat(layout.format, layout.elements);
    toast.success(`Formato ${layout.format.name} aplicado com sucesso!`);
  };

  const getSimilarityLabel = (similarity: number): string => {
    if (similarity > 0.9) return 'Muito similar';
    if (similarity > 0.7) return 'Similar';
    if (similarity > 0.5) return 'Médio';
    if (similarity > 0.3) return 'Pouco similar';
    return 'Muito diferente';
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity > 0.9) return 'bg-green-500';
    if (similarity > 0.7) return 'bg-green-400';
    if (similarity > 0.5) return 'bg-yellow-400';
    if (similarity > 0.3) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Converter Formato</h2>
      
      <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="recommended">Recomendados</TabsTrigger>
          <TabsTrigger value="all">Todos os Formatos</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="flex-1">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {similarFormats.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum formato similar encontrado</p>
                </div>
              ) : (
                similarFormats
                  .filter(item => item.similarity > 0.3)
                  .slice(0, 8)
                  .map(item => (
                    <Card 
                      key={item.format.name}
                      className={`cursor-pointer transition-colors ${
                        selectedFormat?.name === item.format.name 
                          ? 'border-2 border-primary' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFormat(item.format)}
                    >
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{item.format.name}</CardTitle>
                          <Badge 
                            variant="secondary"
                            className={`text-white ${getSimilarityColor(item.similarity)}`}
                          >
                            {getSimilarityLabel(item.similarity)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="text-xs">
                          {item.format.width} × {item.format.height}px
                          {item.format.orientation && ` • ${item.format.orientation}`}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="all" className="flex-1">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {formatOptions
                .filter(format => format.name !== currentFormat.name)
                .map(format => (
                  <Card 
                    key={format.name}
                    className={`cursor-pointer transition-colors ${
                      selectedFormat?.name === format.name 
                        ? 'border-2 border-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFormat(format)}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{format.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xs">
                        {format.width} × {format.height}px
                        {format.orientation && ` • ${format.orientation}`}
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="results" className="flex-1">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {refinedLayouts.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum resultado disponível</p>
                  <p className="text-xs">Converta um formato primeiro</p>
                </div>
              ) : (
                refinedLayouts.map(layout => (
                  <Card key={layout.format.name} className="hover:bg-gray-50">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm">{layout.format.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex flex-col space-y-2">
                        <div className="text-xs">
                          {layout.format.width} × {layout.format.height}px
                          {layout.format.orientation && ` • ${layout.format.orientation}`}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleApplyFormat(layout)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Aplicar formato
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 pt-4 border-t">
        {selectedFormat && (
          <div className="mb-3">
            <p className="text-sm font-medium">
              Formato selecionado: {selectedFormat.name}
            </p>
            <p className="text-xs text-gray-500">
              {selectedFormat.width} × {selectedFormat.height}px
            </p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            className="flex-1"
            onClick={handleConvert}
            disabled={!selectedFormat || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Convertendo...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Converter Formato
              </>
            )}
          </Button>
          
          {refinedLayouts.length > 0 && selectedFormat && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('results')}
            >
              Ver Resultados
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormatConverterPanel;
