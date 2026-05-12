import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
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
  Filter,
  Navigation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';

export default function AnalyticsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Year to Date");

  const placeholderName = "Juan Dela Cruz";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dataMap = {
    "Today": {
      revenue: "₱482K",
      delivered: "1,240",
      pending: "85",
      cancelled: "12",
      chartData: [
        { month: '08:00', revenue: 40000 },
        { month: '10:00', revenue: 85000 },
        { month: '12:00', revenue: 120000 },
        { month: '14:00', revenue: 95000 },
        { month: '16:00', revenue: 142000 },
      ]
    },
    "Last 7 Days": {
      revenue: "₱4.2M",
      delivered: "9,840",
      pending: "310",
      cancelled: "45",
      chartData: [
        { month: 'Mon', revenue: 580000 },
        { month: 'Tue', revenue: 620000 },
        { month: 'Wed', revenue: 710000 },
        { month: 'Thu', revenue: 540000 },
        { month: 'Fri', revenue: 850000 },
        { month: 'Sat', revenue: 920000 },
        { month: 'Sun', revenue: 450000 },
      ]
    },
    "Last 30 Days": {
      revenue: "₱18.4M",
      delivered: "42,150",
      pending: "842",
      cancelled: "112",
      chartData: [
        { month: 'Week 1', revenue: 4200000 },
        { month: 'Week 2', revenue: 4800000 },
        { month: 'Week 3', revenue: 5100000 },
        { month: 'Week 4', revenue: 4300000 },
      ]
    },
    "Year to Date": {
      revenue: "₱104.2M",
      delivered: "84,120",
      pending: "1,204",
      cancelled: "342",
      chartData: [
        { month: 'Jan', revenue: 4250000 },
        { month: 'Feb', revenue: 4850000 },
        { month: 'Mar', revenue: 5150000 },
        { month: 'Apr', revenue: 4900000 },
        { month: 'May', revenue: 5800000 },
        { month: 'Jun', revenue: 6200000 },
        { month: 'Jul', revenue: 7100000 },
        { month: 'Aug', revenue: 8400000 },
        { month: 'Sep', revenue: 9200000 },
        { month: 'Oct', revenue: 10500000 },
        { month: 'Nov', revenue: 12100000 },
        { month: 'Dec', revenue: 15800000 },
      ]
    }
  };

  const activeData = dataMap[dateRange] || dataMap["Year to Date"];
  const maxRevenue = useMemo(() => Math.max(...activeData.chartData.map(d => d.revenue)), [activeData]);

  const driverWorkforce = [
    { type: 'Relay Drivers', count: 428, growth: '+12%', icon: <Bike className="w-5 h-5" />, sub: 'Tricycle/Jeepney' },
    { type: 'Direct Drivers', count: 156, growth: '+5%', icon: <Truck className="w-5 h-5" />, sub: 'On-Demand' },
    { type: 'Active Now', count: 312, growth: '78%', icon: <Activity className="w-5 h-5" />, sub: 'Live on Road' },
  ];

  const topRoutes = [
    { route: '7-Eleven Dapitan', to: 'P. Noval Hub', trips: 540, revenue: '₱142K', percentage: 92 },
    { route: 'España Lawson', to: 'Lacson Depot', trips: 420, revenue: '₱128K', percentage: 78 },
    { route: 'Uncle John Noval', to: 'Dapitan Ext', trips: 310, revenue: '₱98K', percentage: 64 },
    { route: 'UST Overpass', to: 'España Boulevard', trips: 280, revenue: '₱75K', percentage: 55 },
    { route: 'P. Campa', to: 'Lerma Street', trips: 210, revenue: '₱52K', percentage: 40 },
  ];

  const handleExport = () => {
    const headers = ["Period", "Revenue (PHP)"];
    const rows = activeData.chartData.map(d => [d.month, d.revenue]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PakiShip_${dateRange.replace(/ /g, '_')}_Report.csv`);
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
                  {Object.keys(dataMap).map((range) => (
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
                onClick={handleExport}
                className="bg-[#39B5A8] hover:bg-[#2F9D91] text-white rounded-xl shadow-lg shadow-[#39B5A8]/20"
              >
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Revenue" value={activeData.revenue} trend="+24.2%" trendUp={true} icon={<Wallet className="w-4 h-4" />} />
            <StatCard label="Parcels Delivered" value={activeData.delivered} trend="+12.5%" trendUp={true} icon={<PackageCheck className="w-4 h-4" />} />
            <StatCard label="Parcels Pending" value={activeData.pending} trend="-8.1%" trendUp={true} icon={<PackagePlus className="w-4 h-4" />} />
            <StatCard label="Parcels Cancelled" value={activeData.cancelled} trend="+1.1%" trendUp={false} icon={<PackageX className="w-4 h-4" />} />
          </div>

          <div className="grid grid-cols-1 gap-8">
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
                        <div 
                          className="w-full rounded-t-2xl transition-all duration-700 ease-out hover:scale-x-105 cursor-pointer shadow-lg shadow-[#39B5A8]/5 bg-gradient-to-t from-[#39B5A8] via-[#39B5A8]/80 to-[#50E3C2]"
                          style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
                        </div>
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
                {topRoutes.map((route, index) => (
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

function StatCard({ label, value, trend, trendUp, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#39B5A8]/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="p-2 bg-[#F0F9F8] rounded-lg text-[#39B5A8]">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
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