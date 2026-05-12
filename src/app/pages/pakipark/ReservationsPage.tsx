import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  BarChart3, 
  MapPin, 
  Settings, 
  LogOut,
  Car,
  Users,
  DollarSign,
  Menu,
  TrendingUp,
  Calendar,
  Clock,
  Filter,
  Download,
  Plus,
  Eye,
  Search,
  ChevronRight,
  Bell
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import pakiParkLogo from 'figma:asset/feccb20cc5f5015bfba988559af29b31524bf965.png';

export default function ReservationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reservations');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const reservations = [
    { 
      id: 'RES-2847', 
      customer: 'Sarah Johnson', 
      location: 'Greenbelt 3 Basement', 
      spot: 'A-15',
      date: 'Mar 27, 2026',
      time: '09:00 AM - 5:00 PM',
      status: 'Active',
      amount: '₱1,200',
      vehicle: 'Toyota Camry'
    },
    { 
      id: 'RES-2846', 
      customer: 'Michael Chen', 
      location: 'SM Mall of Asia - North', 
      spot: 'B-23',
      date: 'Mar 27, 2026',
      time: '10:00 AM - 2:00 PM',
      status: 'Active',
      amount: '₱800',
      vehicle: 'Honda Accord'
    },
    { 
      id: 'RES-2845', 
      customer: 'Emily Davis', 
      location: 'BGC High Street', 
      spot: 'C-08',
      date: 'Mar 26, 2026',
      time: '12:00 PM - 8:00 PM',
      status: 'Completed',
      amount: '₱1,600',
      vehicle: 'Tesla Model 3'
    },
    { 
      id: 'RES-2844', 
      customer: 'David Martinez', 
      location: 'Airport Terminal 3', 
      spot: 'D-47',
      date: 'Mar 27, 2026',
      time: '06:00 AM - 11:59 PM',
      status: 'Active',
      amount: '₱2,400',
      vehicle: 'BMW X5'
    },
    { 
      id: 'RES-2843', 
      customer: 'Lisa Anderson', 
      location: 'Binondo Central Plaza', 
      spot: 'A-32',
      date: 'Mar 28, 2026',
      time: '08:00 AM - 6:00 PM',
      status: 'Upcoming',
      amount: '₱1,400',
      vehicle: 'Ford Explorer'
    },
  ];

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', path: '/pakipark/dashboard' },
    { id: 'reservations', icon: Car, label: 'Reservations', path: '/pakipark/reservations' },
    { id: 'locations', icon: MapPin, label: 'Locations', path: '/pakipark/locations' },
    { id: 'reports', icon: TrendingUp, label: 'Reports', path: '/pakipark/reports' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/pakipark/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <div className="w-72 bg-white border-r border-[#e2e8f0] flex flex-col shadow-sm relative z-20">
        <div className="h-24 flex items-center px-8 border-b border-[#f1f5f9]">
          <img src={pakiParkLogo} alt="PakiPark Logo" className="h-10 object-contain" />
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold tracking-tight transition-all group ${
                  isActive 
                    ? 'bg-[#1e3d5a] text-white shadow-lg shadow-blue-900/20' 
                    : 'text-[#8492a6] hover:bg-[#f8fafc] hover:text-[#1e3d5a]'
                }`}
              >
                <div className={isActive ? 'text-white' : 'group-hover:text-[#ee6b20] transition-colors'}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#f1f5f9]">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold gap-3"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] flex items-center justify-between px-10 relative z-10">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1e3d5a] tracking-tight">Reservations</h1>
            <p className="text-xs font-bold text-[#8492a6] uppercase tracking-widest mt-0.5">Manage node bookings</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl px-4 h-12 w-64 group focus-within:border-[#1e3d5a] transition-all">
              <Search className="w-4 h-4 text-[#8492a6] mr-3" />
              <input type="text" placeholder="Search ID or Customer..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
            </div>
            
            <button className="relative p-3 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#ee6b20] transition-all">
              <Bell className="w-5 h-5 text-[#1e3d5a]" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ee6b20] rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-[#e2e8f0]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1e3d5a] leading-none">{user?.name || 'Administrator'}</p>
                <span className="text-[10px] font-bold text-[#ee6b20] uppercase tracking-tighter">Verified Partner</span>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#1e3d5a] to-[#2a5373] rounded-2xl shadow-md flex items-center justify-center text-white font-black text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-10">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-3">
              <Button variant="outline" className="border-[#e2e8f0] text-[#1e3d5a] font-bold rounded-xl h-12">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-[#e2e8f0] text-[#1e3d5a] font-bold rounded-xl h-12">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <Button className="bg-[#ee6b20] hover:bg-[#ff7a2e] text-white font-black rounded-xl h-12 px-6 uppercase text-[11px] tracking-widest shadow-lg shadow-orange-900/20">
              <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
              New Reservation
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Total Today', value: '847', icon: <Calendar />, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Active Now', value: '534', icon: <Car />, color: 'text-[#ee6b20]', bg: 'bg-orange-50' },
              { label: 'Upcoming', value: '289', icon: <Clock />, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Revenue Today', value: '₱165K', icon: <DollarSign />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-[#8492a6] uppercase tracking-widest">{stat.label}</p>
                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                  </div>
                  <h2 className="text-3xl font-black text-[#1e3d5a] tracking-tight">{stat.value}</h2>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reservations Table */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="text-xl font-black text-[#1e3d5a]">Active Bookings</CardTitle>
              <CardDescription className="text-sm text-[#8492a6] font-medium">Real-time terminal reservation logs</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[#8492a6] text-[10px] font-black uppercase tracking-widest">
                      <th className="px-4 py-3">Reservation ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Location & Spot</th>
                      <th className="px-4 py-3">Time Schedule</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.map((res, index) => (
                      <tr key={index} className="group hover:bg-[#f8fafc] transition-all">
                        <td className="px-4 py-5">
                          <p className="font-black text-[#1e3d5a] text-sm">{res.id}</p>
                          <p className="text-[10px] text-[#8492a6] font-bold mt-0.5">{res.date}</p>
                        </td>
                        <td className="px-4 py-5">
                          <p className="font-bold text-[#1e3d5a] text-sm">{res.customer}</p>
                          <p className="text-xs text-[#8492a6] font-medium">{res.vehicle}</p>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#ee6b20]" />
                            <p className="font-bold text-[#1e3d5a] text-sm">{res.location}</p>
                          </div>
                          <p className="text-[10px] font-black text-[#ee6b20] uppercase ml-5 tracking-tighter">Spot: {res.spot}</p>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-[#1e3d5a] font-medium text-xs">
                            <Clock size={14} className="text-[#8492a6]" />
                            {res.time}
                          </div>
                        </td>
                        <td className="px-4 py-5 text-right font-black text-[#1e3d5a]">
                          {res.amount}
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                            res.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                            res.status === 'Completed' ? 'bg-gray-100 text-gray-500' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-right">
                          <button className="inline-flex items-center gap-1.5 text-[#ee6b20] hover:text-[#ff7a2e] font-black text-xs uppercase tracking-widest group">
                            <Eye className="w-4 h-4" />
                            View Detail
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}