import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgricultureChatArea } from './AgricultureChatArea';
import { useCreateNotebook } from '@/hooks/useNotebooks';
import { useToast } from '@/hooks/use-toast';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { 
  Bot,
  Cloud,
  Wheat,
  Bug,
  DollarSign,
  HelpCircle,
  Plus,
  MessageSquare
} from 'lucide-react';

const chatContexts = [
  {
    id: 'weather',
    name: 'Weather & Climate',
    icon: Cloud,
    color: 'text-blue-600',
    description: 'Weather forecasts and climate advice'
  },
  {
    id: 'crops',
    name: 'Crop Management',
    icon: Wheat,
    color: 'text-green-600',
    description: 'Crop growing and management tips'
  },
  {
    id: 'pests',
    name: 'Pest & Disease',
    icon: Bug,
    color: 'text-orange-600',
    description: 'Pest identification and control'
  },
  {
    id: 'market',
    name: 'Market Information',
    icon: DollarSign,
    color: 'text-purple-600',
    description: 'Market prices and selling advice'
  }
] as const;

export function AgriChat() {
  const [activeNotebooks, setActiveNotebooks] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState('weather');
  const createNotebook = useCreateNotebook();
  const { toast } = useToast();

  const getOrCreateNotebook = async (context: string) => {
    // Check if we already have a notebook for this context
    if (activeNotebooks[context]) {
      return activeNotebooks[context];
    }

    try {
      // Create a new notebook for this context
      const result = await createNotebook.mutateAsync({
        title: `${context.charAt(0).toUpperCase() + context.slice(1)} Consultation`,
        description: `AI consultation session for ${context} related questions`
      });

      setActiveNotebooks(prev => ({
        ...prev,
        [context]: result.id
      }));

      return result.id;
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast({
        title: "Error",
        description: "Failed to create consultation session. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Create default notebook when component loads
  useEffect(() => {
    if (!activeNotebooks[activeTab]) {
      getOrCreateNotebook(activeTab);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <UnifiedHeader variant="full" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="h-[calc(100vh-180px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-4">
                {chatContexts.map((context) => {
                  const IconComponent = context.icon;
                  return (
                    <TabsTrigger 
                      key={context.id} 
                      value={context.id}
                      className="flex items-center gap-2"
                      onClick={async () => {
                        if (!activeNotebooks[context.id]) {
                          await getOrCreateNotebook(context.id);
                        }
                      }}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="hidden sm:inline">{context.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {chatContexts.map((context) => (
              <TabsContent 
                key={context.id} 
                value={context.id} 
                className="flex-1 m-0 p-0"
              >
                <AgricultureChatArea
                  notebookId={activeNotebooks[context.id] || undefined}
                  context={context.id as any}
                />
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Help Tips */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900 mb-1">Tips for better answers:</p>
                <ul className="space-y-1">
                  <li>• Include your crop type and growth stage</li>
                  <li>• Mention your location for weather-specific advice</li>
                  <li>• Describe symptoms clearly for pest/disease diagnosis</li>
                  <li>• Each tab provides specialized advice for that topic</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}