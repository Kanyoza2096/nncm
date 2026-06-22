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
  Edit2,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { expenseService } from '../../services/expenses';
import { projectService } from '../../services/projects';
import { Expense, Project } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: 'Training & Materials',
    amount: '',
    approvedBy: 'Finance Elder',
    projectId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects for budget assigning:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error('Description and Amount are required.');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid expense amount.');
      return;
    }
    setIsSubmitting(true);
    try {
      await expenseService.logExpense({
        description: formData.description,
        category: formData.category,
        amount: amt,
        approvedBy: formData.approvedBy,
        projectId: formData.projectId || 'proj-general',
        date: Date.now()
      });
      toast.success('Successfully logged expense into financial ledger!');
      setShowForm(false);
      setFormData({
        description: '',
        category: 'Training & Materials',
        amount: '',
        approvedBy: 'Finance Elder',
        projectId: ''
      });
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this operational spend record?')) return;
    try {
      await expenseService.deleteExpense(id);
      toast.success('Expense record deleted from local ledger.');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense record.');
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
           <button 
             onClick={() => setShowForm(true)}
             className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
           >
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
                          <button 
                            onClick={() => handleDeleteExpense(e.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
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
                    <Receipt className="w-5 h-5 text-rose-500 animate-pulse" /> Book Daily Expense
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-1">Record and disburse actual ministry operational costs.</p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all animate-none"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Voucher Description *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Purchased 10 bags of cement for outpost build" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Spend Amount (MWK) *</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g. 150000" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Budget Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    >
                      <option value="Training & Materials">Training & Materials</option>
                      <option value="Transportation">Transportation / Crusade logistics</option>
                      <option value="Sanctuary operations">Sanctuary operations</option>
                      <option value="Outpost Development">Outpost Development</option>
                      <option value="Welfare & Relief">Welfare Support</option>
                      <option value="Media & Sound IT">Media & Sound IT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Assign to Sanctuary Project</label>
                    <select 
                      value={formData.projectId}
                      onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    >
                      <option value="">-- General Operations (None) --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Authorizing Overseer</label>
                    <input 
                      type="text" 
                      required
                      value={formData.approvedBy}
                      onChange={e => setFormData({ ...formData, approvedBy: e.target.value })}
                      placeholder="e.g. Finance Elder" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    />
                  </div>
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
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recording...
                      </>
                    ) : (
                      'Record Outflow'
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
