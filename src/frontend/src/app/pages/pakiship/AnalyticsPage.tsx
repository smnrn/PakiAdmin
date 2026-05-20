import { useState, useMemo, useEffect } from 'react';
import { fetchAnalyticsStats, type AnalyticsStats } from '../../lib/supabaseSchema';
import { useNavigate } from '../../lib/router';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Map,
  Activity,
  ArrowUpRight,
  Wallet,
  Truck,
  Bike,
  PackageCheck,
  PackagePlus,
  PackageX,
  AlertTriangle,
  Filter,
  Navigation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';
import { getDisplayNameForEmail } from '../../lib/sampleAccounts';

type AnalyticsRange = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Year to Date';
type RevenueBreakdown = 'Week' | 'Month';

interface AnalyticsPoint {
  month: string;
  revenue: number;
}

interface AnalyticsSummary {
  cancelled: string;
  chartData: AnalyticsPoint[];
  delivered: string;
  lostReports: string;
  pending: string;
  revenue: string;
}

export default function AnalyticsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState<AnalyticsRange>('Year to Date');
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown>('Week');
  const [customStartDate, setCustomStartDate] = useState('2026-05-01');
  const [customEndDate, setCustomEndDate] = useState('2026-05-15');
  const [liveStats, setLiveStats] = useState<AnalyticsStats>({
    revenue: 0, delivered: 0, pending: 0, cancelled: 0, lostReports: 0,
    shipmentVolume: [], topDrivers: [], totalDrivers: 0, onDeliveryDrivers: 0, activeNowDrivers: 0,
    changes: {
      revenue: null, delivered: null, pending: null, cancelled: null, lostReports: null,
      revenueUp: true, deliveredUp: true, pendingUp: true, cancelledUp: true, lostReportsUp: true,
    },
  });

  useEffect(() => {
    let isMounted = true;
    fetchAnalyticsStats(dateRange)
      .then((stats) => { if (isMounted) setLiveStats(stats); })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [dateRange]);

  const placeholderName = getDisplayNameForEmail(user?.email, "Juan Dela Cruz");

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // All stats come from Supabase — 0 when disconnected
  const activeData = {
    revenue: `₱${liveStats.revenue.toLocaleString('en-PH')}`,
    delivered: liveStats.delivered.toLocaleString(),
    pending: liveStats.pending.toLocaleString(),
    cancelled: liveStats.cancelled.toLocaleString(),
    lostReports: liveStats.lostReports.toLocaleString(),
    chartData: liveStats.shipmentVolume.length > 0
      ? liveStats.shipmentVolume
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => ({ month: m, revenue: 0 })),
  };
  const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Year to Date'] as AnalyticsRange[];
  const maxRevenue = useMemo(
    () => Math.max(1, ...activeData.chartData.map((d) => d.revenue)),
    [activeData],
  );

  const driverWorkforce = [
    { type: 'Total Drivers', count: liveStats.totalDrivers, growth: '', icon: <Truck className="w-5 h-5" />, sub: 'All Registered' },
    { type: 'On Delivery', count: liveStats.onDeliveryDrivers, growth: '', icon: <Bike className="w-5 h-5" />, sub: 'Currently Active' },
    { type: 'Active Now', count: liveStats.activeNowDrivers, growth: '', icon: <Activity className="w-5 h-5" />, sub: 'Available + On Delivery' },
  ];

  const topRoutes: { route: string; to: string; trips: number; revenue: string; percentage: number }[] = [];

  const defaultMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];

  const shipmentVolume = liveStats.shipmentVolume.length > 0
    ? liveStats.shipmentVolume.map((d) => ({
        label: d.month.toUpperCase(),
        value: d.volume,
      }))
    : defaultMonths.map((m) => ({ label: m, value: 0 }));

  const revenueTrend = liveStats.shipmentVolume.length > 0
    ? liveStats.shipmentVolume.map((d) => ({
        label: d.month.toUpperCase(),
        value: d.revenue,
      }))
    : defaultMonths.map((m) => ({ label: m, value: 0 }));

  const lostParcelRate: { label: string; value: number }[] = [];

  const deliveryTimeByRoute: { route: string; minutes: number }[] = [];

  const driverLeaderboard = liveStats.topDrivers;

  const handleExport = (format: 'csv' | 'pdf' = 'csv') => {
    const headers = ["Period", "Revenue (PHP)"];
    const rows = activeData.chartData.map((dataPoint) => [dataPoint.month, dataPoint.revenue]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((entry) => entry.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PakiShip_${customStartDate}_to_${customEndDate}_Report.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-[#F0F9F8] font-sans text-[#1A5D56]">
      <PakiShipSidebar activeTab="analytics" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#F0F9F8] px-4 py-2 rounded-xl border border-[#39B5A8]/10 w-180">
              <Search className="w-4 h-4 text-[#39B5A8]/60" />
              <input
                type="text"
                placeholder="Search analytics..."
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
                  <button onClick={() => navigate('/pakiship/profile')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-[#041614]">
                    <User className="w-4 h-4 text-[#39B5A8]" /> Profile
                  </button>
                  <button onClick={() => navigate('/pakiship/settings')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-[#041614]">
                    <Settings className="w-4 h-4 text-[#39B5A8]" /> Settings
                  </button>
                  <div className="border-t border-[#39B5A8]/10"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-left font-semibold text-red-500">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#041614] tracking-tight">PakiShip Analytics</h1>
            <p className="text-[#1A5D56] opacity-70 font-medium italic">Real-time system performance across the PakiShip network.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Button 
                  variant="outline"
                  className="bg-white border-[#39B5A8]/20 text-[#1A5D56] rounded-xl font-bold hover:bg-[#F0F9F8] min-w-[160px] justify-between"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#39B5A8]" />
                    {dateRange}
                  </div>
                  <Filter className="w-3 h-3 ml-2 opacity-50" />
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#39B5A8]/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 overflow-hidden">
                  {dateRanges.map((range) => (
                    <button 
                      key={range} 
                      onClick={() => setDateRange(range)}
                      className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${dateRange === range ? 'bg-[#39B5A8] text-white' : 'hover:bg-[#F0F9F8] text-[#1A5D56]'}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => handleExport('csv')}
                className="bg-[#39B5A8] hover:bg-[#2F9D91] text-white rounded-xl shadow-lg shadow-[#39B5A8]/20"
              >
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total Revenue"
              value={activeData.revenue}
              trend={liveStats.changes.revenue}
              trendUp={liveStats.changes.revenueUp}
              icon={<Wallet className="w-4 h-4" />}
            />
            <StatCard
              label="Parcels Delivered"
              value={activeData.delivered}
              trend={liveStats.changes.delivered}
              trendUp={liveStats.changes.deliveredUp}
              icon={<PackageCheck className="w-4 h-4" />}
            />
            <StatCard
              label="Parcels Pending"
              value={activeData.pending}
              trend={liveStats.changes.pending}
              trendUp={liveStats.changes.pendingUp}
              icon={<PackagePlus className="w-4 h-4" />}
            />
            <StatCard
              label="Parcels Cancelled"
              value={activeData.cancelled}
              trend={liveStats.changes.cancelled}
              trendUp={liveStats.changes.cancelledUp}
              icon={<PackageX className="w-4 h-4" />}
            />
            <StatCard
              label="Open Lost Parcel Reports"
              value={activeData.lostReports}
              trend={liveStats.changes.lostReports}
              trendUp={liveStats.changes.lostReportsUp}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-8">
            <Card className="bg-white rounded-[3rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="p-10 pb-2">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-[#041614]">Custom Performance Report</CardTitle>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Apply a custom date range and export the report as CSV or PDF.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} className="h-11 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8] px-4 text-sm font-bold text-[#1A5D56] outline-none" />
                    <input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} className="h-11 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8] px-4 text-sm font-bold text-[#1A5D56] outline-none" />
                    <Button onClick={() => handleExport('csv')} className="rounded-xl bg-[#39B5A8] text-white hover:bg-[#2F9D91]">
                      <Download className="w-4 h-4 mr-2" /> CSV
                    </Button>
                    <Button onClick={() => handleExport('pdf')} variant="outline" className="rounded-xl border-[#39B5A8]/20 bg-white text-[#1A5D56]">
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <MiniBarChart title="Shipment Volume" subtitle="Daily and weekly shipment demand patterns" data={shipmentVolume} />

              <Card className="bg-white rounded-[3rem] border-none shadow-sm overflow-hidden">
                <CardHeader className="p-10 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-[#041614]">Revenue Trend</CardTitle>
                      <p className="text-sm text-gray-400 mt-1 font-medium">Broken down by week or month</p>
                    </div>
                    <div className="flex rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8] p-1">
                      {(['Week', 'Month'] as const).map((breakdown) => (
                        <button
                          key={breakdown}
                          onClick={() => setRevenueBreakdown(breakdown)}
                          className={`rounded-lg px-4 py-2 text-xs font-black ${revenueBreakdown === breakdown ? 'bg-[#39B5A8] text-white' : 'text-[#1A5D56]'}`}
                        >
                          {breakdown}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <SimpleBars data={revenueTrend} valuePrefix="₱" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <Card className="bg-white rounded-[2.5rem] border-[#39B5A8]/10 shadow-sm">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black text-[#041614]">Driver Leaderboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-8 pb-8">
                  {driverLeaderboard.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-4 font-medium">No driver data</p>
                  ) : driverLeaderboard.map((driver, index) => (
                    <div key={driver.name} className="flex items-center justify-between rounded-2xl bg-[#F0F9F8] p-4">
                      <div>
                        <p className="text-sm font-black text-[#041614]">{index + 1}. {driver.name}</p>
                        <p className="text-xs font-bold text-[#39B5A8]">{driver.completion} completion</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1A5D56]">{driver.rating}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <MiniBarChart title="Lost Parcel Rate" subtitle="Loss incidents over time" data={lostParcelRate} suffix="%" />

              <Card className="bg-white rounded-[2.5rem] border-[#39B5A8]/10 shadow-sm">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black text-[#041614]">Average Delivery Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-8 pb-8">
                  {deliveryTimeByRoute.map((route) => (
                    <div key={route.route}>
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-[#041614]">{route.route}</span>
                        <span className="text-[#39B5A8]">{route.minutes} mins</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0F9F8]">
                        <div className="h-full rounded-full bg-[#39B5A8]" style={{ width: `${Math.min(100, route.minutes * 2)}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white rounded-[3rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="p-10 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black font-bold text-[#041614]">Annual Performance ({dateRange})</CardTitle>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Network-wide revenue trajectory</p>
                  </div>
                  <div className="bg-[#F0F9F8] px-4 py-2 rounded-2xl border border-[#39B5A8]/10">
                    <span className="text-xs font-black text-[#39B5A8] uppercase tracking-widest">Gross: {activeData.revenue}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="flex items-end justify-between gap-4 h-80 px-4 pt-12">
                  {activeData.chartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-4 h-full group relative">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:-top-10">
                        <p className="text-[10px] font-black text-[#1A5D56] bg-white px-2 py-1 rounded-lg shadow-sm border border-[#39B5A8]/10">
                          ₱{data.revenue >= 1000000 ? `${(data.revenue / 1000000).toFixed(1)}M` : `${(data.revenue / 1000).toFixed(0)}K`}
                        </p>
                      </div>
                      <div className="w-full flex flex-col justify-end h-full relative">
                        {data.revenue > 0 ? (
                          <div 
                            className="w-full rounded-t-2xl transition-all duration-700 ease-out hover:scale-x-105 cursor-pointer shadow-lg shadow-[#39B5A8]/5 bg-gradient-to-t from-[#39B5A8] via-[#39B5A8]/80 to-[#50E3C2]"
                            style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
                          </div>
                        ) : (
                          <div 
                            className="w-full rounded-t-lg bg-[#39B5A8]/5 border border-dashed border-[#39B5A8]/20 transition-all duration-500"
                            style={{ height: '4px' }}
                            title="No data"
                          />
                        )}
                      </div>
                      <p className="text-[11px] font-black text-[#1A5D56]/60 tracking-wider uppercase group-hover:text-[#39B5A8] transition-colors">{data.month}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BALANCED BOTTOM SECTION (1:1 Ratio) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PEAK ROUTES */}
            <Card className="bg-white rounded-[2.5rem] border-[#39B5A8]/10 shadow-sm overflow-hidden flex flex-col max-h-[300px]">
              <CardHeader className="p-8 pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black font-bold text-[#041614] flex items-center gap-2">
                    Peak Routes
                  </CardTitle>
                  <span className="text-[10px] font-black text-[#39B5A8] bg-[#F0F9F8] px-2 py-1 rounded-lg uppercase tracking-wider">Live</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {topRoutes.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8 font-medium">No route data available</p>
                ) : topRoutes.map((route, index) => (
                  <div key={index} className="group cursor-pointer pr-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#F0F9F8] flex items-center justify-center text-[#39B5A8] font-bold text-sm border border-[#39B5A8]/10 group-hover:bg-[#39B5A8] group-hover:text-white transition-all duration-300">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#041614] leading-tight group-hover:text-[#39B5A8] transition-colors">{route.route}</p>
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            to <span className="text-[#1A5D56] font-bold">{route.to}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-[#1A5D56]">{route.revenue}</p>
                        <p className="text-[9px] font-bold text-[#39B5A8]">{route.trips} trips</p>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black inline-block py-1 px-2 uppercase rounded-full text-[#39B5A8] bg-[#F0F9F8]">
                            Efficiency Rate
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black inline-block text-[#39B5A8]">
                            {route.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-[#F0F9F8]">
                        <div 
                          style={{ width: `${route.percentage}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#39B5A8] to-[#1A5D56] transition-all duration-1000"
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* NETWORK WORKFORCE */}
            <Card className="bg-white rounded-[2.5rem] border-[#39B5A8]/10 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="p-8 pb-4 shrink-0">
                 <CardTitle className="text-xl font-bold text-[#041614]">Overall Driver Count</CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex-1 flex items-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full -mt-10">
                  {driverWorkforce.map((stat, index) => (
                    <div key={index} className="group flex flex-col gap-4 p-5 rounded-[2rem] bg-[#F0F9F8]/80 border border-[#39B5A8]/10 items-center text-center hover:bg-white hover:shadow-xl transition-all duration-500 cursor-default">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#39B5A8] group-hover:bg-[#39B5A8] group-hover:text-white transition-colors duration-500">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xl font-black text-[#041614] leading-tight">{stat.count}</p>
                        <p className="font-bold text-[#39B5A8] text-[9px] leading-tight mb-1">{stat.type}</p>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{stat.sub}</span>
                          <span className="text-[9px] font-black text-emerald-500">{stat.growth}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F0F9F8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #39B5A8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1A5D56;
        }
      `}</style>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  trend: string | null;
  trendUp: boolean;
  value: string;
}

function StatCard({ label, value, trend, trendUp, icon }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#39B5A8]/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="p-2 bg-[#F0F9F8] rounded-lg text-[#39B5A8]">
          {icon}
        </div>
        {trend !== null ? (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
            No prior data
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-[#041614]">{value}</p>
      </div>
      <div className="absolute -bottom-2 -right-2 text-[#39B5A8] opacity-[0.03] scale-[2.5] transition-transform group-hover:scale-[3]">
        {icon}
      </div>
    </div>
  );
}

interface ChartDatum {
  label: string;
  value: number;
}

function SimpleBars({ data, suffix = '', valuePrefix = '' }: { data: ChartDatum[]; suffix?: string; valuePrefix?: string }) {
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="flex h-56 items-end gap-4">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
          <div className="flex h-44 w-full items-end">
            {item.value > 0 ? (
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-[#39B5A8] to-[#50E3C2] shadow-lg shadow-[#39B5A8]/10 transition-all duration-500"
                style={{ height: `${Math.max(12, (item.value / maxValue) * 100)}%` }}
                title={`${valuePrefix}${item.value}${suffix}`}
              />
            ) : (
              <div
                className="w-full rounded-t-lg bg-[#39B5A8]/5 border border-dashed border-[#39B5A8]/20 transition-all duration-500"
                style={{ height: '4px' }}
                title="No data"
              />
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#1A5D56]/60">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniBarChart({ title, subtitle, data, suffix = '' }: { title: string; subtitle: string; data: ChartDatum[]; suffix?: string }) {
  return (
    <Card className="bg-white rounded-[3rem] border-none shadow-sm overflow-hidden">
      <CardHeader className="p-10 pb-2">
        <CardTitle className="text-2xl font-black text-[#041614]">{title}</CardTitle>
        <p className="text-sm text-gray-400 mt-1 font-medium">{subtitle}</p>
      </CardHeader>
      <CardContent className="p-10">
        <SimpleBars data={data} suffix={suffix} />
      </CardContent>
    </Card>
  );
}
