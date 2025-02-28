
import { EditorElement } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface TextPanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
}

export const TextPanel = ({ element, updateElementStyle, updateElementContent }: TextPanelProps) => {
  // Componente de conteúdo conforme imagem de referência
  const ContentPanel = () => (
    <div className="space-y-6 p-4">
      <div className="text-center text-sm text-gray-500 mb-4">Conteúdo</div>
      
      <div className="border rounded-lg p-3">
        <textarea
          value={element.content}
          onChange={(e) => updateElementContent(e.target.value)}
          className="w-full resize-none border-0 focus:outline-none"
          rows={4}
          placeholder="Text Element"
        />
      </div>
      
      <div>
        <div className="text-sm text-gray-500 mb-2">Vincular a</div>
        <Select defaultValue="webpage">
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="Página da Web" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webpage">Página da Web</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
          </SelectContent>
        </Select>
        
        <input
          type="text"
          placeholder="Link"
          className="w-full px-3 py-2 border rounded-md"
        />
        
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox id="newTab" />
          <label htmlFor="newTab" className="text-sm text-gray-700">
            Abrir link em nova guia
          </label>
        </div>
      </div>
    </div>
  );
  
  // Componente de estilo (usando o mesmo que já temos)
  const StylePanel = () => (
    <div className="space-y-4 p-4">
      <div className="text-center text-sm text-gray-500 mb-4">Estilo</div>
      
      {/* Estilo existente foi mantido */}
      <div>
        <h3 className="text-sm font-medium mb-2">Typography</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Font</label>
            <Select
              value={element.style.fontFamily}
              onValueChange={(value) => updateElementStyle("fontFamily", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Size</label>
              <input
                type="number"
                value={element.style.fontSize}
                onChange={(e) => updateElementStyle("fontSize", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="8"
                max="72"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Line Height</label>
              <input
                type="number"
                value={element.style.lineHeight || 1.5}
                onChange={(e) => updateElementStyle("lineHeight", parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="1"
                max="3"
                step="0.1"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Color</label>
            <div className="flex mt-1">
              <input
                type="color"
                value={element.style.color}
                onChange={(e) => updateElementStyle("color", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={element.style.color}
                onChange={(e) => updateElementStyle("color", e.target.value)}
                className="flex-1 px-3 py-2 border rounded ml-2"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Alignment</label>
            <div className="flex space-x-2 mt-1">
              <button
                className={`px-3 py-2 border rounded flex-1 ${element.style.textAlign === 'left' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => updateElementStyle("textAlign", "left")}
              >
                Left
              </button>
              <button
                className={`px-3 py-2 border rounded flex-1 ${element.style.textAlign === 'center' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => updateElementStyle("textAlign", "center")}
              >
                Center
              </button>
              <button
                className={`px-3 py-2 border rounded flex-1 ${element.style.textAlign === 'right' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => updateElementStyle("textAlign", "right")}
              >
                Right
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // O corpo principal do componente TextPanel agora depende do que foi selecionado no PropertyPanel
  return (
    <div>
      {element.style.activeTab === "content" ? <ContentPanel /> : <StylePanel />}
    </div>
  );
};
