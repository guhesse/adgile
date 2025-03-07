import { Button } from "@/components/ui/button";
import { EditorElement } from "../types";

interface ImagePanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const ImagePanel = ({ element, updateElementStyle, updateElementContent, activeTab }: ImagePanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Image</h3>
        <div className="border rounded p-2 flex flex-col items-center justify-center">
          <div className="h-36 w-full bg-gray-100 rounded flex items-center justify-center mb-2">
            {element.content ? (
              <img 
                src={element.content} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex space-x-2 w-full">
            <Button variant="outline" className="flex-1 text-xs">Upload</Button>
            <Button variant="outline" className="flex-1 text-xs">Gallery</Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={element.style.width}
              onChange={(e) => updateElementStyle("width", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="10"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={element.style.height}
              onChange={(e) => updateElementStyle("height", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="10"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Alt Text</h3>
        <input
          type="text"
          value={element.content || ""}
          onChange={(e) => updateElementContent(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Image description for accessibility"
        />
      </div>
    </div>
  );
};
