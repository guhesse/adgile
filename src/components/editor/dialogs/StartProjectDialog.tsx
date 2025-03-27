
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Começar um novo projeto</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="inicio" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inicio">Início</TabsTrigger>
            <TabsTrigger value="formatos">Formatos</TabsTrigger>
            <TabsTrigger value="uploadPSD">Upload PSD</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inicio" className="mt-6 py-8">
            <div className="text-center mb-8">
              <h3 className="text-lg font-medium mb-2">Como deseja começar?</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div 
                className="flex flex-col items-center cursor-pointer"
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
                className="flex flex-col items-center cursor-pointer"
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
          </TabsContent>
          
          <TabsContent value="formatos" className="mt-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Selecione um formato</h3>
              <p className="text-sm text-gray-500">
                Você poderá alterar o formato depois
              </p>
            </div>
            <div className="flex justify-center">
              <Card className="w-fit cursor-pointer" onClick={onSelectFormat}>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center">
                    <FileText size={48} className="text-gray-400 mb-4" />
                    <span className="text-primary font-medium">Ver todos os formatos</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="uploadPSD" className="mt-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Importe um arquivo PSD</h3>
              <p className="text-sm text-gray-500">
                Importe diretamente do Photoshop
              </p>
            </div>
            <div className="flex justify-center">
              <Card className="w-fit cursor-pointer" onClick={onImportPSD}>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="flex flex-col items-center">
                    <Upload size={48} className="text-gray-400 mb-4" />
                    <span className="text-primary font-medium">Selecionar arquivo PSD</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
