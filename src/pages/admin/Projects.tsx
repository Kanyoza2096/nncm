import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  MapPin, 
  Target, 
  TrendingUp, 
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { projectService } from '../../services/projects';
import { Project } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';
import { getImageUrl } from '../../lib/image-utils';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      toast.error('Kingdom projects index unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Ministry Projects & Assets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Overseeing sanctuary builds and regional outreach outposts.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Initiate New Project
        </button>
      </div>

      {/* KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Building className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Assets</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{projects.length} Registered</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Funding Pool</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">65% Seeded</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sm:col-span-2">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Priority Target</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate">DMC Main Sanctuary Alpha</h4>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Inventorying assets...</p></div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]"><p className="text-slate-400 font-medium italic">No active projects discovered.</p></div>
        ) : (
          filtered.map((p, idx) => {
            const budget = typeof p.budget === 'string' ? parseFloat(p.budget) : p.budget;
            const raised = typeof p.raised === 'string' ? parseFloat(p.raised) : (p.raised || 0);
            const progress = Math.min(100, Math.round((raised / budget) * 100));
            return (
              <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.1 }} key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex flex-col sm:flex-row group h-full">
                 <div className="sm:w-2/5 h-48 sm:h-auto relative bg-slate-950/20 overflow-hidden shrink-0 border-r border-slate-50 dark:border-slate-800">
                    <img src={getImageUrl(p.images && p.images[0])} alt={p.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{p.status}</span>
                    </div>
                 </div>
                 <div className="p-7 flex-1 flex flex-col justify-between">
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-extrabold text-slate-950 dark:text-white text-lg leading-tight group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {p.location}
                       </div>

                       <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <div className="flex justify-between items-end">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Momentum</span>
                             <span className="text-sm font-black text-slate-950 dark:text-white">{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                          </div>
                          <div className="flex justify-between text-[11px] font-bold">
                             <span className="text-slate-400">Yield: {formatCurrency(raised)}</span>
                             <span className="text-slate-900 dark:text-indigo-400">OF {formatCurrency(budget)}</span>
                          </div>
                       </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest italic">
                           <Clock className="w-3.5 h-3.5" /> Est Comp: Q4 2026
                        </div>
                        <Link to={`/admin/projects/${p.id}`} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                           <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                 </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
         {showForm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-12">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
                       <Layers className="w-6 h-6 text-indigo-600" /> Administrative Notice
                    </h3>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                       <Plus className="w-5 h-5 text-slate-400 rotate-45" />
                    </button>
                 </div>
                 
                 <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-3xl mb-8 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                       <h5 className="font-black text-amber-700 dark:text-amber-500 text-xs uppercase tracking-widest">Asset Creation Locked</h5>
                       <p className="text-xs text-amber-600 dark:text-amber-700/70 leading-relaxed mt-1 font-medium italic">Project initiation requires Super Admin credentials and regional board authorization during this preview session.</p>
                    </div>
                 </div>

                 <button onClick={() => setShowForm(false)} className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all">
                    Acknowledge Policy
                 </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function Link(props: any) {
  return <a {...props} />;
}
