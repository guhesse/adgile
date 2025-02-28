
import { EditorElement, ANIMATION_PRESETS } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnimationPanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
}

export const AnimationPanel = ({ element, updateElementStyle }: AnimationPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Animation</h3>
        <Select
          value={element.style.animation}
          onValueChange={(value) => updateElementStyle("animation", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {ANIMATION_PRESETS.map((preset) => (
              <SelectItem key={preset.name} value={preset.value}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2 space-y-2">
          <div>
            <label className="text-xs text-gray-500">Duration (s)</label>
            <input
              type="number"
              value={element.style.animationDuration || 1}
              onChange={(e) => updateElementStyle("animationDuration", parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="0.1"
              max="10"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Delay (s)</label>
            <input
              type="number"
              value={element.style.animationDelay || 0}
              onChange={(e) => updateElementStyle("animationDelay", parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
