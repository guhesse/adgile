
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrientationIndicatorProps {
  isHorizontal: boolean;
}

export const OrientationIndicator: React.FC<OrientationIndicatorProps> = ({ isHorizontal }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-1 text-xs">
            <span className="font-medium">{isHorizontal ? 'Horizontal' : 'Vertical'}</span>
            <Info className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium mb-1">Formato {isHorizontal ? 'Horizontal' : 'Vertical'}</p>
            <p className="text-xs">
              Os elementos são posicionados individualmente em cada formato. 
              Use as propriedades no painel para ajustar a posição e tamanho para este formato específico.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
