
// Create a minimal ImagePanel component to fix the build error
import React from "react";
import { EditorElement } from "../types";

interface ImagePanelProps {
  selectedElement: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ 
  selectedElement, 
  updateElementStyle 
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Image Properties</h3>
      {/* Basic image settings */}
      <div className="space-y-4">
        {/* We'll implement a basic image panel later */}
        <p className="text-xs text-gray-500">Select an image to edit its properties.</p>
      </div>
    </div>
  );
};

export default ImagePanel;
