
import { useState } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BannerSize } from "../types";
import { importPSDFile } from "../utils/psd/importPSD";

interface AdminPSDImportProps {
  onPSDImport: (elements: any[], psdSize: BannerSize) => void;
}

export const AdminPSDImport = ({ onPSDImport }: AdminPSDImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePSDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store file name for display
    setFileName(file.name);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.psd')) {
      toast.error("Por favor, carregue um arquivo PSD válido.");
      setFileName(null);
      return;
    }

    try {
      // Set importing state
      setIsImporting(true);
      
      // Show loading toast
      const loadingToast = toast.loading(`Importando ${file.name}... Este processo pode levar alguns segundos.`);
      
      // Log file information
      console.info(`Importando arquivo PSD: ${file.name}, Tamanho: ${Math.round(file.size / 1024)} KB`);
      
      // Get PSD file dimensions first
      const { width, height } = await getPSDDimensions(file);
      console.info(`Dimensões detectadas: ${width} × ${height} pixels`);
      
      if (width && height) {
        // Create a custom size based on the PSD dimensions
        const customSizeName = `PSD - ${file.name.replace('.psd', '')}`;
        const customSize: BannerSize = {
          name: customSizeName,
          width,
          height
        };
        
        console.log(`Criando tamanho personalizado: ${customSizeName} (${width}×${height}px)`);
        
        // Import PSD file with the new custom size
        console.debug("Iniciando processamento das camadas...");
        const elements = await importPSDFile(file, customSize);
        console.info(`Camadas processadas: ${elements.length}`);
        
        // Pass the imported elements and size back to the parent component
        onPSDImport(elements, customSize);
        
        // Close loading toast
        toast.dismiss(loadingToast);
        
        // Display success message
        const textCount = elements.filter(el => el.type === 'text').length;
        const imageElements = elements.filter(el => el.type === 'image').length;
        const containerElements = elements.filter(el => el.type === 'container').length;
        
        if (elements.length === 0) {
          toast.warning("Nenhum elemento foi importado do arquivo PSD.");
        } else {
          toast.success(`Importados ${elements.length} elementos do arquivo PSD. (${textCount} textos, ${imageElements} imagens, ${containerElements} containers)`);
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error("Não foi possível determinar as dimensões do arquivo PSD.");
      }
    } catch (error) {
      console.error("Erro ao importar arquivo PSD:", error);
      toast.error("Falha ao importar arquivo PSD. Verifique o console para detalhes.");
    } finally {
      // Reset importing state
      setIsImporting(false);
      
      // Reset the input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  // Function to get PSD dimensions before importing
  const getPSDDimensions = async (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      // Create a FileReader
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Import psd.js dynamically
          const PSD = (await import('psd.js')).default;
          
          // Parse the PSD file
          console.debug("Analisando estrutura do PSD para obter dimensões...");
          const psd = new PSD(new Uint8Array(reader.result as ArrayBuffer));
          await psd.parse();
          
          // Get dimensions directly from the header
          const width = psd.header.width;
          const height = psd.header.height;
          
          console.debug(`PSD dimensions detected: ${width}x${height}`);
          resolve({ width, height });
        } catch (error) {
          console.error("Error reading PSD dimensions:", error);
          // If dimensions can't be determined, use default values
          console.warn("Usando dimensões padrão (1440×1660) devido a erro na leitura");
          resolve({ width: 1440, height: 1660 });
        }
      };
      
      reader.onerror = () => {
        console.error("Error reading file");
        resolve({ width: 1440, height: 1660 });
      };
      
      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="flex items-center mb-4">
      <input
        type="file"
        id="admin-psd-upload"
        accept=".psd"
        onChange={handlePSDUpload}
        className="hidden"
        disabled={isImporting}
      />
      <label htmlFor="admin-psd-upload" className="flex gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 w-full" 
          asChild
          disabled={isImporting}
        >
          <span>
            <UploadIcon size={16} />
            {isImporting ? "Importando..." : "Importar PSD"}
          </span>
        </Button>
        
        {fileName && !isImporting && (
          <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] ml-1">
            {fileName}
          </span>
        )}
      </label>
    </div>
  );
};
