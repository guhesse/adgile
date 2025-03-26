import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, FolderPlus, ChevronDown, ChevronRight, Move } from 'lucide-react';
import { ColorGroup, ColorItem } from '@/components/editor/types/brand';

interface ColorSectionProps {
    colorGroups: ColorGroup[];
    renderFolderIcon: (iconType?: string) => React.ReactNode;
    toggleColorGroupOpen: (groupId: number) => void;
    handleAddColorGroup: () => void;
    handleAddColor: (groupId: number) => void;
    handleEditColorGroup: (group: ColorGroup) => void;
    handleDeleteColorGroup: (groupId: number) => void;
    handleEditColor: (groupId: number, color: ColorItem) => void;
    handleMoveItem: (type: 'color', item: ColorItem, sourceId: number) => void;
    handleDeleteColor: (groupId: number, colorId: number) => void;
    applyColorToSelectedElement: (color: string) => void;
    applyTextStyleToSelectedElement: (style: any) => void;
    // Drag and drop props
    dragTargetId: number | null;
    handleDragStart: (e: React.DragEvent, type: 'color' | 'textStyle', item: any, sourceGroupId: number) => void;
    handleDragOver: (e: React.DragEvent, targetId: number) => void;
    handleDragLeave: () => void;
    handleDrop: (e: React.DragEvent, targetGroupId: number) => void;
}

export const ColorSection = ({
    colorGroups,
    renderFolderIcon,
    toggleColorGroupOpen,
    handleAddColorGroup,
    handleAddColor,
    handleEditColorGroup,
    handleDeleteColorGroup,
    handleEditColor,
    handleMoveItem,
    handleDeleteColor,
    applyColorToSelectedElement,
    applyTextStyleToSelectedElement,
    dragTargetId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
}: ColorSectionProps) => {
    return (
        <div>
            <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={handleAddColorGroup}>
                    <FolderPlus className="h-4 w-4 mr-1" />
                    Add Group
                </Button>
            </div>

            {colorGroups.map((group) => (
                <div key={group.id} className="mb-4">
                    <div className="flex items-center justify-between mb-2 group">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => toggleColorGroupOpen(group.id)}
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
                                onClick={() => handleAddColor(group.id)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleEditColorGroup(group)}
                            >
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteColorGroup(group.id)}
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
                            {group.colors.length > 0 ? (
                                <div className="grid grid-cols-4 gap-3">
                                    {group.colors.map((color) => (
                                        <div
                                            key={color.id}
                                            className="flex flex-col items-center gap-1 group"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, 'color', color, group.id)}
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
                                                            handleEditColor(group.id, color);
                                                        }}
                                                        className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                                    >
                                                        <Edit className="h-3 w-3 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMoveItem('color', color, group.id);
                                                        }}
                                                        className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                                    >
                                                        <Move className="h-3 w-3 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteColor(group.id, color.id);
                                                        }}
                                                        className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-600">{color.name}</span>
                                            {color.textStyle && (
                                                <div
                                                    className="text-xs truncate w-full text-center"
                                                    style={{
                                                        fontFamily: color.textStyle.style.fontFamily,
                                                        fontWeight: color.textStyle.style.fontWeight,
                                                        fontSize: '10px',
                                                        color: color.textStyle.style.color,
                                                    }}
                                                    onClick={() => applyTextStyleToSelectedElement(color.textStyle?.style)}
                                                >
                                                    Aa
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-dashed rounded-md p-4 text-center text-sm text-gray-500">
                                    Drag and drop colors here or{" "}
                                    <button
                                        className="text-purple-600 underline"
                                        onClick={() => handleAddColor(group.id)}
                                    >
                                        add color
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="mt-4">
                <div className="text-sm font-medium mb-2">Ungrouped</div>
                <div className="grid grid-cols-6 gap-2">
                    <div className="w-8 h-8 rounded-md bg-yellow-500 cursor-pointer hover:ring-2 hover:ring-purple-400"
                        onClick={() => applyColorToSelectedElement('#F8B64C')}
                    />
                    <div className="w-8 h-8 rounded-md bg-red-500 cursor-pointer hover:ring-2 hover:ring-purple-400"
                        onClick={() => applyColorToSelectedElement('#EF4444')}
                    />
                    <div className="w-8 h-8 rounded-md bg-green-500 cursor-pointer hover:ring-2 hover:ring-purple-400"
                        onClick={() => applyColorToSelectedElement('#10B981')}
                    />
                </div>
            </div>
        </div>
    );
};
