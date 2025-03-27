
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileJson, Import } from "lucide-react";
import { toast } from "sonner";
import { LayoutTemplate } from "@/components/editor/types/admin";
import { saveToIndexedDB } from "@/utils/indexedDBUtils";

interface AdminJsonImporterProps {
  onLayoutsImport: (templates: LayoutTemplate[]) => void;
  existingTemplates: LayoutTemplate[];
}

export const AdminJsonImporter: React.FC<AdminJsonImporterProps> = ({ 
  onLayoutsImport,
  existingTemplates
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store file name for display
    setFileName(file.name);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error("Por favor, carregue um arquivo JSON válido.");
      setFileName(null);
      return;
    }

    try {
      // Set importing state
      setIsImporting(true);
      
      // Show loading toast
      const loadingToast = toast.loading(`Importando ${file.name}...`);
      
      // Read the file content
      const content = await readFileAsText(file);
      
      // Try to parse the JSON
      const parsedData = JSON.parse(content);
      
      // Basic validation - check if it's an array of templates
      if (!Array.isArray(parsedData)) {
        toast.dismiss(loadingToast);
        toast.error("Formato JSON inválido. Esperava um array de templates.");
        setIsImporting(false);
        return;
      }
      
      // Process the templates
      const validTemplates = parsedData.filter(isValidTemplate);
      
      if (validTemplates.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Nenhum template válido encontrado no arquivo JSON.");
        setIsImporting(false);
        return;
      }
      
      // Ensure all templates have unique IDs
      const processedTemplates = validTemplates.map(template => ({
        ...template,
        id: template.id || `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Combine with existing templates
      const updatedTemplates = [...existingTemplates, ...processedTemplates];
      
      // Save to IndexedDB
      await saveToIndexedDB('admin-layout-templates', updatedTemplates);
      
      // Notify parent component
      onLayoutsImport(processedTemplates);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Importados ${processedTemplates.length} templates com sucesso.`);
    } catch (error) {
      console.error("Error importing JSON:", error);
      toast.error("Erro ao importar arquivo JSON. Verifique o formato e tente novamente.");
    } finally {
      // Reset state
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to read file content as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Helper function to validate a template object
  const isValidTemplate = (template: any): template is LayoutTemplate => {
    return (
      template &&
      typeof template === 'object' &&
      (typeof template.name === 'string' || typeof template.id === 'string') &&
      typeof template.width === 'number' &&
      typeof template.height === 'number' &&
      Array.isArray(template.elements)
    );
  };

  return (
    <div className="flex items-center mb-4">
      <input
        type="file"
        id="admin-json-upload"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isImporting}
      />
      <label htmlFor="admin-json-upload" className="flex gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 w-full" 
          asChild
          disabled={isImporting}
          onClick={handleClick}
        >
          <span>
            <FileJson size={16} />
            {isImporting ? "Importando..." : "Importar Templates JSON"}
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
