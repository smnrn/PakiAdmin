import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '../../lib/router';
import {
  CalendarDays,
  Filter,
  Download,
  Search,
  Truck,
  User,
  ChevronDown,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';

// Change const shipments to useState
const [shipments, setShipments] = useState<ShipmentRecord[]>([
  {
    id: 'PKS-2026-120',
    store: '7-Eleven P. Noval',
    sender: 'Miguel Santos',
    receiver: 'Carla Mendoza',
    location: '1043 P. Noval St, Sampaloc, Manila',
    destination: '2412 Dapita n St., Sampaloc, Manila',
    quantity: '450 Units',
    amount: '12,500',
    status: 'In Transit',
    driver: 'John Salazar',
    eta: '12 mins',
    date: 'Apr 16, 2026',
  },
  // ... other shipment objects remain unchanged
]);

// State for dialog
const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [newStatus, setNewStatus] = useState<string>('');
const [reason, setReason] = useState<string>('');

const openStatusDialog = (shipment: ShipmentRecord) => {
  setSelectedShipment(shipment);
  setNewStatus(shipment.status);
  setReason('');
  setIsDialogOpen(true);
};

const handleStatusUpdate = () => {
  if (!selectedShipment) return;
  if (!reason.trim()) {
    toast.error('Reason is required');
    return;
  }
  setShipments((prev) =>
    prev.map((s) =>
      s.id === selectedShipment.id ? { ...s, status: newStatus as any } : s
    )
  );
  toast.success(`Shipment status updated to ${newStatus}`);
  setIsDialogOpen(false);
};
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';

interface ShipmentRecord {
  id: string;
  store: string;
  sender: string;
  receiver: string;
  location: string;
  destination: string;
  quantity: string;
  amount: string;
  status: 'In Transit' | 'Pending' | 'Delivered';
  driver: string;
  eta: string;
  date: string;
}

export default function ShipmentsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All Drivers');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const placeholderName = 'Juan Dela Cruz';
  const shipmentsPerPage = 6;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [shipments, setShipments] = useState<ShipmentRecord[]>([
    {
      id: 'PKS-2026-120',
      store: '7-Eleven P. Noval',
      sender: 'Miguel Santos',
      receiver: 'Carla Mendoza',
      location: '1043 P. Noval St, Sampaloc, Manila',
      destination: '2412 Dapita n St., Sampaloc, Manila',
      quantity: '450 Units',
      amount: '12,500',
      status: 'In Transit',
      driver: 'John Salazar',
      eta: '12 mins',
      date: 'Apr 16, 2026',
    },
    // ... other shipment objects remain unchanged
  ]);

  // Dialog state
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const openStatusDialog = (shipment: ShipmentRecord) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setReason('');
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedShipment) return;
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setShipments((prev) =>
      prev.map((s) => (s.id === selectedShipment.id ? { ...s, status: newStatus as any } : s))
    );
    toast.success(`Shipment status updated to ${newStatus}`);
    setIsDialogOpen(false);
  };
    {
      id: 'PKS-2026-120',
      store: '7-Eleven P. Noval',
      sender: 'Miguel Santos',
      receiver: 'Carla Mendoza',
      location: '1043 P. Noval St, Sampaloc, Manila',
      destination: '2412 Dapitan St., Sampaloc, Manila',
      quantity: '450 Units',
      amount: '12,500',
      status: 'In Transit',
      driver: 'John Salazar',
      eta: '12 mins',
      date: 'Apr 16, 2026',
    },
    {
      id: 'PKS-2026-128',
      store: 'Lawson Lacson Ave',
      sender: 'Alyssa Garcia',
      receiver: 'Noel Ramirez',
      location: 'Ground Floor, AH Lacson Ave, Manila',
      destination: '1558 Espana Blvd, Corner Arsenio St.',
      quantity: '1,240 Units',
      amount: '27,510',
      status: 'Pending',
      driver: 'Unassigned',
      eta: 'N/A',
      date: 'Apr 16, 2026',
    },
    {
      id: 'PKS-2026-220',
      store: 'Alfamart Dapitan',
      sender: 'Rico Tan',
      receiver: 'Bea Flores',
      location: '1221 Dapitan St, Sampaloc, Manila',
      destination: '88 Cavite St., Sta. Cruz, Manila',
      quantity: '850 Units',
      amount: '14,240',
      status: 'Delivered',
      driver: 'Maria Reyes',
      eta: 'Delivered',
      date: 'Apr 15, 2026',
    },
    {
      id: 'PKS-2026-222',
      store: "Uncle John's Asturias",
      sender: 'Monique Cruz',
      receiver: 'Lester Villanueva',
      location: 'Asturias St, Sampaloc, Manila',
      destination: '412 Laon Laan St., Sampaloc',
      quantity: '183 Units',
      amount: '23,870',
      status: 'In Transit',
      driver: 'Mark Gonzales',
      eta: '8 mins',
      date: 'Apr 16, 2026',
    },
    {
      id: 'PKS-2026-101',
      store: '7-Eleven Espana',
      sender: 'Paolo Dizon',
      receiver: 'Jessa Rivera',
      location: 'Espana Blvd cor. Moret St, Manila',
      destination: '702 Quezon Blvd, Quiapo, Manila',
      quantity: '624 Units',
      amount: '18,920',
      status: 'In Transit',
      driver: 'Anna Martinez',
      eta: '15 mins',
      date: 'Apr 16, 2026',
    },
    {
      id: 'PKS-2026-145',
      store: 'Mini Stop Lerma',
      sender: 'Theo Bautista',
      receiver: 'Dianne Lopez',
      location: 'Lerma St, Sampaloc, Manila',
      destination: '523 Recto Ave., Quiapo, Manila',
      quantity: '310 Units',
      amount: '9,780',
      status: 'Delivered',
      driver: 'Jose Navarro',
      eta: 'Delivered',
      date: 'Apr 14, 2026',
    },
    {
      id: 'PKS-2026-149',
      store: 'Dali Laon Laan',
      sender: 'Kristine Ramos',
      receiver: 'Marco David',
      location: 'Laon Laan Rd, Sampaloc, Manila',
      destination: '1200 Blumentritt Rd, Manila',
      quantity: '560 Units',
      amount: '16,300',
      status: 'Pending',
      driver: 'Unassigned',
      eta: 'N/A',
      date: 'Apr 17, 2026',
    },
    {
      id: 'PKS-2026-151',
      store: 'Savemore UST',
      sender: 'Nico Fernandez',
      receiver: 'Patricia Ong',
      location: 'Lacson Ave near UST, Manila',
      destination: '99 Banawe St., Quezon City',
      quantity: '720 Units',
      amount: '21,450',
      status: 'In Transit',
      driver: 'Leo Castillo',
      eta: '19 mins',
      date: 'Apr 17, 2026',
    },
    {
      id: 'PKS-2026-167',
      store: 'Robinsons Otis',
      sender: 'Faith Herrera',
      receiver: 'Kevin Yu',
      location: 'Otis St, Paco, Manila',
      destination: '1440 Taft Ave., Malate, Manila',
      quantity: '405 Units',
      amount: '11,980',
      status: 'Delivered',
      driver: 'Grace Morales',
      eta: 'Delivered',
      date: 'Apr 13, 2026',
    },
    {
      id: 'PKS-2026-171',
      store: 'SM San Lazaro',
      sender: 'Harvey Lim',
      receiver: 'Rachel Co',
      location: 'Felix Huertas Rd, Santa Cruz, Manila',
      destination: '311 Fugoso St., Sampaloc, Manila',
      quantity: '980 Units',
      amount: '28,740',
      status: 'In Transit',
      driver: 'Daniel Torres',
      eta: '22 mins',
      date: 'Apr 17, 2026',
    },
    {
      id: 'PKS-2026-176',
      store: 'Mercury Espana',
      sender: 'Janelle Reyes',
      receiver: 'Oscar Medina',
      location: 'Espana Blvd, Sampaloc, Manila',
      destination: '212 Morayta St., Manila',
      quantity: '275 Units',
      amount: '7,920',
      status: 'Pending',
      driver: 'Unassigned',
      eta: 'N/A',
      date: 'Apr 17, 2026',
    },
    {
      id: 'PKS-2026-181',
      store: 'Puregold Tayuman',
      sender: 'Leah Cortes',
      receiver: 'Ramon Guevarra',
      location: 'Tayuman St, Tondo, Manila',
      destination: '210 Dimasalang Rd, Manila',
      quantity: '512 Units',
      amount: '13,860',
      status: 'Delivered',
      driver: 'Cesar Pineda',
      eta: 'Delivered',
      date: 'Apr 12, 2026',
    },
  ];

  const driverOptions = ['All Drivers', ...Array.from(new Set(shipments.map((shipment) => shipment.driver)))];
  const activeFilterCount = [
    bookingSearchQuery.trim().length > 0,
    statusFilter !== 'All',
    driverFilter !== 'All Drivers',
    startDateFilter.length > 0,
    endDateFilter.length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setBookingSearchQuery('');
    setStatusFilter('All');
    setDriverFilter('All Drivers');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const filteredShipments = useMemo(() => {
    const normalizeFilterDate = (value: string) => {
      if (!value) {
        return null;
      }

      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    };

    const parseShipmentDate = (value: string) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const startDate = normalizeFilterDate(startDateFilter);
    const endDate = normalizeFilterDate(endDateFilter);
    const rangeStart = startDate && endDate && startDate > endDate ? endDate : startDate;
    const rangeEnd = startDate && endDate && startDate > endDate ? startDate : endDate;

    return shipments.filter((shipment) => {
      const query = bookingSearchQuery.trim().toLowerCase();
      const matchesSearch = shipment.id.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || shipment.status === statusFilter;
      const matchesDriver = driverFilter === 'All Drivers' || shipment.driver === driverFilter;
      const shipmentDate = parseShipmentDate(shipment.date);
      const matchesDateRange =
        shipmentDate !== null &&
        (rangeStart === null || shipmentDate >= rangeStart) &&
        (rangeEnd === null || shipmentDate <= rangeEnd);

      return matchesSearch && matchesStatus && matchesDriver && matchesDateRange;
    });
  }, [bookingSearchQuery, driverFilter, endDateFilter, startDateFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / shipmentsPerPage));

  const paginatedShipments = useMemo(() => {
    const startIndex = (currentPage - 1) * shipmentsPerPage;
    return filteredShipments.slice(startIndex, startIndex + shipmentsPerPage);
  }, [currentPage, filteredShipments]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [bookingSearchQuery, driverFilter, endDateFilter, startDateFilter, statusFilter]);

  const handleExport = () => {
    const headers = ['Shipment ID', 'Sender', 'Receiver', 'Store', 'Destination', 'Assigned Driver', 'Shipment Value', 'Status', 'Date'];
    const csvData = filteredShipments.map((shipment) => [
      shipment.id,
      shipment.sender,
      shipment.receiver,
      shipment.store,
      shipment.destination,
      shipment.driver,
      shipment.amount,
      shipment.status,
      shipment.date,
    ]);
    const csvContent = `data:text/csv;charset=utf-8,${[headers, ...csvData].map((row) => row.join(',')).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pakiship-all-shipments-${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exporting shipments to CSV...');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F9F8] font-sans text-[#1A5D56]">
      <PakiShipSidebar activeTab="shipments" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#39B5A8]/10 bg-white/80 px-10 backdrop-blur-md">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#39B5A8]">Operations Console</p>
            <p className="mt-1 text-sm font-semibold text-[#1A5D56]/70">Monitor bookings, assignments, and shipment progress in one place.</p>
          </div>

          <div className="flex items-center gap-6">
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

        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#041614]">PakiShip Shipments</h1>
              <p className="font-medium italic text-[#1A5D56] opacity-70">
                Monitor and manage all shipments across the system with a unified operations table.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleExport}
                className="rounded-xl bg-[#39B5A8] font-bold text-white shadow-lg shadow-[#39B5A8]/20 hover:bg-[#2F9D91]"
              >
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white shadow-sm">
            <CardHeader className="p-10 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-[#041614]">All Shipments</CardTitle>
                  <p className="mt-1 text-sm font-medium text-[#1A5D56]/65">
                    Sender, receiver, assigned driver, shipment status, and shipment value in one paginated view.
                  </p>
                </div>
                <div className="rounded-full border border-[#39B5A8]/10 bg-[#F0F9F8] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                  {filteredShipments.length} Records
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-[#39B5A8]/10 bg-[#F0F9F8]/70 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-[#39B5A8]" />
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1A5D56]">Shipment Lookup</p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[#1A5D56]/65">
                      Search by booking ID and narrow results by shipment status, schedule, and assigned driver.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-start lg:self-center">
                    {activeFilterCount > 0 && (
                      <div className="rounded-full border border-[#39B5A8]/10 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                        {activeFilterCount} Active Filters
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      disabled={activeFilterCount === 0}
                      className="rounded-xl border-[#39B5A8]/15 bg-white font-bold text-[#1A5D56] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="mr-2 h-4 w-4" /> Clear Filters
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
                  <div className="xl:col-span-1">
                    <label htmlFor="booking-search" className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                      Booking ID
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                      <Input
                        id="booking-search"
                        type="text"
                        value={bookingSearchQuery}
                        onChange={(event) => setBookingSearchQuery(event.target.value)}
                        placeholder="Search by booking ID"
                        className="h-12 rounded-2xl border-[#39B5A8]/10 bg-white pl-11 pr-4 text-sm font-semibold text-[#041614] placeholder:text-[#39B5A8]/35 focus-visible:border-[#39B5A8]/30 focus-visible:ring-[#39B5A8]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="status-filter" className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                      Status
                    </label>
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="h-12 w-full appearance-none rounded-2xl border border-[#39B5A8]/10 bg-white pl-11 pr-10 text-sm font-semibold text-[#041614] outline-none transition-all focus:border-[#39B5A8]/30 focus:ring-4 focus:ring-[#39B5A8]/15"
                      >
                        {['All', 'In Transit', 'Pending', 'Delivered'].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="driver-filter" className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                      Assigned Driver
                    </label>
                    <div className="relative">
                      <Truck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                      <select
                        id="driver-filter"
                        value={driverFilter}
                        onChange={(event) => setDriverFilter(event.target.value)}
                        className="h-12 w-full appearance-none rounded-2xl border border-[#39B5A8]/10 bg-white pl-11 pr-10 text-sm font-semibold text-[#041614] outline-none transition-all focus:border-[#39B5A8]/30 focus:ring-4 focus:ring-[#39B5A8]/15"
                      >
                        {driverOptions.map((driver) => (
                          <option key={driver} value={driver}>
                            {driver}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="start-date-filter" className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                      Start Date
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                      <Input
                        id="start-date-filter"
                        type="date"
                        value={startDateFilter}
                        onChange={(event) => setStartDateFilter(event.target.value)}
                        className="h-12 rounded-2xl border-[#39B5A8]/10 bg-white pl-11 pr-4 text-sm font-semibold text-[#041614] focus-visible:border-[#39B5A8]/30 focus-visible:ring-[#39B5A8]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="end-date-filter" className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#39B5A8]">
                      End Date
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#39B5A8]/60" />
                      <Input
                        id="end-date-filter"
                        type="date"
                        value={endDateFilter}
                        onChange={(event) => setEndDateFilter(event.target.value)}
                        className="h-12 rounded-2xl border-[#39B5A8]/10 bg-white pl-11 pr-4 text-sm font-semibold text-[#041614] focus-visible:border-[#39B5A8]/30 focus-visible:ring-[#39B5A8]/15"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#39B5A8]">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#39B5A8]/5">
        {paginatedShipments.length > 0 ? (
          paginatedShipments.map((shipment) => (
            <tr key={shipment.id} className="group cursor-pointer transition-colors hover:bg-[#F0F9F8]/30" onClick={() => navigate(`/pakiship/shipments/${shipment.id}`)}>
              <td className="px-8 py-6">
                <p className="text-xs font-bold text-[#041614]">{shipment.id}</p>
                <p className="mt-1 text-xs font-black text-[#041614] group-hover:text-[#39B5A8]">{shipment.store}</p>
                <p className="text-[10px] font-medium text-gray-400">{shipment.date}</p>
              </td>
              <td className="px-6 py-6">
                <p className="text-xs font-bold text-[#1A5D56]">{shipment.sender}</p>
                <p className="max-w-[220px] truncate text-[10px] text-gray-400">{shipment.location}</p>
              </td>
              <td className="px-6 py-6">
                <p className="text-xs font-bold text-[#1A5D56]">{shipment.receiver}</p>
                <p className="max-w-[220px] truncate text-[10px] text-gray-400">{shipment.destination}</p>
              </td>
              <td className="px-6 py-6">
                <p className="text-xs font-bold text-[#1A5D56]">{shipment.driver}</p>
                <p className="text-[10px] font-bold text-[#39B5A8]">ETA: {shipment.eta}</p>
              </td>
              <td className="px-6 py-6">
                <p className="text-xs font-black text-[#1A5D56]">PHP {shipment.amount}</p>
                <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400">{shipment.quantity}</p>
              </td>
              <td className="px-8 py-6 text-center">
                <span
                  className={`inline-flex items-center justify-center rounded-lg border px-3 py-1 text-[10px] font-black uppercase ${
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
              <td className="px-4 py-6 text-center">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openStatusDialog(shipment); }}>Update</Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-10 py-20 text-center">
              <div className="flex flex-col items-center gap-2 opacity-30">
                <Search className="h-8 w-8" />
                <p className="text-sm font-black uppercase tracking-widest text-[#1A5D56]">No Shipments Found</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  {/* Status Update Dialog */}
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogDescription>Provide a new status and a mandatory reason.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Select value={newStatus} onValueChange={setNewStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          placeholder="Reason for status change"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="resize-none"
        />
      </div>
      <DialogFooter>
        <Button onClick={handleStatusUpdate}>Submit</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

                  <tbody className="divide-y divide-[#39B5A8]/5">
                    {paginatedShipments.length > 0 ? (
                      paginatedShipments.map((shipment) => (
                        <tr key={shipment.id} className="group cursor-pointer transition-colors hover:bg-[#F0F9F8]/30" onClick={() => navigate(`/pakiship/shipments/${shipment.id}`)}>
                          <td className="px-8 py-6">
                            <p className="text-xs font-bold text-[#041614]">{shipment.id}</p>
                            <p className="mt-1 text-xs font-black text-[#041614] group-hover:text-[#39B5A8]">{shipment.store}</p>
                            <p className="text-[10px] font-medium text-gray-400">{shipment.date}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-xs font-bold text-[#1A5D56]">{shipment.sender}</p>
                            <p className="max-w-[220px] truncate text-[10px] text-gray-400">{shipment.location}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-xs font-bold text-[#1A5D56]">{shipment.receiver}</p>
                            <p className="max-w-[220px] truncate text-[10px] text-gray-400">{shipment.destination}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-xs font-bold text-[#1A5D56]">{shipment.driver}</p>
                            <p className="text-[10px] font-bold text-[#39B5A8]">ETA: {shipment.eta}</p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-xs font-black text-[#1A5D56]">PHP {shipment.amount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400">{shipment.quantity}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-lg border px-3 py-1 text-[10px] font-black uppercase ${
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
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-10 py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <Search className="h-8 w-8" />
                            <p className="text-sm font-black uppercase tracking-widest text-[#1A5D56]">No Shipments Found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-[#39B5A8]/5 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-[#1A5D56]/70">
                  Showing {(currentPage - 1) * shipmentsPerPage + (paginatedShipments.length > 0 ? 1 : 0)}-
                  {(currentPage - 1) * shipmentsPerPage + paginatedShipments.length} of {filteredShipments.length} shipments
                </p>

                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage((page) => page - 1);
                          }
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'text-[#1A5D56]'}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(event) => {
                            event.preventDefault();
                            setCurrentPage(page);
                          }}
                          className={
                            currentPage === page
                              ? 'border-[#39B5A8]/20 bg-[#F0F9F8] text-[#39B5A8]'
                              : 'text-[#1A5D56]'
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage((page) => page + 1);
                          }
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'text-[#1A5D56]'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
