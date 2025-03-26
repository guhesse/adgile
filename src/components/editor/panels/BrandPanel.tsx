import React, { useState } from 'react';
import { Folder, FolderPlus, ChevronDown, ChevronRight, Edit, Trash2, Plus, Move } from 'lucide-react';
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
  // State for drag and drop
  const [draggedItem, setDraggedItem] = useState<{
    item: BrandItem;
    sourceGroupId: number | null;
    index: number;
  } | null>(null);

  const [dropTarget, setDropTarget] = useState<{
    groupId: number | null;
    index: number | null;
  } | null>(null);

  // Brand groups - fixed to include value property
  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>([
    {
      id: 1,
      name: 'Brand Elements',
      isOpen: true,
      icon: 'default',
      items: [
        { id: 1, name: 'Primary', value: 'primary', type: 'color', color: '#9b87f5' },
        { id: 2, name: 'Secondary', value: 'secondary', type: 'color', color: '#7E69AB' },
        {
          id: 6,
          name: 'Heading 1',
          value: 'heading1',
          type: 'textStyle',
          textStyle: {
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 'bold',
            lineHeight: 1.2,
            letterSpacing: 0,
            color: '#1A1F2C',
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
        { id: 4, name: 'Dark', value: 'dark', type: 'color', color: '#1A1F2C' },
        { id: 5, name: 'Light', value: 'light', type: 'color', color: '#D6BCFA' },
        {
          id: 7,
          name: 'Body Text',
          value: 'bodyText',
          type: 'textStyle',
          textStyle: {
            fontFamily: 'Roboto',
            fontSize: 16,
            fontWeight: 'normal',
            lineHeight: 1.5,
            letterSpacing: 0,
            color: '#222222',
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

  // Ungrouped items - fixed to include value property
  const [ungroupedItems, setUngroupedItems] = useState<BrandItem[]>([
    { id: 101, name: 'Yellow', value: 'yellow', type: 'color', color: '#F8B64C' },
    { id: 102, name: 'Red', value: 'red', type: 'color', color: '#EF4444' },
    { id: 103, name: 'Green', value: 'green', type: 'color', color: '#10B981' },
    {
      id: 104,
      name: 'Caption',
      value: 'caption',
      type: 'textStyle',
      textStyle: {
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 1.4,
        letterSpacing: 0,
        color: '#666666',
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
      // Saving to a group
      setBrandGroups(brandGroups.map(group => {
        if (group.id === editingGroupId) {
          if (editingItem) {
            // Update existing item
            return {
              ...group,
              items: group.items.map(item =>
                item.id === editingItem.id
                  ? createValidBrandItem(itemData, item.id)
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
              items: [...group.items, createValidBrandItem(itemData, newId)]
            };
          }
        }
        return group;
      }));
    } else {
      // Saving to ungrouped
      if (editingItem) {
        // Update existing ungrouped item
        setUngroupedItems(ungroupedItems.map(item =>
          item.id === editingItem.id
            ? createValidBrandItem(itemData, item.id)
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
        setUngroupedItems([...ungroupedItems, createValidBrandItem(itemData, newId)]);
      }
    }

    setIsItemDialogOpen(false);
  };

  const createValidBrandItem = (itemData: { 
    type: 'color' | 'textStyle',
    name: string, 
    color?: string,
    textStyle?: TextStyle
  }, id: number): BrandItem => {
    const value = itemData.name.toLowerCase().replace(/\s+/g, '-');
    
    if (itemData.type === 'color') {
      return {
        id,
        name: itemData.name,
        value,
        type: 'color',
        color: itemData.color || '#000000'
      };
    } else {
      return {
        id,
        name: itemData.name,
        value,
        type: 'textStyle',
        textStyle: itemData.textStyle
      };
    }
  };

  // Toggle group open/closed state
  const toggleGroupOpen = (groupId: number) => {
    setBrandGroups(brandGroups.map(group =>
      group.id === groupId ? { ...group, isOpen: !group.isOpen } : group
    ));
  };

  // Função melhorada para reordenar items dentro de um grupo
  const reorderItemsInGroup = (
    groupId: number | null,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (sourceIndex === targetIndex) return; // Não fazer nada se a posição é a mesma

    if (groupId === null) {
      // Reordenar em não agrupados
      const newItems = [...ungroupedItems];
      const [movedItem] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, movedItem);
      setUngroupedItems(newItems);
    } else {
      // Reordenar dentro de um grupo
      setBrandGroups(brandGroups.map(group => {
        if (group.id === groupId) {
          const newItems = [...group.items];
          const [movedItem] = newItems.splice(sourceIndex, 1);
          newItems.splice(targetIndex, 0, movedItem);
          return { ...group, items: newItems };
        }
        return group;
      }));
    }
  };

  // Funções de drag and drop
  const handleDragStart = (e: React.DragEvent, item: BrandItem, groupId: number | null, index: number) => {
    e.stopPropagation();
    setDraggedItem({ item, sourceGroupId: groupId, index });
    e.dataTransfer.setData('text/plain', item.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent, groupId: number | null, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    setDropTarget({ groupId, index });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Verificar se realmente saiu do item
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('.brand-item')) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: number | null, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    // Se for o mesmo grupo, é reordenação
    if (draggedItem.sourceGroupId === targetGroupId) {
      reorderItemsInGroup(targetGroupId, draggedItem.index, targetIndex);
    }
    // Mover entre grupos
    else if (targetGroupId !== null && draggedItem.sourceGroupId !== null) {
      moveItemBetweenGroups(draggedItem.item, draggedItem.sourceGroupId, targetGroupId, targetIndex);
    }
    // Mover de não agrupados para grupo
    else if (targetGroupId !== null && draggedItem.sourceGroupId === null) {
      const newItems = [...ungroupedItems];
      newItems.splice(draggedItem.index, 1);
      setUngroupedItems(newItems);

      setBrandGroups(brandGroups.map(group => {
        if (group.id === targetGroupId) {
          const groupItems = [...group.items];
          groupItems.splice(targetIndex, 0, draggedItem.item);
          return { ...group, items: groupItems };
        }
        return group;
      }));
    }
    // Mover de grupo para não agrupados
    else if (targetGroupId === null && draggedItem.sourceGroupId !== null) {
      setBrandGroups(brandGroups.map(group => {
        if (group.id === draggedItem.sourceGroupId) {
          return {
            ...group,
            items: group.items.filter(item => item.id !== draggedItem.item.id)
          };
        }
        return group;
      }));

      const ungroupedItemsCopy = [...ungroupedItems];
      ungroupedItemsCopy.splice(targetIndex, 0, draggedItem.item);
      setUngroupedItems(ungroupedItemsCopy);
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  // Função movida e simplificada para clientes
  const moveItemBetweenGroups = (
    item: BrandItem,
    sourceGroupId: number,
    targetGroupId: number,
    targetIndex: number
  ) => {
    // Remover do grupo de origem
    setBrandGroups(brandGroups.map(group => {
      if (group.id === sourceGroupId) {
        return {
          ...group,
          items: group.items.filter(i => i.id !== item.id)
        };
      }

      // Adicionar ao grupo de destino
      if (group.id === targetGroupId) {
        const newItems = [...group.items];
        newItems.splice(targetIndex, 0, item);
        return { ...group, items: newItems };
      }

      return group;
    }));
  };

  // Handle move através do diálogo
  const handleMoveItem = (item: BrandItem, sourceGroupId: number | null) => {
    setMovingItem(item);
    setSourceGroupId(sourceGroupId);
    setTargetGroupId(null);
    setIsMoveDialogOpen(true);
  };

  // Implementação do executeMoveItem que estava faltando
  const executeMoveItem = () => {
    if (!movingItem || targetGroupId === null) return;

    if (targetGroupId === -1) {
      // Mover para não agrupados
      if (sourceGroupId !== null) {
        // Remover do grupo
        setBrandGroups(brandGroups.map(group => {
          if (group.id === sourceGroupId) {
            return {
              ...group,
              items: group.items.filter(i => i.id !== movingItem.id)
            };
          }
          return group;
        }));

        // Adicionar a não agrupados
        setUngroupedItems(prev => [...prev, movingItem]);
      }
    } else {
      // Mover para um grupo específico
      if (sourceGroupId === null) {
        // De não agrupados para grupo
        setUngroupedItems(prev => prev.filter(i => i.id !== movingItem.id));

        setBrandGroups(brandGroups.map(group => {
          if (group.id === targetGroupId) {
            return {
              ...group,
              items: [...group.items, movingItem]
            };
          }
          return group;
        }));
      } else {
        // Entre grupos
        setBrandGroups(brandGroups.map(group => {
          if (group.id === sourceGroupId) {
            return {
              ...group,
              items: group.items.filter(i => i.id !== movingItem.id)
            };
          }
          if (group.id === targetGroupId) {
            return {
              ...group,
              items: [...group.items, movingItem]
            };
          }
          return group;
        }));
      }
    }

    setIsMoveDialogOpen(false);
    setMovingItem(null);
    setSourceGroupId(null);
    setTargetGroupId(null);
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

  // Render folder icon 
  const renderFolderIcon = (iconType: string = 'default') => {
    return <Folder className="h-4 w-4" />;
  };

  // Renderizar um item de texto
  const renderTextStyleItem = (item: BrandItem, groupId: number | null, index: number) => {
    if (!item.textStyle) return null;

    const { style } = item.textStyle;
    const isDragging = draggedItem?.item.id === item.id;
    const isDropTarget = dropTarget?.groupId === groupId && dropTarget.index === index;

    return (
      <div
        key={`${item.id}-${index}`}
        className={`flex flex-col items-center gap-1 group brand-item
                   ${isDragging ? 'opacity-50' : ''} 
                   ${isDropTarget ? 'ring-2 ring-blue-500' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item, groupId, index)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, groupId, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, groupId, index)}
        data-item-id={item.id}
        data-index={index}
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
      </div>
    );
  };

  // Renderizar um item de cor
  const renderColorItem = (item: BrandItem, groupId: number | null, index: number) => {
    if (!item.color) return null;

    const isDragging = draggedItem?.item.id === item.id;
    const isDropTarget = dropTarget?.groupId === groupId && dropTarget.index === index;

    return (
      <div
        key={`${item.id}-${index}`}
        className={`flex flex-col items-center gap-1 group brand-item
                   ${isDragging ? 'opacity-50' : ''} 
                   ${isDropTarget ? 'ring-2 ring-blue-500' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item, groupId, index)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, groupId, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, groupId, index)}
        data-item-id={item.id}
        data-index={index}
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
      </div>
    );
  };

  // Renderizar um item baseado no seu tipo
  const renderItem = (item: BrandItem, groupId: number | null, index: number) => {
    if (item.type === 'color') {
      return renderColorItem(item, groupId, index);
    } else if (item.type === 'textStyle') {
      return renderTextStyleItem(item, groupId, index);
    }
    return null;
  };

  // Renderizar um grupo com seus itens
  const renderGroup = (group: BrandGroup) => {
    const isDropTarget = dropTarget?.groupId === group.id && dropTarget.index === null;
    
    // Função para renderizar um local de drop entre itens
    const renderDropZone = (index: number) => (
      <div 
        key={`dropzone-${group.id}-${index}`}
        className={`absolute left-0 right-0 h-2 ${dropTarget?.groupId === group.id && dropTarget.index === index ? 'bg-blue-200' : ''} rounded-md z-10`}
        style={{ 
          top: index === 0 ? 0 : 'auto',
          bottom: index === 0 ? 'auto' : 0,
          transform: index === 0 ? 'translateY(-50%)' : 'translateY(50%)'
        }}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, group.id, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, group.id, index)}
      />
    );
    
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
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, group.id, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, group.id, group.items.length)}
          >
            {group.items.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 relative">
                {group.items.map((item, index) => (
                  <div key={`item-wrapper-${item.id}`} className="relative">
                    {index === 0 && renderDropZone(0)}
                    {renderItem(item, group.id, index)}
                    {renderDropZone(index + 1)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center text-sm text-gray-500">
                Arraste itens para aqui ou{" "}
                <button 
                  className="text-purple-600 underline"
                  onClick={() => handleAddItem(group.id)}
                >
                  adicione um item
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar área de itens não agrupados com a mesma lógica
  const renderUngroupedArea = () => {
    const isDropTarget = dropTarget?.groupId === null && dropTarget.index === null;
    
    // Função para renderizar um local de drop entre itens não agrupados
    const renderDropZone = (index: number) => (
      <div 
        key={`dropzone-ungrouped-${index}`}
        className={`absolute left-0 right-0 h-2 ${dropTarget?.groupId === null && dropTarget.index === index ? 'bg-blue-200' : ''} rounded-md z-10`}
        style={{ 
          top: index === 0 ? 0 : 'auto',
          bottom: index === 0 ? 'auto' : 0,
          transform: index === 0 ? 'translateY(-50%)' : 'translateY(50%)'
        }}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, null, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null, index)}
      />
    );
    
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Itens não agrupados</h3>
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
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, null, null)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null, ungroupedItems.length)}
        >
          {ungroupedItems.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 relative">
              {ungroupedItems.map((item, index) => (
                <div key={`item-wrapper-${item.id}`} className="relative">
                  {index === 0 && renderDropZone(0)}
                  {renderItem(item, null, index)}
                  {renderDropZone(index + 1)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">
              Arraste itens para aqui ou{" "}
              <button 
                className="text-purple-600 underline"
                onClick={handleAddUngroupedItem}
              >
                adicione um novo item
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
        <div className="text-sm font-bold text-[#414651]">Biblioteca de Marca</div>
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
          Adicionar Grupo
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
          { id: -1, name: "Itens não agrupados", items: [], isOpen: true, icon: "default" },
          // Todos os grupos normais
          ...brandGroups
        ]}
        onMove={executeMoveItem}
        renderFolderIcon={iconType => "folder"} // Return string instead of ReactNode
      />
    </div>
  );
};
