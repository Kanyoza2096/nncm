import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Heart,
  ChevronRight,
  Database,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOrgSettings } from '../hooks/useOrgSettings';
import { toast } from 'sonner';

import { getImageUrl } from '../lib/image-utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useOrgSettings();

  const from = (location.state as any)?.from?.pathname || '/admin';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setProcessing(true);
    try {
      localStorage.removeItem('nncm_force_offline');
      await login(email, password);
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDemoMode = async () => {
    setProcessing(true);
    try {
      localStorage.setItem('nncm_force_offline', 'true');
      await login('admin@nncm.org', 'admin123');
      toast.success('Entering Demo Mode', { description: 'Offline preview active.' });
    } catch (err: any) {
      toast.error('Demo Mode Failed');
    } finally {
      setProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, damping: 25, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#020617] flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-slate-100/40 dark:bg-slate-800/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-50/40 dark:bg-blue-900/10 rounded-full blur-[100px]" />
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full relative z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-4 group mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-14 h-14 bg-white dark:bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-indigo-500/30">
                 {settings.orgLogo ? (
                   <img src={getImageUrl(settings.orgLogo)} alt="Church Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                 ) : (
                   <Heart className="w-7 h-7 text-indigo-600 dark:text-white" />
                 )}
              </div>
            </div>
            <div className="text-left">
               <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight font-display">{settings.orgName || 'NNCM Portal'}</h1>
               <div className="flex items-center gap-2 mt-2">
                  <div className="h-px w-4 bg-indigo-200 dark:bg-indigo-800" />
                  <span className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-[0.25em] block">Administrative Gateway</span>
               </div>
            </div>
          </Link>
          
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display mb-3">Welcome Back</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Protected resource management for ministry leaders.</p>
        </motion.div>

        {/* Main Login Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group/card"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />

          <form onSubmit={handleLogin} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Authorized Identity</label>
                <Cloud className="w-3.5 h-3.5 text-slate-200 dark:text-slate-800" />
              </div>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  disabled={processing}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="pastor@nncm.org"
                  className="w-full pl-12 pr-6 py-4.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all placeholder:text-slate-300 dark:text-white"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Secure Entry Key</label>
                <Link to="/forgot-password" title="Recover Access" className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition-colors">Lost access?</Link>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                <input 
                  type="password"
                  value={password}
                  disabled={processing}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-6 py-4.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all placeholder:text-slate-300 dark:text-white"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2 flex flex-col gap-4">
              <button
                disabled={processing}
                className="w-full py-5 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn cursor-pointer overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    Enter Portal <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoMode}
                disabled={processing}
                className="w-full py-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px] tracking-widest rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
              >
                <Database className="w-4 h-4 opacity-70" /> Use Demo Mode (Offline)
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
             <Link to="/register" className="inline-flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group/link">
                <span className="text-[11px] font-black uppercase tracking-widest group-hover/link:text-indigo-600">Need Access?</span>
                <div className="h-px w-6 bg-slate-200 dark:bg-slate-800 group-hover/link:bg-indigo-200 transition-colors" />
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover/link:text-indigo-600">Register Staff Identity</span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
             </Link>
          </motion.div>
        </motion.div>

        {/* Footer Security Badges */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center gap-8">
           <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> SECURE</div>
              <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="flex items-center gap-2"><Database className="w-4 h-4" /> INFRASTRUCTURE</div>
              <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> VERIFIED</div>
           </div>
           
           <AnimatePresence>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-5 bg-indigo-500/5 dark:bg-indigo-500/10 backdrop-blur-xl rounded-[2rem] border border-indigo-500/10 dark:border-indigo-500/20 max-w-sm"
             >
                <div className="flex items-start gap-4">
                   <div className="p-2 bg-indigo-500/10 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                   </div>
                   <div>
                      <h5 className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-tight mb-1">Sandbox Environment Active</h5>
                      <p className="text-[11px] text-indigo-600/70 dark:text-indigo-400/60 font-medium leading-relaxed">Use <span className="text-indigo-900 dark:text-indigo-200 font-black">admin@nncm.org</span> / <span className="text-indigo-900 dark:text-indigo-200 font-black">admin123</span> for high-privileged access.</p>
                   </div>
                </div>
             </motion.div>
           </AnimatePresence>
        </motion.div>
      </motion.div>
      
      {/* Decorative dots grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>
    </div>
  );
}
