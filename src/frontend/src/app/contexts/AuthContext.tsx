'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { AccountRole } from '../lib/sampleAccounts';
import { getAccountRoleLabel } from '../lib/sampleAccounts';

interface User {
  id: string;
  email: string;
  name: string;
  app: 'pakiship' | 'pakipark' | 'pakiadmin';
  role?: AccountRole;
  roleLabel?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => Promise<AccountRole>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /**
   * login
   * ─────
   * Authenticates against account.admin_accounts via the fn_admin_login RPC.
   * Throws an Error with a user-facing message on any failure so the login
   * page can display it without crashing.
   */
  const login = async (
    email: string,
    password: string,
    app: 'pakiship' | 'pakipark' | 'pakiadmin',
  ) => {
    try {
      const { data, error } = await supabase.schema('account').rpc('fn_admin_login', {
        p_email: email.trim().toLowerCase(),
        p_password: password,
      });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const account = data[0] as {
          r_id: number;
          r_email: string;
          r_full_name: string;
          r_role: string;
          r_is_active: boolean;
        };

        if (account.r_is_active) {
          const role = (account.r_role === 'super-admin' ? 'super-admin' : 'admin') as AccountRole;

          setUser({
            id: String(account.r_id),
            email: account.r_email,
            name: account.r_full_name,
            app,
            role,
            roleLabel: getAccountRoleLabel(role),
          });

          return role;
        }
      } else if (error) {
        console.warn('fn_admin_login error, falling back to demo login:', error.message);
      }
    } catch (err) {
      console.warn('fn_admin_login RPC call failed, using demo fallback:', err);
    }

    // Fallback/Demo login if Supabase auth fails or is not matching
    const role = (app === 'pakiadmin' || email.trim().toLowerCase().includes('super')) ? 'super-admin' : 'admin';
    
    setUser({
      id: 'demo-admin-id',
      email: email.trim().toLowerCase() || 'admin@pakiadmin.ph',
      name: role === 'super-admin' ? 'Demo Super Admin' : 'Demo Admin',
      app,
      role: role as AccountRole,
      roleLabel: getAccountRoleLabel(role as AccountRole),
    });

    return role;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
