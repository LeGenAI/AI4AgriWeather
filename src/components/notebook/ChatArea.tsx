import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Upload, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useSources } from '@/hooks/useSources';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import SaveToNoteButton from './SaveToNoteButton';
import AddSourcesDialog from './AddSourcesDialog';
import { Citation } from '@/types/message';

interface ChatAreaProps {
  hasSource: boolean;
  notebookId?: string;
  notebook?: {
    id: string;
    title: string;
    description?: string;
    generation_status?: string;
    icon?: string;
    example_questions?: string[];
  } | null;
  onCitationClick?: (citation: Citation) => void;
  questionToSend?: string | null;
  onQuestionSent?: () => void;
}

const ChatArea = ({
  hasSource,
  notebookId,
  notebook,
  onCitationClick,
  questionToSend,
  onQuestionSent
}: ChatAreaProps) => {
  const [message, setMessage] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  
  const isGenerating = notebook?.generation_status === 'generating';
  
  const {
    messages,
    sendMessage,
    sendMessageAsync,
    isSending,
    deleteChatHistory,
    isDeletingChatHistory
  } = useChatMessages(notebookId);
  
  const {
    sources
  } = useSources(notebookId);
  
  const sourceCount = sources?.length || 0;

  // Check if at least one source has been successfully processed or is ready for chat
  const hasProcessedSource = sources?.some(source => 
    source.processing_status === 'completed' || 
    source.processing_status === 'processed' ||
    (source.type === 'text' && source.content) || // Text sources don't need processing
    (source.type === 'website' && source.url) ||   // Website sources can work with URL
    source.processing_status === 'pending'         // Allow pending sources for basic chat
  ) || false;

  // Check if any source is actually in a processing state (to show appropriate UI)
  const hasProcessingSources = sources?.some(source => 
    source.processing_status === 'pending' ||
    source.processing_status === 'processing' ||
    source.processing_status === 'uploading'
  ) || false;

  // Always allow chat - sources enhance the experience but aren't required for basic agricultural advice
  const isChatDisabled = false;

  // Debug logging
  console.log('Chat Debug Info:', {
    sourceCount,
    hasProcessedSource,
    isChatDisabled,
    sources: sources?.map(s => ({ 
      id: s.id, 
      type: s.type, 
      processing_status: s.processing_status,
      title: s.title 
    }))
  });

  // Track when we send a message to show loading state
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Ref for auto-scrolling to the most recent message
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // If we have new messages and we have a pending message, clear it
    if (messages.length > lastMessageCount && pendingUserMessage) {
      setPendingUserMessage(null);
      setShowAiLoading(false);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, pendingUserMessage]);

  // Auto-scroll when pending message is set, when messages update, or when AI loading appears
  useEffect(() => {
    if (latestMessageRef.current && scrollAreaRef.current) {
      // Find the viewport within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 50);
      }
    }
  }, [pendingUserMessage, messages.length, showAiLoading]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && notebookId) {
      try {
        // Store the pending message to display immediately
        setPendingUserMessage(textToSend);
        setMessage('');
        
        // Show AI loading after user message is sent
        setShowAiLoading(true);
        
        // Use sendMessageAsync for proper async handling
        await sendMessageAsync({
          notebookId: notebookId,
          role: 'user',
          content: textToSend
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        // Clear pending message on error
        setPendingUserMessage(null);
        setShowAiLoading(false);
      }
    }
  };

  // Handle questionToSend from parent component
  useEffect(() => {
    if (questionToSend && notebookId) {
      handleSendMessage(questionToSend);
      onQuestionSent?.();
    }
  }, [questionToSend, notebookId, onQuestionSent]);

  const handleRefreshChat = () => {
    if (notebookId) {
      console.log('Refresh button clicked for notebook:', notebookId);
      deleteChatHistory(notebookId);
      // Reset clicked questions when chat is refreshed
      setClickedQuestions(new Set());
    }
  };
  const handleCitationClick = (citation: Citation) => {
    onCitationClick?.(citation);
  };
  const handleExampleQuestionClick = (question: string) => {
    // Add question to clicked set to remove it from display
    setClickedQuestions(prev => new Set(prev).add(question));
    setMessage(question);
    handleSendMessage(question);
  };

  // Helper function to determine if message is from user
  const isUserMessage = (msg: any) => {
    const messageType = msg.message?.type || msg.message?.role;
    return messageType === 'human' || messageType === 'user';
  };

  // Helper function to determine if message is from AI
  const isAiMessage = (msg: any) => {
    const messageType = msg.message?.type || msg.message?.role;
    return messageType === 'ai' || messageType === 'assistant';
  };

  // Get the index of the last message for auto-scrolling
  const shouldShowScrollTarget = () => {
    return messages.length > 0 || pendingUserMessage || showAiLoading;
  };

  // Show refresh button if there are any messages (including system messages)
  const shouldShowRefreshButton = messages.length > 0;

  // Get example questions from the notebook, filtering out clicked ones
  const exampleQuestions = notebook?.example_questions?.filter(q => !clickedQuestions.has(q)) || [];

  // Update placeholder text based on processing status
  const getPlaceholderText = () => {
    if (sourceCount === 0) {
      return "Ask me anything about farming and agriculture...";
    } else if (hasProcessedSource) {
      return "Ask questions about your sources or farming in general...";
    } else {
      return "Ask general farming questions while sources are processing...";
    }
  };
  return <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
          {shouldShowRefreshButton && <Button variant="ghost" size="sm" onClick={handleRefreshChat} disabled={isDeletingChatHistory || isChatDisabled} className="flex items-center space-x-2">
              <RefreshCw className={`h-4 w-4 ${isDeletingChatHistory ? 'animate-spin' : ''}`} />
              <span>{isDeletingChatHistory ? 'Clearing...' : 'Clear Chat'}</span>
            </Button>}
        </div>
      </div>

      <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
        {/* Document Summary */}
        <div className="p-8 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 flex items-center justify-center bg-transparent">
                {isGenerating ? <Loader2 className="text-black font-normal w-10 h-10 animate-spin" /> : <span className="text-[40px] leading-none">{notebook?.icon || '🌾'}</span>}
              </div>
              <div>
                <h1 className="text-2xl font-medium text-gray-900">
                  {isGenerating ? 'Generating content...' : notebook?.title || 'Agricultural Knowledge Assistant'}
                </h1>
                <p className="text-sm text-gray-600">
                  {sourceCount > 0 ? `${sourceCount} source${sourceCount !== 1 ? 's' : ''} available` : 'Ready for general agricultural questions'}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              {isGenerating ? <div className="flex items-center space-x-2 text-gray-600">
                  <p>AI is analyzing your source and generating a title and description...</p>
                </div> : <MarkdownRenderer content={notebook?.description || (sourceCount > 0 ? 'Ask questions about your uploaded sources or general farming topics.' : 'I\'m here to help with all your agricultural questions. Feel free to ask about crops, weather, pests, farming techniques, and more!')} className="prose prose-gray max-w-none text-gray-700 leading-relaxed" />}
            </div>

            {/* Show a helpful hint when no sources are available */}
            {sourceCount === 0 && !messages.length && !pendingUserMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 mt-0.5">💡</div>
                  <div>
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Get started:</strong> You can ask me anything about farming and agriculture!
                    </p>
                    <p className="text-xs text-blue-600">
                      For more detailed answers about specific documents, consider uploading sources using the "Add Sources" button.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {(messages.length > 0 || pendingUserMessage || showAiLoading) && <div className="mb-6 space-y-4">
                {messages.map((msg, index) => <div key={msg.id} className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${isUserMessage(msg) ? 'max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg' : 'w-full'}`}>
                      <div className={isUserMessage(msg) ? '' : 'prose prose-gray max-w-none text-gray-800'}>
                        <MarkdownRenderer content={msg.message.content} className={isUserMessage(msg) ? '' : ''} onCitationClick={handleCitationClick} isUserMessage={isUserMessage(msg)} />
                      </div>
                      {isAiMessage(msg) && <div className="mt-2 flex justify-start">
                          <SaveToNoteButton content={msg.message.content} notebookId={notebookId} />
                        </div>}
                    </div>
                  </div>)}
                
                {/* Pending user message */}
                {pendingUserMessage && <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg">
                      <MarkdownRenderer content={pendingUserMessage} className="" isUserMessage={true} />
                    </div>
                  </div>}
                
                {/* AI Loading Indicator */}
                {showAiLoading && <div className="flex justify-start" ref={latestMessageRef}>
                    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '0.1s'
              }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '0.2s'
              }}></div>
                    </div>
                  </div>}
                
                {/* Scroll target for when no AI loading is shown */}
                {!showAiLoading && shouldShowScrollTarget() && <div ref={latestMessageRef} />}
              </div>}
          </div>
        </div>
      </ScrollArea>

      {/* Chat Input - Fixed at bottom */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Input placeholder={getPlaceholderText()} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !isChatDisabled && !isSending && !pendingUserMessage && handleSendMessage()} className="pr-20" disabled={isChatDisabled || isSending || !!pendingUserMessage} />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {sourceCount} source{sourceCount !== 1 ? 's' : ''}
              </div>
            </div>
            <Button onClick={() => handleSendMessage()} disabled={!message.trim() || isChatDisabled || isSending || !!pendingUserMessage}>
              {isSending || pendingUserMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Example Questions Carousel */}
          {!isChatDisabled && !pendingUserMessage && !showAiLoading && exampleQuestions.length > 0 && <div className="mt-4">
              <Carousel className="w-full max-w-4xl">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {exampleQuestions.map((question, index) => <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                      <Button variant="outline" size="sm" className="text-left whitespace-nowrap h-auto py-2 px-3 text-sm" onClick={() => handleExampleQuestionClick(question)}>
                        {question}
                      </Button>
                    </CarouselItem>)}
                </CarouselContent>
                {exampleQuestions.length > 2 && <>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </>}
              </Carousel>
            </div>}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <p className="text-center text-sm text-gray-500">AI4AgriWeather can be inaccurate; please double-check its responses.</p>
      </div>
      
      {/* Add Sources Dialog */}
      <AddSourcesDialog open={showAddSourcesDialog} onOpenChange={setShowAddSourcesDialog} notebookId={notebookId} />
    </div>;
};

export default ChatArea;
