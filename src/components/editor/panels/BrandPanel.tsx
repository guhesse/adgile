
import React, { useState } from 'react';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvas } from '../CanvasContext';
import { EditorElement } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BrandPanelProps {
  selectedElement: EditorElement | null;
  updateElementStyle: (property: string, value: any) => void;
}

interface ColorItem {
  id: number;
  name: string;
  color: string;
}

interface TextStyle {
  id: number;
  name: string;
  style: {
    fontSize: number;
    fontWeight: string;
    color: string;
    fontFamily: string;
    lineHeight?: number;
    letterSpacing?: number;
  };
}

export const BrandPanel = ({ selectedElement, updateElementStyle }: BrandPanelProps) => {
  const [colors, setColors] = useState<ColorItem[]>([
    { id: 1, name: 'Primary', color: '#9b87f5' },
    { id: 2, name: 'Secondary', color: '#7E69AB' },
    { id: 3, name: 'Tertiary', color: '#6E59A5' },
    { id: 4, name: 'Dark', color: '#1A1F2C' },
    { id: 5, name: 'Light', color: '#D6BCFA' },
  ]);

  const [textStyles, setTextStyles] = useState<TextStyle[]>([
    { id: 1, name: 'Heading 1', style: { fontSize: 24, fontWeight: 'bold', color: '#1A1F2C', fontFamily: 'Inter', lineHeight: 1.2 } },
    { id: 2, name: 'Heading 2', style: { fontSize: 20, fontWeight: 'bold', color: '#1A1F2C', fontFamily: 'Inter', lineHeight: 1.3 } },
    { id: 3, name: 'Body', style: { fontSize: 16, fontWeight: 'normal', color: '#1A1F2C', fontFamily: 'Inter', lineHeight: 1.5 } },
    { id: 4, name: 'Caption', style: { fontSize: 12, fontWeight: 'normal', color: '#7E69AB', fontFamily: 'Inter', lineHeight: 1.4 } },
  ]);

  // Dialogs state
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [isTextStyleDialogOpen, setIsTextStyleDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [editingTextStyle, setEditingTextStyle] = useState<TextStyle | null>(null);
  const [newColor, setNewColor] = useState({ name: '', color: '#000000' });
  const [newTextStyle, setNewTextStyle] = useState<TextStyle>({
    id: 0,
    name: '',
    style: {
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      fontFamily: 'Inter',
      lineHeight: 1.5,
      letterSpacing: 0
    }
  });

  const availableFonts = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Geist', label: 'Geist' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Tahoma', label: 'Tahoma' }
  ];

  // Apply color to selected element
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

  // Apply text style to selected element
  const applyTextStyleToSelectedElement = (style: any) => {
    if (!selectedElement || selectedElement.type !== 'text') return;

    // Apply all style properties to the text element
    Object.entries(style).forEach(([key, value]) => {
      updateElementStyle(key, value);
    });
  };

  // Add a new color
  const handleAddColor = () => {
    setEditingColor(null);
    setNewColor({ name: '', color: '#000000' });
    setIsColorDialogOpen(true);
  };

  // Edit an existing color
  const handleEditColor = (color: ColorItem) => {
    setEditingColor(color);
    setNewColor({ name: color.name, color: color.color });
    setIsColorDialogOpen(true);
  };

  // Delete a color
  const handleDeleteColor = (id: number) => {
    setColors(colors.filter(color => color.id !== id));
  };

  // Save color from dialog
  const handleSaveColor = () => {
    if (editingColor) {
      // Update existing color
      setColors(colors.map(c => 
        c.id === editingColor.id 
          ? { ...c, name: newColor.name, color: newColor.color } 
          : c
      ));
    } else {
      // Add new color
      const newId = Math.max(0, ...colors.map(c => c.id)) + 1;
      setColors([...colors, { id: newId, name: newColor.name, color: newColor.color }]);
    }
    setIsColorDialogOpen(false);
  };

  // Add a new text style
  const handleAddTextStyle = () => {
    setEditingTextStyle(null);
    setNewTextStyle({
      id: 0,
      name: '',
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        fontFamily: 'Inter',
        lineHeight: 1.5,
        letterSpacing: 0
      }
    });
    setIsTextStyleDialogOpen(true);
  };

  // Edit an existing text style
  const handleEditTextStyle = (style: TextStyle) => {
    setEditingTextStyle(style);
    setNewTextStyle({
      ...style,
      style: { ...style.style }
    });
    setIsTextStyleDialogOpen(true);
  };

  // Delete a text style
  const handleDeleteTextStyle = (id: number) => {
    setTextStyles(textStyles.filter(style => style.id !== id));
  };

  // Save text style from dialog
  const handleSaveTextStyle = () => {
    if (editingTextStyle) {
      // Update existing text style
      setTextStyles(textStyles.map(s => 
        s.id === editingTextStyle.id 
          ? { ...s, name: newTextStyle.name, style: newTextStyle.style } 
          : s
      ));
    } else {
      // Add new text style
      const newId = Math.max(0, ...textStyles.map(s => s.id)) + 1;
      setTextStyles([...textStyles, { id: newId, name: newTextStyle.name, style: newTextStyle.style }]);
    }
    setIsTextStyleDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">Brand</div>
      </div>

      {/* Brand content */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible className="w-full">
          {/* Colors section */}
          <AccordionItem value="colors">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium">
              Colors
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={handleAddColor}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Color
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <div 
                    key={color.id} 
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-12 h-12 rounded-md border border-gray-200 cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all relative group-hover:opacity-80"
                      style={{ backgroundColor: color.color }}
                      onClick={() => applyColorToSelectedElement(color.color)}
                    >
                      <div className="absolute -top-2 -right-2 hidden group-hover:flex space-x-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditColor(color);
                          }}
                          className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        >
                          <Edit className="h-3 w-3 text-gray-600" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteColor(color.id);
                          }}
                          className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        >
                          <Trash2 className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">{color.name}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Styles section */}
          <AccordionItem value="textStyles">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium">
              Text Styles
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={handleAddTextStyle}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Text Style
                </Button>
              </div>
              <div className="space-y-2">
                {textStyles.map((style) => (
                  <div
                    key={style.id}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer group"
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
                    <div className="hidden group-hover:flex space-x-1">
                      <Button
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTextStyle(style);
                        }}
                      >
                        <Edit className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTextStyle(style.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Color Dialog */}
      <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingColor ? 'Edit Color' : 'Add New Color'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colorName" className="text-right">
                Name
              </Label>
              <Input
                id="colorName"
                value={newColor.name}
                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Primary, Background, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colorValue" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="color"
                  id="colorValue"
                  value={newColor.color}
                  onChange={(e) => setNewColor({ ...newColor, color: e.target.value })}
                  className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                />
                <Input
                  value={newColor.color}
                  onChange={(e) => setNewColor({ ...newColor, color: e.target.value })}
                  className="flex-1"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsColorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveColor} disabled={!newColor.name.trim()}>
              {editingColor ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Style Dialog */}
      <Dialog open={isTextStyleDialogOpen} onOpenChange={setIsTextStyleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTextStyle ? 'Edit Text Style' : 'Add New Text Style'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="styleName" className="text-right">
                Name
              </Label>
              <Input
                id="styleName"
                value={newTextStyle.name}
                onChange={(e) => setNewTextStyle({ ...newTextStyle, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Heading, Subtitle, etc."
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fontFamily" className="text-right">
                Font
              </Label>
              <select
                id="fontFamily"
                value={newTextStyle.style.fontFamily}
                onChange={(e) => setNewTextStyle({
                  ...newTextStyle,
                  style: {
                    ...newTextStyle.style,
                    fontFamily: e.target.value
                  }
                })}
                className="col-span-3 p-2 border rounded-md"
              >
                {availableFonts.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fontSize" className="text-right">
                Size
              </Label>
              <Input
                id="fontSize"
                type="number"
                value={newTextStyle.style.fontSize}
                onChange={(e) => setNewTextStyle({
                  ...newTextStyle,
                  style: {
                    ...newTextStyle.style,
                    fontSize: parseInt(e.target.value) || 16
                  }
                })}
                className="col-span-3"
                min="8"
                max="72"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fontWeight" className="text-right">
                Weight
              </Label>
              <select
                id="fontWeight"
                value={newTextStyle.style.fontWeight}
                onChange={(e) => setNewTextStyle({
                  ...newTextStyle,
                  style: {
                    ...newTextStyle.style,
                    fontWeight: e.target.value
                  }
                })}
                className="col-span-3 p-2 border rounded-md"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lineHeight" className="text-right">
                Line Height
              </Label>
              <Input
                id="lineHeight"
                type="number"
                value={newTextStyle.style.lineHeight}
                onChange={(e) => setNewTextStyle({
                  ...newTextStyle,
                  style: {
                    ...newTextStyle.style,
                    lineHeight: parseFloat(e.target.value) || 1.5
                  }
                })}
                className="col-span-3"
                min="0.8"
                max="3"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="letterSpacing" className="text-right">
                Letter Spacing
              </Label>
              <Input
                id="letterSpacing"
                type="number"
                value={newTextStyle.style.letterSpacing}
                onChange={(e) => setNewTextStyle({
                  ...newTextStyle,
                  style: {
                    ...newTextStyle.style,
                    letterSpacing: parseFloat(e.target.value) || 0
                  }
                })}
                className="col-span-3"
                min="-0.5"
                max="2"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="textColor" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <input
                  type="color"
                  id="textColor"
                  value={newTextStyle.style.color}
                  onChange={(e) => setNewTextStyle({
                    ...newTextStyle,
                    style: {
                      ...newTextStyle.style,
                      color: e.target.value
                    }
                  })}
                  className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                />
                <Input
                  value={newTextStyle.style.color}
                  onChange={(e) => setNewTextStyle({
                    ...newTextStyle,
                    style: {
                      ...newTextStyle.style,
                      color: e.target.value
                    }
                  })}
                  className="flex-1"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>

            <div className="col-span-4 mt-2">
              <div className="p-3 border rounded-md">
                <div className="text-sm font-medium mb-1">Preview:</div>
                <div
                  style={{
                    fontSize: `${newTextStyle.style.fontSize}px`,
                    fontWeight: newTextStyle.style.fontWeight,
                    color: newTextStyle.style.color,
                    fontFamily: newTextStyle.style.fontFamily,
                    lineHeight: newTextStyle.style.lineHeight,
                    letterSpacing: `${newTextStyle.style.letterSpacing}px`
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTextStyleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTextStyle} disabled={!newTextStyle.name.trim()}>
              {editingTextStyle ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
