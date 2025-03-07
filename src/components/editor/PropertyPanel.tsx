
import { useState } from "react";
import { EditorElement } from "./types";
import { TextPanel } from "./panels/TextPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { AnimationPanel } from "./panels/AnimationPanel";

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
    if (selectedElement.type === 'image') return 'Imagem';
    if (selectedElement.type === 'button') return 'Botão';
    if (selectedElement.type === 'layout') return 'Container';
    return 'Elemento';
  };

  // Render the appropriate panel based on element type and active tab
  const renderElementPanel = () => {
    if (selectedElement.type === 'text') {
      return (
        <TextPanel 
          element={selectedElement} 
          updateElementStyle={updateElementStyle} 
          updateElementContent={updateElementContent} 
          activeTab={activeTab}
        />
      );
    } else if (selectedElement.type === 'image') {
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
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Element Title */}
      <div className="text-center py-4 text-lg font-medium">
        {getElementTitle()}
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {renderElementPanel()}
      </div>
      
      {/* Tabs Selector - Now at the bottom */}
      <div className="flex h-[39px] p-1 justify-center items-center gap-0 rounded bg-[#E9EAEB] mx-4 my-4">
        <div 
          className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm text-[#717680] font-['Geist',sans-serif] text-xs cursor-pointer ${activeTab === "content" ? "bg-white" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          Conteúdo
        </div>
        <div 
          className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm text-[#717680] font-['Geist',sans-serif] text-xs cursor-pointer ${activeTab === "styles" ? "bg-white" : ""}`}
          onClick={() => setActiveTab("styles")}
        >
          Estilo
        </div>
      </div>
    </div>
  );
};
