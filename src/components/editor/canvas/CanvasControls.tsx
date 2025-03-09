
import { useState, useEffect } from "react";
import { EditingMode } from "../types";

interface CanvasControlsProps {
  zoomLevel: number;
  setZoomLevel: (zoomLevel: number) => void;
  editingMode: EditingMode;
  setEditingMode: (mode: EditingMode) => void;
}

export const CanvasControls = ({ 
  zoomLevel, 
  setZoomLevel, 
  editingMode, 
  setEditingMode 
}: CanvasControlsProps) => {
  return (
    <>
      <div className="absolute bottom-14 right-4 bg-white px-3 py-1.5 rounded shadow-md">
        <div 
          className={`flex gap-1 text-xs items-center cursor-pointer ${editingMode === 'global' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setEditingMode('global')}
        >
          <div className={`w-3 h-3 rounded-full ${editingMode === 'global' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          Edição Global
        </div>
        <div 
          className={`flex gap-1 text-xs items-center cursor-pointer mt-1 ${editingMode === 'individual' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setEditingMode('individual')}
        >
          <div className={`w-3 h-3 rounded-full ${editingMode === 'individual' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          Edição Individual
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded shadow-md flex items-center gap-3">
        <span className="text-xs whitespace-nowrap">Zoom: {Math.round(zoomLevel * 100)}%</span>
        <input 
          type="range" 
          min="10" 
          max="500" 
          value={zoomLevel * 100} 
          onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
          className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </>
  );
};
