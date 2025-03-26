
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { LayoutTemplate } from "@/components/editor/types/admin";
import {
  getLayoutTemplates,
  saveLayoutTemplate,
  deleteLayoutTemplate,
  generateFormatPresets,
  getAdminStats
} from "@/components/editor/utils/layoutStorage";
import { CanvasProvider } from "@/components/editor/CanvasContext";
import { Canvas } from "@/components/editor/Canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Brain,
  Database,
  FileEdit,
  LayoutGrid,
  Save,
  Search,
  Settings,
  Square,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { AdminTrainingPanel } from "@/components/editor/panels/AdminTrainingPanel";
import { AdminLayoutList } from "@/components/editor/admin/AdminLayoutList";
import { AdminLayoutStats } from "@/components/editor/admin/AdminLayoutStats";
import { AdminFormatSelector } from "@/components/editor/admin/AdminFormatSelector";

const Admin = () => {
  const [activeFormat, setActiveFormat] = useState<{
    width: number;
    height: number;
    orientation: "vertical" | "horizontal" | "square";
  } | null>(null);
  
  const [formatPresets, setFormatPresets] = useState({
    vertical: [] as { width: number; height: number }[],
    horizontal: [] as { width: number; height: number }[],
    square: [] as { width: number; height: number }[]
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [layouts, setLayouts] = useState<LayoutTemplate[]>([]);
  const [stats, setStats] = useState(getAdminStats());
  const [activeTab, setActiveTab] = useState("layouts");

  useEffect(() => {
    // Load presets
    const presets = generateFormatPresets();
    setFormatPresets(presets);
    
    // Set default format
    if (!activeFormat) {
      setActiveFormat({
        width: presets.horizontal[0].width,
        height: presets.horizontal[0].height,
        orientation: "horizontal"
      });
    }
    
    // Load layouts
    loadLayouts();
  }, []);

  const loadLayouts = () => {
    const templates = getLayoutTemplates();
    setLayouts(templates);
    setStats(getAdminStats());
  };

  const handleSaveLayout = (elements: any[], name: string) => {
    if (!activeFormat) return;
    
    const template: LayoutTemplate = {
      id: "",
      name: name || `Layout ${layouts.length + 1}`,
      width: activeFormat.width,
      height: activeFormat.height,
      orientation: activeFormat.orientation,
      elements,
      createdAt: "",
      updatedAt: ""
    };
    
    saveLayoutTemplate(template);
    loadLayouts();
  };

  const handleDeleteLayout = (id: string) => {
    deleteLayoutTemplate(id);
    loadLayouts();
  };

  const filterLayouts = (layouts: LayoutTemplate[]) => {
    if (!searchQuery) return layouts;
    
    return layouts.filter(layout => 
      layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      layout.orientation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredLayouts = filterLayouts(layouts);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Helmet>
        <title>AdGile Admin - Layout & AI Training</title>
      </Helmet>

      <div className="flex items-center border-b h-12 px-4">
        <div className="font-bold mr-6">AdGile Admin</div>
        <nav className="flex space-x-4">
          <a href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Editor
          </a>
          <a
            href="/admin"
            className="px-3 py-2 text-sm font-medium rounded-md bg-purple-100 text-purple-600"
          >
            Admin
          </a>
        </nav>
        <div className="ml-auto flex items-center">
          <span className="mr-2 text-sm">Admin Panel</span>
          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
            <Settings className="w-4 h-4 text-purple-700" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3">
              <div className="space-y-1">
                <Button
                  variant={activeTab === "layouts" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("layouts")}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Layouts
                </Button>
                <Button
                  variant={activeTab === "training" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("training")}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  AI Training
                </Button>
                <Button
                  variant={activeTab === "stats" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("stats")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistics
                </Button>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="mb-2 px-4 text-sm font-medium">Layout Stats</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-4 py-1 text-sm">
                    <span className="flex items-center">
                      <Terminal className="mr-2 h-3 w-3" /> 
                      Total
                    </span>
                    <span className="font-medium">{stats.totalTemplates}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-1 text-sm">
                    <span className="flex items-center">
                      <TrendingUp className="mr-2 h-3 w-3 rotate-90" /> 
                      Vertical
                    </span>
                    <span className="font-medium">{stats.verticalTemplates}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-1 text-sm">
                    <span className="flex items-center">
                      <TrendingUp className="mr-2 h-3 w-3" /> 
                      Horizontal
                    </span>
                    <span className="font-medium">{stats.horizontalTemplates}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-1 text-sm">
                    <span className="flex items-center">
                      <Square className="mr-2 h-3 w-3" /> 
                      Square
                    </span>
                    <span className="font-medium">{stats.squareTemplates}</span>
                  </div>
                </div>
              </div>
              
              {stats.lastTrainingDate && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="mb-2 px-4 text-sm font-medium">AI Model</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-4 py-1 text-sm">
                        <span>Last training</span>
                        <span className="font-medium">
                          {new Date(stats.lastTrainingDate).toLocaleDateString()}
                        </span>
                      </div>
                      {stats.modelAccuracy && (
                        <div className="flex justify-between items-center px-4 py-1 text-sm">
                          <span>Accuracy</span>
                          <span className="font-medium">{(stats.modelAccuracy * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">
                {activeTab === "layouts" && "Layout Management"}
                {activeTab === "training" && "AI Training Center"}
                {activeTab === "stats" && "Analytics & Statistics"}
                {activeTab === "settings" && "Admin Settings"}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTab === "layouts" && "Create and manage layout templates"}
                {activeTab === "training" && "Train the AI model with your layouts"}
                {activeTab === "stats" && "View performance and usage statistics"}
                {activeTab === "settings" && "Configure admin preferences"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {activeTab === "layouts" && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search layouts..."
                    className="w-64 pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              {activeTab === "layouts" && activeFormat && (
                <Button onClick={() => handleSaveLayout([], "")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Current Layout
                </Button>
              )}
            </div>
          </div>

          {/* Content body */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "layouts" && (
              <div className="flex h-full">
                <div className="w-72 border-r overflow-y-auto">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Format Selection</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a format to create a new layout
                    </p>
                  </div>
                  <AdminFormatSelector
                    formatPresets={formatPresets}
                    activeFormat={activeFormat}
                    setActiveFormat={setActiveFormat}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  {activeFormat ? (
                    <CanvasProvider>
                      <Canvas 
                        editorMode="banner" 
                        fixedSize={{
                          width: activeFormat.width,
                          height: activeFormat.height
                        }}
                      />
                    </CanvasProvider>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p>Select a format to start creating</p>
                    </div>
                  )}
                </div>
                <div className="w-80 border-l overflow-y-auto">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Saved Layouts</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredLayouts.length} layouts found
                    </p>
                  </div>
                  <AdminLayoutList 
                    layouts={filteredLayouts}
                    onDelete={handleDeleteLayout}
                  />
                </div>
              </div>
            )}

            {activeTab === "training" && (
              <AdminTrainingPanel 
                layouts={layouts}
                onModelUpdate={loadLayouts}
              />
            )}

            {activeTab === "stats" && (
              <AdminLayoutStats stats={stats} layouts={layouts} />
            )}

            {activeTab === "settings" && (
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>
                      Configure system preferences and AI training options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Settings options will be available in a future update.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
