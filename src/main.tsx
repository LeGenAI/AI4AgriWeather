import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';
import { checkEnvironmentVariables } from './utils/env-check';

// Debug mode for testing
const DEBUG = true;

if (DEBUG) {
  console.log('=== DEBUG MODE ===');
  console.log('Root element:', document.getElementById("root"));
  console.log('Environment:', import.meta.env.MODE);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  console.log('All env vars:', import.meta.env);
}

// Check environment variables
const hasValidEnv = checkEnvironmentVariables();

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    const root = createRoot(rootElement);
    if (hasValidEnv) {
      root.render(<App />);
      console.log('React app rendered successfully');
    } else {
      root.render(
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          fontFamily: 'monospace',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ color: '#ff0000' }}>⚠️ Configuration Error</h1>
          <p>Required environment variables are missing. Please check the console for details.</p>
          <p style={{ fontSize: '14px', marginTop: '20px' }}>
            If you're deploying on Railway, make sure to add these variables in the Variables tab of your project.
          </p>
        </div>
      );
    }
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}
