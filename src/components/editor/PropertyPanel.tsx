
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TextPanel } from "./panels/TextPanel";
import ImagePanel from "./panels/ImagePanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { ArtboardPanel } from "./panels/ArtboardPanel";
import { useCanvas } from "./CanvasContext";
import { EditorElement, BannerSize } from "./types";
import { copyElementToAllFormats, clearFormatSpecificStyles, hasFormatSpecificStyles } from "./utils/formatConversion";
import { toast } from "sonner";

// Define interfaces for all panel props
interface PropertyPanelProps {
  selectedElement?: EditorElement | null;
  updateElementStyle?: (property: string, value: any) => void;
  updateElementContent?: (content: string) => void;
  psdBackgroundColor?: string | null;
}

// Componentes temporários para os painéis que ainda não existem
const LayoutPanel = () => <div>Painel de Layout</div>;
const ContainerPanel = () => <div>Painel de Container</div>;

const PropertyPanel: React.FC<PropertyPanelProps> = ({ psdBackgroundColor }) => {
  const { 
    selectedElement, 
    selectedSize,
    setElements,
    elements,
    updateElementStyle,
    updateElementContent,
    updateElementAttribute,
    artboardBackgroundColor,
    updateArtboardBackground,
    activeSizes
  } = useCanvas();

  // Track active tab state
  const [activeTab, setActiveTab] = React.useState("content");

  // Função para aplicar a cor de fundo do PSD
  const applyPsdBackgroundColor = () => {
    if (psdBackgroundColor && updateArtboardBackground) {
      console.log("APLICANDO COR DE FUNDO DO PSD:", psdBackgroundColor);
      updateArtboardBackground(psdBackgroundColor);
    } else {
      console.log("NÃO FOI POSSÍVEL APLICAR A COR DE FUNDO:", { 
        psdBackgroundColor, 
        updateFunctionExists: !!updateArtboardBackground 
      });
    }
  };

  // Verificar se o elemento selecionado possui estilos específicos para este formato
  const hasSpecificStyles = selectedElement ? 
    hasFormatSpecificStyles(selectedElement, selectedSize.name) : false;

  // Função para adaptar o elemento selecionado para todos os formatos
  const handleAdaptToAllFormats = () => {
    if (!selectedElement) return;
    
    const updatedElement = copyElementToAllFormats(
      selectedElement, 
      selectedSize, 
      activeSizes
    );
    
    // Atualizar o elemento no estado
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === selectedElement.id ? updatedElement : el
      )
    );
  };

  // Função para limpar adaptações específicas de formato
  const handleClearFormatStyles = () => {
    if (!selectedElement) return;
    
    const updatedElement = clearFormatSpecificStyles(
      selectedElement, 
      selectedSize.name
    );
    
    // Atualizar o elemento no estado
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === selectedElement.id ? updatedElement : el
      )
    );
    
    toast.success(`Adaptações para o formato ${selectedSize.name} removidas`);
  };

  return (
    <div className="p-4 space-y-4 bg-secondary rounded-md h-full">
      <div className="flex items-center justify-center">
        <div className="text-lg font-medium">Propriedades</div>
      </div>

      {selectedElement && (
        <div className="bg-background rounded-md p-2">
          <div className="text-sm font-medium mb-2">Formato Atual: {selectedSize.name}</div>
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdaptToAllFormats}
              className="w-full text-xs"
            >
              Adaptar para todos os formatos
            </Button>
          </div>
          {hasSpecificStyles && (
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleClearFormatStyles}
                className="w-full text-xs text-red-500"
              >
                Remover adaptações neste formato
              </Button>
            </div>
          )}
        </div>
      )}

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
              {selectedElement.type === "image" && (
                <ImagePanel 
                  selectedElement={selectedElement} 
                  updateElementStyle={updateElementStyle} 
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
              {selectedElement.type === "image" && (
                <ImagePanel 
                  selectedElement={selectedElement} 
                  updateElementStyle={updateElementStyle} 
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
          </>
        ) : (
          <TabsContent value="artboard" className="space-y-2">
            <ArtboardPanel 
              selectedSize={selectedSize} 
              updateArtboardBackground={updateArtboardBackground}
              artboardBackgroundColor={artboardBackgroundColor}
            />
            
            {/* Exibir a cor de fundo do PSD, se disponível */}
            {psdBackgroundColor && (
              <div className="mt-4 p-2 border rounded-md">
                <div className="text-sm font-medium mb-2">Cor de fundo do PSD</div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-md border" 
                    style={{ backgroundColor: psdBackgroundColor }}
                  ></div>
                  <div className="text-xs">{psdBackgroundColor}</div>
                  <button
                    onClick={applyPsdBackgroundColor}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md ml-auto"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PropertyPanel;
