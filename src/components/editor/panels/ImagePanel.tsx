
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCanvas } from "../CanvasContext";
import { EditorElement } from "../types";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Image, Link, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ImagePanelProps {
  selectedElement: EditorElement;
  updateElementStyle?: (property: string, value: any) => void;
}

const ImagePanel = ({ selectedElement, updateElementStyle }: ImagePanelProps) => {
  const {
    updateElementContent,
    handleImageUpload,
  } = useCanvas();

  const [activeTab, setActiveTab] = useState<string>("content");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [altText, setAltText] = useState<string>("");
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(false);
  const [overlayColor, setOverlayColor] = useState<string>("#000000");
  const [useFilters, setUseFilters] = useState<boolean>(false);

  useEffect(() => {
    if (selectedElement && selectedElement.type === "image") {
      setImageUrl(selectedElement.content as string);
      setAltText(selectedElement.alt || "");
      setLinkUrl(selectedElement.link || "");
      setOpenInNewTab(selectedElement.openInNewTab || false);
      setOverlayColor(selectedElement.style.overlayColor || "#000000");
      
      // Check if we're using filters
      setUseFilters(
        selectedElement.style.hueRotate !== undefined || 
        selectedElement.style.grayscale !== undefined || 
        selectedElement.style.brightness !== undefined ||
        selectedElement.style.contrast !== undefined ||
        selectedElement.style.saturate !== undefined
      );
    }
  }, [selectedElement]);

  if (!selectedElement || selectedElement.type !== "image") {
    return null;
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await handleImageUpload(files[0]);
      updateElementContent(uploadedUrl);
      setImageUrl(uploadedUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    updateElementContent(url);
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkUrl(url);
    
    if (selectedElement.link !== undefined) {
      selectedElement.link = url;
    }
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAltText(text);
    
    if (selectedElement.alt !== undefined) {
      selectedElement.alt = text;
    }
  };

  const handleOpenInNewTabChange = (checked: boolean) => {
    setOpenInNewTab(checked);
    
    if (selectedElement.openInNewTab !== undefined) {
      selectedElement.openInNewTab = checked;
    }
  };

  const handleObjectFitChange = (value: string) => {
    if (updateElementStyle) {
      updateElementStyle("objectFit", value);
    }
  };

  const handleOpacityChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("opacity", value[0] / 100);
    }
  };

  // Filter handlers
  const handleHueRotateChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("hueRotate", value[0]);
    }
  };

  const handleGrayscaleChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("grayscale", value[0]);
    }
  };

  const handleBrightnessChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("brightness", value[0]);
    }
  };

  const handleContrastChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("contrast", value[0]);
    }
  };

  const handleSaturateChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("saturate", value[0]);
    }
  };

  const toggleFilterMode = () => {
    setUseFilters(!useFilters);
    
    if (useFilters) {
      // Remove filters
      if (updateElementStyle) {
        updateElementStyle("hueRotate", undefined);
        updateElementStyle("grayscale", undefined);
        updateElementStyle("brightness", undefined);
        updateElementStyle("contrast", undefined);
        updateElementStyle("saturate", undefined);
      }
    } else {
      // Initialize filters with default values
      if (updateElementStyle) {
        updateElementStyle("hueRotate", 0);
        updateElementStyle("grayscale", 0);
        updateElementStyle("brightness", 1);
        updateElementStyle("contrast", 1);
        updateElementStyle("saturate", 1);
      }
    }
  };

  const resetFilters = () => {
    if (updateElementStyle) {
      updateElementStyle("hueRotate", 0);
      updateElementStyle("grayscale", 0);
      updateElementStyle("brightness", 1);
      updateElementStyle("contrast", 1);
      updateElementStyle("saturate", 1);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg">
      <div className="flex items-center justify-center">
        <div className="text-lg font-medium">Imagem</div>
      </div>
      
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className={activeTab === "content" ? "bg-purple-600 text-white" : ""}>
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="style" className={activeTab === "style" ? "bg-purple-600 text-white" : ""}>
            Estilo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-md bg-gray-50">
            <Image className="w-8 h-8 text-gray-400 mb-2" />
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 cursor-pointer"
            >
              {isUploading ? "Carregando..." : "Escolher imagem"}
            </label>
            <div className="mt-2 text-sm text-gray-500">ou</div>
            <Input
              placeholder="URL da imagem"
              value={imageUrl}
              onChange={handleUrlChange}
              className="mt-2"
            />
          </div>
          
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500">Tamanho</div>
            <div className="flex justify-center bg-gray-100 rounded-md p-1">
              <Button 
                variant={selectedElement.style.objectFit === "contain" ? "default" : "ghost"}
                className={`flex-1 ${selectedElement.style.objectFit === "contain" ? "bg-white shadow-sm" : ""}`}
                onClick={() => handleObjectFitChange("contain")}
              >
                Original
              </Button>
              <Button 
                variant={selectedElement.style.objectFit === "fill" ? "default" : "ghost"}
                className={`flex-1 ${selectedElement.style.objectFit === "fill" ? "bg-white shadow-sm" : ""}`}
                onClick={() => handleObjectFitChange("fill")}
              >
                Preencher
              </Button>
              <Button 
                variant={selectedElement.style.objectFit === "cover" ? "default" : "ghost"}
                className={`flex-1 ${selectedElement.style.objectFit === "cover" ? "bg-purple-600 text-white" : ""}`}
                onClick={() => handleObjectFitChange("cover")}
              >
                Escala
              </Button>
            </div>
            
            <div className="mt-6">
              <div className="text-center text-sm text-gray-500 mb-2">Vincular a</div>
              <Select defaultValue="web">
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Página da Web</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Link"
                value={linkUrl}
                onChange={handleLinkChange}
                className="mt-2"
              />
              
              <div className="flex items-center mt-2">
                <Switch
                  checked={openInNewTab}
                  onCheckedChange={handleOpenInNewTabChange}
                  id="open-new-tab"
                />
                <Label htmlFor="open-new-tab" className="ml-2 text-sm text-gray-600">
                  Abrir link em nova guia
                </Label>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-center text-sm text-gray-500 mb-2">Texto alternativo</div>
              <Input
                placeholder="Descreva o que vê na imagem"
                value={altText}
                onChange={handleAltChange}
                className="mt-1"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500">Opacidade</div>
            <div className="w-full">
              <Slider 
                defaultValue={[selectedElement.style.opacity ? selectedElement.style.opacity * 100 : 100]}
                value={[selectedElement.style.opacity ? selectedElement.style.opacity * 100 : 100]}
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">Filtros CSS</div>
              <Switch
                checked={useFilters}
                onCheckedChange={toggleFilterMode}
                id="filter-mode"
              />
            </div>
            
            {useFilters && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Ajustes de Imagem</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-xs flex items-center"
                  >
                    Resetar
                  </Button>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Matiz (Hue)</span>
                    <span>{selectedElement.style.hueRotate || 0}°</span>
                  </div>
                  <Slider 
                    defaultValue={[selectedElement.style.hueRotate || 0]}
                    value={[selectedElement.style.hueRotate || 0]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={handleHueRotateChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Escala de cinza</span>
                    <span>{selectedElement.style.grayscale ? selectedElement.style.grayscale * 100 : 0}%</span>
                  </div>
                  <Slider 
                    defaultValue={[selectedElement.style.grayscale || 0]}
                    value={[selectedElement.style.grayscale || 0]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleGrayscaleChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Brilho</span>
                    <span>{selectedElement.style.brightness ? selectedElement.style.brightness * 100 : 100}%</span>
                  </div>
                  <Slider 
                    defaultValue={[selectedElement.style.brightness || 1]}
                    value={[selectedElement.style.brightness || 1]}
                    min={0}
                    max={2}
                    step={0.05}
                    onValueChange={handleBrightnessChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Contraste</span>
                    <span>{selectedElement.style.contrast ? selectedElement.style.contrast * 100 : 100}%</span>
                  </div>
                  <Slider 
                    defaultValue={[selectedElement.style.contrast || 1]}
                    value={[selectedElement.style.contrast || 1]}
                    min={0}
                    max={2}
                    step={0.05}
                    onValueChange={handleContrastChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Saturação</span>
                    <span>{selectedElement.style.saturate ? selectedElement.style.saturate * 100 : 100}%</span>
                  </div>
                  <Slider 
                    defaultValue={[selectedElement.style.saturate || 1]}
                    value={[selectedElement.style.saturate || 1]}
                    min={0}
                    max={2}
                    step={0.05}
                    onValueChange={handleSaturateChange}
                  />
                </div>
                
                <div className="mt-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                  <p>Os filtros CSS preservam a transparência em imagens PNG, ideal para logos e ícones.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
        <p>Dica: Use as teclas de seta para mover os elementos no canvas.</p>
        <p className="mt-1">Use <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift</kbd> + teclas de seta para mover em incrementos maiores.</p>
      </div>
    </div>
  );
};

export default ImagePanel;
