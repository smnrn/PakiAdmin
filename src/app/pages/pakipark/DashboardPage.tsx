import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  DollarSign,
  Car,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  TrendingUp,
  MapPin,
  Users,
  ArrowUpRight,
  ParkingCircle,
  Clock,
  Bike,
  Truck,
  History
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import PakiParkSidebar from '../../components/pakipark/PakiParkSidebar';

// Assets
import pakiShipLogo from 'figma:asset/d0a94c34a139434e20f5cb9888d8909dd214b9e7.png';
import pakiParkLogo from 'figma:asset/feccb20cc5f5015bfba988559af29b31524bf965.png';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const displayName = "Juan Dela Cruz";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { label: 'Total Reservations', value: '2,412', change: '+18.2%', trend: 'up', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-[#1e3d5a]/10 text-[#1e3d5a]', description: 'Total bookings across all districts' },
    { label: 'Active Bookings', value: '892', change: '+12.4%', trend: 'up', icon: <Car className="w-5 h-5" />, color: 'bg-[#ee6b20]/10 text-[#ee6b20]', description: 'Vehicles currently in parking slots' },
    { label: 'Occupancy Rate', value: '88.1%', change: '+5.1%', trend: 'up', icon: <Users className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', description: 'Average utilization of Manila areas' },
    { label: 'Daily Revenue', value: '₱98,450', change: '+24.3%', trend: 'up', icon: <DollarSign className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', description: 'Gross earnings generated today' },
    { label: 'Available Slots', value: '156', change: '-8.2%', trend: 'down', icon: <ParkingCircle className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', description: 'Total vacancies across areas' },
    { label: 'Avg. Stay Time', value: '4.2h', change: '+1.5%', trend: 'up', icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600', description: 'Average duration per vehicle' },
  ];

  const parkingSpots = [
    { name: 'Greenbelt 3 Basement', location: 'Ayala Center, Makati', available: '12/150', revenue: '24,450', status: 'High Demand' },
    { name: 'SM Mall of Asia - North', location: 'Bay City, Pasay', available: '88/450', revenue: '42,890', status: 'Available' },
    { name: 'BGC High Street Parking', location: 'Fort Bonifacio, Taguig', available: '5/120', revenue: '31,120', status: 'Near Capacity' },
  ];

  const recentBookings = [
    { user: 'Sophia Santos', vehicle: 'SUV - NDM 4502', location: 'Greenbelt 3', time: '2 mins ago', icon: <Car size={16} /> },
    { user: 'Mark Reyes', vehicle: 'Motorcycle - 123 PHL', location: 'BGC High St.', time: '15 mins ago', icon: <Bike size={16} /> },
    { user: 'Mike Cruz', vehicle: 'Sedan - ABC 8891', location: 'SM Mall of Asia', time: '24 mins ago', icon: <Car size={16} /> },
    { user: 'Nicole Gonzales', vehicle: 'Van - GHI 7723', location: 'Greenbelt 3', time: '42 mins ago', icon: <Truck size={16} /> },
  ];

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans text-[#1e3d5a]">
      {/* Global Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f4f7fa; }
        ::-webkit-scrollbar-thumb { background: #1e3d5a22; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #1e3d5a44; }
      `}} />

      <PakiParkSidebar activeTab="dashboard" />

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#1e3d5a]/10 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                className="flex items-center gap-3 bg-[#f4f7fa] px-4 py-2.5 rounded-xl border border-[#1e3d5a]/10 hover:bg-[#1e3d5a]/5 transition-all"
              >
                <img src={pakiParkLogo} alt="Current" className="h-5 w-auto object-contain" />
                <ChevronDown className={`w-4 h-4 text-[#1e3d5a] transition-transform ${isDashboardMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDashboardMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#1e3d5a]/10 overflow-hidden z-20">
                  <div className="p-2 space-y-1">
                    <button onClick={() => setIsDashboardMenuOpen(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f4f7fa] transition-colors text-left group">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <img src={pakiParkLogo} alt="PakiPark" className="h-6 w-auto" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#1e3d5a] text-xs">PakiPark</p>
                        <p className="text-[10px] text-[#ee6b20] font-bold">Parking</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#ee6b20] rounded-full" />
                    </button>
                    
                    <button onClick={() => { setIsDashboardMenuOpen(false); navigate('/pakiship/dashboard'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f4f7fa] transition-colors text-left group">
                      <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                        <img src={pakiShipLogo} alt="PakiShip" className="h-6 w-auto" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#1e3d5a] text-xs">PakiShip</p>
                        <p className="text-[10px] text-gray-400 font-bold">Logistics</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 bg-[#f4f7fa] px-4 py-2 rounded-xl border border-[#1e3d5a]/10 w-153">
              <Search className="w-4 h-4 text-[#1e3d5a]/60" />
              <input
                type="text"
                placeholder="Search plate numbers, booking IDs, or parking hubs..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#1e3d5a]/40 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:bg-[#f4f7fa] px-3 py-2 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#1e3d5a] to-[#2a5373] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block min-w-max">
                  <p className="text-sm font-bold text-[#1e3d5a] leading-tight whitespace-nowrap">{displayName}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#1e3d5a] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#1e3d5a]/10 overflow-hidden z-20">
                  <button onClick={() => navigate('/pakipark/profile')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left">
                    <User className="w-4 h-4 text-[#ee6b20]" />
                    <span className="font-semibold text-[#1e3d5a]">Profile</span>
                  </button>
                  <button onClick={() => navigate('/pakipark/settings')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left">
                    <Settings className="w-4 h-4 text-[#ee6b20]" />
                    <span className="font-semibold text-[#1e3d5a]">Settings</span>
                  </button>
                  <div className="border-t border-[#1e3d5a]/10"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-left">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-500">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-10 space-y-10">
          <section>
            <h1 className="text-3xl font-bold text-[#1e3d5a] tracking-tight">Operational Overview</h1>
            <p className="text-[#1e3d5a] opacity-70 font-medium italic">Managing real-time parking ecosystem, {displayName}.</p>
          </section>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-[2rem] border border-[#1e3d5a]/10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                      {stat.icon}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      stat.trend === 'up' 
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                        : 'text-amber-600 bg-amber-50 border-amber-100'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#ee6b20] uppercase tracking-[0.15em]">{stat.label}</p>
                    <p className="text-3xl font-black text-[#1e3d5a]">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table Card */}
            <Card className="bg-white rounded-[2.5rem] border-[#1e3d5a]/10 shadow-sm overflow-hidden">
              <CardHeader className="p-8 border-b border-[#1e3d5a]/5">
                <CardTitle className="text-xl font-bold text-[#1e3d5a]">Best-performing areas</CardTitle>
                <p className="text-xs text-gray-400 font-medium">Areas with the highest usage and best overall performance.</p>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left">
                  <thead className="bg-[#f4f7fa]/50 border-b border-[#1e3d5a]/5">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#1e3d5a]/60 uppercase tracking-widest">Location</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#1e3d5a]/60 uppercase tracking-widest">Revenue</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-[#1e3d5a]/60 uppercase tracking-widest">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e3d5a]/5">
                    {parkingSpots.map((spot, index) => (
                      <tr key={index} className="hover:bg-[#f4f7fa]/30 transition-colors group">
                        <td className="px-8 py-5">
                          <p className="font-bold text-[#1e3d5a] group-hover:text-[#ee6b20] transition-colors">{spot.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{spot.location}</p>
                        </td>
                        <td className="px-8 py-5 font-bold text-[#1e3d5a]">₱{spot.revenue}</td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-[#1e3d5a]">{spot.available} slots</span>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#ee6b20]" style={{ width: '85%' }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Recent Bookings Activity Feed */}
            <Card className="bg-[#1e3d5a] rounded-[2.5rem] border-none shadow-xl text-white overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Recent Reservations</CardTitle>
                  <p className="text-blue-200/60 text-xs italic">Live entry and exit stream</p>
                </div>
                <History className="w-6 h-6 text-[#ee6b20] opacity-50" />
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                
                <div className="space-y-3">
                   {recentBookings.map((booking, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/10 rounded-xl text-[#ee6b20]">
                            {booking.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{booking.user}</p>
                            <p className="text-[10px] text-blue-200/50 uppercase font-black">{booking.vehicle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{booking.location}</p>
                          <p className="text-[10px] text-blue-200/50 font-medium">{booking.time}</p>
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