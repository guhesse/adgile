
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { BannerSize, EXTENDED_BANNER_SIZES } from "../types";
import { PSDImport } from "@/components/editor/PSDImport";
import { 
  verticalFormats, 
  horizontalFormats, 
  squareFormats 
} from "@/data/formats";

interface FormatSelectionDialogProps {
  onSelectFormat: (format: BannerSize) => void;
  onUploadPSD?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FormatSelectionDialog = ({
  onSelectFormat,
  onUploadPSD,
  open,
  onOpenChange
}: FormatSelectionDialogProps) => {
  const [activeTab, setActiveTab] = useState("formatos");
  
  const handleSelectFormat = (format: BannerSize) => {
    onSelectFormat(format);
    onOpenChange(false);
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
        className="flex flex-col items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
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

  // Don't allow closing the dialog with escape key or clicking outside if no format is selected
  const handleOpenChange = (value: boolean) => {
    // Only allow closing if we're moving from open to closed AND we already have a format selected
    if (!value) {
      onOpenChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Escolher um formato</DialogTitle>
          <DialogDescription>
            Selecione um formato para começar seu design
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="formatos" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formatos">Formatos</TabsTrigger>
            <TabsTrigger value="psd">Upload PSD</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="formatos" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-3">Redes Sociais</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {renderSizeGridItems(EXTENDED_BANNER_SIZES.filter(size => 
                      size.name.includes("Facebook") || 
                      size.name.includes("Instagram") || 
                      size.name.includes("Twitter") || 
                      size.name.includes("LinkedIn") ||
                      size.name.includes("TikTok") ||
                      size.name.includes("YouTube") ||
                      size.name.includes("WhatsApp") ||
                      size.name.includes("Pinterest")
                    ).slice(0, 9))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">Quadrados</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {renderSizeGridItems(squareFormats.slice(0, 6))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">Horizontais</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {renderSizeGridItems(horizontalFormats.slice(0, 9))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">Verticais</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {renderSizeGridItems(verticalFormats.slice(0, 9))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">Email</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {renderSizeGridItems(EXTENDED_BANNER_SIZES.filter(size => 
                      size.name.includes("Email")
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium mb-3">Anúncios</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {renderSizeGridItems(EXTENDED_BANNER_SIZES.filter(size => 
                      size.name.includes("Ad") || 
                      size.name.includes("Display") ||
                      size.name.includes("Google")
                    ).slice(0, 9))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="psd" className="mt-0 flex flex-col items-center justify-center h-full">
              <div className="p-8 border-2 border-dashed rounded-lg text-center max-w-md">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Importe seu arquivo PSD</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Carregue um arquivo PSD do Photoshop para começar com suas camadas e elementos já importados
                </p>
                <PSDImport />
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          {activeTab !== "formatos" && (
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("formatos")}
            >
              Voltar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
