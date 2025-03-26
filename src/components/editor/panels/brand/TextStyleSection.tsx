import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, FolderPlus, ChevronDown, ChevronRight, Move } from 'lucide-react';
import { TextStyleGroup, TextStyle } from '@/components/editor/types/brand';

interface TextStyleSectionProps {
  textStyleGroups: TextStyleGroup[];
  renderFolderIcon: (iconType?: string) => React.ReactNode;
  toggleTextStyleGroupOpen: (groupId: number) => void;
  handleAddTextStyleGroup: () => void;
  handleAddTextStyle: (groupId: number) => void;
  handleEditTextStyleGroup: (group: TextStyleGroup) => void;
  handleDeleteTextStyleGroup: (groupId: number) => void;
  handleEditTextStyle: (groupId: number, style: TextStyle) => void;
  handleMoveItem: (type: 'textStyle', item: TextStyle, sourceId: number) => void;
  handleDeleteTextStyle: (groupId: number, styleId: number) => void;
  applyTextStyleToSelectedElement: (style: any) => void;
  // Drag and drop props
  dragTargetId: number | null;
  handleDragStart: (e: React.DragEvent, type: 'color' | 'textStyle', item: any, sourceGroupId: number) => void;
  handleDragOver: (e: React.DragEvent, targetId: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetGroupId: number) => void;
}

export const TextStyleSection = ({
  textStyleGroups,
  renderFolderIcon,
  toggleTextStyleGroupOpen,
  handleAddTextStyleGroup,
  handleAddTextStyle,
  handleEditTextStyleGroup,
  handleDeleteTextStyleGroup,
  handleEditTextStyle,
  handleMoveItem,
  handleDeleteTextStyle,
  applyTextStyleToSelectedElement,
  dragTargetId,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop
}: TextStyleSectionProps) => {
  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={handleAddTextStyleGroup}>
          <FolderPlus className="h-4 w-4 mr-1" />
          Add Group
        </Button>
      </div>

      {textStyleGroups.map((group) => (
        <div key={group.id} className="mb-4">
          <div className="flex items-center justify-between mb-2 group">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => toggleTextStyleGroupOpen(group.id)}
            >
              {group.isOpen ? 
                <ChevronDown className="h-4 w-4 mr-1" /> : 
                <ChevronRight className="h-4 w-4 mr-1" />
              }
              <div className="flex items-center">
                {renderFolderIcon(group.icon)}
                <span className="text-sm font-medium ml-1">{group.name}</span>
              </div>
            </div>
            <div className="hidden group-hover:flex items-center">
              <Button
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => handleAddTextStyle(group.id)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => handleEditTextStyleGroup(group)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => handleDeleteTextStyleGroup(group.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {group.isOpen && (
            <div 
              className={`pl-4 ${dragTargetId === group.id ? 'bg-blue-50 rounded-md p-2' : ''}`}
              onDragOver={(e) => handleDragOver(e, group.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, group.id)}
            >
              {group.styles.length > 0 ? (
                <div className="space-y-2">
                  {group.styles.map((style) => (
                    <div
                      key={style.id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer group"
                      onClick={() => applyTextStyleToSelectedElement(style.style)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'textStyle', style, group.id)}
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
                            handleEditTextStyle(group.id, style);
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
                            handleMoveItem('textStyle', style, group.id);
                          }}
                        >
                          <Move className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTextStyle(group.id, style.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-4 text-center text-sm text-gray-500">
                  Drag and drop text styles here or{" "}
                  <button 
                    className="text-purple-600 underline"
                    onClick={() => handleAddTextStyle(group.id)}
                  >
                    add text style
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
