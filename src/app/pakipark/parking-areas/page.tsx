'use client';

import { ProtectedRoute } from '@/modules/components/ProtectedRoute';
import ParkingAreasPage from '@/modules/pages/pakipark/ParkingAreasPage';

export default function Page() {
  return (
    <ProtectedRoute app="pakipark">
      <ParkingAreasPage />
    </ProtectedRoute>
  );
}
