import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  app: 'pakiship' | 'pakipark' | 'pakiadmin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => Promise<void>;
  signup: (email: string, password: string, name: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      app,
    });
  };

  const signup = async (email: string, password: string, name: string, app: 'pakiship' | 'pakipark' | 'pakiadmin') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      app,
    });
  };

  const logout = () => {
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
