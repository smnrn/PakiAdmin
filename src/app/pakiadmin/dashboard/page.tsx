'use client';

import { ProtectedRoute } from '@/modules/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute app="pakiadmin">
      <div>Admin Dashboard Content</div>
    </ProtectedRoute>
  );
}
