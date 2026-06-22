import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Heart, Share2, ArrowRight, Sparkles } from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { formatCurrency } from '../../lib/currency-utils';

export default function DonateThankYou() {
  const { settings } = useOrgSettings();
  const location = useLocation();
  const { amount = 0, ref = 'NNCM-REF' } = location.state || {};

  useDocumentMeta({
    title: 'Thank You for Giving',
    description: 'We appreciate your partnership with New Nature in Christ Ministry.',
  });

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full px-4">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white border border-slate-105 rounded-[3rem] p-8 sm:p-14 shadow-2xl text-center space-y-8 relative overflow-hidden"
         >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-600 to-indigo-800" />
            
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border-2 border-emerald-100 shadow-sm">
               <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Transaction Confirmed</span>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">Abundant Harvest!</h1>
              <p className="text-slate-500 font-light text-sm leading-relaxed max-w-[20rem] mx-auto">
                 We have received your generous seed of <span className="font-bold text-slate-900">{formatCurrency(Number(amount))}</span>. A digital receipt has been dispatched to your email.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-left space-y-3 font-mono text-[10px] text-slate-500 relative">
               <div className="absolute top-4 right-4 p-1 px-2.5 bg-emerald-100 text-emerald-700 font-black rounded-lg text-[8px] uppercase">Verified</div>
               <p className="flex justify-between">Reference: <span className="text-slate-900 font-bold">{ref}</span></p>
               <p className="flex justify-between">Amount Received: <span className="text-slate-900 font-bold">MK {Number(amount).toLocaleString()}</span></p>
               <p className="flex justify-between">Designation: <span className="text-slate-900 font-bold">General Sanctuary Ops</span></p>
               <p className="flex justify-between">Timestamp: <span className="text-slate-900 font-bold">{new Date().toLocaleString()}</span></p>
            </div>

            <div className="pt-6 space-y-4">
               <button onClick={() => { navigator.clipboard.writeText(`I just supported the work at NNCM! Partner with us: ${window.location.origin}/give`); }} className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                  <Share2 className="w-4 h-4" /> Share Impact
               </button>
               <Link to="/" className="w-full flex items-center justify-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                  Return to Home Sanctuary <ArrowRight className="w-4 h-4" />
               </Link>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
               <Sparkles className="w-4 h-4" /> 2 Corinthians 9:7 Ministry
            </div>
         </motion.div>
      </div>
    </div>
  );
}
