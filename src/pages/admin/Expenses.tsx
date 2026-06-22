import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Filter, 
  TrendingDown, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  DollarSign,
  FileText,
  Trash2,
  Edit2
} from 'lucide-react';
import { expenseService } from '../../services/expenses';
import { Expense } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err) {
      toast.error('Financial ledger unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = expenses.filter(e => 
    (e.description || '').toLowerCase().includes(search.toLowerCase()) || 
    (e.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Expenditure Record</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Transparent tracking of all ministry operational spending.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
              <Download className="w-5 h-5" />
           </button>
           <button className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all">
             <Plus className="w-4 h-4" /> Book Daily Expense
           </button>
        </div>
      </div>

      {/* Expense Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
         <div className="bg-[#0b1120] text-white p-6 rounded-[2rem] shadow-xl col-span-1 sm:col-span-2 relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Receipt className="w-32 h-32 scale-150 rotate-12" />
            </div>
            <div className="relative z-10">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">Total Ministry Spend YTD</span>
               <h4 className="text-3xl font-black text-rose-500 tracking-tight">{formatCurrency(totalSpent)}</h4>
            </div>
            <div className="relative z-10 pt-4 flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               <span className="flex items-center gap-1 text-emerald-400"><ArrowDownRight className="w-3.5 h-3.5" /> 5.2% under budget </span>
               <span className="opacity-20">|</span>
               <span>Fiscal 2026</span>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bills Pipeline</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">Active</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Layers className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vouchers</span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">{expenses.length} Records</h4>
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
              placeholder="Search by vendor, category, or ref..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${showFilter ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
          >
             <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Spend Outflow</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disburse Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Establishing ledger connection...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No outflow records discovered.</td></tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-all">
                             <FileText className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{e.description || 'Ministry Expense'}</p>
                             <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">ID: {e.id?.substring(4).toUpperCase()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-rose-500 dark:text-rose-400 tracking-tight">{formatCurrency(e.amount)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-1 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 dark:border-slate-800">{e.category}</span>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400 italic">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer">
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
    </div>
  );
}
