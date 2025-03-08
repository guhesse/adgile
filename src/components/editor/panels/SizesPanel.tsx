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
  const { selectedSize, setSelectedSize, setActiveSizes, activeSizes } = useCanvas();
  
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
    const isCurrentlyActive = activeSizes.some(s => s.name === size.name);
    
    if (isCurrentlyActive) {
      // Remove from active sizes if it's not the selected size
      if (size.name === selectedSize.name && activeSizes.length > 1) {
        // If removing selected size, choose another one to be selected
        const nextSize = activeSizes.find(s => s.name !== size.name);
        if (nextSize) {
          setSelectedSize(nextSize);
        }
      }
      
      // Only remove if not the last active size
      if (activeSizes.length > 1) {
        setActiveSizes(activeSizes.filter(s => s.name !== size.name));
      }
    } else {
      // Add to active sizes
      setActiveSizes([...activeSizes, size]);
    }
  };

  const handlePrimarySize = (size: BannerSize) => {
    setSelectedSize(size);
    
    // If the size is not already active, add it
    if (!activeSizes.some(s => s.name === size.name)) {
      setActiveSizes([...activeSizes, size]);
    }
  };

  const selectAllInCategory = (category: string) => {
    // Add all sizes in category to active sizes without duplicates
    const newSizes = [...activeSizes];
    groupedSizes[category].forEach(size => {
      if (!newSizes.some(s => s.name === size.name)) {
        newSizes.push(size);
      }
    });
    setActiveSizes(newSizes);
  };

  const deselectAllInCategory = (category: string) => {
    // Make sure we're not removing all active sizes
    const sizesToRemove = new Set(groupedSizes[category].map(size => size.name));
    const remainingSizes = activeSizes.filter(s => !sizesToRemove.has(s.name));
    
    // Keep at least one size active
    if (remainingSizes.length > 0) {
      setActiveSizes(remainingSizes);
      
      // If the selected size is being removed, change it
      if (sizesToRemove.has(selectedSize.name)) {
        setSelectedSize(remainingSizes[0]);
      }
    }
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categorySelectedCount = groupedSizes[category].filter(
      size => activeSizes.some(s => s.name === size.name)
    ).length;
    return categorySelectedCount > 0 && categorySelectedCount < groupedSizes[category].length;
  };

  const isCategoryFullySelected = (category: string) => {
    return groupedSizes[category].every(
      size => activeSizes.some(s => s.name === size.name)
    );
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
                        checked={activeSizes.some(s => s.name === size.name)}
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
