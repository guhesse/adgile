
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";

interface ElementsPanelProps {
  addElement: (type: EditorElement["type"]) => void;
}

export const ElementsPanel = ({ addElement }: ElementsPanelProps) => {
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
