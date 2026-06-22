import { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Shield, 
  MoreVertical, 
  Mail, 
  ShieldCheck, 
  Key,
  UserPlus,
  Trash2,
  Lock,
  Loader2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { authService } from '../../services/auth';
import { User } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // For this demo/preview, we'll list profiles
      const profiles = await authService.getAllProfiles();
      setUsers(profiles);
    } catch (err) {
      toast.error('Privileged workforce directory locked.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Administrative Workforce</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Managing access permissions and staff authorization levels.</p>
        </div>
        <button 
          onClick={() => setShowInviteForm(true)}
          className="bg-[#020617] hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xl flex items-center gap-2 active:scale-95 transition-all outline-none"
        >
          <UserPlus className="w-4 h-4" /> Authorize New Agent
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40 dark:bg-slate-800/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents by name, email, or role..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                <Lock className="w-3.5 h-3.5" /> SECURE ACCESS
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Agent</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clearance Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Access</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing authorized workforce...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No authorized agents discovered in this partition.</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                             {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{u.name}</p>
                             <p className="text-[10px] font-mono text-slate-400 mt-1.5">{u.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                         u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                       }`}>
                          {u.role === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1.5" /> : <Key className="w-3 h-3 mr-1.5" />}
                          {u.role}
                       </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-xs text-slate-500 uppercase tracking-tight">
                       Secretariat
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-400 font-mono italic">
                       {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><Shield className="w-4 h-4" /></button>
                          <button className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
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
         {showInviteForm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowInviteForm(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12"
              >
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                       <UserPlus className="w-6 h-6 text-indigo-600" /> Grant Access
                    </h3>
                    <button onClick={() => setShowInviteForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                       <XCircle className="w-6 h-6 text-slate-400" />
                    </button>
                 </div>

                 <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                       <h5 className="font-black text-indigo-700 dark:text-indigo-400 text-[10px] uppercase tracking-widest">Protocol Pre-Check</h5>
                       <p className="text-xs text-indigo-600/70 leading-relaxed mt-1 font-medium font-serif italic">Authorization of new agents should only proceed after regional board confirmation and spiritual screening.</p>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Agent Identity (Official Name)</label>
                       <input type="text" placeholder="e.g. Samuel Chilwa" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none  dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Security Email</label>
                       <input type="email" placeholder="staff@nncm.org" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
                    </div>
                    
                    <button onClick={() => setShowInviteForm(false)} className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95">
                       Submit Authorization
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
