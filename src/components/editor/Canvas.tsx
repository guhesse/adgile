
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type BannerSize = {
  name: string;
  width: number;
  height: number;
};

export type EditorElement = {
  id: string;
  type: "text" | "image" | "button";
  content: string;
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: "left" | "center" | "right";
    backgroundColor?: string;
    padding?: string;
    animation?: string;
    animationDuration?: number;
    animationDelay?: number;
    animationPlayState?: "running" | "paused";
  };
};

const BANNER_SIZES: BannerSize[] = [
  { name: "Email Template", width: 600, height: 800 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Twitter Post", width: 1024, height: 512 },
  { name: "LinkedIn Banner", width: 1584, height: 396 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
];

const ANIMATION_PRESETS = [
  { name: "Fade In", value: "animate-fade-in" },
  { name: "Fade Out", value: "animate-fade-out" },
  { name: "Scale In", value: "animate-scale-in" },
  { name: "Scale Out", value: "animate-scale-out" },
  { name: "Slide In Right", value: "animate-slide-in-right" },
  { name: "Slide Out Right", value: "animate-slide-out-right" },
  { name: "Bounce", value: "animate-bounce" },
  { name: "Pulse", value: "animate-pulse" },
];

export const Canvas = () => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [key, setKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [showLayers, setShowLayers] = useState(false);

  const handleAddElement = (type: EditorElement["type"]) => {
    const newElement: EditorElement = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "Text Element" : type === "button" ? "Button Element" : "",
      style: {
        x: 100,
        y: 100,
        width: 200,
        height: type === "text" ? 40 : type === "image" ? 150 : 50,
        fontSize: 16,
        color: "#000000",
        fontFamily: "Inter",
        lineHeight: 1.5,
        textAlign: "left",
        backgroundColor: type === "button" ? "#1a1f2c" : undefined,
        padding: type === "button" ? "8px 16px" : undefined,
      },
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const handleMouseDown = (e: React.MouseEvent, element: EditorElement) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedElement(element);
    setDragStart({
      x: e.clientX - element.style.x,
      y: e.clientY - element.style.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string, element: EditorElement) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setSelectedElement(element);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds || !selectedElement) return;

    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, selectedSize.width - selectedElement.style.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, selectedSize.height - selectedElement.style.height));

      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, style: { ...el.style, x: newX, y: newY } }
          : el
      ));
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = selectedElement.style.width;
      let newHeight = selectedElement.style.height;
      let newX = selectedElement.style.x;
      let newY = selectedElement.style.y;
      
      // Handle different resize directions
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, selectedElement.style.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        const possibleWidth = Math.max(50, selectedElement.style.width - deltaX);
        newX = selectedElement.style.x + (selectedElement.style.width - possibleWidth);
        newWidth = possibleWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(20, selectedElement.style.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        const possibleHeight = Math.max(20, selectedElement.style.height - deltaY);
        newY = selectedElement.style.y + (selectedElement.style.height - possibleHeight);
        newHeight = possibleHeight;
      }
      
      setElements(elements.map(el =>
        el.id === selectedElement.id
          ? { ...el, style: { ...el.style, x: newX, y: newY, width: newWidth, height: newHeight } }
          : el
      ));
      
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    setElements(elements.map(el =>
      el.id === selectedElement.id
        ? { ...el, style: { ...el.style, [property]: value } }
        : el
    ));
    setSelectedElement({ ...selectedElement, style: { ...selectedElement.style, [property]: value } });
  };

  const updateElementContent = (content: string) => {
    if (!selectedElement) return;
    setElements(elements.map(el =>
      el.id === selectedElement.id
        ? { ...el, content }
        : el
    ));
    setSelectedElement({ ...selectedElement, content });
  };

  const exportEmail = () => {
    if (!canvasRef.current) return;

    // Create email-friendly HTML with tables
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
          body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          table, td {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
          ${elements
            .map(
              (el) => `
            #${el.id} {
              ${el.style.color ? `color: ${el.style.color};` : ""}
              ${el.style.fontSize ? `font-size: ${el.style.fontSize}px;` : ""}
              ${el.style.fontFamily ? `font-family: ${el.style.fontFamily}, Arial, sans-serif;` : ""}
              ${el.style.lineHeight ? `line-height: ${el.style.lineHeight};` : ""}
              ${el.style.textAlign ? `text-align: ${el.style.textAlign};` : ""}
              ${el.style.backgroundColor ? `background-color: ${el.style.backgroundColor};` : ""}
              ${el.style.padding ? `padding: ${el.style.padding};` : ""}
            }
          `
            )
            .join("\n")}
        </style>
      </head>
      <body>
        <table width="${selectedSize.width}" border="0" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td>
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                ${elements
                  .map((el) => {
                    if (el.type === "text") {
                      return `
                        <tr>
                          <td style="position: absolute; left: ${el.style.x}px; top: ${el.style.y}px;">
                            <div id="${el.id}">${el.content}</div>
                          </td>
                        </tr>
                      `;
                    }
                    if (el.type === "button") {
                      return `
                        <tr>
                          <td style="position: absolute; left: ${el.style.x}px; top: ${el.style.y}px;">
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center" style="border-radius: 4px;" bgcolor="${el.style.backgroundColor}">
                                  <a href="#" target="_blank" id="${el.id}" style="display: inline-block; padding: ${el.style.padding}; font-family: ${el.style.fontFamily || 'Arial'}, sans-serif; font-size: ${el.style.fontSize}px; color: ${el.style.color}; text-decoration: none;">${el.content}</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      `;
                    }
                    if (el.type === "image") {
                      return `
                        <tr>
                          <td style="position: absolute; left: ${el.style.x}px; top: ${el.style.y}px;">
                            <img src="${el.content}" width="${el.style.width}" height="${el.style.height}" alt="Image" style="display: block; border: 0;" />
                          </td>
                        </tr>
                      `;
                    }
                    return "";
                  })
                  .join("\n")}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-template.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewAnimation = () => {
    setKey(prev => prev + 1);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    
    const maxDuration = Math.max(...elements.map(el => 
      (el.style.animationDuration || 0) + (el.style.animationDelay || 0)
    ), 0);
    
    setCurrentTime(percentage * maxDuration);
    
    // Update animation states for all elements
    setElements(elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: "paused",
        animationDelay: -(percentage * maxDuration)
      }
    })));
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setElements(elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: isPlaying ? "paused" : "running"
      }
    })));
  };

  const renderTextPanel = () => {
    if (!selectedElement || selectedElement.type !== "text") return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Text Content</h3>
          <textarea
            value={selectedElement.content}
            onChange={(e) => updateElementContent(e.target.value)}
            className="w-full px-3 py-2 border rounded resize-none"
            rows={3}
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Typography</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Font</label>
              <Select
                value={selectedElement.style.fontFamily}
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
                  value={selectedElement.style.fontSize}
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
                  value={selectedElement.style.lineHeight || 1.5}
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
                  value={selectedElement.style.color}
                  onChange={(e) => updateElementStyle("color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElement.style.color}
                  onChange={(e) => updateElementStyle("color", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded ml-2"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Alignment</label>
              <div className="flex space-x-2 mt-1">
                <button
                  className={`px-3 py-2 border rounded flex-1 ${selectedElement.style.textAlign === 'left' ? 'bg-gray-100 font-medium' : ''}`}
                  onClick={() => updateElementStyle("textAlign", "left")}
                >
                  Left
                </button>
                <button
                  className={`px-3 py-2 border rounded flex-1 ${selectedElement.style.textAlign === 'center' ? 'bg-gray-100 font-medium' : ''}`}
                  onClick={() => updateElementStyle("textAlign", "center")}
                >
                  Center
                </button>
                <button
                  className={`px-3 py-2 border rounded flex-1 ${selectedElement.style.textAlign === 'right' ? 'bg-gray-100 font-medium' : ''}`}
                  onClick={() => updateElementStyle("textAlign", "right")}
                >
                  Right
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Letter Spacing</label>
              <input
                type="number"
                value={selectedElement.style.letterSpacing || 0}
                onChange={(e) => updateElementStyle("letterSpacing", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="-5"
                max="20"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImagePanel = () => {
    if (!selectedElement || selectedElement.type !== "image") return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Image</h3>
          <div className="border rounded p-2 flex flex-col items-center justify-center">
            <div className="h-36 w-full bg-gray-100 rounded flex items-center justify-center mb-2">
              {selectedElement.content ? (
                <img 
                  src={selectedElement.content} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-gray-400">No Image</div>
              )}
            </div>
            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="flex-1 text-xs">Upload</Button>
              <Button variant="outline" className="flex-1 text-xs">Gallery</Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Size</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Width</label>
              <input
                type="number"
                value={selectedElement.style.width}
                onChange={(e) => updateElementStyle("width", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="10"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Height</label>
              <input
                type="number"
                value={selectedElement.style.height}
                onChange={(e) => updateElementStyle("height", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="10"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Alt Text</h3>
          <input
            type="text"
            value={selectedElement.content || ""}
            onChange={(e) => updateElementContent(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Image description for accessibility"
          />
        </div>
      </div>
    );
  };

  const renderButtonPanel = () => {
    if (!selectedElement || selectedElement.type !== "button") return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Button Text</h3>
          <input
            type="text"
            value={selectedElement.content}
            onChange={(e) => updateElementContent(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Styles</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Background Color</label>
              <div className="flex mt-1">
                <input
                  type="color"
                  value={selectedElement.style.backgroundColor || "#000000"}
                  onChange={(e) => updateElementStyle("backgroundColor", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElement.style.backgroundColor || "#000000"}
                  onChange={(e) => updateElementStyle("backgroundColor", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded ml-2"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Text Color</label>
              <div className="flex mt-1">
                <input
                  type="color"
                  value={selectedElement.style.color}
                  onChange={(e) => updateElementStyle("color", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElement.style.color}
                  onChange={(e) => updateElementStyle("color", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded ml-2"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Padding</label>
              <input
                type="text"
                value={selectedElement.style.padding || "8px 16px"}
                onChange={(e) => updateElementStyle("padding", e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g. 8px 16px"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Font Size</label>
              <input
                type="number"
                value={selectedElement.style.fontSize}
                onChange={(e) => updateElementStyle("fontSize", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="8"
                max="36"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Font</label>
              <Select
                value={selectedElement.style.fontFamily}
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
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Link</h3>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            placeholder="https://example.com"
          />
        </div>
      </div>
    );
  };

  const renderAnimationPanel = () => {
    if (!selectedElement) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Animation</h3>
          <Select
            value={selectedElement.style.animation}
            onValueChange={(value) => updateElementStyle("animation", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {ANIMATION_PRESETS.map((preset) => (
                <SelectItem key={preset.name} value={preset.value}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-gray-500">Duration (s)</label>
              <input
                type="number"
                value={selectedElement.style.animationDuration || 1}
                onChange={(e) => updateElementStyle("animationDuration", parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Delay (s)</label>
              <input
                type="number"
                value={selectedElement.style.animationDelay || 0}
                onChange={(e) => updateElementStyle("animationDelay", parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPanel = () => {
    if (!selectedElement) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          Select an element to edit its properties
        </div>
      );
    }

    return (
      <div>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'text' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('text')}
          >
            Content
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'styles' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('styles')}
          >
            Style
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'animation' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('animation')}
          >
            Animation
          </button>
        </div>
        
        <div className="p-4">
          {activeTab === 'text' && (
            selectedElement.type === 'text' ? renderTextPanel() :
            selectedElement.type === 'image' ? renderImagePanel() :
            selectedElement.type === 'button' ? renderButtonPanel() : null
          )}
          
          {activeTab === 'styles' && (
            selectedElement.type === 'text' ? renderTextPanel() :
            selectedElement.type === 'image' ? renderImagePanel() :
            selectedElement.type === 'button' ? renderButtonPanel() : null
          )}
          
          {activeTab === 'animation' && renderAnimationPanel()}
        </div>
      </div>
    );
  };

  const renderLayersPanel = () => {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Camadas</h3>
        <div className="space-y-1">
          {elements.map((element, index) => (
            <div 
              key={element.id}
              className={`px-3 py-2 text-sm rounded flex items-center justify-between ${selectedElement?.id === element.id ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedElement(element)}
            >
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2 inline-block">
                  {element.type === 'text' ? 'T' : 
                   element.type === 'image' ? 'I' :
                   element.type === 'button' ? 'B' : ''}
                </span>
                <span className="truncate">{element.content || element.type}</span>
              </div>
              <div className="flex items-center">
                <button 
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newElements = [...elements];
                    newElements.splice(index, 1);
                    setElements(newElements);
                    if (selectedElement?.id === element.id) {
                      setSelectedElement(null);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1">
      {/* Left Sidebar */}
      <div className="w-14 bg-white border-r flex flex-col items-center pt-4 space-y-4">
        <div className={`sidebar-item ${!showLayers ? 'active' : ''}`} onClick={() => setShowLayers(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className={`sidebar-item ${showLayers ? 'active' : ''}`} onClick={() => setShowLayers(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="sidebar-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="sidebar-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Elements Panel */}
      <div className="w-64 bg-white border-r flex flex-col">
        {showLayers ? (
          renderLayersPanel()
        ) : (
          <>
            <div className="border-b p-4">
              <div className="text-lg font-medium">Elements</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start" onClick={() => handleAddElement("text")}>
                  <span className="mr-2">T</span> Text
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleAddElement("image")}>
                  <span className="mr-2">I</span> Image
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => handleAddElement("button")}>
                  <span className="mr-2">B</span> Button
                </Button>
                <Button variant="outline" className="justify-start" disabled>
                  <span className="mr-2">D</span> Divider
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-lg font-medium">Templates</div>
              <div className="mt-2 space-y-2">
                <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  Template 1
                </div>
                <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  Template 2
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div className="flex justify-between items-center p-4">
          <Select
            value={selectedSize.name}
            onValueChange={(value) => {
              const size = BANNER_SIZES.find(s => s.name === value);
              if (size) setSelectedSize(size);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {BANNER_SIZES.map((size) => (
                <SelectItem key={size.name} value={size.name}>
                  {size.name} ({size.width}x{size.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviewAnimation}>
              Preview Animation
            </Button>
            <Button variant="default" size="sm" onClick={exportEmail}>
              Export
            </Button>
          </div>
        </div>
        
        <div className="p-8 flex justify-center min-h-[calc(100vh-14rem)]">
          <Card
            ref={canvasRef}
            className="relative bg-white shadow-lg"
            style={{
              width: selectedSize.width,
              height: selectedSize.height,
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {elements.map((element) => (
              <div
                key={`${element.id}-${key}`}
                style={{
                  position: "absolute",
                  left: element.style.x,
                  top: element.style.y,
                  width: element.style.width,
                  height: element.style.height,
                  animationPlayState: element.style.animationPlayState,
                  animationDelay: element.style.animationDelay != null ? `${element.style.animationDelay}s` : undefined,
                  animationDuration: element.style.animationDuration != null ? `${element.style.animationDuration}s` : undefined,
                }}
                className={`cursor-move ${selectedElement?.id === element.id ? "outline outline-2 outline-blue-500" : ""} ${element.style.animation}`}
                onMouseDown={(e) => handleMouseDown(e, element)}
              >
                {element.type === "text" && (
                  <p style={{
                    fontSize: element.style.fontSize,
                    color: element.style.color,
                    fontFamily: element.style.fontFamily,
                    lineHeight: element.style.lineHeight,
                    letterSpacing: element.style.letterSpacing ? `${element.style.letterSpacing}px` : undefined,
                    textAlign: element.style.textAlign,
                  }}>
                    {element.content}
                  </p>
                )}
                {element.type === "button" && (
                  <Button style={{
                    fontSize: element.style.fontSize,
                    color: element.style.color,
                    fontFamily: element.style.fontFamily,
                    backgroundColor: element.style.backgroundColor,
                    padding: element.style.padding,
                    width: "100%",
                    height: "100%",
                  }}>
                    {element.content}
                  </Button>
                )}
                {element.type === "image" && (
                  <img
                    src={element.content || "/placeholder.svg"}
                    alt="Banner element"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Resize Handles */}
                {selectedElement?.id === element.id && (
                  <>
                    <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n', element)}></div>
                    <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e', element)}></div>
                    <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's', element)}></div>
                    <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w', element)}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw', element)}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne', element)}></div>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se', element)}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw', element)}></div>
                  </>
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="w-72 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">
            {selectedElement ? (
              selectedElement.type === 'text' ? 'Text' :
              selectedElement.type === 'image' ? 'Image' :
              selectedElement.type === 'button' ? 'Button' : 'Properties'
            ) : 'Properties'}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {renderPanel()}
        </div>
      </div>

      {/* Timeline */}
      <div className="h-32 bg-white border-t p-4 absolute bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium">Timeline</h3>
            <Button
              onClick={togglePlayPause}
              variant="outline"
              size="sm"
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Current Time: {currentTime.toFixed(1)}s / Total Duration: {
              Math.max(...elements.map(el => (el.style.animationDuration || 0) + (el.style.animationDelay || 0)), 0)
            }s
          </div>
        </div>
        <div 
          ref={timelineRef}
          className="relative h-16 bg-gray-50 rounded border cursor-pointer"
          onClick={handleTimelineClick}
        >
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-purple-500"
            style={{
              left: `${(currentTime / Math.max(...elements.map(el => 
                (el.style.animationDuration || 0) + (el.style.animationDelay || 0)
              ), 1)) * 100}%`,
              zIndex: 20
            }}
          />
          
          {elements.map((element) => (
            <div
              key={element.id}
              className="absolute h-6 bg-purple-500 rounded cursor-pointer"
              style={{
                left: `${(element.style.animationDelay || 0) * 10}%`,
                width: `${(element.style.animationDuration || 1) * 10}%`,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.8
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
              }}
            >
              <div className="text-xs text-white truncate px-2">
                {element.content || element.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
