import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { generateBannerSizes, generateSquareSizes, generateRectangleSizes } from "@/utils/formatGenerator";
import { BannerSize } from "@/components/editor/types";
import { PSDImport } from "@/components/editor/PSDImport";

interface FormatSelectionDialogProps {
  onSelectFormat: (format: BannerSize) => void;
  onUploadPSD?: (success: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FormatSelectionDialog = ({
  onSelectFormat,
  onUploadPSD,
  open,
  onOpenChange
}: FormatSelectionDialogProps) => {
  const [activeTab, setActiveTab] = useState<"inicio" | "formatos" | "psd">("inicio");
  const [selectedFormat, setSelectedFormat] = useState<BannerSize | null>(null);
  const [psdUploaded, setPsdUploaded] = useState(false);

  const socialMediaSizes = generateBannerSizes();
  const squareSizes = generateSquareSizes();
  const rectangleSizes = generateRectangleSizes();

  const handleSelectFormat = (format: BannerSize) => {
    setSelectedFormat(format);
    setPsdUploaded(false);
  };

  const handleUploadPSD = (success: boolean) => {
    if (success) {
      setPsdUploaded(true);
      setSelectedFormat(null);
      onOpenChange(false); // Fechar o diálogo automaticamente após o upload bem-sucedido
      if (onUploadPSD) onUploadPSD(success); // Notificar o Canvas sobre o sucesso do upload
    }
  };

  const renderSizeGridItems = (sizes: BannerSize[]) => {
    return sizes.map((size, index) => (
      <div
        key={`${size.name}-${index}`}
        className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-colors ${
          selectedFormat?.name === size.name ? "border-primary bg-primary/10" : "hover:bg-gray-50"
        }`}
        onClick={() => handleSelectFormat(size)}
      >
        <div className="w-28 h-28 mb-2 relative overflow-hidden border rounded-md">
          <img
            src="/thumbnails/generic-thumbnail.png"
            alt="Thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-medium text-center">{size.name}</span>
        <span className="text-xs text-gray-500 text-center">{size.width} × {size.height}px</span>
      </div>
    ));
  };

  const renderInitialOptions = () => (
    <div className="grid grid-cols-2 gap-8 max-w-md mt-8">
      <div
        className="flex flex-col items-center p-6 border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
        onClick={() => setActiveTab("formatos")}
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h4 className="font-medium">Escolher um formato</h4>
        <p className="text-sm text-gray-500 text-center mt-2">
          Comece com um formato pré-definido para redes sociais ou personalizado
        </p>
      </div>

      <div
        className="flex flex-col items-center p-6 border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
        onClick={() => setActiveTab("psd")}
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h4 className="font-medium">Importar PSD</h4>
        <p className="text-sm text-gray-500 text-center mt-2">
          Comece importando um arquivo PSD existente do Photoshop
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Começar um novo projeto</DialogTitle>
        </DialogHeader>

        {activeTab === "inicio" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <h3 className="text-lg font-medium text-center">Como deseja começar?</h3>
            {renderInitialOptions()}
          </div>
        ) : (
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
                      {renderSizeGridItems(socialMediaSizes)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-3">Quadrados</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {renderSizeGridItems(squareSizes)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-3">Retângulos</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {renderSizeGridItems(rectangleSizes)}
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
                  <PSDImport onUpload={(success) => handleUploadPSD(success)} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveTab("inicio")}
          >
            Voltar
          </Button>
          <Button
            disabled={!selectedFormat && !psdUploaded}
            onClick={() => {
              if (selectedFormat || psdUploaded) {
                onOpenChange(false);
                if (selectedFormat) onSelectFormat(selectedFormat);
              }
            }}
          >
            Começar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
