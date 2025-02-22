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
  };
};

const BANNER_SIZES: BannerSize[] = [
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Twitter Post", width: 1024, height: 512 },
  { name: "LinkedIn Banner", width: 1584, height: 396 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
];

const ANIMATION_PRESETS = [
  { name: "Fade In", value: "fade-in 1s ease-out" },
  { name: "Slide In Right", value: "slide-in-right 1s ease-out" },
  { name: "Scale In", value: "scale-in 0.5s ease-out" },
  { name: "Bounce", value: "bounce 1s infinite" },
  { name: "Pulse", value: "pulse 2s infinite" },
];

export const Canvas = () => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [key, setKey] = useState(0);

  const handleAddElement = (type: EditorElement["type"]) => {
    const newElement: EditorElement = {
      id: Date.now().toString(),
      type,
      content: type === "text" ? "New Text" : type === "button" ? "Click me" : "",
      style: {
        x: 100,
        y: 100,
        width: 200,
        height: type === "text" ? 40 : 50,
        fontSize: 16,
        color: "#000000",
        fontFamily: "Inter",
      },
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const handleMouseDown = (e: React.MouseEvent, element: EditorElement) => {
    setIsDragging(true);
    setSelectedElement(element);
    setDragStart({
      x: e.clientX - element.style.x,
      y: e.clientY - element.style.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, selectedSize.width - selectedElement.style.width));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, selectedSize.height - selectedElement.style.height));

    setElements(elements.map(el =>
      el.id === selectedElement.id
        ? { ...el, style: { ...el.style, x: newX, y: newY } }
        : el
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateElementStyle = (property: string, value: string | number) => {
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

  const exportBanner = () => {
    if (!canvasRef.current) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .banner {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          ${elements
            .map(
              (el) => `
            #${el.id} {
              position: absolute;
              left: ${el.style.x}px;
              top: ${el.style.y}px;
              width: ${el.style.width}px;
              height: ${el.style.height}px;
              ${el.style.fontSize ? `font-size: ${el.style.fontSize}px;` : ""}
              ${el.style.color ? `color: ${el.style.color};` : ""}
              ${el.style.animation ? `animation: ${el.style.animation};` : ""}
            }
          `
            )
            .join("\n")}
        </style>
      </head>
      <body>
        <div class="banner">
          ${elements
            .map((el) => {
              if (el.type === "text") {
                return `<div id="${el.id}">${el.content}</div>`;
              }
              if (el.type === "button") {
                return `<button id="${el.id}">${el.content}</button>`;
              }
              if (el.type === "image") {
                return `<img id="${el.id}" src="${el.content}" alt="Banner image" />`;
              }
              return "";
            })
            .join("\n")}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "banner.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewAnimation = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Control Bar */}
      <div className="bg-editor-panel border-b border-editor-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            
            <Button
              onClick={handlePreviewAnimation}
              variant="default"
              className="ml-4"
            >
              Preview Animation
            </Button>
          </div>

          {selectedElement && (
            <div className="flex items-center gap-4">
              {(selectedElement.type === "text" || selectedElement.type === "button") && (
                <>
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) => updateElementContent(e.target.value)}
                    className="px-2 py-1 border rounded w-40"
                    placeholder="Enter text..."
                  />
                  <input
                    type="color"
                    value={selectedElement.style.color}
                    onChange={(e) => updateElementStyle("color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="number"
                    value={selectedElement.style.fontSize}
                    onChange={(e) => updateElementStyle("fontSize", parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    min="8"
                    max="72"
                  />
                  <Select
                    value={selectedElement.style.fontFamily}
                    onValueChange={(value) => updateElementStyle("fontFamily", value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Font family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    type="number"
                    value={selectedElement.style.lineHeight || 1.5}
                    onChange={(e) => updateElementStyle("lineHeight", parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    min="1"
                    max="3"
                    step="0.1"
                    placeholder="Line Height"
                  />
                  <input
                    type="number"
                    value={selectedElement.style.letterSpacing || 0}
                    onChange={(e) => updateElementStyle("letterSpacing", parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    min="-5"
                    max="20"
                    placeholder="Letter Spacing"
                  />
                  <Select
                    value={selectedElement.style.textAlign || "left"}
                    onValueChange={(value) => updateElementStyle("textAlign", value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Align" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedElement.type === "button" && (
                    <>
                      <input
                        type="color"
                        value={selectedElement.style.backgroundColor || "#000000"}
                        onChange={(e) => updateElementStyle("backgroundColor", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                        title="Background Color"
                      />
                      <input
                        type="text"
                        value={selectedElement.style.padding || "8px 16px"}
                        onChange={(e) => updateElementStyle("padding", e.target.value)}
                        className="w-24 px-2 py-1 border rounded"
                        placeholder="Padding"
                      />
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-64 bg-editor-panel border-r border-editor-border p-4 space-y-4">
          <h2 className="text-lg font-semibold">Tools</h2>
          <div className="space-y-2">
            <Button
              onClick={() => handleAddElement("text")}
              className="w-full justify-start"
              variant="outline"
            >
              Add Text
            </Button>
            <Button
              onClick={() => handleAddElement("image")}
              className="w-full justify-start"
              variant="outline"
            >
              Add Image
            </Button>
            <Button
              onClick={() => handleAddElement("button")}
              className="w-full justify-start"
              variant="outline"
            >
              Add Button
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-editor-background p-8 overflow-auto">
          <Card
            ref={canvasRef}
            className="mx-auto relative bg-white shadow-lg"
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
                  border: selectedElement?.id === element.id ? "2px solid #007AFF" : "none",
                  animation: element.style.animation,
                  animationDuration: `${element.style.animationDuration || 1}s`,
                  animationDelay: `${element.style.animationDelay || 0}s`,
                }}
                className={`cursor-move ${selectedElement?.id === element.id ? "ring-2 ring-editor-accent" : ""}`}
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
                    src={element.content}
                    alt="Banner element"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Right Properties Panel */}
        <div className="w-64 bg-editor-panel border-l border-editor-border p-4">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          {selectedElement && (
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
                    {ANIMATION_PRESETS.map((preset) => (
                      <SelectItem key={preset.name} value={preset.value}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="text-sm">Duration (s)</label>
                    <input
                      type="number"
                      value={selectedElement.style.animationDuration || 1}
                      onChange={(e) => updateElementStyle("animationDuration", parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border rounded"
                      min="0.1"
                      max="10"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Delay (s)</label>
                    <input
                      type="number"
                      value={selectedElement.style.animationDelay || 0}
                      onChange={(e) => updateElementStyle("animationDelay", parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border rounded"
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={exportBanner} className="w-full" variant="default">
                Export Banner
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="h-32 bg-editor-panel border-t border-editor-border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Timeline</h3>
          <div className="text-sm text-gray-500">Total Duration: {Math.max(...elements.map(el => (el.style.animationDuration || 0) + (el.style.animationDelay || 0)), 0)}s</div>
        </div>
        <div className="relative h-16 bg-white rounded border">
          {elements.map((element) => (
            <div
              key={element.id}
              className="absolute h-6 bg-editor-accent rounded cursor-pointer"
              style={{
                left: `${(element.style.animationDelay || 0) * 10}%`,
                width: `${(element.style.animationDuration || 1) * 10}%`,
                top: "50%",
                transform: "translateY(-50%)",
              }}
              onClick={() => setSelectedElement(element)}
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
