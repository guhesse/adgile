
import { useState } from "react";
import { BannerSize } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, RefreshCwIcon } from "lucide-react";

interface ArtboardPanelProps {
  selectedSize: BannerSize;
  updateArtboardBackground: (color: string) => void;
  artboardBackgroundColor: string;
}

export const ArtboardPanel = ({ 
  selectedSize, 
  updateArtboardBackground,
  artboardBackgroundColor = "#ffffff" 
}: ArtboardPanelProps) => {
  const [backgroundValue, setBackgroundValue] = useState<string>(artboardBackgroundColor);

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundValue(e.target.value);
  };

  const handleBackgroundApply = () => {
    updateArtboardBackground(backgroundValue);
  };

  // Function to generate a random color
  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    setBackgroundValue(randomColor);
    updateArtboardBackground(randomColor);
  };

  // Predefined common background colors
  const commonColors = [
    "#ffffff", // White
    "#f5f5f5", // Light gray
    "#000000", // Black
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#6B7280", // Gray
    "#transparent" // Transparent
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configurações da Prancheta</h3>
      </div>

      <div className="space-y-4">
        {/* Size Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Tamanho Atual</Label>
            <span className="text-sm text-gray-500">{selectedSize.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <Label>Dimensões</Label>
            <span className="text-sm text-gray-500">{selectedSize.width} × {selectedSize.height}px</span>
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bg-color">Cor de Fundo</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon size={16} className="text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Define a cor de fundo da prancheta. Você pode usar cores em hexadecimal, RGBA ou nomes como "transparent".</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-grow flex gap-2">
              <Input
                id="bg-color"
                type="text"
                value={backgroundValue}
                onChange={handleBackgroundChange}
                className="flex-grow"
              />
              <input 
                type="color" 
                value={backgroundValue === 'transparent' ? '#ffffff' : backgroundValue}
                onChange={handleBackgroundChange}
                className="w-10 h-10 p-1 border rounded cursor-pointer"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={generateRandomColor}
              title="Gerar cor aleatória"
            >
              <RefreshCwIcon size={16} />
            </Button>
          </div>
          
          <Button
            className="w-full"
            onClick={handleBackgroundApply}
          >
            Aplicar Cor
          </Button>

          {/* Common Color Presets */}
          <div className="mt-4">
            <Label className="text-sm mb-2 block">Cores Comuns</Label>
            <div className="flex flex-wrap gap-2">
              {commonColors.map((color, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: color === "#transparent" ? "transparent" : color,
                    backgroundImage: color === "#transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)" : "none",
                    backgroundSize: color === "#transparent" ? "8px 8px" : "auto",
                    backgroundPosition: color === "#transparent" ? "0 0, 4px 4px" : "auto"
                  }}
                  onClick={() => {
                    const newColor = color === "#transparent" ? "transparent" : color;
                    setBackgroundValue(newColor);
                    updateArtboardBackground(newColor);
                  }}
                  title={color === "#transparent" ? "Transparent" : color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
