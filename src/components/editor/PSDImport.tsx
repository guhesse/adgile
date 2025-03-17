
import { UploadIcon } from "lucide-react";
import { useCanvas } from "./CanvasContext";
import { importPSDFile } from "./utils/psd/importPSD";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { BannerSize } from "./types";

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
      console.log("=== PSD IMPORT STARTED ===");
      console.log("Importando arquivo PSD:", file.name, "Tamanho:", Math.round(file.size / 1024), "KB");
      console.log("Estrutura de importação:", {
        passos: [
          "1. Leitura do arquivo PSD",
          "2. Extração das dimensões do documento",
          "3. Criação de um tamanho personalizado baseado nas dimensões",
          "4. Processamento das camadas",
          "5. Extração de texto e formatação",
          "6. Extração de imagens",
          "7. Criação de elementos na canvas"
        ]
      });
      
      // Get PSD file dimensions first
      const { width, height } = await getPSDDimensions(file);
      console.log("Dimensões detectadas:", width, "×", height, "pixels");
      
      if (width && height) {
        // Create a custom size based on the PSD dimensions
        const customSizeName = `PSD - ${file.name.replace('.psd', '')}`;
        const customSize: BannerSize = {
          name: customSizeName,
          width,
          height
        };
        
        console.log("Criando tamanho personalizado:", customSizeName, `(${width}×${height}px)`);
        
        // Add the custom size to active sizes and select it
        addCustomSize(customSize);
        
        // Import PSD file with the new custom size
        console.log("Iniciando processamento das camadas...");
        const elements = await importPSDFile(file, customSize);
        console.log("Camadas processadas:", elements.length);
        
        // Ensure ALL elements have global sizeId to appear in all formats
        const globalElements = elements.map(element => ({
          ...element,
          sizeId: 'global'
        }));
        
        console.log("Aplicando sizeId global a todos os elementos");
        
        // Additional logging for text elements to debug styling
        const textElements = globalElements.filter(el => el.type === 'text');
        if (textElements.length > 0) {
          console.log("=== DETALHAMENTO DE ELEMENTOS DE TEXTO ===");
          textElements.forEach((textElement, index) => {
            console.log(`Texto #${index + 1}: "${textElement.content}"`);
            console.log(`Estilos aplicados:`, {
              fontFamily: textElement.style.fontFamily || 'Não definido',
              fontSize: textElement.style.fontSize || 'Não definido',
              fontWeight: textElement.style.fontWeight || 'Não definido',
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
      } else {
        toast.dismiss(loadingToast);
        toast.error("Não foi possível determinar as dimensões do arquivo PSD.");
      }
    } catch (error) {
      console.error("=== PSD IMPORT ERROR ===");
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
          console.log("Analisando estrutura do PSD para obter dimensões...");
          const psd = new PSD(new Uint8Array(reader.result as ArrayBuffer));
          await psd.parse();
          
          // Get dimensions directly from the header
          const width = psd.header.width;
          const height = psd.header.height;
          
          console.log(`PSD dimensions detected: ${width}x${height}`);
          resolve({ width, height });
        } catch (error) {
          console.error("Error reading PSD dimensions:", error);
          // If dimensions can't be determined, use default values
          console.log("Usando dimensões padrão (1440×1660) devido a erro na leitura");
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
