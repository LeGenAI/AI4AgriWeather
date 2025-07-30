
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/authentication';
import { EnhancedChatMessage, Citation, MessageSegment } from '@/types/message';
import { ChatContext, N8nChatResponse } from '@/types/chat';
import { useToast } from '@/shared/hooks/use-toast';
import { useEffect, useRef, useCallback } from 'react';

// Type for the expected message structure from n8n_chat_histories
interface N8nMessageFormat {
  type: 'human' | 'ai';
  content: string | {
    segments: Array<{ text: string; citation_id?: number }>;
    citations: Array<{
      citation_id: number;
      source_id: string;
      source_title: string;
      source_type: string;
      page_number?: number;
      chunk_index?: number;
      excerpt?: string;
    }>;
  };
  additional_kwargs?: any;
  response_metadata?: any;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
}

// Helper function to safely parse JSON content
const safeJsonParse = <T,>(content: string, fallback: T): T => {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

// Helper function to extract text from various content formats
const extractTextContent = (content: any): string => {
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null) {
    if ('segments' in content && Array.isArray(content.segments)) {
      return content.segments.map((s: any) => s.text || '').join(' ');
    }
    if ('output' in content && Array.isArray(content.output)) {
      return content.output.map((o: any) => o.text || '').join(' ');
    }
    if ('text' in content) return content.text;
  }
  return 'Unable to parse message content';
};

const transformMessage = (item: any, sourceMap: Map<string, any>): EnhancedChatMessage => {
  console.log('Processing message item:', item);
  
  // Handle the message format based on your JSON examples
  let transformedMessage: EnhancedChatMessage['message'];
  
  // Check if message is an object and has the expected structure
  if (item.message && 
      typeof item.message === 'object' && 
      !Array.isArray(item.message) &&
      'type' in item.message && 
      'content' in item.message) {
    
    // Type assertion with proper checking
    const messageObj = item.message as unknown as N8nMessageFormat;
    
    // Check if this is an AI message with JSON content that needs parsing
    if (messageObj.type === 'ai' && typeof messageObj.content === 'string') {
      try {
        const parsedContent = safeJsonParse<N8nChatResponse['content']>(
          messageObj.content,
          { output: [{ text: messageObj.content }] }
        );
        
        if (parsedContent.output && Array.isArray(parsedContent.output)) {
          // Transform the parsed content into segments and citations
          const segments: MessageSegment[] = [];
          const citations: Citation[] = [];
          let citationIdCounter = 1;
          
          parsedContent.output.forEach((outputItem) => {
            // Add the text segment
            segments.push({
              text: outputItem.text,
              citation_id: outputItem.citations && outputItem.citations.length > 0 ? citationIdCounter : undefined
            });
            
            // Process citations if they exist
            if (outputItem.citations && outputItem.citations.length > 0) {
              outputItem.citations.forEach((citation) => {
                const sourceInfo = sourceMap.get(citation.chunk_source_id);
                citations.push({
                  citation_id: citationIdCounter,
                  source_id: citation.chunk_source_id,
                  source_title: sourceInfo?.title || 'Unknown Source',
                  source_type: sourceInfo?.type || 'pdf',
                  chunk_lines_from: citation.chunk_lines_from,
                  chunk_lines_to: citation.chunk_lines_to,
                  chunk_index: citation.chunk_index,
                  excerpt: `Lines ${citation.chunk_lines_from}-${citation.chunk_lines_to}`
                });
              });
              citationIdCounter++;
            }
          });
          
          transformedMessage = {
            type: 'ai',
            content: {
              segments,
              citations
            },
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        } else {
          // Fallback for AI messages that don't match expected format
          transformedMessage = {
            type: 'ai',
            content: messageObj.content,
            additional_kwargs: messageObj.additional_kwargs,
            response_metadata: messageObj.response_metadata,
            tool_calls: messageObj.tool_calls,
            invalid_tool_calls: messageObj.invalid_tool_calls
          };
        }
      } catch (parseError) {
        console.log('Failed to parse AI content as JSON, treating as plain text:', parseError);
        // If parsing fails, treat as regular string content
        transformedMessage = {
          type: 'ai',
          content: messageObj.content,
          additional_kwargs: messageObj.additional_kwargs,
          response_metadata: messageObj.response_metadata,
          tool_calls: messageObj.tool_calls,
          invalid_tool_calls: messageObj.invalid_tool_calls
        };
      }
    } else {
      // Handle non-AI messages or AI messages that don't need parsing
      transformedMessage = {
        type: messageObj.type === 'human' ? 'human' : 'ai',
        content: messageObj.content || 'Empty message',
        additional_kwargs: messageObj.additional_kwargs,
        response_metadata: messageObj.response_metadata,
        tool_calls: messageObj.tool_calls,
        invalid_tool_calls: messageObj.invalid_tool_calls
      };
    }
  } else if (typeof item.message === 'string') {
    // Handle case where message is just a string
    transformedMessage = {
      type: 'human',
      content: item.message
    };
  } else {
    // Fallback for any other cases
    transformedMessage = {
      type: 'human',
      content: 'Unable to parse message'
    };
  }

  console.log('Transformed message:', transformedMessage);

  return {
    id: item.id,
    session_id: item.session_id,
    message: transformedMessage
  };
};

export const useChatMessages = (notebookId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-messages', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];
      
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', notebookId)
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Also fetch sources to get proper source titles
      const { data: sourcesData } = await supabase
        .from('sources')
        .select('id, title, type')
        .eq('notebook_id', notebookId);
      
      const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);
      
      console.log('Raw data from database:', data);
      console.log('Sources map:', sourceMap);
      
      // Transform the data to match our expected format
      return data.map((item) => transformMessage(item, sourceMap));
    },
    enabled: !!notebookId && !!user,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Track connection status
  const connectionRetryCount = useRef(0);
  const maxRetries = 3;

  // Set up Realtime subscription with retry logic
  useEffect(() => {
    if (!notebookId || !user) return;

    console.log('Setting up Realtime subscription for notebook:', notebookId);

    const setupSubscription = () => {
      const channel = supabase
        .channel(`chat-messages-${notebookId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'n8n_chat_histories',
            filter: `session_id=eq.${notebookId}`
          },
          async (payload) => {
          console.log('Realtime: New message received:', payload);
          
          // Fetch sources for proper transformation
          const { data: sourcesData } = await supabase
            .from('sources')
            .select('id, title, type')
            .eq('notebook_id', notebookId);
          
          const sourceMap = new Map(sourcesData?.map(s => [s.id, s]) || []);
          
          // Transform the new message
          const newMessage = transformMessage(payload.new, sourceMap);
          
          // Update the query cache with the new message
          queryClient.setQueryData(['chat-messages', notebookId], (oldMessages: EnhancedChatMessage[] = []) => {
            // Check if message already exists to prevent duplicates
            const messageExists = oldMessages.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return oldMessages;
            }
            
            console.log('Adding new message to cache:', newMessage);
            return [...oldMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          connectionRetryCount.current = 0;
          console.log('Successfully connected to Realtime');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime connection error:', status);
          
          if (connectionRetryCount.current < maxRetries) {
            connectionRetryCount.current++;
            console.log(`Retrying connection (${connectionRetryCount.current}/${maxRetries})...`);
            
            setTimeout(() => {
              supabase.removeChannel(channel);
              setupSubscription();
            }, 2000 * connectionRetryCount.current);
          } else {
            toast({
              title: "Connection Error",
              description: "Unable to connect to chat service. Please refresh the page.",
              variant: "destructive",
            });
          }
        }
      });

      return channel;
    };

    const channel = setupSubscription();

    return () => {
      console.log('Cleaning up Realtime subscription');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [notebookId, user, queryClient, toast]);

  const sendMessage = useMutation({
    mutationFn: async (messageData: {
      notebookId: string;
      role: 'user' | 'assistant';
      content: string;
      context?: ChatContext;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Call the enhanced edge function
      const { data, error } = await supabase.functions.invoke('send-chat-message', {
        body: {
          session_id: messageData.notebookId,
          message: messageData.content,
          user_id: user.id,
          context: messageData.context
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      if (data?.error) {
        console.error('Webhook error:', data.error);
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Message sent successfully:', data);
      // The AI response will appear via Realtime subscription
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteChatHistory = useMutation({
    mutationFn: async (notebookId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Deleting chat history for notebook:', notebookId);
      
      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', notebookId);

      if (error) {
        console.error('Error deleting chat history:', error);
        throw error;
      }
      
      console.log('Chat history deleted successfully');
      return notebookId;
    },
    onSuccess: (notebookId) => {
      console.log('Chat history cleared for notebook:', notebookId);
      toast({
        title: "Chat history cleared",
        description: "All messages have been deleted successfully.",
      });
      
      // Clear the query data and refetch to confirm
      queryClient.setQueryData(['chat-messages', notebookId], []);
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', notebookId]
      });
    },
    onError: (error) => {
      console.error('Failed to delete chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    sendMessageAsync: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    deleteChatHistory: deleteChatHistory.mutate,
    isDeletingChatHistory: deleteChatHistory.isPending,
  };
};
