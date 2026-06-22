import { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { donorService } from '../../services/donors';
import { Donor } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';

export default function Donors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const data = await donorService.getDonors();
      setDonors(data);
    } catch (err) {
      toast.error('Givers registry unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = donors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Givers & Patrons</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Nurturing spiritual partnerships and stewardship histories.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95 transition-all outline-none">
          <Plus className="w-4 h-4" /> Register Private Giver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40 dark:bg-slate-800/30">
               <div className="relative w-full sm:max-w-md">
                 <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Search givers by name or email..."
                   className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
                 />
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} Registered Partners</span>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                  <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                     <Filter className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stewardship Group</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Lifetime Harvest</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Active</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse font-bold tracking-widest uppercase text-[10px]">Syncing givers registry...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">No spiritual givers found.</td></tr>
                  ) : (
                    filtered.map((donor) => (
                      <tr 
                        key={donor.id} 
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedDonor(donor)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                               {donor.name.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{donor.name}</p>
                                <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{donor.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             <div className={`p-1 rounded-md ${donor.type === 'Corporate' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                <HeartHandshake className="w-3.5 h-3.5" />
                             </div>
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-tight">{donor.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                             <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{formatCurrency(donor.totalDonated)}</p>
                             <div className="flex items-center gap-1.5">
                                <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-500/50" style={{ width: '45%' }} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Growth</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-slate-400 font-mono italic">{new Date(donor.updatedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                             <ChevronRight className="w-5 h-5" />
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
      </div>

      {/* Donor Detail Slide-over / Modal (Simplified for scope) */}
      <AnimatePresence>
         {selectedDonor && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setSelectedDonor(null)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-12">
                 <div className="flex justify-between items-start mb-10">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800 flex items-center gap-1.5">
                       <Award className="w-3.5 h-3.5" /> High Impact Partner
                    </div>
                    <button onClick={() => setSelectedDonor(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                       <XIcon className="w-5 h-5 text-slate-400" />
                    </button>
                 </div>

                 <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-indigo-600/20 animate-pulse" />
                       {selectedDonor.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{selectedDonor.name}</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">{selectedDonor.email}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Seed</p>
                       <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(selectedDonor.totalDonated)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
                       <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">85%</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <button className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                       <Search className="w-4 h-4" /> View Harvest History
                    </button>
                    <button className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                       Contact Partner Address
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function XIcon(props: any) {
  return <Plus {...props} style={{ transform: 'rotate(45deg)' }} />;
}
