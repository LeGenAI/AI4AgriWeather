import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

/**
 * Webhook authentication utilities for verifying HMAC-SHA256 signatures
 */

export interface WebhookAuthConfig {
  secret: string;
  headerName?: string;
  encoding?: 'hex' | 'base64';
  prefix?: string;
}

export interface WebhookAuthResult {
  isValid: boolean;
  error?: string;
  providedSignature?: string;
  expectedSignature?: string;
}

/**
 * Verifies webhook signature using HMAC-SHA256
 * @param request - The incoming request object
 * @param payload - The request payload (already parsed JSON or raw string)
 * @param config - Webhook authentication configuration
 * @returns Authentication result with validation status
 */
export async function verifyWebhookSignature(
  request: Request,
  payload: string | object,
  config: WebhookAuthConfig
): Promise<WebhookAuthResult> {
  try {
    // Get configuration with defaults
    const {
      secret,
      headerName = 'x-webhook-signature',
      encoding = 'hex',
      prefix = ''
    } = config;

    if (!secret) {
      return {
        isValid: false,
        error: 'Webhook secret not configured'
      };
    }

    // Get signature from header
    const providedSignature = request.headers.get(headerName);
    if (!providedSignature) {
      return {
        isValid: false,
        error: `Missing ${headerName} header`
      };
    }

    // Remove prefix if present
    const signature = prefix && providedSignature.startsWith(prefix)
      ? providedSignature.slice(prefix.length)
      : providedSignature;

    // Convert payload to string if needed
    const payloadString = typeof payload === 'string' 
      ? payload 
      : JSON.stringify(payload);

    // Create HMAC
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(payloadString);
    
    const hmac = await createHmac('sha256', key);
    hmac.update(data);
    const hash = await hmac.digest();

    // Convert hash to specified encoding
    let expectedSignature: string;
    if (encoding === 'hex') {
      expectedSignature = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (encoding === 'base64') {
      expectedSignature = btoa(String.fromCharCode(...new Uint8Array(hash)));
    } else {
      return {
        isValid: false,
        error: `Unsupported encoding: ${encoding}`
      };
    }

    // Add prefix to expected signature if configured
    if (prefix) {
      expectedSignature = prefix + expectedSignature;
    }

    // Timing-safe comparison
    const isValid = timingSafeEqual(providedSignature, expectedSignature);

    return {
      isValid,
      providedSignature: providedSignature.substring(0, 10) + '...',
      expectedSignature: expectedSignature.substring(0, 10) + '...'
    };

  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return {
      isValid: false,
      error: `Verification error: ${error.message}`
    };
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Creates an authentication middleware for webhook endpoints
 * @param config - Webhook authentication configuration
 * @returns Response if authentication fails, null if successful
 */
export async function authenticateWebhook(
  request: Request,
  rawBody: string,
  config: WebhookAuthConfig
): Promise<Response | null> {
  const result = await verifyWebhookSignature(request, rawBody, config);

  if (!result.isValid) {
    console.error('Webhook authentication failed:', {
      error: result.error,
      provided: result.providedSignature,
      expected: result.expectedSignature,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: result.error || 'Invalid webhook signature'
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Signature'
        }
      }
    );
  }

  console.log('Webhook authentication successful', {
    timestamp: new Date().toISOString()
  });

  return null;
}

/**
 * Helper to get webhook secret from environment
 * @param envVar - Environment variable name
 * @returns Webhook secret or throws error
 */
export function getWebhookSecret(envVar: string): string {
  const secret = Deno.env.get(envVar);
  if (!secret) {
    throw new Error(`${envVar} environment variable not set`);
  }
  return secret;
}