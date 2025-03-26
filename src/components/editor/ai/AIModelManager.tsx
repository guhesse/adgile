
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AIModelManagerProps } from '@/types/admin';

export const AIModelManager: React.FC<AIModelManagerProps> = ({
  templates,
  isModelTrained,
  modelMetadata,
  onTrainModel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress when component mounts or when training status changes
    if (!isLoading) {
      setProgress(isModelTrained ? 100 : 0);
    }
  }, [isLoading, isModelTrained]);

  const handleTrainModel = async () => {
    setIsLoading(true);
    setProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress < 90 ? newProgress : 90;
      });
    }, 300);
    
    try {
      await onTrainModel();
      clearInterval(interval);
      setProgress(100);
    } catch (error) {
      console.error("Error during model training:", error);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CardHeader className="px-0 pt-0">
        <CardTitle>AI Model Training</CardTitle>
        <CardDescription>
          Train the AI model to generate layouts based on your template database.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-0 pb-0">
        <div className="space-y-6">
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                <span className="font-medium">Model Status</span>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isModelTrained 
                  ? "bg-green-100 text-green-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {isModelTrained ? "Trained" : "Not Trained"}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-500 mb-1">Templates</div>
                <div className="text-xl font-semibold">{templates.length}</div>
              </div>
              
              {isModelTrained && (
                <div className="bg-white border rounded p-3">
                  <div className="text-sm text-gray-500 mb-1">Last Trained</div>
                  <div className="text-sm font-medium">
                    {new Date(modelMetadata.trainedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              {isModelTrained && (
                <div className="bg-white border rounded p-3">
                  <div className="text-sm text-gray-500 mb-1">Accuracy</div>
                  <div className="text-xl font-semibold">
                    {(modelMetadata.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              
              {isModelTrained && (
                <div className="bg-white border rounded p-3">
                  <div className="text-sm text-gray-500 mb-1">Iterations</div>
                  <div className="text-xl font-semibold">{modelMetadata.iterations}</div>
                </div>
              )}
            </div>
            
            {templates.length < 10 ? (
              <div className="flex items-start space-x-3 bg-amber-50 text-amber-800 rounded-md p-3 text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                <div>
                  <p className="font-medium">Not enough training data</p>
                  <p className="mt-1">You need at least 10 templates to train the AI model. You currently have {templates.length}.</p>
                </div>
              </div>
            ) : isModelTrained ? (
              <div className="flex items-start space-x-3 bg-green-50 text-green-800 rounded-md p-3 text-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                <div>
                  <p className="font-medium">Model trained successfully</p>
                  <p className="mt-1">Your AI model has been trained on {templates.length} templates with {modelMetadata.iterations} iterations.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3 bg-blue-50 text-blue-800 rounded-md p-3 text-sm">
                <Brain className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div>
                  <p className="font-medium">Ready to train</p>
                  <p className="mt-1">You have {templates.length} templates available for training the AI model.</p>
                </div>
              </div>
            )}
            
            {progress > 0 && (
              <div className="mt-4">
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={handleTrainModel}
                disabled={templates.length < 10 || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Training in Progress...
                  </>
                ) : isModelTrained ? (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Retrain Model
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Train AI Model
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isModelTrained && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Model Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Loss</h4>
                  <p className="text-xl font-semibold">{modelMetadata.loss.toFixed(4)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Accuracy</h4>
                  <p className="text-xl font-semibold">{(modelMetadata.accuracy * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};
