import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from '../../lib/router';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  ChevronDown,
  Clock,
  Filter,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Search,
  Settings,
  Truck,
  User,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';
import { getDisplayNameForEmail } from '../../lib/sampleAccounts';

interface LiveShipment {
  id: string;
  driver: string;
  phone: string;
  vehicle: string;
  from: string;
  to: string;
  progress: number;
  eta: string;
  distance: string;
  status: 'On Route' | 'Delayed' | 'Idle';
  region: string;
  lastUpdate: string;
  idleMinutes: number;
  lat: number;
  lng: number;
}

const LIVE_SHIPMENTS: LiveShipment[] = [
  {
    id: 'PKS-2026-120',
    driver: 'John Salazar',
    phone: '+63 917 552 8102',
    vehicle: 'ABC-1234',
    from: '7-Eleven P. Noval, Manila',
    to: 'Dapitan St., Sampaloc',
    progress: 65,
    eta: '12 mins',
    distance: '2.4 km',
    status: 'On Route',
    region: 'Metro Manila',
    lastUpdate: '2 mins ago',
    idleMinutes: 2,
    lat: 14.6072,
    lng: 120.9898,
  },
  {
    id: 'PKS-2026-151',
    driver: 'Leo Castillo',
    phone: '+63 918 304 1189',
    vehicle: 'NVR-4218',
    from: 'Savemore UST',
    to: 'Banawe St., Quezon City',
    progress: 48,
    eta: '19 mins',
    distance: '6.8 km',
    status: 'On Route',
    region: 'Metro Manila',
    lastUpdate: '1 min ago',
    idleMinutes: 1,
    lat: 14.6321,
    lng: 121.0064,
  },
  {
    id: 'PKS-2026-171',
    driver: 'Daniel Torres',
    phone: '+63 916 882 4410',
    vehicle: 'TRK-9081',
    from: 'SM San Lazaro',
    to: 'Fugoso St., Sampaloc',
    progress: 38,
    eta: '22 mins',
    distance: '4.9 km',
    status: 'Delayed',
    region: 'Metro Manila',
    lastUpdate: '34 mins ago',
    idleMinutes: 34,
    lat: 14.6239,
    lng: 120.9829,
  },
  {
    id: 'PKS-2026-222',
    driver: 'Mark Gonzales',
    phone: '+63 919 670 2251',
    vehicle: 'MNL-7742',
    from: "Uncle John's Asturias",
    to: 'Laon Laan St., Sampaloc',
    progress: 73,
    eta: '8 mins',
    distance: '1.6 km',
    status: 'On Route',
    region: 'Metro Manila',
    lastUpdate: 'Just now',
    idleMinutes: 0,
    lat: 14.6114,
    lng: 120.9934,
  },
  {
    id: 'PKS-2026-101',
    driver: 'Anna Martinez',
    phone: '+63 917 119 5088',
    vehicle: 'QCT-4109',
    from: '7-Eleven Espana',
    to: 'Quezon Blvd, Quiapo',
    progress: 51,
    eta: '15 mins',
    distance: '3.1 km',
    status: 'Idle',
    region: 'Metro Manila',
    lastUpdate: '47 mins ago',
    idleMinutes: 47,
    lat: 14.6038,
    lng: 120.9965,
  },
  {
    id: 'PKS-2026-181',
    driver: 'Cesar Pineda',
    phone: '+63 915 732 6440',
    vehicle: 'TON-6045',
    from: 'Puregold Tayuman',
    to: 'Dimasalang Rd, Manila',
    progress: 86,
    eta: '6 mins',
    distance: '1.1 km',
    status: 'On Route',
    region: 'Metro Manila',
    lastUpdate: '3 mins ago',
    idleMinutes: 3,
    lat: 14.6252,
    lng: 120.9891,
  },
];

const REGION_OPTIONS = [
  'All Regions',
  'Metro Manila',
  'Central Visayas',
  'Davao Region',
  'Western Visayas',
  'Cordillera',
  'CALABARZON',
  'Central Luzon',
];

const IDLE_THRESHOLD_OPTIONS = ['30', '45', '60'];

export default function TrackingPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [driverFilter, setDriverFilter] = useState('All Drivers');
  const [idleThresholdMinutes, setIdleThresholdMinutes] = useState('30');
  const [selectedShipmentId, setSelectedShipmentId] = useState(LIVE_SHIPMENTS[0].id);

  const placeholderName = getDisplayNameForEmail(user?.email, 'Juan Dela Cruz');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drivers = useMemo(() => ['All Drivers', ...Array.from(new Set(LIVE_SHIPMENTS.map((shipment) => shipment.driver)))], []);
  const filteredShipments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return LIVE_SHIPMENTS.filter((shipment) => {
      const matchesSearch =
        shipment.id.toLowerCase().includes(query) ||
        shipment.driver.toLowerCase().includes(query) ||
        shipment.vehicle.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || shipment.status === statusFilter;
      const matchesRegion = regionFilter === 'All Regions' || shipment.region === regionFilter;
      const matchesDriver = driverFilter === 'All Drivers' || shipment.driver === driverFilter;

      return matchesSearch && matchesStatus && matchesRegion && matchesDriver;
    });
  }, [driverFilter, regionFilter, searchQuery, statusFilter]);

  const selectedShipment =
    filteredShipments.find((shipment) => shipment.id === selectedShipmentId) ?? filteredShipments[0] ?? LIVE_SHIPMENTS[0];
  const idleThreshold = Number(idleThresholdMinutes);
  const alertShipments = filteredShipments.filter((shipment) => shipment.idleMinutes >= idleThreshold);
  const totalAlertCount = LIVE_SHIPMENTS.filter((shipment) => shipment.idleMinutes >= idleThreshold).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F9F8] font-sans text-[#1A5D56]">
      <PakiShipSidebar activeTab="shipments" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#39B5A8]/10 bg-white/80 px-10 backdrop-blur-md">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#39B5A8]">Live Tracking</p>
            <p className="mt-1 text-sm font-semibold text-[#1A5D56]/70">Active shipments, driver pins, and delivery movement.</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative rounded-xl p-2 text-[#1A5D56] transition-colors hover:bg-[#F0F9F8]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[9px] font-bold text-white">
                {totalAlertCount}
              </span>
            </button>
            <div className="h-8 w-[1px] bg-[#39B5A8]/10"></div>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-[#F0F9F8]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#39B5A8] to-[#1A5D56] font-bold text-white shadow-lg shadow-[#39B5A8]/20">
                  {placeholderName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden min-w-max text-left md:block">
                  <p className="whitespace-nowrap text-sm font-bold leading-tight text-[#041614]">{placeholderName}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-[#1A5D56] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-[#39B5A8]/10 bg-white shadow-xl">
                  <button
                    onClick={() => navigate('/pakiship/profile')}
                    className="w-full px-5 py-3 text-left font-semibold text-[#041614] transition-colors hover:bg-[#F0F9F8]"
                  >
                    <span className="flex items-center gap-3">
                      <User className="h-4 w-4 text-[#39B5A8]" /> Profile
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/pakiship/settings')}
                    className="w-full px-5 py-3 text-left font-semibold text-[#041614] transition-colors hover:bg-[#F0F9F8]"
                  >
                    <span className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-[#39B5A8]" /> Settings
                    </span>
                  </button>
                  <div className="border-t border-[#39B5A8]/10"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <span className="flex items-center gap-3">
                      <LogOut className="h-4 w-4" /> Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="grid flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex min-h-0 flex-col overflow-hidden p-8">
            <div className="z-20 mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/pakiship/shipments')}
                  className="mb-3 inline-flex h-10 items-center gap-2 rounded-xl border border-[#39B5A8]/15 bg-white px-4 text-sm font-bold text-[#39B5A8] shadow-sm transition-colors hover:bg-[#F0F9F8] hover:text-[#1A5D56]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Shipments
                </button>
                <h1 className="text-3xl font-bold tracking-tight text-[#041614]">Live Shipment Map</h1>
                <p className="font-medium italic text-[#1A5D56]/70">{filteredShipments.length} active driver pins in view</p>
              </div>

              <div className="flex flex-col gap-2 rounded-[1.5rem] border border-[#39B5A8]/10 bg-white/90 p-2.5 shadow-sm backdrop-blur md:flex-row md:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search shipment, driver, plate"
                    className="h-11 w-full rounded-2xl border-[#39B5A8]/10 bg-[#F0F9F8] pl-11 text-sm font-semibold text-[#041614] placeholder:text-[#39B5A8]/35 focus-visible:ring-[#39B5A8]/15 md:w-72"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-[#39B5A8]/10 bg-[#F0F9F8] px-4 font-bold text-[#041614] md:w-36">
                    <Filter className="mr-2 h-4 w-4 text-[#39B5A8]" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#39B5A8]/15 bg-white p-1">
                    {['All', 'On Route', 'Delayed', 'Idle'].map((status) => (
                      <SelectItem key={status} value={status} className="rounded-xl font-semibold">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-[#39B5A8]/10 bg-[#F0F9F8] px-4 font-bold text-[#041614] md:w-44">
                    <MapPin className="mr-2 h-4 w-4 text-[#39B5A8]" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-[#39B5A8]/15 bg-white p-1">
                    {REGION_OPTIONS.map((region) => (
                      <SelectItem key={region} value={region} className="rounded-xl font-semibold">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-[#39B5A8]/10 bg-[#F0F9F8] px-4 font-bold text-[#041614] md:w-44">
                    <Truck className="mr-2 h-4 w-4 text-[#39B5A8]" />
                    <SelectValue placeholder="Driver" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-2xl border-[#39B5A8]/15 bg-white p-1">
                    {drivers.map((driver) => (
                      <SelectItem key={driver} value={driver} className="rounded-xl font-semibold">
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative min-h-[560px] flex-1 overflow-hidden rounded-[2.5rem] border border-[#39B5A8]/10 bg-[#E9F8F6] shadow-sm">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(57,181,168,0.16)_1px,transparent_1px),linear-gradient(rgba(57,181,168,0.16)_1px,transparent_1px)] bg-[size:88px_88px]" />
              <div className="absolute inset-0 opacity-70">
                <div className="absolute left-[8%] top-[34%] h-3 w-[82%] rotate-[-10deg] rounded-full bg-white/80 shadow-sm" />
                <div className="absolute left-[18%] top-[12%] h-[82%] w-3 rotate-[12deg] rounded-full bg-white/80 shadow-sm" />
                <div className="absolute left-[2%] top-[62%] h-3 w-[72%] rotate-[18deg] rounded-full bg-white/80 shadow-sm" />
                <div className="absolute left-[52%] top-[8%] h-[78%] w-3 rotate-[-20deg] rounded-full bg-white/80 shadow-sm" />
              </div>
              <div className="absolute left-[12%] top-[18%] rounded-full border border-[#39B5A8]/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#39B5A8]">
                Sampaloc
              </div>
              <div className="absolute bottom-[20%] right-[15%] rounded-full border border-[#39B5A8]/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#39B5A8]">
                Quiapo
              </div>

              {filteredShipments.map((shipment) => {
                const position = getPinPosition(shipment);
                const isSelected = selectedShipment.id === shipment.id;

                return (
                  <button
                    key={shipment.id}
                    type="button"
                    onClick={() => setSelectedShipmentId(shipment.id)}
                    className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border-4 border-white px-4 py-3 text-white shadow-xl transition-all hover:scale-105 ${
                      isSelected ? 'scale-110 ring-4 ring-[#39B5A8]/20' : ''
                    } ${shipment.idleMinutes >= idleThreshold ? 'ring-4 ring-red-500/25' : ''} ${getPinTone(shipment.status)}`}
                    style={{ left: `${position.left}%`, top: `${position.top}%` }}
                    title={`${shipment.id} - ${shipment.driver}`}
                  >
                    <Truck className="h-4 w-4" />
                    <span className="hidden text-xs font-black md:block">{shipment.driver.split(' ')[0]}</span>
                  </button>
                );
              })}

              <div className="absolute bottom-6 left-6 z-20 grid gap-3 rounded-[2rem] border border-[#39B5A8]/10 bg-white/90 p-4 shadow-sm backdrop-blur sm:grid-cols-3">
                <MapLegend color="bg-[#39B5A8]" label="On Route" />
                <MapLegend color="bg-amber-500" label="Delayed" />
                <MapLegend color="bg-red-500" label="Idle" />
              </div>
            </div>
          </section>

          <aside className="overflow-y-auto border-l border-[#39B5A8]/10 bg-white p-7">
            <div className="rounded-[2rem] border border-red-100 bg-red-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">No-Movement Alerts</p>
                  <p className="mt-2 text-sm font-bold leading-5 text-red-700">
                    {alertShipments.length} stuck alert{alertShipments.length === 1 ? '' : 's'}
                  </p>
                </div>
                <Select value={idleThresholdMinutes} onValueChange={setIdleThresholdMinutes}>
                  <SelectTrigger className="h-10 w-28 rounded-xl border-red-100 bg-white text-xs font-black text-red-700">
                    <Clock className="mr-2 h-3.5 w-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-red-100 bg-white p-1">
                    {IDLE_THRESHOLD_OPTIONS.map((minutes) => (
                      <SelectItem key={minutes} value={minutes} className="rounded-xl text-sm font-semibold">
                        {minutes} mins
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-3">
                {alertShipments.length > 0 ? (
                  alertShipments.map((shipment) => (
                    <button
                      key={shipment.id}
                      type="button"
                      onClick={() => setSelectedShipmentId(shipment.id)}
                      className="w-full rounded-2xl border border-red-100 bg-white p-4 text-left transition-colors hover:bg-red-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[#041614]">{shipment.id}</p>
                          <p className="mt-1 text-xs font-bold text-red-600">{shipment.driver}</p>
                        </div>
                        <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
                          {formatIdleMinutes(shipment.idleMinutes)}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-red-100 bg-white p-4 text-sm font-bold text-red-600/70">
                    No shipments have exceeded the selected threshold.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-[#39B5A8]/10 bg-[#F0F9F8] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39B5A8]">Selected Driver Pin</p>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#041614]">{selectedShipment.id}</h2>
                  <p className="mt-1 text-sm font-bold text-[#1A5D56]/70">{selectedShipment.vehicle}</p>
                </div>
                <StatusPill status={selectedShipment.status} />
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4">
                <p className="text-sm font-black text-[#041614]">{selectedShipment.driver}</p>
                <p className="mt-1 text-xs font-bold text-[#1A5D56]/60">{selectedShipment.phone}</p>
                <button className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#39B5A8]/15 px-3 py-2 text-xs font-black text-[#39B5A8] transition-colors hover:bg-[#F0F9F8]">
                  <Phone className="h-3.5 w-3.5" /> Contact Driver
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-[#39B5A8]/10 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39B5A8]">Route Progress</p>
              <div className="mt-5 space-y-4">
                <RoutePoint label="Pickup" value={selectedShipment.from} tone="bg-emerald-500" />
                <div className="ml-2 h-8 border-l border-dashed border-[#39B5A8]/40" />
                <RoutePoint label="Drop-off" value={selectedShipment.to} tone="bg-red-500" />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-black text-[#1A5D56]">
                  <span>Progress</span>
                  <span>{selectedShipment.progress}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#F0F9F8]">
                  <div className="h-full rounded-full bg-[#39B5A8]" style={{ width: `${selectedShipment.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat icon={<Clock className="h-4 w-4" />} label="ETA" value={selectedShipment.eta} />
              <MiniStat icon={<Navigation className="h-4 w-4" />} label="Distance" value={selectedShipment.distance} />
              <MiniStat icon={<MapPin className="h-4 w-4" />} label="Region" value={selectedShipment.region} />
              <MiniStat icon={<AlertCircle className="h-4 w-4" />} label="Updated" value={selectedShipment.lastUpdate} />
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39B5A8]">Active Pins</p>
                <span className="rounded-full border border-[#39B5A8]/10 bg-[#F0F9F8] px-3 py-1 text-[10px] font-black text-[#39B5A8]">
                  {filteredShipments.length}
                </span>
              </div>
              <div className="space-y-3">
                {filteredShipments.map((shipment) => (
                  <button
                    key={shipment.id}
                    type="button"
                    onClick={() => setSelectedShipmentId(shipment.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedShipment.id === shipment.id
                        ? 'border-[#39B5A8]/30 bg-[#F0F9F8]'
                        : 'border-[#39B5A8]/10 bg-white hover:bg-[#F0F9F8]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#041614]">{shipment.id}</p>
                        <p className="mt-1 text-xs font-bold text-[#1A5D56]/60">{shipment.driver}</p>
                      </div>
                      <StatusPill status={shipment.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: LiveShipment['status'] }) {
  const classes: Record<LiveShipment['status'], string> = {
    'On Route': 'border-emerald-100 bg-emerald-50 text-emerald-600',
    Delayed: 'border-amber-100 bg-amber-50 text-amber-600',
    Idle: 'border-red-100 bg-red-50 text-red-600',
  };

  return <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${classes[status]}`}>{status}</span>;
}

function MapLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-xs font-black text-[#1A5D56]">{label}</span>
    </div>
  );
}

function RoutePoint({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-1 h-4 w-4 rounded-full border-2 border-white shadow ${tone}`} />
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#39B5A8]">{label}</p>
        <p className="mt-1 text-sm font-bold leading-5 text-[#041614]">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#39B5A8]/10 bg-[#F0F9F8] p-4">
      <div className="text-[#39B5A8]">{icon}</div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#39B5A8]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#041614]">{value}</p>
    </div>
  );
}

function getPinPosition(shipment: LiveShipment) {
  const minLat = 14.59;
  const maxLat = 14.64;
  const minLng = 120.975;
  const maxLng = 121.01;
  const left = ((shipment.lng - minLng) / (maxLng - minLng)) * 74 + 12;
  const top = (1 - (shipment.lat - minLat) / (maxLat - minLat)) * 62 + 18;

  return {
    left: Math.min(88, Math.max(12, left)),
    top: Math.min(82, Math.max(18, top)),
  };
}

function getPinTone(status: LiveShipment['status']) {
  const tones: Record<LiveShipment['status'], string> = {
    'On Route': 'bg-[#39B5A8]',
    Delayed: 'bg-amber-500',
    Idle: 'bg-red-500',
  };

  return tones[status];
}

function formatIdleMinutes(minutes: number) {
  if (minutes <= 0) {
    return 'Live';
  }

  return `${minutes} min idle`;
}
