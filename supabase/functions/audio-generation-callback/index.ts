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
      secret: getWebhookSecret('AUDIO_WEBHOOK_SECRET'),
      headerName: 'x-webhook-signature',
      encoding: 'hex' as const,
      prefix: 'sha256='
    }

    const authResponse = await authenticateWebhook(req, rawBody, webhookConfig)
    if (authResponse) {
      return authResponse
    }

    // Parse the verified payload
    const body = JSON.parse(rawBody)
    console.log('Audio generation callback received:', body)
    
    const { notebook_id, audio_url, status, error } = body
    
    if (!notebook_id) {
      return new Response(
        JSON.stringify({ error: 'Notebook ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (status === 'success' && audio_url) {
      // Set expiration time (24 hours from now)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // Update notebook with audio URL and success status
      const { error: updateError } = await supabase
        .from('notebooks')
        .update({
          audio_overview_url: audio_url,
          audio_url_expires_at: expiresAt.toISOString(),
          audio_overview_generation_status: 'completed'
        })
        .eq('id', notebook_id)

      if (updateError) {
        console.error('Error updating notebook with audio URL:', updateError)
        throw updateError
      }

      console.log('Audio overview completed successfully for notebook:', notebook_id)
    } else {
      // Update notebook with failed status
      const { error: updateError } = await supabase
        .from('notebooks')
        .update({
          audio_overview_generation_status: 'failed'
        })
        .eq('id', notebook_id)

      if (updateError) {
        console.error('Error updating notebook status to failed:', updateError)
        throw updateError
      }

      console.log('Audio generation failed for notebook:', notebook_id, 'Error:', error)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in audio-generation-callback:', error)
    
    // Check if it's a webhook secret configuration error
    if (error.message?.includes('AUDIO_WEBHOOK_SECRET')) {
      return new Response(
        JSON.stringify({ 
          error: 'Webhook authentication not configured',
          message: 'Server configuration error' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process callback' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})