
import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface CanvasControlsProps {
  zoomLevel: number;
  setZoomLevel: (zoomLevel: number) => void;
}

export const CanvasControls = ({
  zoomLevel,
  setZoomLevel,
}: CanvasControlsProps) => {
  const handleZoomIn = () => {
    const newZoomLevel = Math.min(zoomLevel + 0.05, 3);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.max(zoomLevel - 0.05, 0.2);
    setZoomLevel(newZoomLevel);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleZoomSliderChange = (value: number[]) => {
    setZoomLevel(value[0] / 100);
  };

  return (
    <>
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded shadow-md flex items-center gap-3">
        <span className="text-xs whitespace-nowrap">Zoom: {Math.round(zoomLevel * 100)}%</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="p-1 h-auto"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </Button>

          <Slider
            value={[zoomLevel * 100]}
            min={20}
            max={300}
            step={1}
            onValueChange={handleZoomSliderChange}
            className="w-24"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="p-1 h-auto"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </Button>

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
    </>
  );
};
