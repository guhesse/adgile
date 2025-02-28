
import { useState } from "react";
import { EditorElement } from "./types";
import { TextPanel } from "./panels/TextPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { ButtonPanel } from "./panels/ButtonPanel";
import { AnimationPanel } from "./panels/AnimationPanel";

interface PropertyPanelProps {
  selectedElement: EditorElement | null;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
}

export const PropertyPanel = ({ selectedElement, updateElementStyle, updateElementContent }: PropertyPanelProps) => {
  const [activeTab, setActiveTab] = useState("text");

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select an element to edit its properties
      </div>
    );
  }

  return (
    <div>
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'text' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('text')}
        >
          Content
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'styles' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('styles')}
        >
          Style
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'animation' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('animation')}
        >
          Animation
        </button>
      </div>
      
      <div className="p-4">
        {activeTab === 'text' && (
          selectedElement.type === 'text' ? (
            <TextPanel 
              element={selectedElement} 
              updateElementStyle={updateElementStyle} 
              updateElementContent={updateElementContent} 
            />
          ) : selectedElement.type === 'image' ? (
            <ImagePanel 
              element={selectedElement} 
              updateElementStyle={updateElementStyle} 
              updateElementContent={updateElementContent} 
            />
          ) : selectedElement.type === 'button' ? (
            <ButtonPanel 
              element={selectedElement} 
              updateElementStyle={updateElementStyle} 
              updateElementContent={updateElementContent} 
            />
          ) : null
        )}
        
        {activeTab === 'styles' && (
          selectedElement.type === 'text' ? (
            <TextPanel 
              element={selectedElement} 
              updateElementStyle={updateElementStyle} 
              updateElementContent={updateElementContent} 
            />
          ) : selectedElement.type === 'image' ? (
            <ImagePanel 
              element={selectedElement} 
              updateElementStyle={updateElementStyle} 
              updateElementContent={updateElementContent} 
            />
          ) : selectedElement.type === 'button' ? (
            <ButtonPanel 
              element={selectedElement} 
              updateElementStyle={updateElementStyle} 
              updateElementContent={updateElementContent} 
            />
          ) : null
        )}
        
        {activeTab === 'animation' && (
          <AnimationPanel element={selectedElement} updateElementStyle={updateElementStyle} />
        )}
      </div>
    </div>
  );
};
