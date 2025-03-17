
import { useState } from "react";
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
import { Image, Link, CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, Minus, Plus, AlignCenter, AlignLeft, AlignRight } from "lucide-react";

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

  // Initialize state with selected element values when it changes
  useState(() => {
    if (selectedElement && selectedElement.type === "image") {
      setImageUrl(selectedElement.content as string);
      setAltText(selectedElement.alt || "");
      setLinkUrl(selectedElement.link || "");
      setOpenInNewTab(selectedElement.openInNewTab || false);
    }
  });

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
    
    // Update the element in the canvas context
    const updatedElement: Partial<EditorElement> = {
      ...selectedElement,
      link: url,
    };
    // We need to cast here because updateElementContent expects a string
    updateElementContent(selectedElement.content as string);
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAltText(text);
    
    // Update the element in the canvas context
    const updatedElement: Partial<EditorElement> = {
      ...selectedElement,
      alt: text,
    };
    // We need to cast here because updateElementContent expects a string
    updateElementContent(selectedElement.content as string);
  };

  const handleOpenInNewTabChange = (checked: boolean) => {
    setOpenInNewTab(checked);
    
    // Update the element in the canvas context
    const updatedElement: Partial<EditorElement> = {
      ...selectedElement,
      openInNewTab: checked,
    };
    // We need to cast here because updateElementContent expects a string
    updateElementContent(selectedElement.content as string);
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
              <div className="text-center text-sm text-gray-500 mb-2">Escala</div>
              <Slider 
                defaultValue={[selectedElement.style.opacity ? selectedElement.style.opacity * 100 : 100]}
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
              />
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
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center text-sm text-gray-500">Posição</div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateElementStyle && updateElementStyle("objectPosition", "left")}
                className={selectedElement.style.objectPosition === "left" ? "bg-purple-100" : ""}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateElementStyle && updateElementStyle("objectPosition", "center")}
                className={selectedElement.style.objectPosition === "center" ? "bg-purple-100" : ""}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateElementStyle && updateElementStyle("objectPosition", "right")}
                className={selectedElement.style.objectPosition === "right" ? "bg-purple-100" : ""}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagePanel;
