
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Square } from "lucide-react";

interface AdminFormatSelectorProps {
  formatPresets: {
    vertical: { width: number; height: number }[];
    horizontal: { width: number; height: number }[];
    square: { width: number; height: number }[];
  };
  activeFormat: {
    width: number;
    height: number;
    orientation: "vertical" | "horizontal" | "square";
  } | null;
  setActiveFormat: (format: {
    width: number;
    height: number;
    orientation: "vertical" | "horizontal" | "square";
  }) => void;
}

export const AdminFormatSelector: React.FC<AdminFormatSelectorProps> = ({
  formatPresets,
  activeFormat,
  setActiveFormat,
}) => {
  const [activeTab, setActiveTab] = useState<"horizontal" | "vertical" | "square">("horizontal");

  const handleFormatSelect = (
    width: number,
    height: number,
    orientation: "vertical" | "horizontal" | "square"
  ) => {
    setActiveFormat({ width, height, orientation });
  };

  return (
    <Tabs
      defaultValue="horizontal"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as any)}
      className="w-full"
    >
      <div className="px-4 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="horizontal" className="flex-1">
            Horizontal
          </TabsTrigger>
          <TabsTrigger value="vertical" className="flex-1">
            Vertical
          </TabsTrigger>
          <TabsTrigger value="square" className="flex-1">
            Square
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="horizontal" className="m-0">
        <ScrollArea className="h-[calc(100vh-230px)]">
          <div className="p-4 grid grid-cols-1 gap-3">
            {formatPresets.horizontal.map((format, index) => (
              <FormatCard
                key={`h-${index}`}
                width={format.width}
                height={format.height}
                isActive={
                  activeFormat?.width === format.width &&
                  activeFormat?.height === format.height &&
                  activeFormat?.orientation === "horizontal"
                }
                onClick={() => handleFormatSelect(format.width, format.height, "horizontal")}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="vertical" className="m-0">
        <ScrollArea className="h-[calc(100vh-230px)]">
          <div className="p-4 grid grid-cols-1 gap-3">
            {formatPresets.vertical.map((format, index) => (
              <FormatCard
                key={`v-${index}`}
                width={format.width}
                height={format.height}
                isActive={
                  activeFormat?.width === format.width &&
                  activeFormat?.height === format.height &&
                  activeFormat?.orientation === "vertical"
                }
                onClick={() => handleFormatSelect(format.width, format.height, "vertical")}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="square" className="m-0">
        <ScrollArea className="h-[calc(100vh-230px)]">
          <div className="p-4 grid grid-cols-1 gap-3">
            {formatPresets.square.map((format, index) => (
              <FormatCard
                key={`s-${index}`}
                width={format.width}
                height={format.height}
                isActive={
                  activeFormat?.width === format.width &&
                  activeFormat?.height === format.height &&
                  activeFormat?.orientation === "square"
                }
                onClick={() => handleFormatSelect(format.width, format.height, "square")}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

interface FormatCardProps {
  width: number;
  height: number;
  isActive: boolean;
  onClick: () => void;
}

const FormatCard: React.FC<FormatCardProps> = ({ width, height, isActive, onClick }) => {
  // Calculate aspect ratio for preview
  const aspectRatio = width / height;
  let previewWidth = 100;
  let previewHeight = previewWidth / aspectRatio;
  
  if (previewHeight > 100) {
    previewHeight = 100;
    previewWidth = previewHeight * aspectRatio;
  }

  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      className={`flex flex-col items-center justify-center p-3 h-auto ${
        isActive ? "ring-2 ring-purple-500 ring-offset-1" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-center mb-2">
        <div
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            backgroundColor: isActive ? "#e9d5ff" : "#f1f5f9",
            border: "1px solid #cbd5e1",
          }}
        ></div>
      </div>
      <div className="text-xs font-medium">{width} × {height}px</div>
    </Button>
  );
};
