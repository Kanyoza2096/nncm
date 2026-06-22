import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  PieChart as PieChartIcon, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  DownloadCloud,
  FileCheck,
  ShieldCheck,
  Activity,
  ChevronRight
} from 'lucide-react';
import { reportService } from '../../services/reports';
import { MonthlyFinancialReport } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';

export default function Reports() {
  const [reports, setReports] = useState<MonthlyFinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getMonthlyReport() as any[];
      setReports(data.map(d => ({
        id: d.month + d.year,
        year: parseInt(d.month.split(' ')[1]) || currentYear,
        month: d.month.split(' ')[0],
        totalIncome: d.income,
        totalExpenses: d.expense,
        status: 'published',
        createdAt: Date.now()
      })));
    } catch (err) {
      toast.error('Monthly audit reports unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const totalIncomeYtd = reports.filter(r => r.year === currentYear).reduce((acc, c) => acc + c.totalIncome, 0);
  const totalExpensesYtd = reports.filter(r => r.year === currentYear).reduce((acc, c) => acc + c.totalExpenses, 0);

  const filtered = reports.filter(r => 
    r.month.toLowerCase().includes(search.toLowerCase()) || 
    r.year.toString().includes(search)
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Monthly Audit Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Comprehensive fiscal and impact analysis for every ministry cycle.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Generate Cycle Report
        </button>
      </div>

      {/* Fiscal Health Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-8">
         <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp className="w-32 h-32 scale-150 rotate-12" /></div>
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block mb-2 underline underline-offset-4 decoration-indigo-100">Cumulative Intake</span>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalIncomeYtd)}</h4>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-wider">Based on verified 2026 reports</p>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Layers className="w-32 h-32 scale-150 rotate-12" /></div>
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest block mb-2 underline underline-offset-4 decoration-rose-100">Operational Outflow</span>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalExpensesYtd)}</h4>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-wider">Asset Growth & Mission Costs</p>
               </div>
            </div>
         </div>

         <div className="sm:col-span-4 bg-[#0b1120] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck className="w-32 h-32 scale-110 rotate-12" /></div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Ledger Status</span>
               </div>
               <h3 className="text-xl font-black mb-2">Audited & Verified</h3>
               <p className="text-xs text-slate-400 leading-relaxed font-light">Every financial cycle is independently reconciled before archiving.</p>
            </div>
            <button className="relative z-10 w-full mt-8 py-3.5 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
               Download Fiscal Audit
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40 dark:bg-slate-800/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by month or year (e.g. June 2026)..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                <DownloadCloud className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
           {loading ? (
             <div className="col-span-full py-20 text-center animate-pulse"><p className="text-xs text-slate-400 font-bold uppercase tracking-widest font-mono">Syncing report archives...</p></div>
           ) : filtered.length === 0 ? (
             <div className="col-span-full py-20 text-center italic text-slate-400 font-medium">No archived cycles detected in ledger.</div>
           ) : (
             filtered.map((r, i) => {
               const net = r.totalIncome - r.totalExpenses;
               return (
                 <motion.div initial={{ opacity:0, scale:0.98 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay: i*0.05 }} key={r.id} className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 p-6 rounded-[2rem] hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <span className="text-[10px] uppercase opacity-40">{r.month.substring(0,3)}</span>
                             <span className="text-lg">{r.year.toString().substring(2)}</span>
                          </div>
                          <div>
                             <h4 className="font-extrabold text-slate-950 dark:text-white text-lg leading-tight">{r.month} Cycle</h4>
                             <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mt-1">Impact & Fiscal Report</p>
                          </div>
                       </div>
                       <button className="p-2 text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all"><MoreVerticalIcon className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Harvest Net</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(r.totalIncome)}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Impact Margin</p>
                          <p className={`text-sm font-black ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(net)}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <FileCheck className="w-4 h-4 text-emerald-500" /> Auditor Board Approved
                       </div>
                       <button className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline flex items-center gap-1">
                          Full Breakdown <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                 </motion.div>
               );
             })
           )}
        </div>
      </div>
    </div>
  );
}

function MoreVerticalIcon(props: any) {
  return <div {...props} className="w-1.5 h-6 flex flex-col justify-between items-center py-1 opacity-40"><div className="w-1 h-1 rounded-full bg-current"/><div className="w-1 h-1 rounded-full bg-current"/><div className="w-1 h-1 rounded-full bg-current"/></div>;
}
