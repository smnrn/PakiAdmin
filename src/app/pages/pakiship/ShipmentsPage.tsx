import { useState, useMemo } from 'react';
import { useNavigate } from '../../lib/router';
import {
  Filter,
  Download,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';

export default function ShipmentsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const placeholderName = "Juan Dela Cruz";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const shipments = [
    { 
      id: 'PKS-2026-120', 
      store: '7-Eleven P. Noval', 
      location: '1043 P. Noval St, Sampaloc, Manila', 
      destination: '2412 Dapitan St., Sampaloc, Manila',
      quantity: '450 Units', 
      amount: '12,500', 
      status: 'In Transit',
      driver: 'John Salazar',
      eta: '12 mins',
      date: 'Apr 16, 2026'
    },
    { 
      id: 'PKS-2026-128', 
      store: 'Lawson Lacson Ave', 
      location: 'Ground Floor, AH Lacson Ave, Manila', 
      destination: '1558 España Blvd, Corner Arsenio St.',
      quantity: '1,240 Units', 
      amount: '27,510', 
      status: 'Pending',
      driver: 'Unassigned',
      eta: 'N/A',
      date: 'Apr 16, 2026'
    },
    { 
      id: 'PKS-2026-220', 
      store: 'Alfamart Dapitan', 
      location: '1221 Dapitan St, Sampaloc, Manila', 
      destination: '88 Cavite St., Sta. Cruz, Manila',
      quantity: '850 Units', 
      amount: '14,240', 
      status: 'Delivered',
      driver: 'Maria Reyes',
      eta: 'Delivered',
      date: 'Apr 15, 2026'
    },
    { 
      id: 'PKS-2026-222', 
      store: "Uncle John's Asturias", 
      location: 'Asturias St, Sampaloc, Manila', 
      destination: '412 Laon Laan St., Sampaloc',
      quantity: '183 Units', 
      amount: '23,870', 
      status: 'In Transit',
      driver: 'Mark Gonzales',
      eta: '8 mins',
      date: 'Apr 16, 2026'
    },
    { 
      id: 'PKS-2026-101', 
      store: '7-Eleven España', 
      location: 'España Blvd cor. Moret St, Manila', 
      destination: '702 Quezon Blvd, Quiapo, Manila',
      quantity: '624 Units', 
      amount: '18,920', 
      status: 'In Transit',
      driver: 'Anna Martinez',
      eta: '15 mins',
      date: 'Apr 16, 2026'
    },
  ];

  const filteredShipments = useMemo(() => {
    return shipments.filter((shp) => {
      const matchesSearch = 
        shp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.driver.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || shp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleExport = () => {
    const headers = ['Shipment ID', 'Source Store', 'Pickup Address', 'Final Destination', 'Courier', 'Value', 'Status', 'Date'];
    const csvData = filteredShipments.map(shp => [
      shp.id, shp.store, shp.location, shp.destination, shp.driver, shp.amount, shp.status, shp.date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvData].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UST_Area_Shipments_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exporting shipments to CSV...");
  };

  return (
    <div className="flex h-screen bg-[#F0F9F8] font-sans text-[#1A5D56] overflow-hidden">
      <PakiShipSidebar activeTab="shipments" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER - Applied Analytics Design */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#F0F9F8] px-4 py-2 rounded-xl border border-[#39B5A8]/10 w-180">
              <Search className="w-4 h-4 text-[#39B5A8]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, driver, or store..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#39B5A8]/40 font-medium"
              />
              {searchQuery && (
                <X className="w-4 h-4 cursor-pointer opacity-40 hover:opacity-100" onClick={() => setSearchQuery('')} />
              )}
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

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#041614] tracking-tight">PakiShip Shipments</h1>
              <p className="text-[#1A5D56] opacity-70 font-medium italic">Track, manage, and provide real-time updates on delivery progress.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Button 
                  variant="outline"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="bg-white border-[#39B5A8]/20 text-[#1A5D56] rounded-xl font-bold hover:bg-[#F0F9F8] min-w-[140px] justify-between"
                >
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-[#39B5A8]" />
                    {statusFilter === 'All' ? 'Filter Status' : statusFilter}
                  </div>
                  <ChevronDown className={`w-3 h-3 ml-2 opacity-50 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </Button>
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#39B5A8]/10 rounded-xl shadow-xl z-30 overflow-hidden">
                    {['All', 'In Transit', 'Pending', 'Delivered'].map((status) => (
                      <button 
                        key={status} 
                        onClick={() => { setStatusFilter(status); setShowFilterDropdown(false); }} 
                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${statusFilter === status ? 'bg-[#39B5A8] text-white' : 'hover:bg-[#F0F9F8] text-[#1A5D56]'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleExport} 
                className="bg-[#39B5A8] hover:bg-[#2F9D91] text-white rounded-xl shadow-lg shadow-[#39B5A8]/20 font-bold"
              >
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </div>
          </div>

          <Card className="bg-white rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-10 pb-2">
              <CardTitle className="text-2xl font-black font-bold text-[#041614]">Shipment Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F0F9F8]/50 border-b border-[#39B5A8]/5">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black font-bold text-[#39B5A8] uppercase tracking-widest">ID / Date</th>
                      <th className="px-6 py-5 text-[10px] font-black font-bold text-[#39B5A8] uppercase tracking-widest">Pickup Point</th>
                      <th className="px-6 py-5 text-[10px] font-black font-bold text-[#39B5A8] uppercase tracking-widest">Final Destination</th>
                      <th className="px-6 py-5 text-[10px] font-black font-bold text-[#39B5A8] uppercase tracking-widest">Courier</th>
                      <th className="px-6 py-5 text-[10px] font-black font-bold text-[#39B5A8] uppercase tracking-widest">Value</th>
                      <th className="px-10 py-5 text-[10px] font-black font-bold text-[#39B5A8] uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#39B5A8]/5">
                    {filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment, index) => (
                        <tr key={index} className="hover:bg-[#F0F9F8]/30 transition-colors group">
                          <td className="px-10 py-6">
                            <p className="font-bold text-[#041614] text-xs">{shipment.id}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{shipment.date}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="font-black font-bold text-[#041614] text-xs group-hover:text-[#39B5A8] transition-colors">{shipment.store}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{shipment.location}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="font-bold text-[#1A5D56] text-xs">{shipment.destination}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{shipment.quantity}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="font-bold text-[#1A5D56] text-xs">{shipment.driver}</p>
                            <p className="text-[10px] text-[#39B5A8] font-bold">ETA: {shipment.eta}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="font-black font-bold text-[#1A5D56] text-xs">₱{shipment.amount}</p>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <span className={`inline-flex items-center justify-center text-[10px] font-black px-3 py-1 rounded-lg uppercase border transition-all ${
                              shipment.status === 'In Transit' ? 'bg-blue-50 font-bold text-blue-600 border-blue-100' :
                              shipment.status === 'Delivered' ? 'bg-emerald-50 font-bold text-emerald-600 border-emerald-100' :
                              'bg-amber-50 font-bold text-amber-600 border-amber-100'
                            }`}>
                              {shipment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-10 py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <Search className="w-8 h-8" />
                            <p className="text-sm text-[#1A5D56] font-black uppercase tracking-widest">No Shipments Found</p>
                          </div>
                        </td>
                      </tr>
                    )}
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
