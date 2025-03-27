
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  generateBannerSizes, 
  generateSquareSizes, 
  generateRectangleSizes 
} from "@/utils/formatGenerator";
import { BannerSize } from "../types";

interface AdminFormatSelectorProps {
  onSelectFormat: (format: BannerSize) => void;
  selectedFormat?: BannerSize | null;
  formats?: BannerSize[];
}

export const AdminFormatSelector = ({ 
  onSelectFormat, 
  selectedFormat, 
  formats 
}: AdminFormatSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("social");
  
  const socialMediaSizes = generateBannerSizes();
  const squareSizes = generateSquareSizes();
  const rectangleSizes = generateRectangleSizes();
  
  const handleSelectFormat = (format: BannerSize) => {
    onSelectFormat(format);
    setOpen(false);
  };
  
  const getFormatImage = (size: BannerSize) => {
    // Determine which default thumbnail to use based on aspect ratio
    const aspectRatio = size.width / size.height;
    
    if (aspectRatio === 1) {
      // Square format
      return '/thumbnails/square-1.png';
    } else if (aspectRatio > 1) {
      // Landscape format
      return '/thumbnails/horizontal-1.png';
    } else {
      // Portrait format
      return '/thumbnails/vertical-1.png';
    }
  };
  
  const renderSizeGridItems = (sizes: BannerSize[]) => {
    return sizes.map((size, index) => (
      <div 
        key={`${size.name}-${index}`}
        className="flex flex-col items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
        onClick={() => handleSelectFormat(size)}
      >
        <div className="w-28 h-28 mb-2 relative overflow-hidden border rounded-md">
          <img 
            src={getFormatImage(size)} 
            alt={size.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-medium text-center">{size.name}</span>
        <span className="text-xs text-gray-500 text-center">{size.width} × {size.height}px</span>
      </div>
    ));
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Escolher Formato</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Selecione um formato</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="social" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="square">Quadrados</TabsTrigger>
            <TabsTrigger value="rectangle">Retângulos</TabsTrigger>
          </TabsList>
          
          <div className="my-4 h-[380px] overflow-y-auto p-1">
            <TabsContent value="social" className="mt-0">
              <div className="grid grid-cols-3 gap-4">
                {renderSizeGridItems(socialMediaSizes)}
              </div>
            </TabsContent>
            
            <TabsContent value="square" className="mt-0">
              <div className="grid grid-cols-3 gap-4">
                {renderSizeGridItems(squareSizes)}
              </div>
            </TabsContent>
            
            <TabsContent value="rectangle" className="mt-0">
              <div className="grid grid-cols-3 gap-4">
                {renderSizeGridItems(rectangleSizes)}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
