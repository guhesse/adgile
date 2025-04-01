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
import { Image, Link, CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight, Minus, Plus, AlignCenter, AlignLeft, AlignRight } from "lucide-react";

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

  // Atualiza os estados quando o elemento selecionado muda
  useEffect(() => {
    if (selectedElement?.type === "image") {
      setImageUrl(selectedElement.content || "");
      setLinkUrl(selectedElement.link || "");
      setAltText(selectedElement.alt || "");
      setOpenInNewTab(selectedElement.openInNewTab || false);
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

  const handleOpacityChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("opacity", value[0] / 100); // Converte para escala de 0 a 1
    }
  };

  const handleObjectFitChange = (fit: string) => {
    if (updateElementStyle) {
      updateElementStyle("objectFit", fit);
    }
  };

  const handleScaleChange = (value: number[]) => {
    if (updateElementStyle) {
      updateElementStyle("scale", value[0] / 100); // Escala de 0 a 1
    }
  };

  const handlePositionChange = (axis: "xPercent" | "yPercent", value: number) => {
    if (updateElementStyle) {
      updateElementStyle(axis, value);
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

            {selectedElement.style.objectFit === "cover" && (
              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-center text-sm text-gray-500 mb-2">Escala</div>
                  <Slider
                    defaultValue={[selectedElement.style.scale ? selectedElement.style.scale * 100 : 100]}
                    max={200}
                    step={1}
                    onValueChange={handleScaleChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="x-position" className="text-sm text-gray-500">Posição X</Label>
                    <Input
                      id="x-position"
                      type="number"
                      value={selectedElement.style.xPercent || 50}
                      onChange={(e) => handlePositionChange("xPercent", parseInt(e.target.value, 10))}
                      className="mt-1 w-20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y-position" className="text-sm text-gray-500">Posição Y</Label>
                    <Input
                      id="y-position"
                      type="number"
                      value={selectedElement.style.yPercent || 50}
                      onChange={(e) => handlePositionChange("yPercent", parseInt(e.target.value, 10))}
                      className="mt-1 w-20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImagePanel;
