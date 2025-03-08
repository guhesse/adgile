
import React, { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HexColorPicker } from "react-colorful";
import { 
  Box,
  Image,
  Layout,
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit,
  Upload,
  Palette,
  FolderPlus,
  Folder,
  MoveHorizontal
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Type definitions
type BrandItemBase = {
  id: string;
  name: string;
};

type BrandColor = BrandItemBase & {
  type: "color";
  color: string;
};

type BrandLogo = BrandItemBase & {
  type: "logo";
  url: string;
};

type BrandTextStyle = BrandItemBase & {
  type: "textStyle";
  style: {
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    color: string;
    lineHeight: number;
  };
};

type BrandItem = BrandColor | BrandLogo | BrandTextStyle;

type BrandFolder = {
  id: string;
  name: string;
  type: "colors" | "logos" | "textStyles";
  parentId?: string;
  items: BrandItem[];
  subfolders?: string[];
};

export const BrandPanel = () => {
  // State for all folders and ungrouped items
  const [folders, setFolders] = useState<BrandFolder[]>([
    {
      id: "primary-colors",
      name: "Primary",
      type: "colors",
      items: [
        { id: "color-1", name: "Primary 900", type: "color", color: "#2C1C5F" },
        { id: "color-2", name: "Primary 800", type: "color", color: "#42307D" },
        { id: "color-3", name: "Primary 700", type: "color", color: "#53389E" },
        { id: "color-4", name: "Primary 600", type: "color", color: "#7F56D9" },
        { id: "color-5", name: "Primary 500", type: "color", color: "#B692F6" },
        { id: "color-6", name: "Primary 400", type: "color", color: "#E9D7FE" },
      ],
    },
    {
      id: "secondary-colors",
      name: "Secondary",
      type: "colors",
      items: [
        { id: "color-7", name: "Secondary 700", type: "color", color: "#B54708" },
        { id: "color-8", name: "Secondary 500", type: "color", color: "#FDB022" },
        { id: "color-9", name: "Secondary 900", type: "color", color: "#252B37" },
      ],
    },
    {
      id: "primary-logos",
      name: "Primary",
      type: "logos",
      items: [
        { id: "logo-1", name: "Logo 1", type: "logo", url: "" },
        { id: "logo-2", name: "Logo 2", type: "logo", url: "" },
        { id: "logo-3", name: "Logo 3", type: "logo", url: "" },
        { id: "logo-4", name: "Logo 4", type: "logo", url: "" },
      ],
    },
  ]);
  
  const [ungroupedItems, setUngroupedItems] = useState<BrandItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: any } | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderType, setNewFolderType] = useState<"colors" | "logos" | "textStyles">("colors");
  const [newFolderParentId, setNewFolderParentId] = useState<string | undefined>(undefined);
  const [newColor, setNewColor] = useState("#7F56D9");
  const [newColorName, setNewColorName] = useState("");
  const [newLogoName, setNewLogoName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dragHoldTimer, setDragHoldTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Add new folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: BrandFolder = {
      id: `${newFolderType}-${Date.now()}`,
      name: newFolderName,
      type: newFolderType,
      parentId: newFolderParentId,
      items: [],
    };
    
    setFolders(prev => [...prev, newFolder]);
    
    // If this is a subfolder, update parent folder reference
    if (newFolderParentId) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === newFolderParentId
            ? { 
                ...folder, 
                subfolders: [...(folder.subfolders || []), newFolder.id] 
              }
            : folder
        )
      );
    }
    
    setNewFolderName("");
    setNewFolderParentId(undefined);
    setIsAddingFolder(false);
  };

  // Add new color to folder
  const handleAddColor = () => {
    if (!selectedFolder || !newColorName.trim()) return;
    
    const newItem: BrandColor = { 
      id: `color-${Date.now()}`,
      name: newColorName,
      type: "color", 
      color: newColor 
    };
    
    setFolders(prev => 
      prev.map(folder => 
        folder.id === selectedFolder
          ? { ...folder, items: [...folder.items, newItem] }
          : folder
      )
    );
    
    setNewColor("#7F56D9");
    setNewColorName("");
  };

  // Add new logo
  const handleAddLogo = () => {
    if (!selectedFolder || !newLogoName.trim()) return;
    
    const newItem: BrandLogo = { 
      id: `logo-${Date.now()}`, 
      name: newLogoName,
      type: "logo", 
      url: "" 
    };
    
    setFolders(prev => 
      prev.map(folder => 
        folder.id === selectedFolder
          ? { ...folder, items: [...folder.items, newItem] }
          : folder
      )
    );
    
    setNewLogoName("");
  };

  // Delete folder
  const handleDeleteFolder = (folderId: string) => {
    // Check if folder has a parent
    const folder = folders.find(f => f.id === folderId);
    if (folder?.parentId) {
      // Remove folder from parent's subfolders
      setFolders(prev => 
        prev.map(f => 
          f.id === folder.parentId
            ? { 
                ...f, 
                subfolders: f.subfolders?.filter(id => id !== folderId) 
              }
            : f
        )
      );
    }
    
    // Remove folder and add its items to ungrouped
    const folderToDelete = folders.find(f => f.id === folderId);
    if (folderToDelete) {
      setUngroupedItems(prev => [...prev, ...folderToDelete.items]);
    }
    
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  // Delete item from folder or ungrouped
  const handleDeleteItem = (itemId: string, folderId?: string) => {
    if (folderId) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId
            ? { ...folder, items: folder.items.filter(item => item.id !== itemId) }
            : folder
        )
      );
    } else {
      setUngroupedItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Edit color
  const handleEditColor = (itemId: string, newColor: string, newName: string, folderId?: string) => {
    if (folderId) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId
            ? { 
                ...folder, 
                items: folder.items.map(item => 
                  item.id === itemId && item.type === "color"
                    ? { ...item, color: newColor, name: newName }
                    : item
                ) 
              }
            : folder
        )
      );
    } else {
      setUngroupedItems(prev => 
        prev.map(item => 
          item.id === itemId && item.type === "color"
            ? { ...item, color: newColor, name: newName }
            : item
        )
      );
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string, type: string) => {
    e.dataTransfer.setData("id", id);
    e.dataTransfer.setData("type", type);
    setDraggedItem({ id, type });
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetId: string, isFolder: boolean) => {
    e.preventDefault();
    
    if (isFolder) {
      setDragOverFolder(targetId);
      setDragOverItem(null);
    } else {
      setDragOverItem(targetId);
      
      // If dragging over another item for a set period, prepare to create a folder
      if (draggedItem && draggedItem.id !== targetId) {
        if (dragHoldTimer) clearTimeout(dragHoldTimer);
        
        const timer = setTimeout(() => {
          // Prepare to create a folder from these two items
          console.log("Ready to create folder from", draggedItem.id, "and", targetId);
        }, 800); // 800ms hold to create a folder
        
        setDragHoldTimer(timer);
      }
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverFolder(null);
    setDragOverItem(null);
    
    if (dragHoldTimer) {
      clearTimeout(dragHoldTimer);
      setDragHoldTimer(null);
    }
  };

  // Handle drop on folder
  const handleDropOnFolder = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData("id");
    const itemType = e.dataTransfer.getData("type");
    
    if (!itemId) return;
    
    // If dropping a folder into another folder (make it a subfolder)
    if (itemType === "folder") {
      // Can't drop folder into itself
      if (itemId === targetFolderId) return;
      
      // Update the folder's parentId
      setFolders(prev => 
        prev.map(folder => 
          folder.id === itemId
            ? { ...folder, parentId: targetFolderId }
            : folder
        )
      );
      
      // Add as subfolder to target
      setFolders(prev => 
        prev.map(folder => 
          folder.id === targetFolderId
            ? { 
                ...folder, 
                subfolders: [...(folder.subfolders || []), itemId] 
              }
            : folder
        )
      );
      
      setDraggedItem(null);
      setDragOverFolder(null);
      return;
    }
    
    // If dropping an item, find it and move it to the folder
    let foundItem: BrandItem | undefined;
    let sourceFolder: string | undefined;
    
    // Check if item is in a folder
    folders.forEach(folder => {
      const item = folder.items.find(item => item.id === itemId);
      if (item) {
        foundItem = item;
        sourceFolder = folder.id;
      }
    });
    
    // If not in a folder, check ungrouped items
    if (!foundItem) {
      foundItem = ungroupedItems.find(item => item.id === itemId);
    }
    
    if (!foundItem) return;
    
    // Remove item from source
    if (sourceFolder) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === sourceFolder
            ? { ...folder, items: folder.items.filter(item => item.id !== itemId) }
            : folder
        )
      );
    } else {
      setUngroupedItems(prev => prev.filter(item => item.id !== itemId));
    }
    
    // Add item to target folder
    setFolders(prev => 
      prev.map(folder => 
        folder.id === targetFolderId
          ? { ...folder, items: [...folder.items, foundItem!] }
          : folder
      )
    );
    
    setDraggedItem(null);
    setDragOverFolder(null);
  };

  // Handle drop on item (potentially create a new folder)
  const handleDropOnItem = (e: React.DragEvent, targetItemId: string, targetFolderId?: string) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData("id");
    
    if (!itemId || itemId === targetItemId) return;
    
    // Only create a folder if the drag hold was long enough
    if (dragHoldTimer) {
      // Create a new folder with both items
      const sourceItem = findItem(itemId);
      const targetItem = findItem(targetItemId);
      
      if (sourceItem && targetItem) {
        // Remove both items from their current locations
        removeItemFromSource(itemId);
        removeItemFromSource(targetItemId);
        
        // Create a new folder
        const newFolder: BrandFolder = {
          id: `folder-${Date.now()}`,
          name: "New Group",
          type: sourceItem.type === "color" || targetItem.type === "color" ? "colors" : 
                sourceItem.type === "logo" || targetItem.type === "logo" ? "logos" : "textStyles",
          items: [sourceItem, targetItem]
        };
        
        setFolders(prev => [...prev, newFolder]);
      }
    } else {
      // Normal drop - if dragging to an item in a folder, add to that folder
      if (targetFolderId) {
        // Find and move the dragged item
        const draggedItem = findItem(itemId);
        if (draggedItem) {
          removeItemFromSource(itemId);
          
          // Add to target folder
          setFolders(prev => 
            prev.map(folder => 
              folder.id === targetFolderId
                ? { ...folder, items: [...folder.items, draggedItem] }
                : folder
            )
          );
        }
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
    
    if (dragHoldTimer) {
      clearTimeout(dragHoldTimer);
      setDragHoldTimer(null);
    }
  };

  // Handle drop on ungrouped area
  const handleDropOnUngrouped = (e: React.DragEvent) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData("id");
    const itemType = e.dataTransfer.getData("type");
    
    if (!itemId) return;
    
    // If dropping a folder, move its items to ungrouped and delete folder
    if (itemType === "folder") {
      const folder = folders.find(f => f.id === itemId);
      if (folder) {
        setUngroupedItems(prev => [...prev, ...folder.items]);
        
        // Remove folder and update parent if needed
        if (folder.parentId) {
          setFolders(prev => 
            prev.map(f => 
              f.id === folder.parentId
                ? { 
                    ...f, 
                    subfolders: f.subfolders?.filter(id => id !== itemId) 
                  }
                : f
            )
          );
        }
        
        setFolders(prev => prev.filter(f => f.id !== itemId));
      }
    } else {
      // If dropping an item, move it to ungrouped
      const item = findItem(itemId);
      if (item) {
        removeItemFromSource(itemId);
        setUngroupedItems(prev => [...prev, item]);
      }
    }
    
    setDraggedItem(null);
  };

  // Helper functions to find and remove items
  const findItem = (itemId: string): BrandItem | undefined => {
    let foundItem: BrandItem | undefined;
    
    // Check in folders
    folders.forEach(folder => {
      const item = folder.items.find(item => item.id === itemId);
      if (item) foundItem = item;
    });
    
    // Check in ungrouped
    if (!foundItem) {
      foundItem = ungroupedItems.find(item => item.id === itemId);
    }
    
    return foundItem;
  };
  
  const removeItemFromSource = (itemId: string) => {
    // Remove from folders
    setFolders(prev => 
      prev.map(folder => ({
        ...folder,
        items: folder.items.filter(item => item.id !== itemId)
      }))
    );
    
    // Remove from ungrouped
    setUngroupedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Render color item
  const renderColorItem = (item: BrandColor, folderId?: string) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          key={item.id}
          className={`h-12 rounded-md relative group cursor-pointer ${
            dragOverItem === item.id ? "ring-2 ring-blue-400" : ""
          }`}
          style={{ backgroundColor: item.color }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ 
              x: e.clientX, 
              y: e.clientY, 
              item: { ...item, folderId } 
            });
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id, "item")}
          onDragOver={(e) => handleDragOver(e, item.id, false)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnItem(e, item.id, folderId)}
        >
          <div className="absolute bottom-1 left-1 text-xs bg-white/80 px-1 rounded">
            {item.name}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 bg-white/70 hover:bg-white"
              >
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  const newName = prompt("Enter new name:", item.name);
                  const newColorValue = prompt("Enter new color hex code:", item.color);
                  if (newName && newColorValue) {
                    handleEditColor(item.id, newColorValue, newName, folderId);
                  }
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteItem(item.id, folderId)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            const newName = prompt("Enter new name:", item.name);
            const newColorValue = prompt("Enter new color hex code:", item.color);
            if (newName && newColorValue) {
              handleEditColor(item.id, newColorValue, newName, folderId);
            }
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => handleDeleteItem(item.id, folderId)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  // Render logo item
  const renderLogoItem = (item: BrandLogo, folderId?: string) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          key={item.id}
          className={`h-12 rounded-md bg-gray-200 flex items-center justify-center relative group cursor-pointer ${
            dragOverItem === item.id ? "ring-2 ring-blue-400" : ""
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id, "item")}
          onDragOver={(e) => handleDragOver(e, item.id, false)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnItem(e, item.id, folderId)}
        >
          <Image className="h-6 w-6 text-gray-400" />
          <div className="absolute bottom-1 left-1 text-xs bg-white/80 px-1 rounded">
            {item.name}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 bg-white/70 hover:bg-white"
              >
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteItem(item.id, folderId)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => handleDeleteItem(item.id, folderId)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  // Render folder
  const renderFolder = (folder: BrandFolder) => {
    const isExpanded = true; // Replace with state if you want collapsible folders
    
    return (
      <div 
        key={folder.id}
        className={`border rounded-md mb-2 overflow-hidden ${
          dragOverFolder === folder.id ? "bg-blue-50 border-blue-300" : ""
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, folder.id, "folder")}
        onDragOver={(e) => handleDragOver(e, folder.id, true)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDropOnFolder(e, folder.id)}
      >
        <div className="flex items-center justify-between p-2 bg-gray-50">
          <div className="flex items-center">
            <Folder className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setNewFolderParentId(folder.id);
                    setIsAddingFolder(true);
                  }}
                >
                  <FolderPlus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Subfolder</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    if (folder.type === "colors") {
                      setNewColorName("");
                      setNewColor("#7F56D9");
                    } else if (folder.type === "logos") {
                      setNewLogoName("");
                    }
                  }}
                >
                  <Plus size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Item</TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-2">
            {/* Render subfolders if any */}
            {folder.subfolders && folder.subfolders.length > 0 && (
              <div className="pl-4 border-l border-gray-200 mb-2">
                {folder.subfolders.map(subfolderId => {
                  const subfolder = folders.find(f => f.id === subfolderId);
                  return subfolder ? renderFolder(subfolder) : null;
                })}
              </div>
            )}
            
            {/* Render items */}
            <div className="grid grid-cols-2 gap-2">
              {folder.items.map((item) => (
                item.type === "color" 
                  ? renderColorItem(item, folder.id)
                  : item.type === "logo"
                    ? renderLogoItem(item, folder.id)
                    : null
              ))}
              
              {folder.items.length === 0 && (
                <div className="col-span-2 text-sm text-gray-400 text-center py-2">
                  No items in this folder
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between p-2 relative rounded-md overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="inline-flex p-2 flex-[0_0_auto] bg-[#414651] rounded-lg items-center relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.53328 6.66666C5.44734 6.67135 5.36177 6.65218 5.28605 6.61128C5.21032 6.57037 5.14738 6.50932 5.10419 6.43487C5.061 6.36043 5.03924 6.27548 5.04131 6.18944C5.04339 6.1034 5.06922 6.0196 5.11594 5.94733L7.59994 1.99999C7.63898 1.92971 7.69551 1.87069 7.76405 1.82868C7.8326 1.78666 7.91084 1.76307 7.99118 1.76019C8.07153 1.7573 8.15126 1.77523 8.22264 1.81222C8.29402 1.84921 8.35464 1.90402 8.39861 1.97133L10.8666 5.93333C10.9153 6.00319 10.9439 6.08502 10.9493 6.16998C10.9548 6.25493 10.937 6.33976 10.8977 6.41529C10.8584 6.49082 10.7992 6.55417 10.7265 6.59848C10.6538 6.64278 10.5704 6.66636 10.4853 6.66666H5.53328Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M6 9.33329H2.66667C2.29848 9.33329 2 9.63177 2 9.99996V13.3333C2 13.7015 2.29848 14 2.66667 14H6C6.36819 14 6.66667 13.7015 6.66667 13.3333V9.99996C6.66667 9.63177 6.36819 9.33329 6 9.33329Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M11.6667 14C12.9553 14 14 12.9553 14 11.6666C14 10.378 12.9553 9.33329 11.6667 9.33329C10.378 9.33329 9.33333 10.378 9.33333 11.6666C9.33333 12.9553 10.378 14 11.6667 14Z" stroke="#FDFDFD" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>

            <div className="flex flex-col items-start gap-0.5 relative flex-1 grow">
              <div className="relative self-stretch mt-[-1px] text-[#414651] text-sm font-semibold leading-none overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                Nome do cliente
              </div>
              <div className="relative self-stretch text-[#414651] text-xs font-normal leading-4 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                Nome da campanha
              </div>
            </div>
          </div>

          {/* Add button for brand items */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-gray-100"
                  onClick={() => setIsAddingFolder(true)}
                >
                  <Plus size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar nova pasta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Separator className="w-full" />

      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="p-4 space-y-4">
          {/* Add Folder Dialog */}
          <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Pasta</DialogTitle>
                <DialogDescription>
                  Crie uma nova pasta para organizar suas cores ou logos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome da Pasta
                  </label>
                  <Input
                    id="name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="ex: Primárias, Secundárias, etc."
                    className="col-span-3"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Tipo de Pasta
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={newFolderType === "colors" ? "default" : "outline"}
                      onClick={() => setNewFolderType("colors")}
                      className="flex gap-2"
                    >
                      <Palette size={16} /> Cores
                    </Button>
                    <Button
                      type="button"
                      variant={newFolderType === "logos" ? "default" : "outline"}
                      onClick={() => setNewFolderType("logos")}
                      className="flex gap-2"
                    >
                      <Image size={16} /> Logos
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingFolder(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddFolder}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Color Dialog */}
          <Dialog open={Boolean(selectedFolder) && folders.find(f => f.id === selectedFolder)?.type === "colors"}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Cor</DialogTitle>
                <DialogDescription>
                  Escolha uma cor para adicionar à pasta selecionada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="colorName" className="text-sm font-medium">
                    Nome da Cor
                  </label>
                  <Input
                    id="colorName"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Primary 500"
                    className="col-span-3"
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded" style={{ backgroundColor: newColor }}></div>
                  <div className="flex-1">
                    <HexColorPicker color={newColor} onChange={setNewColor} />
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="#000000"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedFolder(null)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddColor}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Logo Dialog */}
          <Dialog open={Boolean(selectedFolder) && folders.find(f => f.id === selectedFolder)?.type === "logos"}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Logo</DialogTitle>
                <DialogDescription>
                  Faça upload de uma imagem para adicionar à pasta selecionada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="logoName" className="text-sm font-medium">
                    Nome do Logo
                  </label>
                  <Input
                    id="logoName"
                    value={newLogoName}
                    onChange={(e) => setNewLogoName(e.target.value)}
                    placeholder="Logo Principal"
                    className="col-span-3"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Imagem
                  </label>
                  <div className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-gray-50">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-500">
                      Clique para fazer upload ou arraste e solte
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedFolder(null)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddLogo}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Folders Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Brand Assets</h3>
            
            {/* Render folders */}
            {folders.filter(folder => !folder.parentId).map(renderFolder)}

            {/* Ungrouped items section */}
            <div 
              className={`border rounded-md p-3 ${dragOverFolder === "ungrouped" ? "bg-blue-50 border-blue-300" : "bg-gray-50"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverFolder("ungrouped");
              }}
              onDragLeave={handleDragLeave}
              onDrop={handleDropOnUngrouped}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Items not in folders</h4>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {ungroupedItems.map((item) => (
                  item.type === "color" 
                    ? renderColorItem(item)
                    : item.type === "logo"
                      ? renderLogoItem(item)
                      : null
                ))}
                
                {ungroupedItems.length === 0 && (
                  <div className="col-span-2 text-sm text-gray-400 text-center py-2">
                    Drag items here to ungroup them
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
