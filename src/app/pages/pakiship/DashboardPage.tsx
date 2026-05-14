import { useState } from 'react';
import { useNavigate } from '../../lib/router';
import {
  Package,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Clock,
  Target,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Truck,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';

import { pakiParkLogo, pakiShipLogo } from '../../lib/assets';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);

  const placeholderName = 'Juan Dela Cruz';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const kpis = [
    {
      label: 'Total Revenue',
      value: '\u20B150,650',
      change: '+2.5%',
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-[#39B5A8]/10 text-[#2D8F85]',
      description: 'Weekly earnings from hub areas',
    },
    {
      label: 'Active Shipments',
      value: '247',
      change: '+8.2%',
      trend: 'up',
      icon: <Truck className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600',
      description: 'Currently in transit',
    },
    {
      label: 'On-Time Delivery',
      value: '94.86%',
      change: '+2.1%',
      trend: 'up',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-emerald-100 text-emerald-600',
      description: 'Delivered within promised timeframe',
    },
    {
      label: 'Canceled Bookings',
      value: '87',
      change: '-5.4%',
      trend: 'down',
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-100 text-red-600',
      description: 'Total bookings canceled in this period',
    },
    {
      label: 'Avg Delivery Time',
      value: '18 mins',
      change: '-11.2%',
      trend: 'down',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-amber-100 text-amber-600',
      description: 'Fast fulfillment for orders',
    },
    {
      label: 'Total Deliveries',
      value: '1,100',
      change: '+18.7%',
      trend: 'up',
      icon: <Package className="w-5 h-5" />,
      color: 'bg-teal-100 text-teal-600',
      description: 'Completed this week',
    },
  ];

  const shipments = [
    { store: '7-Eleven Dapitan', location: 'Dapitan St. cor A.H. Lacson', amount: '12.19K', status: 'In Transit' },
    { store: 'Lawson Espana', location: 'Espana Blvd near P. Noval', amount: '15.51K', status: 'Pending' },
    { store: "Uncle John's Noval", location: 'P. Noval St.', amount: '09.24K', status: 'Delivered' },
    { store: '7-Eleven Lacson', location: 'A.H. Lacson Ave.', amount: '11.10K', status: 'In Transit' },
  ];

  const transactions = [
    { id: 'TRX-9921', person: 'Sarah Dela Pena', type: 'Food', amount: '+\u20B1300', date: 'Today, 2:40 PM', status: 'In' },
    { id: 'TRX-9920', person: 'Joey Salvador', type: 'Fragile', amount: '+\u20B11,100', date: 'Today, 1:15 PM', status: 'In' },
    { id: 'TRX-9918', person: 'Carlos Santos', type: 'Fragile', amount: '+\u20B1880', date: 'Yesterday', status: 'In' },
    { id: 'TRX-9915', person: 'Hannah Garcia', type: 'Clothing', amount: '+\u20B1160', date: 'Yesterday', status: 'In' },
    { id: 'TRX-9914', person: 'Paul Mendoza', type: 'Electronics', amount: '+\u20B1650', date: 'Yesterday', status: 'In' },
  ];

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
            <div className="relative">
              <button
                onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                className="flex items-center gap-3 bg-[#F0F9F8] px-4 py-2.5 rounded-xl border border-[#39B5A8]/10 hover:bg-[#39B5A8]/5 transition-all"
              >
                <img src={pakiShipLogo} alt="Current" className="h-5 w-auto object-contain" />
                <ChevronDown className={`w-4 h-4 text-[#1A5D56] transition-transform ${isDashboardMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDashboardMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#39B5A8]/10 overflow-hidden z-20">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setIsDashboardMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F0F9F8] transition-colors text-left group"
                    >
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <img src={pakiShipLogo} alt="PakiShip" className="h-6 w-auto" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#041614] text-xs">PakiShip</p>
                        <p className="text-[10px] text-[#39B5A8] font-bold">Logistics</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#39B5A8] rounded-full" />
                    </button>

                    <button
                      onClick={() => {
                        setIsDashboardMenuOpen(false);
                        navigate('/pakipark/dashboard');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F0F9F8] transition-colors text-left group"
                    >
                      <div className="p-1.5 bg-white rounded-lg border border-gray-100 group-hover:border-emerald-100 transition-colors">
                        <img src={pakiParkLogo} alt="PakiPark" className="h-6 w-auto" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#041614] text-xs">PakiPark</p>
                        <p className="text-[10px] text-gray-400 font-bold">Parking</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
          <section>
            <h1 className="text-3xl font-bold text-[#041614] tracking-tight">Operational Overview</h1>
            <p className="text-[#1A5D56] opacity-70 font-medium italic">Monitoring PakiShip logistics, {placeholderName}.</p>
          </section>

          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi, index) => (
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
              <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                <CardTitle className="text-xl font-bold text-[#041614]">Recent Dispatch Logs</CardTitle>
                <p className="text-xs font-medium text-gray-400">Latest dispatch records and activity updates.</p>
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
                    {shipments.map((shipment, index) => (
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
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[2.5rem] border-[#39B5A8]/10 bg-white shadow-sm">
              <CardHeader className="border-b border-[#39B5A8]/5 p-8">
                <CardTitle className="text-xl font-bold text-[#041614]">Recent Transactions</CardTitle>
                <p className="text-xs font-medium text-gray-400">Latest booking transaction records.</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="-mt-8 space-y-6">
                  {transactions.map((trx, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
