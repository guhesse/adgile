
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ChevronDown,
  TextIcon,
  ImageIcon,
  Square,
  Layers as LayersIcon,
  LayoutGrid
} from "lucide-react";

interface ElementsPanelProps {
  addElement: (type: EditorElement["type"]) => void;
  addLayout: (template: any) => void;
}

export const ElementsPanel = ({ addElement, addLayout }: ElementsPanelProps) => {
  const [activeContainer, setActiveContainer] = useState<string | null>(null);

  // Simula um container selecionado para adicionar elementos
  const handleAddElement = (type: EditorElement["type"]) => {
    if (!activeContainer) {
      // Necessário ter um container primeiro
      alert("Por favor, selecione um container primeiro");
      return;
    }
    
    addElement(type);
  };

  // Adiciona um novo container (layout)
  const handleAddContainer = (columns: number) => {
    // Simula adição de um container e seleciona-o
    const containerId = `container-${Date.now()}`;
    addLayout({
      id: containerId,
      name: "Container",
      columns: columns,
      preview: `${columns}`,
      type: "blank"
    });
    setActiveContainer(containerId);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b p-4">
        <div className="text-lg font-medium mb-4">Elementos</div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="containers">
            <AccordionTrigger className="py-2 text-left text-sm font-medium">
              <div className="flex items-center">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Containers
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handleAddContainer(1)}
              >
                1 Coluna
                <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">1</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handleAddContainer(2)}
              >
                2 Colunas iguais
                <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">2</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handleAddContainer(3)}
              >
                3 Colunas iguais
                <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">3</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handleAddContainer(2)}
              >
                Coluna esquerda menor
                <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">2E</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => handleAddContainer(2)}
              >
                Coluna direita menor
                <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">2D</div>
              </Button>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="elements">
            <AccordionTrigger className="py-2 text-left text-sm font-medium">
              <div className="flex items-center">
                <LayersIcon className="h-4 w-4 mr-2" />
                Elementos
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => handleAddElement("text")}
              >
                <TextIcon className="h-4 w-4 mr-2" />
                Texto
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => handleAddElement("image")}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Imagem
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => handleAddElement("button")}
              >
                <Square className="h-4 w-4 mr-2" />
                Botão
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                disabled
              >
                <div className="h-4 w-4 mr-2 border-t-2 border-gray-500" />
                Divisor
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
