import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle,
  Building,
  Users
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { formatCurrency } from '../../lib/currency-utils';
import { toast } from 'sonner';

export default function OnlineGiving() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Giving & Seeds',
    description: 'Partner with us securely. Pay tithes, offerings, and partnership seeds online.',
  });

  const [amount, setAmount] = useState('5000');
  const [mode, setMode] = useState('Airtel Money');
  const [success, setSuccess] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = ['1000', '2500', '5000', '10000', '25000', '50000'];

  const handleGiving = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess({
        ref: 'NNCM-SEED-' + Math.floor(100000 + Math.random() * 900000),
        amount: Number(amount)
      });
      toast.success('Praise the Lord! Your seed has been registered.');
    }, 2500);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Storehouse Gates</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Online Tithing & Seeds</h1>
          <p className="text-slate-400 font-light text-sm">Honor the Lord with your resources through our secure Malawian gateway.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 bg-white border border-slate-105 rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h3 className="font-extrabold text-slate-900 text-xl mb-8">Process Giving</h3>
                  <form onSubmit={handleGiving} className="space-y-8">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                       {presets.map(p => (
                         <button key={p} type="button" onClick={() => setAmount(p)} className={`p-2.5 rounded-xl border text-[10px] font-black tracking-widest transition-all ${amount === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                           MK {p}
                         </button>
                       ))}
                    </div>
                    
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold text-xs">MWK</span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block">Choose Channel</label>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                         {['Airtel Money', 'TNM Mpamba', 'International Card'].map(m => (
                           <button key={m} type="button" onClick={() => setMode(m)} className={`p-4 border rounded-2xl flex flex-col gap-2 transition-all ${mode === m ? 'ring-2 ring-indigo-600 border-transparent shadow' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                             {m === 'International Card' ? <CreditCard className="w-4 h-4 text-slate-400" /> : <Smartphone className="w-4 h-4 text-slate-400" />}
                             <span className="text-[11px] font-black text-slate-800 text-left">{m}</span>
                           </button>
                         ))}
                       </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl text-xs active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                      {loading ? 'Processing transaction...' : 'Confirm Seed Entry'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-bounce-subtle">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Seed Received!</h3>
                  <div className="max-w-xs mx-auto p-6 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3 font-mono text-[10px] text-slate-500 relative">
                     <div className="absolute top-0 right-0 p-4 font-black uppercase text-[7px] text-emerald-600 rotate-12">Verified</div>
                     <p>Ref: <span className="text-slate-900 font-bold">{success.ref}</span></p>
                     <p>Amount: <span className="text-slate-900 font-bold">{formatCurrency(success.amount)}</span></p>
                     <p>Status: <span className="text-slate-900 font-bold">Storehouse Ledger Logged</span></p>
                  </div>
                  <button onClick={() => setSuccess(null)} className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-lg">Submit Another Offering</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pl-6 border-l border-slate-100">
             <div>
               <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm"><HelpCircle className="w-4 h-4 text-indigo-600" /> Giving Policy</h4>
               <p className="text-xs text-slate-450 font-light leading-relaxed">Integrity is our hallmark. Every contribution is directly mapped to the <b>Church Transparency Ledger</b> for public audit assurance.</p>
             </div>
             
             {[
               { icon: TrendingUp, title: 'Tithes (10%)', body: 'Support church administration and pastoral shepherding in Zomba city.' },
               { icon: Building, title: 'Project Seeds', body: 'Finance sanctuary construction blocks and community welfare hubs.' },
               { icon: Users, title: 'Missions Seed', body: 'Power national evangelism crusades and street soul winning outreaches.' }
             ].map((item, idx) => (
               <div key={idx} className="flex gap-4 items-start p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                 <div className="p-2 bg-slate-50 rounded-xl text-indigo-600 border border-slate-100 mt-0.5"><item.icon className="w-4 h-4" /></div>
                 <div>
                   <h5 className="font-black text-slate-800 text-[11px] uppercase tracking-wide">{item.title}</h5>
                   <p className="text-[10px] text-slate-400 font-light leading-relaxed mt-0.5">{item.body}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
