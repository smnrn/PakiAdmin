'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from '../../lib/router';
import { useAuth } from '../../contexts/AuthContext';
import PakiParkSidebar from '../../components/pakipark/PakiParkSidebar';
import {
  MapPin,
  Car,
  Zap,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Activity
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  total_spots: number;
  available_spots: number;
  pricePerHour: number;
  status: string;
  is_active: boolean;
  owner_id: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function ParkingAreasPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const displayName = (user?.name || "Juan Dela Cruz");

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [partners, setPartners] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // State
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);

  // Form State
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    total_spots: 100,
    price_per_hour: 50,
  });

  const [genConfig, setGenConfig] = useState({
    floors: 1,
    sections: 3,
    slotsPerSection: 20
  });

  const [assignOwnerId, setAssignOwnerId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    // Fetch Locations
    const { data: locs, error: locErr } = await supabase.schema('parking_lot').rpc('get_locations_with_stats');
    if (locs) setLocations(locs as ParkingLocation[]);
    else if (locErr) console.error('Error fetching locations:', locErr.message);

    // Fetch Partners
    const { data: profs, error: profErr } = await supabase.schema('account').rpc('get_staff_accounts');
    if (profs) {
      const p = (profs as Profile[]).filter(x => x.role === 'business_partner' || x.role === 'operator');
      setPartners(p);
    } else if (profErr) {
      console.error('Error fetching partners:', profErr.message);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateLocation = async () => {
    if (!newLocation.name || !newLocation.address) return;
    setActionLoading(true);

    const { error } = await supabase.schema('parking_lot').rpc('create_location', {
      p_name: newLocation.name,
      p_address: newLocation.address,
      p_total_spots: newLocation.total_spots,
      p_price_per_hour: newLocation.price_per_hour,
    });

    if (error) {
      console.error('Create location error:', error.message);
    } else {
      triggerSuccess(`Location "${newLocation.name}" created successfully.`);
      setShowCreateModal(false);
      setNewLocation({ name: '', address: '', total_spots: 100, price_per_hour: 50 });
      fetchData();
    }
    setActionLoading(false);
  };

  const handleGenerateSlots = async () => {
    if (!selectedLocation) return;
    setActionLoading(true);

    const { error } = await supabase.schema('parking_lot').rpc('generate_slots', {
      p_location_id: selectedLocation.id,
      p_floors: genConfig.floors,
      p_sections: genConfig.sections,
      p_slots_per_section: genConfig.slotsPerSection,
    });

    if (error) {
      console.error('Generate slots error:', error.message);
    } else {
      triggerSuccess(`Successfully generated slots for ${selectedLocation.name}.`);
      setShowGenerateModal(false);
      setSelectedLocation(null);
      fetchData();
    }
    setActionLoading(false);
  };

  const handleAssignPartner = async () => {
    if (!selectedLocation) return;
    setActionLoading(true);

    const { error } = await supabase.schema('parking_lot').rpc('assign_location_partner', {
      p_location_id: selectedLocation.id,
      p_owner_id: assignOwnerId || null,
    });

    if (error) {
      console.error('Assign partner error:', error.message);
    } else {
      triggerSuccess(`Successfully updated owner for ${selectedLocation.name}.`);
      setShowAssignModal(false);
      setSelectedLocation(null);
      setAssignOwnerId('');
      fetchData();
    }
    setActionLoading(false);
  };

  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    return !q || l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
  });

  const activeHubs = locations.filter(l => l.is_active).length;
  const totalSlots = locations.reduce((sum, l) => sum + (l.total_spots || 0), 0);

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans overflow-hidden text-[#1e3d5a] relative">
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#1e3d5a20;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#ee6b2040}` }} />

      <PakiParkSidebar activeTab="parking-areas" />

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3d5a]/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <Card className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1e3d5a]">New Parking Lot</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase tracking-widest ml-1">Facility Name</label>
                  <input type="text" placeholder="e.g. SM Mall of Asia (MOA)" value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase tracking-widest ml-1">Full Address</label>
                  <input type="text" placeholder="e.g. Seaside Blvd, Pasay City" value={newLocation.address} onChange={e => setNewLocation({ ...newLocation, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase tracking-widest ml-1">Total Spots</label>
                    <input type="number" min="1" value={newLocation.total_spots} onChange={e => setNewLocation({ ...newLocation, total_spots: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#1e3d5a]/40 uppercase tracking-widest ml-1">Base Rate (₱/hr)</label>
                    <input type="number" min="0" value={newLocation.price_per_hour} onChange={e => setNewLocation({ ...newLocation, price_per_hour: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold text-sm" />
                  </div>
                </div>
                <Button disabled={!newLocation.name || !newLocation.address || actionLoading} onClick={handleCreateLocation} className="w-full bg-[#ee6b20] hover:bg-[#ff7a2e] text-white rounded-xl py-6 font-bold mt-4 uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-50">
                  {actionLoading ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showGenerateModal && selectedLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3d5a]/40 backdrop-blur-sm" onClick={() => setShowGenerateModal(false)} />
          <Card className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-[#1e3d5a]">Generate Slots</h3>
                <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-6">For <span className="font-bold text-[#1e3d5a]">{selectedLocation.name}</span></p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center bg-[#f4f7fa] p-4 rounded-xl border border-[#1e3d5a]/5">
                  <span className="text-xs font-bold text-[#1e3d5a]/70">Floors</span>
                  <input type="number" min="1" value={genConfig.floors} onChange={e => setGenConfig({...genConfig, floors: Number(e.target.value)})} className="w-16 px-2 py-1 text-center font-bold text-[#1e3d5a] rounded-lg border border-[#1e3d5a]/10 outline-none" />
                </div>
                <div className="flex justify-between items-center bg-[#f4f7fa] p-4 rounded-xl border border-[#1e3d5a]/5">
                  <span className="text-xs font-bold text-[#1e3d5a]/70">Sections/Floor</span>
                  <input type="number" min="1" max="10" value={genConfig.sections} onChange={e => setGenConfig({...genConfig, sections: Number(e.target.value)})} className="w-16 px-2 py-1 text-center font-bold text-[#1e3d5a] rounded-lg border border-[#1e3d5a]/10 outline-none" />
                </div>
                <div className="flex justify-between items-center bg-[#f4f7fa] p-4 rounded-xl border border-[#1e3d5a]/5">
                  <span className="text-xs font-bold text-[#1e3d5a]/70">Slots/Section</span>
                  <input type="number" min="1" value={genConfig.slotsPerSection} onChange={e => setGenConfig({...genConfig, slotsPerSection: Number(e.target.value)})} className="w-16 px-2 py-1 text-center font-bold text-[#1e3d5a] rounded-lg border border-[#1e3d5a]/10 outline-none" />
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 font-medium">This will overwrite any existing slots and auto-generate <span className="font-black">{genConfig.floors * genConfig.sections * genConfig.slotsPerSection}</span> new spots.</p>
              </div>

              <Button disabled={actionLoading} onClick={handleGenerateSlots} className="w-full bg-[#1e3d5a] hover:bg-[#2a5373] text-white rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest disabled:opacity-50">
                {actionLoading ? 'Generating...' : 'Confirm Generation'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showAssignModal && selectedLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3d5a]/40 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <Card className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#1e3d5a]">Assign Franchise</h3>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              <p className="text-sm text-[#1e3d5a]/60 font-medium mb-4">Assign business partner to <span className="font-bold text-[#1e3d5a]">{selectedLocation.name}</span>.</p>
              <select value={assignOwnerId} onChange={e => setAssignOwnerId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#1e3d5a]/10 bg-[#f4f7fa] outline-none focus:bg-white transition-all font-bold text-sm appearance-none mb-4">
                <option value="">— Unassigned (Company Owned) —</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <Button disabled={actionLoading} onClick={handleAssignPartner} className="w-full bg-[#1e3d5a] hover:bg-[#2a5373] text-white rounded-xl py-4 font-bold uppercase text-[10px] tracking-widest disabled:opacity-50">
                {actionLoading ? 'Assigning...' : 'Update Owner'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#1e3d5a]/10 px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 bg-[#f4f7fa] px-4 py-2 rounded-xl border border-[#1e3d5a]/10 w-80">
            <Search className="w-4 h-4 text-[#1e3d5a]/60" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facilities..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#1e3d5a]/40 font-medium text-[#1e3d5a]" />
          </div>
          <div className="flex items-center gap-4">
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /><span className="text-sm font-bold">{successMsg}</span>
              </div>
            )}
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 hover:bg-[#f4f7fa] px-3 py-2 rounded-xl transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1e3d5a] to-[#2a5373] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-[#1e3d5a] hidden md:block">{displayName}</span>
                <ChevronDown className={`w-4 h-4 text-[#1e3d5a] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#1e3d5a]/10 overflow-hidden z-50">
                  <button onClick={() => { setIsUserMenuOpen(false); navigate('/pakipark/profile'); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left"><User className="w-4 h-4 text-[#ee6b20]" /><span className="font-semibold text-[#1e3d5a]">Profile</span></button>
                  <button onClick={() => { setIsUserMenuOpen(false); navigate('/pakipark/settings'); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f4f7fa] text-left"><Settings className="w-4 h-4 text-[#ee6b20]" /><span className="font-semibold text-[#1e3d5a]">Settings</span></button>
                  <div className="border-t border-[#1e3d5a]/10" />
                  <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-left"><LogOut className="w-4 h-4 text-red-500" /><span className="font-semibold text-red-500">Logout</span></button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-[#1e3d5a] tracking-tight">Parking Areas</h1>
              <p className="text-[#1e3d5a] opacity-60 font-medium italic mt-1">Manage franchise hubs, slot capacity, and operator coverage.</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-[#ee6b20] hover:bg-[#ff7a2e] text-white rounded-xl font-bold h-10 px-5 shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Add Location
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Active Hubs', value: activeHubs, icon: MapPin, color: '#1e3d5a' },
              { label: 'Total Capacity', value: totalSlots.toLocaleString(), icon: Car, color: '#ee6b20' },
              { label: 'Franchise Owners', value: Array.from(new Set(locations.filter(l => l.owner_id).map(l => l.owner_id))).length, icon: Briefcase, color: '#8b5cf6' },
            ].map(stat => (
              <Card key={stat.label} className="bg-white rounded-[2rem] border-none shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon size={22} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#1e3d5a]">{stat.value}</p>
                    <p className="text-xs font-bold text-[#1e3d5a]/50 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card className="bg-white rounded-[2.5rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-[#f4f7fa]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#f4f7fa] rounded-2xl text-[#ee6b20]"><Activity size={22} /></div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#1e3d5a]">Hub Directory</CardTitle>
                  <CardDescription className="text-xs font-medium text-gray-400">{filtered.length} facilities active</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-[#1e3d5a]/20 border-t-[#ee6b20] rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="w-10 h-10 text-[#1e3d5a]/20 mx-auto mb-3" />
                  <p className="font-bold text-[#1e3d5a]/50">No locations found</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f4f7fa] border-b border-[#1e3d5a]/5 text-[10px] uppercase font-bold text-[#1e3d5a]/40 sticky top-0 z-10">
                    <tr>
                      <th className="px-8 py-4">Facility Name</th>
                      <th className="px-8 py-4">Capacity</th>
                      <th className="px-8 py-4">Base Rate</th>
                      <th className="px-8 py-4">Owner / Partner</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e3d5a]/5">
                    {filtered.map(l => {
                      const ownerName = partners.find(p => p.id === l.owner_id)?.full_name;
                      return (
                        <tr key={l.id} className="hover:bg-[#f4f7fa]/50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-bold text-sm text-[#1e3d5a]">{l.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[250px]" title={l.address}>{l.address}</p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3d5a]">
                              <Car size={14} className="text-[#ee6b20]" />
                              {l.total_spots} slots
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-[#1e3d5a]">
                            ₱{l.pricePerHour}/hr
                          </td>
                          <td className="px-8 py-5">
                            {l.owner_id ? (
                              <span className="text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border border-purple-200 text-purple-600 bg-purple-50">
                                {ownerName || 'Unknown Partner'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">— Unassigned</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setSelectedLocation(l); setGenConfig({ floors: 1, sections: 3, slotsPerSection: Math.floor(l.total_spots / 3) || 10 }); setShowGenerateModal(true); }}
                                className="p-2 hover:bg-[#f4f7fa] rounded-lg text-gray-400 hover:text-[#ee6b20] transition-all"
                                title="Auto-Generate Slots"
                              >
                                <Car size={16} />
                              </button>
                              <button
                                onClick={() => { setSelectedLocation(l); setAssignOwnerId(l.owner_id || ''); setShowAssignModal(true); }}
                                className="p-2 hover:bg-[#f4f7fa] rounded-lg text-gray-400 hover:text-[#1e3d5a] transition-all"
                                title="Assign Partner"
                              >
                                <Briefcase size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
