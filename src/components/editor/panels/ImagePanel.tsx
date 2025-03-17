import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCanvas } from "../CanvasContext";
import { useEffect, useState } from "react";
import { ANIMATION_PRESETS } from "../types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Upload, 
  ChevronDown, 
  Check, 
  Link as LinkIcon,
  ExternalLink
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [objectFit, setObjectFit] = useState(element?.style.objectFit || "cover");
  const [imageScale, setImageScale] = useState(100);
  const [imageLink, setImageLink] = useState(element?.link || "");
  const [openInNewTab, setOpenInNewTab] = useState(element?.openInNewTab || true);
  const [altText, setAltText] = useState(element?.alt || "");

  useEffect(() => {
    if (element) {
      setImageUrl(element.content);
      setBackgroundColor(element.style.backgroundColor || "#6941C6");
      setCornerRadius(element.style.borderRadius || 0);
      setBorderWidth(element.style.borderWidth || 0);
      setBorderColor(element.style.borderColor || "#000000");
      setBorderStyle(element.style.borderStyle || "solid");
      setObjectFit(element.style.objectFit || "cover");
      setAltText(element.alt || "");
    }
  }, [element]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setSelectedFileName(file.name);
      
      const url = await handleImageUpload(file);
      setImageUrl(url);
      updateElementContent(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleObjectFitChange = (value: string) => {
    setObjectFit(value);
    updateElementStyle("objectFit", value);
  };

  const handleLinkChange = (value: string) => {
    setImageLink(value);
    updateElementStyle("link", value);
  };

  const handleAltTextChange = (value: string) => {
    setAltText(value);
    updateElementStyle("alt", value);
  };

  const handleOpenInNewTabChange = (checked: boolean) => {
    setOpenInNewTab(checked);
    updateElementStyle("openInNewTab", checked);
  };

  if (activeTab === "content") {
    return (
      <div className="space-y-6 p-4 font-['Geist',sans-serif]">
        <div className="text-center text-xs text-[#717680]">
          Conteúdo
        </div>
        
        <div className="flex h-[99px] items-center gap-2 w-full">
          <div className="flex p-2.5 justify-center items-center gap-2.5 flex-1 h-full rounded-xl bg-[#E9EAEB]">
            {element.content ? (
              <img
                src={element.content}
                alt="Preview"
                className="max-h-[80px] max-w-full object-contain"
              />
            ) : (
              <Image size={35} className="text-[#A4A7AE]" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-center text-xs text-[#717680]">
            Tamanho
          </div>
          
          <div className="flex w-full">
            <div className="flex h-[39px] p-1 justify-center items-center gap-0 flex-1 rounded bg-[#E9EAEB]">
              <div 
                className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer ${objectFit === 'contain' ? 'bg-[#6941C6] text-white' : 'bg-[#E9EAEB] text-[#717680]'}`}
                onClick={() => handleObjectFitChange('contain')}
              >
                <span className="text-xs font-['Geist',sans-serif]">Original</span>
              </div>
              <div 
                className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer ${objectFit === 'fill' ? 'bg-[#6941C6] text-white' : 'bg-[#E9EAEB] text-[#717680]'}`}
                onClick={() => handleObjectFitChange('fill')}
              >
                <span className="text-xs font-['Geist',sans-serif]">Preencher</span>
              </div>
              <div 
                className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer ${objectFit === 'cover' ? 'bg-[#6941C6] text-white' : 'bg-[#E9EAEB] text-[#717680]'}`}
                onClick={() => handleObjectFitChange('cover')}
              >
                <span className="text-xs font-['Geist',sans-serif]">Escala</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 w-full">
            <Slider 
              defaultValue={[imageScale]} 
              min={50} 
              max={150} 
              step={1}
              onValueChange={(value) => {
                setImageScale(value[0]);
                updateElementStyle("objectPosition", `${value[0]}%`);
              }}
              className="w-[280px] mx-auto"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-center text-xs text-[#717680]">
            Vincular a
          </div>
          
          <Select value="webpage" onValueChange={() => {}}>
            <SelectTrigger className="w-full text-xs h-[34px] border-[#E9EAEB]">
              <SelectValue placeholder="Página da Web" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="webpage">Página da Web</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center rounded-sm border border-[#E2E8F0] px-3 h-[30px]">
            <input 
              type="text" 
              value={imageLink} 
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="Link"
              className="w-full bg-transparent border-none focus:outline-none text-xs text-[#64748B]"
            />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center h-4 space-x-2">
              <Checkbox 
                id="openInNewTab" 
                checked={openInNewTab} 
                onCheckedChange={handleOpenInNewTabChange}
                className="bg-[#414651] border-[#414651]"
              />
            </div>
            <label 
              htmlFor="openInNewTab" 
              className="text-[#717680] text-xs cursor-pointer"
            >
              Abrir link em nova guia
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-center text-xs text-[#717680]">
            Texto alternativo
          </div>
          
          <div className="flex items-center rounded-sm border border-[#E2E8F0] px-3 h-[30px]">
            <input 
              type="text" 
              value={altText} 
              onChange={(e) => handleAltTextChange(e.target.value)}
              placeholder="Descreva o que vê na imagem"
              className="w-full bg-transparent border-none focus:outline-none text-xs text-[#64748B]"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="upload" className="text-center block text-xs text-[#717680]">
            Upload da Imagem
          </Label>
          <div className="relative">
            <div className="flex">
              <div className="relative flex-1">
                <Input
                  type="file"
                  id="upload"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  size="default"
                  className="w-full flex items-center justify-start gap-2 text-sm h-10"
                  onClick={() => document.getElementById("upload")?.click()}
                  disabled={isUploading}
                >
                  <Upload size={16} className="opacity-70" />
                  <span className="flex-1 text-left truncate">
                    {isUploading ? "Carregando..." : "Escolher ficheiro"}
                  </span>
                </Button>
              </div>
              <div className="ml-2 flex-none">
                {selectedFileName && (
                  <div className="px-3 h-10 border rounded flex items-center text-xs text-gray-600 max-w-[130px] truncate">
                    {selectedFileName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
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

