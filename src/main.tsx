import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';

// Debug mode for testing
const DEBUG = true;

if (DEBUG) {
  console.log('=== DEBUG MODE ===');
  console.log('Root element:', document.getElementById("root"));
  console.log('Environment:', import.meta.env.MODE);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}
