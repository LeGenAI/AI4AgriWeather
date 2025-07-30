import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { authenticateWebhook, getWebhookSecret } from '../_shared/webhook-auth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Read raw body for signature verification
    const rawBody = await req.text()
    
    // Authenticate webhook
    const webhookConfig = {
      secret: getWebhookSecret('DOCUMENT_WEBHOOK_SECRET'),
      headerName: 'x-webhook-signature',
      encoding: 'hex' as const,
      prefix: 'sha256='
    }

    const authResponse = await authenticateWebhook(req, rawBody, webhookConfig)
    if (authResponse) {
      return authResponse
    }

    // Parse the verified payload
    const payload = JSON.parse(rawBody)
    
    console.log('🔔 Document processing callback received:', {
      source_id: payload.source_id,
      status: payload.status,
      error: payload.error,
      has_content: !!payload.content,
      has_summary: !!payload.summary,
      timestamp: new Date().toISOString()
    });

    const { source_id, content, summary, display_name, title, status, error } = payload

    if (!source_id) {
      return new Response(
        JSON.stringify({ error: 'source_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Prepare update data
    const updateData: any = {
      processing_status: error ? 'failed' : (status || 'completed'),
      updated_at: new Date().toISOString()
    }

    if (content) {
      updateData.content = content
    }

    if (summary) {
      updateData.summary = summary
    }

    // Use title if provided, otherwise use display_name, for backward compatibility
    if (title) {
      updateData.title = title
    } else if (display_name) {
      updateData.title = display_name
    }

    if (error) {
      updateData.processing_status = 'failed'
      updateData.error_message = error
      console.error('Document processing failed:', error)
    }

    console.log('📝 Updating source with data:', {
      source_id,
      updateData,
      timestamp: new Date().toISOString()
    });

    // Update the source record
    const { data, error: updateError } = await supabaseClient
      .from('sources')
      .update(updateData)
      .eq('id', source_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating source:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update source', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Source updated successfully:', {
      source_id: data.id,
      new_status: data.processing_status,
      title: data.title,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Source updated successfully', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-document-callback function:', error)
    
    // Check if it's a webhook secret configuration error
    if (error.message?.includes('DOCUMENT_WEBHOOK_SECRET')) {
      return new Response(
        JSON.stringify({ 
          error: 'Webhook authentication not configured',
          message: 'Server configuration error' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})