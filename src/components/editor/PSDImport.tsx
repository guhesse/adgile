import { UploadIcon } from "lucide-react";
import { useCanvas } from "./CanvasContext";
import { importPSDFile } from "./utils/psd/importPSD";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { BannerSize } from "./types";
import { convertTextStyleToCSS } from './utils/psd/textRenderer';

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
 * Interface para representar as informações de máscara de uma camada PSD
 */
interface MaskInfo {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
  defaultColor: number;
  relative: boolean;
  disabled: boolean;
  invert: boolean;
  hasValidMask: boolean;
}

/**
 * Processa as informações de máscara de uma camada PSD
 */
const processMaskInfo = (layer: any): MaskInfo => {
  // Valor padrão se não houver máscara
  const defaultMask: MaskInfo = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    defaultColor: 0,
    relative: false,
    disabled: false,
    invert: false,
    hasValidMask: false
  };

  // Verifica se a camada existe e tem informações de máscara
  if (!layer || !layer.mask) {
    return defaultMask;
  }

  try {
    const mask = layer.mask;
    
    // Verifica se a máscara tem dimensões válidas
    const hasValidDimensions = 
      mask.width && 
      mask.height && 
      mask.width > 0 && 
      mask.height > 0;
    
    return {
      top: mask.top || 0,
      left: mask.left || 0,
      bottom: mask.bottom || 0,
      right: mask.right || 0,
      width: mask.width || 0,
      height: mask.height || 0,
      defaultColor: mask.defaultColor || 0,
      relative: mask.relative || false,
      disabled: mask.disabled || false,
      invert: mask.invert || false,
      hasValidMask: hasValidDimensions
    };
  } catch (error) {
    importLogger.warn("Erro ao processar informações de máscara:", error);
    return defaultMask;
  }
};

/**
 * Aplicar informações de máscara a um elemento após a importação
 */
const applyMaskInfoToElement = (element: any, maskInfo: MaskInfo): any => {
  // Se não houver máscara válida, retorna o elemento sem alterações
  if (!maskInfo.hasValidMask) {
    return element;
  }

  // Aplicamos as dimensões da máscara para o elemento
  return {
    ...element,
    style: {
      ...element.style,
      // Definimos clipPath para usar as dimensões da máscara como recorte
      clipPath: `inset(0px 0px 0px 0px)`,
      // Dimensões baseadas na máscara
      width: maskInfo.width,
      height: maskInfo.height,
      // Adicionamos propriedades específicas para reconhecer que tem máscara
      hasMask: true,
      maskInfo: {
        top: maskInfo.top,
        left: maskInfo.left,
        bottom: maskInfo.bottom,
        right: maskInfo.right,
        width: maskInfo.width,
        height: maskInfo.height,
        invert: maskInfo.invert,
        disabled: maskInfo.disabled
      }
    }
  };
};

export const PSDImport = () => {
  const { selectedSize, setElements, addCustomSize, setSelectedSize } = useCanvas();
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
      importLogger.debug("Estrutura de importação:", {
        passos: [
          "1. Leitura do arquivo PSD",
          "2. Extração das dimensões do documento",
          "3. Criação de um tamanho personalizado baseado nas dimensões",
          "4. Processamento das camadas",
          "5. Extração de texto e formatação",
          "6. Extração de imagens",
          "7. Processamento de máscaras de camada",
          "8. Criação de elementos na canvas"
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
        
        // Processar máscaras para cada elemento
        const elementsWithMasks = elements.map(element => {
          // Verificar se o elemento tem informações de camada PSD original
          if (element.psdLayerData) {
            // Access name from psdLayerData safely with optional chaining
            const layerName = element.psdLayerData?.name || 'sem nome';
            const maskInfo = processMaskInfo(element.psdLayerData);
            
            if (maskInfo.hasValidMask) {
              importLogger.debug(`Máscara detectada para camada '${layerName}':`, {
                dimensões: `${maskInfo.width}×${maskInfo.height}`,
                posição: `(${maskInfo.left},${maskInfo.top})`,
                invertida: maskInfo.invert,
                desativada: maskInfo.disabled
              });
              
              return applyMaskInfoToElement(element, maskInfo);
            }
          }
          
          return element;
        });
        
        // Contar elementos com máscara
        const maskedElements = elementsWithMasks.filter(el => el.style && el.style.hasMask).length;
        if (maskedElements > 0) {
          importLogger.info(`Processadas ${maskedElements} camadas com máscaras`);
        }
        
        // Ensure ALL elements have global sizeId to appear in all formats
        const globalElements = elementsWithMasks.map(element => ({
          ...element,
          sizeId: 'global'
        }));
        
        importLogger.debug("Aplicando sizeId global a todos os elementos");
        
        // Additional logging for text elements to debug styling
        const textElementsCount = globalElements.filter(el => el.type === 'text').length;
        if (textElementsCount > 0) {
          importLogger.debug("=== DETALHAMENTO DE ELEMENTOS DE TEXTO ===");
          globalElements.filter(el => el.type === 'text').forEach((textElement, index) => {
            importLogger.debug(`Texto #${index + 1}: "${textElement.content}"`);
            importLogger.debug(`Estilos aplicados:`, {
              fontFamily: textElement.style.fontFamily || 'Não definido',
              fontSize: textElement.style.fontSize || 'Não definido',
              fontWeight: textElement.style.fontWeight || 'Não definido',
              fontStyle: textElement.style.fontStyle || 'Não definido',
              color: textElement.style.color || 'Não definido',
              textAlign: textElement.style.textAlign || 'Não definido',
              lineHeight: textElement.style.lineHeight || 'Não definido',
              letterSpacing: textElement.style.letterSpacing || 'Não definido'
            });
          });
        }
        
        // Update canvas elements
        setElements(globalElements);
        
        // Set the custom size as selected
        setSelectedSize(customSize);
        
        // Close loading toast
        toast.dismiss(loadingToast);
        
        // Log information about imported elements
        const textCount = globalElements.filter(el => el.type === 'text').length;
        const imageElements = globalElements.filter(el => el.type === 'image').length;
        const containerElements = globalElements.filter(el => el.type === 'container').length;
        
        importLogger.info("=== PSD IMPORT COMPLETED ===");
        importLogger.info("Resumo da importação:", {
          total: globalElements.length,
          textos: textCount,
          imagens: imageElements,
          containers: containerElements,
          comMáscaras: maskedElements
        });
        
        if (globalElements.length === 0) {
          toast.warning("Nenhum elemento foi importado do arquivo PSD. Verifique os logs para mais detalhes.");
        } else {
          toast.success(`Importados ${globalElements.length} elementos do arquivo PSD. (${textCount} textos, ${imageElements} imagens, ${containerElements} containers, ${maskedElements} com máscaras)`);
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
