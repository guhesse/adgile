import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BannerSize, EXTENDED_BANNER_SIZES } from "../types";
import { Separator } from "@/components/ui/separator";
import { Check, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  verticalFormats, 
  horizontalFormats, 
  squareFormats 
} from "@/data/formats";

interface AIFormatConversionDialogProps {
  children: React.ReactNode;
  currentFormat: BannerSize;
  onConvert: (formats: BannerSize[]) => void;
  isAITrained: boolean;
}

export function AIFormatConversionDialog({
  children,
  currentFormat,
  onConvert,
  isAITrained
}: AIFormatConversionDialogProps) {
  const [selectedFormats, setSelectedFormats] = useState<BannerSize[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recommendedFormats, setRecommendedFormats] = useState<BannerSize[]>([]);
  
  // Function to determine if format is vertical, horizontal, or square
  const getFormatType = (format: BannerSize): "vertical" | "horizontal" | "square" => {
    const aspectRatio = format.width / format.height;
    if (aspectRatio > 1.1) return "horizontal";
    if (aspectRatio < 0.9) return "vertical";
    return "square";
  };
  
  // Determine current format type
  const currentFormatType = getFormatType(currentFormat);
  
  // Group formats by similarity
  useEffect(() => {
    if (currentFormat) {
      // Generate recommendations based on format type
      let recommended: BannerSize[] = [];
      
      // Get formats that match the aspect ratio type, but exclude exact current format
      if (currentFormatType === "vertical") {
        recommended = verticalFormats.filter(
          format => format.name !== currentFormat.name
        ).slice(0, 6);
      } else if (currentFormatType === "horizontal") {
        recommended = horizontalFormats.filter(
          format => format.name !== currentFormat.name
        ).slice(0, 6);
      } else {
        recommended = squareFormats.filter(
          format => format.name !== currentFormat.name
        ).slice(0, 6);
      }
      
      // Add some contrasting formats 
      const otherFormats = EXTENDED_BANNER_SIZES.filter(
        format => getFormatType(format) !== currentFormatType && 
                 format.name !== currentFormat.name
      ).slice(0, 4);
      
      setRecommendedFormats([...recommended, ...otherFormats]);
    }
  }, [currentFormat, currentFormatType]);
  
  const toggleFormatSelection = (format: BannerSize) => {
    setSelectedFormats(prev => {
      // Check if format is already selected
      const isSelected = prev.some(f => f.name === format.name);
      
      // If already selected, remove it
      if (isSelected) {
        return prev.filter(f => f.name !== format.name);
      }
      
      // Otherwise add it
      return [...prev, format];
    });
  };
  
  const handleConvert = () => {
    if (selectedFormats.length > 0) {
      onConvert(selectedFormats);
      setSelectedFormats([]);
      setIsOpen(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFormats([]);
    }
  };
  
  // Filter formats by type
  const verticalBanners = verticalFormats.filter(format => format.name !== currentFormat.name);
  const horizontalBanners = horizontalFormats.filter(format => format.name !== currentFormat.name);
  const squareBanners = squareFormats.filter(format => format.name !== currentFormat.name);

  const renderFormatGrid = (formats: BannerSize[]) => {
    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {formats.map((format, index) => {
          const isSelected = selectedFormats.some(f => f.name === format.name);
          
          return (
            <div 
              key={`${format.name}-${index}`}
              className={`
                p-3 border rounded-md cursor-pointer transition-all flex flex-col items-center
                ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}
              `}
              onClick={() => toggleFormatSelection(format)}
            >
              {isSelected && (
                <div className="self-end mb-1">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className="relative mb-2">
                <div 
                  className="border border-gray-300 bg-gray-50"
                  style={{
                    width: '100px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (format.width / format.height) * 80)}px`,
                      height: `${Math.min(80, (format.height / format.width) * 100)}px`,
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      border: '1px solid rgba(59, 130, 246, 0.5)'
                    }}
                  ></div>
                </div>
              </div>
              
              <span className="text-sm font-medium text-center">{format.name}</span>
              <span className="text-xs text-gray-500">{format.width} × {format.height}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Maximize className="h-5 w-5" />
            Desdobrar para outros formatos usando IA
          </DialogTitle>
          <DialogDescription>
            A IA irá adaptar seu design para outros formatos automaticamente. O layout atual é {currentFormat.name} ({currentFormat.width} × {currentFormat.height}).
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Formatos recomendados</h3>
              <div className="grid grid-cols-3 gap-4">
                {recommendedFormats.map((format, index) => {
                  const isSelected = selectedFormats.some(f => f.name === format.name);
                  
                  return (
                    <div 
                      key={`rec-${format.name}-${index}`}
                      className={`
                        p-3 border rounded-md cursor-pointer transition-all flex flex-col items-center
                        ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => toggleFormatSelection(format)}
                    >
                      {isSelected && (
                        <div className="self-end mb-1">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className="relative mb-2">
                        <div 
                          className="border border-gray-300 bg-gray-50"
                          style={{
                            width: '100px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, (format.width / format.height) * 80)}px`,
                              height: `${Math.min(80, (format.height / format.width) * 100)}px`,
                              backgroundColor: 'rgba(59, 130, 246, 0.3)',
                              border: '1px solid rgba(59, 130, 246, 0.5)'
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <span className="text-sm font-medium text-center">{format.name}</span>
                      <span className="text-xs text-gray-500">{format.width} × {format.height}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <Tabs defaultValue="vertical">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="vertical">Vertical</TabsTrigger>
                <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
                <TabsTrigger value="square">Quadrado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vertical">
                {renderFormatGrid(verticalBanners.slice(0, 12))}
              </TabsContent>
              
              <TabsContent value="horizontal">
                {renderFormatGrid(horizontalBanners.slice(0, 12))}
              </TabsContent>
              
              <TabsContent value="square">
                {renderFormatGrid(squareBanners)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            {selectedFormats.length > 0 && (
              <Badge variant="outline" className="mr-2">
                {selectedFormats.length} formato{selectedFormats.length !== 1 ? 's' : ''} selecionado{selectedFormats.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button 
            onClick={handleConvert} 
            disabled={selectedFormats.length === 0 || !isAITrained}
            className="ml-auto"
          >
            Desdobrar Formatos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
