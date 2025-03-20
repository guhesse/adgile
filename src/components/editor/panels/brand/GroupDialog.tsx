import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder } from 'lucide-react';

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: { id: number; name: string; icon?: string } | null;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  onSave: () => void;
}

export const GroupDialog = ({
  open,
  onOpenChange,
  editingGroup,
  newGroupName,
  setNewGroupName,
  onSave,
}: GroupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="groupName" className="text-right">
              Name
            </Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Brand Elements, UI, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!newGroupName.trim()}>
            {editingGroup ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
