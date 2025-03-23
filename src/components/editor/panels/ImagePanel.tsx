
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCanvas } from "../CanvasContext";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const ImagePanel = () => {
  const {
    selectedElement,
    updateElementStyle,
    updateElement,
  } = useCanvas();

  const [objectScale, setObjectScale] = useState<number>(100);
  const [objectPositionX, setObjectPositionX] = useState<number>(50);
  const [objectPositionY, setObjectPositionY] = useState<number>(50);
  const [overlayColor, setOverlayColor] = useState<string>("#000000");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0);
  
  useEffect(() => {
    if (selectedElement && selectedElement.type === "image") {
      // Load current values when selected element changes
      setObjectScale(selectedElement.style.objectScale || 100);
      setObjectPositionX(selectedElement.style.objectPositionX || 50);
      setObjectPositionY(selectedElement.style.objectPositionY || 50);
      setOverlayColor(selectedElement.style.overlayColor || "#000000");
      setOverlayOpacity(selectedElement.style.overlayOpacity || 0);
    }
  }, [selectedElement]);

  // Use arrow keys to move the image within the container when in scale mode
  useHotkeys('alt+left', () => {
    if (selectedElement?.type === 'image' && selectedElement.style.objectFit === 'scale-down') {
      const newX = Math.max(0, (selectedElement.style.objectPositionX || 50) - 1);
      setObjectPositionX(newX);
      updateElementStyle(selectedElement.id, { objectPositionX: newX });
    }
  }, [selectedElement]);

  useHotkeys('alt+right', () => {
    if (selectedElement?.type === 'image' && selectedElement.style.objectFit === 'scale-down') {
      const newX = Math.min(100, (selectedElement.style.objectPositionX || 50) + 1);
      setObjectPositionX(newX);
      updateElementStyle(selectedElement.id, { objectPositionX: newX });
    }
  }, [selectedElement]);

  useHotkeys('alt+up', () => {
    if (selectedElement?.type === 'image' && selectedElement.style.objectFit === 'scale-down') {
      const newY = Math.max(0, (selectedElement.style.objectPositionY || 50) - 1);
      setObjectPositionY(newY);
      updateElementStyle(selectedElement.id, { objectPositionY: newY });
    }
  }, [selectedElement]);

  useHotkeys('alt+down', () => {
    if (selectedElement?.type === 'image' && selectedElement.style.objectFit === 'scale-down') {
      const newY = Math.min(100, (selectedElement.style.objectPositionY || 50) + 1);
      setObjectPositionY(newY);
      updateElementStyle(selectedElement.id, { objectPositionY: newY });
    }
  }, [selectedElement]);

  if (!selectedElement || selectedElement.type !== "image") {
    return null;
  }

  const handleObjectFitChange = (value: string) => {
    const newStyle: any = {
      objectFit: value as "contain" | "cover" | "fill" | "none" | "scale-down",
    };
    
    updateElementStyle(selectedElement.id, newStyle);
  };

  const handleOpacityChange = (value: number) => {
    updateElementStyle(selectedElement.id, { opacity: value / 100 });
  };

  const handleScaleChange = (value: number[]) => {
    const scaleValue = value[0];
    setObjectScale(scaleValue);
    updateElementStyle(selectedElement.id, { objectScale: scaleValue });
  };

  const handlePositionXChange = (value: number[]) => {
    const posX = value[0];
    setObjectPositionX(posX);
    updateElementStyle(selectedElement.id, { objectPositionX: posX });
  };

  const handlePositionYChange = (value: number[]) => {
    const posY = value[0];
    setObjectPositionY(posY);
    updateElementStyle(selectedElement.id, { objectPositionY: posY });
  };

  const handleOverlayColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setOverlayColor(color);
    updateElementStyle(selectedElement.id, { overlayColor: color });
  };

  const handleOverlayOpacityChange = (value: number[]) => {
    const opacity = value[0];
    setOverlayOpacity(opacity);
    updateElementStyle(selectedElement.id, { overlayOpacity: opacity / 100 });
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const alt = e.target.value;
    updateElement(selectedElement.id, { alt });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="alt-text">Texto Alternativo</Label>
              <Input
                id="alt-text"
                placeholder="Descreva a imagem..."
                value={selectedElement.alt || ""}
                onChange={handleAltTextChange}
              />
            </div>

            <div>
              <Label>Ajuste da Imagem</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <Button
                  variant={selectedElement.style.objectFit === "cover" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleObjectFitChange("cover")}
                >
                  Cobrir
                </Button>
                <Button
                  variant={selectedElement.style.objectFit === "contain" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleObjectFitChange("contain")}
                >
                  Conter
                </Button>
                <Button
                  variant={selectedElement.style.objectFit === "scale-down" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleObjectFitChange("scale-down")}
                >
                  Escala
                </Button>
              </div>
            </div>

            {selectedElement.style.objectFit === "scale-down" && (
              <>
                <div>
                  <div className="flex justify-between">
                    <Label>Escala</Label>
                    <div className="text-xs text-gray-500">{objectScale}%</div>
                  </div>
                  <Slider
                    defaultValue={[100]}
                    value={[objectScale]}
                    max={200}
                    min={20}
                    step={1}
                    onValueChange={handleScaleChange}
                    className="mt-1"
                  />
                  <div className="mt-1 text-xs text-gray-400">Alt + Setas para ajustar posição</div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Posição Horizontal</Label>
                    <div className="text-xs text-gray-500">{objectPositionX}%</div>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    value={[objectPositionX]}
                    max={100}
                    min={0}
                    step={1}
                    onValueChange={handlePositionXChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Posição Vertical</Label>
                    <div className="text-xs text-gray-500">{objectPositionY}%</div>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    value={[objectPositionY]}
                    max={100}
                    min={0}
                    step={1}
                    onValueChange={handlePositionYChange}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div>
            <div className="flex justify-between">
              <Label htmlFor="opacity">Opacidade</Label>
              <div className="text-xs text-gray-500">
                {Math.round((selectedElement.style.opacity || 1) * 100)}%
              </div>
            </div>
            <Slider
              defaultValue={[100]}
              value={[(selectedElement.style.opacity || 1) * 100]}
              max={100}
              step={1}
              onValueChange={(value) => handleOpacityChange(value[0])}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="overlay-color">Cor de Sobreposição</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                id="overlay-color"
                value={overlayColor}
                onChange={handleOverlayColorChange}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={overlayColor}
                onChange={handleOverlayColorChange}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <Label htmlFor="overlay-opacity">Opacidade da Sobreposição</Label>
              <div className="text-xs text-gray-500">{overlayOpacity}%</div>
            </div>
            <Slider
              defaultValue={[0]}
              value={[overlayOpacity]}
              max={100}
              step={1}
              onValueChange={(value) => handleOverlayOpacityChange(value)}
              className="mt-1"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
