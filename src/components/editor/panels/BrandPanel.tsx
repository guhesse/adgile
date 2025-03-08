
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Box,
  Image,
  Layout,
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit,
  Upload,
  Palette
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type definitions
type BrandColor = {
  id: string;
  color: string;
};

type BrandLogo = {
  id: string;
  url: string;
  name: string;
};

type BrandFolder = {
  id: string;
  name: string;
  items: (BrandColor | BrandLogo)[];
  type: "colors" | "logos";
};

// Initial state with dummy data
const initialFolders: Record<string, BrandFolder[]> = {
  colors: [
    {
      id: "primary-colors",
      name: "Primary",
      type: "colors",
      items: [
        { id: "color-1", color: "#2C1C5F" },
        { id: "color-2", color: "#42307D" },
        { id: "color-3", color: "#53389E" },
        { id: "color-4", color: "#7F56D9" },
        { id: "color-5", color: "#B692F6" },
        { id: "color-6", color: "#E9D7FE" },
      ],
    },
    {
      id: "secondary-colors",
      name: "Secondary",
      type: "colors",
      items: [
        { id: "color-7", color: "#B54708" },
        { id: "color-8", color: "#FDB022" },
        { id: "color-9", color: "#252B37" },
      ],
    },
  ],
  logos: [
    {
      id: "primary-logos",
      name: "Primary",
      type: "logos",
      items: [
        { id: "logo-1", url: "", name: "Logo 1" },
        { id: "logo-2", url: "", name: "Logo 2" },
        { id: "logo-3", url: "", name: "Logo 3" },
        { id: "logo-4", url: "", name: "Logo 4" },
      ],
    },
  ],
};

export const BrandPanel = () => {
  const [folders, setFolders] = useState<Record<string, BrandFolder[]>>(initialFolders);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: any } | null>(null);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [isAddingLogo, setIsAddingLogo] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newColor, setNewColor] = useState("#7F56D9");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderType, setNewFolderType] = useState<"colors" | "logos">("colors");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Add new color
  const handleAddColor = (folderId: string) => {
    const category = "colors";
    setFolders((prev) => {
      const newFolders = { ...prev };
      const folderIndex = newFolders[category].findIndex((f) => f.id === folderId);
      
      if (folderIndex !== -1) {
        const newItem = { id: `color-${Date.now()}`, color: newColor };
        newFolders[category][folderIndex].items.push(newItem);
      }
      
      return newFolders;
    });
    setIsAddingColor(false);
  };

  // Add new logo (placeholder functionality)
  const handleAddLogo = (folderId: string) => {
    const category = "logos";
    setFolders((prev) => {
      const newFolders = { ...prev };
      const folderIndex = newFolders[category].findIndex((f) => f.id === folderId);
      
      if (folderIndex !== -1) {
        const newItem = { id: `logo-${Date.now()}`, url: "", name: `Logo ${Date.now()}` };
        newFolders[category][folderIndex].items.push(newItem);
      }
      
      return newFolders;
    });
    setIsAddingLogo(false);
  };

  // Add new folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    
    setFolders((prev) => {
      const newFolders = { ...prev };
      const newFolder: BrandFolder = {
        id: `${newFolderType}-${Date.now()}`,
        name: newFolderName,
        type: newFolderType,
        items: [],
      };
      
      newFolders[newFolderType] = [...newFolders[newFolderType], newFolder];
      return newFolders;
    });
    
    setNewFolderName("");
    setIsAddingFolder(false);
  };

  // Delete item
  const handleDeleteItem = (category: "colors" | "logos", folderId: string, itemId: string) => {
    setFolders((prev) => {
      const newFolders = { ...prev };
      const folderIndex = newFolders[category].findIndex((f) => f.id === folderId);
      
      if (folderIndex !== -1) {
        newFolders[category][folderIndex].items = newFolders[category][folderIndex].items.filter(
          (item) => item.id !== itemId
        );
      }
      
      return newFolders;
    });
    setContextMenu(null);
  };

  // Edit color
  const handleEditColor = (folderId: string, itemId: string, newColor: string) => {
    setFolders((prev) => {
      const newFolders = { ...prev };
      const folderIndex = newFolders.colors.findIndex((f) => f.id === folderId);
      
      if (folderIndex !== -1) {
        const itemIndex = newFolders.colors[folderIndex].items.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          (newFolders.colors[folderIndex].items[itemIndex] as BrandColor).color = newColor;
        }
      }
      
      return newFolders;
    });
    setContextMenu(null);
  };

  // Render Brand Panel
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
          <Dialog open={isAddingColor} onOpenChange={setIsAddingColor}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Cor</DialogTitle>
                <DialogDescription>
                  Escolha uma cor para adicionar à pasta selecionada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer"
                  />
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingColor(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => selectedFolder && handleAddColor(selectedFolder)}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Logo Dialog */}
          <Dialog open={isAddingLogo} onOpenChange={setIsAddingLogo}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Logo</DialogTitle>
                <DialogDescription>
                  Faça upload de uma imagem para adicionar à pasta selecionada.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                <Button type="button" variant="outline" onClick={() => setIsAddingLogo(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => selectedFolder && handleAddLogo(selectedFolder)}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Colors Section */}
          <Accordion type="single" collapsible defaultValue="colors" className="w-full">
            <AccordionItem value="colors" className="border-0">
              <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <span className="text-sm">Colors</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="ml-4 border-l pl-2">
                  {folders.colors.map((folder) => (
                    <AccordionItem key={folder.id} value={folder.id} className="border-0">
                      <AccordionTrigger className="py-1 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                        <div className="flex items-center gap-2 w-full">
                          <Layout className="h-4 w-4" />
                          <span className="text-sm flex-1">{folder.name}</span>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100 hover:bg-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFolder(folder.id);
                                    setIsAddingColor(true);
                                  }}
                                >
                                  <Plus size={12} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adicionar nova cor</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 p-2">
                          {folder.items.map((item) => (
                            <div
                              key={(item as BrandColor).id}
                              className="h-12 rounded-md relative group"
                              style={{ backgroundColor: (item as BrandColor).color }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({ 
                                  x: e.clientX, 
                                  y: e.clientY, 
                                  item: { ...item, folderId: folder.id } 
                                });
                              }}
                            >
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
                                      // Open color picker dialog for editing
                                      setNewColor((item as BrandColor).color);
                                      setContextMenu(null);
                                      
                                      // This would ideally open an edit dialog
                                      const newColor = prompt("Enter new color hex code:", (item as BrandColor).color);
                                      if (newColor) {
                                        handleEditColor(folder.id, (item as BrandColor).id, newColor);
                                      }
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteItem("colors", folder.id, (item as BrandColor).id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Logos Section */}
          <Accordion type="single" collapsible defaultValue="logos" className="w-full">
            <AccordionItem value="logos" className="border-0">
              <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  <span className="text-sm">Logos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="ml-4 border-l pl-2">
                  {folders.logos.map((folder) => (
                    <AccordionItem key={folder.id} value={folder.id} className="border-0">
                      <AccordionTrigger className="py-1 px-3 hover:no-underline hover:bg-gray-100 rounded-md">
                        <div className="flex items-center gap-2 w-full">
                          <Layout className="h-4 w-4" />
                          <span className="text-sm flex-1">{folder.name}</span>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100 hover:bg-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFolder(folder.id);
                                    setIsAddingLogo(true);
                                  }}
                                >
                                  <Plus size={12} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Adicionar novo logo</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 p-2">
                          {folder.items.map((item) => (
                            <div
                              key={(item as BrandLogo).id}
                              className="h-12 rounded-md bg-gray-200 flex items-center justify-center relative group"
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({ 
                                  x: e.clientX, 
                                  y: e.clientY, 
                                  item: { ...item, folderId: folder.id } 
                                });
                              }}
                            >
                              <Image className="h-6 w-6 text-gray-400" />
                              
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
                                      // This would ideally open an edit dialog
                                      setContextMenu(null);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteItem("logos", folder.id, (item as BrandLogo).id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};
