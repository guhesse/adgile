
import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { LayoutTemplate } from '../types/admin';
import { BannerSize } from '../types';
import { Brain, RefreshCw, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface AIModelManagerProps {
  templates: LayoutTemplate[];
  isModelTrained?: boolean;
  modelMetadata?: {
    trainedAt: string | null;
    iterations: number;
    accuracy: number;
    loss: number;
  };
  onTrainModel?: () => Promise<void>;
  onModelReady?: (model: tf.LayersModel) => void;
}

export const AIModelManager: React.FC<AIModelManagerProps> = ({
  templates = [],
  isModelTrained = false,
  modelMetadata = {
    trainedAt: null,
    iterations: 0,
    accuracy: 0,
    loss: 0
  },
  onTrainModel,
  onModelReady
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  
  // Inicializar o TensorFlow.js
  useEffect(() => {
    const initialize = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow.js inicializado com sucesso");
      } catch (error) {
        console.error("Erro ao inicializar TensorFlow.js:", error);
      }
    };
    
    initialize();
  }, []);
  
  const addTrainingLog = (message: string) => {
    setTrainingLogs(prev => [...prev, message]);
  };
  
  const handleTrainModel = async () => {
    if (templates.length < 5) {
      toast.error("Você precisa de pelo menos 5 templates para treinar o modelo");
      return;
    }
    
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs([]);
    
    try {
      addTrainingLog("Inicializando o modelo de IA...");
      
      // Se temos um handler de treinamento externo, usamos ele
      if (onTrainModel) {
        await onTrainModel();
        setTrainingProgress(100);
        setIsTraining(false);
        return;
      }
      
      // Caso contrário, implementamos nossa própria lógica de treinamento
      await tf.ready();
      addTrainingLog("TensorFlow.js pronto");
      
      // Preparar dados de treinamento
      addTrainingLog("Preparando dados de treinamento...");
      
      // Criar e treinar um modelo simples para demonstração
      const model = tf.sequential();
      
      // Input shape: [width, height, isHorizontal, isVertical, isSquare]
      model.add(tf.layers.dense({
        inputShape: [5],
        units: 16,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
      }));
      
      // Output: [x, y, width, height]
      model.add(tf.layers.dense({
        units: 4,
        activation: 'sigmoid' // Para valores entre 0-1
      }));
      
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });
      
      addTrainingLog("Modelo compilado com sucesso");
      
      // Dados de treinamento simulados
      const inputData = templates.map(template => {
        return [
          template.width / 1000, // Normalizar dimensões 
          template.height / 1000,
          template.orientation === 'horizontal' ? 1 : 0,
          template.orientation === 'vertical' ? 1 : 0,
          template.orientation === 'square' ? 1 : 0,
        ];
      });
      
      // Saídas simuladas (posição e tamanho de um elemento)
      const outputData = templates.map(template => {
        // Preferências para posicionamento baseado na orientação
        let x, y, width, height;
        
        if (template.orientation === 'horizontal') {
          x = 0.1; // 10% da largura 
          y = 0.2; // 20% da altura
          width = 0.6; // 60% da largura
          height = 0.4; // 40% da altura
        } else if (template.orientation === 'vertical') {
          x = 0.1; // 10% da largura
          y = 0.1; // 10% da altura 
          width = 0.8; // 80% da largura
          height = 0.3; // 30% da altura
        } else { // square
          x = 0.2; // 20% da largura
          y = 0.2; // 20% da altura
          width = 0.6; // 60% da largura
          height = 0.6; // 60% da altura
        }
        
        return [x, y, width, height];
      });
      
      const xs = tf.tensor2d(inputData);
      const ys = tf.tensor2d(outputData);
      
      // Iterações simuladas
      const totalEpochs = 50;
      
      await model.fit(xs, ys, {
        epochs: totalEpochs,
        batchSize: 8,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const progress = Math.round(((epoch + 1) / totalEpochs) * 100);
            setTrainingProgress(progress);
            
            if ((epoch + 1) % 5 === 0 || epoch === 0 || epoch === totalEpochs - 1) {
              addTrainingLog(`Época ${epoch + 1}/${totalEpochs} - perda: ${logs?.loss?.toFixed(4) || 'N/A'}`);
            }
          }
        }
      });
      
      setModel(model);
      if (onModelReady) {
        onModelReady(model);
      }
      
      addTrainingLog("Treinamento concluído com sucesso!");
      
      // Testar o modelo
      const testInput = tf.tensor2d([[0.8, 1.2, 0, 1, 0]]); // formato vertical
      const prediction = model.predict(testInput) as tf.Tensor;
      const predictionData = prediction.dataSync();
      
      addTrainingLog(`Teste: posição (${predictionData[0].toFixed(2)}, ${predictionData[1].toFixed(2)}), tamanho ${predictionData[2].toFixed(2)}x${predictionData[3].toFixed(2)}`);
      
      // Limpar tensores
      xs.dispose();
      ys.dispose();
      testInput.dispose();
      prediction.dispose();
      
      // Notificar usuário
      toast.success("Modelo de IA treinado com sucesso!");
      
    } catch (error) {
      console.error("Erro durante o treinamento:", error);
      addTrainingLog(`Erro durante o treinamento: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Erro durante o treinamento do modelo");
    } finally {
      setIsTraining(false);
      setTrainingProgress(100);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Treinamento de IA</CardTitle>
        <CardDescription>
          Treine o modelo de IA com base nos seus layouts para obter sugestões inteligentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-500" />
            <span>Status do Modelo</span>
          </div>
          <div>
            {isModelTrained || model ? (
              <span className="text-green-600 font-medium flex items-center">
                <Check className="h-4 w-4 mr-1" /> Treinado
              </span>
            ) : (
              <span className="text-gray-500">Não treinado</span>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Layouts disponíveis para treinamento</span>
            <span className={templates.length < 5 ? "text-amber-500" : "text-green-600"}>
              {templates.length}
            </span>
          </div>
          <Progress 
            value={Math.min(templates.length / 20 * 100, 100)} 
            className="h-2" 
          />
          {templates.length < 5 && (
            <div className="flex items-start mt-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
              <span>Você precisa de pelo menos 5 layouts para treinar o modelo (recomendado: 20+)</span>
            </div>
          )}
        </div>
        
        {(isTraining || trainingLogs.length > 0) && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Progresso do Treinamento</h4>
              <Progress value={trainingProgress} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{trainingProgress}% Completo</span>
                <span>{isTraining ? "Treinamento em andamento..." : "Concluído"}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 border rounded p-2 h-32 overflow-y-auto font-mono text-xs">
              {trainingLogs.map((log, i) => (
                <div key={i} className="py-0.5">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{" "}
                  {log}
                </div>
              ))}
              {trainingLogs.length === 0 && (
                <div className="text-gray-400 p-2">
                  Os logs de treinamento aparecerão aqui...
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm flex items-center">
          <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
          {templates.length < 5 ? (
            <span className="text-gray-500">Adicione mais layouts primeiro</span>
          ) : (
            <span className="text-gray-500">Pronto para treinar</span>
          )}
        </div>
        <Button
          onClick={handleTrainModel}
          disabled={isTraining || templates.length < 5}
        >
          {isTraining ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Treinando...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Treinar Modelo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
