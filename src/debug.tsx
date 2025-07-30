import React from 'react';

export default function Debug() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>Debug Page</h1>
      <p>If you see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Environment: {import.meta.env.MODE}</p>
      <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set'}</p>
      <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}</p>
    </div>
  );
}