
import { EditorElement } from "./types";

interface LayersPanelProps {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  setSelectedElement: (element: EditorElement) => void;
  removeElement: (elementId: string) => void;
}

export const LayersPanel = ({ elements, selectedElement, setSelectedElement, removeElement }: LayersPanelProps) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-2">Camadas</h3>
      <div className="space-y-1">
        {elements.map((element) => (
          <div 
            key={element.id}
            className={`px-3 py-2 text-sm rounded flex items-center justify-between ${selectedElement?.id === element.id ? 'bg-purple-100' : 'hover:bg-gray-50'}`}
            onClick={() => setSelectedElement(element)}
          >
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2 inline-block">
                {element.type === 'text' ? 'T' : 
                 element.type === 'image' ? 'I' :
                 element.type === 'button' ? 'B' : ''}
              </span>
              <span className="truncate">{element.content || element.type}</span>
            </div>
            <div className="flex items-center">
              <button 
                className="text-gray-400 hover:text-gray-600 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  removeElement(element.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
