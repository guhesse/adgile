import React, { useState } from 'react';
import { BannerSize } from '@/components/editor/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutGrid, 
  LayoutList, 
  Square, 
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminFormatSelectorProps {
  formats: BannerSize[];
  selectedFormat: BannerSize | null;
  onSelectFormat: (format: BannerSize) => void;
}

export const AdminFormatSelector = ({ 
  formats, 
  selectedFormat, 
  onSelectFormat 
}: AdminFormatSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVertical, setShowVertical] = useState(true);
  const [showHorizontal, setShowHorizontal] = useState(true);
  const [showSquare, setShowSquare] = useState(true);

  // Organizar formatos por orientação
  const verticalFormats = formats.filter(f => f.height > f.width);
  const horizontalFormats = formats.filter(f => f.width > f.height);
  const squareFormats = formats.filter(f => {
    const ratio = f.width / f.height;
    return ratio >= 0.95 && ratio <= 1.05;
  });

  // Filtrar formatos com base na busca
  const filterFormats = (formats: BannerSize[]) => {
    if (!searchQuery) return formats;
    return formats.filter(format => 
      format.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${format.width}x${format.height}`.includes(searchQuery)
    );
  };

  const filteredVertical = filterFormats(verticalFormats);
  const filteredHorizontal = filterFormats(horizontalFormats);
  const filteredSquare = filterFormats(squareFormats);

  // Função para gerar um thumbnail placeholder baseado na orientação do formato
  const getFormatPlaceholder = (format: BannerSize) => {
    const ratio = format.width / format.height;
    
    if (ratio >= 0.95 && ratio <= 1.05) {
      return <Square className="h-4 w-4 text-purple-400" />;
    } else if (ratio > 1) {
      return <LayoutList className="h-4 w-4 text-blue-400" />;
    } else {
      return <LayoutGrid className="h-4 w-4 text-green-400" />;
    }
  };

  // Renderização do item de formato compacto
  const renderFormatItem = (format: BannerSize, colorClass: string, bgClass: string, icon: React.ReactNode) => (
    <div 
      key={format.name}
      className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
        selectedFormat?.name === format.name ? 'bg-blue-50 ring-1 ring-blue-200' : ''
      }`}
      onClick={() => onSelectFormat(format)}
    >
      <div className={`mr-3 w-8 h-8 ${bgClass} rounded flex items-center justify-center flex-shrink-0`}>
        {format.thumbnail ? (
          <img
            src={`/thumbnails/${format.thumbnail}`}
            alt={format.name}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              const iconEl = document.createElement('div');
              iconEl.innerHTML = icon.toString();
              e.currentTarget.parentElement?.appendChild(iconEl);
            }}
          />
        ) : (
          icon
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="text-xs font-medium truncate">{format.name}</div>
        <div className="text-xs text-gray-500">{format.width}×{format.height}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <div className="mb-3 px-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar formatos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full mb-3">
          <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
          <TabsTrigger value="vertical" className="flex-1">Verticais</TabsTrigger>
          <TabsTrigger value="horizontal" className="flex-1">Horizontais</TabsTrigger>
          <TabsTrigger value="square" className="flex-1">Quadrados</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-4 pr-3">
            <TabsContent value="all" className="m-0 space-y-4">
              {/* Formatos Verticais */}
              <div className="border rounded-md overflow-hidden">
                <div 
                  className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer"
                  onClick={() => setShowVertical(!showVertical)}
                >
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <LayoutGrid className="h-4 w-4 mr-2 text-green-500" />
                    Formatos Verticais ({filteredVertical.length})
                  </h4>
                  {showVertical ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                
                {showVertical && (
                  <div className="divide-y divide-gray-100">
                    {filteredVertical.map((format) => 
                      renderFormatItem(
                        format, 
                        "text-green-300", 
                        "bg-green-50",
                        <LayoutGrid className="h-4 w-4 text-green-300" />
                      )
                    )}
                    {filteredVertical.length === 0 && (
                      <div className="p-3 text-sm text-gray-500 text-center">Nenhum formato encontrado</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Formatos Horizontais */}
              <div className="border rounded-md overflow-hidden">
                <div 
                  className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer"
                  onClick={() => setShowHorizontal(!showHorizontal)}
                >
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <LayoutList className="h-4 w-4 mr-2 text-blue-500" />
                    Formatos Horizontais ({filteredHorizontal.length})
                  </h4>
                  {showHorizontal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                
                {showHorizontal && (
                  <div className="divide-y divide-gray-100">
                    {filteredHorizontal.map((format) => 
                      renderFormatItem(
                        format, 
                        "text-blue-300", 
                        "bg-blue-50",
                        <LayoutList className="h-4 w-4 text-blue-300" />
                      )
                    )}
                    {filteredHorizontal.length === 0 && (
                      <div className="p-3 text-sm text-gray-500 text-center">Nenhum formato encontrado</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Formatos Quadrados */}
              <div className="border rounded-md overflow-hidden">
                <div 
                  className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer"
                  onClick={() => setShowSquare(!showSquare)}
                >
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Square className="h-4 w-4 mr-2 text-purple-500" />
                    Formatos Quadrados ({filteredSquare.length})
                  </h4>
                  {showSquare ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                
                {showSquare && (
                  <div className="divide-y divide-gray-100">
                    {filteredSquare.map((format) => 
                      renderFormatItem(
                        format, 
                        "text-purple-300", 
                        "bg-purple-50",
                        <Square className="h-4 w-4 text-purple-300" />
                      )
                    )}
                    {filteredSquare.length === 0 && (
                      <div className="p-3 text-sm text-gray-500 text-center">Nenhum formato encontrado</div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="vertical" className="m-0">
              <div className="divide-y divide-gray-100 border rounded-md">
                {filteredVertical.map((format) => 
                  renderFormatItem(
                    format, 
                    "text-green-300", 
                    "bg-green-50",
                    <LayoutGrid className="h-4 w-4 text-green-300" />
                  )
                )}
                {filteredVertical.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">Nenhum formato encontrado</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="horizontal" className="m-0">
              <div className="divide-y divide-gray-100 border rounded-md">
                {filteredHorizontal.map((format) => 
                  renderFormatItem(
                    format, 
                    "text-blue-300", 
                    "bg-blue-50",
                    <LayoutList className="h-4 w-4 text-blue-300" />
                  )
                )}
                {filteredHorizontal.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">Nenhum formato encontrado</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="square" className="m-0">
              <div className="divide-y divide-gray-100 border rounded-md">
                {filteredSquare.map((format) => 
                  renderFormatItem(
                    format, 
                    "text-purple-300", 
                    "bg-purple-50",
                    <Square className="h-4 w-4 text-purple-300" />
                  )
                )}
                {filteredSquare.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">Nenhum formato encontrado</div>
                )}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
