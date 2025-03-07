
import { Canvas } from "@/components/editor/Canvas";
import { Plus, Crown, LayoutTemplate, Layers2, PictureInPicture2, Play, Maximize, Hourglass } from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar - New Design */}
      <div className="flex w-24 h-screen p-4 pt-4 flex-col items-center bg-[#F5F5F5] fixed left-0 top-0">
        <div className="flex flex-col items-center flex-1">
          {/* Add Button */}
          <div className="flex w-24 h-[90px] flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 justify-center items-center rounded bg-[#53389E]">
              <Plus size={16} className="text-[#F5F5F5]" />
            </div>
          </div>
          
          {/* Brand */}
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <Crown size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Brand</div>
          </div>
          
          {/* Templates */}
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <LayoutTemplate size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Templates</div>
          </div>
          
          {/* Layers */}
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <Layers2 size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Layers</div>
          </div>
          
          {/* Slides */}
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <PictureInPicture2 size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Slides</div>
          </div>
          
          {/* Animator */}
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <Play size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Animator</div>
          </div>
          
          {/* Sizes */}
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <Maximize size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Sizes</div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex flex-col items-center pb-4 mt-auto">
          <div className="flex w-24 h-20 flex-col justify-center items-center gap-1.5">
            <div className="flex w-8 h-8 p-1.5 justify-center items-center rounded bg-[#252B37]">
              <Hourglass size={16} className="text-[#F8FAFC]" />
            </div>
            <div className="text-[#181D27] font-['Geist',sans-serif] text-xs">Timeline</div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-24">
        {/* Top Navigation */}
        <div className="flex items-center border-b h-12 px-4">
          <div className="font-bold text-xl mr-6">AdSile</div>
          <nav className="flex space-x-4">
            <a href="#" className="px-3 py-2 text-sm font-medium rounded-md bg-purple-100 text-purple-600">Email</a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Banner</a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Social</a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Impressos</a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Briefing</a>
          </nav>
          <div className="ml-auto flex items-center">
            <span className="mr-2 text-sm">Nome do usuário</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        
        <Canvas />
      </div>
    </div>
  );
};

export default Index;
