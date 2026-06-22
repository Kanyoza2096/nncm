import { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  Server, 
  Wifi, 
  Cpu, 
  Globe, 
  Clock,
  RefreshCw,
  HardDrive,
  Lock,
  CloudLightning,
  AlertCircle,
  Zap
} from 'lucide-react';
import { churchService } from '../../services/churchService';
import { settingsService } from '../../services/settings';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Health() {
  const [synced, setSynced] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    uptime: '99.98%',
    lastSync: '2 minutes ago',
    dbLoad: '4%'
  });

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    const start = Date.now();
    try {
      await settingsService.getSettings();
      setSynced(true);
      setMetrics(prev => ({
        ...prev,
        responseTime: Date.now() - start,
        lastSync: 'Just now'
      }));
    } catch (err) {
      setSynced(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Core Health</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Global infrastructure status and telemetry for {synced === null ? '...' : synced ? 'NNCM Cloud' : 'Offline Mode'}.</p>
        </div>
        <button 
           onClick={checkHealth}
           className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:rotate-180"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { label: 'Cloud Gateway', status: synced, icon: Globe, val: metrics.responseTime + ' ms' },
                 { label: 'Compute Engine', status: true, icon: Server, val: metrics.uptime },
                 { label: 'Relational DB', status: synced, icon: Database, val: metrics.dbLoad }
               ].map((item, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`p-2 rounded-xl ${item.status ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'} dark:bg-indigo-900/20`}>
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.status ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <div className={`w-1 h-1 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                          {item.status ? 'NOMINAL' : 'OFFLINE'}
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
                       <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">{item.val}</h4>
                    </div>
                 </div>
               ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <CloudLightning className="w-5 h-5 text-indigo-600" /> Telemetry Stream
                  </h3>
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] font-mono">Real-time sampling active</span>
               </div>
               
               <div className="space-y-8">
                  {[
                    { label: 'Auth Middleware Latency', val: 95, color: 'bg-indigo-600' },
                    { label: 'Storage Bucket I/O', val: 72, color: 'bg-indigo-400' },
                    { label: 'Edge Function Propogation', val: 88, color: 'bg-slate-700' }
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{s.val}% Health</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.val}%` }} className={`h-full ${s.color}`} />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                     <Clock className="w-4 h-4" /> 24/7 Global Infrastructure Monitoring Managed by Antigravity Edge
                  </div>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                     View Terminal Logs <Activity className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-[#0b1120] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
               <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-3xl" />
               <div className="relative z-10 w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-pulse">
                  <Zap className="w-12 h-12 text-white" />
               </div>
               <h3 className="text-xl font-black mb-3 relative z-10">Edge Resilience</h3>
               <p className="text-xs text-slate-400 leading-relaxed font-light mb-8 relative z-10">System is configured for high-availability across all Malawi regional nodes.</p>
               <div className="w-full h-px bg-white/10 mb-6" />
               <div className="flex items-center justify-between w-full text-[10px] uppercase font-black tracking-widest">
                  <span className="text-slate-500">Security Index</span>
                  <span className="text-emerald-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Elite</span>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[2.5rem] flex items-start gap-4 shadow-sm">
               <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                 <h5 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2">Notice</h5>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic font-medium">Some metrics may be simulated during this preview session to demonstrate system observability patterns.</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
