
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";
import { useState } from "react";
import { LayoutsPanel } from "./panels/LayoutsPanel";
import { LayoutTemplate } from "./types";

interface ElementsPanelProps {
  addElement: (type: EditorElement["type"]) => void;
  addLayout: (template: LayoutTemplate) => void;
}

export const ElementsPanel = ({ addElement, addLayout }: ElementsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"elements" | "layouts">("elements");

  if (activeTab === "layouts") {
    return (
      <>
        <div className="border-b p-4 flex justify-between items-center">
          <div className="text-lg font-medium">Layouts</div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("elements")}>
            Voltar
          </Button>
        </div>
        <LayoutsPanel addLayout={addLayout} />
      </>
    );
  }

  return (
    <>
      <div className="border-b p-4">
        <div className="text-lg font-medium">Elements</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start" onClick={() => addElement("text")}>
            <span className="mr-2">T</span> Text
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => addElement("image")}>
            <span className="mr-2">I</span> Image
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => addElement("button")}>
            <span className="mr-2">B</span> Button
          </Button>
          <Button variant="outline" className="justify-start" disabled>
            <span className="mr-2">D</span> Divider
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-lg font-medium">Templates</div>
        <div className="mt-2 space-y-2">
          <Button 
            variant="outline" 
            className="w-full h-16 flex items-center justify-center"
            onClick={() => setActiveTab("layouts")}
          >
            Ver layouts pré-definidos
          </Button>
          <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            Template 1
          </div>
          <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            Template 2
          </div>
        </div>
      </div>
    </>
  );
};
