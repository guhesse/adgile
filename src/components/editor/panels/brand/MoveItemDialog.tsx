import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Folder } from 'lucide-react';
import { BrandGroup } from '@/components/editor/types/brand';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceGroupId: number | null;
  targetGroupId: number | null;
  setTargetGroupId: (id: number) => void;
  groups: BrandGroup[];
  onMove: () => void;
  renderFolderIcon: (iconType?: string) => React.ReactNode;
}

export const MoveItemDialog = ({
  open,
  onOpenChange,
  sourceGroupId,
  targetGroupId,
  setTargetGroupId,
  groups,
  onMove,
  renderFolderIcon,
}: MoveItemDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Label className="text-sm font-medium block mb-2">
              Select destination group:
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
              {groups.map((group) => (
                <div 
                  key={group.id}
                  className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 flex items-center ${targetGroupId === group.id ? 'bg-purple-100' : ''}`}
                  onClick={() => setTargetGroupId(group.id)}
                >
                  {renderFolderIcon(group.icon)}
                  <span className="ml-2">{group.name}</span>
                  {sourceGroupId === group.id && (
                    <span className="ml-2 text-xs text-gray-500">(Current)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onMove} 
            disabled={!targetGroupId || targetGroupId === sourceGroupId}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
