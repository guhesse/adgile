import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextPanel from "./panels/TextPanel";
import ImagePanel from "./panels/ImagePanel";
import ButtonPanel from "./panels/ButtonPanel";
import LayoutPanel from "./panels/LayoutPanel";
import ContainerPanel from "./panels/ContainerPanel";
import ArtboardPanel from "./panels/ArtboardPanel";
import { useCanvas } from "./CanvasContext";

const PropertyPanel = () => {
  const { selectedElement } = useCanvas();

  return (
    <div className="p-4 space-y-4 bg-secondary rounded-md h-full">
      <div className="flex items-center justify-center">
        <div className="text-lg font-medium">Propriedades</div>
      </div>

      <Tabs defaultValue="content" className="space-y-2">
        <TabsList className="w-full flex justify-center">
          {selectedElement && (
            <>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="style">Estilo</TabsTrigger>
              {selectedElement.type === "image" && (
                <TabsTrigger value="image">Imagem</TabsTrigger>
              )}
            </>
          )}
        </TabsList>

        {selectedElement ? (
          <>
            <TabsContent value="content" className="space-y-2">
              {selectedElement.type === "text" && <TextPanel />}
              {selectedElement.type === "button" && <ButtonPanel />}
              {selectedElement.type === "layout" && <LayoutPanel />}
              {selectedElement.type === "container" && <ContainerPanel />}
            </TabsContent>
            <TabsContent value="style" className="space-y-2">
              {selectedElement.type === "text" && <TextPanel />}
              {selectedElement.type === "button" && <ButtonPanel />}
              {selectedElement.type === "layout" && <LayoutPanel />}
              {selectedElement.type === "container" && <ContainerPanel />}
            </TabsContent>
            <TabsContent value="image" className="space-y-2">
              {selectedElement.type === "image" && <ImagePanel />}
            </TabsContent>
          </>
        ) : (
          <TabsContent value="artboard" className="space-y-2">
            <ArtboardPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PropertyPanel;
