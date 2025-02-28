
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorElement, BannerSize, BANNER_SIZES } from "./types";
import { PropertyPanel } from "./PropertyPanel";
import { LayersPanel } from "./LayersPanel";
import { ElementsPanel } from "./ElementsPanel";
import { Timeline } from "./Timeline";
import { exportEmailHTML, downloadEmailTemplate } from "./utils/emailExporter";

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

  const removeElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const exportEmail = () => {
    if (!canvasRef.current) return;
    const html = exportEmailHTML(elements, selectedSize);
    downloadEmailTemplate(html);
  };

  const handlePreviewAnimation = () => {
    setKey(prev => prev + 1);
  };

  const updateAnimations = (time: number) => {
    setElements(elements.map(el => ({
      ...el,
      style: {
        ...el.style,
        animationPlayState: "paused",
        animationDelay: -(time)
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
          <LayersPanel 
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            removeElement={removeElement}
          />
        ) : (
          <ElementsPanel addElement={handleAddElement} />
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
          <PropertyPanel 
            selectedElement={selectedElement}
            updateElementStyle={updateElementStyle}
            updateElementContent={updateElementContent}
          />
        </div>
      </div>

      {/* Timeline */}
      <Timeline 
        elements={elements} 
        currentTime={currentTime} 
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        setCurrentTime={setCurrentTime}
        updateAnimations={updateAnimations}
        setSelectedElement={setSelectedElement}
      />
    </div>
  );
};
