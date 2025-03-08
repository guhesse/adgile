
import {
  Box,
  Crown,
  Hourglass,
  Image as ImageIcon,
  Layers2,
  LayoutTemplate,
  Maximize,
  MousePointer,
  PictureInPicture2,
  Play,
  Plus,
  Shapes,
  Type as TypeIcon,
} from "lucide-react";
import React, { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ElementsPanel } from "./ElementsPanel";
import { LayersPanel } from "./LayersPanel";
import { BrandPanel } from "./panels/BrandPanel";
import { useCanvas } from "./CanvasContext";
import { EditorElement } from "./types";

// Navigation menu items data
const navItems = [
  { icon: <Crown className="w-4 h-4" />, label: "Brand", id: "brand" },
  { icon: <LayoutTemplate className="w-4 h-4" />, label: "Templates", id: "templates" },
  { icon: <Layers2 className="w-4 h-4" />, label: "Layers", id: "layers" },
  { icon: <PictureInPicture2 className="w-4 h-4" />, label: "Slides", id: "slides" },
  { icon: <Play className="w-4 h-4" />, label: "Animator", id: "animator" },
  { icon: <Maximize className="w-4 h-4" />, label: "Sizes", id: "sizes" },
];

// Timeline item at the bottom
const timelineItem = {
  icon: <Hourglass className="w-4 h-4" />,
  label: "Timeline",
  id: "timeline"
};

// Component icons mapping
const componentIcons = {
  Container: <Box className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  Text: <TypeIcon className="w-4 h-4" />,
  Button: <MousePointer className="w-4 h-4" />,
};

export const LeftSidebar = () => {
  const [activePanel, setActivePanel] = useState<string>("elements"); // Default to elements panel
  const { 
    elements,
    selectedElement, 
    setSelectedElement,
    removeElement, 
    handleAddElement,
    handleAddLayout
  } = useCanvas();

  // Group elements by size for the layers view
  const groupedElements = elements.reduce((acc, element) => {
    const size = element.type === "layout" ? "Containers" : "Elements";
    if (!acc[size]) {
      acc[size] = [];
    }
    acc[size].push(element);
    return acc;
  }, {} as Record<string, EditorElement[]>);

  const renderPanel = () => {
    switch (activePanel) {
      case "brand":
        return <BrandPanel />;
      case "layers":
        return (
          <LayersPanel
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            removeElement={removeElement}
          />
        );
      case "elements":
      default:
        return (
          <ElementsPanel
            addElement={handleAddElement}
            addLayout={handleAddLayout}
          />
        );
    }
  };

  return (
    <div className="inline-flex items-center relative">
      {/* Primary sidebar with navigation icons */}
      <div className="flex flex-col w-24 items-center px-0 py-4 relative self-stretch bg-neutral-100 h-full">
        <div className="flex flex-col items-center relative self-stretch w-full flex-1">
          {/* Add button at the top */}
          <div className="flex flex-col w-24 h-[90px] items-center justify-center gap-1.5 relative">
            <div className="inline-flex flex-col items-center justify-center gap-1.5 relative flex-[0_0_auto]">
              <Button
                className="w-8 h-8 p-0 bg-[#53389e] rounded-md"
                onClick={() => setActivePanel("elements")}
              >
                <Plus className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>

          {/* Navigation menu items */}
          {navItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col w-24 h-20 items-center justify-center gap-1.5 relative"
            >
              <Button
                variant="outline"
                className={`w-8 h-8 p-1.5 ${activePanel === item.id ? 'bg-purple-100 text-purple-600' : 'bg-[#252b37] text-white'} rounded-md`}
                onClick={() => setActivePanel(item.id)}
              >
                {item.icon}
              </Button>
              <span className="text-xs text-[#181d27] leading-5">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline item at the bottom */}
        <div className="flex flex-col items-center justify-end gap-2.5 relative self-stretch w-full mt-auto">
          <div className="flex flex-col w-24 h-[67px] items-center justify-center gap-1.5 relative">
            <Button
              variant="outline"
              className={`w-8 h-8 p-1.5 ${activePanel === timelineItem.id ? 'bg-purple-100 text-purple-600' : 'bg-[#252b37] text-white'} rounded-md`}
              onClick={() => setActivePanel(timelineItem.id)}
            >
              {timelineItem.icon}
            </Button>
            <span className="text-xs text-[#181d27] leading-5">
              {timelineItem.label}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary sidebar with content based on active panel */}
      <Card className="flex flex-col w-[263px] items-center gap-2 py-2 relative self-stretch mt-[-1px] mb-[-1px] mr-[-1px] bg-[#fdfdfd] border border-solid border-[#d5d7da] rounded-none h-full">
        {renderPanel()}
      </Card>
    </div>
  );
};
