import React, { useState, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Button } from '../../ui/button';
import { AIModelManager } from './AIModelManager';
import { useCanvas } from '../CanvasContext';
import { EditorElement, BannerSize } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { toast } from 'sonner';
import { PopoverContent, Popover, PopoverTrigger } from '../../ui/popover';
import { Wand2, Loader } from 'lucide-react';
import { LayoutTemplate } from '../types/admin';

export const AIFormatSuggestions: React.FC = () => {
  const { selectedSize, handleAddElement, elements, setElements } = useCanvas();
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [mobileNetModel, setMobileNetModel] = useState<tf.GraphModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingMobileNet, setIsLoadingMobileNet] = useState(false);
  const [referenceTemplates, setReferenceTemplates] = useState<LayoutTemplate[]>([]);
  
  // Mock data for AIModelManager - in a real app you'd get this from a context or API
  const mockTemplates: LayoutTemplate[] = [];
  const mockModelMetadata = {
    trainedAt: new Date().toISOString(),
    iterations: 100,
    accuracy: 0.85,
    loss: 0.15
  };
  
  // Load MobileNet model for element detection
  useEffect(() => {
    const loadMobileNet = async () => {
      if (mobileNetModel || isLoadingMobileNet) return;
      
      try {
        setIsLoadingMobileNet(true);
        
        await tf.ready();
        console.log("Loading MobileNet model...");
        
        // Load MobileNet model
        const loadedModel = await tf.loadGraphModel(
          'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1', 
          { fromTFHub: true }
        );
        
        setMobileNetModel(loadedModel);
        console.log("MobileNet model loaded successfully");
        toast.success("MobileNet carregado com sucesso");
      } catch (error) {
        console.error("Error loading MobileNet:", error);
        toast.error("Falha ao carregar MobileNet");
      } finally {
        setIsLoadingMobileNet(false);
      }
    };
    
    // Load templates from localStorage
    const loadTemplatesFromStorage = () => {
      try {
        const storedTemplates = localStorage.getItem('admin-layout-templates');
        if (storedTemplates) {
          const parsedTemplates = JSON.parse(storedTemplates);
          if (Array.isArray(parsedTemplates)) {
            console.log(`Loaded ${parsedTemplates.length} templates from storage`);
            setReferenceTemplates(parsedTemplates);
          }
        }
      } catch (error) {
        console.error("Error loading templates from localStorage:", error);
      }
    };
    
    loadMobileNet();
    loadTemplatesFromStorage();
    
    return () => {
      // Clean up tensors
      if (mobileNetModel) {
        try {
          tf.dispose(mobileNetModel);
        } catch (e) {
          console.error("Error disposing MobileNet model:", e);
        }
      }
    };
  }, []);
  
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
  
  // Find a template with similar aspect ratio
  const findSimilarTemplate = (width: number, height: number): LayoutTemplate | null => {
    if (referenceTemplates.length === 0) return null;
    
    const targetRatio = width / height;
    
    let bestMatch: LayoutTemplate | null = null;
    let smallestDiff = Infinity;
    
    for (const template of referenceTemplates) {
      const templateRatio = template.width / template.height;
      const difference = Math.abs(templateRatio - targetRatio);
      
      if (difference < smallestDiff) {
        smallestDiff = difference;
        bestMatch = template;
      }
    }
    
    // Only return if the ratio is reasonably close (within 20%)
    if (smallestDiff <= 0.2) {
      return bestMatch;
    }
    
    return null;
  };
  
  // Generate element based on template and current format
  const generateElementFromTemplateReference = (
    element: EditorElement, 
    sourceTemplate: LayoutTemplate,
    targetSize: BannerSize
  ): EditorElement => {
    const newId = `ai-${element.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Calculate scaling ratios
    const widthRatio = targetSize.width / sourceTemplate.width;
    const heightRatio = targetSize.height / sourceTemplate.height;
    
    // Calculate new dimensions and position
    const newX = element.style.x * widthRatio;
    const newY = element.style.y * heightRatio;
    const newWidth = element.style.width * widthRatio;
    let newHeight = element.style.height * heightRatio;
    
    // If it's an image, preserve aspect ratio
    if (element.type === 'image' || element.type === 'logo') {
      const aspectRatio = element.style.width / element.style.height;
      newHeight = newWidth / aspectRatio;
    }
    
    return {
      ...element,
      id: newId,
      sizeId: targetSize.name,
      style: {
        ...element.style,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      }
    };
  };
  
  // Generate a suggested format based on the trained model and templates
  const generateSuggestedFormat = useCallback(async () => {
    if (!selectedSize) {
      toast.error("Nenhum tamanho selecionado");
      return;
    }
    
    setIsGenerating(true);
    toast.info("Gerando sugestões baseadas em templates similares...");
    
    try {
      const similarTemplate = findSimilarTemplate(selectedSize.width, selectedSize.height);
      
      if (!similarTemplate) {
        toast.error("Nenhum template semelhante encontrado para referência");
        return;
      }
      
      console.log("Found similar template:", similarTemplate.name);
      
      // Create elements based on the reference template
      const newElements: EditorElement[] = [];
      
      for (const templateElement of similarTemplate.elements) {
        const newElement = generateElementFromTemplateReference(
          templateElement,
          similarTemplate,
          selectedSize
        );
        
        newElements.push(newElement);
      }
      
      // Add elements to canvas
      setElements(prev => [...prev, ...newElements]);
      
      toast.success(`Gerados ${newElements.length} elementos com base em template similar`);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error("Falha ao gerar sugestões");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSize, referenceTemplates, setElements]);
  
  // Analyze existing elements with MobileNet
  const analyzeExistingElements = useCallback(async () => {
    if (!mobileNetModel || elements.length === 0 || !selectedSize) {
      const reason = !mobileNetModel 
        ? "Modelo MobileNet não carregado" 
        : elements.length === 0 
          ? "Nenhum elemento para analisar" 
          : "Nenhum tamanho selecionado";
          
      toast.error(reason);
      return;
    }
    
    setIsGenerating(true);
    toast.info("Analisando elementos e otimizando layout...");
    
    try {
      // Get elements for this size
      const sizeElements = elements.filter(el => el.sizeId === selectedSize.name);
      
      if (sizeElements.length === 0) {
        toast.info("Nenhum elemento para esse tamanho");
        return;
      }
      
      // Find similar reference template
      const similarTemplate = findSimilarTemplate(selectedSize.width, selectedSize.height);
      
      if (!similarTemplate) {
        toast.info("Otimizando baseado apenas nos elementos atuais");
        
        // Simple optimization: space elements evenly
        const updatedElements = elements.map(element => {
          if (element.sizeId !== selectedSize.name) return element;
          
          // Simple optimization for text elements
          if (element.type === 'text') {
            return {
              ...element,
              style: {
                ...element.style,
                fontSize: Math.min(24, element.style.fontSize || 16) // Ensure readable font size
              }
            };
          }
          
          return element;
        });
        
        setElements(updatedElements);
        toast.success("Elementos otimizados com ajustes básicos");
        return;
      }
      
      // Using reference template to improve layout
      console.log("Using template reference:", similarTemplate.name);
      
      // Group elements by type
      const elementsByType: Record<string, EditorElement[]> = {};
      sizeElements.forEach(el => {
        const type = el.type;
        if (!elementsByType[type]) elementsByType[type] = [];
        elementsByType[type].push(el);
      });
      
      // Find corresponding elements in template
      const templateElementsByType: Record<string, EditorElement[]> = {};
      similarTemplate.elements.forEach(el => {
        const type = el.type;
        if (!templateElementsByType[type]) templateElementsByType[type] = [];
        templateElementsByType[type].push(el);
      });
      
      // Update elements based on template positioning
      const updatedElements = elements.map(element => {
        if (element.sizeId !== selectedSize.name) return element;
        
        const templateElementsOfSameType = templateElementsByType[element.type];
        if (!templateElementsOfSameType || templateElementsOfSameType.length === 0) return element;
        
        // Find the best match in template elements
        const bestMatch = templateElementsOfSameType[0]; // Simplified for demo
        
        // Calculate scaling ratios
        const widthRatio = selectedSize.width / similarTemplate.width;
        const heightRatio = selectedSize.height / similarTemplate.height;
        
        // Create improved element based on template
        return {
          ...element,
          style: {
            ...element.style,
            // Adjust position based on template's relative position
            x: bestMatch.style.x * widthRatio,
            y: bestMatch.style.y * heightRatio,
            // Keep original width/height to avoid breaking layout
            fontSize: element.type === 'text' ? bestMatch.style.fontSize : element.style.fontSize
          }
        };
      });
      
      setElements(updatedElements);
      toast.success("Layout otimizado com base em template similar");
      
    } catch (error) {
      console.error('Error analyzing elements:', error);
      toast.error("Falha ao analisar elementos");
    } finally {
      setIsGenerating(false);
    }
  }, [mobileNetModel, elements, selectedSize, setElements]);
  
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
          <CardTitle>Sugestões de Formato por IA</CardTitle>
          <CardDescription>
            Gerar e otimizar formatos baseados em análise por IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={generateSuggestedFormat} 
              disabled={isGenerating || referenceTemplates.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Gerar Formato
                </>
              )}
            </Button>
            
            <Button 
              onClick={analyzeExistingElements} 
              disabled={isGenerating || elements.length === 0 || isLoadingMobileNet}
              variant="outline"
              className="w-full"
            >
              {isLoadingMobileNet ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Carregando MobileNet...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Otimizar Layout
                </>
              )}
            </Button>
          </div>
          
          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Adicionar elementos com IA</h3>
            <div className="grid grid-cols-4 gap-2">
              {['text', 'image', 'button', 'container'].map(type => (
                <Popover key={type}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full capitalize flex items-center gap-1"
                      disabled={isGenerating}
                    >
                      <Wand2 size={14} />
                      {type}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Adicionar {type} com posicionamento IA</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => {
                            if (!selectedSize) return;
                            
                            // Find a reference template
                            const similarTemplate = findSimilarTemplate(selectedSize.width, selectedSize.height);
                            
                            if (similarTemplate) {
                              // Find reference elements of this type
                              const referenceElements = similarTemplate.elements.filter(el => el.type === type);
                              
                              if (referenceElements.length > 0) {
                                // Use the first reference element for positioning
                                const referenceElement = referenceElements[0];
                                
                                // Calculate scaling
                                const widthRatio = selectedSize.width / similarTemplate.width;
                                const heightRatio = selectedSize.height / similarTemplate.height;
                                
                                // Create a new element based on the reference
                                const newElement: EditorElement = {
                                  id: `ai-${type}-${Date.now()}`,
                                  type: type as any,
                                  content: type === 'text' ? 'Texto gerado por IA' : 
                                          (type === 'button' ? 'Botão IA' : ''),
                                  style: {
                                    x: referenceElement.style.x * widthRatio,
                                    y: referenceElement.style.y * heightRatio,
                                    width: referenceElement.style.width * widthRatio,
                                    height: referenceElement.style.height * heightRatio,
                                    backgroundColor: type === 'button' ? '#3b82f6' : 'transparent',
                                    color: type === 'button' ? '#ffffff' : '#000000',
                                    fontSize: type === 'text' ? (referenceElement.style.fontSize || 16) : undefined,
                                    fontWeight: type === 'text' ? (referenceElement.style.fontWeight || 'normal') : undefined,
                                  },
                                  sizeId: selectedSize.name
                                };
                                
                                setElements(prev => [...prev, newElement]);
                                toast.success(`Adicionado ${type} com posicionamento baseado em template`);
                              } else {
                                // If no reference, add a default positioned element
                                handleAddElement(type as any);
                              }
                            } else {
                              // If no similar template, use default positioning
                              handleAddElement(type as any);
                            }
                          }}
                          variant="default"
                          size="sm"
                        >
                          Adicionar
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
