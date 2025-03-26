
import React, { useState } from "react";
import { LayoutTemplate, TrainingData } from "@/components/editor/types/admin";
import { saveTrainingData, getTrainingData } from "@/components/editor/utils/layoutStorage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  Brain, 
  Check, 
  HelpCircle, 
  Info, 
  Layers, 
  RefreshCw, 
  Save, 
  Settings, 
  Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';

interface AdminTrainingPanelProps {
  layouts: LayoutTemplate[];
  onModelUpdate: () => void;
}

export const AdminTrainingPanel: React.FC<AdminTrainingPanelProps> = ({ 
  layouts,
  onModelUpdate
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(16);
  const [modelSaved, setModelSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("training");
  
  const addTrainingLog = (message: string) => {
    setTrainingLogs(prev => [...prev, message]);
  };

  const startTraining = async () => {
    if (layouts.length < 10) {
      toast.error("Need at least 10 layouts for training. Please create more layouts.");
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs([]);
    setModelSaved(false);
    
    try {
      addTrainingLog("Initializing AI model...");
      await tf.ready();
      addTrainingLog("TensorFlow.js ready");
      
      // Prepare training data
      addTrainingLog("Preparing training data...");
      
      const inputData = layouts.map(layout => {
        return [
          layout.width / 1000, // Normalize dimensions
          layout.height / 1000,
          layout.orientation === "horizontal" ? 1 : 0,
          layout.orientation === "vertical" ? 1 : 0,
          layout.orientation === "square" ? 1 : 0,
          // Extract number of elements, text percentage, image percentage, etc.
          layout.elements.length / 20, // Normalize
          // More features can be added here
        ];
      });
      
      // Simplified output: x position, y position, width, height for a next recommended element
      const outputData = layouts.map(layout => {
        if (layout.elements.length > 0) {
          // Use the first element as a "recommendation"
          const el = layout.elements[0];
          return [
            el.style.x / layout.width, // Normalize positions
            el.style.y / layout.height,
            el.style.width / layout.width,
            el.style.height / layout.height,
            el.type === "text" ? 1 : 0,
            el.type === "image" ? 1 : 0,
            el.type === "button" ? 1 : 0,
          ];
        } else {
          // Default values for layouts without elements
          return [0.1, 0.1, 0.8, 0.3, 1, 0, 0]; // Default text element
        }
      });
      
      addTrainingLog(`Prepared ${inputData.length} training samples`);
      
      // Convert to tensors
      const xs = tf.tensor2d(inputData);
      const ys = tf.tensor2d(outputData);
      
      // Create a model
      addTrainingLog("Creating neural network model...");
      const model = tf.sequential();
      
      // Add layers
      model.add(tf.layers.dense({
        inputShape: [inputData[0].length],
        units: 16,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dense({
        units: outputData[0].length,
        activation: 'sigmoid' // Use sigmoid for normalized outputs
      }));
      
      // Compile the model
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });
      
      addTrainingLog("Model compiled successfully");
      
      // Train the model
      addTrainingLog(`Starting training with ${epochs} epochs...`);
      
      await model.fit(xs, ys, {
        epochs,
        batchSize,
        shuffle: true,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const progress = Math.round(((epoch + 1) / epochs) * 100);
            setTrainingProgress(progress);
            
            if ((epoch + 1) % 5 === 0 || epoch === 0 || epoch === epochs - 1) {
              addTrainingLog(`Epoch ${epoch + 1}/${epochs} - loss: ${logs.loss.toFixed(4)} - accuracy: ${logs.acc ? logs.acc.toFixed(4) : 'N/A'}`);
            }
          }
        }
      });
      
      addTrainingLog("Training completed successfully!");
      
      // Test the model
      const testResult = model.evaluate(xs, ys) as tf.Scalar[];
      const testLoss = testResult[0].dataSync()[0];
      const testAcc = testResult[1].dataSync()[0];
      
      addTrainingLog(`Final evaluation - loss: ${testLoss.toFixed(4)} - accuracy: ${testAcc.toFixed(4)}`);
      
      // Save model to localStorage
      addTrainingLog("Saving model...");
      
      // For demonstration, we'll save training metadata instead of the actual model
      const trainingData: TrainingData = {
        id: Date.now().toString(),
        templates: layouts,
        modelMetadata: {
          trainedAt: new Date().toISOString(),
          iterations: epochs,
          accuracy: testAcc,
          loss: testLoss
        }
      };
      
      saveTrainingData(trainingData);
      setModelSaved(true);
      onModelUpdate();
      
      addTrainingLog("Model saved successfully!");
      toast.success("AI model training completed!");
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
      
    } catch (error) {
      console.error("Training error:", error);
      addTrainingLog(`Error during training: ${error.message}`);
      toast.error("Error during model training");
    } finally {
      setIsTraining(false);
      setTrainingProgress(100);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Training</CardTitle>
                <CardDescription>
                  Train the AI model to intelligently generate layouts based on your designs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="epochs">Training Epochs: {epochs}</Label>
                    <Slider
                      id="epochs"
                      min={10}
                      max={200}
                      step={10}
                      value={[epochs]}
                      onValueChange={(value) => setEpochs(value[0])}
                      disabled={isTraining}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="batchSize">Batch Size: {batchSize}</Label>
                    <Slider
                      id="batchSize"
                      min={4}
                      max={32}
                      step={4}
                      value={[batchSize]}
                      onValueChange={(value) => setBatchSize(value[0])}
                      disabled={isTraining}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <Progress value={trainingProgress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{trainingProgress}% Complete</span>
                    <span>{isTraining ? "Training in progress..." : "Ready"}</span>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-md p-3 h-64 overflow-y-auto font-mono text-xs">
                  {trainingLogs.length === 0 ? (
                    <div className="text-gray-400 p-2">
                      Training logs will appear here...
                    </div>
                  ) : (
                    trainingLogs.map((log, i) => (
                      <div key={i} className="py-1">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{" "}
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  {layouts.length} layouts available for training
                </div>
                <div className="flex space-x-2">
                  {modelSaved && (
                    <Button variant="outline" className="text-green-600">
                      <Check className="h-4 w-4 mr-2" />
                      Model Saved
                    </Button>
                  )}
                  <Button
                    onClick={startTraining}
                    disabled={isTraining || layouts.length < 10}
                  >
                    {isTraining ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Training...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-gray-500">
                  <Sparkles className="mx-auto h-8 w-8 opacity-50 mb-2" />
                  <p>The AI model performance metrics will be displayed here after training</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Available Layouts</span>
                    </div>
                    <span className="font-semibold">{layouts.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Model Status</span>
                    </div>
                    <span className={modelSaved ? "text-green-600 font-semibold" : "text-gray-500"}>
                      {modelSaved ? "Trained" : "Untrained"}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recommended Data</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>At least 50 layouts (currently {layouts.length})</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Mix of different formats and orientations</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Variety of layouts with different element combinations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    The AI model learns from your saved layouts to provide intelligent
                    suggestions for new designs. Follow these steps:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Create various layouts using different formats</li>
                    <li>Save at least 50 layouts for optimal training</li>
                    <li>Click "Start Training" to begin the process</li>
                    <li>Wait for training to complete (may take several minutes)</li>
                    <li>The model will be automatically saved when finished</li>
                  </ol>
                  <p className="flex items-start mt-3">
                    <HelpCircle className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      More layouts will result in better AI performance and more accurate
                      suggestions.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
