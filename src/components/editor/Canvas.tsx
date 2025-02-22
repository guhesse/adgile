
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    animation?: string;
  };
};

export const Canvas = () => {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

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
      },
    };
    setElements([...elements, newElement]);
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

  return (
    <div className="flex h-screen">
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

      <div className="flex-1 bg-editor-background p-8">
        <Card
          ref={canvasRef}
          className="w-full h-full relative bg-white shadow-lg overflow-hidden"
        >
          {elements.map((element) => (
            <div
              key={element.id}
              style={{
                position: "absolute",
                left: element.style.x,
                top: element.style.y,
                width: element.style.width,
                height: element.style.height,
              }}
              className="cursor-move"
            >
              {element.type === "text" && (
                <p style={{ fontSize: element.style.fontSize, color: element.style.color }}>
                  {element.content}
                </p>
              )}
              {element.type === "button" && (
                <Button>{element.content}</Button>
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

      <div className="w-64 bg-editor-panel border-l border-editor-border p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        <Button onClick={exportBanner} className="w-full" variant="default">
          Export Banner
        </Button>
      </div>
    </div>
  );
};
