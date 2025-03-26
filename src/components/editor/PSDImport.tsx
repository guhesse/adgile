
import { UploadIcon, SparklesIcon } from "lucide-react";
import { useCanvas } from "./CanvasContext";
import { importPSDFile } from "./utils/psd/importPSD";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { BannerSize } from "./types";
import { Toggle } from "../ui/toggle";

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

export const PSDImport = () => {
  const { selectedSize, setElements, addCustomSize, setSelectedSize } = useCanvas();
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [useAiAnalysis, setUseAiAnalysis] = useState(true);

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
      const loadingToast = toast.loading(
        useAiAnalysis 
          ? `Importando ${file.name} com análise de layout inteligente... Este processo pode levar alguns segundos.`
          : `Importando ${file.name}... Este processo pode levar alguns segundos.`
      );
      
      // Log file information
      importLogger.info("=== PSD IMPORT STARTED ===");
      importLogger.info(`Importando arquivo PSD: ${file.name}, Tamanho: ${Math.round(file.size / 1024)} KB`);
      importLogger.debug("Estrutura de importação:", {
        passos: [
          "1. Leitura do arquivo PSD",
          "2. Extração das dimensões do documento",
          "3. Criação de um tamanho personalizado baseado nas dimensões",
          "4. Processamento das camadas",
          "5. Extração de texto e formatação",
          "6. Extração de imagens",
          "7. Processamento de máscaras de camada",
          "8. Análise de layout com IA",
          "9. Criação de elementos na canvas"
        ]
      });
      
      // Get PSD file dimensions first
      const { width, height } = await getPSDDimensions(file);
      importLogger.info(`Dimensões detectadas: ${width} × ${height} pixels`);
      
      if (width && height) {
        // Create a custom size based on the PSD dimensions
        const customSizeName = `PSD - ${file.name.replace('.psd', '')}`;
        const customSize: BannerSize = {
          name: customSizeName,
          width,
          height
        };
        
        importLogger.info(`Criando tamanho personalizado: ${customSizeName} (${width}×${height}px)`);
        
        // Add the custom size to active sizes and select it
        addCustomSize(customSize);
        
        // Import PSD file with the new custom size
        importLogger.debug("Iniciando processamento das camadas...");
        const elements = await importPSDFile(file, customSize);
        importLogger.info(`Camadas processadas: ${elements.length}`);
        
        // Update canvas elements
        setElements(elements);
        
        // Set the custom size as selected
        setSelectedSize(customSize);
        
        // Close loading toast
        toast.dismiss(loadingToast);
        
        // Log information about imported elements
        const textCount = elements.filter(el => el.type === 'text').length;
        const imageElements = elements.filter(el => el.type === 'image').length;
        const containerElements = elements.filter(el => el.type === 'container').length;
        const elementsWithConstraints = elements.filter(
          el => el.style.constraintHorizontal && el.style.constraintVertical
        ).length;
        
        importLogger.info("=== PSD IMPORT COMPLETED ===");
        importLogger.info("Resumo da importação:", {
          total: elements.length,
          textos: textCount,
          imagens: imageElements,
          containers: containerElements,
          comConstraints: elementsWithConstraints
        });
        
        if (elements.length === 0) {
          toast.warning("Nenhum elemento foi importado do arquivo PSD. Verifique os logs para mais detalhes.");
        } else if (useAiAnalysis) {
          toast.success(
            `Importados ${elements.length} elementos do arquivo PSD com análise de layout inteligente.`,
            {
              description: `${textCount} textos, ${imageElements} imagens, ${elementsWithConstraints} elementos com posicionamento adaptativo.`,
              duration: 5000,
            }
          );
        } else {
          toast.success(
            `Importados ${elements.length} elementos do arquivo PSD.`,
            { 
              description: `${textCount} textos, ${imageElements} imagens, ${containerElements} containers.`,
              duration: 4000
            }
          );
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
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
        
        <Toggle
          size="sm"
          pressed={useAiAnalysis}
          onPressedChange={setUseAiAnalysis}
          className="ml-2 text-xs gap-1.5 h-8 px-2 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-900"
          title="Usar análise de layout inteligente"
        >
          <SparklesIcon size={14} />
          <span className="hidden sm:inline">IA</span>
        </Toggle>
      </div>
      
      {useAiAnalysis && (
        <div className="text-xs text-gray-500 mt-0.5 pl-1">
          Análise de layout baseada em IA ativada
        </div>
      )}
    </div>
  );
};
