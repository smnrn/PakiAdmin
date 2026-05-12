import { useNavigate } from 'react-router';
import {
  BarChart3,
  MapPin,
  Settings,
  LogOut,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import pakiParkLogo from 'figma:asset/feccb20cc5f5015bfba988559af29b31524bf965.png';

interface PakiParkSidebarProps {
  activeTab: 'dashboard' | 'bookings' | 'reports' | 'profile' | 'settings';
}

export default function PakiParkSidebar({ activeTab }: PakiParkSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', path: '/pakipark/dashboard' },
    { id: 'bookings', icon: MapPin, label: 'Bookings', path: '/pakipark/bookings' },
    { id: 'reports', icon: TrendingUp, label: 'Reports', path: '/pakipark/reports' },
  ];

  const systemItems = [
    { id: 'profile', icon: Users, label: 'My Profile', path: '/pakipark/profile' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/pakipark/settings' }
  ];

  const renderNavItem = (item: typeof navItems[0]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
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
  };

  return (
    <div className="w-72 bg-white border-r border-[#e2e8f0] flex flex-col shadow-sm relative z-20">
      <div className="h-24 flex items-center justify-center px-8 border-b border-[#f1f5f9]">
        <img src={pakiParkLogo} alt="PakiPark Logo" className="h-10 object-contain" />
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map(renderNavItem)}
        <div className="pt-6 pb-2">
          <p className="px-4 text-[11px] font-black text-[#ee6b20] uppercase tracking-[0.15em] mb-4 opacity-70">
            System
          </p>
          <div className="space-y-2">
            {systemItems.map(renderNavItem)}
          </div>
        </div>
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
  );
}
