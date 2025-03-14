
import React, { useState } from 'react';
import { Plus, Trash2, Edit, FolderPlus, ChevronDown, ChevronRight, MoreHorizontal, Move, Folder, FolderOpen } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BrandPanelProps {
  selectedElement: EditorElement | null;
  updateElementStyle: (property: string, value: any) => void;
}

interface ColorGroup {
  id: number;
  name: string;
  colors: ColorItem[];
  isOpen?: boolean;
  icon?: string;
}

interface ColorItem {
  id: number;
  name: string;
  color: string;
  textStyle?: TextStyle;
}

interface TextStyleGroup {
  id: number;
  name: string;
  styles: TextStyle[];
  isOpen?: boolean;
  icon?: string;
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

// Folder icons options
const folderIcons = [
  { name: "Default Folder", icon: <Folder className="h-4 w-4" /> },
  { name: "Open Folder", icon: <FolderOpen className="h-4 w-4" /> },
  { name: "Colors", icon: <Folder className="h-4 w-4 text-purple-500" /> },
  { name: "Typography", icon: <Folder className="h-4 w-4 text-blue-500" /> },
  { name: "Branding", icon: <Folder className="h-4 w-4 text-green-500" /> },
];

export const BrandPanel = ({ selectedElement, updateElementStyle }: BrandPanelProps) => {
  // Color groups
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([
    { 
      id: 1, 
      name: 'Brand Colors', 
      isOpen: true,
      icon: 'default',
      colors: [
        { id: 1, name: 'Primary', color: '#9b87f5' },
        { id: 2, name: 'Secondary', color: '#7E69AB' },
        { id: 3, name: 'Tertiary', color: '#6E59A5' },
      ] 
    },
    { 
      id: 2, 
      name: 'UI Colors', 
      isOpen: true,
      icon: 'default',
      colors: [
        { id: 4, name: 'Dark', color: '#1A1F2C' },
        { id: 5, name: 'Light', color: '#D6BCFA' },
      ] 
    },
    { 
      id: 3, 
      name: 'Typography Styles', 
      isOpen: true,
      icon: 'typography',
      colors: [
        { 
          id: 6, 
          name: 'Heading 1', 
          color: '#1A1F2C',
          textStyle: {
            id: 1,
            name: 'Heading 1',
            style: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1A1F2C',
              fontFamily: 'Inter',
              lineHeight: 1.2,
              letterSpacing: 0
            }
          }
        },
        { 
          id: 7, 
          name: 'Body Text', 
          color: '#222222',
          textStyle: {
            id: 2,
            name: 'Body Text',
            style: {
              fontSize: 16,
              fontWeight: 'normal',
              color: '#222222',
              fontFamily: 'Roboto',
              lineHeight: 1.5,
              letterSpacing: 0
            }
          }
        },
      ] 
    },
    { 
      id: 4, 
      name: 'Empty Group', 
      isOpen: true,
      icon: 'default',
      colors: [] 
    },
  ]);

  // Text style groups
  const [textStyleGroups, setTextStyleGroups] = useState<TextStyleGroup[]>([
    {
      id: 1,
      name: 'Headings',
      isOpen: true,
      icon: 'default',
      styles: [
        { id: 1, name: 'Heading 1', style: { fontSize: 24, fontWeight: 'bold', color: '#1A1F2C', fontFamily: 'Inter', lineHeight: 1.2 } },
        { id: 2, name: 'Heading 2', style: { fontSize: 20, fontWeight: 'bold', color: '#1A1F2C', fontFamily: 'Inter', lineHeight: 1.3 } },
      ]
    },
    {
      id: 2,
      name: 'Body Text',
      isOpen: true,
      icon: 'default',
      styles: [
        { id: 3, name: 'Body', style: { fontSize: 16, fontWeight: 'normal', color: '#1A1F2C', fontFamily: 'Inter', lineHeight: 1.5 } },
        { id: 4, name: 'Caption', style: { fontSize: 12, fontWeight: 'normal', color: '#7E69AB', fontFamily: 'Inter', lineHeight: 1.4 } },
      ]
    },
    {
      id: 3,
      name: 'Empty Group',
      isOpen: true,
      icon: 'default',
      styles: []
    }
  ]);

  // Dialog states
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [isTextStyleDialogOpen, setIsTextStyleDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorItem | null>(null);
  const [editingTextStyle, setEditingTextStyle] = useState<TextStyle | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
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

  // Group dialog states
  const [isColorGroupDialogOpen, setIsColorGroupDialogOpen] = useState(false);
  const [isTextStyleGroupDialogOpen, setIsTextStyleGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('default');
  const [editingColorGroup, setEditingColorGroup] = useState<ColorGroup | null>(null);
  const [editingTextStyleGroup, setEditingTextStyleGroup] = useState<TextStyleGroup | null>(null);

  // Move item dialog state
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [movingItemType, setMovingItemType] = useState<'color' | 'textStyle'>('color');
  const [movingItem, setMovingItem] = useState<ColorItem | TextStyle | null>(null);
  const [sourceGroupId, setSourceGroupId] = useState<number | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

  const availableFonts = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Geist', label: 'Geist' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Tahoma', label: 'Tahoma' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Oswald', label: 'Oswald' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'PT Sans', label: 'PT Sans' },
    { value: 'Quicksand', label: 'Quicksand' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Work Sans', label: 'Work Sans' },
    { value: 'Fira Sans', label: 'Fira Sans' },
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

  // Color Management Functions
  const handleAddColor = (groupId: number) => {
    setEditingColor(null);
    setEditingGroupId(groupId);
    setNewColor({ name: '', color: '#000000' });
    setIsColorDialogOpen(true);
  };

  const handleEditColor = (groupId: number, color: ColorItem) => {
    setEditingColor(color);
    setEditingGroupId(groupId);
    setNewColor({ name: color.name, color: color.color });
    setIsColorDialogOpen(true);
  };

  const handleDeleteColor = (groupId: number, colorId: number) => {
    setColorGroups(colorGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          colors: group.colors.filter(color => color.id !== colorId)
        };
      }
      return group;
    }));
  };

  const handleSaveColor = () => {
    if (editingGroupId === null) return;

    setColorGroups(colorGroups.map(group => {
      if (group.id === editingGroupId) {
        if (editingColor) {
          // Update existing color
          return {
            ...group,
            colors: group.colors.map(c => 
              c.id === editingColor.id 
                ? { ...c, name: newColor.name, color: newColor.color } 
                : c
            )
          };
        } else {
          // Add new color
          const newId = Math.max(0, ...group.colors.map(c => c.id), 0) + 1;
          return {
            ...group,
            colors: [...group.colors, { id: newId, name: newColor.name, color: newColor.color }]
          };
        }
      }
      return group;
    }));
    setIsColorDialogOpen(false);
  };

  // Text Style Management Functions
  const handleAddTextStyle = (groupId: number) => {
    setEditingTextStyle(null);
    setEditingGroupId(groupId);
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

  const handleEditTextStyle = (groupId: number, style: TextStyle) => {
    setEditingTextStyle(style);
    setEditingGroupId(groupId);
    setNewTextStyle({
      ...style,
      style: { ...style.style }
    });
    setIsTextStyleDialogOpen(true);
  };

  const handleDeleteTextStyle = (groupId: number, styleId: number) => {
    setTextStyleGroups(textStyleGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          styles: group.styles.filter(style => style.id !== styleId)
        };
      }
      return group;
    }));
  };

  const handleSaveTextStyle = () => {
    if (editingGroupId === null) return;

    setTextStyleGroups(textStyleGroups.map(group => {
      if (group.id === editingGroupId) {
        if (editingTextStyle) {
          // Update existing text style
          return {
            ...group,
            styles: group.styles.map(s => 
              s.id === editingTextStyle.id 
                ? { ...s, name: newTextStyle.name, style: newTextStyle.style } 
                : s
            )
          };
        } else {
          // Add new text style
          const newId = Math.max(0, ...group.styles.map(s => s.id), 0) + 1;
          return {
            ...group,
            styles: [...group.styles, { id: newId, name: newTextStyle.name, style: newTextStyle.style }]
          };
        }
      }
      return group;
    }));
    setIsTextStyleDialogOpen(false);
  };

  // Group Management Functions
  const handleAddColorGroup = () => {
    setEditingColorGroup(null);
    setNewGroupName('');
    setNewGroupIcon('default');
    setIsColorGroupDialogOpen(true);
  };

  const handleEditColorGroup = (group: ColorGroup) => {
    setEditingColorGroup(group);
    setNewGroupName(group.name);
    setNewGroupIcon(group.icon || 'default');
    setIsColorGroupDialogOpen(true);
  };

  const handleDeleteColorGroup = (groupId: number) => {
    setColorGroups(colorGroups.filter(group => group.id !== groupId));
  };

  const handleSaveColorGroup = () => {
    if (editingColorGroup) {
      // Update existing group
      setColorGroups(colorGroups.map(g => 
        g.id === editingColorGroup.id 
          ? { ...g, name: newGroupName, icon: newGroupIcon } 
          : g
      ));
    } else {
      // Add new group
      const newId = Math.max(0, ...colorGroups.map(g => g.id), 0) + 1;
      setColorGroups([...colorGroups, { id: newId, name: newGroupName, colors: [], isOpen: true, icon: newGroupIcon }]);
    }
    setIsColorGroupDialogOpen(false);
  };

  const handleAddTextStyleGroup = () => {
    setEditingTextStyleGroup(null);
    setNewGroupName('');
    setNewGroupIcon('default');
    setIsTextStyleGroupDialogOpen(true);
  };

  const handleEditTextStyleGroup = (group: TextStyleGroup) => {
    setEditingTextStyleGroup(group);
    setNewGroupName(group.name);
    setNewGroupIcon(group.icon || 'default');
    setIsTextStyleGroupDialogOpen(true);
  };

  const handleDeleteTextStyleGroup = (groupId: number) => {
    setTextStyleGroups(textStyleGroups.filter(group => group.id !== groupId));
  };

  const handleSaveTextStyleGroup = () => {
    if (editingTextStyleGroup) {
      // Update existing group
      setTextStyleGroups(textStyleGroups.map(g => 
        g.id === editingTextStyleGroup.id 
          ? { ...g, name: newGroupName, icon: newGroupIcon } 
          : g
      ));
    } else {
      // Add new group
      const newId = Math.max(0, ...textStyleGroups.map(g => g.id), 0) + 1;
      setTextStyleGroups([...textStyleGroups, { id: newId, name: newGroupName, styles: [], isOpen: true, icon: newGroupIcon }]);
    }
    setIsTextStyleGroupDialogOpen(false);
  };

  // Toggle group open/closed state
  const toggleColorGroupOpen = (groupId: number) => {
    setColorGroups(colorGroups.map(group => 
      group.id === groupId ? { ...group, isOpen: !group.isOpen } : group
    ));
  };

  const toggleTextStyleGroupOpen = (groupId: number) => {
    setTextStyleGroups(textStyleGroups.map(group => 
      group.id === groupId ? { ...group, isOpen: !group.isOpen } : group
    ));
  };

  // Move item functions
  const handleMoveItem = (type: 'color' | 'textStyle', item: ColorItem | TextStyle, sourceId: number) => {
    setMovingItemType(type);
    setMovingItem(item);
    setSourceGroupId(sourceId);
    setTargetGroupId(null);
    setIsMoveDialogOpen(true);
  };

  const executeMoveItem = () => {
    if (!movingItem || sourceGroupId === null || targetGroupId === null) return;

    if (movingItemType === 'color') {
      // Move color item
      const colorItem = movingItem as ColorItem;
      
      // First remove from source group
      const updatedGroups = colorGroups.map(group => {
        if (group.id === sourceGroupId) {
          return {
            ...group,
            colors: group.colors.filter(c => c.id !== colorItem.id)
          };
        }
        return group;
      });
      
      // Then add to target group
      const finalGroups = updatedGroups.map(group => {
        if (group.id === targetGroupId) {
          return {
            ...group,
            colors: [...group.colors, colorItem]
          };
        }
        return group;
      });
      
      setColorGroups(finalGroups);
    } else {
      // Move text style item
      const styleItem = movingItem as TextStyle;
      
      // First remove from source group
      const updatedGroups = textStyleGroups.map(group => {
        if (group.id === sourceGroupId) {
          return {
            ...group,
            styles: group.styles.filter(s => s.id !== styleItem.id)
          };
        }
        return group;
      });
      
      // Then add to target group
      const finalGroups = updatedGroups.map(group => {
        if (group.id === targetGroupId) {
          return {
            ...group,
            styles: [...group.styles, styleItem]
          };
        }
        return group;
      });
      
      setTextStyleGroups(finalGroups);
    }
    
    setIsMoveDialogOpen(false);
  };

  // Render folder icon based on the icon type
  const renderFolderIcon = (iconType: string = 'default') => {
    switch(iconType) {
      case 'typography':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'colors':
        return <Folder className="h-4 w-4 text-purple-500" />;
      case 'branding':
        return <Folder className="h-4 w-4 text-green-500" />;
      case 'open':
        return <FolderOpen className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">Brand</div>
      </div>

      {/* Brand content */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full" defaultValue={["colors", "textStyles"]}>
          {/* Colors section */}
          <AccordionItem value="colors" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium">
              Colors & Styles
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-2">
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
                    <div className="pl-4">
                      {group.colors.length > 0 ? (
                        <div className="grid grid-cols-4 gap-3">
                          {group.colors.map((color) => (
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
                  {/* Add some ungrouped colors */}
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
            </AccordionContent>
          </AccordionItem>

          {/* Text Styles section */}
          <AccordionItem value="textStyles" className="border-b">
            <AccordionTrigger className="px-4 py-2 text-sm font-medium">
              Text Styles
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-2">
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
                    <div className="pl-4">
                      {group.styles.length > 0 ? (
                        <div className="space-y-2">
                          {group.styles.map((style) => (
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

      {/* Color Group Dialog */}
      <Dialog open={isColorGroupDialogOpen} onOpenChange={setIsColorGroupDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingColorGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
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
                placeholder="e.g. Brand Colors, UI Colors, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupIcon" className="text-right">
                Icon
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {renderFolderIcon(newGroupIcon)}
                      <span className="ml-2">
                        {newGroupIcon === 'default' ? 'Default Folder' : 
                         newGroupIcon === 'typography' ? 'Typography' : 
                         newGroupIcon === 'colors' ? 'Colors' : 
                         newGroupIcon === 'branding' ? 'Branding' : 
                         newGroupIcon === 'open' ? 'Open Folder' : 'Select Icon'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid gap-2">
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('default')}
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        Default Folder
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('open')}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Open Folder
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('colors')}
                      >
                        <Folder className="h-4 w-4 mr-2 text-purple-500" />
                        Colors
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('typography')}
                      >
                        <Folder className="h-4 w-4 mr-2 text-blue-500" />
                        Typography
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('branding')}
                      >
                        <Folder className="h-4 w-4 mr-2 text-green-500" />
                        Branding
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsColorGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveColorGroup} disabled={!newGroupName.trim()}>
              {editingColorGroup ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Style Group Dialog */}
      <Dialog open={isTextStyleGroupDialogOpen} onOpenChange={setIsTextStyleGroupDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingTextStyleGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
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
                placeholder="e.g. Headings, Body Text, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupIcon" className="text-right">
                Icon
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {renderFolderIcon(newGroupIcon)}
                      <span className="ml-2">
                        {newGroupIcon === 'default' ? 'Default Folder' : 
                         newGroupIcon === 'typography' ? 'Typography' : 
                         newGroupIcon === 'colors' ? 'Colors' : 
                         newGroupIcon === 'branding' ? 'Branding' : 
                         newGroupIcon === 'open' ? 'Open Folder' : 'Select Icon'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid gap-2">
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('default')}
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        Default Folder
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('open')}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Open Folder
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('colors')}
                      >
                        <Folder className="h-4 w-4 mr-2 text-purple-500" />
                        Colors
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('typography')}
                      >
                        <Folder className="h-4 w-4 mr-2 text-blue-500" />
                        Typography
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => setNewGroupIcon('branding')}
                      >
                        <Folder className="h-4 w-4 mr-2 text-green-500" />
                        Branding
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTextStyleGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTextStyleGroup} disabled={!newGroupName.trim()}>
              {editingTextStyleGroup ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Item Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Move {movingItemType === 'color' ? 'Color' : 'Text Style'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label className="text-sm font-medium block mb-2">
                Select destination group:
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {movingItemType === 'color' ? (
                  colorGroups.map(group => (
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
                  ))
                ) : (
                  textStyleGroups.map(group => (
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
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeMoveItem} 
              disabled={!targetGroupId || targetGroupId === sourceGroupId}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
