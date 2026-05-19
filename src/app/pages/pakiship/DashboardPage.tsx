import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardStats, fetchDashboardFeed, fetchShipments, type DashboardStats, type ShipmentRow, type DashboardFeed } from '../../lib/supabaseSchema';
import { useNavigate } from '../../lib/router';
import {
  Package,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CalendarDays,
  CreditCard,
  DollarSign,
  Clock,
  Download,
  Eye,
  FileClock,
  Flag,
  Filter,
  Target,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Truck,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';
import { getDisplayNameForEmail } from '../../lib/sampleAccounts';

type DashboardRange = 'Today' | '7 Days' | '30 Days' | 'Custom Range';
type QuickActionTab = 'requests' | 'reports';

interface QuickActionItem {
  action: string;
  badge: string;
  badgeTone: string;
  detail: string;
  followUpLabel: string;
  followUpPath: string;
  key?: string;
  primary: string;
  secondary: string;
}

const ZERO_STATS: DashboardStats = {
  totalShipments: 0,
  activeShipments: 0,
  deliveredShipments: 0,
  pendingShipments: 0,
  cancelledShipments: 0,
  totalDrivers: 0,
  availableDrivers: 0,
  onDeliveryDrivers: 0,
  totalOperators: 0,
  activeOperators: 0,
  totalParcelsHandled: 0,
};

export default function DashboardPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<DashboardRange>('Today');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionTab>('requests');
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2026-05-01');
  const [customEndDate, setCustomEndDate] = useState('2026-05-31');
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [liveStats, setLiveStats] = useState<DashboardStats>(ZERO_STATS);
  const [liveShipments, setLiveShipments] = useState<ShipmentRow[]>([]);
  const [dashboardFeed, setDashboardFeed] = useState<DashboardFeed>({ recentShipments: [], pendingDriverApps: 0, openLostParcels: 0 });

  useEffect(() => {
    let isMounted = true;
    setIsStatsLoading(true);
    Promise.allSettled([fetchDashboardStats(), fetchShipments(), fetchDashboardFeed()])
      .then(([statsRes, shipmentsRes, feedRes]) => {
        if (!isMounted) return;
        if (statsRes.status === 'fulfilled') setLiveStats(statsRes.value);
        if (shipmentsRes.status === 'fulfilled') setLiveShipments(shipmentsRes.value);
        if (feedRes.status === 'fulfilled') setDashboardFeed(feedRes.value);
        setIsStatsLoading(false);
      })
      .catch(() => { if (isMounted) setIsStatsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const placeholderName = getDisplayNameForEmail(user?.email, 'Juan Dela Cruz');
  const formatShortDate = (value: string) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));

  const customDayCount = useMemo(() => {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return 1;
    }

    return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
  }, [customEndDate, customStartDate]);

  const rangeLabel =
    selectedRange === 'Custom Range'
      ? `${formatShortDate(customStartDate)} - ${formatShortDate(customEndDate)}`
      : selectedRange;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build live KPI cards — first 6 cards wired to Supabase; the rest remain contextual
  const liveKpis = [
    { label: 'Active Shipments', value: isStatsLoading ? '...' : String(liveStats.activeShipments), change: '', trend: 'up', icon: <Truck className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'Shipments currently in transit' },
    { label: 'Delivered', value: isStatsLoading ? '...' : String(liveStats.deliveredShipments), change: '', trend: 'up', icon: <Package className="w-5 h-5" />, color: 'bg-teal-100 text-teal-600', description: 'Total delivered shipments' },
    { label: 'Pending', value: isStatsLoading ? '...' : String(liveStats.pendingShipments), change: '', trend: 'up', icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600', description: 'Shipments awaiting assignment' },
    { label: 'Cancelled', value: isStatsLoading ? '...' : String(liveStats.cancelledShipments), change: '', trend: 'down', icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100 text-red-600', description: 'Cancelled shipments' },
    { label: 'Available Drivers', value: isStatsLoading ? '...' : String(liveStats.availableDrivers), change: '', trend: 'up', icon: <Target className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', description: 'Drivers ready for dispatch' },
    { label: 'Active Operators', value: isStatsLoading ? '...' : String(liveStats.activeOperators), change: '', trend: 'up', icon: <DollarSign className="w-5 h-5" />, color: 'bg-[#39B5A8]/10 text-[#2D8F85]', description: 'Active drop-off operator hubs' },
  ];

  // shared empty-state types
  type AlertItem = { title: string; detail: string; time: string; severity: string; icon: React.ReactNode; tone: string; actionLabel: string; actionPath: string };
  type ActivityItem = { title: string; description: string; time: string; type: string; icon: React.ReactNode; tone: string };
  type TrxItem = { id: string; person: string; type: string; amount: string; date: string; status: string };

  const liveShipmentRows = dashboardFeed.recentShipments;
  const emptyAlerts: AlertItem[] = [];
  const emptyActivity: ActivityItem[] = [];
  const emptyTrx: TrxItem[] = [];

  const presetDashboardData = {
    Today: { kpis: liveKpis, shipments: liveShipmentRows, transactions: emptyTrx, alerts: emptyAlerts, recentActivity: emptyActivity },
    '7 Days': { kpis: liveKpis, shipments: liveShipmentRows, transactions: emptyTrx, alerts: emptyAlerts, recentActivity: emptyActivity },
    '30 Days': { kpis: liveKpis, shipments: liveShipmentRows, transactions: emptyTrx, alerts: emptyAlerts, recentActivity: emptyActivity },
  };

  const buildCustomDashboardData = (days: number) => {
    const revenue = Math.round(7146 * days);
    const activeShipments = Math.round(80 + days * 9);
    const onTime = (93.2 + Math.min(days, 30) * 0.07).toFixed(2);
    const cancelled = Math.max(5, Math.round(days * 3.2));
    const avgTime = Math.max(14, 21 - Math.round(days / 5));
    const deliveries = Math.max(120, Math.round(days * 158));

    return {
      kpis: [
        { label: 'Total Revenue', value: `\u20B1${revenue.toLocaleString('en-PH')}`, change: '+4.1%', trend: 'up', icon: <DollarSign className="w-5 h-5" />, color: 'bg-[#39B5A8]/10 text-[#2D8F85]', description: `Revenue across your ${days}-day custom window` },
        { label: 'Active Shipments', value: activeShipments.toLocaleString('en-US'), change: '+6.0%', trend: 'up', icon: <Truck className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'Shipments active in selected range' },
        { label: 'On-Time Delivery', value: `${onTime}%`, change: '+1.8%', trend: 'up', icon: <Target className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', description: 'Delivery SLA for custom period' },
        { label: 'Canceled Bookings', value: cancelled.toLocaleString('en-US'), change: '-3.6%', trend: 'down', icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100 text-red-600', description: 'Cancelled bookings in custom range' },
        { label: 'Avg Delivery Time', value: `${avgTime} mins`, change: '-5.2%', trend: 'down', icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600', description: 'Average turnaround for custom period' },
        { label: 'Total Deliveries', value: deliveries.toLocaleString('en-US'), change: '+11.4%', trend: 'up', icon: <Package className="w-5 h-5" />, color: 'bg-teal-100 text-teal-600', description: 'Completed deliveries in custom range' },
      ],
      shipments: liveShipmentRows,
      transactions: emptyTrx,
      alerts: emptyAlerts,
      recentActivity: emptyActivity,
    };
  };

  const activeDashboardData = selectedRange === 'Custom Range'
    ? buildCustomDashboardData(customDayCount)
    : presetDashboardData[selectedRange] ?? presetDashboardData['Today'];

  const handleExportData = () => {
    const csvRows = [
      ['Range', rangeLabel],
      ['KPI', 'Value', 'Change', 'Description'],
      ...activeDashboardData.kpis.map((kpi) => [kpi.label, kpi.value, kpi.change, kpi.description]),
    ];
    const csvContent = `data:text/csv;charset=utf-8,${csvRows.map((row) => row.join(',')).join('\n')}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `pakiship-dashboard-${selectedRange.toLowerCase().replace(/ /g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingDriverApplications: { name: string; vehicle: string; submitted: string; priority: string }[] = [];

  const lostParcelReports: { id: string; route: string; status: string; submitted: string }[] = [];

  const pendingDriverCount = dashboardFeed.pendingDriverApps;
  const openLostCount = dashboardFeed.openLostParcels;

  const [selectedQuickActionKey, setSelectedQuickActionKey] = useState('Maria Santos');

  const quickActionItems =
    activeQuickAction === 'requests'
      ? pendingDriverApplications.map((application) => ({
          key: application.name,
          primary: application.name,
          secondary: `${application.vehicle} driver application - Submitted ${application.submitted}`,
          badge: application.priority,
          badgeTone:
            application.priority === 'High'
              ? 'border-[#FFD6D6] bg-[#FFF0F0] text-[#D64242]'
              : 'border-[#D7EBFF] bg-[#EFF7FF] text-[#2D74DA]',
          action: 'Review Driver',
          detail: `${application.name} is awaiting driver eligibility review. Check the uploaded license, government ID, and vehicle registration before approving and activating the account.`,
          followUpLabel: 'Open User Acceptance',
          followUpPath: '/pakiship/user-acceptance',
        }))
      : lostParcelReports.map((report) => ({
          key: report.id,
          primary: report.id,
          secondary: `${report.route} • Reported ${report.submitted}`,
          badge: report.status,
          badgeTone:
            report.status === 'Escalated'
              ? 'border-[#FFD6D6] bg-[#FFF0F0] text-[#D64242]'
              : 'border-[#FFE7B8] bg-[#FFF7E7] text-[#C47A00]',
          action: 'View Report',
          detail: `${report.id} is tied to the ${report.route} route. Review the latest rider note, contact the receiving hub, and decide whether to escalate or close the report.`,
          followUpLabel: 'Open Lost Parcel Cases',
          followUpPath: '/pakiship/shipments/lost-parcels',
        }));

  const selectedQuickActionItem =
    quickActionItems.find((item) => item.key === selectedQuickActionKey) ?? quickActionItems[0];

  return (
    <div className="flex h-screen bg-[#F0F9F8] font-sans text-[#1A5D56]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #F0F9F8; }
        ::-webkit-scrollbar-thumb { background: #39B5A833; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #39B5A866; }
      `,
        }}
      />

      <PakiShipSidebar activeTab="dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#F0F9F8] px-4 py-2 rounded-xl border border-[#39B5A8]/10 w-153">
              <Search className="w-4 h-4 text-[#39B5A8]/60" />
              <input
                type="text"
                placeholder="Search areas, drivers, or shops..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#39B5A8]/40 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-8 w-[1px] bg-[#39B5A8]/10"></div>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:bg-[#F0F9F8] px-3 py-2 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#39B5A8] to-[#1A5D56] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-[#39B5A8]/20">
                  {placeholderName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block min-w-max">
                  <p className="text-sm font-bold text-[#041614] leading-tight whitespace-nowrap">{placeholderName}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#1A5D56] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#39B5A8]/10 overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/pakiship/profile');
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-[#39B5A8]" />
                    <span className="font-semibold text-[#041614]">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/pakiship/settings');
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-[#39B5A8]" />
                    <span className="font-semibold text-[#041614]">Settings</span>
                  </button>
                  <div className="border-t border-[#39B5A8]/10"></div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-500">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-10">
          <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#041614] tracking-tight">Operational Overview</h1>
              <p className="text-[#1A5D56] opacity-70 font-medium italic">
                Monitoring PakiShip logistics, {placeholderName}. Viewing {rangeLabel}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRangePickerOpen((open) => !open)}
                  className="inline-flex min-w-[220px] items-center justify-between gap-3 rounded-2xl border border-[#39B5A8]/20 bg-white px-5 py-3 font-bold text-[#041614] shadow-sm transition-colors hover:bg-[#F8FCFC]"
                >
                  <span className="flex items-center gap-3">
                    <span className="rounded-xl bg-[#F0F9F8] p-2 text-[#39B5A8]">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    {rangeLabel}
                  </span>
                  <Filter className="h-4 w-4 text-[#1A5D56]/50" />
                </button>

                {isRangePickerOpen && (
                  <div className="absolute right-0 z-30 mt-3 w-[280px] overflow-hidden rounded-[1.75rem] border border-[#39B5A8]/10 bg-white shadow-xl">
                    <div className="p-3">
                      {(['Today', '7 Days', '30 Days', 'Custom Range'] as DashboardRange[]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSelectedRange(option);
                            if (option !== 'Custom Range') {
                              setIsRangePickerOpen(false);
                            }
                          }}
                          className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                            selectedRange === option
                              ? 'bg-[#41B5AB] text-white'
                              : 'text-[#1A5D56] hover:bg-[#F0F9F8]'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {selectedRange === 'Custom Range' && (
                      <div className="border-t border-[#39B5A8]/10 bg-[#F8FCFC] p-4">
                        <div className="grid grid-cols-1 gap-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-[#39B5A8]">
                            Start Date
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={(event) => setCustomStartDate(event.target.value)}
                              className="mt-2 w-full rounded-xl border border-[#39B5A8]/15 bg-white px-3 py-2 text-sm font-semibold text-[#041614] outline-none"
                            />
                          </label>
                          <label className="text-xs font-bold uppercase tracking-widest text-[#39B5A8]">
                            End Date
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(event) => setCustomEndDate(event.target.value)}
                              className="mt-2 w-full rounded-xl border border-[#39B5A8]/15 bg-white px-3 py-2 text-sm font-semibold text-[#041614] outline-none"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsRangePickerOpen(false)}
                            className="mt-0.5 inline-flex h-10 items-center justify-center rounded-xl bg-[#39B5A8] px-3 text-xs font-bold text-white transition-colors hover:bg-[#2F9D91]"
                          >
                            Apply Custom Range
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#41B5AB] px-5 py-3 font-bold text-white shadow-lg shadow-[#39B5A8]/20 transition-colors hover:bg-[#2F9D91]"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </section>

          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeDashboardData.kpis.map((kpi, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[2rem] border border-[#39B5A8]/10 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`rounded-2xl p-3 transition-transform group-hover:scale-110 ${kpi.color}`}>{kpi.icon}</div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                        kpi.trend === 'up'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                          : 'border-blue-100 bg-blue-50 text-blue-600'
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#39B5A8]">{kpi.label}</p>
                    <p className="text-3xl font-black text-[#041614]">{kpi.value}</p>
                    <p className="text-xs font-medium leading-relaxed text-gray-400">{kpi.description}</p>
                  </div>
                  <div className="absolute -bottom-4 -right-4 scale-150 opacity-[0.02] transition-transform duration-300 group-hover:scale-[1.7]">
                    {kpi.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:items-start xl:grid-cols-[0.95fr_1.35fr]">
            <div className="space-y-8">
              <Card className="self-start overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
                <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl font-bold text-[#041614]">Quick Actions</CardTitle>
                        <p className="text-xs font-medium text-gray-400">
                          Handle urgent requests and incident queues directly from the dashboard.
                        </p>
                      </div>
                      <div className="inline-flex items-center rounded-full border border-[#39B5A8]/10 bg-[#F0F9F8] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#39B5A8]">
                        Priority Shortcuts
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuickAction('requests');
                          setSelectedQuickActionKey('Maria Santos');
                        }}
                        className={`rounded-[1.75rem] border p-4 text-left transition-all ${
                          activeQuickAction === 'requests'
                            ? 'border-[#39B5A8]/20 bg-[#F0F9F8]'
                            : 'border-[#39B5A8]/10 bg-white hover:bg-[#F8FCFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-[#E8F6F4] p-3 text-[#39B5A8]">
                              <FileClock className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#041614]">Review Driver Applications</p>
                              <p className="text-xs text-gray-400">
                                {pendingDriverCount === 0
                                  ? 'No pending applications'
                                  : `${pendingDriverCount} driver${pendingDriverCount === 1 ? '' : 's'} waiting for document review`}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#39B5A8] shadow-sm">
                            {pendingDriverCount > 0 ? pendingDriverCount : '—'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuickAction('reports');
                          setSelectedQuickActionKey('LPR-1021');
                        }}
                        className={`rounded-[1.75rem] border p-4 text-left transition-all ${
                          activeQuickAction === 'reports'
                            ? 'border-[#39B5A8]/20 bg-[#F0F9F8]'
                            : 'border-[#39B5A8]/10 bg-white hover:bg-[#F8FCFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-[#FFF1F1] p-3 text-[#E05555]">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#041614]">View Lost Parcel Reports</p>
                              <p className="text-xs text-gray-400">
                                {openLostCount === 0
                                  ? 'No open cases'
                                  : `${openLostCount} case${openLostCount === 1 ? '' : 's'} needing follow-up`}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#E05555] shadow-sm">
                            {openLostCount > 0 ? openLostCount : '—'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#39B5A8]">
                      {activeQuickAction === 'requests' ? 'Driver Application Queue' : 'Lost Parcel Queue'}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Dashboard Response
                    </span>
                  </div>
                  <div className="space-y-3">
                    {quickActionItems.map((item, index) => (
                      <div key={`${item.primary}-${index}`} className="rounded-[1.5rem] border border-[#39B5A8]/10 bg-[#FCFEFE] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-[#041614]">{item.primary}</p>
                              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${item.badgeTone}`}>
                                {item.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.secondary}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedQuickActionKey(item.key)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39B5A8] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#2F9D91]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {item.action}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedQuickActionItem && (
                    <div className="mt-5 rounded-[1.75rem] border border-[#39B5A8]/10 bg-[#F6FBFB] p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#39B5A8]">Selected Item</p>
                            <p className="mt-1 text-lg font-bold text-[#041614]">{selectedQuickActionItem.primary}</p>
                            <p className="mt-1 text-sm text-gray-500">{selectedQuickActionItem.secondary}</p>
                          </div>
                          <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${selectedQuickActionItem.badgeTone}`}>
                            {selectedQuickActionItem.badge}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#1A5D56]/75">{selectedQuickActionItem.detail}</p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => navigate(selectedQuickActionItem.followUpPath)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39B5A8] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2F9D91]"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                            {selectedQuickActionItem.followUpLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedQuickActionKey(quickActionItems[0]?.key ?? selectedQuickActionKey)}
                            className="inline-flex items-center justify-center rounded-xl border border-[#39B5A8]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#1A5D56] transition-colors hover:bg-[#F0F9F8]"
                          >
                            Reset Selection
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
                <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                  <CardTitle className="text-xl font-bold text-[#041614]">Recent Dispatch Logs</CardTitle>
                  <p className="text-xs font-medium text-gray-400">Dispatch records and movement updates for {rangeLabel}.</p>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="mt-[-2rem] w-full table-auto text-left">
                    <thead className="border-b border-[#39B5A8]/5 bg-[#F0F9F8]/50">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#39B5A8]">Location</th>
                        <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#39B5A8]">Revenue</th>
                        <th className="px-8 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#39B5A8]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#39B5A8]/5">
                      {activeDashboardData.shipments.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-8 py-10 text-center">
                            <p className="text-sm font-bold text-gray-400">No dispatch records found</p>
                            <p className="text-xs text-gray-400 mt-1">Recent shipment movement will appear here.</p>
                          </td>
                        </tr>
                      ) : (
                        activeDashboardData.shipments.map((shipment, index) => (
                          <tr key={index} className="group transition-colors hover:bg-[#F0F9F8]/30">
                            <td className="px-8 py-5">
                              <p className="font-bold text-[#041614] transition-colors group-hover:text-[#39B5A8]">{shipment.store}</p>
                              <p className="text-xs font-medium text-gray-400">{shipment.location}</p>
                            </td>
                            <td className="px-6 py-5 text-center font-bold text-[#1A5D56]">{`\u20B1${shipment.amount}`}</td>
                            <td className="px-8 py-5 text-right">
                              <span
                                className={`inline-block whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${
                                  shipment.status === 'In Transit'
                                    ? 'border-blue-100 bg-blue-50 text-blue-600'
                                    : shipment.status === 'Delivered'
                                      ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                                      : 'border-amber-100 bg-amber-50 text-amber-600'
                                }`}
                              >
                                {shipment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
                <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-[#041614]">Real-Time Alerts</CardTitle>
                      <p className="text-xs font-medium text-gray-400">
                        Critical operational issues that need immediate admin attention.
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-[#FFD6D6] bg-[#FFF3F3] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D64242]">
                      Live Priority Feed
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {activeDashboardData.alerts.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <p className="text-sm font-bold text-gray-400">All clear</p>
                        <p className="mt-1 text-xs text-gray-400">No critical alerts requiring immediate attention at this time.</p>
                      </div>
                    ) : (
                      activeDashboardData.alerts.map((alert, index) => (
                        <div key={`${alert.title}-${index}`} className="rounded-[1.75rem] border border-[#39B5A8]/10 bg-[#FCFEFE] p-5">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${alert.tone}`}>
                                  {alert.icon}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-bold text-[#041614]">{alert.title}</p>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${alert.tone}`}>
                                      {alert.severity}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{alert.detail}</p>
                                </div>
                              </div>
                              <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-[#39B5A8]/80">
                                {alert.time}
                              </span>
                            </div>
  
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => navigate(alert.actionPath)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39B5A8] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#2F9D91]"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                {alert.actionLabel}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
                <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-[#041614]">Recent Activity</CardTitle>
                      <p className="text-xs font-medium text-gray-400">
                        Live operational events across bookings, delays, incidents, and admin actions.
                      </p>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-[#39B5A8]/10 bg-[#F0F9F8] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#39B5A8]">
                      Chronological Feed
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="-mt-2 space-y-5">
                    {activeDashboardData.recentActivity.length === 0 ? (
                      <div className="mt-6 rounded-[1.75rem] border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <p className="text-sm font-bold text-gray-400">No recent activity</p>
                        <p className="mt-1 text-xs text-gray-400">Operational events will appear here as they happen.</p>
                      </div>
                    ) : (
                      activeDashboardData.recentActivity.map((activity, index) => (
                        <div key={`${activity.title}-${index}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${activity.tone}`}>
                              {activity.icon}
                            </div>
                            {index !== activeDashboardData.recentActivity.length - 1 && <div className="mt-2 h-full w-px bg-[#39B5A8]/10" />}
                          </div>
                          <div className="flex-1 rounded-[1.75rem] border border-[#39B5A8]/8 bg-[#FCFEFE] p-5 transition-colors hover:bg-[#F7FCFB]">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-[#041614]">{activity.title}</p>
                                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${activity.tone}`}>
                                    {activity.type}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">{activity.description}</p>
                              </div>
                              <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-[#39B5A8]/80">
                                {activity.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
                <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                  <CardTitle className="text-xl font-bold text-[#041614]">Recent Transactions</CardTitle>
                  <p className="text-xs font-medium text-gray-400">Booking transaction records for {rangeLabel}.</p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="-mt-8 space-y-6">
                    {activeDashboardData.transactions.length === 0 ? (
                      <div className="mt-12 text-center">
                        <p className="text-sm font-bold text-gray-400">No recent transactions</p>
                      </div>
                    ) : (
                      activeDashboardData.transactions.map((trx, index) => (
                        <div key={index} className="group flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`rounded-2xl p-3 ${trx.status === 'In' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                              {trx.status === 'In' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-[#041614] transition-colors group-hover:text-[#39B5A8]">{trx.person}</p>
                              <p className="text-xs font-medium text-gray-400">{`${trx.type} \u2022 ${trx.date}`}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${trx.status === 'In' ? 'text-emerald-600' : 'text-[#041614]'}`}>{trx.amount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">{trx.id}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

