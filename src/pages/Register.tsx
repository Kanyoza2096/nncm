import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User,
  ArrowRight, 
  AlertCircle, 
  Heart,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOrgSettings } from '../hooks/useOrgSettings';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const { settings } = useOrgSettings();

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setProcessing(true);
    try {
      await register(email, password, name);
      toast.success('Official account established. Welcome to the ministry workforce.');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Registration failure.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link to="/login" className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-10 hover:underline">
             <ChevronLeft className="w-4 h-4" /> Back to entry
          </Link>
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50">
               <Shield className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Registry Entry</h2>
          <p className="text-slate-400 text-sm mt-3 font-light">Registering as ministry workforce agent for {settings.orgName || 'NNCM'}.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl shadow-slate-200/40"
        >
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Identity Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Samuel Nkandawire"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-300" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="staff@nncm.org"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Security Key (Password)</label>
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
              className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {processing ? 'Establishing Identity...' : (
                <>
                  Register Official <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-[15rem] mx-auto">By registering, you agree to uphold the ministry standard and confidentiality protocols.</p>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#020617]">Role Assigned: Staff</span>
           </div>
        </div>
      </div>
    </div>
  );
}
