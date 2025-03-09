
import { useState, useEffect, useRef } from "react";
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
  // Setup refs for maintaining focus on inputs
  const colorInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const linkUrlRef = useRef<HTMLInputElement>(null);
  
  // State for the form elements
  const [linkType, setLinkType] = useState("webpage");
  const [linkUrl, setLinkUrl] = useState("");
  const [newTab, setNewTab] = useState(true);
  const [colorPickerValue, setColorPickerValue] = useState(element.style.color || "#414651");
  const [fontSizeValue, setFontSizeValue] = useState<string>(String(element.style.fontSize || 16));
  const [lineHeightValue, setLineHeightValue] = useState<string>(String(element.style.lineHeight || 1.5));
  const [letterSpacingValue, setLetterSpacingValue] = useState<string>(String(element.style.letterSpacing || 0));

  // Sync form state with element props when element changes
  useEffect(() => {
    setColorPickerValue(element.style.color || "#414651");
    setFontSizeValue(String(element.style.fontSize || 16));
    setLineHeightValue(String(element.style.lineHeight || 1.5));
    setLetterSpacingValue(String(element.style.letterSpacing || 0));
  }, [element]);

  // Font weight options
  const fontWeightOptions = [
    { value: "normal", label: "Normal" },
    { value: "medium", label: "Medium" },
    { value: "bold", label: "Bold" },
  ];

  // Font family options
  const fontFamilyOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Geist", label: "Geist" },
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
    { value: "Lato", label: "Lato" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Oswald", label: "Oswald" },
    { value: "Source Sans Pro", label: "Source Sans Pro" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Raleway", label: "Raleway" },
    { value: "PT Sans", label: "PT Sans" },
    { value: "Quicksand", label: "Quicksand" },
    { value: "Nunito", label: "Nunito" },
    { value: "Work Sans", label: "Work Sans" },
    { value: "Fira Sans", label: "Fira Sans" },
  ];

  // Font size controls with direct input
  const handleFontSizeChange = (value: string) => {
    // Allow only numbers
    if (/^[0-9]*$/.test(value) || value === '') {
      setFontSizeValue(value);
      if (value !== '') {
        updateElementStyle("fontSize", Number(value));
      }
    }
  };

  const increaseFontSize = () => {
    const newSize = (element.style.fontSize || 16) + 1;
    setFontSizeValue(String(newSize));
    updateElementStyle("fontSize", newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(8, (element.style.fontSize || 16) - 1);
    setFontSizeValue(String(newSize));
    updateElementStyle("fontSize", newSize);
  };

  // Line height controls with direct input
  const handleLineHeightChange = (value: string) => {
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setLineHeightValue(value);
      if (value !== '') {
        updateElementStyle("lineHeight", parseFloat(value));
      }
    }
  };

  const increaseLineHeight = () => {
    const newLineHeight = parseFloat((Math.min(3, (element.style.lineHeight || 1.5) + 0.1).toFixed(1)));
    setLineHeightValue(String(newLineHeight));
    updateElementStyle("lineHeight", newLineHeight);
  };

  const decreaseLineHeight = () => {
    const newLineHeight = parseFloat((Math.max(1, (element.style.lineHeight || 1.5) - 0.1).toFixed(1)));
    setLineHeightValue(String(newLineHeight));
    updateElementStyle("lineHeight", newLineHeight);
  };

  // Letter spacing controls with direct input
  const handleLetterSpacingChange = (value: string) => {
    if (/^-?[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setLetterSpacingValue(value);
      if (value !== '') {
        updateElementStyle("letterSpacing", parseFloat(value));
      }
    }
  };

  const increaseLetterSpacing = () => {
    const newSpacing = parseFloat(((element.style.letterSpacing || 0) + 0.1).toFixed(1));
    setLetterSpacingValue(String(newSpacing));
    updateElementStyle("letterSpacing", newSpacing);
  };

  const decreaseLetterSpacing = () => {
    const newSpacing = parseFloat((Math.max(-0.5, (element.style.letterSpacing || 0) - 0.1).toFixed(1)));
    setLetterSpacingValue(String(newSpacing));
    updateElementStyle("letterSpacing", newSpacing);
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

  // Handle font family selection
  const handleFontFamilyChange = (value: string) => {
    updateElementStyle("fontFamily", value);
  };

  // Handle font weight selection
  const handleFontWeightChange = (value: string) => {
    updateElementStyle("fontWeight", value);
  };

  // Content Panel - for editing the content and link
  const ContentPanel = () => (
    <div className="space-y-6 p-4">
      <div className="text-center text-sm text-gray-500 mb-4">Conteúdo</div>

      <div className="border rounded-lg p-3 relative">
        <textarea
          ref={contentTextareaRef}
          value={element.content}
          onChange={(e) => updateElementContent(e.target.value)}
          className="w-full resize-none border-0 focus:outline-none min-h-[80px]"
          placeholder="Text Element"
          onKeyDown={(e) => e.stopPropagation()} // Prevent event bubbling
        />
        <div className="w-2 h-2 bg-gray-600 opacity-60 absolute bottom-3 right-3"></div>
      </div>

      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Vincular a</div>

        <Select 
          value={linkType} 
          onValueChange={setLinkType}
          onOpenChange={(open) => { if (open) { document.addEventListener('keydown', (e) => e.stopPropagation(), { once: true }) }}}
        >
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
          ref={linkUrlRef}
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()} // Prevent event bubbling
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
        <Select 
          value={element.style.fontFamily || "Arial"} 
          onValueChange={handleFontFamilyChange}
          onOpenChange={(open) => { if (open) { document.addEventListener('keydown', (e) => e.stopPropagation(), { once: true }) }}}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha uma fonte" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Style Section */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-500">Estilo de fonte</div>
        <div className="flex items-center justify-between">
          <Select 
            value={element.style.fontWeight || "normal"} 
            onValueChange={handleFontWeightChange}
            onOpenChange={(open) => { if (open) { document.addEventListener('keydown', (e) => e.stopPropagation(), { once: true }) }}}
          >
            <SelectTrigger className="w-full mr-2">
              <SelectValue placeholder="Peso da fonte" />
            </SelectTrigger>
            <SelectContent>
              {fontWeightOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            <input
              type="text"
              value={fontSizeValue}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-10 text-center bg-transparent border-0 focus:outline-none text-xs"
            />
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
            <input
              type="text"
              value={lineHeightValue}
              onChange={(e) => handleLineHeightChange(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-10 text-center bg-transparent border-0 focus:outline-none text-xs"
            />
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
            <input
              type="text"
              value={letterSpacingValue}
              onChange={(e) => handleLetterSpacingChange(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-10 text-center bg-transparent border-0 focus:outline-none text-xs"
            />
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
        <div>
          <label className="text-xs text-gray-500">Cor do texto</label>
          <div className="flex mt-1">
            <input
              type="color"
              value={element.style.color || "#000000"}
              onChange={(e) => {
                setColorPickerValue(e.target.value);
                updateElementStyle("color", e.target.value);
              }}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              ref={colorInputRef}
              type="text"
              value={element.style.color || "#000000"}
              onChange={(e) => {
                setColorPickerValue(e.target.value);
                updateElementStyle("color", e.target.value);
              }}
              onKeyDown={(e) => e.stopPropagation()} // Prevent event bubbling
              className="flex-1 px-3 py-2 border rounded ml-2"
            />
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
