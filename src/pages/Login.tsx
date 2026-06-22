import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Heart,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOrgSettings } from '../hooks/useOrgSettings';
import { toast } from 'sonner';

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
      // Success is handled by useAuth and useEffect
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative">
      {/* Visual background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-slate-100" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
               <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
               <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{settings.orgName || 'NNCM Portal'}</h1>
               <span className="text-[10px] uppercase font-black text-indigo-600 tracking-[0.2em] mt-1 block">Administrative Access</span>
            </div>
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-2 font-light">Protected church resource management gateway.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl shadow-slate-200/40 relative overflow-hidden ring-1 ring-slate-100"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Authorized ID (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="pastor@nncm.org"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entry Key (Password)</label>
                <Link to="/forgot-password" title="Recover Access" className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Lost access?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              disabled={processing}
              className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {processing ? 'Verifying...' : (
                <>
                  Enter Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoMode}
              disabled={processing}
              className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 border border-slate-100 font-bold uppercase text-[10px] tracking-widest rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Database className="w-3.5 h-3.5" /> Use Demo Mode (Offline)
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
             <Link to="/register" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <span className="text-[11px] font-black uppercase tracking-widest">Need access?</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-sm font-bold border-b-2 border-indigo-50 hover:border-indigo-600">Register Staff</span>
             </Link>
          </div>
        </motion.div>

        <div className="mt-12 flex flex-col items-center gap-6">
           <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> 256-bit Secure</div>
              <div className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Supabase Cloud</div>
           </div>
           
           <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 max-w-xs transition-opacity hover:opacity-100">
              <div className="flex items-start gap-2.5">
                 <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                 <div>
                    <h5 className="text-[10px] font-black uppercase text-indigo-700 tracking-tight">Portal Sandbox Active</h5>
                    <p className="text-[10px] text-indigo-600/70 font-medium leading-relaxed mt-1">Use admin@nncm.org / admin123 to bypass standard credential sync for this preview session.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
