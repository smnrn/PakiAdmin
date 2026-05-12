import { createBrowserRouter, Outlet } from 'react-router';
import LandingPage from './pages/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// PakiAdmin Import
import PakiAdminLogin from './pages/pakiadmin/LoginPage';
import PakiAdminSignup from './pages/pakiadmin/SignupPage';
import PakiAdminForgotPassword from './pages/pakiadmin/ForgotPasswordPage';
import PakiAdminResetPassword from './pages/pakiadmin/ResetPasswordPage';
import SuperAdminDashboardPage from './pages/pakiadmin/SuperAdminDashboardPage';
import AdminSettingsPage from './pages/pakiadmin/AdminSettingsPage';

// PakiShip Imports
import PakiShipDashboard from './pages/pakiship/DashboardPage';
import PakiShipShipments from './pages/pakiship/ShipmentsPage';
import PakiShipTracking from './pages/pakiship/TrackingPage';
import PakiShipAnalytics from './pages/pakiship/AnalyticsPage';
import PakiShipSettings from './pages/pakiship/SettingsPage';
import PakiShipProfile from './pages/pakiship/ProfilePage';
import PakiShipUserAcceptance from './pages/pakiship/UserAcceptancePage';

// PakiPark Imports
import PakiParkDashboard from './pages/pakipark/DashboardPage';
import PakiParkReservations from './pages/pakipark/ReservationsPage';
import PakiParkBookings from './pages/pakipark/BookingsPage';
import PakiParkReports from './pages/pakipark/ReportsPage';
import PakiParkSettings from './pages/pakipark/SettingsPage';
import PakiParkProfile from './pages/pakipark/ProfilePage';

import { ProtectedRoute } from './components/ProtectedRoute';

function RootLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <PakiAdminLogin />,
      },

      /* --- PAKIADMIN ROUTES --- */
      {
        path: 'pakiadmin/login',
        element: <PakiAdminLogin />,
      },
      {
        path: 'pakiadmin/signup',
        element: <PakiAdminSignup />,
      },
      {
        path: 'pakiadmin/forgot-password',
        element: <PakiAdminForgotPassword />,
      },
      {
        path: 'pakiadmin/reset-password',
        element: <PakiAdminResetPassword />,
      },
      {
        path: 'pakiadmin/super-admin',
        element: (
          <ProtectedRoute app="pakiadmin">
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiadmin/settings',
        element: (
          <ProtectedRoute app="pakiadmin">
            <AdminSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiadmin/dashboard',
        element: (
          <ProtectedRoute app="pakiadmin">
            <div>Admin Dashboard Content</div>
          </ProtectedRoute>
        ),
      },

      /* --- PAKISHIP ROUTES (Login/Signup via PakiAdmin) --- */
      {
        path: 'pakiship/dashboard',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiship/shipments',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipShipments />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiship/tracking',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipTracking />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiship/analytics',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipAnalytics />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiship/settings',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiship/profile',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakiship/user-acceptance',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiShipUserAcceptance />
          </ProtectedRoute>
        ),
      },

      /* --- PAKIPARK ROUTES (Login/Signup Disregarded) --- */
      {
        path: 'pakipark/dashboard',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakipark/reservations',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkReservations />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakipark/bookings',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakipark/bookings',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakipark/reports',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkReports />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakipark/settings',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pakipark/profile',
        element: (
          <ProtectedRoute app="pakiship">
            <PakiParkProfile />
          </ProtectedRoute>
        ),
      },

      /* --- OPTIONAL: MOVE ORIGINAL LANDING PAGE --- */
      {
        path: 'about',
        element: <LandingPage />,
      },
    ],
  },
]);