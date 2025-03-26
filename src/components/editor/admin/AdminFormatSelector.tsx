
import React, { useState } from "react";
import { BannerSize } from "@/components/editor/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Square } from "lucide-react";

interface AdminFormatSelectorProps {
  formats: BannerSize[];
  onSelectFormat: (format: BannerSize) => void;
  selectedFormat: BannerSize | null;
}

export const AdminFormatSelector: React.FC<AdminFormatSelectorProps> = ({
  formats,
  onSelectFormat,
  selectedFormat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "vertical" | "horizontal" | "square">("all");

  // Filtrar formatos por orientação e pesquisa
  const filteredFormats = formats
    .filter((format) => {
      if (searchTerm) {
        return (
          format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${format.width}x${format.height}`.includes(searchTerm)
        );
      }
      return true;
    })
    .filter((format) => {
      if (activeTab === "all") return true;
      const ratio = format.width / format.height;
      if (activeTab === "square" && ratio >= 0.95 && ratio <= 1.05) return true;
      if (activeTab === "horizontal" && ratio > 1.05) return true;
      if (activeTab === "vertical" && ratio < 0.95) return true;
      return false;
    });

  const handleSelectFormat = (format: BannerSize) => {
    onSelectFormat(format);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <Input
          placeholder="Pesquisar formatos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            Todos
          </TabsTrigger>
          <TabsTrigger value="vertical" className="flex-1">
            <TrendingUp className="h-4 w-4 rotate-90 mr-1" />
            V
          </TabsTrigger>
          <TabsTrigger value="horizontal" className="flex-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            H
          </TabsTrigger>
          <TabsTrigger value="square" className="flex-1">
            <Square className="h-4 w-4 mr-1" />
            Q
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 border rounded-md p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="p-2 grid grid-cols-2 gap-2">
              {filteredFormats.map((format, index) => (
                <div
                  key={`${format.name}-${format.width}-${format.height}`}
                  className={`relative border rounded-md overflow-hidden cursor-pointer transition-all ${
                    selectedFormat &&
                    selectedFormat.width === format.width &&
                    selectedFormat.height === format.height
                      ? "border-2 border-blue-500"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleSelectFormat(format)}
                >
                  <div
                    className="relative w-full"
                    style={{
                      paddingBottom: `${(format.height / format.width) * 100}%`,
                    }}
                  >
                    {format.thumbnail && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gray-100">
                        <img
                          src={`/thumbnails/${format.thumbnail}`}
                          alt={format.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      <div className="text-xs font-medium text-center line-clamp-1 bg-white/80 px-1 rounded">
                        {format.name}
                      </div>
                      <div className="text-[10px] text-gray-500 bg-white/80 px-1 rounded mt-1">
                        {format.width}×{format.height}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="vertical" className="flex-1 border rounded-md p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="p-2 grid grid-cols-2 gap-2">
              {filteredFormats.map((format, index) => (
                <div
                  key={`${format.name}-${format.width}-${format.height}`}
                  className={`relative border rounded-md overflow-hidden cursor-pointer transition-all ${
                    selectedFormat &&
                    selectedFormat.width === format.width &&
                    selectedFormat.height === format.height
                      ? "border-2 border-blue-500"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleSelectFormat(format)}
                >
                  <div
                    className="relative w-full"
                    style={{
                      paddingBottom: `${(format.height / format.width) * 100}%`,
                    }}
                  >
                    {format.thumbnail && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gray-100">
                        <img
                          src={`/thumbnails/${format.thumbnail}`}
                          alt={format.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      <div className="text-xs font-medium text-center line-clamp-1 bg-white/80 px-1 rounded">
                        {format.name}
                      </div>
                      <div className="text-[10px] text-gray-500 bg-white/80 px-1 rounded mt-1">
                        {format.width}×{format.height}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="horizontal" className="flex-1 border rounded-md p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="p-2 grid grid-cols-2 gap-2">
              {filteredFormats.map((format, index) => (
                <div
                  key={`${format.name}-${format.width}-${format.height}`}
                  className={`relative border rounded-md overflow-hidden cursor-pointer transition-all ${
                    selectedFormat &&
                    selectedFormat.width === format.width &&
                    selectedFormat.height === format.height
                      ? "border-2 border-blue-500"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleSelectFormat(format)}
                >
                  <div
                    className="relative w-full"
                    style={{
                      paddingBottom: `${(format.height / format.width) * 100}%`,
                    }}
                  >
                    {format.thumbnail && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gray-100">
                        <img
                          src={`/thumbnails/${format.thumbnail}`}
                          alt={format.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      <div className="text-xs font-medium text-center line-clamp-1 bg-white/80 px-1 rounded">
                        {format.name}
                      </div>
                      <div className="text-[10px] text-gray-500 bg-white/80 px-1 rounded mt-1">
                        {format.width}×{format.height}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="square" className="flex-1 border rounded-md p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="p-2 grid grid-cols-2 gap-2">
              {filteredFormats.map((format, index) => (
                <div
                  key={`${format.name}-${format.width}-${format.height}`}
                  className={`relative border rounded-md overflow-hidden cursor-pointer transition-all ${
                    selectedFormat &&
                    selectedFormat.width === format.width &&
                    selectedFormat.height === format.height
                      ? "border-2 border-blue-500"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleSelectFormat(format)}
                >
                  <div
                    className="relative w-full"
                    style={{
                      paddingBottom: `${(format.height / format.width) * 100}%`,
                    }}
                  >
                    {format.thumbnail && (
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gray-100">
                        <img
                          src={`/thumbnails/${format.thumbnail}`}
                          alt={format.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      <div className="text-xs font-medium text-center line-clamp-1 bg-white/80 px-1 rounded">
                        {format.name}
                      </div>
                      <div className="text-[10px] text-gray-500 bg-white/80 px-1 rounded mt-1">
                        {format.width}×{format.height}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
