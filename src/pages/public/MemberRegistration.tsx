import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  MapPin, 
  Users, 
  Fingerprint,
  QrCode
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { churchService } from '../../services/churchService';
import { toast } from 'sonner';
import { generateUUID } from '../../lib/id-utils';

export default function MemberRegistration() {
  useDocumentMeta({
    title: 'Membership Registration',
    description: 'Join the family. Register as a member and connect with a fellowship branch.',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [pass, setPass] = useState<any | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(async () => {
      const vid = generateUUID();
      await churchService.members.createOrUpdate(vid, { name, email });
      setPass({ vid, name });
      setSaving(false);
      toast.success('Member record established successfully.');
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Tabernacle Gates</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1">Member Registry</h1>
        </div>

        <div className="bg-white border border-slate-105 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
           <AnimatePresence mode="wait">
             {!pass ? (
               <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                 <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-indigo-100 pb-4 inline-block">Family Registry Entrance</h3>
                 <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                         <label className="text-[10px] uppercase font-black text-slate-400">Your Identity Name</label>
                         <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bro. Thomas" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] uppercase font-black text-slate-400">Email Reference</label>
                         <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="thomas@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                       </div>
                    </div>
                    <button disabled={saving} className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20">
                      {saving ? 'Synchronizing digital ledger...' : 'Generate New Creation Pass'}
                    </button>
                 </form>
               </motion.div>
             ) : (
               <motion.div key="card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                  <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 capitalize">{pass.name}'s Sanctuary Pass</h3>
                  
                  <div className="max-w-xs mx-auto bg-[#0b1220] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl text-left font-mono text-white relative overflow-hidden">
                     <div className="absolute inset-0 bg-indigo-600/5 animate-pulse-subtle" />
                     <div className="flex justify-between border-b border-slate-800 pb-4 mb-5 relative z-10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">NNCM Official pass</span>
                        <Fingerprint className="w-4 h-4 text-indigo-400" />
                     </div>
                     <div className="space-y-4 relative z-10">
                        <div>
                          <label className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter">Member UID</label>
                          <p className="text-xs font-black tracking-tight">{pass.vid.toUpperCase()}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl flex justify-center border border-indigo-900/40">
                           <QrCode className="w-20 h-20 text-slate-950" />
                        </div>
                     </div>
                     <div className="mt-6 pt-4 border-t border-slate-800 relative z-10 flex justify-between items-center text-[7px] uppercase font-black tracking-widest text-slate-500">
                        <span>Check-in ready</span>
                        <span className="text-indigo-400">DMC Campus</span>
                     </div>
                  </div>
                  <button onClick={() => setPass(null)} className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">Begin another registration</button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
           {[ {icon: MapPin, text: 'Zomba District Wings'}, {icon: Users, text: 'Cell Discipleship'}, {icon: Fingerprint, text: 'Digital ID Tracking'} ].map((item, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
                <item.icon className="w-5 h-5 text-indigo-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.text}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
