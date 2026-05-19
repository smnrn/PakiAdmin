const fs = require('fs');
const path = require('path');

const routes = [
  { path: '', component: 'PakiAdminLogin', file: 'pakiadmin/LoginPage', protected: false },
  { path: 'pakiadmin/login', component: 'PakiAdminLogin', file: 'pakiadmin/LoginPage', protected: false },
  { path: 'pakiadmin/signup', component: 'PakiAdminSignup', file: 'pakiadmin/SignupPage', protected: false },
  { path: 'pakiadmin/forgot-password', component: 'PakiAdminForgotPassword', file: 'pakiadmin/ForgotPasswordPage', protected: false },
  { path: 'pakiadmin/reset-password', component: 'PakiAdminResetPassword', file: 'pakiadmin/ResetPasswordPage', protected: false },
  { path: 'pakiadmin/super-admin', component: 'SuperAdminDashboardPage', file: 'pakiadmin/SuperAdminDashboardPage', protected: true, app: 'pakiadmin' },
  { path: 'pakiadmin/settings', component: 'AdminSettingsPage', file: 'pakiadmin/AdminSettingsPage', protected: true, app: 'pakiadmin' },
  { path: 'pakiadmin/dashboard', component: 'Admin Dashboard Content', file: null, protected: true, app: 'pakiadmin', isRaw: true },

  { path: 'pakiship/dashboard', component: 'PakiShipDashboard', file: 'pakiship/DashboardPage', protected: true, app: 'pakiship' },
  { path: 'pakiship/shipments', component: 'PakiShipShipments', file: 'pakiship/ShipmentsPage', protected: true, app: 'pakiship' },
  { path: 'pakiship/tracking', component: 'PakiShipTracking', file: 'pakiship/TrackingPage', protected: true, app: 'pakiship' },
  { path: 'pakiship/analytics', component: 'PakiShipAnalytics', file: 'pakiship/AnalyticsPage', protected: true, app: 'pakiship' },
  { path: 'pakiship/settings', component: 'PakiShipSettings', file: 'pakiship/SettingsPage', protected: true, app: 'pakiship' },
  { path: 'pakiship/profile', component: 'PakiShipProfile', file: 'pakiship/ProfilePage', protected: true, app: 'pakiship' },
  { path: 'pakiship/user-acceptance', component: 'PakiShipUserAcceptance', file: 'pakiship/UserAcceptancePage', protected: true, app: 'pakiship' },

  { path: 'pakipark/dashboard', component: 'PakiParkDashboard', file: 'pakipark/DashboardPage', protected: true, app: 'pakiship' },
  { path: 'pakipark/reservations', component: 'PakiParkReservations', file: 'pakipark/ReservationsPage', protected: true, app: 'pakiship' },
  { path: 'pakipark/bookings', component: 'PakiParkBookings', file: 'pakipark/BookingsPage', protected: true, app: 'pakiship' },
  { path: 'pakipark/reports', component: 'PakiParkReports', file: 'pakipark/ReportsPage', protected: true, app: 'pakiship' },
  { path: 'pakipark/settings', component: 'PakiParkSettings', file: 'pakipark/SettingsPage', protected: true, app: 'pakiship' },
  { path: 'pakipark/profile', component: 'PakiParkProfile', file: 'pakipark/ProfilePage', protected: true, app: 'pakiship' },

  { path: 'about', component: 'LandingPage', file: 'LandingPage', protected: false }
];

const basePath = path.resolve(__dirname, '..', 'src/frontend/app');

routes.forEach(route => {
  const isRoot = route.path === '';
  const dirPath = isRoot ? basePath : path.join(basePath, route.path);
  fs.mkdirSync(dirPath, { recursive: true });

  const filePath = path.join(dirPath, 'page.tsx');
  let content = '';

  if (route.protected) {
    content += `import { ProtectedRoute } from '@/modules/components/ProtectedRoute';\n`;
  }
  
  if (route.file) {
    content += `import ${route.component} from '@/modules/pages/${route.file}';\n\n`;
  } else if (!route.isRaw) {
    content += `// Component not found for ${route.component}\n\n`;
  } else {
    content += `\n`;
  }

  content += `export default function Page() {\n`;
  
  const innerContent = route.file 
    ? `<${route.component} />` 
    : (route.isRaw ? `<div>${route.component}</div>` : `<div>Placeholder for ${route.component}</div>`);

  if (route.protected) {
    content += `  return (\n    <ProtectedRoute app="${route.app}">\n      ${innerContent}\n    </ProtectedRoute>\n  );\n`;
  } else {
    content += `  return ${innerContent};\n`;
  }

  content += `}\n`;

  fs.writeFileSync(filePath, content);
});

console.log("Routes generated successfully!");
