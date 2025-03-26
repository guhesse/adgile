
import React from 'react';
import { BannerSize } from '@/components/editor/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutGrid, 
  LayoutList, 
  Square, 
  ImageIcon,
} from 'lucide-react';

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
  // Organizar formatos por orientação
  const verticalFormats = formats.filter(f => f.height > f.width);
  const horizontalFormats = formats.filter(f => f.width > f.height);
  const squareFormats = formats.filter(f => {
    const ratio = f.width / f.height;
    return ratio >= 0.95 && ratio <= 1.05;
  });

  // Função para gerar um thumbnail placeholder baseado na orientação do formato
  const getFormatPlaceholder = (format: BannerSize) => {
    const ratio = format.width / format.height;
    
    if (ratio >= 0.95 && ratio <= 1.05) {
      return <Square className="h-6 w-6 text-purple-400" />;
    } else if (ratio > 1) {
      return <LayoutList className="h-6 w-6 text-blue-400" />;
    } else {
      return <LayoutGrid className="h-6 w-6 text-green-400" />;
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 pr-3">
        {/* Formatos Verticais */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <LayoutGrid className="h-4 w-4 mr-2 text-green-500" />
            Formatos Verticais
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {verticalFormats.map((format) => (
              <Card 
                key={format.name}
                className={`cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-offset-1 ${
                  selectedFormat?.name === format.name
                    ? 'ring-2 ring-blue-600 ring-offset-1'
                    : 'ring-0'
                }`}
                onClick={() => onSelectFormat(format)}
              >
                <div className="relative pb-[177%]">
                  {format.thumbnail ? (
                    <img
                      src={`/thumbnails/${format.thumbnail}`}
                      alt={format.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Se a imagem falhar, exibir o ícone de fallback
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.classList.add('bg-green-50', 'flex', 'items-center', 'justify-center');
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-green-50 flex items-center justify-center">
                      <LayoutGrid className="h-8 w-8 text-green-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="text-xs font-medium truncate">{format.name}</div>
                  <div className="text-xs text-gray-500">{format.width}×{format.height}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Formatos Horizontais */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <LayoutList className="h-4 w-4 mr-2 text-blue-500" />
            Formatos Horizontais
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {horizontalFormats.map((format) => (
              <Card 
                key={format.name}
                className={`cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-offset-1 ${
                  selectedFormat?.name === format.name
                    ? 'ring-2 ring-blue-600 ring-offset-1'
                    : 'ring-0'
                }`}
                onClick={() => onSelectFormat(format)}
              >
                <div className="relative pb-[56.25%]">
                  {format.thumbnail ? (
                    <img
                      src={`/thumbnails/${format.thumbnail}`}
                      alt={format.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.classList.add('bg-blue-50', 'flex', 'items-center', 'justify-center');
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-blue-50 flex items-center justify-center">
                      <LayoutList className="h-8 w-8 text-blue-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="text-xs font-medium truncate">{format.name}</div>
                  <div className="text-xs text-gray-500">{format.width}×{format.height}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Formatos Quadrados */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <Square className="h-4 w-4 mr-2 text-purple-500" />
            Formatos Quadrados
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {squareFormats.map((format) => (
              <Card 
                key={format.name}
                className={`cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-offset-1 ${
                  selectedFormat?.name === format.name
                    ? 'ring-2 ring-blue-600 ring-offset-1'
                    : 'ring-0'
                }`}
                onClick={() => onSelectFormat(format)}
              >
                <div className="relative pb-[100%]">
                  {format.thumbnail ? (
                    <img
                      src={`/thumbnails/${format.thumbnail}`}
                      alt={format.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.classList.add('bg-purple-50', 'flex', 'items-center', 'justify-center');
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-purple-50 flex items-center justify-center">
                      <Square className="h-8 w-8 text-purple-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="text-xs font-medium truncate">{format.name}</div>
                  <div className="text-xs text-gray-500">{format.width}×{format.height}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
