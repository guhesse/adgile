import React, { useState, useEffect } from "react";
import { CanvasProvider } from "@/components/editor/CanvasContext";
import { Canvas } from "@/components/editor/Canvas";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AdminLayoutList } from "@/components/editor/admin/AdminLayoutList";
import { AdminLayoutStats } from "@/components/editor/admin/AdminLayoutStats";
import { AdminFormatSelector } from "@/components/editor/admin/AdminFormatSelector";
import { AIModelManager } from "@/components/editor/ai/AIModelManager";
import { LayoutTemplate, AdminStats } from "@/components/editor/types/admin";
import { BannerSize } from "@/components/editor/types";

const createDemoFormats = () => {
  const formats: BannerSize[] = [];
  
  for (let i = 0; i < 100; i++) {
    const width = Math.floor(Math.random() * 441) + 160;
    const height = Math.floor(Math.random() * 1321) + 600;
    
    formats.push({
      name: `Vertical ${i+1}`,
      width,
      height
    });
  }
  
  for (let i = 0; i < 100; i++) {
    const width = Math.floor(Math.random() * 1321) + 600;
    const height = Math.floor(Math.random() * 441) + 160;
    
    formats.push({
      name: `Horizontal ${i+1}`,
      width,
      height
    });
  }
  
  for (let i = 0; i < 50; i++) {
    const size = Math.floor(Math.random() * 901) + 300;
    const variation = Math.floor(Math.random() * 21) - 10;
    
    formats.push({
      name: `Square ${i+1}`,
      width: size,
      height: size + variation
    });
  }
  
  return formats;
};

const determineOrientation = (width: number, height: number): 'vertical' | 'horizontal' | 'square' => {
  const ratio = width / height;
  if (ratio >= 0.95 && ratio <= 1.05) return 'square';
  return width > height ? 'horizontal' : 'vertical';
};

const STORAGE_KEY = 'admin-layout-templates';
const FORMATS_KEY = 'admin-formats';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState("layouts");
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalTemplates: 0,
    verticalTemplates: 0,
    horizontalTemplates: 0,
    squareTemplates: 0
  });
  const [formats, setFormats] = useState<BannerSize[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<BannerSize | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<LayoutTemplate[]>([]);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [modelMetadata, setModelMetadata] = useState({
    trainedAt: null,
    iterations: 0,
    accuracy: 0,
    loss: 0
  });

  useEffect(() => {
    const storedFormats = localStorage.getItem(FORMATS_KEY);
    if (storedFormats) {
      setFormats(JSON.parse(storedFormats));
    } else {
      const demoFormats = createDemoFormats();
      setFormats(demoFormats);
      localStorage.setItem(FORMATS_KEY, JSON.stringify(demoFormats));
    }
  }, []);

  useEffect(() => {
    const savedTemplatesJson = localStorage.getItem(STORAGE_KEY);
    if (savedTemplatesJson) {
      try {
        const parsedTemplates = JSON.parse(savedTemplatesJson);
        setSavedTemplates(parsedTemplates);
        updateStats(parsedTemplates);
      } catch (error) {
        console.error("Failed to parse saved templates:", error);
        toast.error("Failed to load saved templates");
      }
    }
  }, []);

  const updateStats = (templatesData: LayoutTemplate[]) => {
    const newStats: AdminStats = {
      totalTemplates: templatesData.length,
      verticalTemplates: templatesData.filter(t => t.orientation === 'vertical').length,
      horizontalTemplates: templatesData.filter(t => t.orientation === 'horizontal').length,
      squareTemplates: templatesData.filter(t => t.orientation === 'square').length,
    };
    
    if (isModelTrained && modelMetadata) {
      newStats.lastTrainingDate = modelMetadata.trainedAt as string;
      newStats.modelAccuracy = modelMetadata.accuracy;
    }
    
    setStats(newStats);
  };

  const handleFormatSelect = (format: BannerSize) => {
    setSelectedFormat(format);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveTemplate = (elements: any[]) => {
    if (!selectedFormat) {
      toast.error("Please select a format first");
      return;
    }

    const now = new Date().toISOString();
    const templateId = `template-${Date.now()}`;
    
    const newTemplate: LayoutTemplate = {
      id: templateId,
      name: `Template ${savedTemplates.length + 1}`,
      width: selectedFormat.width,
      height: selectedFormat.height,
      orientation: determineOrientation(selectedFormat.width, selectedFormat.height),
      elements: elements,
      createdAt: now,
      updatedAt: now
    };
    
    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    updateStats(updatedTemplates);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    
    toast.success("Template saved successfully");
  };

  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = savedTemplates.filter(template => template.id !== templateId);
    setSavedTemplates(updatedTemplates);
    updateStats(updatedTemplates);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    
    toast.success("Template deleted");
  };

  const handleTrainModel = async () => {
    if (savedTemplates.length < 10) {
      toast.error("You need at least 10 templates to train the model");
      return;
    }
    
    toast.info("Starting model training...");
    
    const startTime = Date.now();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const trainingResult = {
        trainedAt: new Date().toISOString(),
        iterations: Math.floor(Math.random() * 50) + 50,
        accuracy: Math.random() * 0.2 + 0.8,
        loss: Math.random() * 0.5
      };
      
      setModelMetadata(trainingResult);
      setIsModelTrained(true);
      
      updateStats(savedTemplates);
      
      const trainingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      toast.success(`Model trained successfully in ${trainingTime}s`);
    } catch (error) {
      console.error("Training error:", error);
      toast.error("Failed to train model");
    }
  };

  const captureAndSaveTemplate = () => {
    handleSaveTemplate([]);
    toast("Template captured from canvas", {
      description: "The current canvas elements have been saved as a new template."
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Return to Editor
            </Button>
            <Button onClick={captureAndSaveTemplate} disabled={!selectedFormat}>
              Save Current Layout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 p-6 overflow-hidden">
        <Tabs defaultValue="layouts" value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <div className="border-b pb-2 mb-4">
            <TabsList>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
              <TabsTrigger value="training">AI Training</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="layouts" className="h-full flex overflow-hidden">
              <div className="w-72 border-r overflow-y-auto bg-white p-4">
                <h3 className="font-medium mb-4">Select Format</h3>
                <AdminFormatSelector 
                  formats={formats} 
                  onSelectFormat={handleFormatSelect}
                  selectedFormat={selectedFormat}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {selectedFormat ? (
                  <div className="h-full overflow-hidden">
                    <CanvasProvider fixedSize={selectedFormat}>
                      <Canvas 
                        editorMode="banner" 
                        fixedSize={selectedFormat} 
                      />
                    </CanvasProvider>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-medium mb-2">No Format Selected</h3>
                      <p className="text-gray-500 mb-4">
                        Select a format from the sidebar to start creating a template.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-80 border-l overflow-y-auto bg-white">
                <AdminLayoutList 
                  templates={savedTemplates} 
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="training" className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <AIModelManager 
                  templates={savedTemplates}
                  isModelTrained={isModelTrained}
                  modelMetadata={modelMetadata}
                  onTrainModel={handleTrainModel}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <AdminLayoutStats 
                  stats={stats} 
                  layouts={savedTemplates}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
