import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useProfile } from '@/hooks/useProfile';

interface AuthContextType {
  user: any;
  session: any;
  profile: any;
  loading: boolean;
  isAuthenticated: boolean;
  effectiveRole: 'admin' | 'management' | 'operational' | 'external';
  signUp: (email: string, password: string, userData?: { name?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSupabaseAuth();
  const { profile, loading: profileLoading, effectiveRole, hasRole } = useProfile();

  const contextValue: AuthContextType = {
    user: auth.user,
    session: auth.session,
    profile,
    loading: auth.loading || profileLoading,
    isAuthenticated: auth.isAuthenticated,
    effectiveRole,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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