import { Canvas } from "@/components/editor/Canvas";
import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { CanvasProvider } from "@/components/editor/CanvasContext";
import { EditorMode } from "@/components/editor/types";

const Index = () => {
  const [activeTab, setActiveTab] = useState<EditorMode>("banner");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        document.dispatchEvent(new CustomEvent('canvas-spacebar-down'));
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        document.dispatchEvent(new CustomEvent('canvas-spacebar-up'));
        e.preventDefault();
      }
    };

    const preventSpacebarScroll = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };

    const preventBrowserZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    window.addEventListener('keydown', preventSpacebarScroll, { passive: false });
    window.addEventListener('wheel', preventBrowserZoom, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', preventSpacebarScroll);
      window.removeEventListener('wheel', preventBrowserZoom);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
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
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="flex flex-col flex-1 ml-0 overflow-hidden">
        <div className="flex items-center border-b h-12 px-4">
          <div className="font-bold mr-6">AdGile</div>
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
            <a
              href="#"
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "social" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:text-gray-900"}`}
              onClick={() => setActiveTab("social")}
            >
              Social
            </a>
            <a
              href="#"
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "impressos" ? "bg-purple-100 text-purple-600" : "text-gray-600 hover:text-gray-900"}`}
              onClick={() => setActiveTab("impressos")}
            >
              Impressos
            </a>
            <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Briefing</a>
          </nav>
          <div className="ml-auto flex items-center">
            <span className="mr-2 text-sm">Nome do usuário</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

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
          
          .canvas-pan-mode {
            cursor: grab !important;
          }
          .canvas-pan-mode:active {
            cursor: grabbing !important;
          }
          
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
