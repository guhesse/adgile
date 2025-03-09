import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BANNER_SIZES } from "./types";
import { useCanvas } from "./CanvasContext";
import { exportEmailHTML, downloadEmailTemplate } from "./utils/emailExporter";
import { 
  Grid3X3, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Hand, 
  MinusCircle, 
  PlusCircle
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const CanvasControls = () => {
  const { 
    selectedSize, 
    setSelectedSize, 
    handlePreviewAnimation, 
    elements,
    organizeElements,
    zoomLevel,
    setZoomLevel,
    activeSizes,
    setCanvasNavMode,
    canvasNavMode
  } = useCanvas();

  const exportEmail = () => {
    const html = exportEmailHTML(elements, selectedSize);
    downloadEmailTemplate(html);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.2));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleZoomSliderChange = (value: number[]) => {
    setZoomLevel(value[0] / 100);
  };

  const handleToggleNavMode = () => {
    setCanvasNavMode(canvasNavMode === 'pan' ? 'edit' : 'pan');
  };

  return (
    <div className="flex justify-between items-center p-4">
      <Select
        value={selectedSize.name === 'All' ? 'All' : selectedSize.name}
        onValueChange={(value) => {
          if (value === 'All') {
            setSelectedSize({ ...selectedSize, name: 'All' });
          } else {
            const size = BANNER_SIZES.find(s => s.name === value);
            if (size) setSelectedSize(size);
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Sizes</SelectItem>
          <SelectItem value="divider" disabled className="text-xs text-gray-400 py-1 opacity-70">
            ─────── Active Sizes ───────
          </SelectItem>
          {activeSizes.map((size) => (
            <SelectItem key={size.name} value={size.name}>
              {size.name} ({size.width}×{size.height})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
        <div className="flex items-center mr-4">
          <Button 
            variant={canvasNavMode === 'pan' ? "default" : "outline"} 
            size="sm" 
            onClick={handleToggleNavMode} 
            className="px-2 mr-2"
            title="Press and hold spacebar to temporarily activate pan mode"
          >
            <Hand size={16} className={canvasNavMode === 'pan' ? "text-white" : ""} />
            <span className="ml-1 text-xs">
              {canvasNavMode === 'pan' ? 'Panning' : 'Hand Tool'}
            </span>
          </Button>
          
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded mr-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomOut} 
              className="p-1 h-auto" 
              title="Zoom Out (Ctrl + Mouse Wheel Down)"
            >
              <MinusCircle size={16} />
            </Button>
            
            <Slider 
              value={[zoomLevel * 100]} 
              min={20} 
              max={300}
              step={5}
              onValueChange={handleZoomSliderChange}
              className="w-28"
            />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomIn} 
              className="p-1 h-auto" 
              title="Zoom In (Ctrl + Mouse Wheel Up)"
            >
              <PlusCircle size={16} />
            </Button>
            
            <span className="mx-2 text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetZoom} 
              className="p-1 h-7 ml-1" 
              title="Reset Zoom"
            >
              <Maximize size={14} />
            </Button>
          </div>
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
