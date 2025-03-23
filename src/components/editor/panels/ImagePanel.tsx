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
import { Image, Link, CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, Minus, Plus, AlignCenter, AlignLeft, AlignRight, Maximize, MinusCircle, PlusCircle, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ImagePanelProps {
  selectedElement: EditorElement;
  updateElementStyle?: (property: string, value: any) => void;
}

const ImagePanel = ({ selectedElement, updateElementStyle }: ImagePanelProps) => {
  const {
    updateElementContent,
    handleImageUpload,
    updateElementAttribute,
  } = useCanvas();

  const [activeTab, setActiveTab] = useState<string>("content");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [altText, setAltText] = useState<string>("");
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(false);
  const [overlayColor, setOverlayColor] = useState<string>("#000000");

  useEffect(() => {
    if (selectedElement && selectedElement.type === "image") {
      setImageUrl(selectedElement.content as string);
      setAltText(selectedElement.alt || "");
      setLinkUrl(selectedElement.link || "");
      setOpenInNewTab(selectedElement.openInNewTab || false);
      setOverlayColor(selectedElement.style.overlayColor || "#000000");
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
    
    if (updateElementAttribute) {
      updateElementAttribute('link', url);
    }
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAltText(text);
    
    if (updateElementAttribute) {
      updateElementAttribute('alt', text);
    }
  };

  const handleOpenInNewTabChange = (checked: boolean) => {
    setOpenInNewTab(checked);
    
    if (updateElementAttribute) {
      updateElementAttribute('openInNewTab', checked);
    }
  };

  const handleObjectFitChange = (value: string) => {
    if (updateElementStyle) {
      updateElementStyle("objectFit", value);
      
      if (value === "cover") {
        updateElementStyle("objectPositionX", 50);
        updateElementStyle("objectPositionY", 50);
        updateElementStyle("objectScale", 100);
      }
    }
  };

  const handleOpacityChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("opacity", value[0] / 100);
    }
  };

  const handleOverlayOpacityChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("overlayOpacity", value[0] / 100);
    }
  };

  const handleOverlayColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setOverlayColor(color);
    if (updateElementStyle) {
      updateElementStyle("overlayColor", color);
    }
  };

  const handlePositionXChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("objectPositionX", value[0]);
    }
  };

  const handlePositionYChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("objectPositionY", value[0]);
    }
  };

  const handleScaleChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("objectScale", value[0]);
    }
  };

  const showPositionControls = selectedElement.style.objectFit === "cover";

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
            
            {showPositionControls && (
              <div className="mt-6">
                <div className="text-center text-sm text-gray-500 mb-2">Posição e Escala</div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Posição X</span>
                      <span>{selectedElement.style.objectPositionX || 50}%</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowLeft className="w-4 h-4 text-gray-400 mr-2" />
                      <Slider 
                        defaultValue={[selectedElement.style.objectPositionX || 50]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handlePositionXChange}
                      />
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Posição Y</span>
                      <span>{selectedElement.style.objectPositionY || 50}%</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowUp className="w-4 h-4 text-gray-400 mr-2" />
                      <Slider 
                        defaultValue={[selectedElement.style.objectPositionY || 50]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handlePositionYChange}
                      />
                      <ArrowDown className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Escala</span>
                      <span>{selectedElement.style.objectScale || 100}%</span>
                    </div>
                    <div className="flex items-center">
                      <MinusCircle className="w-4 h-4 text-gray-400 mr-2" />
                      <Slider 
                        defaultValue={[selectedElement.style.objectScale || 100]}
                        min={100}
                        max={200}
                        step={1}
                        onValueChange={handleScaleChange}
                      />
                      <PlusCircle className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
                
                {showPositionControls && (
                  <div className="mt-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    <p>Dica: Use <kbd className="px-1 py-0.5 bg-gray-200 rounded">Alt</kbd> + teclas de seta para ajustar a posição da imagem dentro do container.</p>
                    <p className="mt-1">Use <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift</kbd> + teclas de seta para mover em incrementos maiores.</p>
                  </div>
                )}
              </div>
            )}
            
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
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center text-sm text-gray-500">Sobreposição de Cor</div>
            <div className="flex items-center justify-between">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center w-full">
                    <div 
                      className="w-4 h-4 rounded-sm mr-2" 
                      style={{ backgroundColor: overlayColor }} 
                    />
                    <span>{overlayColor}</span>
                    <Palette className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2">
                  <div className="space-y-2">
                    <Input
                      type="color"
                      value={overlayColor}
                      onChange={handleOverlayColorChange}
                      className="w-full h-8"
                    />
                    <Input
                      type="text"
                      value={overlayColor}
                      onChange={handleOverlayColorChange}
                      className="w-full"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Opacidade da Cor</span>
                <span>{selectedElement.style.overlayOpacity ? selectedElement.style.overlayOpacity * 100 : 0}%</span>
              </div>
              <Slider 
                defaultValue={[selectedElement.style.overlayOpacity ? selectedElement.style.overlayOpacity * 100 : 0]}
                max={100}
                step={1}
                onValueChange={handleOverlayOpacityChange}
              />
            </div>
            
            <Separator className="my-4" />
            
            {showPositionControls && (
              <>
                <div className="text-center text-sm text-gray-500">Posição e Escala</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Posição X</span>
                      <span>{selectedElement.style.objectPositionX || 50}%</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowLeft className="w-4 h-4 text-gray-400 mr-2" />
                      <Slider 
                        defaultValue={[selectedElement.style.objectPositionX || 50]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handlePositionXChange}
                      />
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Posição Y</span>
                      <span>{selectedElement.style.objectPositionY || 50}%</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowUp className="w-4 h-4 text-gray-400 mr-2" />
                      <Slider 
                        defaultValue={[selectedElement.style.objectPositionY || 50]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handlePositionYChange}
                      />
                      <ArrowDown className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Escala</span>
                      <span>{selectedElement.style.objectScale || 100}%</span>
                    </div>
                    <div className="flex items-center">
                      <MinusCircle className="w-4 h-4 text-gray-400 mr-2" />
                      <Slider 
                        defaultValue={[selectedElement.style.objectScale || 100]}
                        min={100}
                        max={200}
                        step={1}
                        onValueChange={handleScaleChange}
                      />
                      <PlusCircle className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagePanel;
