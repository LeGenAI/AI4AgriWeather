// Enhanced chat types with proper structure for agent collaboration

export interface ChatContext {
  type: 'general' | 'weather' | 'crops' | 'knowledge';
  metadata?: {
    cropType?: string;
    location?: string;
    timeRange?: string;
    language?: string;
  };
}

export interface ChatAgent {
  id: string;
  name: string;
  type: 'coordinator' | 'weather' | 'crops' | 'knowledge' | 'search';
  capabilities: string[];
}

export interface AgentResponse {
  agentId: string;
  content: string;
  sources?: string[];
  confidence: number;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  userId: string;
  context?: ChatContext;
  previousAgents?: string[];
}

export interface ChatResponse {
  success: boolean;
  messageId?: string;
  timestamp: string;
  error?: string;
  agentResponses?: AgentResponse[];
}

// Message format that n8n should return
export interface N8nChatResponse {
  type: 'ai';
  content: {
    output: Array<{
      text: string;
      citations?: Array<{
        chunk_index: number;
        chunk_source_id: string;
        chunk_lines_from: number;
        chunk_lines_to: number;
      }>;
    }>;
  };
  metadata?: {
    agents?: AgentResponse[];
    processingTime?: number;
    confidence?: number;
  };
}

// Standardized error response
export interface ChatError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}