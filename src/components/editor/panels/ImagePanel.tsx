
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCanvas } from "../CanvasContext";
import { useEffect, useState } from "react";
import { ANIMATION_PRESETS } from "../types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ImagePanelProps {
  element: any;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const ImagePanel = ({ element, updateElementStyle, updateElementContent, activeTab }: ImagePanelProps) => {
  const [imageUrl, setImageUrl] = useState(element?.content || "");
  const { handleImageUpload } = useCanvas();

  useEffect(() => {
    if (element) {
      setImageUrl(element.content);
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
};
