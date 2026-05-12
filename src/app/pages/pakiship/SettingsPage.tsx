import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Settings,
  LogOut,
  CheckCircle2,
  Users,
  User,
  Search,
  ChevronDown,
  X,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldAlert,
  Edit3,
  UserMinus,
  Bell,
  MessageSquare,
  Fingerprint,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import PakiShipSidebar from '../../components/pakiship/PakiShipSidebar';

// --- SUB-COMPONENT: PREFERENCE TOGGLE ---
const PreferenceToggle = ({ icon, title, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-6 bg-[#F0F9F8]/40 rounded-[1.8rem] border border-[#39B5A8]/5 hover:border-[#39B5A8]/20 transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#39B5A8]/10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-bold text-[#041614]">{title}</p>
        <p className="text-xs text-[#1A5D56]/60 font-medium max-w-[200px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    <Switch 
      checked={checked} 
      onCheckedChange={onChange}
      className="data-[state=checked]:bg-[#39B5A8]"
    />
  </div>
);

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE LOGIC ---
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password Form State
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [passwordError, setPasswordError] = useState(""); 

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
    { id: 2, name: "Martha Burgos", email: "marthaburgos@pakiadmin.ph", role: "Full Access", status: "Active" },
    { id: 3, name: "Rhea Rivera", email: "rhearivera@pakiadmin.ph", role: "View Only", status: "Inactive" },
    { id: 4, name: "Justin Perez", email: "justinperez@pakiadmin.ph", role: "Limited Access", status: "Active" },
    { id: 5, name: "Patricia Gonzaga", email: "patriciagonzaga@pakiadmin.ph", role: "View Only", status: "Active" },
    { id: 6, name: "Raphael Santos", email: "rapahaelsantos@pakiadmin.ph", role: "Limited Access", status: "Active" },
  ]);

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
    triggerSuccess(`${newUser.name} added to the team!`);
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", role: "View Only" });
  };

  const handleUpdateUser = () => {
    setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
    triggerSuccess(`Staff profile updated.`);
    setShowEditUserModal(false);
  };

  const handleChangePassword = () => {
    setPasswordError(""); 
    if (!passwords.current || !passwords.next || !passwords.confirm) {
        setPasswordError("All fields are required for security.");
        return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowPasswordModal(false);
      setPasswords({ current: "", next: "", confirm: "" });
      triggerSuccess("Admin credentials secured.");
    }, 1500);
  };

  const placeholderName = "Juan Dela Cruz";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F0F9F8] font-sans text-[#1A5D56] relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #39B5A840; border-radius: 10px; }
      `}} />

      <PakiShipSidebar activeTab="settings" />

      {/* --- PASSWORD MODAL --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#041614]/60 backdrop-blur-md" onClick={() => { setShowPasswordModal(false); setPasswordError(""); }}></div>
          <Card className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F0F9F8] rounded-lg"><Lock className="w-5 h-5 text-[#39B5A8]" /></div>
                        <h3 className="text-xl font-bold text-[#041614]">Security Access</h3>
                    </div>
                    <button onClick={() => { setShowPasswordModal(false); setPasswordError(""); }} className="p-2 hover:bg-[#F0F9F8] rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                {passwordError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                    <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5" />
                    <p className="text-xs font-bold text-red-600">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-4">
                    <input type={showPass ? "text" : "password"} placeholder="Current Password" className="w-full px-4 py-3 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]/30 outline-none font-bold" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} placeholder="New Password" className="w-full px-4 py-3 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]/30 outline-none font-bold" value={passwords.next} onChange={(e) => setPasswords({...passwords, next: e.target.value})} />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#39B5A8]">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <input type={showPass ? "text" : "password"} placeholder="Confirm New Password" className="w-full px-4 py-3 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]/30 outline-none font-bold" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                    <Button onClick={handleChangePassword} className="w-full bg-[#39B5A8] hover:bg-[#2F9D91] text-white rounded-xl py-6 font-bold shadow-lg uppercase text-[10px] tracking-widest">
                      {isSaving ? "Authorizing..." : "Update Security Credentials"}
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- ADD/EDIT MODALS --- */}
      {(showAddUserModal || showEditUserModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#041614]/40 backdrop-blur-sm" onClick={() => { setShowAddUserModal(false); setShowEditUserModal(false); }}></div>
          <Card className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#041614]">{showAddUserModal ? "Add Team Member" : "Edit Staff Profile"}</h3>
                <button onClick={() => { setShowAddUserModal(false); setShowEditUserModal(false); }} className="p-2 hover:bg-[#F0F9F8] rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1A5D56]/40 uppercase ml-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]/30 outline-none focus:bg-white transition-all font-bold" value={showAddUserModal ? newUser.name : currentUser?.name} onChange={(e) => showAddUserModal ? setNewUser({...newUser, name: e.target.value}) : setCurrentUser({...currentUser, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1A5D56]/40 uppercase ml-1">Work Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]/30 outline-none focus:bg-white transition-all font-bold" value={showAddUserModal ? newUser.email : currentUser?.email} onChange={(e) => showAddUserModal ? setNewUser({...newUser, email: e.target.value}) : setCurrentUser({...currentUser, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1A5D56]/40 uppercase ml-1">System Role</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-[#39B5A8]/10 bg-[#F0F9F8]/30 outline-none focus:bg-white transition-all font-bold appearance-none" value={showAddUserModal ? newUser.role : currentUser?.role} onChange={(e) => showAddUserModal ? setNewUser({...newUser, role: e.target.value}) : setCurrentUser({...currentUser, role: e.target.value})}>
                    {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <Button onClick={showAddUserModal ? handleAddUser : handleUpdateUser} className="w-full bg-[#39B5A8] hover:bg-[#2F9D91] text-white rounded-xl py-6 font-bold mt-4 uppercase text-[10px] tracking-widest shadow-lg">
                  {showAddUserModal ? "Invite" : "Update Permissions"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* REPLICATED ANALYTICS HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#39B5A8]/10 px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-[#F0F9F8] px-4 py-2 rounded-xl border border-[#39B5A8]/10 w-180">
              <Search className="w-4 h-4 text-[#39B5A8]/60" />
              <input
                type="text"
                placeholder="Search settings..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#39B5A8]/40 font-medium text-[#1A5D56]"
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
                  <button onClick={() => navigate('/pakiship/profile')} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-[#041614]">
                    <User className="w-4 h-4 text-[#39B5A8]" /> Profile
                  </button>
                  <button onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F0F9F8] transition-colors text-left font-semibold text-[#041614]">
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

        <main className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#041614] tracking-tight">Admin Settings</h1>
            <p className="text-[#1A5D56] opacity-70 font-medium italic">Manage preferences and team access.</p>
            </div>
            {showSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-bold">{successMessage}</span>
              </div>
            )}
          </div>

          {/* --- TEAM MANAGEMENT TABLE --- */}
          <Card className="bg-white rounded-[2.5rem] border-[#39B5A8]/10 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <CardHeader className="p-8 border-b border-[#39B5A8]/5 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F0F9F8] rounded-2xl"><Users className="w-5 h-5 text-[#39B5A8]" /></div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[#041614]">Team Management</CardTitle>
                    <CardDescription className="text-xs font-medium text-[#1A5D56]/60">Add, edit or deactivate system users</CardDescription>
                  </div>
                </div>
                <Button onClick={() => setShowAddUserModal(true)} className="bg-[#39B5A8] hover:bg-[#2F9D91] text-white rounded-xl font-bold h-12 px-5 transition-all shadow-lg shadow-[#39B5A8]/20">
                  <UserPlus className="w-4 h-4 mr-2" /> Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F0F9F8] border-b border-[#39B5A8]/10 text-[10px] uppercase font-bold text-[#39B5A8] sticky top-0 z-10">
                  <tr>
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#39B5A8]/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F0F9F8]/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-sm text-[#041614]">{u.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold px-3 py-1 bg-white border rounded-lg uppercase tracking-wider ${
                          u.role === 'Super Admin' ? 'border-[#39B5A8] text-[#39B5A8]' : 'border-[#39B5A8]/20 text-[#041614]'
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
                          <button onClick={() => openEditModal(u)} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#39B5A8] transition-all"><Edit3 size={16} /></button>
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

          {/* --- ACCOUNT PREFERENCES --- */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#39B5A8]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Settings className="w-32 h-32 text-[#39B5A8]" />
            </div>
            
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black font-bold text-[#041614]">Account Preferences</h2>
                <p className="text-sm text-[#1A5D56]/60 font-medium">Customize how you interact with the PakiShip platform.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PreferenceToggle 
                icon={<Bell className="w-5 h-5 text-[#39B5A8]" />} 
                title="Email Notifications" 
                description="Receive system updates and report alerts via your registered email." 
                checked={preferences.emailNotifications} 
                onChange={() => togglePreference('emailNotifications')} 
              />
              <PreferenceToggle 
                icon={<MessageSquare className="w-5 h-5 text-[#39B5A8]" />} 
                title="SMS Updates" 
                description="Get critical delivery and security alerts directly to your phone." 
                checked={preferences.smsUpdates} 
                onChange={() => togglePreference('smsUpdates')} 
              />
              <PreferenceToggle 
                icon={<Fingerprint className="w-5 h-5 text-[#39B5A8]" />} 
                title="Two-Factor Auth" 
                description="Add an extra layer of security to your admin account logins." 
                checked={preferences.twoFactor} 
                onChange={() => togglePreference('twoFactor')} 
              />
              <PreferenceToggle 
                icon={<Globe className="w-5 h-5 text-[#39B5A8]" />} 
                title="Public Profile" 
                description="Allow other logistics coordinators to view your professional contact card." 
                checked={preferences.publicProfile} 
                onChange={() => togglePreference('publicProfile')} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}