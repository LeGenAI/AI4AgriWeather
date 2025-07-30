

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, message, user_id, context } = await req.json();
    
    console.log('Received message:', { session_id, message, user_id, context });

    // Validate required fields
    if (!session_id || !message || !user_id) {
      throw new Error('Missing required fields: session_id, message, or user_id');
    }

    // Get the webhook URL and auth header from environment
    const webhookUrl = Deno.env.get('NOTEBOOK_CHAT_URL');
    const authHeader = Deno.env.get('NOTEBOOK_GENERATION_AUTH');
    
    if (!webhookUrl) {
      throw new Error('NOTEBOOK_CHAT_URL environment variable not set');
    }

    if (!authHeader) {
      throw new Error('NOTEBOOK_GENERATION_AUTH environment variable not set');
    }

    console.log('Sending to webhook with auth header');

    // First, store the user's message in the database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id,
        message: {
          type: 'human',
          content: message,
          additional_kwargs: { context },
          response_metadata: {},
          tool_calls: [],
          invalid_tool_calls: []
        }
      });

    if (insertError) {
      console.error('Error storing user message:', insertError);
      throw new Error(`Failed to store user message: ${insertError.message}`);
    }

    // Send message to n8n webhook with authentication
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        session_id,
        message,
        user_id,
        context,
        timestamp: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      console.error(`Webhook responded with status: ${webhookResponse.status}`);
      const errorText = await webhookResponse.text();
      console.error('Webhook error response:', errorText);
      
      // Store error message in chat history
      await supabase
        .from('n8n_chat_histories')
        .insert({
          session_id,
          message: {
            type: 'ai',
            content: `Error: Failed to get response from AI service (Status: ${webhookResponse.status})`,
            additional_kwargs: { error: errorText },
            response_metadata: {},
            tool_calls: [],
            invalid_tool_calls: []
          }
        });
      
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('Webhook response:', webhookData);

    // The n8n workflow will handle storing the AI response
    // We just need to return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in send-chat-message:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send message to webhook',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

