
import { Canvas } from "@/components/editor/Canvas";
import { Plus, Crown, LayoutTemplate, Layers2, PictureInPicture2, Play, Maximize, Hourglass } from "lucide-react";

const Index = () => {
  return (
    <div className="flex h-screen">
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0">
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
