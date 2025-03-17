
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextPanel } from "./panels/TextPanel";
import ImagePanel from "./panels/ImagePanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { ArtboardPanel } from "./panels/ArtboardPanel";
import { useCanvas } from "./CanvasContext";
import { EditorElement, BannerSize } from "./types";

// Define interfaces for all panel props
interface PropertyPanelProps {
  selectedElement?: EditorElement | null;
  updateElementStyle?: (property: string, value: any) => void;
  updateElementContent?: (content: string) => void;
}

// Componentes temporários para os painéis que ainda não existem
const LayoutPanel = () => <div>Painel de Layout</div>;
const ContainerPanel = () => <div>Painel de Container</div>;

const PropertyPanel: React.FC = () => {
  const { 
    selectedElement, 
    selectedSize,
    updateElementStyle,
    updateElementContent,
    artboardBackgroundColor,
    updateArtboardBackground
  } = useCanvas();

  // Track active tab state
  const [activeTab, setActiveTab] = React.useState("content");

  return (
    <div className="p-4 space-y-4 bg-secondary rounded-md h-full">
      <div className="flex items-center justify-center">
        <div className="text-lg font-medium">Propriedades</div>
      </div>

      <Tabs 
        defaultValue="content" 
        className="space-y-2"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full flex justify-center">
          {selectedElement ? (
            <>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="style">Estilo</TabsTrigger>
              {selectedElement.type === "image" && (
                <TabsTrigger value="image">Imagem</TabsTrigger>
              )}
            </>
          ) : (
            <TabsTrigger value="artboard">Prancheta</TabsTrigger>
          )}
        </TabsList>

        {selectedElement ? (
          <>
            <TabsContent value="content" className="space-y-2">
              {selectedElement.type === "text" && (
                <TextPanel 
                  element={selectedElement} 
                  updateElementStyle={updateElementStyle}
                  updateElementContent={updateElementContent}
                  activeTab={activeTab}
                />
              )}
              {selectedElement.type === "button" && (
                <ButtonPanel 
                  element={selectedElement} 
                  updateElementStyle={updateElementStyle}
                  updateElementContent={updateElementContent}
                  activeTab={activeTab}
                />
              )}
              {selectedElement.type === "layout" && <LayoutPanel />}
              {selectedElement.type === "container" && <ContainerPanel />}
            </TabsContent>
            <TabsContent value="style" className="space-y-2">
              {selectedElement.type === "text" && (
                <TextPanel 
                  element={selectedElement} 
                  updateElementStyle={updateElementStyle}
                  updateElementContent={updateElementContent}
                  activeTab={activeTab}
                />
              )}
              {selectedElement.type === "button" && (
                <ButtonPanel 
                  element={selectedElement} 
                  updateElementStyle={updateElementStyle}
                  updateElementContent={updateElementContent}
                  activeTab={activeTab}
                />
              )}
              {selectedElement.type === "layout" && <LayoutPanel />}
              {selectedElement.type === "container" && <ContainerPanel />}
            </TabsContent>
            <TabsContent value="image" className="space-y-2">
              {selectedElement.type === "image" && (
                <ImagePanel 
                  selectedElement={selectedElement} 
                  updateElementStyle={updateElementStyle} 
                />
              )}
            </TabsContent>
          </>
        ) : (
          <TabsContent value="artboard" className="space-y-2">
            <ArtboardPanel 
              selectedSize={selectedSize} 
              updateArtboardBackground={updateArtboardBackground}
              artboardBackgroundColor={artboardBackgroundColor}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PropertyPanel;
