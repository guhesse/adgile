import { Button } from "@/components/ui/button";
import { EditorElement, EditorMode } from "./types";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronDown,
  Type as TextIcon,
  Image as ImageIcon,
  Square,
  Layers as LayersIcon,
  LayoutGrid,
  DivideIcon,
  AlignVerticalSpaceBetween,
  Pentagon,
  ListVideo,
  Grid2X2
} from "lucide-react";

interface ElementsPanelProps {
  addElement: (type: EditorElement["type"]) => void;
  addLayout: (template: any) => void;
  editorMode?: EditorMode; // Adicionado editorMode como propriedade opcional
}

export const ElementsPanel = ({ addElement, addLayout, editorMode = "email" }: ElementsPanelProps) => {
  const [activeContainer, setActiveContainer] = useState<string | null>(null);
  const [draggedElementType, setDraggedElementType] = useState<string | null>(null);

  // Function to handle element drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: EditorElement["type"]) => {
    e.dataTransfer.setData("elementType", type);
    setDraggedElementType(type);

    // Set drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'py-2 px-4 bg-purple-100 text-purple-800 rounded-sm border border-purple-300';
    dragImage.textContent = getElementTypeName(type);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 25, 25);

    // Make sure to remove the element afterward
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Get element type name for display
  const getElementTypeName = (type: string): string => {
    switch (type) {
      case 'text': return 'Texto';
      case 'image': return 'Imagem';
      case 'button': return 'Botão';
      case 'container': return 'Container';
      case 'divider': return 'Divisor';
      case 'spacer': return 'Espaçador';
      case 'logo': return 'Logotipo';
      case 'video': return 'Vídeo';
      case 'paragraph': return 'Parágrafo';
      default: return type;
    }
  };

  // Handle adding element via click
  const handleAddElement = (type: EditorElement["type"]) => {
    if (!activeContainer) {
      // Adiciona elemento solto (não é o ideal, mas vamos manter para compatibilidade)
      addElement(type);
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

  // Adiciona layout predefinido
  const handleAddPresetLayout = (presetId: string) => {
    addLayout({
      id: presetId,
      name: presetId === "preset-image-text" ? "Imagem e texto" : "Texto e texto",
      columns: 2,
      preview: presetId === "preset-image-text" ? "IT" : "TT",
      type: "preset"
    });
  };

  // Element card component
  const ElementCard = ({ type, icon, label, disabled = false }: { type: EditorElement["type"], icon: JSX.Element, label: string, disabled?: boolean }) => (
    <div
      className={`flex flex-col items-center justify-center p-3 border rounded-md bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab hover:border-purple-400 hover:shadow-sm transition-all'}`}
      style={{ width: '102px', minHeight: '80px' }}
      draggable={!disabled}
      onDragStart={(e) => !disabled && handleDragStart(e, type)}
      onClick={() => !disabled && handleAddElement(type)}
    >
      <div className="mb-2">
        {icon}
      </div>
      <div className="text-xs text-center">{label}</div>

      {/* Dots for drag handle visual */}
      <div className="flex justify-center mt-2">
        <svg width="23" height="15" viewBox="0 0 23 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
          <path d="M8.25 8.0422C8.80228 8.0422 9.25 7.59448 9.25 7.0422C9.25 6.48991 8.80228 6.0422 8.25 6.0422C7.69772 6.0422 7.25 6.48991 7.25 7.0422C7.25 7.59448 7.69772 8.0422 8.25 8.0422Z" fill="#717680"></path>
          <path d="M15.25 8.0422C15.8023 8.0422 16.25 7.59448 16.25 7.0422C16.25 6.48991 15.8023 6.0422 15.25 6.0422C14.6977 6.0422 14.25 6.48991 14.25 7.0422C14.25 7.59448 14.6977 8.0422 15.25 8.0422Z" fill="#717680"></path>
          <path d="M1.25 8.0422C1.80228 8.0422 2.25 7.59448 2.25 7.0422C2.25 6.48991 1.80228 6.0422 1.25 6.0422C0.697715 6.0422 0.25 6.48991 0.25 7.0422C0.25 7.59448 0.697715 8.0422 1.25 8.0422Z" fill="#717680"></path>
          <path d="M21.75 8C22.3023 8 22.75 7.55228 22.75 7C22.75 6.44772 22.3023 6 21.75 6C21.1977 6 20.75 6.44772 20.75 7C20.75 7.55228 21.1977 8 21.75 8Z" fill="#717680"></path>
          <path d="M8.25 14.0844C8.80228 14.0844 9.25 13.6367 9.25 13.0844C9.25 12.5321 8.80228 12.0844 8.25 12.0844C7.69772 12.0844 7.25 12.5321 7.25 13.0844C7.25 13.6367 7.69772 14.0844 8.25 14.0844Z" fill="#717680"></path>
          <path d="M15.25 14.0844C15.8023 14.0844 16.25 13.6367 16.25 13.0844C16.25 12.5321 15.8023 12.0844 15.25 12.0844C14.6977 12.0844 14.25 12.5321 14.25 13.0844C14.25 13.6367 14.6977 14.0844 15.25 14.0844Z" fill="#717680"></path>
          <path d="M1.25 14.0844C1.80228 14.0844 2.25 13.6367 2.25 13.0844C2.25 12.5321 1.80228 12.0844 1.25 12.0844C0.697715 12.0844 0.25 12.5321 0.25 13.0844C0.25 13.6367 0.697715 14.0844 1.25 14.0844Z" fill="#717680"></path>
          <path d="M21.75 14.0422C22.3023 14.0422 22.75 13.5945 22.75 13.0422C22.75 12.49 22.3023 12.0422 21.75 12.0422C21.1977 12.0422 20.75 12.49 20.75 13.0422C20.75 13.5945 21.1977 14.0422 21.75 14.0422Z" fill="#717680"></path>
        </svg>
      </div>
    </div>
  );

  // Renderiza apenas os elementos básicos (para modos não-email)
  const renderBasicElements = () => (
    <div className="p-4">
      <div className="text-lg font-medium mb-4">Elementos</div>
      <div className="grid grid-cols-2 gap-2 p-2">
        <ElementCard
          type="text"
          icon={<TextIcon size={24} className="text-gray-700" />}
          label="Texto"
        />

        <ElementCard
          type="paragraph"
          icon={<svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 6.1001H3.5M21.5 12.1001H3.5M15.6 18H3.5" stroke="#414651" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
          label="Parágrafo"
        />

        <ElementCard
          type="button"
          icon={<Square size={24} className="text-gray-700" />}
          label="Botão"
        />

        <ElementCard
          type="image"
          icon={<ImageIcon size={24} className="text-gray-700" />}
          label="Imagem"
        />

        <ElementCard
          type="logo"
          icon={<Pentagon size={24} className="text-gray-700" />}
          label="Logotipo"
        />

        <ElementCard
          type="video"
          icon={<ListVideo size={24} className="text-gray-700" />}
          label="Vídeo"
        />
      </div>
    </div>
  );

  // Renderiza o painel completo com accordions (para o modo email)
  const renderEmailElements = () => (
    <div className="p-4">
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
              onClick={() => handleAddContainer(4)}
            >
              4 Colunas iguais
              <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">4</div>
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="presets">
          <AccordionTrigger className="py-2 text-left text-sm font-medium">
            <div className="flex items-center">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Layouts predefinidos
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => handleAddPresetLayout("preset-image-text")}
            >
              Imagem e texto
              <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">IT</div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => handleAddPresetLayout("preset-text-text")}
            >
              Texto e texto
              <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">TT</div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              disabled
            >
              Cabeçalho
              <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">H</div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between"
              disabled
            >
              Rodapé
              <div className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">F</div>
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="elements" defaultValue="elements">
          <AccordionTrigger className="py-2 text-left text-sm font-medium">
            <div className="flex items-center">
              <LayersIcon className="h-4 w-4 mr-2" />
              Elementos
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="grid grid-cols-2 gap-2 p-2">
              <ElementCard
                type="text"
                icon={<TextIcon size={24} className="text-gray-700" />}
                label="Texto"
              />

              <ElementCard
                type="paragraph"
                icon={<svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 6.1001H3.5M21.5 12.1001H3.5M15.6 18H3.5" stroke="#414651" strokeLinecap="round" strokeLinejoin="round" />
                </svg>}
                label="Parágrafo"
              />

              <ElementCard
                type="button"
                icon={<Square size={24} className="text-gray-700" />}
                label="Botão"
              />

              <ElementCard
                type="divider"
                icon={<DivideIcon size={24} className="text-gray-700" />}
                label="Divisor"
              />

              <ElementCard
                type="spacer"
                icon={<AlignVerticalSpaceBetween size={24} className="text-gray-700" />}
                label="Espaçador"
              />

              <ElementCard
                type="image"
                icon={<ImageIcon size={24} className="text-gray-700" />}
                label="Imagem"
              />

              <ElementCard
                type="logo"
                icon={<Pentagon size={24} className="text-gray-700" />}
                label="Logotipo"
              />

              <ElementCard
                type="video"
                icon={<ListVideo size={24} className="text-gray-700" />}
                label="Vídeo"
              />

              <ElementCard
                type="container"
                icon={<Grid2X2 size={24} className="text-gray-700" />}
                label="Container"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      {editorMode === "email" ? renderEmailElements() : renderBasicElements()}
    </div>
  );
};
