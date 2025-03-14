
import { useState } from "react";
import { EditorElement } from "./types";
import { TextPanel } from "./panels/TextPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { AnimationPanel } from "./panels/AnimationPanel";
import { GenericPanel } from "./panels/GenericPanel";

interface PropertyPanelProps {
  selectedElement: EditorElement | null;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
}

export const PropertyPanel = ({ selectedElement, updateElementStyle, updateElementContent }: PropertyPanelProps) => {
  const [activeTab, setActiveTab] = useState("content");

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Selecione um elemento para editar suas propriedades
      </div>
    );
  }

  // Get element title based on type
  const getElementTitle = () => {
    if (selectedElement.type === 'text') return 'Texto';
    if (selectedElement.type === 'paragraph') return 'Parágrafo';
    if (selectedElement.type === 'image') return 'Imagem';
    if (selectedElement.type === 'button') return 'Botão';
    if (selectedElement.type === 'layout') return 'Container';
    if (selectedElement.type === 'container') return 'Container';
    if (selectedElement.type === 'divider') return 'Divisor';
    if (selectedElement.type === 'spacer') return 'Espaçador';
    if (selectedElement.type === 'logo') return 'Logo';
    if (selectedElement.type === 'video') return 'Vídeo';
    return 'Elemento';
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render the appropriate panel based on element type and active tab
  const renderElementPanel = () => {
    if (selectedElement.type === 'text' || selectedElement.type === 'paragraph') {
      return (
        <TextPanel
          element={selectedElement}
          updateElementStyle={updateElementStyle}
          updateElementContent={updateElementContent}
          activeTab={activeTab}
        />
      );
    } else if (selectedElement.type === 'image' || selectedElement.type === 'logo') {
      return (
        <ImagePanel
          element={selectedElement}
          updateElementStyle={updateElementStyle}
          updateElementContent={updateElementContent}
          activeTab={activeTab}
        />
      );
    } else if (selectedElement.type === 'button') {
      return (
        <ButtonPanel
          element={selectedElement}
          updateElementStyle={updateElementStyle}
          updateElementContent={updateElementContent}
          activeTab={activeTab}
        />
      );
    } else if (activeTab === 'animation') {
      return (
        <AnimationPanel element={selectedElement} updateElementStyle={updateElementStyle} />
      );
    } else {
      // Para outros tipos de elementos, usamos o painel genérico
      return (
        <GenericPanel 
          element={selectedElement} 
          updateElementStyle={updateElementStyle}
          updateElementContent={updateElementContent}
          activeTab={activeTab}
        />
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Element Title */}
      <div className="text-center py-4 text-lg font-medium">
        {getElementTitle()}
      </div>

      {/* Tab Selector at the top for non-Animation panels */}
      {selectedElement.type !== 'layout' && selectedElement.type !== 'container' && 
       selectedElement.type !== 'divider' && selectedElement.type !== 'spacer' && (
        <div className="mx-4 mb-4">
          <div className="flex h-[39px] p-1 justify-center items-center gap-0 rounded bg-[#E9EAEB]">
            <div
              className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm font-['Geist',sans-serif] text-xs cursor-pointer ${activeTab === "content" ? "bg-[#6941C6]  text-[#f5f5f5]" : "text-[#717680]"}`}
              onClick={() => handleTabChange("content")}
            >
              Conteúdo
            </div>
            <div
              className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm font-['Geist',sans-serif] text-xs cursor-pointer ${activeTab === "styles" ? "bg-[#6941C6] text-[#f5f5f5]" : "text-[#717680]"}`}
              onClick={() => handleTabChange("styles")}
            >
              Estilo
            </div>
          </div>
        </div>
      )}

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {renderElementPanel()}
      </div>
    </div>
  );
};
