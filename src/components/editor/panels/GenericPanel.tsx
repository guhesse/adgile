
import { useState, useEffect } from "react";
import { EditorElement } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenericPanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const GenericPanel = ({ element, updateElementStyle, updateElementContent, activeTab }: GenericPanelProps) => {
  const [colorValue, setColorValue] = useState(element.style.backgroundColor || "#ffffff");

  useEffect(() => {
    setColorValue(element.style.backgroundColor || "#ffffff");
  }, [element]);

  // Função para lidar com mudanças de cor de fundo
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColorValue(newColor);
    updateElementStyle("backgroundColor", newColor);
  };

  // Função para lidar com mudanças de conteúdo
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElementContent(e.target.value);
  };

  // Função para lidar com mudanças de opacidade
  const handleOpacityChange = (values: number[]) => {
    const opacity = values[0] / 100;
    updateElementStyle("opacity", opacity);
  };

  // Função para lidar com mudanças de raio de borda
  const handleBorderRadiusChange = (values: number[]) => {
    updateElementStyle("borderRadius", values[0]);
  };

  // Função para lidar com mudanças no tipo de borda
  const handleBorderStyleChange = (value: string) => {
    updateElementStyle("borderStyle", value);
  };

  // Função para lidar com a largura da borda
  const handleBorderWidthChange = (values: number[]) => {
    updateElementStyle("borderWidth", values[0]);
  };

  // Função para lidar com a cor da borda
  const handleBorderColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElementStyle("borderColor", e.target.value);
  };

  // Conteúdo do painel baseado na aba ativa
  if (activeTab === "content") {
    return (
      <div className="space-y-5 p-4">
        <div className="text-center text-sm text-gray-500 mb-4">Conteúdo</div>
        
        <div className="space-y-2">
          <Label htmlFor="element-name">Nome do elemento</Label>
          <Input
            id="element-name"
            value={element.content}
            onChange={handleContentChange}
            placeholder="Nome do elemento"
            className="w-full"
          />
        </div>
      </div>
    );
  }

  // Painel de estilo
  return (
    <div className="space-y-5 p-4">
      <div className="text-center text-sm text-gray-500 mb-4">Estilo</div>
      
      {/* Cor de fundo */}
      <div className="space-y-2">
        <Label>Cor de fundo</Label>
        <div className="flex space-x-2">
          <div 
            className="w-10 h-10 rounded-md border" 
            style={{ backgroundColor: colorValue }}
          />
          <Input
            type="text"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            onBlur={(e) => updateElementStyle("backgroundColor", e.target.value)}
            className="flex-1"
          />
          <Input
            type="color"
            value={colorValue}
            onChange={handleColorChange}
            className="w-12 p-1 h-10"
          />
        </div>
      </div>
      
      {/* Opacidade */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Opacidade</Label>
          <span className="text-xs text-gray-500">
            {Math.round((element.style.opacity || 1) * 100)}%
          </span>
        </div>
        <Slider
          defaultValue={[(element.style.opacity || 1) * 100]}
          max={100}
          step={1}
          onValueChange={handleOpacityChange}
        />
      </div>
      
      {/* Bordas */}
      <div className="space-y-4">
        <Label>Bordas</Label>
        
        {/* Estilo de borda */}
        <div className="space-y-2">
          <Label className="text-xs">Estilo</Label>
          <Select
            value={element.style.borderStyle || "none"}
            onValueChange={handleBorderStyleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estilo de borda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="solid">Linha sólida</SelectItem>
              <SelectItem value="dashed">Tracejado</SelectItem>
              <SelectItem value="dotted">Pontilhado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Largura da borda */}
        {element.style.borderStyle && element.style.borderStyle !== "none" && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Largura</Label>
              <span className="text-xs text-gray-500">
                {element.style.borderWidth || 1}px
              </span>
            </div>
            <Slider
              defaultValue={[element.style.borderWidth || 1]}
              max={10}
              step={1}
              onValueChange={handleBorderWidthChange}
            />
          </div>
        )}
        
        {/* Cor da borda */}
        {element.style.borderStyle && element.style.borderStyle !== "none" && (
          <div className="space-y-2">
            <Label className="text-xs">Cor</Label>
            <div className="flex space-x-2">
              <div 
                className="w-10 h-10 rounded-md border" 
                style={{ backgroundColor: element.style.borderColor || "#000000" }}
              />
              <Input
                type="color"
                value={element.style.borderColor || "#000000"}
                onChange={handleBorderColorChange}
                className="w-12 p-1 h-10"
              />
            </div>
          </div>
        )}
        
        {/* Raio de borda */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Raio de borda</Label>
            <span className="text-xs text-gray-500">
              {element.style.borderRadius || 0}px
            </span>
          </div>
          <Slider
            defaultValue={[element.style.borderRadius || 0]}
            max={50}
            step={1}
            onValueChange={handleBorderRadiusChange}
          />
        </div>
      </div>
    </div>
  );
};
