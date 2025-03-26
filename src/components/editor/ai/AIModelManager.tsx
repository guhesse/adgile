
import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { toast } from 'sonner';
import { useCanvas } from '../CanvasContext';
import { EditorElement, BannerSize } from '../types';

interface AIModelManagerProps {
  onModelReady?: (model: tf.LayersModel) => void;
}

export const AIModelManager: React.FC<AIModelManagerProps> = ({ onModelReady }) => {
  const { elements } = useCanvas();
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasTrainedModel, setHasTrainedModel] = useState(false);
  const [datasetSize, setDatasetSize] = useState(0);
  
  // Create a simple model for element positioning based on canvas size
  const createModel = useCallback(async () => {
    try {
      // Create a sequential model
      const newModel = tf.sequential();
      
      // Add input layer - features: width, height of canvas and element type (one-hot encoded)
      newModel.add(tf.layers.dense({
        inputShape: [7], // [canvasWidth, canvasHeight, isText, isImage, isButton, isContainer, isBackground]
        units: 64,
        activation: 'relu'
      }));
      
      // Add hidden layer
      newModel.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
      }));
      
      // Add output layer - predictions: x, y, width, height
      newModel.add(tf.layers.dense({
        units: 4,
        activation: 'linear' // Linear activation for position and size values
      }));
      
      // Compile the model
      newModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mse']
      });
      
      setModel(newModel);
      toast.success("AI Model created successfully");
      return newModel;
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error("Failed to create AI model");
      return null;
    }
  }, []);
  
  // Prepare the dataset from existing elements and their canvas sizes
  const prepareDataset = useCallback(() => {
    if (elements.length === 0) {
      toast.warning("No elements available for training");
      return null;
    }
    
    const inputs: number[][] = [];
    const outputs: number[][] = [];
    let count = 0;
    
    elements.forEach(element => {
      // Only use elements with valid sizing information
      if (element.style && element.sizeId) {
        // Get canvas size
        const sizeId = element.sizeId === 'global' ? 'global' : element.sizeId;
        const canvas = { width: 1440, height: 900 }; // Default values
        
        // One-hot encoding for element type
        const isText = element.type === 'text' ? 1 : 0;
        const isImage = element.type === 'image' || element.type === 'logo' ? 1 : 0;
        const isButton = element.type === 'button' ? 1 : 0;
        const isContainer = element.type === 'container' || element.type === 'layout' ? 1 : 0;
        const isBackground = element.type === 'artboard-background' ? 1 : 0;
        
        // Input features
        inputs.push([
          canvas.width, 
          canvas.height, 
          isText, 
          isImage, 
          isButton, 
          isContainer,
          isBackground
        ]);
        
        // Output targets (normalized)
        outputs.push([
          element.style.x / canvas.width,  // Normalized x position
          element.style.y / canvas.height, // Normalized y position
          element.style.width / canvas.width, // Normalized width
          element.style.height / canvas.height // Normalized height
        ]);
        
        count++;
      }
    });
    
    if (count === 0) {
      toast.warning("No valid elements found for training");
      return null;
    }
    
    setDatasetSize(count);
    
    // Convert to tensors
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);
    
    return { xs, ys, count };
  }, [elements]);
  
  // Train the model with the prepared dataset
  const trainModel = useCallback(async () => {
    if (!model) {
      const newModel = await createModel();
      if (!newModel) return;
    }
    
    const dataset = prepareDataset();
    if (!dataset) return;
    
    const { xs, ys, count } = dataset;
    
    setIsTraining(true);
    setProgress(0);
    
    try {
      // Train the model
      await model!.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const newProgress = Math.floor(((epoch + 1) / 100) * 100);
            setProgress(newProgress);
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}`);
          },
          onTrainEnd: () => {
            setIsTraining(false);
            setHasTrainedModel(true);
            setProgress(100);
            
            if (onModelReady && model) {
              onModelReady(model);
            }
            
            toast.success(`Model trained successfully with ${count} elements`);
          }
        }
      });
      
      // Cleanup tensors
      xs.dispose();
      ys.dispose();
      
    } catch (error) {
      console.error('Error training model:', error);
      setIsTraining(false);
      toast.error("Training failed. See console for details.");
    }
  }, [model, prepareDataset, createModel, onModelReady]);
  
  // Make predictions with the trained model
  const predictElementPositioning = useCallback((
    canvasWidth: number, 
    canvasHeight: number, 
    elementType: string
  ) => {
    if (!model || !hasTrainedModel) {
      toast.error("No trained model available");
      return null;
    }
    
    try {
      // One-hot encoding for element type
      const isText = elementType === 'text' ? 1 : 0;
      const isImage = (elementType === 'image' || elementType === 'logo') ? 1 : 0;
      const isButton = elementType === 'button' ? 1 : 0;
      const isContainer = (elementType === 'container' || elementType === 'layout') ? 1 : 0;
      const isBackground = elementType === 'artboard-background' ? 1 : 0;
      
      // Create input tensor
      const input = tf.tensor2d([
        [canvasWidth, canvasHeight, isText, isImage, isButton, isContainer, isBackground]
      ]);
      
      // Make prediction
      const prediction = model.predict(input) as tf.Tensor;
      const values = prediction.dataSync();
      
      // Cleanup tensors
      input.dispose();
      prediction.dispose();
      
      // Denormalize the outputs
      return {
        x: Math.round(values[0] * canvasWidth),
        y: Math.round(values[1] * canvasHeight),
        width: Math.round(values[2] * canvasWidth),
        height: Math.round(values[3] * canvasHeight)
      };
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error("Error making prediction");
      return null;
    }
  }, [model, hasTrainedModel]);
  
  // Save the model to browser storage
  const saveModel = useCallback(async () => {
    if (!model || !hasTrainedModel) {
      toast.error("No trained model to save");
      return;
    }
    
    try {
      await model.save('localstorage://ai-layout-model');
      toast.success("Model saved to browser storage");
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error("Failed to save model");
    }
  }, [model, hasTrainedModel]);
  
  // Load a previously saved model
  const loadModel = useCallback(async () => {
    try {
      const loadedModel = await tf.loadLayersModel('localstorage://ai-layout-model');
      setModel(loadedModel);
      setHasTrainedModel(true);
      
      if (onModelReady) {
        onModelReady(loadedModel);
      }
      
      toast.success("Model loaded from browser storage");
    } catch (error) {
      console.error('Error loading model:', error);
      toast.warning("No saved model found. Creating a new one.");
      createModel();
    }
  }, [createModel, onModelReady]);
  
  // Initialize model on first load
  useEffect(() => {
    // Try to load an existing model first
    loadModel().catch(() => {
      // If loading fails, create a new model
      createModel();
    });
    
    // Cleanup
    return () => {
      if (model) {
        try {
          model.dispose();
        } catch (e) {
          console.error('Error disposing model:', e);
        }
      }
    };
  }, [createModel, loadModel]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Layout Assistant</CardTitle>
        <CardDescription>
          Train an AI model to suggest element positioning based on your designs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dataset Size:</span>
            <span className="text-sm">{datasetSize} elements</span>
          </div>
          
          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Training Progress:</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} max={100} />
            </div>
          )}
          
          {hasTrainedModel && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Model is trained and ready to use. You can now get AI suggestions for element positioning.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={trainModel} 
            disabled={isTraining}
          >
            {isTraining ? 'Training...' : 'Train Model'}
          </Button>
          
          {hasTrainedModel && (
            <Button 
              variant="outline" 
              onClick={saveModel}
              disabled={isTraining}
            >
              Save Model
            </Button>
          )}
        </div>
        
        <Button 
          variant="default" 
          onClick={loadModel}
          disabled={isTraining}
        >
          Load Model
        </Button>
      </CardFooter>
    </Card>
  );
};
