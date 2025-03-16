
import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useCanvas } from './CanvasContext';
import { importPSDFile } from './utils/psd/importPSD';
import { BannerSize } from './types';
import { toast } from 'sonner';

export const PSDImport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [customSize, setCustomSize] = useState<BannerSize>({
    name: '',
    width: 0,
    height: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const { 
    setElements, 
    setSelectedSize, 
    setActiveSizes, 
    activeSizes, 
    addCustomSize 
  } = useCanvas();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleCustomSizeChange = (field: keyof BannerSize, value: string) => {
    setCustomSize(prev => ({
      ...prev,
      [field]: field === 'name' ? value : parseInt(value) || 0
    }));
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecione um arquivo PSD para importar");
      return;
    }

    if (!customSize.name || customSize.width <= 0 || customSize.height <= 0) {
      toast.error("Nome e dimensões são obrigatórios");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Importando PSD...");

    try {
      // Import PSD file with the new custom size
      const elements = await importPSDFile(file, customSize);
      
      // Ensure ALL elements have global sizeId to appear in all formats
      const globalElements = elements.map(element => ({
        ...element,
        sizeId: 'global'
      }));
      
      // Update canvas elements
      setElements(globalElements);
      
      // Add the custom size to active sizes if not already there
      if (!activeSizes.some(size => size.name === customSize.name)) {
        addCustomSize(customSize);
      }
      
      // Set the custom size as selected
      setSelectedSize(customSize);
      
      // Log information about imported elements
      const textElements = globalElements.filter(el => el.type === 'text').length;
      const imageElements = globalElements.filter(el => el.type === 'image').length;
      const containerElements = globalElements.filter(el => el.type === 'container').length;
      
      console.log("=== PSD IMPORT COMPLETED ===");
      console.log("Resumo da importação:", {
        total: globalElements.length,
        textos: textElements,
        imagens: imageElements,
        containers: containerElements
      });
      
      if (globalElements.length === 0) {
        toast.warning("Nenhum elemento foi importado do arquivo PSD. Verifique os logs para mais detalhes.");
      } else {
        toast.success(`Importados ${globalElements.length} elementos do arquivo PSD. (${textElements} textos, ${imageElements} imagens, ${containerElements} containers)`);
      }
    } catch (error) {
      console.error("Erro ao importar PSD:", error);
      toast.error("Erro ao importar o arquivo PSD. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
      setIsOpen(false);
      setFile(null);
      setCustomSize({
        name: '',
        width: 0,
        height: 0
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="mr-1" 
        onClick={() => setIsOpen(true)}
      >
        Importar PSD
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar arquivo PSD</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="psd-file">Arquivo PSD</Label>
              <Input
                id="psd-file"
                type="file"
                accept=".psd"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="custom-name">Nome do formato</Label>
              <Input
                id="custom-name"
                type="text"
                placeholder="Ex: Banner Homepage"
                value={customSize.name}
                onChange={(e) => handleCustomSizeChange('name', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom-width">Largura (px)</Label>
                <Input
                  id="custom-width"
                  type="number"
                  placeholder="Ex: 1200"
                  value={customSize.width || ''}
                  onChange={(e) => handleCustomSizeChange('width', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="custom-height">Altura (px)</Label>
                <Input
                  id="custom-height"
                  type="number"
                  placeholder="Ex: 628"
                  value={customSize.height || ''}
                  onChange={(e) => handleCustomSizeChange('height', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? "Importando..." : "Importar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
