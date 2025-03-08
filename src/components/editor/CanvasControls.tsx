
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BANNER_SIZES } from "./types";
import { useCanvas } from "./CanvasContext";
import { exportEmailHTML, downloadEmailTemplate } from "./utils/emailExporter";
import { Grid3X3, ZoomIn, ZoomOut, Maximize } from "lucide-react";

export const CanvasControls = () => {
  const { 
    selectedSize, 
    setSelectedSize, 
    handlePreviewAnimation, 
    elements,
    organizeElements,
    zoomLevel,
    setZoomLevel
  } = useCanvas();

  const exportEmail = () => {
    const html = exportEmailHTML(elements, selectedSize);
    downloadEmailTemplate(html);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
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
        <div className="flex items-center mr-4">
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="px-2 mr-1">
            <ZoomOut size={16} />
          </Button>
          <span className="mx-2 text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="px-2 ml-1">
            <ZoomIn size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom} className="px-2 ml-1">
            <Maximize size={16} />
          </Button>
        </div>
        
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
