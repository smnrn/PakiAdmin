import { useState, type ReactNode } from 'react';
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
  Store,
  MapPin,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';
import { pakiParkLogo, pakiShipLogo } from '../../lib/assets';
import { getDisplayNameForEmail } from '../../lib/sampleAccounts';

type ApplicantType = 'driver' | 'business';
type AcceptanceTab = ApplicantType | 'dropoff';
type StatusType = 'pending' | 'approved' | 'rejected';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  type: ApplicantType;
  applicationDate: string;
  documentCount: number;
  status: StatusType;
  vehicleType?: string;
  plateNumber?: string;
  businessName?: string;
  businessType?: string;
  accountStatus?: 'inactive' | 'active';
  activatedDate?: string;
  rejectionReason?: string;
  documents: Document[];
}

interface Document {
  name: string;
  size: string;
  uploadDate: string;
  url: string;
}

interface DropOffApplication {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  dateApplied: string;
  status: StatusType;
  platformStatus: 'inactive' | 'active';
  activatedDate?: string;
  rejectionReason?: string;
  businessDocuments: BusinessDocument[];
}

interface BusinessDocument {
  name: string;
  requirement: 'DTI/SEC Registration' | 'Business Permit' | 'Location Proof';
  size: string;
  uploadDate: string;
  url: string;
  verificationStatus: 'submitted' | 'needs_review';
}

const MOCK_DROPOFF_APPLICATIONS: DropOffApplication[] = [
  {
    id: 'APP-001',
    businessName: 'Mabuhay Express Drop-Off',
    ownerName: 'Maria Lourdes Santos',
    email: 'maria.santos@mabuhayexpress.ph',
    phone: '+63 917 482 1039',
    location: 'Makati City, Metro Manila',
    address: 'Unit 4B, Kalayaan Avenue, Barangay Poblacion, Makati City',
    dateApplied: '2026-05-08',
    status: 'pending',
    platformStatus: 'inactive',
    businessDocuments: [
      { name: 'Mabuhay Express DTI Registration.pdf', requirement: 'DTI/SEC Registration', size: '2.4 MB', uploadDate: '2026-05-08', url: '#', verificationStatus: 'submitted' },
      { name: 'Makati Business Permit 2026.pdf', requirement: 'Business Permit', size: '3.1 MB', uploadDate: '2026-05-08', url: '#', verificationStatus: 'submitted' },
      { name: 'Poblacion Lease Agreement.pdf', requirement: 'Location Proof', size: '1.8 MB', uploadDate: '2026-05-08', url: '#', verificationStatus: 'submitted' },
    ],
  },
  {
    id: 'APP-002',
    businessName: 'Cebu Parcel Hub',
    ownerName: 'Roberto Lim',
    email: 'roberto.lim@cebuhub.ph',
    phone: '+63 922 641 5590',
    location: 'Cebu City, Cebu',
    address: 'F. Ramos Street, Barangay Cogon Ramos, Cebu City',
    dateApplied: '2026-05-09',
    status: 'approved',
    platformStatus: 'active',
    activatedDate: '2026-05-10',
    businessDocuments: [
      { name: 'Cebu Parcel Hub SEC Certificate.pdf', requirement: 'DTI/SEC Registration', size: '2.8 MB', uploadDate: '2026-05-09', url: '#', verificationStatus: 'submitted' },
      { name: 'Cebu City Business Permit.pdf', requirement: 'Business Permit', size: '2.6 MB', uploadDate: '2026-05-09', url: '#', verificationStatus: 'submitted' },
      { name: 'F Ramos Utility Bill.pdf', requirement: 'Location Proof', size: '1.2 MB', uploadDate: '2026-05-09', url: '#', verificationStatus: 'submitted' },
    ],
  },
  {
    id: 'APP-003',
    businessName: 'Davao QuickDrop Center',
    ownerName: 'Angela Dizon',
    email: 'angela.dizon@quickdropdavao.ph',
    phone: '+63 915 338 7742',
    location: 'Davao City, Davao del Sur',
    address: 'Door 2, J.P. Laurel Avenue, Bajada, Davao City',
    dateApplied: '2026-05-10',
    status: 'pending',
    platformStatus: 'inactive',
    businessDocuments: [
      { name: 'Davao QuickDrop DTI Certificate.pdf', requirement: 'DTI/SEC Registration', size: '2.2 MB', uploadDate: '2026-05-10', url: '#', verificationStatus: 'submitted' },
      { name: 'Davao Business Permit 2026.pdf', requirement: 'Business Permit', size: '2.9 MB', uploadDate: '2026-05-10', url: '#', verificationStatus: 'submitted' },
      { name: 'Bajada Store Location Photos.pdf', requirement: 'Location Proof', size: '4.3 MB', uploadDate: '2026-05-10', url: '#', verificationStatus: 'needs_review' },
    ],
  },
  {
    id: 'APP-004',
    businessName: 'Iloilo Bayanihan Logistics',
    ownerName: 'Paolo Villanueva',
    email: 'paolo.villanueva@bayanihanlogistics.ph',
    phone: '+63 920 114 8061',
    location: 'Iloilo City, Iloilo',
    address: 'Commission Civil Street, Jaro, Iloilo City',
    dateApplied: '2026-05-11',
    status: 'rejected',
    platformStatus: 'inactive',
    rejectionReason: 'Business permit document was unreadable during review.',
    businessDocuments: [
      { name: 'Iloilo Bayanihan DTI Registration.pdf', requirement: 'DTI/SEC Registration', size: '2.1 MB', uploadDate: '2026-05-11', url: '#', verificationStatus: 'submitted' },
      { name: 'Iloilo Business Permit Scan.pdf', requirement: 'Business Permit', size: '640 KB', uploadDate: '2026-05-11', url: '#', verificationStatus: 'needs_review' },
      { name: 'Jaro Rental Contract.pdf', requirement: 'Location Proof', size: '1.6 MB', uploadDate: '2026-05-11', url: '#', verificationStatus: 'submitted' },
    ],
  },
  {
    id: 'APP-005',
    businessName: 'Baguio Pine Drop-Off',
    ownerName: 'Elena Cruz',
    email: 'elena.cruz@pinedrop.ph',
    phone: '+63 918 775 0204',
    location: 'Baguio City, Benguet',
    address: 'Lower Session Road, Barangay Salud Mitra, Baguio City',
    dateApplied: '2026-05-12',
    status: 'pending',
    platformStatus: 'inactive',
    businessDocuments: [
      { name: 'Baguio Pine DTI Certificate.pdf', requirement: 'DTI/SEC Registration', size: '2.0 MB', uploadDate: '2026-05-12', url: '#', verificationStatus: 'submitted' },
      { name: 'Baguio City Business Permit.pdf', requirement: 'Business Permit', size: '2.7 MB', uploadDate: '2026-05-12', url: '#', verificationStatus: 'submitted' },
      { name: 'Session Road Location Proof.pdf', requirement: 'Location Proof', size: '1.9 MB', uploadDate: '2026-05-12', url: '#', verificationStatus: 'submitted' },
    ],
  },
  {
    id: 'APP-006',
    businessName: 'Quezon City Padala Point',
    ownerName: 'Mark Anthony Reyes',
    email: 'mark.reyes@padalapoint.ph',
    phone: '+63 927 551 6632',
    location: 'Quezon City, Metro Manila',
    address: 'Tomas Morato Avenue, Barangay Sacred Heart, Quezon City',
    dateApplied: '2026-05-13',
    status: 'approved',
    platformStatus: 'active',
    activatedDate: '2026-05-14',
    businessDocuments: [
      { name: 'Padala Point SEC Registration.pdf', requirement: 'DTI/SEC Registration', size: '3.0 MB', uploadDate: '2026-05-13', url: '#', verificationStatus: 'submitted' },
      { name: 'QC Business Permit.pdf', requirement: 'Business Permit', size: '2.5 MB', uploadDate: '2026-05-13', url: '#', verificationStatus: 'submitted' },
      { name: 'Tomas Morato Lease Contract.pdf', requirement: 'Location Proof', size: '1.7 MB', uploadDate: '2026-05-13', url: '#', verificationStatus: 'submitted' },
    ],
  },
];

export default function UserAcceptancePage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AcceptanceTab>('driver');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [dropOffApplications, setDropOffApplications] = useState<DropOffApplication[]>(MOCK_DROPOFF_APPLICATIONS);
  const [selectedDropOffApplication, setSelectedDropOffApplication] = useState<DropOffApplication | null>(null);
  const [showApplicantRejectModal, setShowApplicantRejectModal] = useState(false);
  const [showDropOffRejectModal, setShowDropOffRejectModal] = useState(false);
  const [dropOffRejectionReason, setDropOffRejectionReason] = useState('');
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const placeholderName = getDisplayNameForEmail(user?.email, "Juan Dela Cruz");

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock data
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 'DRV-001',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63 917 123 4567',
      region: 'Makati City, Metro Manila',
      type: 'driver',
      applicationDate: '2026-04-25',
      documentCount: 4,
      status: 'pending',
      accountStatus: 'inactive',
      vehicleType: 'Motorcycle',
      plateNumber: 'ABC 1234',
      documents: [
        { name: 'Driver\'s License', size: '2.3 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Government ID', size: '1.8 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'Vehicle Registration', size: '1.8 MB', uploadDate: '2026-04-25', url: '#' },
        { name: 'NBI Clearance', size: '3.1 MB', uploadDate: '2026-04-25', url: '#' },
      ],
    },
    {
      id: 'DRV-002',
      name: 'Carlos Reyes',
      email: 'carlos.reyes@email.com',
      phone: '+63 918 234 5678',
      region: 'Cebu City, Cebu',
      type: 'driver',
      applicationDate: '2026-04-24',
      documentCount: 4,
      status: 'approved',
      accountStatus: 'active',
      activatedDate: '2026-04-24',
      vehicleType: 'Van',
      plateNumber: 'XYZ 5678',
      documents: [
        { name: 'Driver\'s License', size: '2.1 MB', uploadDate: '2026-04-24', url: '#' },
        { name: 'Government ID', size: '1.6 MB', uploadDate: '2026-04-24', url: '#' },
        { name: 'Vehicle Registration', size: '1.9 MB', uploadDate: '2026-04-24', url: '#' },
        { name: 'NBI Clearance', size: '2.8 MB', uploadDate: '2026-04-24', url: '#' },
      ],
    },
    {
      id: 'DRV-003',
      name: 'Juan Cruz',
      email: 'juan.cruz@email.com',
      phone: '+63 919 345 6789',
      region: 'Davao City, Davao del Sur',
      type: 'driver',
      applicationDate: '2026-04-23',
      documentCount: 3,
      status: 'rejected',
      accountStatus: 'inactive',
      vehicleType: 'Motorcycle',
      plateNumber: 'DEF 9012',
      documents: [
        { name: 'Driver\'s License', size: '2.0 MB', uploadDate: '2026-04-23', url: '#' },
        { name: 'Government ID', size: '1.4 MB', uploadDate: '2026-04-23', url: '#' },
        { name: 'Vehicle Registration', size: '1.7 MB', uploadDate: '2026-04-23', url: '#' },
      ],
    },
    {
      id: 'BIZ-001',
      name: 'Ana Garcia',
      email: 'ana.garcia@business.com',
      phone: '+63 920 456 7890',
      region: 'Iloilo City, Iloilo',
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
      region: 'Baguio City, Benguet',
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
  ]);

  const filteredApplicants = applicants.filter(
    (applicant) =>
      applicant.type === activeTab &&
      (statusFilter === 'all' || applicant.status === statusFilter) &&
      (
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        applicant.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        applicant.businessName?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
  );

  const filteredDropOffApplications = dropOffApplications.filter((application) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesSearch =
      application.businessName.toLowerCase().includes(query) ||
      application.location.toLowerCase().includes(query) ||
      application.id.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    pending:
      activeTab === 'dropoff'
        ? dropOffApplications.filter((application) => application.status === 'pending').length
        : applicants.filter((a) => a.type === activeTab && a.status === 'pending').length,
    approved:
      activeTab === 'dropoff'
        ? dropOffApplications.filter((application) => application.status === 'approved').length
        : applicants.filter((a) => a.type === activeTab && a.status === 'approved').length,
    rejected:
      activeTab === 'dropoff'
        ? dropOffApplications.filter((application) => application.status === 'rejected').length
        : applicants.filter((a) => a.type === activeTab && a.status === 'rejected').length,
  };

  const handleApprove = (applicantId: string) => {
    const activatedDate = new Date().toISOString().split('T')[0];

    setApplicants((current) =>
      current.map((applicant) => {
        if (applicant.id !== applicantId) return applicant;

        return {
          ...applicant,
          status: 'approved',
          accountStatus: 'active',
          activatedDate,
          rejectionReason: undefined,
        };
      }),
    );

    setSelectedApplicant(null);
    setShowApplicantRejectModal(false);
  };

  const handleReject = (applicantId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a written rejection reason.');
      return;
    }

    let rejectedApplicant: Applicant | null = null;

    setApplicants((current) =>
      current.map((applicant) => {
        if (applicant.id !== applicantId) return applicant;

        rejectedApplicant = {
          ...applicant,
          status: 'rejected',
          accountStatus: 'inactive',
          activatedDate: undefined,
          rejectionReason: rejectionReason.trim(),
        };
        return rejectedApplicant;
      }),
    );
    setSelectedApplicant(null);
    setShowApplicantRejectModal(false);
    setRejectionReason('');
  };

  const openApplicantReview = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantRejectModal(false);
    setRejectionReason('');
  };

  const handleApproveDropOff = (application: DropOffApplication) => {
    const activatedApplication: DropOffApplication = {
      ...application,
      status: 'approved',
      platformStatus: 'active',
      activatedDate: new Date().toISOString().split('T')[0],
      rejectionReason: undefined,
    };

    setDropOffApplications((current) =>
      current.map((item) =>
        item.id === application.id ? activatedApplication : item,
      ),
    );
    setSelectedDropOffApplication(activatedApplication);
  };

  const handleRejectDropOff = () => {
    if (!selectedDropOffApplication || !dropOffRejectionReason.trim()) return;

    const rejectedApplication: DropOffApplication = {
      ...selectedDropOffApplication,
      status: 'rejected',
      platformStatus: 'inactive',
      activatedDate: undefined,
      rejectionReason: dropOffRejectionReason.trim(),
    };

    setDropOffApplications((current) =>
      current.map((item) =>
        item.id === selectedDropOffApplication.id
          ? rejectedApplication
          : item,
      ),
    );
    setSelectedDropOffApplication(null);
    setShowDropOffRejectModal(false);
    setDropOffRejectionReason('');
  };

  const selectAcceptanceTab = (tab: AcceptanceTab) => {
    setActiveTab(tab);
    setStatusFilter('all');
    setSearchQuery('');
    setSelectedApplicant(null);
    setSelectedDropOffApplication(null);
    setShowApplicantRejectModal(false);
    setShowDropOffRejectModal(false);
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
                placeholder={activeTab === 'dropoff' ? 'Search business, location, or ID...' : 'Search applicants...'}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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
            <p className="text-[#1A5D56] opacity-70 font-medium italic">Review and approve driver, business owner, and drop-off operator applications.</p>
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
                  onClick={() => selectAcceptanceTab('driver')}
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
                  onClick={() => selectAcceptanceTab('business')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'business'
                      ? 'bg-[#F0F9F8] text-[#39B5A8] shadow-sm'
                      : 'text-gray-400 hover:text-[#1A5D56] hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Business Owners
                </button>
                <button
                  onClick={() => selectAcceptanceTab('dropoff')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'dropoff'
                      ? 'bg-[#F0F9F8] text-[#39B5A8] shadow-sm'
                      : 'text-gray-400 hover:text-[#1A5D56] hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Drop-Off Operators
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
              {activeTab === 'dropoff' ? (
                <DropOffApplicationsTable
                  applications={filteredDropOffApplications}
                  onSelectApplication={setSelectedDropOffApplication}
                />
              ) : (
                <ApplicantsTable
                  applicants={filteredApplicants}
                  onSelectApplicant={openApplicantReview}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {selectedApplicant && !showApplicantRejectModal && (
        <ApplicantReviewModal
          applicant={selectedApplicant}
          onApprove={() => handleApprove(selectedApplicant.id)}
          onClose={() => setSelectedApplicant(null)}
          onReject={() => {
            setShowApplicantRejectModal(true);
            setRejectionReason('');
          }}
        />
      )}

      {selectedApplicant && showApplicantRejectModal && (
        <ApplicantRejectModal
          applicant={selectedApplicant}
          reason={rejectionReason}
          onCancel={() => {
            setShowApplicantRejectModal(false);
            setRejectionReason('');
          }}
          onChangeReason={setRejectionReason}
          onConfirm={() => handleReject(selectedApplicant.id)}
        />
      )}

      {selectedDropOffApplication && !showDropOffRejectModal && (
        <DropOffReviewModal
          application={selectedDropOffApplication}
          onApprove={() => handleApproveDropOff(selectedDropOffApplication)}
          onClose={() => setSelectedDropOffApplication(null)}
          onReject={() => {
            setShowDropOffRejectModal(true);
            setDropOffRejectionReason('');
          }}
        />
      )}

      {selectedDropOffApplication && showDropOffRejectModal && (
        <DropOffRejectModal
          reason={dropOffRejectionReason}
          onCancel={() => {
            setShowDropOffRejectModal(false);
            setDropOffRejectionReason('');
          }}
          onChangeReason={setDropOffRejectionReason}
          onConfirm={handleRejectDropOff}
        />
      )}
    </div>
  );
}

function formatDate(date: string, format: 'short' | 'long') {
  return new Date(date).toLocaleDateString('en-US', {
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ApplicantsTable({
  applicants,
  onSelectApplicant,
}: {
  applicants: Applicant[];
  onSelectApplicant: (applicant: Applicant) => void;
}) {
  return (
    <>
      <table className="w-full text-left">
        <thead className="bg-[#F0F9F8]/50 border-b border-[#39B5A8]/5">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Application ID</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Applicant</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Date Applied</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Region</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest text-center">Documents</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest text-right">Review</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#39B5A8]/5">
          {applicants.map((applicant) => {
            const primaryName = applicant.type === 'business' ? applicant.businessName || applicant.name : applicant.name;
            const secondaryText =
              applicant.type === 'business'
                ? applicant.name
                : [applicant.vehicleType, applicant.plateNumber].filter(Boolean).join(' · ');

            return (
              <tr key={applicant.id} className="hover:bg-[#F0F9F8]/30 transition-colors">
                <td className="px-6 py-5 font-bold text-[#041614] text-sm">{applicant.id}</td>
                <td className="px-6 py-5 min-w-[260px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#39B5A8] to-[#1A5D56] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {primaryName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#041614]">{primaryName}</p>
                      <p className="text-xs text-gray-400 font-medium">{secondaryText}</p>
                      {applicant.status === 'rejected' && applicant.rejectionReason && (
                        <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-red-500">
                          Fix needed: {applicant.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <p className="font-semibold text-[#1A5D56]">{formatDate(applicant.applicationDate, 'short')}</p>
                </td>
                <td className="px-6 py-5 min-w-[240px]">
                  <p className="text-sm font-semibold text-[#1A5D56] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#39B5A8]" />
                    {applicant.region}
                  </p>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F9F8] text-[#39B5A8] rounded-full font-bold text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    {applicant.documentCount}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <AcceptanceStatusBadge status={applicant.status} />
                </td>
                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => onSelectApplicant(applicant)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#39B5A8] text-white rounded-xl hover:bg-[#2F9D91] transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {applicants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 font-medium">No applications found</p>
        </div>
      )}
    </>
  );
}

function DropOffApplicationsTable({
  applications,
  onSelectApplication,
}: {
  applications: DropOffApplication[];
  onSelectApplication: (application: DropOffApplication) => void;
}) {
  return (
    <>
      <table className="w-full text-left">
        <thead className="bg-[#F0F9F8]/50 border-b border-[#39B5A8]/5">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Application ID</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Applicant</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Date Applied</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Region</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest text-center">Documents</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#39B5A8] uppercase tracking-widest text-right">Review</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#39B5A8]/5">
          {applications.map((application) => (
            <tr key={application.id} className="hover:bg-[#F0F9F8]/30 transition-colors">
              <td className="px-6 py-5 font-bold text-[#041614] text-sm">{application.id}</td>
              <td className="px-6 py-5 min-w-[260px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#39B5A8] to-[#1A5D56] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {application.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#041614]">{application.businessName}</p>
                    <p className="text-xs text-gray-400 font-medium">{application.ownerName}</p>
                    {application.status === 'rejected' && application.rejectionReason && (
                      <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-red-500">
                        Fix needed: {application.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <p className="font-semibold text-[#1A5D56]">{formatDate(application.dateApplied, 'short')}</p>
              </td>
              <td className="px-6 py-5 min-w-[240px]">
                <p className="text-sm font-semibold text-[#1A5D56] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#39B5A8]" />
                  {application.location}
                </p>
              </td>
              <td className="px-6 py-5 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F9F8] text-[#39B5A8] rounded-full font-bold text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  {application.businessDocuments.length}
                </span>
              </td>
              <td className="px-6 py-5">
                <AcceptanceStatusBadge status={application.status} />
              </td>
              <td className="px-6 py-5 text-right">
                <button
                  onClick={() => onSelectApplication(application)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#39B5A8] text-white rounded-xl hover:bg-[#2F9D91] transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 font-medium">No drop-off applications found</p>
        </div>
      )}
    </>
  );
}

function AcceptanceStatusBadge({ status }: { status: StatusType }) {
  const statusConfig = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <span className={`inline-block whitespace-nowrap text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${statusConfig[status]}`}>
      {status}
    </span>
  );
}

function DropOffInfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-[#F0F9F8] rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#39B5A8]">{icon}</span>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-bold text-[#1A5D56]">{value}</p>
    </div>
  );
}

function DocumentVerificationBadge({ status }: { status: BusinessDocument['verificationStatus'] }) {
  const statusConfig = {
    submitted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    needs_review: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <span className={`inline-block whitespace-nowrap text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${statusConfig[status]}`}>
      {status === 'submitted' ? 'Submitted' : 'Needs Review'}
    </span>
  );
}

function ApplicantReviewModal({
  applicant,
  onApprove,
  onClose,
  onReject,
}: {
  applicant: Applicant;
  onApprove: () => void;
  onClose: () => void;
  onReject: () => void;
}) {
  const isDriver = applicant.type === 'driver';
  const subtitle = isDriver ? 'Review Driver' : 'Review Business Owner';
  const approvalLabel = isDriver ? 'Approve & Activate Driver' : 'Approve Business Owner';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#39B5A8]/10 p-8 flex items-center justify-between rounded-t-[2.5rem] z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#041614]">{subtitle}</h2>
            <p className="text-sm text-gray-400 font-medium">{applicant.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors">
            <X className="w-6 h-6 text-[#1A5D56]" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-[#041614] mb-4">Applicant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropOffInfoItem icon={<User className="w-4 h-4" />} label={isDriver ? 'Driver Name' : 'Owner Name'} value={applicant.name} />
              {!isDriver && (
                <DropOffInfoItem icon={<Briefcase className="w-4 h-4" />} label="Business Name" value={applicant.businessName ?? 'Pending'} />
              )}
              <DropOffInfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={applicant.email} />
              <DropOffInfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={applicant.phone} />
              <DropOffInfoItem icon={<MapPin className="w-4 h-4" />} label="Region" value={applicant.region} />
              <DropOffInfoItem icon={<Calendar className="w-4 h-4" />} label="Date Applied" value={formatDate(applicant.applicationDate, 'long')} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#041614] mb-4">{isDriver ? 'Driver Details' : 'Business Details'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isDriver ? (
                <>
                  <DropOffInfoItem icon={<Car className="w-4 h-4" />} label="Vehicle Type" value={applicant.vehicleType ?? 'Pending'} />
                  <DropOffInfoItem icon={<FileText className="w-4 h-4" />} label="Plate Number" value={applicant.plateNumber ?? 'Pending'} />
                </>
              ) : (
                <>
                  <DropOffInfoItem icon={<Building2 className="w-4 h-4" />} label="Business Type" value={applicant.businessType ?? 'Pending'} />
                  <DropOffInfoItem icon={<FileText className="w-4 h-4" />} label="Documents Submitted" value={`${applicant.documentCount} files`} />
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#041614] mb-4">Submitted Documents</h3>
            <div className="space-y-3">
              {applicant.documents.map((document) => (
                <div key={`${applicant.id}-${document.name}`} className="flex items-center justify-between gap-4 p-4 bg-[#F0F9F8] rounded-xl hover:bg-[#39B5A8]/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white">
                      <FileText className="w-5 h-5 text-[#39B5A8]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#041614] truncate">{document.name}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {document.size} - Uploaded {formatDate(document.uploadDate, 'short')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" className="p-2 rounded-lg bg-white hover:bg-[#39B5A8]/10 transition-colors" aria-label={`View ${document.name}`}>
                      <Eye className="w-4 h-4 text-[#39B5A8]" />
                    </button>
                    <button type="button" className="p-2 rounded-lg bg-white hover:bg-[#39B5A8]/10 transition-colors" aria-label={`Download ${document.name}`}>
                      <Download className="w-4 h-4 text-[#39B5A8]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-4 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]">
            <h4 className="font-bold text-[#041614] mb-3">{isDriver ? 'Driver Eligibility Status' : 'Application Status'}</h4>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <AcceptanceStatusBadge status={applicant.status} />
              </div>
              {applicant.status === 'rejected' && applicant.rejectionReason && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Applicant Resubmission Reason</p>
                  <p className="mt-1 text-sm font-semibold text-red-700">{applicant.rejectionReason}</p>
                </div>
              )}
            </div>
          </section>

          {applicant.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle className="w-5 h-5" />
                {approvalLabel}
              </button>
              <button
                onClick={onReject}
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
  );
}

function DropOffReviewModal({
  application,
  onApprove,
  onClose,
  onReject,
}: {
  application: DropOffApplication;
  onApprove: () => void;
  onClose: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#39B5A8]/10 p-8 flex items-center justify-between rounded-t-[2.5rem] z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#041614]">Review Drop-Off Operator</h2>
            <p className="text-sm text-gray-400 font-medium">{application.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors">
            <X className="w-6 h-6 text-[#1A5D56]" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-[#041614] mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropOffInfoItem icon={<Building2 className="w-4 h-4" />} label="Business Name" value={application.businessName} />
              <DropOffInfoItem icon={<User className="w-4 h-4" />} label="Owner Name" value={application.ownerName} />
              <DropOffInfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={application.email} />
              <DropOffInfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={application.phone} />
              <DropOffInfoItem icon={<MapPin className="w-4 h-4" />} label="Location" value={application.location} />
              <DropOffInfoItem icon={<Calendar className="w-4 h-4" />} label="Date Applied" value={formatDate(application.dateApplied, 'long')} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#041614] mb-4">Registered Address</h3>
            <div className="p-4 bg-[#F0F9F8] rounded-xl">
              <p className="font-bold text-[#1A5D56]">{application.address}</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#041614] mb-4">Business Documents</h3>
            <div className="space-y-3">
              {application.businessDocuments.map((document) => (
                <div key={document.requirement} className="flex items-center justify-between gap-4 p-4 bg-[#F0F9F8] rounded-xl hover:bg-[#39B5A8]/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white">
                      <FileText className="w-5 h-5 text-[#39B5A8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-[#041614]">{document.requirement}</p>
                        <DocumentVerificationBadge status={document.verificationStatus} />
                      </div>
                      <p className="text-xs text-gray-400 font-medium truncate">{document.name}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        {document.size} - Uploaded {formatDate(document.uploadDate, 'short')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" className="p-2 rounded-lg bg-white hover:bg-[#39B5A8]/10 transition-colors" aria-label={`View ${document.requirement}`}>
                      <Eye className="w-4 h-4 text-[#39B5A8]" />
                    </button>
                    <button type="button" className="p-2 rounded-lg bg-white hover:bg-[#39B5A8]/10 transition-colors" aria-label={`Download ${document.requirement}`}>
                      <Download className="w-4 h-4 text-[#39B5A8]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-4 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]">
            <h4 className="font-bold text-[#041614] mb-3">Application Status</h4>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <AcceptanceStatusBadge status={application.status} />
              </div>
              {application.status === 'rejected' && application.rejectionReason && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Applicant Resubmission Reason</p>
                  <p className="mt-1 text-sm font-semibold text-red-700">{application.rejectionReason}</p>
                </div>
              )}
            </div>
          </section>

          {application.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle className="w-5 h-5" />
                Approve & Activate
              </button>
              <button
                onClick={onReject}
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
  );
}

function ApplicantRejectModal({
  applicant,
  reason,
  onCancel,
  onChangeReason,
  onConfirm,
}: {
  applicant: Applicant;
  reason: string;
  onCancel: () => void;
  onChangeReason: (reason: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight text-[#041614]">Reject Application</h2>
            </div>
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors">
              <X className="w-5 h-5 text-[#1A5D56]" />
            </button>
          </div>

          <label className="text-xs font-bold text-[#39B5A8] uppercase tracking-wider mb-2 block">Written Reason for Applicant *</label>
          <textarea
            value={reason}
            onChange={(event) => onChangeReason(event.target.value)}
            placeholder="Enter rejection reason"
            rows={4}
            className="w-full bg-[#F0F9F8] border border-[#39B5A8]/10 rounded-xl px-4 py-3 text-[#041614] focus:border-[#39B5A8] outline-none transition-all text-sm font-medium resize-none"
            required
          />

          <div className="flex gap-3 pt-6">
            <button onClick={onCancel} className="flex-1 px-6 py-3 bg-gray-100 text-[#1A5D56] rounded-xl font-bold hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!reason.trim()}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropOffRejectModal({
  reason,
  onCancel,
  onChangeReason,
  onConfirm,
}: {
  reason: string;
  onCancel: () => void;
  onChangeReason: (reason: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight text-[#041614]">Reject Application</h2>
            </div>
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors">
              <X className="w-5 h-5 text-[#1A5D56]" />
            </button>
          </div>

          <label className="text-xs font-bold text-[#39B5A8] uppercase tracking-wider mb-2 block">Written Reason for Applicant *</label>
          <textarea
            value={reason}
            onChange={(event) => onChangeReason(event.target.value)}
            placeholder="Enter rejection reason"
            rows={4}
            className="w-full bg-[#F0F9F8] border border-[#39B5A8]/10 rounded-xl px-4 py-3 text-[#041614] focus:border-[#39B5A8] outline-none transition-all text-sm font-medium resize-none"
            required
          />

          <div className="flex gap-3 pt-6">
            <button onClick={onCancel} className="flex-1 px-6 py-3 bg-gray-100 text-[#1A5D56] rounded-xl font-bold hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!reason.trim()}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
