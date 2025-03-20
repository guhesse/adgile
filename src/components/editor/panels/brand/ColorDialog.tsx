import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorItem } from '@/components/editor/types/brand';

interface ColorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingColor: ColorItem | null;
    newColor: { name: string; color: string };
    setNewColor: (color: { name: string; color: string }) => void;
    onSave: () => void;
}

export const ColorDialog = ({
    open,
    onOpenChange,
    editingColor,
    newColor,
    setNewColor,
    onSave,
}: ColorDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Include Text Style
                        </Label>
                        <div className="col-span-3">
                            <input
                                type="checkbox"
                                className="mr-2"
                            // This would be connected to state in a full implementation
                            />
                            <span className="text-sm">Add text style to this color</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={!newColor.name.trim()}>
                        {editingColor ? 'Update' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
