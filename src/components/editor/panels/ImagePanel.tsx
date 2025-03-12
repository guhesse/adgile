
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCanvas } from "../CanvasContext";
import { useEffect, useState } from "react";
import { ANIMATION_PRESETS } from "../types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, CornerDownRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, AlignLeft, AlignCenter, AlignRight, Check, ChevronDown, Minus, Plus } from "lucide-react";

interface ImagePanelProps {
  element: any;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const ImagePanel = ({ element, updateElementStyle, updateElementContent, activeTab }: ImagePanelProps) => {
  const [imageUrl, setImageUrl] = useState(element?.content || "");
  const { handleImageUpload } = useCanvas();
  const [backgroundColor, setBackgroundColor] = useState(element?.style.backgroundColor || "#6941C6");
  const [cornerRadius, setCornerRadius] = useState(element?.style.borderRadius || 0);
  const [applyToAllCorners, setApplyToAllCorners] = useState(true);
  const [borderWidth, setBorderWidth] = useState(element?.style.borderWidth || 0);
  const [borderColor, setBorderColor] = useState(element?.style.borderColor || "#000000");
  const [borderStyle, setBorderStyle] = useState(element?.style.borderStyle || "solid");

  useEffect(() => {
    if (element) {
      setImageUrl(element.content);
      setBackgroundColor(element.style.backgroundColor || "#6941C6");
      setCornerRadius(element.style.borderRadius || 0);
      setBorderWidth(element.style.borderWidth || 0);
      setBorderColor(element.style.borderColor || "#000000");
      setBorderStyle(element.style.borderStyle || "solid");
    }
  }, [element]);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleImageUpload(file);
      setImageUrl(url);
      updateElementContent(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image.");
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    updateElementStyle("backgroundColor", color);
  };

  const handleCornerRadiusChange = (value: number) => {
    setCornerRadius(value);
    if (applyToAllCorners) {
      updateElementStyle("borderRadius", value);
      updateElementStyle("borderTopLeftRadius", undefined);
      updateElementStyle("borderTopRightRadius", undefined);
      updateElementStyle("borderBottomLeftRadius", undefined);
      updateElementStyle("borderBottomRightRadius", undefined);
    }
  };

  const handleIndividualCornerChange = (corner: string, value: number) => {
    updateElementStyle(corner, value);
  };

  const handleBorderWidthChange = (width: number) => {
    setBorderWidth(width);
    updateElementStyle("borderWidth", width);
  };

  const handleBorderStyleChange = (style: string) => {
    setBorderStyle(style);
    updateElementStyle("borderStyle", style);
  };

  const handleBorderColorChange = (color: string) => {
    setBorderColor(color);
    updateElementStyle("borderColor", color);
  };

  const handleAlignment = (align: "left" | "center" | "right") => {
    updateElementStyle("objectFit", "cover");
    updateElementStyle("objectPosition", align);
  };

  if (activeTab === "content") {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="image">URL da Imagem</Label>
          <Input
            type="text"
            id="image"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              updateElementContent(e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="upload">Upload da Imagem</Label>
          <Input
            type="file"
            id="upload"
            onChange={handleUpload}
          />
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="width">Largura</Label>
              <Input
                type="number"
                id="width"
                value={element?.style.width || 100}
                onChange={(e) => updateElementStyle("width", Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="height">Altura</Label>
              <Input
                type="number"
                id="height"
                value={element?.style.height || 100}
                onChange={(e) => updateElementStyle("height", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Posição</Label>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="x">X</Label>
              <Input
                type="number"
                id="x"
                value={element?.style.x || 0}
                onChange={(e) => updateElementStyle("x", Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="y">Y</Label>
              <Input
                type="number"
                id="y"
                value={element?.style.y || 0}
                onChange={(e) => updateElementStyle("y", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="animation">Animação</Label>
          <Select
            value={element?.style.animation || ""}
            onValueChange={(value) => updateElementStyle("animation", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a animação" />
            </SelectTrigger>
            <SelectContent>
              {ANIMATION_PRESETS.map((animation) => (
                <SelectItem key={animation.value} value={animation.value}>
                  {animation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {element?.style.animation && (
          <>
            <div className="space-y-2">
              <Label htmlFor="animationDuration">Duração da animação (s)</Label>
              <Slider
                defaultValue={[element?.style.animationDuration || 1]}
                max={10}
                step={0.1}
                onValueChange={(value) => updateElementStyle("animationDuration", value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="animationDelay">Delay da animação (s)</Label>
              <Slider
                defaultValue={[element?.style.animationDelay || 0]}
                max={5}
                step={0.1}
                onValueChange={(value) => updateElementStyle("animationDelay", value[0])}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-6 p-4">
      {/* Background Color Section */}
      <div className="space-y-2">
        <div className="text-center text-xs text-[#717680] font-[Geist]">
          Cor de fundo
        </div>
        
        <div className="w-full h-[120px] rounded-sm bg-gradient-to-b from-[#7000FF]/20 via-black/20 to-white/40 mb-2"></div>
        
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center bg-[#6941C6] p-2 rounded-md">
            <div className="text-white w-6 h-6 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 3.33325V12.6666M3.83337 8H13.1667" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-[262px]">
            <div className="w-full h-[10px] bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 rounded-full"></div>
            <div className="w-full h-[10px] bg-gradient-to-r from-transparent to-[#752BD4] rounded-full"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-[#414651] font-[Inter]">HEX</span>
            <div className="border border-[#E9EAEB] rounded p-1 px-2">
              <span className="text-[10px] text-[#414651] font-[Inter]">{backgroundColor}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-[#414651] font-[Inter]">R</span>
              <div className="border border-[#E9EAEB] rounded p-1 px-2">
                <span className="text-[10px] text-[#414651] font-[Inter]">151</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-[#414651] font-[Inter]">G</span>
              <div className="border border-[#E9EAEB] rounded p-1 px-2">
                <span className="text-[10px] text-[#414651] font-[Inter]">81</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-[#414651] font-[Inter]">B</span>
              <div className="border border-[#E9EAEB] rounded p-1 px-2">
                <span className="text-[10px] text-[#414651] font-[Inter]">242</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Corners Section */}
      <div className="space-y-4">
        <div className="text-center text-xs text-[#717680] font-[Geist]">
          Cantos
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-y-4 gap-x-14 px-4">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={applyToAllCorners ? cornerRadius : (element?.style.borderTopLeftRadius || 0)}
              onChange={(e) => applyToAllCorners 
                ? handleCornerRadiusChange(Number(e.target.value))
                : handleIndividualCornerChange("borderTopLeftRadius", Number(e.target.value))
              }
              className="w-14 h-8 text-xs p-2"
            />
            <CornerLeftDown size={16} className="text-[#252B37]" />
          </div>
          
          <div className="flex items-center gap-1">
            <CornerRightDown size={16} className="text-[#252B37]" />
            <Input
              type="number"
              value={applyToAllCorners ? cornerRadius : (element?.style.borderTopRightRadius || 0)}
              onChange={(e) => applyToAllCorners 
                ? handleCornerRadiusChange(Number(e.target.value))
                : handleIndividualCornerChange("borderTopRightRadius", Number(e.target.value))
              }
              className="w-14 h-8 text-xs p-2"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={applyToAllCorners ? cornerRadius : (element?.style.borderBottomLeftRadius || 0)}
              onChange={(e) => applyToAllCorners 
                ? handleCornerRadiusChange(Number(e.target.value))
                : handleIndividualCornerChange("borderBottomLeftRadius", Number(e.target.value))
              }
              className="w-14 h-8 text-xs p-2"
            />
            <CornerLeftUp size={16} className="text-[#252B37]" />
          </div>
          
          <div className="flex items-center gap-1">
            <CornerRightUp size={16} className="text-[#252B37]" />
            <Input
              type="number"
              value={applyToAllCorners ? cornerRadius : (element?.style.borderBottomRightRadius || 0)}
              onChange={(e) => applyToAllCorners 
                ? handleCornerRadiusChange(Number(e.target.value))
                : handleIndividualCornerChange("borderBottomRightRadius", Number(e.target.value))
              }
              className="w-14 h-8 text-xs p-2"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-2">
          <div 
            className={`w-4 h-4 border ${applyToAllCorners ? 'bg-[#414651] border-[#414651]' : 'bg-white border-gray-300'} flex items-center justify-center cursor-pointer`}
            onClick={() => setApplyToAllCorners(!applyToAllCorners)}
          >
            {applyToAllCorners && <Check size={14} className="text-white" />}
          </div>
          <span className="text-xs text-[#717680] font-[Geist]">Aplicar em todos os cantos</span>
        </div>
      </div>
      
      {/* Border Section */}
      <div className="space-y-4">
        <div className="text-center text-xs text-[#717680] font-[Geist]">
          Borda
        </div>
        
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Select
              value={borderStyle}
              onValueChange={handleBorderStyleChange}
            >
              <SelectTrigger className="w-full h-[34px] text-xs">
                <SelectValue placeholder="Estilo de borda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Sólida</SelectItem>
                <SelectItem value="dashed">Tracejada</SelectItem>
                <SelectItem value="dotted">Pontilhada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center h-[26px] px-2 bg-[#E9EAEB] rounded-md">
            <button 
              className="p-1" 
              onClick={() => handleBorderWidthChange(Math.max(0, borderWidth - 1))}
            >
              <Minus size={16} className="text-[#414651]" />
            </button>
            <span className="mx-1 text-xs text-[#414651]">{borderWidth}</span>
            <button 
              className="p-1" 
              onClick={() => handleBorderWidthChange(borderWidth + 1)}
            >
              <Plus size={16} className="text-[#414651]" />
            </button>
          </div>
          
          <div 
            className="w-7 h-7 rounded-full bg-black"
            style={{ backgroundColor: borderColor }}
            onClick={() => {
              const color = prompt("Entre com a cor da borda em formato Hex (ex: #000000)", borderColor);
              if (color) {
                handleBorderColorChange(color);
              }
            }}
          ></div>
        </div>
      </div>
      
      {/* Alignment Section */}
      <div className="space-y-4 pb-2">
        <div className="text-center text-xs text-[#717680] font-[Geist]">
          Alinhamento
        </div>
        
        <div className="flex w-full">
          <div className="flex h-[39px] p-1 justify-center items-center gap-0 flex-1 rounded bg-[#E9EAEB]">
            <div 
              className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer ${element?.style.objectPosition === 'left' ? 'bg-[#6941C6] text-white' : 'bg-[#E9EAEB] text-[#717680]'}`}
              onClick={() => handleAlignment('left')}
            >
              <span className="text-xs font-[Geist]">Esquerda</span>
            </div>
            <div 
              className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer ${element?.style.objectPosition === 'center' ? 'bg-[#6941C6] text-white' : 'bg-[#E9EAEB] text-[#717680]'}`}
              onClick={() => handleAlignment('center')}
            >
              <span className="text-xs font-[Geist]">Centro</span>
            </div>
            <div 
              className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer ${element?.style.objectPosition === 'right' ? 'bg-[#6941C6] text-white' : 'bg-[#E9EAEB] text-[#717680]'}`}
              onClick={() => handleAlignment('right')}
            >
              <span className="text-xs font-[Geist]">Direita</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
