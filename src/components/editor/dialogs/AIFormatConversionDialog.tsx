
import React, { useState, PropsWithChildren } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BannerSize } from "../types";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Format categories
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

// Combined all formats
const ALL_FORMATS = [
  ...SOCIAL_MEDIA_FORMATS,
  ...EMAIL_FORMATS,
  ...AD_FORMATS
];

interface AIFormatConversionDialogProps extends PropsWithChildren {
  currentFormat: BannerSize;
  onConvert: (targetFormats: BannerSize[]) => void;
  isAITrained: boolean;
}

export const AIFormatConversionDialog: React.FC<AIFormatConversionDialogProps> = ({
  children,
  currentFormat,
  onConvert,
  isAITrained
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<BannerSize[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  
  // Filter out the current format
  const availableFormats = ALL_FORMATS.filter(format => 
    format.name !== currentFormat.name && 
    !(format.width === currentFormat.width && format.height === currentFormat.height)
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset selection when closing
      setSelectedFormats([]);
    }
  };

  const handleToggleFormat = (format: BannerSize) => {
    const isSelected = selectedFormats.some(f => f.name === format.name);
    
    if (isSelected) {
      setSelectedFormats(selectedFormats.filter(f => f.name !== format.name));
    } else {
      setSelectedFormats([...selectedFormats, format]);
    }
  };

  const handleSelectAll = (formats: BannerSize[]) => {
    const allSelected = formats.every(format => 
      selectedFormats.some(f => f.name === format.name)
    );
    
    if (allSelected) {
      // Deselect all formats in this category
      setSelectedFormats(selectedFormats.filter(selected => 
        !formats.some(f => f.name === selected.name)
      ));
    } else {
      // Select all formats in this category
      const newSelection = [
        ...selectedFormats.filter(selected => 
          !formats.some(f => f.name === selected.name)
        ),
        ...formats
      ];
      setSelectedFormats(newSelection);
    }
  };

  const handleConvert = async () => {
    if (selectedFormats.length === 0) return;
    
    setIsConverting(true);
    
    try {
      // Call the onConvert callback with the selected formats
      onConvert(selectedFormats);
      
      // Close the dialog after a small delay
      setTimeout(() => {
        setOpen(false);
        setIsConverting(false);
        setSelectedFormats([]);
      }, 500);
    } catch (error) {
      console.error("Error during conversion:", error);
      setIsConverting(false);
    }
  };
  
  const formatCategories = [
    { name: "Redes Sociais", formats: SOCIAL_MEDIA_FORMATS.filter(f => 
      f.name !== currentFormat.name && 
      !(f.width === currentFormat.width && f.height === currentFormat.height)
    )},
    { name: "Email", formats: EMAIL_FORMATS.filter(f => 
      f.name !== currentFormat.name && 
      !(f.width === currentFormat.width && f.height === currentFormat.height)
    )},
    { name: "Anúncios", formats: AD_FORMATS.filter(f => 
      f.name !== currentFormat.name && 
      !(f.width === currentFormat.width && f.height === currentFormat.height)
    )}
  ];

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Adaptar para outros formatos</DialogTitle>
            <DialogDescription>
              Selecione os formatos para os quais você deseja adaptar seu design usando IA
            </DialogDescription>
          </DialogHeader>
          
          {!isAITrained ? (
            <div className="py-6 text-center">
              <div className="mb-4 flex justify-center">
                <AlertCircle size={40} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Modelo de IA não treinado</h3>
              <p className="text-gray-600 mb-4">
                O modelo de IA precisa ser treinado antes de poder adaptar designs para outros formatos.
                Acesse o painel Admin para treinar o modelo.
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[400px] mt-4 pr-4">
                <div className="space-y-6">
                  {formatCategories.map(category => (
                    <div key={category.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{category.name}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleSelectAll(category.formats)}
                        >
                          {category.formats.every(format => 
                            selectedFormats.some(f => f.name === format.name)
                          ) ? "Desmarcar todos" : "Selecionar todos"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {category.formats.map((format) => {
                          const isSelected = selectedFormats.some(f => f.name === format.name);
                          return (
                            <div 
                              key={format.name}
                              className={`
                                flex items-center space-x-3 border rounded-lg p-3 cursor-pointer
                                ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}
                              `}
                              onClick={() => handleToggleFormat(format)}
                            >
                              <div className={`
                                w-5 h-5 rounded-full flex items-center justify-center
                                ${isSelected ? 'bg-primary text-white' : 'border border-gray-300'}
                              `}>
                                {isSelected && <Check size={12} />}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{format.name}</div>
                                <div className="text-xs text-gray-500">
                                  {format.width} × {format.height} px
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <DialogFooter className="mt-6">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-gray-500">
                    {selectedFormats.length} formatos selecionados
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleConvert} 
                      disabled={selectedFormats.length === 0 || isConverting}
                    >
                      {isConverting ? "Processando..." : "Adaptar designs"}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
