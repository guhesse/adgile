import React, { useState } from 'react';
import { Folder, FolderPlus, ChevronDown, ChevronRight, Edit, Trash2, Plus, Move, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorElement } from '../types';
import { BrandGroup, BrandItem, TextStyle } from '../types/brand';
import { GroupDialog } from './brand/GroupDialog';
import { ItemDialog } from './brand/ItemDialog';
import { MoveItemDialog } from './brand/MoveItemDialog';

interface BrandPanelProps {
  selectedElement: EditorElement | null;
  updateElementStyle: (property: string, value: any) => void;
}

export const BrandPanel = ({ selectedElement, updateElementStyle }: BrandPanelProps) => {
  // Brand groups - agora contêm tipos mistos
  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>([
    { 
      id: 1, 
      name: 'Brand Elements', 
      isOpen: true,
      icon: 'default',
      items: [
        { id: 1, name: 'Primary', type: 'color', color: '#9b87f5' },
        { id: 2, name: 'Secondary', type: 'color', color: '#7E69AB' },
        { 
          id: 6, 
          name: 'Heading 1', 
          type: 'textStyle',
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
      ] 
    },
    { 
      id: 2, 
      name: 'UI Elements', 
      isOpen: true,
      icon: 'default',
      items: [
        { id: 4, name: 'Dark', type: 'color', color: '#1A1F2C' },
        { id: 5, name: 'Light', type: 'color', color: '#D6BCFA' },
        { 
          id: 7, 
          name: 'Body Text', 
          type: 'textStyle',
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
      id: 3, 
      name: 'Empty Group', 
      isOpen: true,
      icon: 'default',
      items: [] 
    },
  ]);

  // Elementos não agrupados
  const [ungroupedItems, setUngroupedItems] = useState<BrandItem[]>([
    { id: 101, name: 'Yellow', type: 'color', color: '#F8B64C' },
    { id: 102, name: 'Red', type: 'color', color: '#EF4444' },
    { id: 103, name: 'Green', type: 'color', color: '#10B981' },
    { 
      id: 104, 
      name: 'Caption', 
      type: 'textStyle',
      textStyle: {
        id: 3,
        name: 'Caption',
        style: {
          fontSize: 12,
          fontWeight: 'normal',
          color: '#666666',
          fontFamily: 'Inter',
          lineHeight: 1.4,
          letterSpacing: 0
        }
      }
    },
  ]);

  // Dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandItem | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  // Group dialog states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<BrandGroup | null>(null);

  // Move item dialog state
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [movingItem, setMovingItem] = useState<BrandItem | null>(null);
  const [sourceGroupId, setSourceGroupId] = useState<number | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);

  // Estado de drag and drop
  const [draggedItem, setDraggedItem] = useState<{item: BrandItem, sourceGroupId: number | null} | null>(null);
  const [dragTargetId, setDragTargetId] = useState<{id: number | string, isGroup: boolean} | null>(null);

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
  ];

  // Apply item to selected element
  const applyItemToSelectedElement = (item: BrandItem) => {
    if (!selectedElement) return;

    if (item.type === 'color' && item.color) {
      // Aplica cor
      if (selectedElement.type === 'text') {
        updateElementStyle('color', item.color);
      } else if (selectedElement.type === 'button' || 
                selectedElement.type === 'container' || 
                selectedElement.type === 'layout') {
        updateElementStyle('backgroundColor', item.color);
      }
    } 
    else if (item.type === 'textStyle' && item.textStyle && selectedElement.type === 'text') {
      // Aplica estilo de texto
      const { style } = item.textStyle;
      Object.entries(style).forEach(([key, value]) => {
        updateElementStyle(key, value);
      });
    }
  };

  // Group Management Functions
  const handleAddGroup = () => {
    setEditingGroup(null);
    setNewGroupName('');
    setIsGroupDialogOpen(true);
  };

  const handleEditGroup = (group: BrandGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = (groupId: number) => {
    // Mover todos os itens do grupo para não agrupados antes de excluir
    const groupToDelete = brandGroups.find(g => g.id === groupId);
    if (groupToDelete && groupToDelete.items.length > 0) {
      setUngroupedItems(prev => [...prev, ...groupToDelete.items]);
    }
    
    setBrandGroups(brandGroups.filter(group => group.id !== groupId));
  };

  const handleSaveGroup = () => {
    if (editingGroup) {
      // Update existing group
      setBrandGroups(brandGroups.map(g => 
        g.id === editingGroup.id 
          ? { ...g, name: newGroupName } 
          : g
      ));
    } else {
      // Add new group
      const newId = Math.max(0, ...brandGroups.map(g => g.id), 0) + 1;
      setBrandGroups([...brandGroups, { id: newId, name: newGroupName, items: [], isOpen: true }]);
    }
    setIsGroupDialogOpen(false);
  };

  // Item Management Functions
  const handleAddItem = (groupId: number) => {
    setEditingItem(null);
    setEditingGroupId(groupId);
    setIsItemDialogOpen(true);
  };

  const handleAddUngroupedItem = () => {
    setEditingItem(null);
    setEditingGroupId(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: BrandItem, groupId: number | null) => {
    setEditingItem(item);
    setEditingGroupId(groupId);
    setIsItemDialogOpen(true);
  };

  const handleDeleteItem = (item: BrandItem, groupId: number | null) => {
    if (groupId !== null) {
      // Delete from group
      setBrandGroups(brandGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.filter(i => i.id !== item.id)
          };
        }
        return group;
      }));
    } else {
      // Delete from ungrouped
      setUngroupedItems(ungroupedItems.filter(i => i.id !== item.id));
    }
  };

  const handleSaveItem = (itemData: { 
    type: 'color' | 'textStyle', 
    name: string, 
    color?: string, 
    textStyle?: TextStyle 
  }) => {
    if (editingGroupId !== null) {
      // Salvando em um grupo
      setBrandGroups(brandGroups.map(group => {
        if (group.id === editingGroupId) {
          if (editingItem) {
            // Update existing item
            return {
              ...group,
              items: group.items.map(item => 
                item.id === editingItem.id 
                  ? { ...itemData, id: item.id } 
                  : item
              )
            };
          } else {
            // Add new item
            const newId = Math.max(
              0, 
              ...group.items.map(item => item.id), 
              ...ungroupedItems.map(item => item.id),
              0
            ) + 1;
            return {
              ...group,
              items: [...group.items, { ...itemData, id: newId }]
            };
          }
        }
        return group;
      }));
    } else {
      // Salvando em não agrupados
      if (editingItem) {
        // Update existing ungrouped item
        setUngroupedItems(ungroupedItems.map(item => 
          item.id === editingItem.id 
            ? { ...itemData, id: item.id } 
            : item
        ));
      } else {
        // Add new ungrouped item
        const newId = Math.max(
          0, 
          ...brandGroups.flatMap(g => g.items).map(item => item.id),
          ...ungroupedItems.map(item => item.id),
          0
        ) + 1;
        setUngroupedItems([...ungroupedItems, { ...itemData, id: newId }]);
      }
    }
    
    setIsItemDialogOpen(false);
  };

  // Toggle group open/closed state
  const toggleGroupOpen = (groupId: number) => {
    setBrandGroups(brandGroups.map(group => 
      group.id === groupId ? { ...group, isOpen: !group.isOpen } : group
    ));
  };

  // Reorganizar a ordem dos itens em um grupo
  const moveItemUp = (item: BrandItem, groupId: number | null) => {
    if (groupId === null) {
      // Move item up in ungrouped
      const index = ungroupedItems.findIndex(i => i.id === item.id);
      if (index > 0) {
        const newItems = [...ungroupedItems];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        setUngroupedItems(newItems);
      }
    } else {
      // Move item up in group
      setBrandGroups(brandGroups.map(group => {
        if (group.id === groupId) {
          const index = group.items.findIndex(i => i.id === item.id);
          if (index > 0) {
            const newItems = [...group.items];
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            return { ...group, items: newItems };
          }
        }
        return group;
      }));
    }
  };

  const moveItemDown = (item: BrandItem, groupId: number | null) => {
    if (groupId === null) {
      // Move item down in ungrouped
      const index = ungroupedItems.findIndex(i => i.id === item.id);
      if (index < ungroupedItems.length - 1) {
        const newItems = [...ungroupedItems];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        setUngroupedItems(newItems);
      }
    } else {
      // Move item down in group
      setBrandGroups(brandGroups.map(group => {
        if (group.id === groupId) {
          const index = group.items.findIndex(i => i.id === item.id);
          if (index < group.items.length - 1) {
            const newItems = [...group.items];
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            return { ...group, items: newItems };
          }
        }
        return group;
      }));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: BrandItem, sourceGroupId: number | null) => {
    e.stopPropagation();
    setDraggedItem({ item, sourceGroupId });
    e.dataTransfer.setData('text/plain', item.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: number | string, isGroup: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Não permitir drop em mesmo grupo (mas permitir para reordenar)
    if (isGroup && typeof targetId === 'number' && 
        draggedItem && draggedItem.sourceGroupId === targetId) {
      return;
    }
    
    setDragTargetId({ id: targetId, isGroup });
    
    // Abrir grupo se estiver colapsado
    if (isGroup && typeof targetId === 'number') {
      const group = brandGroups.find(g => g.id === targetId);
      if (group && !group.isOpen) {
        setBrandGroups(brandGroups.map(g => 
          g.id === targetId ? { ...g, isOpen: true } : g
        ));
      }
    }
  };

  const handleDragLeave = () => {
    setDragTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: number | string, isGroup: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    if (isGroup) {
      // Drop em um grupo
      if (typeof targetId === 'number') {
        if (draggedItem.sourceGroupId === targetId) {
          // Mesmo grupo - não fazer nada (correto)
          console.log("Drop no mesmo grupo - ignorando");
        } else {
          // Mover para outro grupo
          moveItemBetweenGroups(draggedItem.item, draggedItem.sourceGroupId, targetId);
        }
      }
    } else {
      // Drop em "não agrupados"
      if (targetId === 'ungrouped') {
        moveItemToUngrouped(draggedItem.item, draggedItem.sourceGroupId);
      }
    }
    
    setDraggedItem(null);
    setDragTargetId(null);
  };

  // Move item entre grupos ou para não agrupados
  const moveItemBetweenGroups = (item: BrandItem, sourceGroupId: number | null, targetGroupId: number) => {
    if (sourceGroupId === null) {
      // Item vem de não agrupados
      setUngroupedItems(prev => prev.filter(i => i.id !== item.id));
      
      // Adicionar ao grupo de destino
      setBrandGroups(brandGroups.map(group => {
        if (group.id === targetGroupId) {
          return {
            ...group,
            items: [...group.items, item]
          };
        }
        return group;
      }));
    } else {
      // Item vem de outro grupo
      setBrandGroups(brandGroups.map(group => {
        if (group.id === sourceGroupId) {
          return {
            ...group,
            items: group.items.filter(i => i.id !== item.id)
          };
        }
        if (group.id === targetGroupId) {
          return {
            ...group,
            items: [...group.items, item]
          };
        }
        return group;
      }));
    }
  };

  const moveItemToUngrouped = (item: BrandItem, sourceGroupId: number | null) => {
    if (sourceGroupId === null) {
      // Já está em não agrupados - não fazer nada
      return;
    }
    
    // Remover do grupo
    setBrandGroups(brandGroups.map(group => {
      if (group.id === sourceGroupId) {
        return {
          ...group,
          items: group.items.filter(i => i.id !== item.id)
        };
      }
      return group;
    }));
    
    // Adicionar a não agrupados
    setUngroupedItems(prev => [...prev, item]);
  };

  // Handle move through dialog
  const handleMoveItem = (item: BrandItem, sourceGroupId: number | null) => {
    setMovingItem(item);
    setSourceGroupId(sourceGroupId);
    setTargetGroupId(null);
    setIsMoveDialogOpen(true);
  };

  const executeMoveItem = () => {
    if (!movingItem || targetGroupId === null) return;
    
    if (targetGroupId === -1) {
      // Mover para não agrupados
      moveItemToUngrouped(movingItem, sourceGroupId);
    } else {
      // Mover para grupo específico
      moveItemBetweenGroups(movingItem, sourceGroupId, targetGroupId);
    }
    
    setIsMoveDialogOpen(false);
  };

  // Render folder icon 
  const renderFolderIcon = (iconType: string = 'default') => {
    return <Folder className="h-4 w-4" />;
  };

  // Renderizar um item de estilo de texto
  const renderTextStyleItem = (item: BrandItem, groupId: number | null) => {
    if (!item.textStyle) return null;
    
    const { style } = item.textStyle;
    
    return (
      <div 
        key={item.id} 
        className="flex flex-col items-center gap-1 group"
        draggable
        onDragStart={(e) => handleDragStart(e, item, groupId)}
      >
        <div
          className="w-12 h-12 rounded-md border border-gray-200 cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all relative group-hover:opacity-80 flex items-center justify-center"
          style={{ 
            backgroundColor: style.color || '#FFFFFF',
            color: style.color ? getContrastColor(style.color) : '#000000',
            fontFamily: style.fontFamily
          }}
          onClick={() => applyItemToSelectedElement(item)}
        >
          <span style={{ 
            fontSize: Math.min(style.fontSize / 1.5, 20),
            fontWeight: style.fontWeight
          }}>
            Aa
          </span>
          
          <div className="absolute -top-2 -right-2 hidden group-hover:flex space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleEditItem(item, groupId);
              }}
              className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Edit className="h-3 w-3 text-gray-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleMoveItem(item, groupId);
              }}
              className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Move className="h-3 w-3 text-gray-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item, groupId);
              }}
              className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Trash2 className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-600">{item.name}</span>
        
        {/* Botões de reordenar visíveis no hover */}
        <div className="hidden group-hover:flex space-x-1 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItemUp(item, groupId);
            }}
            className="bg-gray-100 p-1 rounded hover:bg-gray-200"
            title="Mover para cima"
          >
            <ArrowUp className="h-3 w-3 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItemDown(item, groupId);
            }}
            className="bg-gray-100 p-1 rounded hover:bg-gray-200"
            title="Mover para baixo"
          >
            <ArrowDown className="h-3 w-3 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // Função auxiliar para determinar cor de contraste
  const getContrastColor = (hexColor: string) => {
    if (!hexColor || !hexColor.startsWith('#')) return '#000000';
    
    // Converter para RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calcular luminosidade
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Retornar cor contrastante
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Renderizar um item de cor
  const renderColorItem = (item: BrandItem, groupId: number | null) => {
    if (!item.color) return null;
    
    return (
      <div 
        key={item.id} 
        className="flex flex-col items-center gap-1 group"
        draggable
        onDragStart={(e) => handleDragStart(e, item, groupId)}
      >
        <div
          className="w-12 h-12 rounded-md border border-gray-200 cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all relative group-hover:opacity-80"
          style={{ backgroundColor: item.color }}
          onClick={() => applyItemToSelectedElement(item)}
        >
          <div className="absolute -top-2 -right-2 hidden group-hover:flex space-x-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleEditItem(item, groupId);
              }}
              className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Edit className="h-3 w-3 text-gray-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleMoveItem(item, groupId);
              }}
              className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Move className="h-3 w-3 text-gray-600" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item, groupId);
              }}
              className="bg-white p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Trash2 className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-600">{item.name}</span>
        
        {/* Botões de reordenar visíveis no hover */}
        <div className="hidden group-hover:flex space-x-1 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItemUp(item, groupId);
            }}
            className="bg-gray-100 p-1 rounded hover:bg-gray-200"
            title="Mover para cima"
          >
            <ArrowUp className="h-3 w-3 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItemDown(item, groupId);
            }}
            className="bg-gray-100 p-1 rounded hover:bg-gray-200"
            title="Mover para baixo"
          >
            <ArrowDown className="h-3 w-3 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // Renderizar um item baseado no seu tipo
  const renderItem = (item: BrandItem, groupId: number | null) => {
    if (item.type === 'color') {
      return renderColorItem(item, groupId);
    } else if (item.type === 'textStyle') {
      return renderTextStyleItem(item, groupId);
    }
    return null;
  };

  // Renderizar um grupo com seus itens
  const renderGroup = (group: BrandGroup) => {
    const isDropTarget = dragTargetId?.isGroup && dragTargetId.id === group.id;
    
    return (
      <div key={group.id} className="mb-6">
        <div className="flex items-center justify-between mb-2 group">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleGroupOpen(group.id)}
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
              onClick={() => handleAddItem(group.id)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => handleEditGroup(group)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => handleDeleteGroup(group.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {group.isOpen && (
          <div 
            className={`pl-4 ${isDropTarget ? 'bg-blue-50 rounded-md p-2' : ''}`}
            onDragOver={(e) => handleDragOver(e, group.id, true)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, group.id, true)}
          >
            {group.items.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {group.items.map(item => renderItem(item, group.id))}
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center text-sm text-gray-500">
                Drag and drop items here or{" "}
                <button 
                  className="text-purple-600 underline"
                  onClick={() => handleAddItem(group.id)}
                >
                  add item
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar área de itens não agrupados
  const renderUngroupedArea = () => {
    const isDropTarget = dragTargetId?.id === 'ungrouped' && !dragTargetId.isGroup;
    
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Ungrouped Items</h3>
          <Button
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={handleAddUngroupedItem}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div 
          className={`border-2 ${isDropTarget ? 'border-blue-300 bg-blue-50' : 'border-dashed'} rounded-md p-4`}
          onDragOver={(e) => handleDragOver(e, 'ungrouped', false)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'ungrouped', false)}
        >
          {ungroupedItems.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {ungroupedItems.map(item => renderItem(item, null))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">
              Drag items here to ungroup them or{" "}
              <button 
                className="text-purple-600 underline"
                onClick={handleAddUngroupedItem}
              >
                add new item
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">Brand Library</div>
      </div>

      {/* Botão de adicionar grupo */}
      <div className="p-2 border-b">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-center"
          onClick={handleAddGroup}
        >
          <FolderPlus className="h-4 w-4 mr-1" />
          Add Group
        </Button>
      </div>

      {/* Brand content */}
      <div className="flex-1 overflow-y-auto p-4">
        {brandGroups.map(renderGroup)}
        
        {/* Área para itens não agrupados */}
        {renderUngroupedArea()}
      </div>

      {/* Item Dialog */}
      <ItemDialog 
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        editingItem={editingItem}
        onSave={handleSaveItem}
        availableFonts={availableFonts}
      />

      {/* Group Dialog */}
      <GroupDialog 
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        editingGroup={editingGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        onSave={handleSaveGroup}
      />

      {/* Move Item Dialog - modificado para incluir opção "Não agrupado" */}
      <MoveItemDialog 
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        sourceGroupId={sourceGroupId}
        targetGroupId={targetGroupId}
        setTargetGroupId={setTargetGroupId}
        groups={[
          // Opção para "Não agrupado"
          { id: -1, name: "Ungrouped Items", items: [], isOpen: true },
          // Todos os grupos normais
          ...brandGroups
        ]}
        onMove={executeMoveItem}
        renderFolderIcon={renderFolderIcon}
      />
    </div>
  );
};
