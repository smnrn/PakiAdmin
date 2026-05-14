'use client';

import { Navigate } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  app: 'pakiship' | 'pakipark' | 'pakiadmin';
}

function canAccessApp(
  userApp: 'pakiship' | 'pakipark' | 'pakiadmin',
  requestedApp: 'pakiship' | 'pakipark' | 'pakiadmin'
) {
  if (userApp === requestedApp) {
    return true;
  }

  const sharedOperationsApps = new Set(['pakiship', 'pakipark']);

  return sharedOperationsApps.has(userApp) && sharedOperationsApps.has(requestedApp);
}

export function ProtectedRoute({ children, app }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user || !canAccessApp(user.app, app)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
