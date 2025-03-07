
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

  // Função para renderizar o painel com base no tipo do elemento
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

  // Determinar o título do elemento selecionado
  const getElementTitle = () => {
    if (selectedElement.type === 'text') return 'Texto';
    if (selectedElement.type === 'image') return 'Imagem';
    if (selectedElement.type === 'button') return 'Botão';
    if (selectedElement.type === 'layout') return 'Container';
    return 'Elemento';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-4 text-lg font-medium">
        {getElementTitle()}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderElementPanel()}
      </div>
      
      {/* Seletor de aba no rodapé */}
      <div className="p-4 border-t">
        <div className="flex rounded-md overflow-hidden bg-gray-100">
          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === "content" ? "bg-purple-600 text-white" : "text-gray-600"
            }`}
          >
            Conteúdo
          </button>
          <button
            onClick={() => setActiveTab("styles")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === "styles" ? "bg-purple-600 text-white" : "text-gray-600"
            }`}
          >
            Estilo
          </button>
        </div>
      </div>
    </div>
  );
};
