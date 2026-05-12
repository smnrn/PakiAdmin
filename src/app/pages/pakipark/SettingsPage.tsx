import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
  CheckCircle2,
  Globe,
  Users,
  X,
  UserPlus,
  Edit3,
  UserMinus,
  MessageSquare,
  Fingerprint,
} from 'lucide-react';
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import PakiParkSidebar from '../../components/pakipark/PakiParkSidebar';

// --- SUB-COMPONENT: PREFERENCE TOGGLE ---
const PreferenceToggle = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-6 bg-[#f4f7fa] rounded-[1.8rem] border border-[#1e3d5a]/5 hover:border-[#ee6b20]/20 transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#1e3d5a]/10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-bold text-[#1e3d5a]">{title}</p>
        <p className="text-xs text-[#1e3d5a]/60 font-medium max-w-[200px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    <Switch 
      checked={checked} 
      onCheckedChange={onChange}
      className="data-[state=checked]:bg-[#ee6b20]"
    />
  </div>
);

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE LOGIC ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  // User Management States
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "View Only" });
  const roleOptions = ["No Access", "View Only", "Limited Access", "Full Access", "Super Admin"];

  // Account Preference States
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsUpdates: true,
    twoFactor: true,
    publicProfile: true
  });

  const [users, setUsers] = useState([
    { id: 1, name: "Juan Dela Cruz", email: "juandelacruz@pakiadmin.ph", role: "Super Admin", status: "Active" },
    { id: 2, name: "Andrea Go", email: "andreago@pakiadmin.ph", role: "Full Access", status: "Active" },
    { id: 3, name: "Sam Delos Reyes", email: "samdelosreyes@pakiadmin.ph", role: "View Only", status: "Inactive" },
    { id: 4, name: "Bianca Santiago", email: "biancasantiago@pakiadmin.ph", role: "Limited Access", status: "Active" },
  ]);

  const displayName = "Juan Dela Cruz";

  // --- ACTIONS ---
  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const deactivateUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    triggerSuccess("Staff access status updated.");
  };

  const openEditModal = (user) => {
    setCurrentUser({ ...user });
    setShowEditUserModal(true);
  };

  const handleAddUser = () => {
    const id = users.length + 1;
    setUsers([...users, { ...newUser, id, status: "Active" }]);
    triggerSuccess(`${newUser.name} added to facility staff.`);
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", role: "View Only" });
  };

  const handleUpdateUser = () => {
    setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
    triggerSuccess(`Staff profile updated.`);
    setShowEditUserModal(false);
  };

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans overflow-hidden text-[#1e3d5a] relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e3d5a20; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ee6b2040; }
      `}} />

      <PakiParkSidebar activeTab="settings" />

      {/* --- ADD/EDIT MODALS --- */}
      {(showAddUserModal || showEditUserModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3d5a]/40 backdrop-blur-sm" onClick={() => { setShowAddUserModal(false); setShowEditUserModal(false); }}></div>
          <Card className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1e3d5a]">{showAddUserModal ? "Add Facility Staff" : "Edit Staff Profile"}</h3>
                <button onClick={() => { setShowAddUserModal(false); setShowEditUserModal(false); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase ml-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold" value={showAddUserModal ? newUser.name : currentUser?.name} onChange={(e) => showAddUserModal ? setNewUser({...newUser, name: e.target.value}) : setCurrentUser({...currentUser, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase ml-1">Work Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold" value={showAddUserModal ? newUser.email : currentUser?.email} onChange={(e) => showAddUserModal ? setNewUser({...newUser, email: e.target.value}) : setCurrentUser({...currentUser, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase ml-1">System Role</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold appearance-none" value={showAddUserModal ? newUser.role : currentUser?.role} onChange={(e) => showAddUserModal ? setNewUser({...newUser, role: e.target.value}) : setCurrentUser({...currentUser, role: e.target.value})}>
                    {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <Button onClick={showAddUserModal ? handleAddUser : handleUpdateUser} className="w-full bg-[#ee6b20] hover:bg-[#ff7a2e] text-white rounded-xl py-6 font-bold mt-4 uppercase text-[10px] tracking-widest shadow-lg">
                  {showAddUserModal ? "Grant Access" : "Update Permissions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#1e3d5a]/10 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-[#f4f7fa] px-4 py-2 rounded-xl border border-[#1e3d5a]/10 w-180">
              <Search className="w-4 h-4 text-[#1e3d5a]/60" />
              <input type="text" placeholder="Search system settings..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#1e3d5a]/40 font-medium text-[#1e3d5a]" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-8 w-[1px] bg-[#1e3d5a]/10"></div>
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 hover:bg-[#f4f7fa] px-3 py-2 rounded-xl transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1e3d5a] to-[#2a5373] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block min-w-max">
                  <p className="text-sm font-bold text-[#1e3d5a] leading-tight whitespace-nowrap">{displayName}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#1e3d5a] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#1e3d5a]/10 overflow-hidden z-50">
                  <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left">
                    <User className="w-4 h-4 text-[#ee6b20]" />
                    <span className="font-semibold text-[#1e3d5a]">Profile</span>
                  </button>
                  <button onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left">
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

        <main className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black font-bold text-[#1e3d5a] tracking-tight">Admin Settings</h1>
              <p className="text-[#1e3d5a] opacity-60 font-medium italic mt-1">Manage PakiPark facility staff and access control.</p>
            </div>
            {showSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">{successMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* TEAM MANAGEMENT SECTION */}
            <Card className="bg-white rounded-[2.5rem] border-none shadow-sm overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="p-8 border-b border-[#f4f7fa] bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#f4f7fa] rounded-2xl text-[#ee6b20]"><Users size={24} /></div>
                    <div>
                      <CardTitle className="text-xl font-bold text-[#1e3d5a]">Team Management</CardTitle>
                      <CardDescription className="text-xs font-medium text-gray-400">Add, edit or deactivate system users</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => setShowAddUserModal(true)} className="bg-[#1e3d5a] hover:bg-[#2a5373] text-white rounded-xl font-bold h-12 px-5 transition-all shadow-lg">
                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f7fa] border-b border-[#1e3d5a]/5 text-[10px] uppercase font-bold text-[#1e3d5a]/40 sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-4">User</th>
                      <th className="px-8 py-4">Role</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e3d5a]/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#f4f7fa]/50 transition-colors group">
                        <td className="px-8 py-5">
                          <p className="font-bold text-sm text-[#1e3d5a]">{u.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-bold px-3 py-1 bg-white border rounded-lg uppercase tracking-wider ${
                            u.role === 'Super Admin' ? 'border-[#ee6b20] text-[#ee6b20]' : 'border-[#1e3d5a]/20 text-[#1e3d5a]'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'Active' ? 'text-emerald-500' : 'text-gray-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {u.status}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(u)} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#ee6b20] transition-all"><Edit3 size={16} /></button>
                            <button onClick={() => deactivateUser(u.id)} className={`p-2 hover:bg-white rounded-lg transition-all ${u.status === 'Active' ? 'text-red-400 hover:text-red-500' : 'text-emerald-400'}`}>
                                {u.status === 'Active' ? <UserMinus size={16} /> : <UserPlus size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* ACCOUNT PREFERENCES */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#1e3d5a]/5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Settings className="w-32 h-32 text-[#ee6b20]" />
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-black font-bold text-[#1e3d5a]">Account Preferences</h2>
                <p className="text-sm text-[#1e3d5a]/60 font-medium">Customize your PakiPark platform experience.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PreferenceToggle 
                  icon={<Bell className="w-5 h-5 text-[#ee6b20]" />} 
                  title="Email Notifications" 
                  description="Receive facility status updates and daily parking reports via email." 
                  checked={preferences.emailNotifications} 
                  onChange={() => togglePreference('emailNotifications')} 
                />
                <PreferenceToggle 
                  icon={<MessageSquare className="w-5 h-5 text-[#ee6b20]" />} 
                  title="SMS Updates" 
                  description="Get critical capacity alerts and security notifications on your phone." 
                  checked={preferences.smsUpdates} 
                  onChange={() => togglePreference('smsUpdates')} 
                />
                <PreferenceToggle 
                  icon={<Fingerprint className="w-5 h-5 text-[#ee6b20]" />} 
                  title="Two-Factor Auth" 
                  description="Secure your admin account with a secondary verification step." 
                  checked={preferences.twoFactor} 
                  onChange={() => togglePreference('twoFactor')} 
                />
                <PreferenceToggle 
                  icon={<Globe className="w-5 h-5 text-[#ee6b20]" />} 
                  title="Public Profile" 
                  description="Allow your facility contact card to be visible to verified logistics partners." 
                  checked={preferences.publicProfile} 
                  onChange={() => togglePreference('publicProfile')} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}