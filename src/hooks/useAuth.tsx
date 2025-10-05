
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logInfo, logError, logWarn } from '@/lib/logger';
import { sanitizeEmail, isValidEmail, isValidPassword, rateLimiter } from '@/lib/validation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Get initial session
    const getInitialSession = async () => {
      if (!mounted || initialized) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session check error:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.warn('Session initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Auth state listener - throttled to prevent excessive requests
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted || !initialized) return;
        
        console.log('Auth event:', event);
        
        // Clear any pending refresh timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }
        
        // Handle critical auth events only
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        // Throttle TOKEN_REFRESHED events to prevent loops
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed silently');
          // Only update session if it's different
          if (session && session.access_token !== session?.access_token) {
            refreshTimeout = setTimeout(() => {
              if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
              }
            }, 1000); // 1 second throttle
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Validate email
      const sanitizedEmail = sanitizeEmail(email);
      if (!isValidEmail(sanitizedEmail)) {
        const error = { message: 'Email inválido' };
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
          variant: "destructive",
        });
        return { error };
      }
      
      // Rate limiting
      if (!rateLimiter.isAllowed(`login:${sanitizedEmail}`, 5, 60000)) {
        const error = { message: 'Rate limit exceeded' };
        toast({
          title: "Muitas tentativas de login",
          description: "Aguarde 1 minuto antes de tentar novamente.",
          variant: "destructive",
        });
        logWarn('Login rate limit exceeded', {
          action: 'sign_in',
          metadata: { email: sanitizedEmail }
        });
        return { error };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });
      
      if (error) {
        logError('Sign in error', error, {
          action: 'sign_in',
          metadata: { email: sanitizedEmail }
        });
        
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          toast({
            title: "Muitas tentativas de login",
            description: "Aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        logInfo('User signed in successfully', {
          action: 'sign_in',
          userId: user?.id,
          metadata: { email: sanitizedEmail }
        });
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
      }
      
      return { error };
    } catch (error: any) {
      logError('Sign in failed', error, {
        action: 'sign_in'
      });
      toast({
        title: "Erro no login",
        description: "Falha na conexão. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      // Validate email
      const sanitizedEmail = sanitizeEmail(email);
      if (!isValidEmail(sanitizedEmail)) {
        const error = { message: 'Email inválido' };
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
          variant: "destructive",
        });
        return { error };
      }
      
      // Validate password
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        const error = { message: passwordValidation.errors.join(', ') };
        toast({
          title: "Senha fraca",
          description: passwordValidation.errors.join(' '),
          variant: "destructive",
        });
        return { error };
      }
      
      // Rate limiting
      if (!rateLimiter.isAllowed(`signup:${sanitizedEmail}`, 3, 300000)) {
        const error = { message: 'Rate limit exceeded' };
        toast({
          title: "Muitas tentativas de cadastro",
          description: "Aguarde 5 minutos antes de tentar novamente.",
          variant: "destructive",
        });
        logWarn('Signup rate limit exceeded', {
          action: 'sign_up',
          metadata: { email: sanitizedEmail }
        });
        return { error };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || sanitizedEmail,
          }
        }
      });
      
      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          toast({
            title: "Muitas tentativas de cadastro",
            description: "Aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        logInfo('User signed up successfully', {
          action: 'sign_up',
          metadata: { email: sanitizedEmail }
        });
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
      
      return { error };
    } catch (error: any) {
      logError('Sign up failed', error, {
        action: 'sign_up'
      });
      toast({
        title: "Erro no cadastro",
        description: "Falha na conexão. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      logInfo('User signing out', {
        action: 'sign_out',
        userId: user?.id
      });
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message?.toLowerCase().includes('session not found')) {
        logError('Sign out error', error, {
          action: 'sign_out',
          userId: user?.id
        });
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Limpar estado local
      setSession(null);
      setUser(null);
      
      logInfo('User signed out successfully', {
        action: 'sign_out'
      });
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      logError('Sign out failed', error, {
        action: 'sign_out',
        userId: user?.id
      });
      // Para erros de sessão não encontrada, ainda fazemos logout local
      if (error?.message?.toLowerCase().includes('session not found')) {
        setSession(null);
        setUser(null);
        toast({
          title: "Logout realizado",
          description: "Até logo!",
        });
      } else {
        toast({
          title: "Erro no logout",
          description: error?.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
