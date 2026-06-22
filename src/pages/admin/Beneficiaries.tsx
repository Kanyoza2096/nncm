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
  Heart
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
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
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
    status: 'active'
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
      status: ben.status || 'active'
    });
    setEditId(ben.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this church member record?')) {
      try {
        await beneficiaryService.deleteBeneficiary(id);
        toast.success('Member record deleted successfully.');
        fetchBeneficiaries();
      } catch (err) {
        toast.error('Could not delete member record.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editId) {
        await beneficiaryService.updateBeneficiary(editId, formData);
        toast.success('Member record updated successfully.');
      } else {
        await beneficiaryService.addBeneficiary(formData as Omit<Beneficiary, 'id'>);
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
        status: 'active'
      });
      fetchBeneficiaries();
    } catch (err) {
      toast.error('Could not save record.');
    }
  };

  const filtered = beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          b.email?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Local Resident', 'Refugee Household', 'Orphaned Family', 'Displaced Household'];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Church Family Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track membership for pastoral shepherding.</p>
        </div>
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
              status: 'active'
            });
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Member Record
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Souls</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{beneficiaries.length} Registered</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Members</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{beneficiaries.filter(b => b.status === 'active').length} Souls</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><Heart className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Trained Disciples</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">85 Core</h4>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or family Ref ID..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
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
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shepherdhood Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 animate-pulse font-bold">Synchronizing membership records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">No family members found matching criteria.</td></tr>
              ) : (
                filtered.map((ben) => (
                  <tr key={ben.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
                          {ben.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{ben.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{ben.email || 'No email provided'}</p>
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
                        <Clock className="w-3 h-3" /> {new Date().toLocaleDateString()}
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
                            onClick={() => handleDelete(ben.id)}
                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete Member Record"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                         className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium  dark:text-white"
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
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Ministry Category</label>
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
                         onChange={e => setFormData({...formData, gender: e.target.value as any})}
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
                         onChange={e => setFormData({...formData, age: Number(e.target.value) || 0})} 
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
    </div>
  );
}
