
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

  const sanitizeJSONString = (jsonString: string): string => {
    // Fix common JSON issues:
    // 1. Replace unescaped newlines in strings
    let sanitized = jsonString.replace(/([":]\s*"[^"]*?)([\n\r]+)([^"]*?")/g, '$1\\n$3');
    
    // 2. Fix key-value pairs missing values (content without values)
    sanitized = sanitized.replace(/"content"\s*(?!\s*[:}])/g, '"content": ""');
    
    // 3. Fix any missing commas between properties
    sanitized = sanitized.replace(/}(\s*){/g, '},\n$1{');
    
    return sanitized;
  };

  const extractTemplates = (data: any): LayoutTemplate[] => {
    // Handle the various possible formats
    if (Array.isArray(data)) {
      // Case 1: Direct array of templates
      if (data.length > 0 && isTemplateObject(data[0])) {
        return data;
      }
      
      // Case 2: Array with key-data structure like your provided example
      const keyDataItem = data.find(item => item.key === "admin-layout-templates" && Array.isArray(item.data));
      if (keyDataItem) {
        return keyDataItem.data;
      }
    }
    
    // Case 3: Object with templates array
    if (data.templates && Array.isArray(data.templates)) {
      return data.templates;
    }
    
    // Case 4: Object with admin-layout-templates key
    if (data["admin-layout-templates"] && Array.isArray(data["admin-layout-templates"])) {
      return data["admin-layout-templates"];
    }
    
    // Case 5: Direct object with data array for admin-layout-templates
    if (data.data && Array.isArray(data.data) && data.key === "admin-layout-templates") {
      return data.data;
    }
    
    throw new Error("Não foi possível encontrar templates no formato esperado");
  };

  const isTemplateObject = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === 'object' &&
      obj.id && 
      obj.name && 
      typeof obj.width === 'number' && 
      typeof obj.height === 'number' &&
      Array.isArray(obj.elements)
    );
  };

  const validateTemplate = (template: any): boolean => {
    return (
      template.id && 
      template.name && 
      typeof template.width === 'number' && 
      typeof template.height === 'number' &&
      Array.isArray(template.elements)
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      let content = await file.text();
      console.log("Processing JSON file...");
      
      // Sanitize the JSON content
      content = sanitizeJSONString(content);
      
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        throw new Error("Erro de sintaxe no arquivo JSON. Verifique se o formato está correto.");
      }
      
      // Try to extract templates from various possible structures
      let templates: LayoutTemplate[] = [];
      try {
        templates = extractTemplates(parsedData);
      } catch (extractError) {
        console.error("Template extraction error:", extractError);
        throw new Error("Não foi possível extrair templates do arquivo. Formato não reconhecido.");
      }
      
      // Validate each template
      const validTemplates = templates.filter(validateTemplate);

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

        console.log(`Found ${templatesWithOrientation.length} valid templates`);
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
    } catch (error) {
      console.error("Erro ao importar arquivo JSON:", error);
      setError(error instanceof Error ? error.message : "Erro ao importar arquivo. Verifique se é um JSON válido.");
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
