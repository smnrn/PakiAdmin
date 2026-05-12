import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  UserCog,
  Shield,
  AlertTriangle,
  Eye,
  Filter,
  Download,
  X,
} from "lucide-react";

import pakiAdminLogo from 'figma:asset/201e5c2af3e232861c2832a6f19fc1174871e296.png';

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface AdminRequest {
  id: string;
  name: string;
  email: string;
  role: string;
  applicationDate: string;
  status: RequestStatus;
  emailVerified: boolean;
  rejectionReason?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
}

// Mock data for pending admin requests
const MOCK_REQUESTS: AdminRequest[] = [
  {
    id: 'REQ-001',
    name: 'Maria Santos',
    email: 'maria.santos@pakiadmin.ph',
    role: 'Administrator',
    applicationDate: '2026-05-10',
    status: 'pending',
    emailVerified: true,
  },
  {
    id: 'REQ-002',
    name: 'Carlos Reyes',
    email: 'carlos.reyes@pakiadmin.ph',
    role: 'Analyst',
    applicationDate: '2026-05-11',
    status: 'pending',
    emailVerified: true,
  },
  {
    id: 'REQ-003',
    name: 'Ana Garcia',
    email: 'ana.garcia@pakiadmin.ph',
    role: 'Support',
    applicationDate: '2026-05-11',
    status: 'pending',
    emailVerified: false,
  },
  {
    id: 'REQ-004',
    name: 'Roberto Tan',
    email: 'roberto.tan@pakiadmin.ph',
    role: 'Moderator',
    applicationDate: '2026-05-09',
    status: 'approved',
    emailVerified: true,
    approvedBy: 'Juan Dela Cruz',
    approvedDate: '2026-05-10',
  },
  {
    id: 'REQ-005',
    name: 'Lisa Wong',
    email: 'lisa.wong@pakiadmin.ph',
    role: 'Developer',
    applicationDate: '2026-05-08',
    status: 'rejected',
    emailVerified: true,
    rejectionReason: 'Incomplete credentials verification',
    rejectedBy: 'Juan Dela Cruz',
    rejectedDate: '2026-05-09',
  },
];

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const placeholderName = "Super Admin";

  const handleLogout = () => {
    navigate('/pakiadmin/login');
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const handleApprove = (request: AdminRequest) => {
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setRequests(requests.map(req =>
        req.id === request.id
          ? {
              ...req,
              status: 'approved',
              approvedBy: placeholderName,
              approvedDate: new Date().toISOString().split('T')[0]
            }
          : req
      ));
      setSelectedRequest(null);
      setIsProcessing(false);

      // In production: Send approval email to user
      console.log('Approval email sent to:', request.email);
    }, 1000);
  };

  const handleReject = (request: AdminRequest) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setRequests(requests.map(req =>
        req.id === request.id
          ? {
              ...req,
              status: 'rejected',
              rejectionReason: rejectionReason,
              rejectedBy: placeholderName,
              rejectedDate: new Date().toISOString().split('T')[0]
            }
          : req
      ));
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      setIsProcessing(false);

      // In production: Send rejection email to user
      console.log('Rejection email sent to:', request.email, 'Reason:', rejectionReason);
    }, 1000);
  };

  const openRejectModal = (request: AdminRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  return (
    <div className="flex h-screen bg-[#F0F9F8] font-sans text-[#1A5D56]">
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #F0F9F8; }
        ::-webkit-scrollbar-thumb { background: #39B5A833; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #39B5A866; }
      `}} />

      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-[#dec0f1]/30 flex flex-col shadow-xl">
        <div className="p-8">
          <img src={pakiAdminLogo} alt="PakiAdmin Logo" className="h-12 w-auto object-contain mx-auto" />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 py-2">
            <span className="text-[10px] font-bold text-[#2c0735] uppercase tracking-widest opacity-60">
              Super Admin Panel
            </span>
          </div>

          <NavButton
            active={true}
            onClick={() => {}}
            icon={<Shield className="w-5 h-5" />}
            label="Pending Requests"
            badge={pendingCount > 0 ? pendingCount.toString() : undefined}
          />
          <NavButton
            active={false}
            onClick={() => navigate('/pakiadmin/dashboard')}
            icon={<User className="w-5 h-5" />}
            label="User Management"
          />
          <NavButton
            active={false}
            onClick={() => navigate('/pakiadmin/settings')}
            icon={<Settings className="w-5 h-5" />}
            label="Admin Settings"
          />
        </nav>

        <div className="p-6 border-t border-[#dec0f1]/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold text-sm group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#dec0f1]/30 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#F0F9F8] px-4 py-2 rounded-xl border border-[#dec0f1]/30 w-96">
              <Search className="w-4 h-4 text-[#2c0735]/60" />
              <input
                type="text"
                placeholder="Search requests by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#2c0735]/40 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-8 w-[1px] bg-[#dec0f1]/30"></div>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:bg-[#F0F9F8] px-3 py-2 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#2c0735] to-[#543569] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {placeholderName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block min-w-max">
                  <p className="text-sm font-bold text-[#2c0735] leading-tight whitespace-nowrap">{placeholderName}</p>
                  <p className="text-xs font-semibold text-[#2c0735]/60">Super Administrator</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#2c0735] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#dec0f1]/30 overflow-hidden z-20">
                  <button onClick={() => { setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left">
                    <User className="w-4 h-4 text-[#2c0735]" />
                    <span className="font-semibold text-[#2c0735]">Profile</span>
                  </button>
                  <button onClick={() => { setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left">
                    <Settings className="w-4 h-4 text-[#2c0735]" />
                    <span className="font-semibold text-[#2c0735]">Settings</span>
                  </button>
                  <div className="border-t border-[#dec0f1]/30"></div>
                  <button onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-left">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-red-500">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-10 space-y-8">
          <section>
            <h1 className="text-3xl font-bold text-[#2c0735] tracking-tight">Admin Access Requests</h1>
            <p className="text-[#2c0735]/60 font-medium italic">Review and manage pending administrator signup requests.</p>
          </section>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              icon={<Clock className="w-6 h-6" />}
              label="Pending Review"
              value={pendingCount}
              color="amber"
            />
            <SummaryCard
              icon={<CheckCircle className="w-6 h-6" />}
              label="Approved"
              value={approvedCount}
              color="green"
            />
            <SummaryCard
              icon={<XCircle className="w-6 h-6" />}
              label="Rejected"
              value={rejectedCount}
              color="red"
            />
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-[2rem] border border-[#dec0f1]/30 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2c0735]">Filter Requests</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#dec0f1]/30 hover:bg-[#F0F9F8] transition-colors text-sm font-semibold text-[#2c0735]">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="flex gap-2">
              <FilterButton
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
                label="All"
                count={requests.length}
              />
              <FilterButton
                active={statusFilter === 'pending'}
                onClick={() => setStatusFilter('pending')}
                label="Pending"
                count={pendingCount}
                color="amber"
              />
              <FilterButton
                active={statusFilter === 'approved'}
                onClick={() => setStatusFilter('approved')}
                label="Approved"
                count={approvedCount}
                color="green"
              />
              <FilterButton
                active={statusFilter === 'rejected'}
                onClick={() => setStatusFilter('rejected')}
                label="Rejected"
                count={rejectedCount}
                color="red"
              />
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-[2rem] border border-[#dec0f1]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F0F9F8] border-b border-[#dec0f1]/30">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#2c0735] uppercase tracking-widest">Request ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#2c0735] uppercase tracking-widest">Applicant</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#2c0735] uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#2c0735] uppercase tracking-widest">Applied On</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#2c0735] uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#2c0735] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dec0f1]/30">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-[#F0F9F8]/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#2c0735] text-sm">{request.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#2c0735] to-[#543569] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {request.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#2c0735]">{request.name}</p>
                            <p className="text-xs text-[#2c0735]/60 font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dec0f1]/30 text-[#2c0735] rounded-full font-bold text-xs">
                          <UserCog className="w-3.5 h-3.5" />
                          {request.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-[#2c0735]">{new Date(request.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={request.status} emailVerified={request.emailVerified} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2c0735] text-white rounded-xl hover:shadow-lg hover:shadow-[#2c0735]/20 transition-all text-xs font-bold uppercase tracking-wider"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#2c0735]/40 font-semibold">No requests found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#dec0f1]/30 p-8 flex items-center justify-between rounded-t-[2.5rem] z-10">
              <div>
                <h2 className="text-2xl font-bold text-[#2c0735]">Review Request</h2>
                <p className="text-sm text-[#2c0735]/60 font-medium">{selectedRequest.id}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors"
              >
                <X className="w-6 h-6 text-[#2c0735]" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Applicant Info */}
              <section>
                <h3 className="text-lg font-bold text-[#2c0735] mb-4">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={<User className="w-4 h-4" />} label="Full Name" value={selectedRequest.name} />
                  <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={selectedRequest.email} />
                  <InfoItem icon={<UserCog className="w-4 h-4" />} label="Requested Role" value={selectedRequest.role} />
                  <InfoItem icon={<Calendar className="w-4 h-4" />} label="Application Date" value={new Date(selectedRequest.applicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                </div>
              </section>

              {/* Email Verification Status */}
              <section className={`p-4 rounded-xl border ${selectedRequest.emailVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  {selectedRequest.emailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${selectedRequest.emailVerified ? 'text-green-900' : 'text-amber-900'}`}>
                      Email {selectedRequest.emailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                    <p className={`text-xs font-semibold ${selectedRequest.emailVerified ? 'text-green-700' : 'text-amber-700'}`}>
                      {selectedRequest.emailVerified
                        ? 'Email address has been confirmed'
                        : 'User has not verified their email yet'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Status Info */}
              {selectedRequest.status !== 'pending' && (
                <section className="p-4 rounded-xl border border-[#dec0f1]/30 bg-[#F0F9F8]">
                  <h4 className="font-bold text-[#2c0735] mb-2">Request Status</h4>
                  <div className="space-y-2">
                    {selectedRequest.status === 'approved' && (
                      <>
                        <p className="text-sm font-semibold text-green-600">✓ Approved</p>
                        <p className="text-xs font-semibold text-[#2c0735]/60">Approved by: {selectedRequest.approvedBy}</p>
                        <p className="text-xs font-semibold text-[#2c0735]/60">Date: {selectedRequest.approvedDate}</p>
                      </>
                    )}
                    {selectedRequest.status === 'rejected' && (
                      <>
                        <p className="text-sm font-semibold text-red-600">✗ Rejected</p>
                        <p className="text-xs font-semibold text-[#2c0735]/60">Rejected by: {selectedRequest.rejectedBy}</p>
                        <p className="text-xs font-semibold text-[#2c0735]/60">Date: {selectedRequest.rejectedDate}</p>
                        <p className="text-xs font-bold text-[#2c0735] mt-2">Reason: {selectedRequest.rejectionReason}</p>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={isProcessing || !selectedRequest.emailVerified}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isProcessing ? 'Processing...' : 'Approve Request'}
                  </button>
                  <button
                    onClick={() => openRejectModal(selectedRequest)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#2c0735]">Reject Request</h2>
                  <p className="text-sm text-[#2c0735]/60 font-medium mt-1">
                    Provide a reason for rejecting {selectedRequest.name}'s application.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="p-2 rounded-xl hover:bg-[#F0F9F8] transition-colors"
                >
                  <X className="w-5 h-5 text-[#2c0735]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#2c0735] uppercase tracking-wider mb-2 block">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this request is being rejected..."
                    rows={4}
                    className="w-full bg-[#F0F9F8] border border-[#dec0f1]/30 rounded-xl px-4 py-3 text-[#2c0735] focus:border-[#2c0735] outline-none transition-all text-sm font-medium resize-none"
                    required
                  />
                  <p className="text-xs font-semibold text-[#2c0735]/60 mt-2">
                    This reason will be sent to the applicant via email.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-[#2c0735] rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest)}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components

function NavButton({ active, onClick, icon, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all font-bold text-sm ${
        active
          ? 'bg-[#dec0f1]/30 text-[#2c0735] shadow-sm'
          : 'text-[#2c0735]/60 hover:text-[#2c0735] hover:bg-[#F0F9F8]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#2c0735]' : 'text-[#2c0735]/60'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className="px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-bold min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function SummaryCard({ icon, label, value, color }: any) {
  const colors = {
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-[#dec0f1]/30 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-3xl font-black text-[#2c0735]">{value}</span>
      </div>
      <p className="text-xs font-bold text-[#2c0735] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label, count, color }: any) {
  const colors = {
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
        active
          ? 'bg-[#2c0735] text-white shadow-lg shadow-[#2c0735]/20'
          : 'bg-[#F0F9F8] text-[#2c0735] hover:bg-[#dec0f1]/30'
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-white/20 text-white' : `${color ? colors[color] : 'bg-[#2c0735]'} text-white`
      }`}>
        {count}
      </span>
    </button>
  );
}

function StatusBadge({ status, emailVerified }: { status: RequestStatus; emailVerified: boolean }) {
  const statusConfig = {
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Pending Review',
    },
    approved: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Rejected',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-block whitespace-nowrap text-xs font-bold px-3 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
      {status === 'pending' && (
        <span className={`text-xs font-semibold ${emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
          {emailVerified ? '✓ Email Verified' : '⏱ Email Pending'}
        </span>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="p-4 bg-[#F0F9F8] rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#2c0735]/60">{icon}</span>
        <span className="text-xs font-bold text-[#2c0735]/60 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-bold text-[#2c0735]">{value}</p>
    </div>
  );
}
