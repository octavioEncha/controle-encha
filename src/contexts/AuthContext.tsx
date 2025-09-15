import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PerfilUsuario } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  perfil: PerfilUsuario | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updatePerfil: (perfil: Partial<PerfilUsuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPerfil = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      const { data, error } = await supabase
        .from('perfis_usuario')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
      }
      
      console.log('Perfil encontrado:', data);
      setPerfil((data as PerfilUsuario) || null);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setPerfil(null);
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Deferir chamada ao Supabase para evitar deadlocks
          setTimeout(() => {
            fetchPerfil(session.user!.id);
          }, 0);
        } else {
          setPerfil(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => fetchPerfil(session.user!.id), 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updatePerfil = async (updates: Partial<PerfilUsuario>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('perfis_usuario')
      .upsert({
        user_id: user.id,
        ...updates,
      } as any)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
    
    setPerfil(data as PerfilUsuario);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      perfil,
      loading,
      signUp,
      signIn,
      signOut,
      updatePerfil,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}