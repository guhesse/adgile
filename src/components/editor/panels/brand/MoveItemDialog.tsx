
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BrandGroup } from '@/components/editor/types/brand';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceGroupId: number | null;
  targetGroupId: number | null;
  setTargetGroupId: (id: number | null) => void;
  groups: { id: number; name: string; icon?: string; isOpen?: boolean; items: any[] }[]; // Simplified
  onMove: () => void;
  renderFolderIcon: (iconType?: string) => string; // Changed to return string
}

export const MoveItemDialog = ({
  open,
  onOpenChange,
  sourceGroupId,
  targetGroupId,
  setTargetGroupId,
  groups,
  onMove,
  renderFolderIcon
}: MoveItemDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Item to Group</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="text-sm font-medium mb-2">Select Destination Group:</div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
            {groups.map(group => (
              <div
                key={group.id}
                className={`p-2 border rounded-md cursor-pointer flex items-center
                           ${targetGroupId === group.id ? 'bg-purple-50 border-purple-200' : 'hover:bg-gray-50'}`}
                onClick={() => setTargetGroupId(group.id)}
              >
                <div className="mr-2">
                  {renderFolderIcon(group.icon)}
                </div>
                <span>{group.name}</span>
                {sourceGroupId === group.id && (
                  <span className="ml-2 text-xs text-gray-500">(Current)</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onMove} 
            disabled={targetGroupId === null || targetGroupId === sourceGroupId}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
