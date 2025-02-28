
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BLANK_LAYOUTS, PRESET_LAYOUTS, LayoutTemplate } from "../types";

interface LayoutsPanelProps {
  addLayout: (template: LayoutTemplate) => void;
}

export const LayoutsPanel = ({ addLayout }: LayoutsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"content" | "layouts">("content");

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center font-medium text-sm ${
            activeTab === "content" ? "border-b-2 border-teal-500 text-teal-600" : ""
          }`}
          onClick={() => setActiveTab("content")}
        >
          Conteúdo
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium text-sm ${
            activeTab === "layouts" ? "border-b-2 border-teal-500 text-teal-600" : ""
          }`}
          onClick={() => setActiveTab("layouts")}
        >
          Layouts
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2">LAYOUTS EM BRANCO</h3>
        <p className="text-sm text-gray-600 mb-4">Arraste para adicionar conteúdo ao seu e-mail</p>
        
        <div className="grid grid-cols-3 gap-3 mb-8">
          {BLANK_LAYOUTS.map((layout) => (
            <div 
              key={layout.id} 
              className="border rounded hover:border-teal-500 cursor-pointer transition-colors" 
              onClick={() => addLayout(layout)}
            >
              <div className="p-2 flex justify-center items-center">
                {layout.columns === 1 && (
                  <div className="border w-12 h-8 flex items-center justify-center"></div>
                )}
                {layout.columns === 2 && layout.id === "blank-2-left" && (
                  <div className="flex w-full space-x-1">
                    <div className="border w-4 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                  </div>
                )}
                {layout.columns === 2 && layout.id === "blank-2-right" && (
                  <div className="flex w-full space-x-1">
                    <div className="border flex-1 h-8"></div>
                    <div className="border w-4 h-8"></div>
                  </div>
                )}
                {layout.columns === 2 && layout.id === "blank-2-equal" && (
                  <div className="flex w-full space-x-1">
                    <div className="border flex-1 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                  </div>
                )}
                {layout.columns === 3 && (
                  <div className="flex w-full space-x-1">
                    <div className="border flex-1 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                  </div>
                )}
                {layout.columns === 4 && (
                  <div className="flex w-full space-x-1">
                    <div className="border flex-1 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                    <div className="border flex-1 h-8"></div>
                  </div>
                )}
              </div>
              <div className="text-center text-sm py-1">
                {layout.preview}
              </div>
              <div className="border-t px-2 py-1 text-center">
                <div className="text-xs text-gray-400">・・・・・</div>
              </div>
            </div>
          ))}
        </div>
        
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2">LAYOUTS PRÉ-CRIADOS</h3>
        <p className="text-sm text-gray-600 mb-4">Arraste para adicionar conteúdo ao seu e-mail</p>
        
        <div className="grid grid-cols-2 gap-3">
          {PRESET_LAYOUTS.map((layout) => (
            <div 
              key={layout.id} 
              className="border rounded hover:border-teal-500 cursor-pointer transition-colors"
              onClick={() => addLayout(layout)}
            >
              <div className="p-2 flex justify-center items-center h-20">
                {layout.id === "preset-image-text" && (
                  <div className="flex flex-col w-full">
                    <div className="border w-full h-10 flex items-center justify-center text-xs">Imagem</div>
                    <div className="border w-full h-6 mt-1 flex items-center justify-center text-xs">
                      <div className="w-10 border-t"></div>
                      <div className="w-10 border-t ml-1"></div>
                    </div>
                  </div>
                )}
                {layout.id === "preset-text-text" && (
                  <div className="flex flex-col w-full">
                    <div className="border w-full h-6 flex items-center justify-center text-xs">
                      <div className="w-10 border-t"></div>
                      <div className="w-10 border-t ml-1"></div>
                    </div>
                    <div className="border w-full h-6 mt-1 flex items-center justify-center text-xs">
                      <div className="w-10 border-t"></div>
                      <div className="w-10 border-t ml-1"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center text-xs py-1">
                {layout.name}
              </div>
              <div className="border-t px-2 py-1 text-center">
                <div className="text-xs text-gray-400">・・・・・</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
