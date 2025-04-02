
import { useEffect, useState } from "react";
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
import { Image, Link, Info } from "lucide-react";
import { toast } from "sonner";

interface ImagePanelProps {
  selectedElement: EditorElement;
  updateElementStyle?: (property: string, value: any) => void;
}

const ImagePanel = ({ selectedElement, updateElementStyle }: ImagePanelProps) => {
  const { updateElementContent, handleImageUpload } = useCanvas();

  const [activeTab, setActiveTab] = useState<string>("content");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(selectedElement?.content || "");
  const [linkUrl, setLinkUrl] = useState<string>(selectedElement?.link || "");
  const [altText, setAltText] = useState<string>(selectedElement?.alt || "");
  const [openInNewTab, setOpenInNewTab] = useState<boolean>(selectedElement?.openInNewTab || false);
  const [sizeMode, setSizeMode] = useState<"original" | "fill" | "scale">(
    selectedElement?.style?.objectFit === "contain" 
      ? "original" 
      : selectedElement?.style?.objectFit === "fill" 
        ? "fill" 
        : "scale"
  );
  const [scaleValue, setScaleValue] = useState<number>(
    selectedElement?.style?.scale ? selectedElement.style.scale * 100 : 100
  );

  // Atualiza os estados quando o elemento selecionado muda
  useEffect(() => {
    if (selectedElement?.type === "image") {
      setImageUrl(selectedElement.content || "");
      setLinkUrl(selectedElement.link || "");
      setAltText(selectedElement.alt || "");
      setOpenInNewTab(selectedElement.openInNewTab || false);
      
      // Determine size mode based on objectFit
      if (selectedElement.style.objectFit === "contain") {
        setSizeMode("original");
      } else if (selectedElement.style.objectFit === "fill") {
        setSizeMode("fill");
      } else if (selectedElement.style.objectFit === "cover") {
        setSizeMode("scale");
        setScaleValue(selectedElement.style.scale ? selectedElement.style.scale * 100 : 100);
      }
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
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    updateElementContent(url);
  };

  const handleOpacityChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("opacity", value[0] / 100); // Converte para escala de 0 a 1
    }
  };

  const handleSizeModeChange = (mode: "original" | "fill" | "scale") => {
    setSizeMode(mode);
    
    if (updateElementStyle) {
      if (mode === "original") {
        updateElementStyle("objectFit", "contain");
      } else if (mode === "fill") {
        updateElementStyle("objectFit", "fill");
      } else if (mode === "scale") {
        updateElementStyle("objectFit", "cover");
        // Reset scale to 100% when switching to scale mode
        if (!selectedElement.style.scale) {
          updateElementStyle("scale", 1);
          setScaleValue(100);
        }
      }
    }
  };

  const handleScaleChange = (value: number[]) => {
    const scaleValue = value[0];
    setScaleValue(scaleValue);
    
    if (updateElementStyle) {
      updateElementStyle("scale", scaleValue / 100); // Converte para escala de 0 a 1
    }
  };

  const handlePositionChange = (axis: "xPercent" | "yPercent", value: number) => {
    if (updateElementStyle) {
      updateElementStyle(axis, value);
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkUrl(url);
    
    // Update link in the element
    if (selectedElement) {
      const updatedElement = { ...selectedElement, link: url };
      updateElementContent(updatedElement.content, updatedElement);
    }
  };

  const handleOpenInNewTabChange = (checked: boolean) => {
    setOpenInNewTab(checked);
    
    // Update openInNewTab in the element
    if (selectedElement) {
      const updatedElement = { ...selectedElement, openInNewTab: checked };
      updateElementContent(updatedElement.content, updatedElement);
    }
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAltText(text);
    
    // Update alt text in the element
    if (selectedElement) {
      const updatedElement = { ...selectedElement, alt: text };
      updateElementContent(updatedElement.content, updatedElement);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg">
      <div className="flex items-center justify-center">
        <div className="text-lg font-medium">Imagem</div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

          <div className="space-y-4 mt-4">
            <div className="flex items-center">
              <Link className="w-5 h-5 text-gray-500 mr-2" />
              <div className="text-sm font-medium">Vincular a</div>
            </div>
            
            <Select defaultValue="web">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de link" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="https://exemplo.com"
              value={linkUrl}
              onChange={handleLinkChange}
            />
            
            <div className="flex items-center space-x-2">
              <Switch
                id="open-new-tab"
                checked={openInNewTab}
                onCheckedChange={handleOpenInNewTabChange}
              />
              <Label htmlFor="open-new-tab" className="text-sm">
                Abra o link em uma nova guia
              </Label>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-gray-500 mr-2" />
              <div className="text-sm font-medium">Texto alternativo</div>
            </div>
            
            <Input
              placeholder="Descreva o que você vê na imagem"
              value={altText}
              onChange={handleAltTextChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="text-sm font-medium mb-2">Tamanho</div>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-md">
              <Button
                variant={sizeMode === "original" ? "default" : "ghost"}
                className={`${sizeMode === "original" ? "bg-white shadow-sm" : ""}`}
                onClick={() => handleSizeModeChange("original")}
              >
                Original
              </Button>
              <Button
                variant={sizeMode === "fill" ? "default" : "ghost"}
                className={`${sizeMode === "fill" ? "bg-white shadow-sm" : ""}`}
                onClick={() => handleSizeModeChange("fill")}
              >
                Preencher
              </Button>
              <Button
                variant={sizeMode === "scale" ? "default" : "ghost"}
                className={`${sizeMode === "scale" ? "bg-purple-600 text-white" : ""}`}
                onClick={() => handleSizeModeChange("scale")}
              >
                Escala
              </Button>
            </div>

            {sizeMode === "scale" && (
              <div className="space-y-4 mt-4">
                <div className="text-center text-sm text-gray-500">{scaleValue}%</div>
                <Slider
                  value={[scaleValue]}
                  min={10}
                  max={200}
                  step={1}
                  onValueChange={handleScaleChange}
                />
                
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Posição da imagem</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <Label htmlFor="x-position" className="text-sm text-gray-500">Posição X</Label>
                      <Input
                        id="x-position"
                        type="number"
                        min={0}
                        max={100}
                        value={selectedElement.style.xPercent !== undefined ? selectedElement.style.xPercent : 50}
                        onChange={(e) => handlePositionChange("xPercent", parseInt(e.target.value, 10))}
                        className="mt-1 w-20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="y-position" className="text-sm text-gray-500">Posição Y</Label>
                      <Input
                        id="y-position"
                        type="number"
                        min={0}
                        max={100}
                        value={selectedElement.style.yPercent !== undefined ? selectedElement.style.yPercent : 50}
                        onChange={(e) => handlePositionChange("yPercent", parseInt(e.target.value, 10))}
                        className="mt-1 w-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div>
              <div className="text-sm font-medium mb-2">Opacidade</div>
              <Slider
                defaultValue={[selectedElement.style.opacity ? selectedElement.style.opacity * 100 : 100]}
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagePanel;
