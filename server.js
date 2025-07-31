const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for JSON parsing
app.use(express.json());

// CORS configuration for production
app.use((req, res, next) => {
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://insights-lm-public.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

// Configuration API endpoint
app.get('/api/config', (req, res) => {
  // Check if required environment variables are present
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  // Validate required configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Required environment variables are not set',
      missing: [
        !supabaseUrl && 'VITE_SUPABASE_URL',
        !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY'
      ].filter(Boolean)
    });
  }
  
  // Detect environment
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  
  // Return only safe/public configuration values
  res.json({
    supabaseUrl,
    supabaseAnonKey,
    environment
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes for SPA (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});