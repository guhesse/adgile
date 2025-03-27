
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StartProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFormat: () => void;
  onImportPSD: () => void;
}

export const StartProjectDialog: React.FC<StartProjectDialogProps> = ({
  open,
  onOpenChange,
  onSelectFormat,
  onImportPSD,
}) => {
  // Handle open change to prevent accidental closing
  const handleOpenChange = (value: boolean) => {
    // Only allow changing to false if the user has made a selection
    if (value === true) { // Always allow opening
      onOpenChange(true);
    }
    // We don't allow closing without making a selection
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Começar um novo projeto</DialogTitle>
          <DialogDescription className="text-center">
            Escolha como deseja iniciar seu novo projeto
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8">
          <div className="grid grid-cols-2 gap-8">
            <div 
              className="flex flex-col items-center cursor-pointer border p-8 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={onSelectFormat}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText size={30} className="text-primary" />
              </div>
              <h4 className="text-base font-medium mb-1">Escolher um formato</h4>
              <p className="text-sm text-gray-500 text-center max-w-[220px]">
                Comece com um formato pré-definido para redes sociais ou personalizado
              </p>
            </div>
            
            <div 
              className="flex flex-col items-center cursor-pointer border p-8 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={onImportPSD}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload size={30} className="text-primary" />
              </div>
              <h4 className="text-base font-medium mb-1">Importar PSD</h4>
              <p className="text-sm text-gray-500 text-center max-w-[220px]">
                Comece importando um arquivo PSD existente do Photoshop
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
