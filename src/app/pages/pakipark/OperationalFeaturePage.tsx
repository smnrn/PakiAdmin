import { useMemo, useState } from 'react';
import { useNavigate } from '../../lib/router';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  LogOut,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import PakiParkSidebar from '../../components/pakipark/PakiParkSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { getDisplayNameForEmail } from '../../lib/sampleAccounts';

type PakiParkFeature = 'parking-areas' | 'live-monitor' | 'analytics' | 'user-acceptance';

interface OperationalFeaturePageProps {
  feature: PakiParkFeature;
}

const featureCopy = {
  'parking-areas': {
    title: 'Parking Areas',
    subtitle: 'Manage PakiPark hubs, slot capacity, operator coverage, and facility health.',
    search: 'Search parking areas, hubs, or operators...',
    icon: MapPin,
  },
  'live-monitor': {
    title: 'Live Monitor',
    subtitle: 'Track active reservations, entry flow, exit queues, and facility incidents in real time.',
    search: 'Search live sessions, plates, or hubs...',
    icon: Activity,
  },
  analytics: {
    title: 'Parking Analytics',
    subtitle: 'Review occupancy, revenue, conversion, vehicle mix, and operational performance.',
    search: 'Search parking analytics...',
    icon: BarChart3,
  },
  'user-acceptance': {
    title: 'User Acceptance',
    subtitle: 'Review parking operator applications, customer account requests, and verification documents.',
    search: 'Search applicants, operators, or documents...',
    icon: ShieldCheck,
  },
};

export default function OperationalFeaturePage({ feature }: OperationalFeaturePageProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const displayName = getDisplayNameForEmail(user?.email, 'Juan Dela Cruz');
  const config = featureCopy[feature];
  const HeaderIcon = config.icon;

  const metrics = useMemo(() => {
    if (feature === 'parking-areas') {
      return [
        { label: 'Active Hubs', value: '42', detail: '36 healthy, 6 need review', icon: <MapPin className="h-5 w-5" />, tone: 'bg-blue-50 text-blue-600' },
        { label: 'Total Slots', value: '8,420', detail: 'Across Metro Manila', icon: <Car className="h-5 w-5" />, tone: 'bg-orange-50 text-[#ee6b20]' },
        { label: 'EV Bays', value: '318', detail: 'Charging-ready spaces', icon: <Zap className="h-5 w-5" />, tone: 'bg-emerald-50 text-emerald-600' },
      ];
    }

    if (feature === 'live-monitor') {
      return [
        { label: 'Active Sessions', value: '1,284', detail: 'Currently parked', icon: <Activity className="h-5 w-5" />, tone: 'bg-blue-50 text-blue-600' },
        { label: 'Entry Queue', value: '37', detail: 'Across monitored gates', icon: <Clock className="h-5 w-5" />, tone: 'bg-amber-50 text-amber-600' },
        { label: 'Open Incidents', value: '9', detail: 'Needs operator action', icon: <AlertTriangle className="h-5 w-5" />, tone: 'bg-red-50 text-red-500' },
      ];
    }

    if (feature === 'analytics') {
      return [
        { label: 'Occupancy Rate', value: '86.4%', detail: '+6.2% vs last week', icon: <BarChart3 className="h-5 w-5" />, tone: 'bg-blue-50 text-blue-600' },
        { label: 'Revenue', value: 'PHP 1.8M', detail: 'Last 30 days', icon: <CalendarCheck className="h-5 w-5" />, tone: 'bg-emerald-50 text-emerald-600' },
        { label: 'Cancellation Rate', value: '4.8%', detail: '-1.1% improvement', icon: <XCircle className="h-5 w-5" />, tone: 'bg-red-50 text-red-500' },
      ];
    }

    return [
      { label: 'Pending Reviews', value: '18', detail: 'Operator and customer requests', icon: <Users className="h-5 w-5" />, tone: 'bg-blue-50 text-blue-600' },
      { label: 'Approved Today', value: '12', detail: 'Accounts activated', icon: <CheckCircle2 className="h-5 w-5" />, tone: 'bg-emerald-50 text-emerald-600' },
      { label: 'Needs Documents', value: '6', detail: 'Missing verification files', icon: <AlertTriangle className="h-5 w-5" />, tone: 'bg-amber-50 text-amber-600' },
    ];
  }, [feature]);

  const rows = {
    'parking-areas': [
      ['Greenbelt 3 Basement', '842 slots', '92% occupied', 'Healthy'],
      ['NAIA Terminal 3', '1,240 slots', '88% occupied', 'Gate queue'],
      ['BGC High Street', '618 slots', '81% occupied', 'Healthy'],
      ['SM Mall of Asia North', '1,540 slots', '76% occupied', 'Maintenance'],
    ],
    'live-monitor': [
      ['PKP-78291', 'NCR 1234', 'Greenbelt 3', 'Entry confirmed'],
      ['PKP-90122', 'WPD 888', 'SM Mall of Asia', 'Awaiting payment'],
      ['PKP-11234', 'ZXC 9901', 'BGC High Street', 'Parked'],
      ['PKP-44561', 'ACT 777', 'NAIA Terminal 3', 'Exit queue'],
    ],
    analytics: [
      ['Peak Window', '5 PM - 8 PM', '94% utilization', '+12%'],
      ['Best Hub', 'NAIA Terminal 3', 'PHP 420K', '+18%'],
      ['Top Vehicle Type', 'Sedan', '45% share', '+4%'],
      ['EV Charging Usage', '318 sessions', 'PHP 64K', '+21%'],
    ],
    'user-acceptance': [
      ['OPR-24018', 'Ortigas Parking Partner', 'Operator', 'Pending review'],
      ['CUS-90114', 'Andrea Santos', 'Customer', 'Needs ID check'],
      ['OPR-24021', 'Makati Secure Parking', 'Operator', 'Ready to approve'],
      ['CUS-90122', 'Miguel Reyes', 'Customer', 'Pending review'],
    ],
  }[feature];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans text-[#1e3d5a] overflow-hidden">
      <PakiParkSidebar activeTab={feature} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#1e3d5a]/10 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 bg-[#f4f7fa] px-4 py-2 rounded-xl border border-[#1e3d5a]/10 w-180">
            <Search className="w-4 h-4 text-[#1e3d5a]/60" />
            <input
              type="text"
              placeholder={config.search}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#1e3d5a]/40 font-medium"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 hover:bg-[#f4f7fa] px-3 py-2 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e3d5a] to-[#2a5373] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-[#1e3d5a] leading-tight whitespace-nowrap">{displayName}</p>
              <ChevronDown className={`w-4 h-4 text-[#1e3d5a] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#1e3d5a]/10 overflow-hidden z-50">
                <button onClick={() => navigate('/pakipark/profile')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left font-semibold">
                  <User className="w-4 h-4 text-[#ee6b20]" /> Profile
                </button>
                <button onClick={() => navigate('/pakipark/settings')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left font-semibold">
                  <Settings className="w-4 h-4 text-[#ee6b20]" /> Settings
                </button>
                <div className="border-t border-[#1e3d5a]/10" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-left font-semibold text-red-500">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <section className="flex items-end justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#ee6b20] shadow-sm">
                <HeaderIcon className="h-4 w-4" />
                PakiPark Operations
              </div>
              <h1 className="text-4xl font-black tracking-tight">{config.title}</h1>
              <p className="mt-2 text-sm font-medium italic text-[#1e3d5a]/60">{config.subtitle}</p>
            </div>
            <Button className="h-12 rounded-xl bg-[#ee6b20] px-5 font-black text-white hover:bg-[#ff7a2e]">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.label} className="rounded-[28px] border-[#1e3d5a]/10 bg-white shadow-sm">
                <CardContent className="p-7">
                  <div className={`mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${metric.tone}`}>
                    {metric.icon}
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1e3d5a]/70">{metric.label}</p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight">{metric.value}</h2>
                  <p className="mt-2 text-sm font-bold text-[#8492a6]">{metric.detail}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="rounded-[32px] border-[#1e3d5a]/10 bg-white shadow-sm">
            <CardHeader className="border-b border-[#1e3d5a]/10 px-8 py-6">
              <CardTitle className="text-xl font-black">{config.title} Queue</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-4">
                {rows.map((row) => (
                  <div key={row[0]} className="grid grid-cols-4 items-center gap-4 rounded-2xl border border-[#1e3d5a]/10 bg-[#f8fafc] px-5 py-4">
                    {row.map((cell, index) => (
                      <span key={cell} className={index === 0 ? 'text-sm font-black' : 'text-sm font-bold text-[#1e3d5a]/65'}>
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
