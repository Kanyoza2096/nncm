import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Activity,
  HeartHandshake,
  Loader2,
  X
} from 'lucide-react';
import { volunteerService } from '../../services/volunteers';
import { Volunteer } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Ushering',
    skillsStr: '',
    availability: 'Weekends'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const data = await volunteerService.getVolunteers();
      setVolunteers(data);
    } catch (err) {
      toast.error('Workforce registry unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Identity name and contact email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const skillsArray = formData.skillsStr 
        ? formData.skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [formData.department + ' Support'];
      await volunteerService.registerVolunteer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        skills: skillsArray,
        availability: formData.availability,
        status: 'active'
      } as any);
      toast.success('Spiritual servant enlisted successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Ushering',
        skillsStr: '',
        availability: 'Weekends'
      });
      fetchVolunteers();
    } catch (err) {
      toast.error('Failed to enlist servant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!window.confirm('Are you sure you want to retire this servant from active ministry duty?')) return;
    try {
      await volunteerService.deleteVolunteer(id);
      toast.success('Servant profile retired from active ledger.');
      fetchVolunteers();
    } catch (err) {
      toast.error('Failed to retire servant.');
    }
  };

  const filtered = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          (v.phone && v.phone.includes(search));
    const matchesDept = selectedDept === 'All' || v.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const depts = ['All', 'Ushering', 'Choir', 'Media', 'Cleaning', 'Security', 'Welfare'];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Ministry Servers List</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Coordinating the spiritual workforce across all departments.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
        >
          <Plus className="w-4 h-4" /> Enlist New Server
        </button>
      </div>

      {/* Workforce Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Pool</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{volunteers.length} Levites</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 sm:col-span-2 relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Sparkles className="w-32 h-32 scale-150 rotate-12" />
            </div>
            <div className="relative z-10">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Weekly Service Deployment</span>
               <h4 className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">85% Capacity Ready</h4>
            </div>
            <div className="relative z-10 flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-500">
                    {String.fromCharCode(64+i)}
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-[#0b1120] text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
               <Activity className="w-3.5 h-3.5" /> 
               <span className="text-[9px] font-black uppercase tracking-widest">Growth</span>
            </div>
            <h4 className="text-xl font-black">+4 Joining</h4>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40 dark:bg-slate-800/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, or department..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
             {depts.map(d => (
               <button 
                 key={d} 
                 onClick={() => setSelectedDept(d)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                   selectedDept === d 
                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                     : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-indigo-100'
                 }`}
               >
                 {d}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Servant Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Dept</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance Index</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Join Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Mgmt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Establishing workforce connection...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No spiritual servers located in current department search.</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm">
                             {v.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{v.name}</p>
                             <p className="text-[10px] font-mono text-slate-400 mt-1.5">{v.phone}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="inline-flex px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/40">
                          {v.department}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Exceptional
                       </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-400 font-mono italic">
                       {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDeleteVolunteer(v.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/25 rounded-lg transition-colors cursor-pointer"
                          >
                             <Trash2 className="w-4 items-center justify-center h-4" />
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
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-indigo-600 animate-pulse" /> Enlist New Server
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-1">Register local Levites and helpers to specific ministry workflows.</p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Brother Thomas Phiri" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Contact Email *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. thomas@gmail.com" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +265 888 12 34 56" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Ministry Department</label>
                    <select 
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    >
                      <option value="Ushering">Ushering & Protocol</option>
                      <option value="Choir">Praising Choir & Worship</option>
                      <option value="Media">Media & Technical Support</option>
                      <option value="Cleaning">Sanctuary Cleaning & Care</option>
                      <option value="Security">Security & Orderly</option>
                      <option value="Welfare">Welfare, Relief & Hospitality</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Availability Cycle</label>
                    <select 
                      value={formData.availability}
                      onChange={e => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    >
                      <option value="Weekends">Sundays & Saturday Rehearsals</option>
                      <option value="Weekdays">Midweek fellowships / Night vigils</option>
                      <option value="Flexible">Full-Time availability</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Skills & Spiritual Gifts (comma-separated)</label>
                  <input 
                    type="text" 
                    value={formData.skillsStr}
                    onChange={e => setFormData({ ...formData, skillsStr: e.target.value })}
                    placeholder="e.g. Sound design, Electric guitar, Public speaking, Logistics" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest rounded-xl outline-none active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enlisting...
                      </>
                    ) : (
                      'Enlist Servant'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
