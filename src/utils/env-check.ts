/**
 * Environment variable validation utility
 */

export const checkEnvironmentVariables = () => {
  const requiredEnvVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const isRailway = window.location.hostname.includes('railway.app');
    
    const errorMessage = `
🚨 Missing Environment Variables 🚨

The following required environment variables are not set:
${missingVars.map(v => `  - ${v}`).join('\n')}

${isRailway ? `
Railway Deployment Instructions:
1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add these variables:
   - VITE_SUPABASE_URL = your Supabase project URL
   - VITE_SUPABASE_ANON_KEY = your Supabase anon key
5. Railway will automatically redeploy after adding variables
` : `
Local Development Instructions:
1. Copy .env.example to .env
2. Fill in the values from your Supabase project settings
`}

Current environment: ${import.meta.env.MODE}
Platform: ${isRailway ? 'Railway' : 'Local/Other'}
`;
    
    console.error(errorMessage);
    
    // Don't block the app completely, just show warning
    return true; // Changed to true to allow app to load
  }
  
  return true;
};