import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'user-demo',
  email: 'demo@eipoperai.app',
  full_name: 'Usuário Demo',
  currency: 'BRL',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Verificar se já estava logado ou em demo
    const savedDemo = localStorage.getItem('eipoperai_is_demo');
    if (savedDemo === 'true' || !isSupabaseConfigured) {
      return DEMO_USER;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    return !isSupabaseConfigured || localStorage.getItem('eipoperai_is_demo') === 'true';
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(DEMO_USER);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Verificar sessão existente no Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
        });
        setIsDemo(false);
      } else {
        // Se não tiver sessão no Supabase, inicia como Demo por padrão para não bloquear o app
        setUser(DEMO_USER);
        setIsDemo(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
        });
        setIsDemo(false);
        localStorage.removeItem('eipoperai_is_demo');
      } else {
        setUser(DEMO_USER);
        setIsDemo(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(DEMO_USER);
      setIsDemo(true);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({ ...DEMO_USER, full_name: fullName, email });
      setIsDemo(true);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('eipoperai_is_demo');
    setUser(DEMO_USER);
    setIsDemo(true);
  };

  const enableDemoMode = () => {
    localStorage.setItem('eipoperai_is_demo', 'true');
    setUser(DEMO_USER);
    setIsDemo(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemo,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      enableDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
