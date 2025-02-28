
import { EditorElement } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface TextPanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
}

export const TextPanel = ({ element, updateElementStyle, updateElementContent }: TextPanelProps) => {
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [rgb, setRgb] = useState({ r: 151, g: 81, b: 242 });

  const handleColorChange = (hexColor: string) => {
    updateElementStyle("color", hexColor);
    // Convert hex to RGB for display purposes
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    setRgb({ r, g, b });
  };

  const increaseSize = () => {
    const currentSize = element.style.fontSize || 16;
    updateElementStyle("fontSize", currentSize + 1);
  };

  const decreaseSize = () => {
    const currentSize = element.style.fontSize || 16;
    if (currentSize > 8) {
      updateElementStyle("fontSize", currentSize - 1);
    }
  };

  const increaseLine = () => {
    const currentLine = element.style.lineHeight || 1.5;
    updateElementStyle("lineHeight", Math.min(3, currentLine + 0.1));
  };

  const decreaseLine = () => {
    const currentLine = element.style.lineHeight || 1.5;
    if (currentLine > 1) {
      updateElementStyle("lineHeight", currentLine - 0.1);
    }
  };

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="text-center font-medium text-lg mb-6">Texto</div>
      
      {/* Tabs */}
      <div className="flex rounded-md overflow-hidden bg-gray-100">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "content" ? "bg-white" : "text-gray-600"
          }`}
        >
          Conteúdo
        </button>
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === "style" ? "bg-purple-600 text-white" : "text-gray-600"
          }`}
        >
          Estilo
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-4">
          <textarea
            value={element.content}
            onChange={(e) => updateElementContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            placeholder="Digite seu texto aqui..."
          />
        </div>
      )}

      {/* Style Tab */}
      {activeTab === "style" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-gray-500 text-sm">Tipografia</div>
            <Select
              value={element.style.fontFamily || "Arial"}
              onValueChange={(value) => updateElementStyle("fontFamily", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha uma fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Inter">Inter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-gray-500 text-sm">Estilo de fonte</div>
            <div className="flex items-center space-x-4">
              <Select
                value={element.style.fontWeight || "medium"}
                onValueChange={(value) => updateElementStyle("fontWeight", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Regular</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <button
                  className="p-2 rounded border hover:bg-gray-50"
                  onClick={() => updateElementStyle("fontStyle", element.style.fontStyle === "italic" ? "normal" : "italic")}
                >
                  <span className="text-lg italic">I</span>
                </button>
                <button
                  className="p-2 rounded border hover:bg-gray-50"
                  onClick={() => updateElementStyle("textDecoration", element.style.textDecoration === "underline" ? "none" : "underline")}
                >
                  <span className="text-lg underline">U</span>
                </button>
                <button
                  className="p-2 rounded border hover:bg-gray-50"
                  onClick={() => updateElementStyle("textDecoration", element.style.textDecoration === "line-through" ? "none" : "line-through")}
                >
                  <span className="text-lg line-through">S</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Tamanho</span>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl">A</span>
                  <span className="text-sm">a</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={decreaseSize} className="p-2 border rounded hover:bg-gray-50">−</button>
                <span className="px-2">{element.style.fontSize || 16}</span>
                <button onClick={increaseSize} className="p-2 border rounded hover:bg-gray-50">+</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-gray-500 text-sm">Parágrafo</div>
              <div className="flex items-center space-x-2">
                <button
                  className={`p-2 border rounded hover:bg-gray-50 ${element.style.textAlign === 'left' ? 'bg-gray-100' : ''}`}
                  onClick={() => updateElementStyle("textAlign", "left")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="17" y1="10" x2="3" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="17" y1="18" x2="3" y2="18"></line>
                  </svg>
                </button>
                <button
                  className={`p-2 border rounded hover:bg-gray-50 ${element.style.textAlign === 'center' ? 'bg-gray-100' : ''}`}
                  onClick={() => updateElementStyle("textAlign", "center")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="10" x2="3" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="21" y1="18" x2="3" y2="18"></line>
                  </svg>
                </button>
                <button
                  className={`p-2 border rounded hover:bg-gray-50 ${element.style.textAlign === 'right' ? 'bg-gray-100' : ''}`}
                  onClick={() => updateElementStyle("textAlign", "right")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="10" x2="7" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="21" y1="18" x2="7" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Altura da linha</span>
                <div className="flex flex-col">
                  <span>↑</span>
                  <span>↓</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={decreaseLine} className="p-2 border rounded hover:bg-gray-50">−</button>
                <span className="px-2">{(element.style.lineHeight || 1.5).toFixed(1)}</span>
                <button onClick={increaseLine} className="p-2 border rounded hover:bg-gray-50">+</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-gray-500 text-sm">Alinhamento</div>
              <div className="flex items-center space-x-2">
                <button
                  className={`p-2 border rounded hover:bg-gray-50 ${element.style.verticalAlign === 'top' ? 'bg-gray-100' : ''}`}
                  onClick={() => updateElementStyle("verticalAlign", "top")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    <line x1="8" y1="6" x2="16" y2="6"></line>
                  </svg>
                </button>
                <button
                  className={`p-2 border rounded hover:bg-gray-50 ${element.style.verticalAlign === 'middle' ? 'bg-gray-100' : ''}`}
                  onClick={() => updateElementStyle("verticalAlign", "middle")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </button>
                <button
                  className={`p-2 border rounded hover:bg-gray-50 ${element.style.verticalAlign === 'bottom' ? 'bg-gray-100' : ''}`}
                  onClick={() => updateElementStyle("verticalAlign", "bottom")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    <line x1="8" y1="18" x2="16" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-gray-500 text-sm">Cor</div>
            <div 
              className="w-full h-40 rounded-md cursor-pointer"
              style={{
                background: "linear-gradient(to bottom, white 0%, black 100%), linear-gradient(to right, rgba(0,0,0,0) 0%, #9751F2 100%)",
                backgroundBlendMode: "multiply" 
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                
                // Calculate color based on position
                const r = Math.round(255 * (1 - y) * x + 151 * (1 - x));
                const g = Math.round(255 * (1 - y) * x + 81 * (1 - x));
                const b = Math.round(255 * (1 - y) * x + 242 * (1 - x));
                
                const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                handleColorChange(hexColor);
              }}
            >
              <div 
                className="w-6 h-6 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  position: "absolute", 
                  left: "50%", 
                  top: "50%",
                  backgroundColor: element.style.color || "#9751F2"
                }}
              />
            </div>
            
            {/* Color Sliders */}
            <div className="space-y-2 mt-3">
              <div className="w-full h-6 rounded-full relative" style={{background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)"}}>
                <div 
                  className="absolute w-4 h-4 bg-white border rounded-full shadow-md top-1/2 transform -translate-y-1/2"
                  style={{ left: `calc(${Math.round((rgb.r + rgb.g + rgb.b) / 3 / 255 * 100)}% - 8px)` }}
                ></div>
              </div>
              
              <div className="w-full h-6 rounded-full relative" style={{background: "linear-gradient(to right, rgba(0,0,0,0), #9751F2)"}}>
                <div 
                  className="absolute w-4 h-4 bg-white border rounded-full shadow-md top-1/2 transform -translate-y-1/2"
                  style={{ left: `calc(100% - 8px)` }}
                ></div>
              </div>
            </div>
            
            {/* Color Values */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
              <div>
                <div className="font-medium">HEX</div>
                <div>{element.style.color || "#9751F2"}</div>
              </div>
              <div>
                <div className="font-medium">R</div>
                <div>{rgb.r}</div>
              </div>
              <div>
                <div className="font-medium">G</div>
                <div>{rgb.g}</div>
              </div>
              <div>
                <div className="font-medium">B</div>
                <div>{rgb.b}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
