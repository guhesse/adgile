
import React, { useState, useEffect } from 'react';
import { AIFormatSuggestions } from '../ai/AIFormatSuggestions';
import { ScrollArea } from '../../ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getTrainingData } from '../utils/layoutStorage';
import {
  Bot,
  Brain,
  Grid3X3,
  Info,
  LayoutGrid,
  LucideIcon,
  MonitorSmartphone,
  Palette,
  Settings,
  Sparkles
} from 'lucide-react';
import { useCanvas } from '../CanvasContext';

export const AIPanel = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [isModelTrained, setIsModelTrained] = useState(false);
  const { selectedSize } = useCanvas();

  useEffect(() => {
    // Check if model is trained
    const trainingData = getTrainingData();
    setIsModelTrained(!!trainingData?.modelMetadata?.trainedAt);
  }, []);

  const features = [
    {
      title: 'Layout Suggestions',
      icon: LayoutGrid,
      description: 'AI-generated layout recommendations based on your designs',
      active: true
    },
    {
      title: 'Element Placement',
      icon: Grid3X3,
      description: 'Smart positioning of elements within your layout',
      active: true
    },
    {
      title: 'Color Scheme',
      icon: Palette,
      description: 'Color palette suggestions based on your branding',
      active: false
    },
    {
      title: 'Responsive Design',
      icon: MonitorSmartphone,
      description: 'Auto-adjust layouts for different screen sizes',
      active: false
    }
  ];

  return (
    <div className="w-full h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">AI Layout Assistant</h2>
        <p className="text-sm text-gray-500 mb-4">
          {isModelTrained 
            ? 'AI model trained and ready to assist' 
            : 'Train the AI model in Admin Panel for personalized assistance'}
        </p>
        
        <Tabs defaultValue="suggestions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="suggestions" className="flex-1">
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="features" className="flex-1">
              Features
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              Settings
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[calc(100vh-210px)]">
            <TabsContent value="suggestions" className="m-0">
              <div className="pr-4">
                {!isModelTrained ? (
                  <Card className="mb-4">
                    <CardContent className="p-4 text-center">
                      <Brain className="w-10 h-10 mx-auto mb-2 text-purple-500 opacity-70" />
                      <h3 className="text-base font-medium mb-1">AI Not Trained</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Train the AI model in Admin Panel to unlock personalized layout suggestions
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <a href="/admin">Go to Admin Panel</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <AIFormatSuggestions 
                    currentFormat={{
                      width: selectedSize.width,
                      height: selectedSize.height,
                      orientation: selectedSize.width > selectedSize.height 
                        ? 'horizontal' 
                        : selectedSize.width === selectedSize.height 
                          ? 'square' 
                          : 'vertical'
                    }}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="m-0">
              <div className="pr-4 space-y-4">
                {features.map((feature, index) => (
                  <FeatureCard 
                    key={index}
                    title={feature.title}
                    icon={feature.icon}
                    description={feature.description}
                    active={feature.active}
                  />
                ))}
                
                <Separator className="my-6" />
                
                <div className="rounded-lg border p-4 bg-blue-50 border-blue-100">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-700">AI Training</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Create layouts in the Admin Panel to train the AI for better suggestions.
                        More layouts = smarter AI.
                      </p>
                      <Button asChild size="sm" variant="link" className="p-0 h-auto mt-2 text-blue-700">
                        <a href="/admin">Go to Admin Panel</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="m-0">
              <div className="pr-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Settings className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <h3 className="text-base font-medium mb-1">AI Settings</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      AI settings will be available in a future update
                    </p>
                  </CardContent>
                </Card>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p className="mb-2 font-medium">AI Model Status:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Trained:</span>
                      <span className={isModelTrained ? "text-green-600" : "text-gray-400"}>
                        {isModelTrained ? "Yes" : "No"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Suggestions:</span>
                      <span className={isModelTrained ? "text-green-600" : "text-gray-400"}>
                        {isModelTrained ? "Available" : "Unavailable"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  active: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  icon: Icon, 
  description, 
  active 
}) => {
  return (
    <Card className={active ? "" : "opacity-60"}>
      <CardContent className="p-4 flex items-start">
        <div className={`p-2 rounded-md mr-3 ${active ? "bg-purple-100" : "bg-gray-100"}`}>
          <Icon className={`h-5 w-5 ${active ? "text-purple-600" : "text-gray-400"}`} />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-sm font-medium">{title}</h3>
            {active && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded">
                Active
              </span>
            )}
            {!active && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
