
import { useState } from "react";
import { EditorElement } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignVerticalDistributeCenter,
  AlignEndVertical,
  MoveVertical,
  MoveHorizontal,
  Plus,
  Minus,
  Check
} from "lucide-react";

interface TextPanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const TextPanel = ({ element, updateElementStyle, updateElementContent, activeTab }: TextPanelProps) => {
  const [linkType, setLinkType] = useState("webpage");
  const [linkUrl, setLinkUrl] = useState("");
  const [newTab, setNewTab] = useState(true);
  const [colorPickerValue, setColorPickerValue] = useState(element.style.color || "#414651");

  // Font size controls
  const increaseFontSize = () => {
    const currentSize = element.style.fontSize || 16;
    updateElementStyle("fontSize", currentSize + 1);
  };

  const decreaseFontSize = () => {
    const currentSize = element.style.fontSize || 16;
    updateElementStyle("fontSize", Math.max(8, currentSize - 1));
  };

  // Line height controls
  const increaseLineHeight = () => {
    const currentLineHeight = element.style.lineHeight || 1.5;
    updateElementStyle("lineHeight", Math.min(3, parseFloat((currentLineHeight + 0.1).toFixed(1))));
  };

  const decreaseLineHeight = () => {
    const currentLineHeight = element.style.lineHeight || 1.5;
    updateElementStyle("lineHeight", Math.max(1, parseFloat((currentLineHeight - 0.1).toFixed(1))));
  };

  // Letter spacing controls
  const increaseLetterSpacing = () => {
    const currentSpacing = element.style.letterSpacing || 0;
    updateElementStyle("letterSpacing", parseFloat((currentSpacing + 0.1).toFixed(1)));
  };

  const decreaseLetterSpacing = () => {
    const currentSpacing = element.style.letterSpacing || 0;
    updateElementStyle("letterSpacing", Math.max(-0.5, parseFloat((currentSpacing - 0.1).toFixed(1))));
  };

  // Text style controls
  const toggleFontStyle = (style: string) => {
    if (style === 'italic') {
      updateElementStyle("fontStyle", element.style.fontStyle === "italic" ? "normal" : "italic");
    } else if (style === 'underline' || style === 'line-through') {
      const currentDecoration = element.style.textDecoration || "none";
      if (currentDecoration.includes(style)) {
        updateElementStyle("textDecoration", currentDecoration.replace(style, "").trim() || "none");
      } else {
        updateElementStyle("textDecoration", currentDecoration === "none" ? style : `${currentDecoration} ${style}`);
      }
    }
  };

  // Content Panel - for editing the content and link
  const ContentPanel = () => (
    <div className="space-y-6 p-4">
      <div className="text-center text-sm text-gray-500 mb-4">Conteúdo</div>

      <div className="border rounded-lg p-3 relative">
        <textarea
          value={element.content}
          onChange={(e) => updateElementContent(e.target.value)}
          className="w-full resize-none border-0 focus:outline-none min-h-[80px]"
          placeholder="Text Element"
        />
        <div className="w-2 h-2 bg-gray-600 opacity-60 absolute bottom-3 right-3"></div>
      </div>

      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Vincular a</div>

        <Select value={linkType} onValueChange={setLinkType}>
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
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Link"
          className="w-full px-3 py-2 border rounded-md bg-white"
        />

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="newTab"
            checked={newTab}
            onCheckedChange={(checked) => setNewTab(checked as boolean)}
          />
          <label htmlFor="newTab" className="text-sm text-gray-700">
            Abrir link em nova guia
          </label>
        </div>
      </div>
    </div>
  );

  // Style Panel - for typography, alignment, and colors
  const StylePanel = () => (
    <div className="space-y-4 p-4">
      <div className="text-center text-sm text-gray-500 mb-4">Estilo</div>

      {/* Typography Section */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Tipografia</div>
        <div className="flex items-center p-2 px-3 border rounded-md bg-white">
          <span className="flex-1 text-xs">
            {element.style.fontFamily || "Arial"}
          </span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Font Style Section */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Estilo de fonte</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center p-2 px-3 border rounded-md bg-white w-1/2 mr-2">
            <span className="flex-1 text-xs">
              {element.style.fontWeight === 'bold' ? "Bold" : "Medium"}
            </span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => toggleFontStyle("italic")}
              className={`p-2 rounded-md ${element.style.fontStyle === "italic" ? "bg-gray-200" : "bg-white border"}`}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => toggleFontStyle("underline")}
              className={`p-2 rounded-md ${element.style.textDecoration?.includes("underline") ? "bg-gray-200" : "bg-white border"}`}
            >
              <Underline size={16} />
            </button>
            <button
              onClick={() => toggleFontStyle("line-through")}
              className={`p-2 rounded-md ${element.style.textDecoration?.includes("line-through") ? "bg-gray-200" : "bg-white border"}`}
            >
              <Strikethrough size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Font Size, Line Height, Letter Spacing Controls */}
      <div className="flex justify-center space-x-4">
        {/* Font Size */}
        <div className="flex flex-col items-center space-y-1">
          <span className="text-xs text-gray-700">Aa</span>
          <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
            <button onClick={decreaseFontSize} className="p-1">
              <Minus size={14} />
            </button>
            <span className="mx-2 text-xs">{element.style.fontSize || 16}</span>
            <button onClick={increaseFontSize} className="p-1">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Line Height */}
        <div className="flex flex-col items-center space-y-1">
          <span className="text-xs text-gray-700">
            <MoveVertical size={14} />
          </span>
          <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
            <button onClick={decreaseLineHeight} className="p-1">
              <Minus size={14} />
            </button>
            <span className="mx-2 text-xs">{element.style.lineHeight || 1.5}</span>
            <button onClick={increaseLineHeight} className="p-1">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="flex flex-col items-center space-y-1">
          <span className="text-xs text-gray-700">
            <MoveHorizontal size={14} />
          </span>
          <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
            <button onClick={decreaseLetterSpacing} className="p-1">
              <Minus size={14} />
            </button>
            <span className="mx-2 text-xs">{element.style.letterSpacing || 0}</span>
            <button onClick={increaseLetterSpacing} className="p-1">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Parágrafo</div>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => updateElementStyle("textAlign", "left")}
            className={`p-2 rounded-md ${element.style.textAlign === "left" ? "bg-gray-200" : "bg-white border"}`}
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => updateElementStyle("textAlign", "center")}
            className={`p-2 rounded-md ${element.style.textAlign === "center" ? "bg-gray-200" : "bg-white border"}`}
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => updateElementStyle("textAlign", "right")}
            className={`p-2 rounded-md ${element.style.textAlign === "right" ? "bg-gray-200" : "bg-white border"}`}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      {/* Vertical Alignment */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Alinhamento</div>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => updateElementStyle("verticalAlign", "top")}
            className={`p-2 rounded-md ${element.style.verticalAlign === "top" ? "bg-gray-200" : "bg-white border"}`}
          >
            <AlignStartVertical size={16} />
          </button>
          <button
            onClick={() => updateElementStyle("verticalAlign", "middle")}
            className={`p-2 rounded-md ${element.style.verticalAlign === "middle" ? "bg-gray-200" : "bg-white border"}`}
          >
            <AlignVerticalDistributeCenter size={16} />
          </button>
          <button
            onClick={() => updateElementStyle("verticalAlign", "bottom")}
            className={`p-2 rounded-md ${element.style.verticalAlign === "bottom" ? "bg-gray-200" : "bg-white border"}`}
          >
            <AlignEndVertical size={16} />
          </button>
        </div>
      </div>

      {/* Color Section */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Cor</div>

        <div className="relative rounded-md overflow-hidden">
          {/* Color gradient placeholder */}
          <div className="w-full h-[120px] bg-gradient-to-br from-purple-500 via-blue-400 to-white"></div>

          {/* Color preview and sliders */}
          <div className="flex justify-between items-center mt-2">
            <div
              className="w-7 h-7 rounded border"
              style={{ backgroundColor: colorPickerValue }}
            ></div>

            <div className="flex-1 ml-4 space-y-2">
              {/* Color hue slider */}
              <input
                type="range"
                min="0"
                max="360"
                className="w-full"
                value="270"
                onChange={(e) => {
                  // In a real implementation, this would convert hue to RGB/HEX
                  const newColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                  setColorPickerValue(newColor);
                  updateElementStyle("color", newColor);
                }}
              />

              {/* Opacity slider */}
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
                value="100"
                onChange={() => {
                  // Opacity would be handled here
                }}
              />
            </div>
          </div>

          {/* Color values */}
          <div className="flex justify-between mt-4 text-xs">
            <div className="flex items-center">
              <span className="mr-1">HEX</span>
              <input
                type="text"
                value={colorPickerValue}
                onChange={(e) => {
                  setColorPickerValue(e.target.value);
                  updateElementStyle("color", e.target.value);
                }}
                className="w-20 px-2 py-1 border rounded text-xs"
              />
            </div>

            <div className="flex space-x-2">
              <div className="flex items-center">
                <span className="text-xs mr-1">R</span>
                <input type="text" value="151" className="w-12 px-2 py-1 border rounded text-xs" readOnly />
              </div>
              <div className="flex items-center">
                <span className="text-xs mr-1">G</span>
                <input type="text" value="81" className="w-12 px-2 py-1 border rounded text-xs" readOnly />
              </div>
              <div className="flex items-center">
                <span className="text-xs mr-1">B</span>
                <input type="text" value="242" className="w-12 px-2 py-1 border rounded text-xs" readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the appropriate panel based on active tab
  return (
    <div>
      {activeTab === "content" ? <ContentPanel /> : <StylePanel />}
    </div>
  );
};
