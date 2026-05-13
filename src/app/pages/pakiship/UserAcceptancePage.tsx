import { useState } from 'react';
import { useNavigate } from '../../lib/router';
import {
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
  X,
  FileText,
  Mail,
  Phone,
  Calendar,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Users,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';
import { pakiParkLogo, pakiShipLogo } from '../../lib/assets';

type ApplicantType = 'driver' | 'business';
type StatusType = 'pending' | 'approved' | 'rejected';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ApplicantType;
  applicationDate: string;
  documentCount: number;
  status: StatusType;
  vehicleType?: string;
  plateNumber?: string;
  businessName?: string;
  businessType?: string;
  documents: Document[];
}

interface Document {
  name: string;
  size: string;
  uploadDate: string;
  url: string;
}

export default function UserAcceptancePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ApplicantType>('driver');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const placeholderName = "Juan Dela Cruz";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock data
  const applicants: Applicant[] = [
    {
      id: 'DRV-001',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63 917 123 4567',
      type: 'driver',
      applicationDate: '2026-04-25',
      documentCount: 4,
      status: 'pending',
      vehicleType: 'Motorcycle',
      plateNumber: 'ABC 1234',
      documents: [
        { name: 'Driver\'s License', size: '2.3 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Vehicle Registration', size: '1.8 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Insurance', size: '1.2 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'NBI Clearance', size: '3.1 MB', uploadDate: '2026-04-25', url: '#' },
      ],
    },
    {
      id: 'DRV-002',
      name: 'Carlos Reyes',
      email: 'carlos.reyes@email.com',
      phone: '+63 918 234 5678',
      type: 'driver',
      applicationDate: '2026-04-24',
      documentCount: 4,
      status: 'approved',
      vehicleType: 'Van',
      plateNumber: 'XYZ 5678',
      documents: [
        { name: 'Driver\'s License', size: '2.1 MB', uploadDate: '2026-04-24', url: '#' },
        { name: 'Vehicle Registration', size: '1.9 MB', uploadDate: '2026-04-24', url: '#' },
        { name: 'Insurance', size: '1.5 MB', uploadDate: '2026-04-24', url: '#' },
        { name: 'NBI Clearance', size: '2.8 MB', uploadDate: '2026-04-24', url: '#' },
      ],
    },
    {
      id: 'DRV-003',
      name: 'Juan Cruz',
      email: 'juan.cruz@email.com',
      phone: '+63 919 345 6789',
      type: 'driver',
      applicationDate: '2026-04-23',
      documentCount: 3,
      status: 'rejected',
      vehicleType: 'Motorcycle',
      plateNumber: 'DEF 9012',
      documents: [
        { name: 'Driver\'s License', size: '2.0 MB', uploadDate: '2026-04-23', url: '#' },
        { name: 'Vehicle Registration', size: '1.7 MB', uploadDate: '2026-04-23', url: '#' },
        { name: 'Insurance', size: '1.3 MB', uploadDate: '2026-04-23', url: '#' },
      ],
    },
    {
      id: 'BIZ-001',
      name: 'Ana Garcia',
      email: 'ana.garcia@business.com',
      phone: '+63 920 456 7890',
      type: 'business',
      applicationDate: '2026-04-26',
      documentCount: 5,
      status: 'pending',
      businessName: 'Garcia Enterprises',
      businessType: 'Retail',
      documents: [
        { name: 'DTI Registration', size: '2.5 MB', uploadDate: '2026-04-26', url: '#' },
        { name: 'Mayor\'s Permit', size: '2.2 MB', uploadDate: '2026-04-26', url: '#' },
        { name: 'BIR Certificate', size: '1.9 MB', uploadDate: '2026-04-26', url: '#' },
        { name: 'Business Profile', size: '3.5 MB', uploadDate: '2026-04-26', url: '#' },
        { name: 'Valid ID', size: '1.4 MB', uploadDate: '2026-04-26', url: '#' },
      ],
    },
    {
      id: 'BIZ-002',
      name: 'Roberto Tan',
      email: 'roberto.tan@shop.com',
      phone: '+63 921 567 8901',
      type: 'business',
      applicationDate: '2026-04-25',
      documentCount: 5,
      status: 'approved',
      businessName: 'Tan\'s Store',
      businessType: 'Food & Beverage',
      documents: [
        { name: 'DTI Registration', size: '2.4 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Mayor\'s Permit', size: '2.1 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'BIR Certificate', size: '1.8 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Business Profile', size: '3.2 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Valid ID', size: '1.5 MB', uploadDate: '2026-04-25', url: '#' },
      ],
    },
  ];

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.type === activeTab &&
      (statusFilter === 'all' || applicant.status === statusFilter)
  );

  const statusCounts = {
    pending: applicants.filter((a) => a.type === activeTab && a.status === 'pending').length,
    approved: applicants.filter((a) => a.type === activeTab && a.status === 'approved').length,
    rejected: applicants.filter((a) => a.type === activeTab && a.status === 'rejected').length,
  };

  const handleApprove = (applicantId: string) => {
    console.log('Approved:', applicantId);
    setSelectedApplicant(null);
  };

  const handleReject = (applicantId: string) => {
    console.log('Rejected:', applicantId);
    setSelectedApplicant(null);
  };

  return (
    <div className="flex h-screen bg-[#F0F9F8] font-sans text-[#1A5D56]">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #F0F9F8; }
        ::-webkit-scrollbar-thumb { background: #39B5A833; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #39B5A866; }
      `}} />

      <PakiShipSidebar activeTab="user-acceptance" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- NAVBAR --- */}
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
                placeholder="Search applicants..."
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
                  <button onClick={() => { setIsUserMenuOpen(false); navigate('/pakiship/profile'); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left">
                    <User className="w-4 h-4 text-[#39B5A8]" />
                    <span className="font-semibold text-[#041614]">Profile</span>
                  </button>
                  <button onClick={() => { setIsUserMenuOpen(false); navigate('/pakiship/settings'); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left">
                    <Settings className="w-4 h-4 text-[#39B5A8]" />
                    <span className="font-semibold text-[#041614]">Settings</span>
                  </button>
                  <div className="border-t border-[#39B5A8]/10"></div>
                  <button onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-left">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-500">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <section>
            <h1 className="text-3xl font-bold text-[#041614] tracking-tight">User Acceptance</h1>
            <p className="text-[#1A5D56] opacity-70 font-medium italic">Review and approve driver and business owner applications.</p>
          </section>

          {/* --- STATUS SUMMARY CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-[#39B5A8]/10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-3xl font-black text-[#041614]">{statusCounts.pending}</span>
              </div>
              <p className="text-[10px] font-bold text-[#39B5A8] uppercase tracking-[0.15em]">Pending Review</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Awaiting approval decision</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-[#39B5A8]/10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-3xl font-black text-[#041614]">{statusCounts.approved}</span>
              </div>
              <p className="text-[10px] font-bold text-[#39B5A8] uppercase tracking-[0.15em]">Approved</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Successfully accepted</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-[#39B5A8]/10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="text-3xl font-black text-[#041614]">{statusCounts.rejected}</span>
              </div>
              <p className="text-[10px] font-bold text-[#39B5A8] uppercase tracking-[0.15em]">Rejected</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Applications declined</p>
            </div>
          </div>

          {/* --- TABS AND FILTERS --- */}
          <div className="bg-white p-6 rounded-[2rem] border border-[#39B5A8]/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('driver')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'driver'
                      ? 'bg-[#F0F9F8] text-[#39B5A8] shadow-sm'
                      : 'text-gray-400 hover:text-[#1A5D56] hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Drivers
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'business'
                      ? 'bg-[#F0F9F8] text-[#39B5A8] shadow-sm'
                      : 'text-gray-400 hover:text-[#1A5D56] hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Business Owners
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8] hover:bg-[#39B5A8]/5 transition-all font-semibold text-sm text-[#1A5D56]"
                >
                  Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#39B5A8]/10 overflow-hidden z-20">
                    <button
                      onClick={() => { setStatusFilter('all'); setIsStatusFilterOpen(false); }}
                      className="w-full px-4 py-2.5 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-sm text-[#041614]"
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setStatusFilter('pending'); setIsStatusFilterOpen(false); }}
                      className="w-full px-4 py-2.5 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-sm text-amber-600"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => { setStatusFilter('approved'); setIsStatusFilterOpen(false); }}
                      className="w-full px-4 py-2.5 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-sm text-emerald-600"
                    >
                      Approved
                    </button>
                    <button
                      onClick={() => { setStatusFilter('rejected'); setIsStatusFilterOpen(false); }}
                      className="w-full px-4 py-2.5 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-sm text-red-600"
                    >
                      Rejected
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- APPLICANTS TABLE --- */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F0F9F8]/50 border-b border-[#39B5A8]/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Applicant</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Application Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest text-center">Documents</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#39B5A8]/5">
                  {filteredApplicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      onClick={() => setSelectedApplicant(applicant)}
                      className="hover:bg-[#F0F9F8]/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#39B5A8] to-[#1A5D56] rounded-xl flex items-center justify-center text-white font-bold">
                            {applicant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#041614] group-hover:text-[#39B5A8] transition-colors">{applicant.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{applicant.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#1A5D56]">{new Date(applicant.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F9F8] text-[#39B5A8] rounded-full font-bold text-xs">
                          <FileText className="w-3.5 h-3.5" />
                          {applicant.documentCount}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`inline-block whitespace-nowrap text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${
                          applicant.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          applicant.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {applicant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredApplicants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-medium">No applicants found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* --- DETAILED VIEW MODAL --- */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2.5rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#39B5A8]/10 p-8 flex items-center justify-between rounded-t-[2.5rem] z-10">
              <div>
                <h2 className="text-2xl font-bold text-[#041614]">{selectedApplicant.name}</h2>
                <p className="text-sm text-gray-400 font-medium">{selectedApplicant.id}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors"
              >
                <X className="w-6 h-6 text-[#1A5D56]" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Contact Information */}
              <section>
                <h3 className="text-lg font-bold text-[#041614] mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F0F9F8]">
                      <Mail className="w-4 h-4 text-[#39B5A8]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Email</p>
                      <p className="font-semibold text-[#1A5D56]">{selectedApplicant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F0F9F8]">
                      <Phone className="w-4 h-4 text-[#39B5A8]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Phone</p>
                      <p className="font-semibold text-[#1A5D56]">{selectedApplicant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F0F9F8]">
                      <Calendar className="w-4 h-4 text-[#39B5A8]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Application Date</p>
                      <p className="font-semibold text-[#1A5D56]">{new Date(selectedApplicant.applicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Driver/Business Details */}
              {selectedApplicant.type === 'driver' ? (
                <section>
                  <h3 className="text-lg font-bold text-[#041614] mb-4">Driver Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F0F9F8]">
                        <Car className="w-4 h-4 text-[#39B5A8]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Vehicle Type</p>
                        <p className="font-semibold text-[#1A5D56]">{selectedApplicant.vehicleType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F0F9F8]">
                        <FileText className="w-4 h-4 text-[#39B5A8]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Plate Number</p>
                        <p className="font-semibold text-[#1A5D56]">{selectedApplicant.plateNumber}</p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section>
                  <h3 className="text-lg font-bold text-[#041614] mb-4">Business Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F0F9F8]">
                        <Briefcase className="w-4 h-4 text-[#39B5A8]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Business Name</p>
                        <p className="font-semibold text-[#1A5D56]">{selectedApplicant.businessName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F0F9F8]">
                        <FileText className="w-4 h-4 text-[#39B5A8]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Business Type</p>
                        <p className="font-semibold text-[#1A5D56]">{selectedApplicant.businessType}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Submitted Documents */}
              <section>
                <h3 className="text-lg font-bold text-[#041614] mb-4">Submitted Documents</h3>
                <div className="space-y-3">
                  {selectedApplicant.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#F0F9F8] rounded-xl hover:bg-[#39B5A8]/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                          <FileText className="w-5 h-5 text-[#39B5A8]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#041614]">{doc.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-white hover:bg-[#39B5A8]/10 transition-colors">
                          <Eye className="w-4 h-4 text-[#39B5A8]" />
                        </button>
                        <button className="p-2 rounded-lg bg-white hover:bg-[#39B5A8]/10 transition-colors">
                          <Download className="w-4 h-4 text-[#39B5A8]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Buttons */}
              {selectedApplicant.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleApprove(selectedApplicant.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedApplicant.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
