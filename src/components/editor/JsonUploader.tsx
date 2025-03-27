
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useCanvas } from "./CanvasContext";
import { enhancedStorage } from "@/utils/storageUtils";

export function JsonUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setElements, setSelectedSize, addCustomSize } = useCanvas();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const jsonContent = await readFileAsText(file);
      const parsedData = JSON.parse(jsonContent);
      
      if (validateJsonStructure(parsedData)) {
        // Process the data - apply to canvas
        processJsonData(parsedData);
        toast.success("JSON importado com sucesso!");
      } else {
        toast.error("Estrutura de JSON inválida");
      }
    } catch (error) {
      console.error('Error processing JSON:', error);
      toast.error("Erro ao processar arquivo JSON");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  const validateJsonStructure = (data: any): boolean => {
    // Basic validation - check if data has expected properties
    return (
      data && 
      (Array.isArray(data.elements) || typeof data.elements === 'object') &&
      (data.selectedSize || data.activeSize || data.size)
    );
  };

  const processJsonData = (data: any) => {
    // Apply the data to the canvas
    if (Array.isArray(data.elements)) {
      setElements(data.elements);
    } else if (typeof data.elements === 'object') {
      setElements(Object.values(data.elements));
    }

    // Set active size
    const activeSize = data.selectedSize || data.activeSize || data.size;
    if (activeSize) {
      setSelectedSize(activeSize);
      addCustomSize(activeSize);
    }

    // Store the imported data
    enhancedStorage.setItem('imported-json-data', data);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4" />
        Importar JSON
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </>
  );
}
