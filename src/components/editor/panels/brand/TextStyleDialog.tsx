import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextStyle } from '@/components/editor/types/brand';

interface TextStyleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTextStyle: TextStyle | null;
    newTextStyle: TextStyle;
    setNewTextStyle: (style: TextStyle) => void;
    onSave: () => void;
    availableFonts: { value: string; label: string }[];
}

export const TextStyleDialog = ({
    open,
    onOpenChange,
    editingTextStyle,
    newTextStyle,
    setNewTextStyle,
    onSave,
    availableFonts
}: TextStyleDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                value={newTextStyle.style.color || '#000000'}
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
                                value={newTextStyle.style.color || '#000000'}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={!newTextStyle.name.trim()}>
                        {editingTextStyle ? 'Update' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
