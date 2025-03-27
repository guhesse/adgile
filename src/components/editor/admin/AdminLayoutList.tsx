
import React, { useState } from "react";
import { LayoutTemplate } from "@/components/editor/types/admin";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Eye, 
  Trash2, 
  Calendar, 
  Terminal,
  Square, 
  TrendingUp,
  X,
  Download,
  Upload
} from "lucide-react";
import { AdminLayoutListProps } from "@/types/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ElementRenderer } from "../ElementRenderer";
import { AdminLayoutImport } from "./AdminLayoutImport";
import { toast } from "sonner";

export const AdminLayoutList: React.FC<AdminLayoutListProps> = ({ 
  templates, 
  onDeleteTemplate,
  onImportTemplates 
}) => {
  // Add a safe check for templates array to prevent runtime errors
  const layoutTemplates = templates || [];
  const [viewingTemplate, setViewingTemplate] = useState<LayoutTemplate | null>(null);
  
  const handleViewTemplate = (template: LayoutTemplate) => {
    console.log("Viewing template:", template);
    setViewingTemplate(template);
  };
  
  const closePreview = () => {
    setViewingTemplate(null);
  };

  // Adicionar função para exportar todos os templates como JSON
  const handleExportAllTemplates = () => {
    if (layoutTemplates.length === 0) {
      toast.error("Não há templates para exportar");
      return;
    }

    try {
      const dataStr = JSON.stringify(layoutTemplates, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `adgile-layouts-${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`${layoutTemplates.length} templates exportados com sucesso`);
    } catch (error) {
      console.error("Erro ao exportar templates:", error);
      toast.error("Erro ao exportar templates");
    }
  };
  
  return (
    <>
      <ScrollArea className="h-[calc(100vh-170px)]">
        <div className="p-4 space-y-4">
          <div className="flex flex-col space-y-2 mb-4">
            <AdminLayoutImport 
              onImportLayouts={(importedTemplates) => {
                if (onImportTemplates) {
                  onImportTemplates(importedTemplates);
                } else {
                  toast.info(`${importedTemplates.length} templates seriam importados`);
                }
              }} 
            />
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={handleExportAllTemplates}
              disabled={layoutTemplates.length === 0}
            >
              <div className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                <span>Exportar Todos ({layoutTemplates.length})</span>
              </div>
            </Button>
          </div>

          {layoutTemplates.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <Terminal className="mx-auto h-8 w-8 opacity-50 mb-2" />
              <p>No layouts found</p>
              <p className="text-xs mt-1">Create and save new layouts to see them here</p>
            </div>
          ) : (
            layoutTemplates.map((layout) => (
              <Card key={layout.id} className="overflow-hidden">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    {layout.orientation === "horizontal" && (
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {layout.orientation === "vertical" && (
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5 rotate-90" />
                    )}
                    {layout.orientation === "square" && (
                      <Square className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {layout.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pb-0">
                  <div className="text-xs text-gray-500 flex items-center mb-2">
                    <span className="inline-flex items-center mr-3">
                      <Terminal className="h-3 w-3 mr-1" />
                      {layout.width} × {layout.height}px
                    </span>
                    <span className="inline-flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(layout.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="relative w-full bg-gray-100 rounded-md overflow-hidden border">
                    <div 
                      className="w-full"
                      style={{ 
                        paddingBottom: `${(layout.height / layout.width) * 100}%`,
                        backgroundColor: "#f1f5f9",
                        maxHeight: "100px" // Smaller thumbnail height
                      }}
                    >
                      {layout.elements && layout.elements.length > 0 && (
                        <div className="absolute inset-0 p-1 pointer-events-none">
                          {/* Render simplified previews of elements */}
                          {layout.elements.map((element, idx) => (
                            <div 
                              key={idx}
                              className="absolute border border-gray-300 bg-white/70"
                              style={{
                                left: `${(element.style.x / layout.width) * 100}%`,
                                top: `${(element.style.y / layout.height) * 100}%`,
                                width: `${(element.style.width / layout.width) * 100}%`,
                                height: `${(element.style.height / layout.height) * 100}%`,
                                backgroundColor: element.style.backgroundColor || 'transparent',
                                borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '0'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-2 flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleViewTemplate(layout)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDeleteTemplate(layout.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Layout Preview Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Layout Preview: {viewingTemplate?.name}</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          
          {viewingTemplate && (
            <div className="mt-4">
              <div className="text-sm mb-2">
                {viewingTemplate.width} × {viewingTemplate.height}px
                {viewingTemplate.orientation && ` • ${viewingTemplate.orientation}`}
              </div>
              
              <div 
                className="relative bg-white border rounded-md mx-auto"
                style={{
                  width: `100%`,
                  maxWidth: `${viewingTemplate.width}px`,
                  height: `${viewingTemplate.height}px`,
                  maxHeight: '70vh'
                }}
              >
                {/* Debug info */}
                <div className="mb-2 text-xs text-gray-500">
                  Elements: {viewingTemplate.elements && viewingTemplate.elements.length ? viewingTemplate.elements.length : 'None'}
                </div>
                
                {/* Render all elements from the template */}
                {viewingTemplate.elements && viewingTemplate.elements.map((element, idx) => (
                  <div
                    key={`${element.id || idx}`}
                    className="absolute"
                    style={{
                      left: element.style.x,
                      top: element.style.y,
                      width: element.style.width,
                      height: element.style.height,
                      zIndex: 10 + idx
                    }}
                  >
                    <ElementRenderer element={element} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
