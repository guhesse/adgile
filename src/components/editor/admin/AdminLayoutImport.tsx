
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { LayoutTemplate } from "../types/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminLayoutImportProps {
  onImportLayouts: (layouts: LayoutTemplate[]) => void;
}

export const AdminLayoutImport: React.FC<AdminLayoutImportProps> = ({ onImportLayouts }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      const content = await file.text();
      const parsedData = JSON.parse(content);
      
      // Verificar se o conteúdo é um array de templates
      if (Array.isArray(parsedData)) {
        // Validar cada template
        const validTemplates = parsedData.filter((template) => {
          return (
            template.id && 
            template.name && 
            typeof template.width === 'number' && 
            typeof template.height === 'number' &&
            Array.isArray(template.elements)
          );
        });

        if (validTemplates.length > 0) {
          // Adicionar a orientação se não existir
          const templatesWithOrientation = validTemplates.map(template => {
            if (!template.orientation) {
              const ratio = template.width / template.height;
              let orientation = 'vertical';
              if (ratio > 1.05) orientation = 'horizontal';
              else if (ratio >= 0.95 && ratio <= 1.05) orientation = 'square';
              
              return { ...template, orientation };
            }
            return template;
          });

          onImportLayouts(templatesWithOrientation);
          toast.success(`Importados ${validTemplates.length} templates com sucesso`);
          
          // Limpar o input para permitir importar o mesmo arquivo novamente
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setError("O arquivo não contém templates válidos. Verifique o formato.");
          toast.error("Nenhum template válido encontrado no arquivo");
        }
      } else if (parsedData.templates && Array.isArray(parsedData.templates)) {
        // Suporte para formato alternativo com propriedade 'templates'
        onImportLayouts(parsedData.templates);
        toast.success(`Importados ${parsedData.templates.length} templates com sucesso`);
      } else {
        setError("Formato de arquivo inválido. O JSON deve ser um array de templates ou ter uma propriedade 'templates'.");
        toast.error("Formato de arquivo inválido");
      }
    } catch (error) {
      console.error("Erro ao importar arquivo JSON:", error);
      setError("Erro ao importar arquivo. Verifique se é um JSON válido.");
      toast.error("Erro ao processar arquivo JSON");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-between flex-nowrap"
        onClick={handleImportClick}
        disabled={isImporting}
      >
        <div className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          <span>Importar Layouts (JSON)</span>
        </div>
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
