
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";
import { useCanvas } from "../CanvasContext";
import { FontSelector } from "./components/FontSelector";
import { ButtonGroup } from "./components/ButtonGroup";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, ChevronUp, ChevronDown
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const TextPanel = () => {
  const { 
    selectedElement, 
    updateElementContent, 
    updateElementStyle 
  } = useCanvas();
  
  const [textContent, setTextContent] = useState<string>(selectedElement?.content || "");
  const [fontSize, setFontSize] = useState<number>(selectedElement?.style.fontSize || 16);
  const [lineHeight, setLineHeight] = useState<number>(selectedElement?.style.lineHeight || 1.5);
  const [letterSpacing, setLetterSpacing] = useState<number>(selectedElement?.style.letterSpacing || 0);
  const [textColor, setTextColor] = useState<string>(selectedElement?.style.color || "#000000");
  
  // Update text content state when selected element changes
  React.useEffect(() => {
    if (selectedElement) {
      setTextContent(selectedElement.content || "");
      setFontSize(selectedElement.style.fontSize || 16);
      setLineHeight(selectedElement.style.lineHeight || 1.5);
      setLetterSpacing(selectedElement.style.letterSpacing || 0);
      setTextColor(selectedElement.style.color || "#000000");
    }
  }, [selectedElement]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextContent(value);
    
    if (selectedElement) {
      updateElementContent(value);
    }
  };

  const handleFontSizeChange = (newValue: number) => {
    setFontSize(newValue);
    if (selectedElement) {
      updateElementStyle("fontSize", newValue);
    }
  };

  const handleLineHeightChange = (newValue: number) => {
    setLineHeight(newValue);
    if (selectedElement) {
      updateElementStyle("lineHeight", newValue);
    }
  };

  const handleLetterSpacingChange = (newValue: number) => {
    setLetterSpacing(newValue);
    if (selectedElement) {
      updateElementStyle("letterSpacing", newValue);
    }
  };

  const handleTextAlignChange = (value: "left" | "center" | "right" | "justify") => {
    if (selectedElement) {
      updateElementStyle("textAlign", value);
    }
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    if (selectedElement) {
      updateElementStyle("color", color);
    }
  };

  const handleFontStyleChange = (style: string) => {
    if (!selectedElement) return;

    switch (style) {
      case "bold":
        updateElementStyle("fontWeight", selectedElement.style.fontWeight === "bold" ? "normal" : "bold");
        break;
      case "italic":
        updateElementStyle("fontStyle", selectedElement.style.fontStyle === "italic" ? "normal" : "italic");
        break;
      case "underline":
        updateElementStyle("textDecoration", selectedElement.style.textDecoration === "underline" ? "none" : "underline");
        break;
    }
  };

  const renderSizeControl = (
    label: string, 
    value: number, 
    onChange: (value: number) => void, 
    min = 1, 
    max = 100, 
    step = 1
  ) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
        <button 
          type="button" 
          className="text-gray-600 hover:text-gray-900" 
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <ChevronDown size={14} />
        </button>
        <span className="text-xs min-w-[20px] text-center">{value}</span>
        <button 
          type="button" 
          className="text-gray-600 hover:text-gray-900" 
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <ChevronUp size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="style">Estilo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-center w-full block text-gray-600">Conteúdo</label>
            <textarea
              className="w-full h-24 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={textContent}
              onChange={handleTextChange}
              placeholder="Digite seu texto aqui..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-center w-full block text-gray-600">Vincular a</label>
            <div className="border rounded p-2 flex justify-between items-center">
              <span className="text-sm">Página da Web</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <Input 
              className="text-sm placeholder:text-gray-400" 
              placeholder="Link" 
            />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="new-tab" className="rounded" />
              <label htmlFor="new-tab" className="text-xs text-gray-600">Abrir link em nova guia</label>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-center w-full block text-gray-600">Tipografia</label>
            <FontSelector 
              value={selectedElement?.style.fontFamily || "Inter"} 
              onChange={(font) => updateElementStyle("fontFamily", font)} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-center w-full block text-gray-600">Estilo de fonte</label>
            <div className="flex justify-between items-center">
              <select 
                className="flex-1 p-2 border rounded text-sm" 
                value={selectedElement?.style.fontWeight || "normal"}
                onChange={(e) => updateElementStyle("fontWeight", e.target.value)}
              >
                <option value="normal">Regular</option>
                <option value="medium">Medium</option>
                <option value="bold">Bold</option>
              </select>
              
              <ButtonGroup 
                buttons={[
                  { 
                    icon: <Bold size={16} />, 
                    active: selectedElement?.style.fontWeight === "bold", 
                    onClick: () => handleFontStyleChange("bold")
                  },
                  { 
                    icon: <Italic size={16} />, 
                    active: selectedElement?.style.fontStyle === "italic", 
                    onClick: () => handleFontStyleChange("italic")
                  },
                  { 
                    icon: <Underline size={16} />, 
                    active: selectedElement?.style.textDecoration === "underline", 
                    onClick: () => handleFontStyleChange("underline")
                  },
                ]} 
              />
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4">
            {renderSizeControl("Aa", fontSize, handleFontSizeChange, 8, 72)}
            {renderSizeControl("↕", lineHeight, handleLineHeightChange, 0.5, 3, 0.1)}
            {renderSizeControl("↔", letterSpacing, handleLetterSpacingChange, -2, 10, 0.1)}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-center w-full block text-gray-600">Parágrafo</label>
            <ButtonGroup 
              buttons={[
                { 
                  icon: <AlignLeft size={16} />, 
                  active: selectedElement?.style.textAlign === "left", 
                  onClick: () => handleTextAlignChange("left")
                },
                { 
                  icon: <AlignCenter size={16} />, 
                  active: selectedElement?.style.textAlign === "center", 
                  onClick: () => handleTextAlignChange("center")
                },
                { 
                  icon: <AlignRight size={16} />, 
                  active: selectedElement?.style.textAlign === "right", 
                  onClick: () => handleTextAlignChange("right")
                },
                { 
                  icon: <AlignJustify size={16} />, 
                  active: selectedElement?.style.textAlign === "justify", 
                  onClick: () => handleTextAlignChange("justify")
                },
              ]} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-center w-full block text-gray-600">Cor</label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div 
                    className="w-8 h-8 rounded cursor-pointer border"
                    style={{ backgroundColor: textColor }}
                  ></div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker color={textColor} onChange={handleColorChange} />
                  <div className="flex mt-2">
                    <Input 
                      value={textColor} 
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="text-xs" 
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <span className="text-sm flex-1">
                {textColor.toUpperCase()}
              </span>
            </div>
          </div>
          
        </TabsContent>
      </Tabs>
    </div>
  );
};
