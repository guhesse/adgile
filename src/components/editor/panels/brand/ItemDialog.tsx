
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandItem, TextStyle } from '@/components/editor/types/brand';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: BrandItem | null;
  onSave: (item: { 
    type: 'color' | 'textStyle',
    name: string, 
    color?: string,
    textStyle?: TextStyle
  }) => void;
  availableFonts: { value: string; label: string }[];
}

export const ItemDialog = ({
  open,
  onOpenChange,
  editingItem,
  onSave,
  availableFonts
}: ItemDialogProps) => {
  // Item defaults
  const [itemType, setItemType] = useState<'color' | 'textStyle'>(editingItem?.type || 'color');
  const [itemName, setItemName] = useState(editingItem?.name || '');
  const [colorValue, setColorValue] = useState(editingItem?.color || '#000000');
  
  // Create a proper TextStyle object for the default
  const defaultTextStyle: TextStyle = {
    fontFamily: editingItem?.textStyle?.fontFamily || 'Inter',
    fontSize: editingItem?.textStyle?.fontSize || 16,
    fontWeight: editingItem?.textStyle?.fontWeight || 'normal',
    lineHeight: editingItem?.textStyle?.lineHeight || 1.5,
    letterSpacing: editingItem?.textStyle?.letterSpacing || 0,
    color: editingItem?.textStyle?.color || '#000000',
    id: editingItem?.textStyle?.id || 0,
    name: editingItem?.textStyle?.name || '',
    style: editingItem?.textStyle?.style || {
      fontSize: 16,
      fontWeight: 'normal',
      fontFamily: 'Inter',
      lineHeight: 1.5,
      letterSpacing: 0,
      color: '#000000'
    }
  };
  
  const [textStyle, setTextStyle] = useState<TextStyle>(defaultTextStyle);

  const handleSubmit = () => {
    if (itemType === 'color') {
      onSave({
        type: 'color',
        name: itemName,
        color: colorValue
      });
    } else {
      onSave({
        type: 'textStyle',
        name: itemName,
        textStyle: textStyle
      });
    }
  };

  React.useEffect(() => {
    if (editingItem) {
      setItemType(editingItem.type);
      setItemName(editingItem.name);
      setColorValue(editingItem.color || '#000000');
      if (editingItem.textStyle) {
        setTextStyle(editingItem.textStyle);
      }
    } else {
      // Defaults for new item
      setItemType('color');
      setItemName('');
      setColorValue('#000000');
      setTextStyle(defaultTextStyle);
    }
  }, [editingItem, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={itemType} onValueChange={(v) => setItemType(v as 'color' | 'textStyle')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="color">Color</TabsTrigger>
            <TabsTrigger value="textStyle">Text Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="color" className="space-y-4 mt-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName" className="text-right">
                Name
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
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
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                />
                <Input
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="flex-1"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="textStyle" className="space-y-4 mt-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="styleName" className="text-right">
                Name
              </Label>
              <Input
                id="styleName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
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
                value={textStyle.style.fontFamily}
                onChange={(e) => setTextStyle({
                  ...textStyle,
                  style: {
                    ...textStyle.style,
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
                value={textStyle.style.fontSize}
                onChange={(e) => setTextStyle({
                  ...textStyle,
                  style: {
                    ...textStyle.style,
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
                value={textStyle.style.fontWeight}
                onChange={(e) => setTextStyle({
                  ...textStyle,
                  style: {
                    ...textStyle.style,
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
                value={textStyle.style.lineHeight}
                onChange={(e) => setTextStyle({
                  ...textStyle,
                  style: {
                    ...textStyle.style,
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
                value={textStyle.style.letterSpacing}
                onChange={(e) => setTextStyle({
                  ...textStyle,
                  style: {
                    ...textStyle.style,
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
                  value={textStyle.style.color || '#000000'}
                  onChange={(e) => setTextStyle({
                    ...textStyle,
                    style: {
                      ...textStyle.style,
                      color: e.target.value
                    }
                  })}
                  className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                />
                <Input
                  value={textStyle.style.color || '#000000'}
                  onChange={(e) => setTextStyle({
                    ...textStyle,
                    style: {
                      ...textStyle.style,
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
                    fontSize: `${textStyle.style.fontSize}px`,
                    fontWeight: textStyle.style.fontWeight,
                    color: textStyle.style.color,
                    fontFamily: textStyle.style.fontFamily,
                    lineHeight: textStyle.style.lineHeight,
                    letterSpacing: `${textStyle.style.letterSpacing}px`
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!itemName.trim()}>
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
