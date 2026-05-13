'use client';

import { Navigate } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  app: 'pakiship' | 'pakipark' | 'pakiadmin';
}

export function ProtectedRoute({ children, app }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user || user.app !== app) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
