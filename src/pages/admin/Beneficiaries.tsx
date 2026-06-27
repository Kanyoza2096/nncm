import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  History,
  Heart,
  AlertCircle,
  Loader2,
  Zap,
  Shield,
  Baby,
  Sparkles
} from 'lucide-react';
import { beneficiaryService } from '../../services/beneficiaries';
import { Beneficiary } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Deletion confirmation states
  const [deleteConfirmBen, setDeleteConfirmBen] = useState<Beneficiary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Beneficiary>>({
    name: '',
    phone: '',
    email: '',
    category: 'Local Resident',
    address: '',
    gender: 'male',
    location: '',
    maritalStatus: 'single',
    childrenCount: 0,
    occupation: '',
    age: 30,
    status: 'active',
    churchGroup: 'General Congregation'
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const data = await beneficiaryService.getBeneficiaries();
      setBeneficiaries(data);
    } catch (err) {
      toast.error('Failed to sync family members list.');
    } finally {
      setLoading(false);
    }
  };

  // Smart helper to get or resolve member's demographic group
  const getMemberGroup = (b: Beneficiary): string => {
    if (b.churchGroup) return b.churchGroup;
    // Fallback: Smart auto-resolve based on age & gender if missing
    if (b.age <= 12) return "Children's Ministry";
    if (b.age > 12 && b.age <= 35) return "Youths";
    if (b.gender === 'female') return "Women's Fellowship";
    if (b.gender === 'male') return "Men's Fellowship";
    return "General Congregation";
  };

  // Smart helper for auto-assign suggestion inside the form
  const getRecommendedGroup = (age: number, gender: string): string => {
    if (age <= 12) return "Children's Ministry";
    if (age > 12 && age <= 35) return "Youths";
    if (gender === 'female') return "Women's Fellowship";
    if (gender === 'male') return "Men's Fellowship";
    return "General Congregation";
  };

  const handleGenderChange = (genderVal: 'male' | 'female' | 'other') => {
    const ageVal = formData.age || 30;
    const recommendedGroup = getRecommendedGroup(ageVal, genderVal);
    setFormData(prev => ({
      ...prev,
      gender: genderVal,
      churchGroup: recommendedGroup
    }));
  };

  const handleAgeChange = (ageVal: number) => {
    const genderVal = formData.gender || 'male';
    const recommendedGroup = getRecommendedGroup(ageVal, genderVal);
    setFormData(prev => ({
      ...prev,
      age: ageVal,
      churchGroup: recommendedGroup
    }));
  };

  const handleEdit = (ben: Beneficiary) => {
    setFormData({
      name: ben.name,
      phone: ben.phone || '',
      email: ben.email || '',
      category: ben.category || 'Local Resident',
      address: ben.address || '',
      gender: ben.gender || 'male',
      location: ben.location || '',
      maritalStatus: ben.maritalStatus || 'single',
      childrenCount: ben.childrenCount || 0,
      occupation: ben.occupation || '',
      age: ben.age || 30,
      status: ben.status || 'active',
      churchGroup: ben.churchGroup || getMemberGroup(ben)
    });
    setEditId(ben.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmBen) return;
    setIsDeleting(true);
    try {
      await beneficiaryService.deleteBeneficiary(deleteConfirmBen.id);
      toast.success('Member record deleted successfully.');
      setDeleteConfirmBen(null);
      fetchBeneficiaries();
    } catch (err) {
      toast.error('Could not delete member record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        // Make sure churchGroup is correctly populated
        churchGroup: formData.churchGroup || getRecommendedGroup(formData.age || 30, formData.gender || 'male')
      };

      if (isEditing && editId) {
        await beneficiaryService.updateBeneficiary(editId, payload);
        toast.success('Member record updated successfully.');
      } else {
        await beneficiaryService.addBeneficiary(payload as Omit<Beneficiary, 'id'>);
        toast.success('Member record established successfully.');
      }
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'Local Resident',
        address: '',
        gender: 'male',
        location: '',
        maritalStatus: 'single',
        childrenCount: 0,
        occupation: '',
        age: 30,
        status: 'active',
        churchGroup: 'General Congregation'
      });
      fetchBeneficiaries();
    } catch (err) {
      toast.error('Could not save record.');
    }
  };

  const filtered = beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          (b.email && b.email.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    
    const groupName = getMemberGroup(b);
    const matchesGroup = selectedGroup === 'All' || groupName === selectedGroup;
    
    return matchesSearch && matchesCat && matchesGroup;
  });

  const categories = ['All', 'Local Resident', 'Refugee Household', 'Orphaned Family', 'Displaced Household'];

  // Compute stats for each group dynamically
  const youthCount = beneficiaries.filter(b => getMemberGroup(b) === 'Youths').length;
  const womenCount = beneficiaries.filter(b => getMemberGroup(b) === "Women's Fellowship").length;
  const menCount = beneficiaries.filter(b => getMemberGroup(b) === "Men's Fellowship").length;
  const childrenCount = beneficiaries.filter(b => getMemberGroup(b) === "Children's Ministry").length;
  const generalCount = beneficiaries.filter(b => getMemberGroup(b) === 'General Congregation').length;

  const demographicGroups = [
    {
      id: 'Youths',
      name: 'Youths Ministry',
      alias: 'Nature Shakers',
      leaders: 'Pastor Caleb Banda & John Chiumia',
      count: youthCount,
      color: 'purple',
      icon: Zap,
      bgStyle: 'bg-purple-50 hover:bg-purple-100/70 border-purple-150 dark:bg-purple-950/20 dark:border-purple-900',
      textStyle: 'text-purple-600 dark:text-purple-400',
      activeStyle: 'ring-2 ring-purple-500 border-purple-500 shadow-purple-100 dark:shadow-none'
    },
    {
      id: "Women's Fellowship",
      name: "Women's Fellowship",
      alias: 'Daughters of Grace',
      leaders: 'Pastor Mercy Mkandawire',
      count: womenCount,
      color: 'rose',
      icon: Sparkles,
      bgStyle: 'bg-rose-50 hover:bg-rose-100/70 border-rose-150 dark:bg-rose-950/20 dark:border-rose-900',
      textStyle: 'text-rose-600 dark:text-rose-400',
      activeStyle: 'ring-2 ring-rose-500 border-rose-500 shadow-rose-100 dark:shadow-none'
    },
    {
      id: "Men's Fellowship",
      name: "Men's Fellowship",
      alias: 'Kingdom Pillars',
      leaders: 'Elder John Banda',
      count: menCount,
      color: 'blue',
      icon: Shield,
      bgStyle: 'bg-blue-50 hover:bg-blue-100/70 border-blue-150 dark:bg-blue-950/20 dark:border-blue-900',
      textStyle: 'text-blue-600 dark:text-blue-400',
      activeStyle: 'ring-2 ring-blue-500 border-blue-500 shadow-blue-100 dark:shadow-none'
    },
    {
      id: "Children's Ministry",
      name: "Children's Ministry",
      alias: 'NNCM Kids Club',
      leaders: 'Sister Sandra Phiri & Martha Gondwe',
      count: childrenCount,
      color: 'amber',
      icon: Baby,
      bgStyle: 'bg-amber-50 hover:bg-amber-100/70 border-amber-150 dark:bg-amber-950/20 dark:border-amber-900',
      textStyle: 'text-amber-600 dark:text-amber-400',
      activeStyle: 'ring-2 ring-amber-500 border-amber-500 shadow-amber-100 dark:shadow-none'
    }
  ];

  const groupColors: Record<string, string> = {
    'Youths': 'bg-purple-50 text-purple-700 border border-purple-150 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    "Women's Fellowship": 'bg-rose-50 text-rose-700 border border-rose-150 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    "Men's Fellowship": 'bg-blue-50 text-blue-700 border border-blue-150 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    "Children's Ministry": 'bg-amber-50 text-amber-700 border border-amber-150 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    'General Congregation': 'bg-slate-50 text-slate-600 border border-slate-150 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-800'
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Church Family Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage, filter, and track membership departments for effective pastoral shepherding.</p>
        </div>
        <div className="flex gap-2">
          {selectedGroup !== 'All' && (
            <button 
              onClick={() => setSelectedGroup('All')}
              className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-250 dark:hover:bg-slate-750 text-xs font-bold rounded-xl transition-all"
            >
              Clear Group Roster Filter
            </button>
          )}
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditId(null);
              setFormData({
                name: '',
                phone: '',
                email: '',
                category: 'Local Resident',
                address: '',
                gender: 'male',
                location: '',
                maritalStatus: 'single',
                childrenCount: 0,
                occupation: '',
                age: 30,
                status: 'active',
                churchGroup: 'Youths' // Starts suggested youth default
              });
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Member Record
          </button>
        </div>
      </div>

      {/* Professional Church Demographic Division Cards */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.15em] flex items-center gap-1.5">
            <span>Demographic Departments & Guilds</span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"></span>
          </h3>
          <span className="text-[10px] text-slate-400">Click a card to filter roster instantly</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demographicGroups.map((g) => {
            const Icon = g.icon;
            const isSelected = selectedGroup === g.id;
            return (
              <motion.div 
                whileHover={{ y: -3 }}
                key={g.id}
                onClick={() => setSelectedGroup(isSelected ? 'All' : g.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${g.bgStyle} ${
                  isSelected ? g.activeStyle : 'border-slate-150 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shadow-sm ${g.textStyle}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-slate-900/80 text-slate-400'
                  }`}>
                    {isSelected ? 'Active Filter' : `${g.count} Saints`}
                  </span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{g.name}</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5 font-medium">{g.alias}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-0.5 text-[9px]">
                  <span className="text-slate-400">Pastoral Leader:</span>
                  <span className="text-slate-700 dark:text-slate-350 font-semibold truncate">{g.leaders}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${selectedGroup === 'All' ? 'all' : selectedGroup.toLowerCase()} members by name or email...`}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1 shrink-0">Outreach:</span>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  selectedCategory === cat 
                  ? 'bg-[#020617] text-white' 
                  : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saints Profile</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shepherdhood Tag</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 animate-pulse font-bold">Synchronizing membership records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">No family members found matching criteria in {selectedGroup} roster.</td></tr>
              ) : (
                filtered.map((ben) => {
                  const mGroup = getMemberGroup(ben);
                  const colorClass = groupColors[mGroup] || groupColors['General Congregation'];

                  return (
                    <tr key={ben.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
                            {ben.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{ben.name}</p>
                              <span className="text-[10px] text-slate-400 font-medium">({ben.age} yrs, {ben.gender})</span>
                            </div>
                            <p className="text-[10px] text-slate-450 mt-1 font-mono">{ben.email || 'No email provided'}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${colorClass}`}>
                                {mGroup}
                              </span>
                              {ben.phone && (
                                <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                                  <Phone className="w-2.5 h-2.5 inline" /> {ben.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{ben.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          ben.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                        }`}>
                          {ben.status === 'active' ? (
                            <><CheckCircle2 className="w-2.5 h-2.5 mr-1.5" /> Active</>
                          ) : (
                            <><XCircle className="w-2.5 h-2.5 mr-1.5" /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                          <Clock className="w-3 h-3" /> {new Date(ben.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                              onClick={() => handleEdit(ben)}
                              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit Member Record"
                           >
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                              onClick={() => setDeleteConfirmBen(ben)}
                              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete Member Record"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   {isEditing ? <Edit2 className="w-5 h-5 text-indigo-650" /> : <Plus className="w-5 h-5 text-indigo-600" />} {isEditing ? 'Edit Member Registry' : 'New Member Registry'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Legal Full Name</label>
                       <input 
                         required 
                         type="text" 
                         value={formData.name} 
                         onChange={e => setFormData({...formData, name: e.target.value})} 
                         placeholder="e.g. Samuel Nkandawire" 
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Email</label>
                       <input 
                         type="email" 
                         value={formData.email} 
                         onChange={e => setFormData({...formData, email: e.target.value})} 
                         placeholder="samuel@email.com" 
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Phone / WhatsApp</label>
                       <input 
                         required 
                         type="tel" 
                         value={formData.phone} 
                         onChange={e => setFormData({...formData, phone: e.target.value})} 
                         placeholder="+265..." 
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Outreach Classification</label>
                       <select 
                         value={formData.category} 
                         onChange={e => setFormData({...formData, category: e.target.value as any})}
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-bold text-slate-900 dark:text-white"
                       >
                          {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Gender</label>
                       <select 
                         value={formData.gender || 'male'} 
                         onChange={e => handleGenderChange(e.target.value as any)}
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-bold text-slate-900 dark:text-white"
                       >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other / Couple / Family</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Marital Status</label>
                       <select 
                         value={formData.maritalStatus || 'single'} 
                         onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none font-bold text-slate-900 dark:text-white"
                       >
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                          <option value="widowed">Widowed</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Age</label>
                       <input 
                         type="number" 
                         min={0}
                         max={150}
                         value={formData.age === undefined ? '' : formData.age} 
                         onChange={e => handleAgeChange(Number(e.target.value) || 0)} 
                         placeholder="e.g. 30" 
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium dark:text-white"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Children Count</label>
                       <input 
                         type="number" 
                         min={0}
                         max={50}
                         value={formData.childrenCount === undefined ? '' : formData.childrenCount} 
                         onChange={e => setFormData({...formData, childrenCount: Number(e.target.value) || 0})} 
                         placeholder="0" 
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium dark:text-white"
                       />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <label className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Church Demographic Division</label>
                       <select 
                         value={formData.churchGroup || 'General Congregation'} 
                         onChange={e => setFormData({...formData, churchGroup: e.target.value})}
                         className="w-full px-4 py-3 mt-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none font-bold text-slate-900 dark:text-white"
                       >
                          <option value="Youths">Youths (Ages 13-35)</option>
                          <option value="Women's Fellowship">Women's Fellowship</option>
                          <option value="Men's Fellowship">Men's Fellowship</option>
                          <option value="Children's Ministry">Children's Ministry (Ages 0-12)</option>
                          <option value="General Congregation">General Congregation</option>
                       </select>
                       <p className="text-[9px] text-slate-400 mt-1.5 font-medium leading-normal">
                         💡 <strong>Smart automation active:</strong> The system automatically selects the correct division based on the entered age and gender. You can manually override this suggestion if needed.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Local Address</label>
                    <textarea 
                      rows={3} 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      placeholder="Street, City, District..." 
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium dark:text-white"
                    />
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest">Discard Entry</button>
                    <button type="submit" className="flex-1 py-3.5 bg-indigo-600 hover:bg-slate-950 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all active:scale-95">{isEditing ? 'Save Changes' : 'Complete Enrollment'}</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Member deletion */}
      <AnimatePresence>
        {deleteConfirmBen && (
          <div className="fixed inset-0 z-50 bg-[#020617]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /> Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-2.5 leading-relaxed">
                Are you sure you want to delete member record for <span className="font-extrabold text-slate-800 dark:text-slate-200">"{deleteConfirmBen.name}"</span>? This will permanently remove them from the church membership rolls.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmBen(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
