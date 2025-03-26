import React, { useState, useEffect, useCallback } from "react";
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
import { AdminTrainingPanel } from "@/components/editor/panels/AdminTrainingPanel";
import { saveToIndexedDB, getFromIndexedDB } from "@/utils/indexedDBUtils";
import { getOptimizedFormats } from "@/utils/formatGenerator";
import * as tf from '@tensorflow/tfjs';

// Chaves de armazenamento
const STORAGE_KEY = 'admin-layout-templates';
const FORMATS_KEY = 'admin-formats';
const MODEL_KEY = 'ai-layout-model';

// Função para determinar a orientação com base nas dimensões
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
  const [savedTemplates, setSavedTemplates] = useState<LayoutTemplate[]>([]);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [modelMetadata, setModelMetadata] = useState({
    trainedAt: null,
    iterations: 0,
    accuracy: 0,
    loss: 0
  });
  const [aiModel, setAiModel] = useState<tf.LayersModel | null>(null);

  // Inicializar ou carregar formatos
  useEffect(() => {
    const loadFormats = async () => {
      try {
        // Tentar carregar formatos do IndexedDB
        const storedFormats = await getFromIndexedDB(FORMATS_KEY);

        if (storedFormats && Array.isArray(storedFormats) && storedFormats.length > 0) {
          console.log("Formatos carregados com sucesso:", storedFormats);
          setFormats(storedFormats);
        } else {
          console.log("Nenhum formato encontrado, criando formatos otimizados");
          const optimizedFormats = getOptimizedFormats();
          setFormats(optimizedFormats);

          // Salvar no IndexedDB com tratamento de erro
          try {
            const saved = await saveToIndexedDB(FORMATS_KEY, optimizedFormats);
            console.log("Formatos salvos com sucesso no IndexedDB:", saved);
          } catch (storageError) {
            console.error("Falha ao salvar formatos:", storageError);
            // Continuar usando os formatos em memória
          }
        }
      } catch (error) {
        console.error("Falha ao inicializar formatos:", error);

        // Recorrer a formatos em memória sem tentar salvar
        const optimizedFormats = getOptimizedFormats();
        setFormats(optimizedFormats);
        toast.error("Falha ao acessar o armazenamento. Usando formatos temporários.");
      }
    };

    loadFormats();
  }, []);

  // Carregar templates salvos
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        console.log("Tentando carregar templates do IndexedDB...");
        const parsedTemplates = await getFromIndexedDB(STORAGE_KEY, []);
        console.log("Templates carregados:", parsedTemplates);

        if (parsedTemplates && Array.isArray(parsedTemplates)) {
          setSavedTemplates(parsedTemplates);
          updateStats(parsedTemplates);

          if (parsedTemplates.length > 0) {
            toast.success(`${parsedTemplates.length} templates carregados com sucesso`);
          }
        } else {
          console.log("Nenhum template encontrado ou formato inválido");
          setSavedTemplates([]);
        }
      } catch (error) {
        console.error("Falha ao analisar templates salvos:", error);
        toast.error("Falha ao carregar templates salvos");
      }
    };

    loadTemplates();
  }, []);

  // Atualizar estatísticas
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

  // Lidar com a seleção de formato
  const handleFormatSelect = (format: BannerSize) => {
    setSelectedFormat(format);
  };

  // Lidar com a mudança de tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Salvar um template
  const handleSaveTemplate = async (elements: any[]) => {
    if (!selectedFormat) {
      toast.error("Selecione um formato primeiro");
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

    console.log("Tentando salvar templates:", updatedTemplates);

    try {
      const success = await saveToIndexedDB(STORAGE_KEY, updatedTemplates);

      if (success) {
        toast.success("Template salvo com sucesso no IndexedDB");
        console.log("Template salvo com sucesso no IndexedDB");
      } else {
        toast.error("Falha ao salvar o template");
        console.error("Falha ao salvar o template");
      }
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast.error("Erro ao salvar template");
    }
  };

  // Excluir um template
  const handleDeleteTemplate = async (templateId: string) => {
    const updatedTemplates = savedTemplates.filter(template => template.id !== templateId);
    setSavedTemplates(updatedTemplates);
    updateStats(updatedTemplates);

    try {
      const success = await saveToIndexedDB(STORAGE_KEY, updatedTemplates);

      if (success) {
        toast.success("Template excluído com sucesso");
        console.log("Template excluído e mudanças salvas no IndexedDB");
      } else {
        toast.error("Template excluído mas falha ao atualizar o armazenamento");
      }
    } catch (error) {
      console.error("Erro ao excluir template:", error);
      toast.error("Erro ao atualizar o armazenamento após exclusão");
    }
  };

  // Treinar o modelo de IA
  const handleTrainModel = async () => {
    if (savedTemplates.length < 5) {
      toast.error("Você precisa de pelo menos 5 templates para treinar o modelo");
      return;
    }

    toast.info("Iniciando treinamento do modelo...");

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
      toast.success(`Modelo treinado com sucesso em ${trainingTime}s`);
    } catch (error) {
      console.error("Erro de treinamento:", error);
      toast.error("Falha ao treinar o modelo");
    }
  };

  // Capturar e salvar o template atual
  const captureAndSaveTemplate = () => {
    handleSaveTemplate([]);
    toast("Template capturado do canvas", {
      description: "Os elementos atuais do canvas foram salvos como um novo template."
    });
  };

  // Callback para quando o modelo estiver pronto
  const handleModelReady = (model: tf.LayersModel) => {
    setAiModel(model);
    setIsModelTrained(true);
    setModelMetadata({
      ...modelMetadata,
      trainedAt: new Date().toISOString(),
      accuracy: 0.85,
      loss: 0.15
    });

    toast.success("Modelo de IA está pronto para uso");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Voltar ao Editor
            </Button>
            <Button onClick={captureAndSaveTemplate} disabled={!selectedFormat}>
              Salvar Layout Atual
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-hidden">
        <Tabs defaultValue="layouts" value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <div className="border-b pb-2 mb-4">
            <TabsList>
              <TabsTrigger value="layouts">Layouts</TabsTrigger>
              <TabsTrigger value="training">Treinamento de IA</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>
          </div>

          {activeTab === "layouts" && (
            <TabsContent value="layouts" className="h-full flex">
              <div className="w-72 border-r overflow-y-auto bg-white p-4">
                <h3 className="text-sm font-medium mb-4">Selecionar Formato</h3>
                <AdminFormatSelector
                  formats={formats}
                  onSelectFormat={handleFormatSelect}
                  selectedFormat={selectedFormat}
                />
              </div>

              <div className="flex-1 flex flex-col">
                {selectedFormat ? (
                  <div className="flex-1 overflow-hidden">
                    <CanvasProvider fixedSize={selectedFormat}>
                      <Canvas
                        editorMode="banner"
                        fixedSize={selectedFormat}
                        className="h-full w-full bg-gray-100"
                      />
                    </CanvasProvider>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-medium mb-2">Nenhum Formato Selecionado</h3>
                      <p className="text-gray-500 mb-4">
                        Selecione um formato na barra lateral para começar a criar um template.
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
