/**
 * Example API Configuration Endpoint
 * 
 * This is an example of how to implement the /api/config endpoint
 * for your deployment platform (Vercel, Railway, etc.)
 * 
 * Place this file in your API routes directory according to your platform:
 * - Vercel: /api/config.ts
 * - Railway/Express: Set up route in your Express server
 * - Other platforms: Consult platform documentation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Example for Vercel Edge Functions
export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In production, you would fetch these from secure storage
    // such as environment variables, secrets manager, or a configuration service
    const configuration = {
      supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
      },
      // Optional: Add feature flags
      features: {
        betaFeature: process.env.ENABLE_BETA_FEATURE === 'true',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      },
      // Optional: Add other API endpoints
      api: {
        weatherApi: process.env.WEATHER_API_URL || '',
        analyticsApi: process.env.ANALYTICS_API_URL || '',
      },
    };

    // Validate required configuration
    if (!configuration.supabase.url || !configuration.supabase.anonKey) {
      console.error('Missing required Supabase configuration');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Missing required configuration values',
      });
    }

    // Return configuration
    return res.status(200).json(configuration);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch configuration',
    });
  }
}

/**
 * Alternative: Express.js implementation
 * 
 * app.get('/api/config', (req, res) => {
 *   const configuration = {
 *     supabase: {
 *       url: process.env.SUPABASE_URL,
 *       anonKey: process.env.SUPABASE_ANON_KEY,
 *     },
 *   };
 *   
 *   res.json(configuration);
 * });
 */

/**
 * Alternative: Cloudflare Workers implementation
 * 
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     if (request.method !== 'GET') {
 *       return new Response('Method not allowed', { status: 405 });
 *     }
 *     
 *     const configuration = {
 *       supabase: {
 *         url: env.SUPABASE_URL,
 *         anonKey: env.SUPABASE_ANON_KEY,
 *       },
 *     };
 *     
 *     return new Response(JSON.stringify(configuration), {
 *       headers: { 'Content-Type': 'application/json' },
 *     });
 *   },
 * };
 */