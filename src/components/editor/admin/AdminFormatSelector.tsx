
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AdminFormatSelectorProps } from "@/types/admin";
import { BannerSize } from "@/components/editor/types";

export const AdminFormatSelector: React.FC<AdminFormatSelectorProps> = ({
  formats,
  onSelectFormat,
  selectedFormat,
}) => {
  const [activeTab, setActiveTab] = useState<"horizontal" | "vertical" | "square">("horizontal");

  // Group formats by orientation with default empty arrays to prevent undefined access
  const formatsByOrientation = formats?.reduce((acc, format) => {
    const ratio = format.width / format.height;
    
    // Determine orientation based on aspect ratio
    let orientation: "horizontal" | "vertical" | "square" = "horizontal";
    if (ratio >= 0.95 && ratio <= 1.05) {
      orientation = "square";
    } else if (ratio < 0.95) {
      orientation = "vertical";
    }
    
    if (!acc[orientation]) {
      acc[orientation] = [];
    }
    
    acc[orientation].push(format);
    return acc;
  }, {
    horizontal: [] as BannerSize[],
    vertical: [] as BannerSize[],
    square: [] as BannerSize[]
  }) || { horizontal: [], vertical: [], square: [] };

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
            {formatsByOrientation.horizontal.map((format, index) => (
              <FormatCard
                key={`h-${index}`}
                width={format.width}
                height={format.height}
                name={format.name}
                isActive={
                  selectedFormat?.width === format.width &&
                  selectedFormat?.height === format.height
                }
                onClick={() => onSelectFormat(format)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="vertical" className="m-0">
        <ScrollArea className="h-[calc(100vh-230px)]">
          <div className="p-4 grid grid-cols-1 gap-3">
            {formatsByOrientation.vertical.map((format, index) => (
              <FormatCard
                key={`v-${index}`}
                width={format.width}
                height={format.height}
                name={format.name}
                isActive={
                  selectedFormat?.width === format.width &&
                  selectedFormat?.height === format.height
                }
                onClick={() => onSelectFormat(format)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="square" className="m-0">
        <ScrollArea className="h-[calc(100vh-230px)]">
          <div className="p-4 grid grid-cols-1 gap-3">
            {formatsByOrientation.square.map((format, index) => (
              <FormatCard
                key={`s-${index}`}
                width={format.width}
                height={format.height}
                name={format.name}
                isActive={
                  selectedFormat?.width === format.width &&
                  selectedFormat?.height === format.height
                }
                onClick={() => onSelectFormat(format)}
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
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const FormatCard: React.FC<FormatCardProps> = ({ width, height, name, isActive, onClick }) => {
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
      <div className="text-xs text-gray-500 truncate max-w-full">{name}</div>
    </Button>
  );
};
