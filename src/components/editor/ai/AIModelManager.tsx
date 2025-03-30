import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Cpu, Download, Upload } from 'lucide-react';
import { LayoutTemplate } from '@/components/editor/types/admin';
import * as tf from '@tensorflow/tfjs';
import { toast } from 'sonner';

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

  useEffect(() => {
    // Tentar carregar o modelo se já estiver treinado
    if (isModelTrained && !model) {
      loadModelFromLocalStorage();
    }
  }, [isModelTrained]);

  const loadModelFromLocalStorage = async () => {
    try {
      setIsLoading(true);
      
      // Para fins de demonstração, vamos criar um modelo simples
      // Em um cenário real, você carregaria um modelo salvo
      const demoModel = tf.sequential();
      demoModel.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
      demoModel.add(tf.layers.dense({ units: 20, activation: 'relu' }));
      demoModel.add(tf.layers.dense({ units: 4, activation: 'sigmoid' }));
      
      demoModel.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });
      
      // Simular loading
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

  const exportModel = async () => {
    if (!model) {
      toast.error("Nenhum modelo disponível para exportar");
      return;
    }

    try {
      setIsLoading(true);
      
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em um cenário real, você usaria:
      // await model.save('downloads://layout-ai-model');
      
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
      
      // Simular importação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em um cenário real, você usaria:
      // const importedModel = await tf.loadLayersModel(/* de um upload ou URL */);
      // setModel(importedModel);
      // onModelReady(importedModel);
      
      // Criar um modelo de exemplo para demonstração
      const demoModel = tf.sequential();
      demoModel.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
      demoModel.add(tf.layers.dense({ units: 20, activation: 'relu' }));
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
              onClick={onTrainModel}
              disabled={templates.length < 5 || isLoading}
              className="w-full"
              variant={isModelTrained ? "outline" : "default"}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isModelTrained ? "Treinar Novamente" : "Treinar Modelo"}
            </Button>
          </div>
          
          {templates.length < 5 && (
            <p className="text-xs text-amber-600 mt-2">
              Você precisa de pelo menos 5 layouts para treinar o modelo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
