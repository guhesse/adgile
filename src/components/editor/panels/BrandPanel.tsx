
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvas } from '../CanvasContext';
import { EditorElement } from '../types';

interface BrandPanelProps {
  selectedElement: EditorElement | null;
  updateElementStyle: (property: string, value: any) => void;
}

export const BrandPanel = ({ selectedElement, updateElementStyle }: BrandPanelProps) => {
  const [colors, setColors] = useState([
    { id: 1, name: 'Primary', color: '#9b87f5' },
    { id: 2, name: 'Secondary', color: '#7E69AB' },
    { id: 3, name: 'Tertiary', color: '#6E59A5' },
    { id: 4, name: 'Dark', color: '#1A1F2C' },
    { id: 5, name: 'Light', color: '#D6BCFA' },
  ]);

  const [textStyles, setTextStyles] = useState([
    { id: 1, name: 'Heading 1', style: { fontSize: 24, fontWeight: 'bold', color: '#1A1F2C', fontFamily: 'Inter' } },
    { id: 2, name: 'Heading 2', style: { fontSize: 20, fontWeight: 'bold', color: '#1A1F2C', fontFamily: 'Inter' } },
    { id: 3, name: 'Body', style: { fontSize: 16, fontWeight: 'normal', color: '#1A1F2C', fontFamily: 'Inter' } },
    { id: 4, name: 'Caption', style: { fontSize: 12, fontWeight: 'normal', color: '#7E69AB', fontFamily: 'Inter' } },
  ]);

  const applyColorToSelectedElement = (color: string) => {
    if (!selectedElement) return;

    // Determine which property to update based on element type
    if (selectedElement.type === 'text') {
      updateElementStyle('color', color);
    } else if (selectedElement.type === 'button') {
      updateElementStyle('backgroundColor', color);
    } else if (selectedElement.type === 'container' || selectedElement.type === 'layout') {
      updateElementStyle('backgroundColor', color);
    }
  };

  const applyTextStyleToSelectedElement = (style: any) => {
    if (!selectedElement || selectedElement.type !== 'text') return;

    // Apply all style properties to the text element
    Object.entries(style).forEach(([key, value]) => {
      updateElementStyle(key, value);
    });
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">Brand</div>
      </div>

      {/* Brand content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Colors section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Colors</h3>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <div 
                key={color.id} 
                className="flex flex-col items-center gap-1"
                onClick={() => applyColorToSelectedElement(color.color)}
              >
                <div
                  className="w-10 h-10 rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: color.color }}
                ></div>
                <span className="text-xs text-gray-600">{color.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Text Styles section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Text Styles</h3>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {textStyles.map((style) => (
              <div
                key={style.id}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => applyTextStyleToSelectedElement(style.style)}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{style.name}</div>
                  <div
                    className="text-xs truncate"
                    style={{
                      fontSize: `${style.style.fontSize / 2}px`,
                      fontWeight: style.style.fontWeight,
                      color: style.style.color,
                      fontFamily: style.style.fontFamily,
                    }}
                  >
                    {style.name} Example Text
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
