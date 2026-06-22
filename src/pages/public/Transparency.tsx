import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  ArrowUpRight, 
  ChevronRight,
  PieChart,
  Activity,
  FileText
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { reportService } from '../../services/reports';
import { beneficiaryService } from '../../services/beneficiaries';
import { projectService } from '../../services/projects';
import { MonthlyFinancialReport } from '../../types';
import { getImageUrl } from '../../lib/image-utils';

export default function Transparency() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Transparency Portal',
    description: 'Verifiable financial stewardship and real-time impact tracking for New Nature in Christ Ministry.',
  });

  const [reports, setReports] = useState<MonthlyFinancialReport[]>([]);
  const [stats, setStats] = useState<any>({ beneficiaries: 0, tithes: 0, projects: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const reps = await reportService.getMonthlyReports();
        const transformed: MonthlyFinancialReport[] = reps.map((r: any) => ({
          id: r.month,
          month: r.month,
          year: 2026,
          totalIncome: r.income || r.amount || 0,
          totalExpenses: r.expense || 0,
          status: 'published' as const,
          createdAt: Date.now()
        }));
        setReports(transformed);
        
        const bens = await beneficiaryService.getBeneficiaries();
        const projs = await projectService.getProjects();
        setStats({
          beneficiaries: bens.length,
          projects: projs.length,
          tithes: transformed.reduce((acc, r) => acc + r.totalIncome, 0)
        });
      } catch (err) {
        console.error('Error loading transparency stats:', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase font-mono">The Glass Sanctuary</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Transparency & Audit</h1>
          <p className="text-slate-500 font-light text-sm">Every seed harvested is a soul impacted. We believe in the biblical radicality of financial openness.</p>
        </div>

        {/* Real-time Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
           {[
             { label: 'Total Givers Hub', val: stats.tithes.toLocaleString() + ' MK', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
             { label: 'Souls Impacted', val: stats.beneficiaries, icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
             { label: 'Active Outposts', val: stats.projects, icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' }
           ].map((s, i) => (
             <motion.div initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }} key={i} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center">
                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-50`}>
                   <s.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{s.label}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{s.val}</h4>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-3">
                   <FileText className="w-6 h-6 text-indigo-600" /> Monthly Fiscal Records
                </h2>
                <div className="space-y-4">
                   {reports.map((r, i) => (
                     <div key={i} className="group bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100">{r.month.substring(0,3)}</div>
                           <div>
                              <h4 className="font-extrabold text-[#020617] text-lg">{r.month} {r.year} Audit</h4>
                              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Certified Pastoral Report</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Harvest</p>
                              <p className="text-sm font-black text-emerald-600">MK {r.totalIncome.toLocaleString()}</p>
                           </div>
                           <button className="p-3 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                              <ArrowUpRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
           </div>

           <div className="lg:col-span-4">
              <div className="bg-[#0b1120] text-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden sticky top-24">
                 <div className="absolute inset-0 bg-indigo-600/5 animate-pulse-subtle" />
                 <div className="relative z-10 space-y-8">
                    <PieChart className="w-10 h-10 text-indigo-400" />
                    <div>
                       <h3 className="text-xl font-black mb-3">Resource Allocation</h3>
                       <p className="text-xs text-slate-400 leading-relaxed font-light">Based on verified 2026 data across all Zomba city branches and outposts.</p>
                    </div>

                    <div className="space-y-5">
                       {[
                         { label: 'Missions & Soul Winning', val: 40, color: 'bg-indigo-500' },
                         { label: 'Sanctuary Building', val: 35, color: 'bg-emerald-500' },
                         { label: 'Admin & Media Ops', val: 25, color: 'bg-slate-700' }
                       ].map((item, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                               <span className="text-slate-300">{item.label}</span>
                               <span>{item.val}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Public Accountability</span>
                       <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
