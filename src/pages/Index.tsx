
import { Canvas } from "@/components/editor/Canvas";
import { Helmet } from "react-helmet";
import { useState } from "react";
import { CanvasProvider } from "@/components/editor/CanvasContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"email" | "banner">("email");

  return (
    <div className="flex h-screen">
      <Helmet>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </Helmet>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0">
        {/* Top Navigation */}
        <div className="flex items-center border-b h-12 px-4">
          <div className="font-bold mr-6">AdSile</div>
          <nav className="flex space-x-4">
            <a 
              href="#" 
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "email" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:text-gray-900"}`}
              onClick={() => setActiveTab("email")}
            >
              Email
            </a>
            <a 
              href="#" 
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "banner" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:text-gray-900"}`}
              onClick={() => setActiveTab("banner")}
            >
              Banner
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Social</a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Impressos</a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Briefing</a>
          </nav>
          <div className="ml-auto flex items-center">
            <span className="mr-2 text-sm">Nome do usuário</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        
        {/* CSS for resize handles and dragging */}
        <style>
          {`
          .resize-handle {
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #0088ff;
            border: 1px solid white;
            border-radius: 50%;
          }
          .resize-handle-n {
            top: -4px;
            left: 50%;
            transform: translateX(-50%);
            cursor: n-resize;
          }
          .resize-handle-e {
            right: -4px;
            top: 50%;
            transform: translateY(-50%);
            cursor: e-resize;
          }
          .resize-handle-s {
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            cursor: s-resize;
          }
          .resize-handle-w {
            left: -4px;
            top: 50%;
            transform: translateY(-50%);
            cursor: w-resize;
          }
          .resize-handle-nw {
            left: -4px;
            top: -4px;
            cursor: nw-resize;
          }
          .resize-handle-ne {
            right: -4px;
            top: -4px;
            cursor: ne-resize;
          }
          .resize-handle-se {
            right: -4px;
            bottom: -4px;
            cursor: se-resize;
          }
          .resize-handle-sw {
            left: -4px;
            bottom: -4px;
            cursor: sw-resize;
          }
          
          /* Animations */
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          .animate-fade-out {
            animation: fadeOut 0.3s ease-in-out;
          }
          .animate-scale-in {
            animation: scaleIn 0.3s ease-in-out;
          }
          .animate-scale-out {
            animation: scaleOut 0.3s ease-in-out;
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-in-out;
          }
          .animate-slide-out-right {
            animation: slideOutRight 0.3s ease-in-out;
          }
          .animate-bounce {
            animation: bounce 1s infinite;
          }
          .animate-pulse {
            animation: pulse 2s infinite;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes scaleOut {
            from { transform: scale(1); opacity: 1; }
            to { transform: scale(0.9); opacity: 0; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes slideOutRight {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          `}
        </style>
        
        <CanvasProvider>
          <Canvas editorMode={activeTab} />
        </CanvasProvider>
      </div>
    </div>
  );
};

export default Index;
