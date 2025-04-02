import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCanvas } from "@/components/editor/CanvasContext";
import { useSaveLayout } from "@/components/editor/hooks/useSaveLayout";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface SaveLayoutDialogProps {
  onSaveComplete?: (layoutId: number) => void;
  children?: React.ReactNode;
}

export const SaveLayoutDialog = ({
  onSaveComplete,
  children
}: SaveLayoutDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [saveAllFormats, setSaveAllFormats] = useState(false);
  
  const { selectedSize, canvasSizes } = useCanvas();
  const { saveCanvasAsLayout, saveMultipleFormats, isSaving } = useSaveLayout();
  
  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Aqui você implementaria a chamada real à sua API
        // Por enquanto, vamos usar dados de exemplo
        const exampleCategories = [
          { id: 1, name: "Redes Sociais" },
          { id: 2, name: "Banners" },
          { id: 3, name: "Email Marketing" },
          { id: 4, name: "Anúncios" }
        ];
        setCategories(exampleCategories);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    
    if (open) {
      fetchCategories();
    }
  }, [open]);
  
  const handleSave = async () => {
    if (!name.trim()) {
      // toast.error("Por favor, informe um nome para o layout");
      return;
    }
    
    try {
      if (saveAllFormats && canvasSizes.length > 1) {
        // Salvar todos os formatos como layouts separados
        const results = await saveMultipleFormats({
          name,
          description,
          categoryId: categoryId ? parseInt(categoryId) : undefined
        });
        
        if (results.length > 0 && onSaveComplete) {
          onSaveComplete(results[0].id);
        }
      } else {
        // Salvar apenas o formato atual
        const result = await saveCanvasAsLayout({
          name,
          description,
          categoryId: categoryId ? parseInt(categoryId) : undefined
        });
        
        if (result && onSaveComplete) {
          onSaveComplete(result.id);
        }
      }
      
      // Limpar e fechar o diálogo
      setName("");
      setDescription("");
      setCategoryId("");
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Layout
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Salvar Layout
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Layout</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Banner Promocional de Verão"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes ou instruções sobre este layout"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {canvasSizes.length > 1 && (
            <>
              <Separator />
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="save-all-formats"
                  checked={saveAllFormats}
                  onCheckedChange={setSaveAllFormats}
                />
                <div>
                  <Label htmlFor="save-all-formats" className="cursor-pointer">
                    Salvar todos os {canvasSizes.length} formatos
                  </Label>
                  <p className="text-xs text-gray-500">
                    Isso criará um layout separado para cada formato na sua biblioteca
                  </p>
                </div>
              </div>
              
              {!saveAllFormats && selectedSize && (
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  Salvando apenas o formato atual: {selectedSize.name} ({selectedSize.width}×{selectedSize.height})
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar Layout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
