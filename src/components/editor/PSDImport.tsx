
import { UploadIcon } from "lucide-react";
import { useCanvas } from "./CanvasContext";
import { importPSDFile } from "./utils/psdImport";
import { Button } from "../ui/button";
import { toast } from "sonner";

export const PSDImport = () => {
  const { selectedSize, setElements } = useCanvas();

  const handlePSDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.psd')) {
      toast.error("Please upload a valid PSD file.");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("Importing PSD file...");
      
      // Import PSD file
      const elements = await importPSDFile(file, selectedSize);
      
      // Update canvas elements
      setElements(elements);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      toast.success(`Imported ${elements.length} elements from ${file.name}`);
    } catch (error) {
      console.error("Error importing PSD file:", error);
      toast.error("Failed to import PSD file. See console for details.");
    }
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        id="psd-upload"
        accept=".psd"
        onChange={handlePSDUpload}
        className="hidden"
      />
      <label htmlFor="psd-upload">
        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
          <span>
            <UploadIcon size={14} />
            Import PSD
          </span>
        </Button>
      </label>
    </div>
  );
};
