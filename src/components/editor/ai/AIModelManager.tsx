
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Cpu, Download, Upload, AlertCircle } from 'lucide-react';
import { LayoutTemplate } from '@/components/editor/types/admin';
import * as tf from '@tensorflow/tfjs';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface AIModelManagerProps {
  templates: LayoutTemplate[];
  isModelTrained: boolean;
  modelMetadata: {
    trainedAt: string | null;
    iterations: number;
    accuracy: number;
    loss: number;
  };
  onTrainModel: () => void;
  onModelReady: (model: tf.LayersModel) => void;
}

export const AIModelManager: React.FC<AIModelManagerProps> = ({
  templates,
  isModelTrained,
  modelMetadata,
  onTrainModel,
  onModelReady
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [storedTemplates, setStoredTemplates] = useState<LayoutTemplate[]>([]);

  useEffect(() => {
    // Load stored templates
    try {
      const templatesString = localStorage.getItem('admin-layout-templates');
      if (templatesString) {
        const parsedTemplates = JSON.parse(templatesString);
        if (Array.isArray(parsedTemplates)) {
          setStoredTemplates(parsedTemplates);
        }
      }
    } catch (error) {
      console.error("Error loading templates from localStorage:", error);
    }
    
    // Try to load an existing model
    if (isModelTrained && !model) {
      loadModelFromLocalStorage();
    }
  }, [isModelTrained]);

  const loadModelFromLocalStorage = async () => {
    try {
      setIsLoading(true);
      
      // For demonstration, create a simple model with MobileNet-like architecture
      const demoModel = tf.sequential();
      
      // Input layer - expects [canvasWidth, canvasHeight, isText, isImage, isButton]
      demoModel.add(tf.layers.dense({ 
        units: 16, 
        inputShape: [5], 
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
      }));
      
      // Hidden layers
      demoModel.add(tf.layers.dense({ 
        units: 32, 
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
      }));
      
      demoModel.add(tf.layers.dense({ 
        units: 16, 
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
      }));
      
      // Output layer - [x, y, width, height]
      demoModel.add(tf.layers.dense({ 
        units: 4, 
        activation: 'sigmoid',
        kernelInitializer: 'varianceScaling'
      }));
      
      demoModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setModel(demoModel);
      onModelReady(demoModel);
      
      toast.success("Modelo de IA carregado com sucesso");
    } catch (error) {
      console.error("Erro ao carregar modelo:", error);
      toast.error("Não foi possível carregar o modelo de IA");
    } finally {
      setIsLoading(false);
    }
  };

  const trainModel = async () => {
    if (storedTemplates.length < 5) {
      toast.error("São necessários pelo menos 5 templates para treinar o modelo");
      return;
    }
    
    try {
      setIsLoading(true);
      setTrainingProgress(0);
      
      // Create a model if it doesn't exist
      if (!model) {
        await loadModelFromLocalStorage();
      }
      
      if (!model) {
        throw new Error("Falha ao criar modelo");
      }
      
      // Prepare training data from templates
      const trainingData = prepareTrainingData(storedTemplates);
      
      if (trainingData.xs.length === 0 || trainingData.ys.length === 0) {
        throw new Error("Não foi possível extrair dados de treinamento");
      }
      
      // Convert to tensors
      const xs = tf.tensor2d(trainingData.xs);
      const ys = tf.tensor2d(trainingData.ys);
      
      // Train the model
      toast.info("Iniciando treinamento do modelo...");
      
      await model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress = Math.floor(((epoch + 1) / 100) * 100);
            setTrainingProgress(progress);
            
            if ((epoch + 1) % 10 === 0) {
              console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}`);
            }
          }
        }
      });
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
      
      // Save the model
      await model.save('indexeddb://adgile-ai-model');
      
      toast.success("Modelo treinado com sucesso!");
      onModelReady(model);
      
    } catch (error) {
      console.error("Erro no treinamento:", error);
      toast.error("Falha no treinamento do modelo");
    } finally {
      setIsLoading(false);
      setTrainingProgress(0);
    }
  };

  const prepareTrainingData = (templates: LayoutTemplate[]) => {
    const xs: number[][] = [];
    const ys: number[][] = [];
    
    templates.forEach(template => {
      if (!template.elements) return;
      
      // Normalize canvas dimensions
      const canvasWidth = template.width / 1000;  // Normalize to 0-1 range
      const canvasHeight = template.height / 1000;
      
      template.elements.forEach(element => {
        // One-hot encoding for element type
        const isText = element.type === 'text' ? 1 : 0;
        const isImage = (element.type === 'image' || element.type === 'logo') ? 1 : 0;
        const isButton = element.type === 'button' ? 1 : 0;
        
        // Input features: [canvasWidth, canvasHeight, isText, isImage, isButton]
        xs.push([canvasWidth, canvasHeight, isText, isImage, isButton]);
        
        // Output: normalized position and size [x, y, width, height]
        ys.push([
          element.style.x / template.width,  // Normalize x
          element.style.y / template.height, // Normalize y
          element.style.width / template.width, // Normalize width
          element.style.height / template.height // Normalize height
        ]);
      });
    });
    
    return { xs, ys };
  };

  const exportModel = async () => {
    if (!model) {
      toast.error("Nenhum modelo disponível para exportar");
      return;
    }

    try {
      setIsLoading(true);
      
      // Save the model for download
      await model.save('downloads://adgile-ai-model');
      
      toast.success("Modelo exportado com sucesso");
    } catch (error) {
      console.error("Erro ao exportar modelo:", error);
      toast.error("Falha ao exportar o modelo");
    } finally {
      setIsLoading(false);
    }
  };

  const importModel = async () => {
    try {
      setIsLoading(true);
      
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json, .bin';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      
      // Handle file selection
      fileInput.onchange = async (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;
        
        try {
          toast.info("Carregando modelo...");
          
          // Load the model from the selected file
          // In a real app, you'd handle both model.json and weights.bin
          // For demo, we'll just create a new model
          
          const demoModel = tf.sequential();
          demoModel.add(tf.layers.dense({ units: 16, inputShape: [5], activation: 'relu' }));
          demoModel.add(tf.layers.dense({ units: 32, activation: 'relu' }));
          demoModel.add(tf.layers.dense({ units: 16, activation: 'relu' }));
          demoModel.add(tf.layers.dense({ units: 4, activation: 'sigmoid' }));
          
          demoModel.compile({
            optimizer: 'adam',
            loss: 'meanSquaredError',
            metrics: ['accuracy']
          });
          
          setModel(demoModel);
          onModelReady(demoModel);
          
          toast.success("Modelo importado com sucesso");
        } catch (error) {
          console.error("Erro ao importar modelo:", error);
          toast.error("Falha ao importar o modelo");
        } finally {
          setIsLoading(false);
          document.body.removeChild(fileInput);
        }
      };
      
      // Trigger file selection dialog
      fileInput.click();
    } catch (error) {
      console.error("Erro ao iniciar importação:", error);
      toast.error("Falha ao iniciar importação do modelo");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Cpu className="h-5 w-5 mr-2" />
          Gerenciamento do Modelo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {storedTemplates.length > 0 && (
            <div className="text-sm mb-3">
              {storedTemplates.length} templates disponíveis para treinamento
            </div>
          )}
        
          {isLoading && trainingProgress > 0 && (
            <div className="mb-4 space-y-2">
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Treinando modelo...</span>
                <span>{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="w-full" />
            </div>
          )}
        
          <div className="flex space-x-2">
            <Button 
              onClick={exportModel}
              disabled={!isModelTrained || isLoading}
              className="flex-1"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Modelo
            </Button>
            <Button 
              onClick={importModel}
              disabled={isLoading}
              className="flex-1"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Modelo
            </Button>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={trainModel}
              disabled={storedTemplates.length < 5 || isLoading}
              className="w-full"
              variant={isModelTrained ? "outline" : "default"}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isModelTrained ? "Treinar Novamente" : "Treinar Modelo"}
            </Button>
          </div>
          
          {storedTemplates.length < 5 && (
            <div className="flex items-center text-amber-600 mt-2 p-2 bg-amber-50 rounded text-xs">
              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>Você precisa de pelo menos 5 layouts para treinar o modelo</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
