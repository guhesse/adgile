
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BANNER_SIZES } from "./types";
import { useCanvas } from "./CanvasContext";
import { exportEmailHTML, downloadEmailTemplate } from "./utils/emailExporter";
import { Grid3X3 } from "lucide-react";

export const CanvasControls = () => {
  const { 
    selectedSize, 
    setSelectedSize, 
    handlePreviewAnimation, 
    elements,
    organizeElements
  } = useCanvas();

  const exportEmail = () => {
    const html = exportEmailHTML(elements, selectedSize);
    downloadEmailTemplate(html);
  };

  return (
    <div className="flex justify-between items-center p-4">
      <Select
        value={selectedSize.name}
        onValueChange={(value) => {
          const size = BANNER_SIZES.find(s => s.name === value);
          if (size) setSelectedSize(size);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {BANNER_SIZES.map((size) => (
            <SelectItem key={size.name} value={size.name}>
              {size.name} ({size.width}x{size.height})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={organizeElements}>
          <Grid3X3 size={16} className="mr-2" />
          Organize Elements
        </Button>
        <Button variant="outline" size="sm" onClick={handlePreviewAnimation}>
          Preview Animation
        </Button>
        <Button variant="default" size="sm" onClick={exportEmail}>
          Export
        </Button>
      </div>
    </div>
  );
};
