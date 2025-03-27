
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerSize } from "../types";

const SOCIAL_MEDIA_FORMATS: BannerSize[] = [
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Facebook Cover", width: 820, height: 312 },
  { name: "Twitter Post", width: 1024, height: 512 },
  { name: "Twitter Header", width: 1500, height: 500 },
  { name: "LinkedIn Post", width: 1200, height: 627 },
  { name: "LinkedIn Banner", width: 1584, height: 396 }
];

const EMAIL_FORMATS: BannerSize[] = [
  { name: "Email Template", width: 600, height: 800 },
  { name: "Email Header", width: 600, height: 200 },
  { name: "Email Newsletter", width: 600, height: 1200 }
];

const AD_FORMATS: BannerSize[] = [
  { name: "Display Ad - Medium Rectangle", width: 300, height: 250 },
  { name: "Display Ad - Leaderboard", width: 728, height: 90 },
  { name: "Display Ad - Large Rectangle", width: 336, height: 280 },
  { name: "Display Ad - Skyscraper", width: 160, height: 600 },
  { name: "Display Ad - Half Page", width: 300, height: 600 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 }
];

const PRINT_FORMATS: BannerSize[] = [
  { name: "A4 Portrait", width: 794, height: 1123 },
  { name: "A4 Landscape", width: 1123, height: 794 },
  { name: "A5 Portrait", width: 559, height: 794 },
  { name: "A5 Landscape", width: 794, height: 559 },
  { name: "Business Card", width: 336, height: 192 }
];

const CUSTOM_FORMATS: BannerSize[] = [
  { name: "Wide Banner", width: 1200, height: 300 },
  { name: "Square Medium", width: 500, height: 500 },
  { name: "Portrait Medium", width: 500, height: 750 },
  { name: "Landscape Medium", width: 750, height: 500 }
];

interface FormatSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFormat: (format: BannerSize) => void;
}

export const FormatSelectionDialog: React.FC<FormatSelectionDialogProps> = ({
  open,
  onOpenChange,
  onSelectFormat,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Escolher formato</DialogTitle>
          <DialogDescription className="text-center">
            Selecione um formato para seu projeto
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="social" className="py-4">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="social" className="flex-1">Redes Sociais</TabsTrigger>
            <TabsTrigger value="ads" className="flex-1">Anúncios</TabsTrigger>
            <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
            <TabsTrigger value="print" className="flex-1">Impressão</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Personalizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {SOCIAL_MEDIA_FORMATS.map((format) => (
                <FormatCard key={format.name} format={format} onSelect={onSelectFormat} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ads" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {AD_FORMATS.map((format) => (
                <FormatCard key={format.name} format={format} onSelect={onSelectFormat} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {EMAIL_FORMATS.map((format) => (
                <FormatCard key={format.name} format={format} onSelect={onSelectFormat} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="print" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {PRINT_FORMATS.map((format) => (
                <FormatCard key={format.name} format={format} onSelect={onSelectFormat} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-0">
            <div className="grid grid-cols-3 gap-6">
              {CUSTOM_FORMATS.map((format) => (
                <FormatCard key={format.name} format={format} onSelect={onSelectFormat} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface FormatCardProps {
  format: BannerSize;
  onSelect: (format: BannerSize) => void;
}

const FormatCard: React.FC<FormatCardProps> = ({ format, onSelect }) => {
  // Calculate the display ratio for the preview (scale to fit card)
  const isVertical = format.height > format.width;
  const aspectRatio = format.width / format.height;
  
  // Max dimensions for the preview
  const maxWidth = 140;
  const maxHeight = 140;
  
  // Calculate preview dimensions
  let previewWidth: number;
  let previewHeight: number;
  
  if (isVertical) {
    previewHeight = maxHeight;
    previewWidth = previewHeight * aspectRatio;
  } else {
    previewWidth = maxWidth;
    previewHeight = previewWidth / aspectRatio;
  }
  
  return (
    <div 
      className="border rounded-lg hover:border-primary cursor-pointer transition-all hover:shadow-md"
      onClick={() => onSelect(format)}
    >
      <div className="p-4 flex flex-col items-center">
        <div 
          className="border border-gray-300 bg-gray-50 mb-3 flex items-center justify-center"
          style={{ 
            width: `${previewWidth}px`, 
            height: `${previewHeight}px`
          }}
        >
          <div className="text-xs text-gray-400">
            {format.width} × {format.height}
          </div>
        </div>
        <h3 className="font-medium text-sm">{format.name}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {format.width} × {format.height} px
        </p>
      </div>
    </div>
  );
};
