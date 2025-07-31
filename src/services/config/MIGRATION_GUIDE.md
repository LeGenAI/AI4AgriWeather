# Migration Guide: Dynamic Supabase Configuration

This guide explains how to migrate existing code to use the new dynamic configuration system.

## Overview

The new configuration system loads Supabase credentials dynamically from `/api/config` endpoint instead of relying on build-time environment variables. This allows for:

- Runtime configuration changes without rebuilding
- Different configurations per deployment
- Secure credential management
- Feature flags and dynamic configuration

## Migration Steps

### 1. For React Components

#### Before:
```tsx
import { supabase } from '@/integrations/supabase/client';

function MyComponent() {
  const handleClick = async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*');
  };
  
  return <button onClick={handleClick}>Load Data</button>;
}
```

#### After:
```tsx
import { useSupabase } from '@/integrations/supabase/client';

function MyComponent() {
  const { client, isLoading, error } = useSupabase();
  
  const handleClick = async () => {
    if (!client) return;
    
    const { data, error } = await client
      .from('table')
      .select('*');
  };
  
  if (isLoading) return <div>Loading configuration...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <button onClick={handleClick}>Load Data</button>;
}
```

### 2. For Context Providers (like AuthContext)

#### Before:
```tsx
import { supabase } from '@/integrations/supabase/client';

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle auth state change
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  return <AuthContext.Provider>{children}</AuthContext.Provider>;
};
```

#### After:
```tsx
import { useSupabase } from '@/integrations/supabase/client';

export const AuthProvider = ({ children }) => {
  const { client } = useSupabase();
  
  useEffect(() => {
    if (!client) return;
    
    const { data: authListener } = client.auth.onAuthStateChange(
      (event, session) => {
        // Handle auth state change
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [client]);
  
  return <AuthContext.Provider>{children}</AuthContext.Provider>;
};
```

### 3. For Non-React Code (API calls, utilities)

#### Before:
```ts
import { supabase } from '@/integrations/supabase/client';

export async function fetchUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { data, error };
}
```

#### After:
```ts
import { getSupabase } from '@/integrations/supabase/client';

export async function fetchUserData(userId: string) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { data, error };
}
```

**Note:** `getSupabase()` will throw an error if called before the configuration is loaded. Make sure it's only called after the app has initialized.

### 4. For Server-Side Functions

Edge functions and server-side code should continue to use environment variables directly:

```ts
// In edge functions
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
```

## API Configuration Endpoint

The `/api/config` endpoint should return:

```json
{
  "supabase": {
    "url": "https://your-project.supabase.co",
    "anonKey": "your-anon-key"
  },
  "features": {
    "featureName": true
  },
  "api": {
    "endpoint": "https://api.example.com"
  }
}
```

## Feature Flags

Use feature flags to enable/disable features dynamically:

```tsx
import { useFeatureFlag } from '@/contexts/ConfigContext';

function MyFeature() {
  const isEnabled = useFeatureFlag('myNewFeature');
  
  if (!isEnabled) return null;
  
  return <div>New Feature Content</div>;
}
```

## Error Handling

The configuration system provides comprehensive error handling:

1. **Loading State**: Shows a loading screen while fetching configuration
2. **Error State**: Shows an error screen with retry option if configuration fails
3. **Fallback**: Falls back to environment variables if API is unavailable

## Testing

For testing, you can mock the configuration:

```tsx
import { configService } from '@/services/config/configService';

beforeEach(() => {
  configService.clearCache();
  // Mock the fetch call
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-key'
        }
      })
    })
  );
});
```

## Deployment

1. Set up your `/api/config` endpoint to return the configuration
2. Remove hard-coded environment variables from your deployment
3. Ensure the configuration endpoint is accessible from your app
4. Test the fallback mechanism by temporarily disabling the endpoint

## Benefits

- **Security**: Credentials are not exposed in the client bundle
- **Flexibility**: Change configuration without rebuilding
- **Environment-specific**: Different configs for dev/staging/prod
- **Feature Management**: Toggle features without deployment
- **Monitoring**: Track configuration access and errors