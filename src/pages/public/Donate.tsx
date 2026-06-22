import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Smartphone, 
  CreditCard, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { donorService } from '../../services/donors';
import { toast } from 'sonner';

export default function Donate() {
  const { settings } = useOrgSettings();
  const navigate = useNavigate();
  useDocumentMeta({
    title: 'Support our Mission',
    description: 'Partner with New Nature in Christ Ministry to impact lives through gospel outreach and sanctuary building.',
  });

  const [form, setForm] = useState({ name: '', email: '', amount: '5000', type: 'Tithes', notes: '' });
  const [method, setMethod] = useState('Airtel Money');
  const [loading, setLoading] = useState(false);

  const presets = ['1000', '2500', '5000', '10000', '25000', '50000'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const donationData = {
          donorName: form.name || 'Anonymous Giver',
          donorEmail: form.email || 'guest@nncm.org',
          amount: Number(form.amount),
          donationType: form.type,
          paymentMethod: method,
          notes: form.notes
        };
        
        await donorService.createDonation(donationData);
        toast.success('Glory to God! Your seed has been registered.');
        navigate('/donate/thank-you', { state: { amount: form.amount, ref: 'NNCM-' + Math.floor(Math.random()*900000) } });
      } catch (err) {
        toast.error('Transaction failure. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-10">
            <div>
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-1 block">Partnership Gateway</span>
              <h1 className="text-4xl font-extrabold text-[#020617] tracking-tight leading-none mb-4">Seed Partnership & Stewardship</h1>
              <p className="text-slate-500 font-light text-base leading-relaxed">
                Connect your resources to eternal purposes. Your giving fuels our sanctuary builds, community outreaches, and digital gospel distribution.
              </p>
            </div>

            <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Globe className="w-32 h-32 scale-150 rotate-12" />
               </div>
               <div className="relative z-10 flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Secure Channel</span>
               </div>
               <h3 className="text-xl font-black mb-2 relative z-10">Impact Assurance</h3>
               <p className="text-indigo-100 text-xs leading-relaxed font-light relative z-10">All donations are logged into our transparent ledger for real-time accountability and spiritual oversight.</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Ministry Standard</h4>
               {[
                 { icon: CheckCircle2, text: 'Authorized 256-bit Secure Encryption' },
                 { icon: Clock, text: 'Instant Digital Receipt Issued' },
                 { icon: Sparkles, text: 'Biblical Harvest Principles Observed' }
               ].map((li, i) => (
                 <div key={i} className="flex items-center gap-3 text-slate-450 text-[10px] font-bold uppercase tracking-widest">
                    <li.icon className="w-4 h-4 text-indigo-500" /> {li.text}
                 </div>
               ))}
            </div>
          </div>

          <div className="lg:col-span-7">
             <div className="bg-white border border-slate-105 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Giver Name</label>
                         <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Mary Nkandawire" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Email (For Receipt)</label>
                         <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="mary@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block pl-1">Giving Amount (MWK)</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                         {presets.map(p => (
                           <button key={p} type="button" onClick={() => setForm({...form, amount: p})} className={`p-2.5 rounded-xl border text-[10px] font-black tracking-widest transition-all ${form.amount === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                             MK {p}
                           </button>
                         ))}
                      </div>
                      <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 text-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Category</label>
                         <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none">
                            {['Tithes', 'Sacrificial Offering', 'Sanctuary Project', 'Children Services', 'Youth Outreach'].map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Gateway</label>
                         <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none">
                            {['Airtel Money', 'TNM Mpamba', 'Visa / Mastercard'].map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                      </div>
                   </div>

                   <button disabled={loading} type="submit" className="w-full p-4 bg-indigo-600 hover:bg-[#020617] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex justify-center items-center gap-2">
                      {loading ? 'Processing transaction...' : <><Heart className="w-4 h-4 fill-white" /> Activate Seed Entry</>}
                   </button>
                </form>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
