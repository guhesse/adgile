
import { useState } from "react";
import { UploadIcon } from "lucide-react";
import { useCanvas } from "./CanvasContext";
import { importPSDFile } from "./utils/psd/importPSD";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { BannerSize } from "./types";

// Log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Configuração de log - altere para controlar o nível de informações
const LOG_LEVEL = LogLevel.INFO;

/**
 * Função de log centralizada para o componente PSDImport
 */
const importLogger = {
  debug: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.DEBUG) {
      console.log(`[PSDImport Debug] ${message}`, ...data);
    }
  },
  info: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.INFO) {
      console.log(`[PSDImport Info] ${message}`, ...data);
    }
  },
  warn: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.WARN) {
      console.warn(`[PSDImport Warning] ${message}`, ...data);
    }
  },
  error: (message: string, ...data: any[]) => {
    if (LOG_LEVEL <= LogLevel.ERROR) {
      console.error(`[PSDImport Error] ${message}`, ...data);
    }
  }
};

/**
 * Determina a orientação com base nas dimensões
 */
const getOrientation = (width: number, height: number): 'vertical' | 'horizontal' | 'square' => {
  const ratio = width / height;
  if (ratio > 1.05) return 'horizontal';
  if (ratio < 0.95) return 'vertical';
  return 'square';
};

export const PSDImport = () => {
  const { addCustomSize, setElements, setSelectedSize } = useCanvas();
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
      importLogger.info("=== PSD IMPORT STARTED ===");
      importLogger.info(`Importando arquivo PSD: ${file.name}, Tamanho: ${Math.round(file.size / 1024)} KB`);
      
      // Get PSD file dimensions first
      const { width, height } = await getPSDDimensions(file);
      importLogger.info(`Dimensões detectadas: ${width} × ${height} pixels`);
      
      if (width && height) {
        // Determine orientation
        const orientation = getOrientation(width, height);
        
        // Create a custom size based on the PSD dimensions
        const psdBaseName = file.name.replace('.psd', '');
        const customSize: BannerSize = {
          name: `PSD - ${psdBaseName}`,
          width,
          height,
          orientation
        };
        
        // Create second artboard with inverted dimensions and opposite orientation
        const invertedOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
        const invertedSize: BannerSize = {
          name: `PSD - ${psdBaseName} (${invertedOrientation})`,
          width: orientation === 'vertical' ? height : width,
          height: orientation === 'vertical' ? width : height,
          orientation: invertedOrientation
        };
        
        importLogger.info(`Criando tamanho primário: ${customSize.name} (${width}×${height}px, ${orientation})`);
        importLogger.info(`Criando tamanho secundário: ${invertedSize.name} (${invertedSize.width}×${invertedSize.height}px, ${invertedOrientation})`);
        
        // Add both custom sizes
        addCustomSize(customSize);
        addCustomSize(invertedSize);
        
        // Import PSD file with the new custom size
        importLogger.debug("Iniciando processamento das camadas...");
        const elements = await importPSDFile(file, customSize);
        importLogger.info(`Camadas processadas: ${elements.length}`);
        
        // Ensure all elements have the specific sizeId (not global)
        // This ensures elements are only shown in their specific artboard
        const primaryElements = elements.map(element => ({
          ...element,
          sizeId: customSize.name
        }));
        
        // Set elements and select the primary size
        setElements(primaryElements);
        setSelectedSize(customSize);
        
        // Close loading toast
        toast.dismiss(loadingToast);
        
        // Display success message
        const textCount = elements.filter(el => el.type === 'text').length;
        const imageElements = elements.filter(el => el.type === 'image').length;
        const containerElements = elements.filter(el => el.type === 'container').length;
        
        if (elements.length === 0) {
          toast.warning("Nenhum elemento foi importado do arquivo PSD.");
        } else {
          toast.success(`Importados ${elements.length} elementos do arquivo PSD para o formato ${orientation}.`);
          toast.info(`Criado formato adicional ${invertedOrientation} vazio para adaptação.`);
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error("Não foi possível determinar as dimensões do arquivo PSD.");
      }
    } catch (error) {
      importLogger.error("=== PSD IMPORT ERROR ===");
      importLogger.error("Erro ao importar arquivo PSD:", error);
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
          importLogger.debug("Analisando estrutura do PSD para obter dimensões...");
          const psd = new PSD(new Uint8Array(reader.result as ArrayBuffer));
          await psd.parse();
          
          // Get dimensions directly from the header
          const width = psd.header.width;
          const height = psd.header.height;
          
          importLogger.debug(`PSD dimensions detected: ${width}x${height}`);
          resolve({ width, height });
        } catch (error) {
          importLogger.error("Error reading PSD dimensions:", error);
          // If dimensions can't be determined, use default values
          importLogger.warn("Usando dimensões padrão (1440×1660) devido a erro na leitura");
          resolve({ width: 1440, height: 1660 });
        }
      };
      
      reader.onerror = () => {
        importLogger.error("Error reading file");
        resolve({ width: 1440, height: 1660 });
      };
      
      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        id="psd-upload"
        accept=".psd"
        onChange={handlePSDUpload}
        className="hidden"
        disabled={isImporting}
      />
      <label htmlFor="psd-upload" className="flex gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          asChild
          disabled={isImporting}
        >
          <span>
            <UploadIcon size={14} />
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
