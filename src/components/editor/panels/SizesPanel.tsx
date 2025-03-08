
import React from "react";
import { useCanvas } from "../CanvasContext";
import { BANNER_SIZES } from "../types";
import { Square, ChevronRight } from "lucide-react";

export const SizesPanel = () => {
  const { selectedSize, setSelectedSize } = useCanvas();

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-4 border-b">
        <div className="text-sm font-bold text-[#414651]">Banner Sizes</div>
      </div>

      {/* Size content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {Object.entries(groupedSizes).map(([category, sizes]) => (
          <div key={category} className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">{category}</div>
            <div className="space-y-1">
              {sizes.map((size) => (
                <div
                  key={size.name}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer ${
                    selectedSize.name === size.name ? "bg-purple-100 text-purple-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  <Square className="h-4 w-4 text-[#414651]" />
                  <div className="flex-1">
                    <div className="text-sm">{size.name}</div>
                    <div className="text-xs text-gray-500">{size.width} × {size.height}px</div>
                  </div>
                  {selectedSize.name === size.name && (
                    <ChevronRight className="h-4 w-4 text-purple-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
