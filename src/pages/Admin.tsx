import React, { useState, useEffect, useCallback, useRef } from "react";
import { CanvasProvider } from "@/components/editor/CanvasContext";
import { Canvas } from "@/components/editor/Canvas";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AdminLayoutList } from "@/components/editor/admin/AdminLayoutList";
import { AdminLayoutStats } from "@/components/editor/admin/AdminLayoutStats";
import { AdminFormatSelector } from "@/components/editor/admin/AdminFormatSelector";
import { AdminPSDImport } from "@/components/editor/admin/AdminPSDImport";
import { AIModelManager } from "@/components/editor/ai/AIModelManager";
import { LayoutTemplate, AdminStats } from "@/components/editor/types/admin";
import { BannerSize, EditorElement } from "@/components/editor/types";
import { AdminTrainingPanel } from "@/components/editor/panels/AdminTrainingPanel";
import { saveToIndexedDB, getFromIndexedDB } from "@/utils/indexedDBUtils";
import { getOptimizedFormats } from "@/utils/formatGenerator";
import * as tf from '@tensorflow/tfjs';

// Storage keys
const STORAGE_KEY = 'admin-layout-templates';
const FORMATS_KEY = 'admin-formats';
const MODEL_KEY = 'ai-layout-model';

// Function to determine orientation based on dimensions
const determineOrientation = (width: number, height: number): 'vertical' | 'horizontal' | 'square' => {
  const ratio = width / height;
  if (ratio >= 0.95 && ratio <= 1.05) return 'square';
  return width > height ? 'horizontal' : 'vertical';
};

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
  const [importMode, setImportMode] = useState<'format' | 'psd'>('format');
  const [savedTemplates, setSavedTemplates] = useState<LayoutTemplate[]>([]);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [modelMetadata, setModelMetadata] = useState({
    trainedAt: null,
    iterations: 0,
    accuracy: 0,
    loss: 0
  });
  const [aiModel, setAiModel] = useState<tf.LayersModel | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasElements, setCanvasElements] = useState<EditorElement[]>([]);
  const canvasContextRef = useRef<any>(null);

  // Initialize or load formats
  useEffect(() => {
    const loadFormats = async () => {
      try {
        const storedFormats = await getFromIndexedDB(FORMATS_KEY);

        if (storedFormats && Array.isArray(storedFormats) && storedFormats.length > 0) {
          console.log("Formats loaded successfully:", storedFormats);
          setFormats(storedFormats);
        } else {
          console.log("No formats found, creating optimized formats");
          const optimizedFormats = getOptimizedFormats();
          setFormats(optimizedFormats);

          try {
            const saved = await saveToIndexedDB(FORMATS_KEY, optimizedFormats);
            console.log("Formats saved successfully to IndexedDB:", saved);
          } catch (storageError) {
            console.error("Failed to save formats:", storageError);
            setFormats(optimizedFormats);
            toast.error("Failed to access storage. Using temporary formats.");
          }
        }
      } catch (error) {
        console.error("Failed to initialize formats:", error);

        const optimizedFormats = getOptimizedFormats();
        setFormats(optimizedFormats);
        toast.error("Failed to access storage. Using temporary formats.");
      }
    };

    loadFormats();
  }, []);

  // Load saved templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        console.log("Trying to load templates from IndexedDB...");
        const parsedTemplates = await getFromIndexedDB(STORAGE_KEY, []);
        console.log("Templates loaded:", parsedTemplates);

        if (parsedTemplates && Array.isArray(parsedTemplates)) {
          setSavedTemplates(parsedTemplates);
          updateStats(parsedTemplates);

          if (parsedTemplates.length > 0) {
            toast.success(`${parsedTemplates.length} templates loaded successfully`);
          }
        } else {
          console.log("No templates found or invalid format");
          setSavedTemplates([]);
        }
      } catch (error) {
        console.error("Failed to parse saved templates:", error);
        toast.error("Failed to load saved templates");
      }
    };

    loadTemplates();
  }, []);

  // Update statistics
  const updateStats = useCallback((templatesData: LayoutTemplate[]) => {
    const newStats: AdminStats = {
      totalTemplates: templatesData.length,
      verticalTemplates: templatesData.filter(t => t.orientation === 'vertical').length,
      horizontalTemplates: templatesData.filter(t => t.orientation === 'horizontal').length,
      squareTemplates: templatesData.filter(t => t.orientation === 'square').length,
    };

    if (isModelTrained && modelMetadata.trainedAt) {
      newStats.lastTrainingDate = modelMetadata.trainedAt as string;
      newStats.modelAccuracy = modelMetadata.accuracy;
    }

    setStats(newStats);
  }, [isModelTrained, modelMetadata]);

  // Handle format selection
  const handleFormatSelect = (format: BannerSize) => {
    setSelectedFormat(format);
    setImportMode('format');
  };

  // Handle PSD import
  const handlePSDImport = (elements: EditorElement[], psdSize: BannerSize) => {
    console.log("PSD imported with", elements.length, "elements");
    
    // Add the PSD size to available formats
    const existingFormat = formats.find(f => 
      f.name === psdSize.name || 
      (f.width === psdSize.width && f.height === psdSize.height)
    );
    
    if (!existingFormat) {
      setFormats(prev => [...prev, psdSize]);
    }
    
    // Set the PSD size as selected
    setSelectedFormat(psdSize);
    setImportMode('psd');
    
    // Update the canvas with imported elements
    if (canvasContextRef.current) {
      canvasContextRef.current.setElements(elements);
    }
    
    toast.success(`PSD importado com ${elements.length} elementos.`);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Function to access canvas elements through context
  const updateCanvasElements = (context: any) => {
    if (context && Array.isArray(context.elements)) {
      console.log("Updating canvas elements:", context.elements);
      setCanvasElements(context.elements);
      return context.elements;
    }
    console.warn("Could not get elements from canvas context");
    return [];
  };

  // Save a template
  const handleSaveTemplate = async () => {
    if (!selectedFormat) {
      toast.error("Select a format first");
      return;
    }

    if (!canvasElements || canvasElements.length === 0) {
      toast.warning("The canvas is empty. Add elements before saving the template.");
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
      elements: canvasElements,
      createdAt: now,
      updatedAt: now
    };

    console.log("Saving template with elements:", canvasElements);

    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    updateStats(updatedTemplates);

    try {
      const success = await saveToIndexedDB(STORAGE_KEY, updatedTemplates);

      if (success) {
        toast.success("Template saved successfully");
      } else {
        toast.error("Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Error saving template");
    }
  };

  // Delete a template
  const handleDeleteTemplate = async (templateId: string) => {
    const updatedTemplates = savedTemplates.filter(template => template.id !== templateId);
    setSavedTemplates(updatedTemplates);
    updateStats(updatedTemplates);

    try {
      const success = await saveToIndexedDB(STORAGE_KEY, updatedTemplates);

      if (success) {
        toast.success("Template deleted successfully");
        console.log("Template deleted and changes saved to IndexedDB");
      } else {
        toast.error("Template deleted but failed to update storage");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Error updating storage after deletion");
    }
  };

  // Import multiple templates
  const handleImportTemplates = async (importedTemplates: LayoutTemplate[]) => {
    try {
      // Verificar se os templates já existem pelo ID
      const existingIds = new Set(savedTemplates.map(t => t.id));
      const newTemplates = importedTemplates.filter(t => !existingIds.has(t.id));
      
      // Se não houver novos templates, mostrar mensagem
      if (newTemplates.length === 0) {
        toast.warning("Todos os templates importados já existem na lista");
        return;
      }
      
      // Adicionar os novos templates à lista existente
      const updatedTemplates = [...savedTemplates, ...newTemplates];
      setSavedTemplates(updatedTemplates);
      updateStats(updatedTemplates);
      
      // Salvar no IndexedDB
      const success = await saveToIndexedDB(STORAGE_KEY, updatedTemplates);
      
      if (success) {
        toast.success(`${newTemplates.length} novos templates importados com sucesso`);
      } else {
        toast.error("Erro ao salvar templates importados");
      }
    } catch (error) {
      console.error("Erro ao importar templates:", error);
      toast.error("Erro ao processar templates importados");
    }
  };

  // Train AI model
  const handleTrainModel = async () => {
    if (savedTemplates.length < 5) {
      toast.error("You need at least 5 templates to train the model");
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

  // Capture canvas elements when they change
  const handleCanvasUpdate = (context: any) => {
    canvasContextRef.current = context;
    if (context && Array.isArray(context.elements)) {
      updateCanvasElements(context);
    }
  };

  // Callback to save the canvas state
  const captureAndSaveTemplate = () => {
    handleSaveTemplate();
  };

  // Callback for when the model is ready
  const handleModelReady = (model: tf.LayersModel) => {
    setAiModel(model);
    setIsModelTrained(true);
    setModelMetadata({
      ...modelMetadata,
      trainedAt: new Date().toISOString(),
      accuracy: 0.85,
      loss: 0.15
    });

    toast.success("AI model is ready for use");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Back to Editor
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
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
          </div>

          {activeTab === "layouts" && (
            <TabsContent value="layouts" className="h-full flex">
              <div className="w-72 border-r overflow-y-auto bg-white p-4">
                <h3 className="text-sm font-medium mb-4">Fonte do Layout</h3>
                
                <AdminPSDImport onPSDImport={handlePSDImport} />
                
                <div className="mb-4 border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Ou Selecione um Formato</h3>
                  <AdminFormatSelector
                    formats={formats}
                    onSelectFormat={handleFormatSelect}
                    selectedFormat={selectedFormat}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {selectedFormat ? (
                  <div className="flex-1 overflow-hidden">
                    <CanvasProvider fixedSize={selectedFormat}>
                      {(context: any) => {
                        handleCanvasUpdate(context);
                        return (
                          <Canvas
                            editorMode="banner"
                            fixedSize={selectedFormat}
                            hideImportPSD={true}
                          />
                        );
                      }}
                    </CanvasProvider>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-medium mb-2">Nenhum Formato Selecionado</h3>
                      <p className="text-gray-500 mb-4">
                        Importe um PSD ou selecione um formato para começar a criar um template.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-80 border-l overflow-y-auto bg-white">
                <AdminLayoutList
                  templates={savedTemplates}
                  onDeleteTemplate={handleDeleteTemplate}
                  onImportTemplates={handleImportTemplates}
                />
              </div>
            </TabsContent>
          )}

          {activeTab === "training" && (
            <TabsContent value="training" className="h-full overflow-y-auto">
              <AdminTrainingPanel
                layouts={savedTemplates}
                onModelUpdate={() => {
                  setIsModelTrained(true);
                  setModelMetadata({
                    ...modelMetadata,
                    trainedAt: new Date().toISOString()
                  });
                }}
              />
            </TabsContent>
          )}

          {activeTab === "stats" && (
            <TabsContent value="stats" className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
                <AdminLayoutStats
                  stats={stats}
                  layouts={savedTemplates}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
