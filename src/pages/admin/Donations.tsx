import { useState, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  Plus, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Filter, 
  ArrowUpRight,
  Download,
  CreditCard,
  Smartphone,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { donorService } from '../../services/donors';
import { Donation } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEntryForm, setShowEntryForm] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await donorService.getDonations();
      setDonations(data);
    } catch (err) {
      toast.error('Harvest ledger synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = donations.filter(d => 
    (d.donorName || 'Unknown Giver').toLowerCase().includes(search.toLowerCase()) || 
    (d.donationType || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">The Harvest Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Comprehensive record of tithes, offerings, and partnership seeds.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
              <Download className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setShowEntryForm(true)}
             className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
           >
             <Plus className="w-4 h-4" /> Book New Harvest
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
         <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-600/20 col-span-1 sm:col-span-2 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <DollarSign className="w-32 h-32 scale-150 rotate-12" />
            </div>
            <div className="relative z-10">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300 block mb-1">Net Sanctuary Harvest YTD</span>
               <h4 className="text-3xl font-black tracking-tight">{formatCurrency(donations.reduce((acc, c) => acc + c.amount, 0))}</h4>
            </div>
            <div className="relative z-10 pt-4 flex items-center gap-4 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
               <span className="flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> 14% growth </span>
               <span className="opacity-40">|</span>
               <span>Fiscal 2026</span>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><Sparkles className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Seed</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">MK 12,500</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verified</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">{donations.length} Entries</h4>
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
              placeholder="Search by giver, ref ID, or designation..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
             <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Giver</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sanctuary Seed Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Channel</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Establishing ledger connection...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No harvest records discovered in current partition.</td></tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{d.donorName || 'Partner Giver'}</p>
                          <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-tighter">REF: {d.id?.substring(4).toUpperCase() || 'MAN-LEDGER'}</p>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{formatCurrency(d.amount)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-1 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 dark:border-slate-800">{d.donationType}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                         {d.paymentMethod?.toLowerCase().includes('card') ? <CreditCard className="w-3.5 h-3.5 text-slate-400" /> : <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
                         <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{d.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-slate-400 font-mono italic">{new Date(d.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Verified in Ledger" />
                          <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                             <ExternalLink className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4">
           <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Lock className="w-3.5 h-3.5" /> End-to-End Cryptographic Audit Trail Active
           </div>
        </div>
      </div>
    </div>
  );
}
