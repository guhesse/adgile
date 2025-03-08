
import React, { useState } from "react";
import { useCanvas } from "../CanvasContext";
import { BANNER_SIZES, BannerSize } from "../types";
import { Square, ChevronRight, CheckSquare, FolderPlus, Link2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const SizesPanel = () => {
  const { selectedSize, setSelectedSize } = useCanvas();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, boolean>>({
    [selectedSize.name]: true
  });
  
  // Group banner sizes by category
  const groupedSizes = {
    "Social Media": BANNER_SIZES.filter(size => 
      size.name.includes("Facebook") || 
      size.name.includes("Instagram") || 
      size.name.includes("Twitter") || 
      size.name.includes("LinkedIn")
    ),
    "Email": BANNER_SIZES.filter(size => size.name.includes("Email")),
    "Ads": BANNER_SIZES.filter(size => 
      !size.name.includes("Email") && 
      !size.name.includes("Facebook") && 
      !size.name.includes("Instagram") && 
      !size.name.includes("Twitter") && 
      !size.name.includes("LinkedIn")
    )
  };

  const handleToggleSize = (size: BannerSize) => {
    setSelectedSizes({
      ...selectedSizes,
      [size.name]: !selectedSizes[size.name]
    });
    
    // If we're enabling this size and no sizes are currently selected, make it the primary size
    if (!selectedSizes[size.name] && Object.values(selectedSizes).filter(v => v).length === 0) {
      setSelectedSize(size);
    }
    // If we're disabling the current primary size, choose a new primary size
    else if (selectedSizes[size.name] && size.name === selectedSize.name) {
      const nextSelectedSize = Object.entries(selectedSizes).find(([name, isSelected]) => 
        name !== size.name && isSelected
      );
      
      if (nextSelectedSize) {
        const newSize = BANNER_SIZES.find(s => s.name === nextSelectedSize[0]);
        if (newSize) {
          setSelectedSize(newSize);
        }
      }
    }
  };

  const handlePrimarySize = (size: BannerSize) => {
    setSelectedSize(size);
    // Ensure this size is also selected
    if (!selectedSizes[size.name]) {
      setSelectedSizes({
        ...selectedSizes,
        [size.name]: true
      });
    }
  };

  const selectAllInCategory = (category: string) => {
    const newSelectedSizes = { ...selectedSizes };
    groupedSizes[category].forEach(size => {
      newSelectedSizes[size.name] = true;
    });
    setSelectedSizes(newSelectedSizes);
  };

  const deselectAllInCategory = (category: string) => {
    const newSelectedSizes = { ...selectedSizes };
    groupedSizes[category].forEach(size => {
      newSelectedSizes[size.name] = false;
    });
    setSelectedSizes(newSelectedSizes);
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categorySelectedCount = groupedSizes[category].filter(size => selectedSizes[size.name]).length;
    return categorySelectedCount > 0 && categorySelectedCount < groupedSizes[category].length;
  };

  const isCategoryFullySelected = (category: string) => {
    return groupedSizes[category].every(size => selectedSizes[size.name]);
  };

  const handleToggleCategory = (category: string) => {
    if (isCategoryFullySelected(category)) {
      deselectAllInCategory(category);
    } else {
      selectAllInCategory(category);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">Banner Sizes</div>
      </div>

      {/* Size content */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full" defaultValue={["Social Media", "Email", "Ads"]}>
          {Object.entries(groupedSizes).map(([category, sizes]) => (
            <AccordionItem key={category} value={category} className="border-b">
              <AccordionTrigger className="px-4 py-2 text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id={`category-${category}`}
                    checked={isCategoryFullySelected(category)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategory(category);
                    }}
                    className={isCategoryPartiallySelected(category) ? "opacity-50" : ""}
                  />
                  <label 
                    htmlFor={`category-${category}`}
                    className="text-xs font-medium text-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category}
                  </label>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-2">
                <div className="space-y-1 pl-6">
                  {sizes.map((size) => (
                    <div
                      key={size.name}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                        selectedSize.name === size.name ? "bg-purple-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox 
                        id={`size-${size.name}`}
                        checked={selectedSizes[size.name] || false}
                        onCheckedChange={() => handleToggleSize(size)}
                      />
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handlePrimarySize(size)}
                      >
                        <div className={`text-sm ${selectedSize.name === size.name ? "text-purple-700 font-medium" : ""}`}>
                          {size.name}
                        </div>
                        <div className="text-xs text-gray-500">{size.width} × {size.height}px</div>
                      </div>
                      {selectedSize.name === size.name && (
                        <ChevronRight className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Custom Size
          </Button>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link2Icon className="h-4 w-4" />
              <span>Linked Sizes</span>
            </div>
            <p className="text-xs text-gray-500">
              Changes to elements in the primary size will be applied to all linked sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
