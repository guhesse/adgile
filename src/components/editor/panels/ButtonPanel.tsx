
import { EditorElement } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ButtonPanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
}

export const ButtonPanel = ({ element, updateElementStyle, updateElementContent }: ButtonPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Button Text</h3>
        <input
          type="text"
          value={element.content}
          onChange={(e) => updateElementContent(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Styles</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Background Color</label>
            <div className="flex mt-1">
              <input
                type="color"
                value={element.style.backgroundColor || "#000000"}
                onChange={(e) => updateElementStyle("backgroundColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={element.style.backgroundColor || "#000000"}
                onChange={(e) => updateElementStyle("backgroundColor", e.target.value)}
                className="flex-1 px-3 py-2 border rounded ml-2"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Text Color</label>
            <div className="flex mt-1">
              <input
                type="color"
                value={element.style.color}
                onChange={(e) => updateElementStyle("color", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={element.style.color}
                onChange={(e) => updateElementStyle("color", e.target.value)}
                className="flex-1 px-3 py-2 border rounded ml-2"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Padding</label>
            <input
              type="text"
              value={element.style.padding || "8px 16px"}
              onChange={(e) => updateElementStyle("padding", e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g. 8px 16px"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Font Size</label>
            <input
              type="number"
              value={element.style.fontSize}
              onChange={(e) => updateElementStyle("fontSize", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="8"
              max="36"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-500">Font</label>
            <Select
              value={element.style.fontFamily}
              onValueChange={(value) => updateElementStyle("fontFamily", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Link</h3>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded"
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};
