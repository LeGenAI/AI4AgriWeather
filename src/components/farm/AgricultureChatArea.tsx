import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, Camera, Loader2, Wheat, Cloud, Bug, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatMessages } from '@/hooks/useChatMessages';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AgricultureChatAreaProps {
  notebookId?: string;
  context?: 'weather' | 'crops' | 'pests' | 'market' | 'general';
}

const contextPrompts = {
  weather: {
    systemPrompt: `You are AI4AgriWeather, an intelligent agricultural weather advisor for farmers. Provide practical, actionable advice about:
- Weather interpretation for farming decisions
- Seasonal planning based on weather patterns
- Climate adaptation strategies
- Irrigation and water management
- Protection from extreme weather
Always consider Tanzania's tropical climate and local conditions.`,
    quickQuestions: [
      "What does the weather forecast mean for my crops?",
      "When is the best time to plant during rainy season?",
      "How can I protect my crops from drought?",
      "What should I do if heavy rains are coming?"
    ],
    icon: Cloud,
    color: "text-blue-600"
  },
  crops: {
    systemPrompt: `You are AI4AgriWeather, an expert agricultural advisor specializing in crop management with weather intelligence. Provide guidance on:
- Crop selection and varieties suitable for Tanzania
- Planting, growing, and harvesting techniques
- Soil preparation and fertility management
- Crop rotation and intercropping
- Yield optimization strategies
Focus on major Tanzanian crops like maize, rice, coffee, cassava, and beans.`,
    quickQuestions: [
      "What's the best variety of maize for my region?",
      "How do I improve my soil before planting?",
      "When should I harvest my coffee?",
      "What crops grow well together?"
    ],
    icon: Wheat,
    color: "text-green-600"
  },
  pests: {
    systemPrompt: `You are AI4AgriWeather, a plant pathology and pest management expert with weather-based pest prediction. Help farmers with:
- Pest and disease identification
- Integrated pest management (IPM) strategies
- Organic and chemical treatment options
- Prevention and early detection methods
- Beneficial insects and natural predators
Emphasize sustainable and cost-effective solutions.`,
    quickQuestions: [
      "How do I identify fall armyworm on my maize?",
      "What natural pesticides can I use?",
      "How can I prevent coffee berry disease?",
      "Are there beneficial insects I should protect?"
    ],
    icon: Bug,
    color: "text-orange-600"
  },
  market: {
    systemPrompt: `You are AI4AgriWeather, an agricultural marketing and economics advisor with weather-informed market insights. Provide guidance on:
- Market price analysis and trends
- Best timing for selling crops
- Quality standards and grading
- Value addition and processing
- Cooperative and group marketing
- Access to credit and financing
Help farmers maximize their income from agricultural activities.`,
    quickQuestions: [
      "When should I sell my harvest for best prices?",
      "How can I improve the quality of my produce?",
      "What are the benefits of joining a cooperative?",
      "How can I add value to my crops?"
    ],
    icon: DollarSign,
    color: "text-purple-600"
  },
  general: {
    systemPrompt: `You are AI4AgriWeather, a comprehensive agricultural advisor with intelligent weather integration. Provide practical advice on:
- General farming best practices
- Sustainable agriculture methods
- Farm management and planning
- Technology adoption in agriculture
- Climate-smart farming techniques
- Record keeping and farm business management
Always provide context-appropriate advice for smallholder farmers in Tanzania.`,
    quickQuestions: [
      "How can I make my farm more sustainable?",
      "What records should I keep for my farm?",
      "How do I plan my farming activities for the year?",
      "What new technologies can help my farm?"
    ],
    icon: Wheat,
    color: "text-gray-600"
  }
};

export function AgricultureChatArea({ notebookId, context = 'general' }: AgricultureChatAreaProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const contextConfig = contextPrompts[context];
  const IconComponent = contextConfig.icon;
  
  const {
    messages,
    sendMessage,
    sendMessageAsync,
    isSending,
  } = useChatMessages(notebookId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending || !notebookId) return;

    const userMessage = message.trim();
    setMessage('');

    // Add context-specific system prompt to the message
    const contextualMessage = `Context: You are helping with ${context} related questions. ${contextConfig.systemPrompt}\n\nUser Question: ${userMessage}`;

    try {
      await sendMessageAsync({
        notebookId: notebookId,
        role: 'user',
        content: contextualMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state if no notebookId
  if (!notebookId) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <IconComponent className={`h-5 w-5 ${contextConfig.color}`} />
            <h3 className="font-semibold capitalize">{context} Assistant</h3>
            <Badge variant="outline" className="ml-auto">
              Setting up...
            </Badge>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Setting up your consultation session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Context Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <IconComponent className={`h-5 w-5 ${contextConfig.color}`} />
          <h3 className="font-semibold capitalize">{context} Assistant</h3>
          <Badge variant="outline" className="ml-auto">
            AI Advisor
          </Badge>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600 mb-3">Quick questions to get started:</p>
          <div className="space-y-2">
            {contextConfig.quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start h-auto p-3 whitespace-normal"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <IconComponent className={`h-12 w-12 mx-auto mb-4 ${contextConfig.color}`} />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {context.charAt(0).toUpperCase() + context.slice(1)} Assistant Ready
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Ask me anything about {context} related to your farming needs. 
                I'm here to provide practical, actionable advice.
              </p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={
                  msg.role === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-[80%] space-y-1",
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2",
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 px-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 text-green-600">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              isRecording && "bg-red-100 text-red-600"
            )}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${context}...`}
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Specialized {context} advice powered by AI4AgriWeather
        </p>
      </div>
    </div>
  );
}