'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAccountRoleLabel, getDisplayNameForEmail } from '../lib/sampleAccounts';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  app: 'pakiship' | 'pakipark' | 'pakiadmin';
  role?: string;
  roleLabel?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => Promise<User>;
  signup: (email: string, password: string, name: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Login failed");

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .schema('account')
      .rpc('get_profile_by_id', { p_user_id: authData.user.id });

    if (profileError && profileError.code !== 'PGRST116') {
      console.error(profileError);
    }

    let role: string | undefined = undefined;

    if (app === 'pakiadmin') {
      const { data: adminAccount, error: adminError } = await supabase
        .schema('account')
        .from('admin_accounts')
        .select('admin_role')
        .eq('profile_id', profile ? profile.id : authData.user.id)
        .single();
      
      if (adminError) {
        console.error("Failed to fetch admin role", adminError);
        throw new Error("You do not have administrative access.");
      }
      role = adminAccount.admin_role;
    }

    const newUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: profile?.full_name || authData.user.user_metadata?.full_name || getDisplayNameForEmail(email, email.split('@')[0]),
      app,
      role,
      roleLabel: role ? getAccountRoleLabel(role as any) : undefined,
    };
    setUser(newUser);
    return newUser;
  };

  const signup = async (email: string, password: string, name: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (authError) throw authError;

    const newUser = {
      id: authData.user?.id || Math.random().toString(36).substr(2, 9),
      email,
      name,
      app,
      role: app === 'pakiadmin' ? 'admin' : undefined,
      roleLabel: app === 'pakiadmin' ? 'Admin' : undefined,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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
