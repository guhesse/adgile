
import React, { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '../../ui/button';
import { AIModelManager } from './AIModelManager';
import { useCanvas } from '../CanvasContext';
import { EditorElement, BannerSize } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { toast } from 'sonner';
import { PopoverContent, Popover, PopoverTrigger } from '../../ui/popover';
import { Wand2 } from 'lucide-react';
import { LayoutTemplate } from '../types/admin';

export const AIFormatSuggestions: React.FC = () => {
  const { selectedSize, handleAddElement, elements, setElements } = useCanvas();
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Mock data for AIModelManager - in a real app you'd get this from a context or API
  const mockTemplates: LayoutTemplate[] = [];
  const mockModelMetadata = {
    trainedAt: new Date().toISOString(),
    iterations: 100,
    accuracy: 0.85,
    loss: 0.15
  };
  
  // Handle when model is ready
  const handleModelReady = useCallback((trainedModel: tf.LayersModel) => {
    setModel(trainedModel);
  }, []);
  
  // Mock train model function
  const handleTrainModel = async () => {
    // Simulate training process
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 2000);
    });
  };
  
  // Generate a suggested format based on the trained model
  const generateSuggestedFormat = useCallback(async () => {
    if (!model || !selectedSize) {
      toast.error("Model not ready or no size selected");
      return;
    }
    
    setIsGenerating(true);
    toast.info("Generating suggestions based on AI analysis...");
    
    try {
      // Common element types to generate
      const elementTypes = ['text', 'image', 'button', 'container'];
      const canvasWidth = selectedSize.width;
      const canvasHeight = selectedSize.height;
      
      // Generate suggestions for each element type
      const suggestedElements: EditorElement[] = [];
      
      for (const elementType of elementTypes) {
        // One-hot encoding for this element type
        const isText = elementType === 'text' ? 1 : 0;
        const isImage = elementType === 'image' ? 1 : 0;
        const isButton = elementType === 'button' ? 1 : 0;
        const isContainer = elementType === 'container' ? 1 : 0;
        const isBackground = 0; // Not generating background elements
        
        // Create input tensor
        const input = tf.tensor2d([
          [canvasWidth / 1000, canvasHeight / 1000, isText, isImage, isButton]
        ]);
        
        // Make prediction
        const prediction = model.predict(input) as tf.Tensor;
        const values = prediction.dataSync();
        
        // Denormalize values
        const x = Math.round(values[0] * canvasWidth);
        const y = Math.round(values[1] * canvasHeight);
        const width = Math.round(values[2] * canvasWidth);
        const height = Math.round(values[3] * canvasHeight);
        
        // Generate element ID
        const elementId = `ai-${elementType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Create element based on type
        let newElement: EditorElement = {
          id: elementId,
          type: elementType as any,
          content: '',
          sizeId: selectedSize.name,
          style: {
            x,
            y,
            width,
            height,
            backgroundColor: 'transparent',
          }
        };
        
        // Customize element properties based on type
        switch (elementType) {
          case 'text':
            newElement.content = 'AI Generated Text';
            newElement.style.fontSize = 16;
            newElement.style.fontWeight = 'normal';
            newElement.style.color = '#000000';
            break;
            
          case 'image':
            newElement.content = 'https://via.placeholder.com/300x200?text=AI+Generated+Image';
            break;
            
          case 'button':
            newElement.content = 'AI Button';
            newElement.style.backgroundColor = '#3b82f6';
            newElement.style.color = '#ffffff';
            newElement.style.padding = '8px 16px';
            newElement.style.borderRadius = 4;
            break;
            
          case 'container':
            newElement.style.backgroundColor = '#f9fafb';
            newElement.style.borderWidth = 1;
            newElement.style.borderColor = '#e5e7eb';
            newElement.style.borderStyle = 'solid';
            break;
        }
        
        suggestedElements.push(newElement);
        
        // Cleanup tensors
        input.dispose();
        prediction.dispose();
      }
      
      // Add all the suggested elements to the canvas
      setElements(prev => [...prev, ...suggestedElements]);
      
      toast.success(`Generated ${suggestedElements.length} elements using AI`);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  }, [model, selectedSize, setElements]);
  
  // Suggest positioning for a specific element type
  const suggestPositioning = useCallback((elementType: string) => {
    if (!model || !selectedSize) {
      toast.error("Model not ready or no size selected");
      return;
    }
    
    try {
      // Create input tensor with simplified features
      const isText = elementType === 'text' ? 1 : 0;
      const isImage = (elementType === 'image' || elementType === 'logo') ? 1 : 0;
      const isButton = elementType === 'button' ? 1 : 0;
      
      const input = tf.tensor2d([
        [selectedSize.width / 1000, selectedSize.height / 1000, isText, isImage, isButton]
      ]);
      
      // Make prediction
      const prediction = model.predict(input) as tf.Tensor;
      const values = prediction.dataSync();
      
      // Denormalize values
      const position = {
        x: Math.round(values[0] * selectedSize.width),
        y: Math.round(values[1] * selectedSize.height),
        width: Math.round(values[2] * selectedSize.width),
        height: Math.round(values[3] * selectedSize.height)
      };
      
      // Cleanup tensors
      input.dispose();
      prediction.dispose();
      
      return position;
    } catch (error) {
      console.error('Error suggesting positioning:', error);
      toast.error("Failed to suggest positioning");
      return null;
    }
  }, [model, selectedSize]);
  
  // Analyze existing elements and suggest improvements
  const analyzeExistingElements = useCallback(() => {
    if (!model || elements.length === 0 || !selectedSize) {
      toast.error("Model not ready or no elements to analyze");
      return;
    }
    
    try {
      let improvementsMade = 0;
      const updatedElements = elements.map(element => {
        // Skip elements without proper type or style information
        if (!element.type || !element.style) return element;
        
        // Get suggestion for this element type
        const suggestion = suggestPositioning(element.type);
        if (!suggestion) return element;
        
        // Calculate how far the current position is from the suggested position
        const xDiff = Math.abs(element.style.x - suggestion.x);
        const yDiff = Math.abs(element.style.y - suggestion.y);
        const widthDiff = Math.abs(element.style.width - suggestion.width);
        const heightDiff = Math.abs(element.style.height - suggestion.height);
        
        // Only adjust if the element is significantly off from the suggestion
        const significantDifference = 
          xDiff > selectedSize.width * 0.1 || 
          yDiff > selectedSize.height * 0.1 ||
          widthDiff > suggestion.width * 0.2 ||
          heightDiff > suggestion.height * 0.2;
        
        if (significantDifference) {
          improvementsMade++;
          return {
            ...element,
            style: {
              ...element.style,
              x: suggestion.x,
              y: suggestion.y,
              width: suggestion.width,
              height: suggestion.height
            }
          };
        }
        
        return element;
      });
      
      if (improvementsMade > 0) {
        setElements(updatedElements);
        toast.success(`Made ${improvementsMade} improvements to element positioning`);
      } else {
        toast.info("No significant improvements needed");
      }
    } catch (error) {
      console.error('Error analyzing elements:', error);
      toast.error("Failed to analyze elements");
    }
  }, [model, elements, selectedSize, suggestPositioning, setElements]);
  
  return (
    <div className="space-y-4">
      <AIModelManager 
        templates={mockTemplates} 
        isModelTrained={!!model} 
        modelMetadata={mockModelMetadata}
        onTrainModel={handleTrainModel}
        onModelReady={handleModelReady}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>AI Format Suggestions</CardTitle>
          <CardDescription>
            Generate and optimize formats based on AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={generateSuggestedFormat} 
              disabled={!model || isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Format'}
            </Button>
            
            <Button 
              onClick={analyzeExistingElements} 
              disabled={!model || elements.length === 0}
              variant="outline"
              className="w-full"
            >
              Optimize Layout
            </Button>
          </div>
          
          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Add AI-positioned elements</h3>
            <div className="grid grid-cols-4 gap-2">
              {['text', 'image', 'button', 'container'].map(type => (
                <Popover key={type}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full capitalize flex items-center gap-1"
                      disabled={!model}
                    >
                      <Wand2 size={14} />
                      {type}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Add {type} with AI positioning</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => {
                            const suggestion = suggestPositioning(type);
                            if (suggestion) {
                              const newElement: EditorElement = {
                                id: `ai-${type}-${Date.now()}`,
                                type: type as any,
                                content: type === 'text' ? 'AI Text' : 
                                        (type === 'button' ? 'AI Button' : ''),
                                style: {
                                  ...suggestion,
                                  backgroundColor: type === 'button' ? '#3b82f6' : 'transparent',
                                  color: type === 'button' ? '#ffffff' : '#000000',
                                  fontSize: type === 'text' ? 16 : undefined,
                                  fontWeight: type === 'text' ? 'normal' : undefined,
                                },
                                sizeId: selectedSize.name
                              };
                              setElements(prev => [...prev, newElement]);
                              toast.success(`Added ${type} with AI positioning`);
                            }
                          }}
                          variant="default"
                          size="sm"
                        >
                          Add
                        </Button>
                        <Button 
                          onClick={() => {
                            handleAddElement(type as any);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Manual
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
