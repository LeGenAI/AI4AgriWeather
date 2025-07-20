
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Wheat, Cloud, Sprout } from 'lucide-react';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
        setIsSignUp(false);
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email before signing in.');
          } else {
            throw error;
          }
        }
        
        toast({
          title: "Welcome to AI4AgriWeather!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Wheat className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">AI4AgriWeather</CardTitle>
          <CardDescription className="text-center">
            {isSignUp 
              ? 'Create an account to access smart agricultural weather intelligence'
              : 'Sign in to your AI4AgriWeather dashboard'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {/* Features showcase for sign up */}
            {isSignUp && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-gray-600 font-medium">Get access to:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <span>Real-time weather forecasts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sprout className="h-4 w-4 text-green-500" />
                    <span>AI-powered crop management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wheat className="h-4 w-4 text-orange-500" />
                    <span>Personalized farming advice</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
            
            <div className="text-sm text-center">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New to AI4AgriWeather?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                    disabled={loading}
                  >
                    Create account
                  </button>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
export { AuthForm };
