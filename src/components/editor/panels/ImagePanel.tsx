
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditorElement } from "../types";
import { CornerDownLeft, CornerDownRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, ChevronDown, Minus, Plus, Check } from "lucide-react";

interface ImagePanelProps {
  element: EditorElement;
  updateElementStyle: (property: string, value: any) => void;
  updateElementContent: (content: string) => void;
  activeTab: string;
}

export const ImagePanel = ({ element, updateElementStyle, updateElementContent, activeTab }: ImagePanelProps) => {
  // Content Panel
  const ContentPanel = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Image</h3>
        <div className="border rounded p-2 flex flex-col items-center justify-center">
          <div className="h-36 w-full bg-gray-100 rounded flex items-center justify-center mb-2">
            {element.content ? (
              <img 
                src={element.content} 
                alt="Preview" 
                className="max-h-full max-w-full object-contain"
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
          value={element.content || ""}
          onChange={(e) => updateElementContent(e.target.value)}
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
          <span className="text-[#414651] text-center font-['Geist',sans-serif] text-base">Cor de fundo</span>
        </div>
        
        <div className="h-[219px] py-2 flex flex-col justify-center items-center gap-2 self-stretch rounded bg-[#FDFDFD] relative">
          {/* Color gradient area */}
          <div className="w-full h-[120px] bg-gradient-to-br from-purple-600 via-purple-400 to-white rounded-md"></div>
          
          <div className="flex justify-between items-center w-full px-4">
            {/* Color preview */}
            <div className="w-7 h-7 rounded-md bg-[#6941C6] border border-white"></div>
            
            {/* Sliders */}
            <div className="flex w-[262px] flex-col items-start gap-2">
              {/* Hue slider */}
              <div className="w-full h-2.5 relative">
                <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"></div>
                <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#6941C6] border border-white" style={{ left: '35%' }}></div>
              </div>
              
              {/* Transparency slider */}
              <div className="w-full h-2.5 relative">
                <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-transparent to-[#752BD4]"></div>
                <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#6941C6] border border-white" style={{ left: '50%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Position marker */}
          <div className="absolute top-[94px] left-[137px] w-2.5 h-2.5 rounded-full border border-white"></div>
          
          {/* Color values */}
          <div className="flex h-[53px] justify-center items-center gap-[27px] mt-4">
            {/* HEX value */}
            <div className="flex items-center gap-1">
              <span className="text-[#414651] font-['Inter',sans-serif] text-[8px] font-medium">HEX</span>
              <div className="flex flex-col items-start gap-1">
                <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                  #9751F2
                </div>
              </div>
            </div>
            
            {/* RGB values */}
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
              <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                151
              </div>
            </div>
            <CornerLeftDown size={16} className="text-[#252B37]" />
          </div>
          
          {/* Top-right corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <CornerRightDown size={16} className="text-[#252B37]" />
            <div className="flex flex-col items-start gap-1">
              <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                151
              </div>
            </div>
          </div>
          
          {/* Bottom-left corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <div className="flex flex-col items-start gap-1">
              <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                151
              </div>
            </div>
            <CornerLeftUp size={16} className="text-[#252B37]" />
          </div>
          
          {/* Bottom-right corner */}
          <div className="flex w-[55px] justify-center items-center gap-1">
            <CornerRightUp size={16} className="text-[#252B37]" />
            <div className="flex flex-col items-start gap-1">
              <div className="flex p-1 px-2 items-center gap-1 rounded bg-[#FDFDFD] border border-[#E9EAEB] text-[#414651] font-['Inter',sans-serif] text-[10px]">
                151
              </div>
            </div>
          </div>
        </div>
        
        {/* Apply to all corners checkbox */}
        <div className="flex w-[200px] justify-center items-center gap-2 mt-4">
          <div className="w-4 h-4 relative">
            <div className="w-4 h-4 rounded-sm border border-[#414651] bg-[#414651]">
              <Check size={14} className="text-white absolute top-0 left-0" />
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
            <div className="flex p-1 px-3 items-center justify-between rounded-sm border border-[#E9EAEB] bg-[#FDFDFD]">
              <span className="text-[#252B37] font-['Geist',sans-serif] text-xs">Solida</span>
              <ChevronDown size={16} className="text-[#020617]" />
            </div>
          </div>
          
          {/* Border width control */}
          <div className="flex h-[26px] p-1.5 px-2 items-center gap-0 rounded-md bg-[#E9EAEB]">
            <Minus size={16} className="text-[#414651]" />
            <span className="text-[#414651] font-['Geist',sans-serif] text-xs px-1">1</span>
            <Plus size={16} className="text-[#414651]" />
          </div>
          
          {/* Border color */}
          <div className="w-[29px] h-[29px] rounded-full bg-black"></div>
        </div>
      </div>
      
      {/* Alignment section */}
      <div className="flex flex-col justify-center items-center gap-7">
        <div className="h-8 min-w-[128px] py-1.5 flex justify-center items-center gap-2 self-stretch">
          <span className="text-[#414651] text-center font-['Geist',sans-serif] text-base">Alinhamento</span>
        </div>
        
        <div className="flex w-full h-[39px] p-1 justify-center items-center gap-0 rounded bg-[#E9EAEB]">
          <div className="flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm text-[#717680] font-['Geist',sans-serif] text-xs">
            Esquerda
          </div>
          <div className="flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm text-[#717680] font-['Geist',sans-serif] text-xs">
            Centro
          </div>
          <div className="flex min-w-[56px] p-1.5 px-3 justify-center items-center flex-1 rounded-sm text-[#717680] font-['Geist',sans-serif] text-xs">
            Direita
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activeTab === "content" ? <ContentPanel /> : <StylePanel />}
    </div>
  );
};

