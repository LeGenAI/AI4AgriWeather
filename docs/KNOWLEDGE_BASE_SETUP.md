# Knowledge Base System Environment Variables Setup Guide

## Overview

This guide provides detailed instructions for configuring environment variables required for the AI4AgriWeather Knowledge Base system, including integration with n8n workflows and Supabase Edge Functions.

## Required Environment Variables

### 1. DOCUMENT_PROCESSING_WEBHOOK_URL

This webhook URL triggers the n8n workflow for extracting text from uploaded documents.

**Purpose**: Processes PDF, DOCX, and other document formats to extract text content for the knowledge base.

**Format**: `https://your-n8n-instance.com/webhook/[webhook-id]/extract-text`

### 2. NOTEBOOK_GENERATION_AUTH

Authentication token for accessing the notebook generation service.

**Purpose**: Secures the notebook generation endpoint to prevent unauthorized access.

**Format**: A secure random string (minimum 32 characters)

**Example**: `nb_auth_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 3. Additional n8n Webhook URLs

#### WEATHER_DATA_WEBHOOK_URL
- **Purpose**: Triggers weather data collection and processing
- **Format**: `https://your-n8n-instance.com/webhook/[webhook-id]/weather-data`

#### INSIGHT_GENERATION_WEBHOOK_URL
- **Purpose**: Initiates AI-powered insight generation from processed data
- **Format**: `https://your-n8n-instance.com/webhook/[webhook-id]/generate-insights`

#### NOTIFICATION_WEBHOOK_URL
- **Purpose**: Sends notifications for system events and alerts
- **Format**: `https://your-n8n-instance.com/webhook/[webhook-id]/notifications`

## Setting Up Environment Variables

### Local Development (.env file)

Create a `.env` file in your project root:

```bash
# Document Processing
DOCUMENT_PROCESSING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/abc123/extract-text

# Authentication
NOTEBOOK_GENERATION_AUTH=nb_auth_your_secure_token_here

# Weather Data Processing
WEATHER_DATA_WEBHOOK_URL=https://your-n8n-instance.com/webhook/def456/weather-data

# AI Insights
INSIGHT_GENERATION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ghi789/generate-insights

# Notifications
NOTIFICATION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/jkl012/notifications

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Edge Functions Environment Variables

#### Method 1: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Set environment variables:
```bash
# Set individual variables
supabase secrets set DOCUMENT_PROCESSING_WEBHOOK_URL="https://your-n8n-instance.com/webhook/abc123/extract-text"
supabase secrets set NOTEBOOK_GENERATION_AUTH="nb_auth_your_secure_token_here"
supabase secrets set WEATHER_DATA_WEBHOOK_URL="https://your-n8n-instance.com/webhook/def456/weather-data"
supabase secrets set INSIGHT_GENERATION_WEBHOOK_URL="https://your-n8n-instance.com/webhook/ghi789/generate-insights"
supabase secrets set NOTIFICATION_WEBHOOK_URL="https://your-n8n-instance.com/webhook/jkl012/notifications"
```

4. List all secrets to verify:
```bash
supabase secrets list
```

#### Method 2: Using Supabase Dashboard

1. Navigate to your Supabase project dashboard
2. Go to **Settings** → **Edge Functions**
3. Click on **Secrets** tab
4. Add each environment variable:
   - Click **Add new secret**
   - Enter the variable name and value
   - Click **Save**

### Accessing Environment Variables in Edge Functions

In your Edge Function code:

```typescript
// Access environment variables
const documentProcessingUrl = Deno.env.get('DOCUMENT_PROCESSING_WEBHOOK_URL');
const notebookAuth = Deno.env.get('NOTEBOOK_GENERATION_AUTH');

// Example usage in a function
export async function processDocument(file: File) {
  const response = await fetch(documentProcessingUrl!, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notebookAuth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file: await file.text(),
      filename: file.name
    })
  });
  
  return response.json();
}
```

## n8n Workflow Integration

### Setting Up n8n Webhooks

1. **Create a new workflow** in n8n
2. Add a **Webhook** node as the trigger
3. Configure the webhook:
   - **HTTP Method**: POST (recommended)
   - **Path**: Choose a descriptive path (e.g., `/extract-text`)
   - **Authentication**: Basic Auth or Header Auth
   - **Response Mode**: "When last node finishes"

4. Copy the production webhook URL from the webhook node

### Example n8n Workflow Structure

```
[Webhook] → [Set Variables] → [Process Document] → [Store in Database] → [Return Response]
```

### Webhook Security

Configure authentication in n8n:

1. In the Webhook node, enable authentication
2. Choose authentication method:
   - **Basic Auth**: Username/password
   - **Header Auth**: Custom header with token

Example header authentication:
```json
{
  "name": "Authorization",
  "value": "Bearer {{your-webhook-token}}"
}
```

## Integration Example

### Document Upload Flow

```typescript
// Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { file, userId } = await req.json();
  
  // Get webhook URL from environment
  const webhookUrl = Deno.env.get('DOCUMENT_PROCESSING_WEBHOOK_URL');
  const authToken = Deno.env.get('NOTEBOOK_GENERATION_AUTH');
  
  if (!webhookUrl || !authToken) {
    return new Response('Missing configuration', { status: 500 });
  }
  
  try {
    // Send to n8n for processing
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file,
        userId,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await n8nResponse.json();
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Processing failed', { status: 500 });
  }
});
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Webhook URL Not Working

**Symptoms**: 404 or connection refused errors

**Solutions**:
- Verify the webhook URL is correct and includes the full path
- Ensure n8n is running and the workflow is active
- Check if the webhook is set to "Production" mode in n8n
- Verify firewall/security group rules allow incoming connections

#### 2. Authentication Failures

**Symptoms**: 401 or 403 errors

**Solutions**:
- Double-check the authentication token matches in both systems
- Ensure the Authorization header format is correct
- Verify the token hasn't expired or been rotated
- Check n8n webhook authentication settings

#### 3. Environment Variables Not Loading

**Symptoms**: undefined values when accessing env vars

**Solutions**:
- For local development, ensure `.env` file is in the correct location
- Restart the development server after adding new variables
- For Supabase, verify secrets are set using `supabase secrets list`
- Check for typos in variable names

#### 4. Timeout Issues

**Symptoms**: Request times out without response

**Solutions**:
- Increase timeout settings in Edge Functions
- Optimize n8n workflow for faster processing
- Implement async processing for large files
- Add proper error handling and retry logic

### Debug Logging

Add debug logging to trace issues:

```typescript
// Enable debug mode
const DEBUG = Deno.env.get('DEBUG') === 'true';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
  }
}

// Usage
debugLog('Webhook URL', webhookUrl);
debugLog('Request payload', { file: file.name, size: file.size });
```

### Testing Webhooks

Use curl to test webhooks directly:

```bash
# Test document processing webhook
curl -X POST https://your-n8n-instance.com/webhook/abc123/extract-text \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "Hello from curl"}'
```

## Security Best Practices

1. **Never commit secrets to version control**
   - Add `.env` to `.gitignore`
   - Use environment-specific configurations

2. **Rotate tokens regularly**
   - Set up a rotation schedule (e.g., every 90 days)
   - Update both n8n and Supabase simultaneously

3. **Use HTTPS for all webhooks**
   - Ensure n8n is configured with SSL/TLS
   - Never send sensitive data over HTTP

4. **Implement rate limiting**
   - Add rate limiting in Edge Functions
   - Configure n8n webhook rate limits

5. **Monitor webhook usage**
   - Track webhook calls and response times
   - Set up alerts for failures or anomalies

## Production Deployment Checklist

- [ ] All environment variables are set in production
- [ ] Webhook URLs point to production n8n instance
- [ ] Authentication tokens are unique and secure
- [ ] SSL/TLS is enabled for all endpoints
- [ ] Error handling is implemented
- [ ] Monitoring and logging are configured
- [ ] Rate limiting is enabled
- [ ] Backup webhook endpoints are configured
- [ ] Documentation is updated with production values

## Support and Resources

- **n8n Documentation**: https://docs.n8n.io/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Project Repository**: https://github.com/your-org/AI4AgriWeather

For additional support, contact the development team or refer to the project's issue tracker.

---

*Last updated: 2025-07-25*