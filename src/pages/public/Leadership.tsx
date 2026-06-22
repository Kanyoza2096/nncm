import { motion } from 'motion/react';
import { Mail, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function Leadership() {
  useDocumentMeta({
    title: 'Leadership & Pastoral Team',
    description: 'Meet the pastoral team and oversight board of New Nature in Christ Ministry.',
    keywords: 'leadership, pastors, elders, church board, NNCM leadership'
  });

  const { settings } = useOrgSettings();

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-4"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Spiritual Pillars & Governance
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
            Our Pastoral Team
          </h1>
          <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
            Called by God, tested in faith, and dedicated to the spiritual shepherdhood of lives in {settings.orgAddress || 'Malawi'}.
          </p>
        </div>

        {/* Senior Pastor Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-50 bg-slate-50 mb-6">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" alt="Senior Pastor" className="w-full h-full object-cover" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" /> Senior Pastor & Founder
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">{settings.directorName || 'Pastor Richie Mkandawire'}</h2>
              <p className="text-sm font-semibold text-indigo-600 mt-1 uppercase tracking-wider">Visionary Lead</p>
            </div>
            
            <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-light">
              {settings.directorBio || 'Pastor Richie founded the ministry with a burning desire to see lives transformed by the power of the Holy Spirit. He is passionately committed to preaching and teaching the uncompromised word of God.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a href={`mailto:${settings.directorEmail || 'richiefa88@gmail.com'}`} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Message Pastor
              </a>
              <a href={`https://wa.me/${settings.directorWhatsApp?.replace(/\+/g, '') || '265882404093'}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> WhatsApp Counsel
              </a>
            </div>
          </div>
        </motion.div>

        {/* Other Team Members Placeholder */}
        <div className="text-center py-12 border-t border-slate-100">
           <p className="text-slate-400 font-medium italic text-sm">Overseer boards and auxiliary pastoral profiles are currently being compiled for regional branches.</p>
        </div>

      </div>
    </div>
  );
}
