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
  HeartHandshake
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
        <button className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all">
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
                       <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
