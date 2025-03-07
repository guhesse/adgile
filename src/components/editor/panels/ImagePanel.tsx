
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditorElement } from "../types";
import {
  CornerDownLeft,
  CornerDownRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  ChevronDown,
  Minus,
  Plus,
  Check
} from "lucide-react";
import { useState } from "react";

interface ImagePanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const ImagePanel = ({ element, updateElementStyle, updateElementContent, activeTab }: ImagePanelProps) => {
  // State for color picker
  const [backgroundColor, setBackgroundColor] = useState(element.style.backgroundColor || "#FFFFFF");
  const [cornerRadius, setCornerRadius] = useState({
    topLeft: element.style.borderTopLeftRadius || 0,
    topRight: element.style.borderTopRightRadius || 0,
    bottomLeft: element.style.borderBottomLeftRadius || 0,
    bottomRight: element.style.borderBottomRightRadius || 0
  });
  const [applyToAllCorners, setApplyToAllCorners] = useState(true);
  const [borderWidth, setBorderWidth] = useState(element.style.borderWidth || 0);
  const [borderColor, setBorderColor] = useState(element.style.borderColor || "#000000");
  const [borderStyle, setBorderStyle] = useState(element.style.borderStyle || "solid");
  const [alignment, setAlignment] = useState(element.style.textAlign || "left");

  // Handle corner radius change
  const handleCornerRadiusChange = (corner: string, value: number) => {
    const newCornerRadius = { ...cornerRadius, [corner]: value };
    setCornerRadius(newCornerRadius);
    
    // Apply to all corners if checkbox is checked
    if (applyToAllCorners) {
      const allCornersValue = value;
      updateElementStyle("borderTopLeftRadius", allCornersValue);
      updateElementStyle("borderTopRightRadius", allCornersValue);
      updateElementStyle("borderBottomLeftRadius", allCornersValue);
      updateElementStyle("borderBottomRightRadius", allCornersValue);
      setCornerRadius({
        topLeft: allCornersValue,
        topRight: allCornersValue,
        bottomLeft: allCornersValue,
        bottomRight: allCornersValue
      });
    } else {
      // Apply only to the specified corner
      const styleProperty = 
        corner === "topLeft" ? "borderTopLeftRadius" :
        corner === "topRight" ? "borderTopRightRadius" :
        corner === "bottomLeft" ? "borderBottomLeftRadius" : "borderBottomRightRadius";
      
      updateElementStyle(styleProperty, value);
    }
  };

  // Handle background color change
  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    updateElementStyle("backgroundColor", color);
  };

  // Handle border width change
  const handleBorderWidthChange = (width: number) => {
    setBorderWidth(width);
    updateElementStyle("borderWidth", width);
    // If width is greater than 0 and there's no border style, set a default
    if (width > 0 && !element.style.borderStyle) {
      updateElementStyle("borderStyle", "solid");
      setBorderStyle("solid");
    }
  };

  // Handle border color change
  const handleBorderColorChange = (color: string) => {
    setBorderColor(color);
    updateElementStyle("borderColor", color);
  };

  // Handle border style change
  const handleBorderStyleChange = (style: string) => {
    setBorderStyle(style);
    updateElementStyle("borderStyle", style);
  };

  // Handle alignment change
  const handleAlignmentChange = (align: string) => {
    setAlignment(align);
    updateElementStyle("textAlign", align);
    // Also set object-position for images
    updateElementStyle("objectPosition", align);
  };
  
  // Content Panel
  const ContentPanel = () => (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Image</h3>
        <div className="border rounded p-2 flex flex-col items-center justify-center">
          <div className="h-36 w-full bg-gray-100 rounded flex items-center justify-center mb-2">
            {element.content ? (
              <img 
                src={element.content} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain"
                style={{
                  borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : 0
                }}
              />
            ) : (
              <div className="text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex space-x-2 w-full">
            <Button variant="outline" className="flex-1 text-xs">Upload</Button>
            <Button variant="outline" className="flex-1 text-xs">Gallery</Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={element.style.width}
              onChange={(e) => updateElementStyle("width", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="10"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={element.style.height}
              onChange={(e) => updateElementStyle("height", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="10"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Alt Text</h3>
        <input
          type="text"
          placeholder="Image description for accessibility"
          className="w-full px-3 py-2 border rounded"
          value={element.alt || ""}
          onChange={(e) => updateElementStyle("alt", e.target.value)}
        />
      </div>
    </div>
  );

  // Style Panel
  const StylePanel = () => (
    <div className="flex flex-col h-full p-4 space-y-6">
      {/* Color picker section */}
      <div className="flex flex-col justify-center items-center gap-1.5 w-full">
        <div className="h-8 min-w-[128px] py-1.5 flex justify-center items-center gap-2 self-stretch">
          <span className="text-[#717680] text-center font-['Geist',sans-serif] text-xs">Cor de fundo</span>
        </div>
        
        <div className="h-[219px] py-2 flex flex-col justify-center items-center gap-2 self-stretch rounded bg-[#FDFDFD] relative">
          {/* Color gradient area */}
          <div className="w-full h-[120px] bg-gradient-to-br from-purple-600 via-purple-400 to-white rounded-md"
               onClick={(e) => {
                 // Get the position of click relative to the div
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left; 
                 const y = e.clientY - rect.top;
                 // This is a simplified example. In reality, you would calculate the color based on the position
                 handleBackgroundColorChange("#6941C6");
               }}>
          </div>
          
          <div className="flex justify-between items-center w-full px-4">
            {/* Color preview */}
            <div className="w-7 h-7 rounded-md bg-[#6941C6] border border-white"
                 style={{ backgroundColor: backgroundColor }}></div>
            
            {/* Sliders */}
            <div className="flex w-[262px] flex-col items-start gap-2">
              {/* Hue slider - simplified implementation */}
              <div className="w-full h-2.5 relative">
                <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"></div>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  className="absolute top-0 w-full h-2.5 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    // Very simplified color conversion
                    const hue = parseInt(e.target.value);
                    handleBackgroundColorChange(`hsl(${hue}, 70%, 60%)`);
                  }}
                />
              </div>
              
              {/* Transparency slider - simplified implementation */}
              <div className="w-full h-2.5 relative">
                <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-transparent to-[#752BD4]"></div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  className="absolute top-0 w-full h-2.5 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    // Simplified opacity implementation
                    const opacity = parseInt(e.target.value) / 100;
                    updateElementStyle("opacity", opacity);
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Position marker - simplified */}
          <div className="absolute top-[94px] left-[137px] w-2.5 h-2.5 rounded-full border border-white"></div>
          
          {/* Color values */}
          <div className="flex h-[53px] justify-center items-center gap-[27px] mt-4">
            {/* HEX value */}
            <div className="flex items-center gap-1">
              <span className="text-[#414651] font-['Inter',sans-serif] text-[8px] font-medium">HEX</span>
              <div className="flex flex-col items-start gap-1">
                <input
                  className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]"
                  value={backgroundColor.startsWith("#") ? backgroundColor : "#6941C6"}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                />
              </div>
            </div>
            
            {/* RGB values - simplified implementation */}
            <div className="flex items-center gap-1">
              <div>
                <span className="text-[#414651] text-center font-['Inter',sans-serif] text-[8px] font-medium">R</span>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                    151
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[#414651] text-center font-['Inter',sans-serif] text-[8px] font-medium">G</span>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                    81
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[#414651] text-center font-['Inter',sans-serif] text-[8px] font-medium">B</span>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                    242
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Corners section */}
      <div className="flex flex-col justify-center items-center gap-6 self-stretch">
        <div className="h-8 min-w-[128px] py-1.5 flex justify-center items-center gap-2 self-stretch">
          <span className="text-[#414651] text-center font-['Geist',sans-serif] text-base">Cantos</span>
        </div>
        
        <div className="flex h-[73px] px-[23px] justify-center items-center content-center gap-[16px_79px] flex-wrap">
          {/* Top-left corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <div className="flex flex-col items-start gap-1">
              <input
                type="number"
                className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px] w-10"
                value={cornerRadius.topLeft}
                onChange={(e) => handleCornerRadiusChange("topLeft", parseInt(e.target.value) || 0)}
              />
            </div>
            <CornerLeftDown size={16} className="text-[#252B37]" />
          </div>
          
          {/* Top-right corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <CornerRightDown size={16} className="text-[#252B37]" />
            <div className="flex flex-col items-start gap-1">
              <input
                type="number"
                className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px] w-10"
                value={cornerRadius.topRight}
                onChange={(e) => handleCornerRadiusChange("topRight", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          {/* Bottom-left corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <div className="flex flex-col items-start gap-1">
              <input
                type="number"
                className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px] w-10"
                value={cornerRadius.bottomLeft}
                onChange={(e) => handleCornerRadiusChange("bottomLeft", parseInt(e.target.value) || 0)}
              />
            </div>
            <CornerLeftUp size={16} className="text-[#252B37]" />
          </div>
          
          {/* Bottom-right corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <CornerRightUp size={16} className="text-[#252B37]" />
            <div className="flex flex-col items-start gap-1">
              <input
                type="number"
                className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px] w-10"
                value={cornerRadius.bottomRight}
                onChange={(e) => handleCornerRadiusChange("bottomRight", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
        
        {/* Apply to all corners checkbox */}
        <div className="flex w-[200px] justify-center items-center gap-2 mt-4">
          <div className="w-4 h-4 relative cursor-pointer" 
               onClick={() => setApplyToAllCorners(!applyToAllCorners)}>
            <div className={`w-4 h-4 rounded-sm border border-[#414651] ${applyToAllCorners ? "bg-[#414651]" : "bg-white"}`}>
              {applyToAllCorners && <Check size={14} className="text-white absolute top-0 left-0" />}
            </div>
          </div>
          <span className="text-[#717680] font-['Geist',sans-serif] text-xs">Aplicar em todos os cantos</span>
        </div>
      </div>
      
      {/* Border section */}
      <div className="flex flex-col justify-center items-center gap-1.5 self-stretch">
        <div className="h-8 min-w-[128px] py-1.5 flex justify-center items-center gap-2 self-stretch">
          <span className="text-[#414651] text-center font-['Geist',sans-serif] text-base">Borda</span>
        </div>
        
        <div className="flex w-[311px] items-start gap-2.5">
          {/* Border style dropdown */}
          <div className="w-[199px]">
            <div className="flex p-1 px-3 items-center justify-between rounded-sm border border-[#E9EAEB] bg-[#FDFDFD] cursor-pointer"
                 onClick={() => {
                   // Toggle between border styles: solid, dashed, dotted
                   const styles = ["solid", "dashed", "dotted"];
                   const currentIndex = styles.indexOf(borderStyle);
                   const nextStyle = styles[(currentIndex + 1) % styles.length];
                   handleBorderStyleChange(nextStyle);
                 }}>
              <span className="text-[#252B37] font-['Geist',sans-serif] text-xs capitalize">{borderStyle}</span>
              <ChevronDown size={16} className="text-[#020617]" />
            </div>
          </div>
          
          {/* Border width control */}
          <div className="flex h-[26px] p-1.5 px-2 items-center gap-0 rounded-md bg-[#E9EAEB]">
            <Minus 
              size={16} 
              className="text-[#414651] cursor-pointer" 
              onClick={() => handleBorderWidthChange(Math.max(0, borderWidth - 1))}
            />
            <span className="text-[#414651] font-['Geist',sans-serif] text-xs px-1">{borderWidth}</span>
            <Plus 
              size={16} 
              className="text-[#414651] cursor-pointer"
              onClick={() => handleBorderWidthChange(borderWidth + 1)} 
            />
          </div>
          
          {/* Border color */}
          <div 
            className="w-[29px] h-[29px] rounded-full cursor-pointer" 
            style={{ backgroundColor: borderColor }}
            onClick={() => {
              // For simplicity, we'll just toggle between a few colors
              const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
              const currentIndex = colors.indexOf(borderColor);
              const nextColor = colors[(currentIndex + 1) % colors.length];
              handleBorderColorChange(nextColor);
            }}
          ></div>
        </div>
      </div>
      
      {/* Alignment section */}
      <div className="flex flex-col justify-center items-center gap-7">
        <div className="h-8 min-w-[128px] py-1.5 flex justify-center items-center gap-2 self-stretch">
          <span className="text-[#414651] text-center font-['Geist',sans-serif] text-base">Alinhamento</span>
        </div>
        
        <div className="flex w-full h-[39px] p-1 justify-center items-center gap-0 rounded bg-[#E9EAEB]">
          <div 
            className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer
                      ${alignment === 'left' ? 'bg-white' : ''} text-[#717680] font-['Geist',sans-serif] text-xs`}
            onClick={() => handleAlignmentChange('left')}
          >
            Esquerda
          </div>
          <div 
            className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer
                      ${alignment === 'center' ? 'bg-white' : ''} text-[#717680] font-['Geist',sans-serif] text-xs`}
            onClick={() => handleAlignmentChange('center')}
          >
            Centro
          </div>
          <div 
            className={`flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm cursor-pointer
                      ${alignment === 'right' ? 'bg-white' : ''} text-[#717680] font-['Geist',sans-serif] text-xs`}
            onClick={() => handleAlignmentChange('right')}
          >
            Direita
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      {activeTab === "content" ? <ContentPanel /> : <StylePanel />}
    </div>
  );
};
