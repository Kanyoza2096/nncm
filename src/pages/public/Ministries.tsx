import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Mail, Compass } from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { churchService } from '../../services/churchService';
import { MinistryGroup } from '../../types';
import { toast } from 'sonner';

export default function Ministries() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Ministries',
    description: 'Find a place to serve and grow. Explore our ministries ranging from Music and Youth to Compassion Outreach.',
    keywords: 'ministries, church departments, youth group, choir, outreach'
  });

  const [ministries, setMinistries] = useState<MinistryGroup[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMinistries() {
      try {
        const list = await churchService.ministries.getAll();
        setMinistries(list);
      } catch (err) {
        console.error(err);
      }
    }
    loadMinistries();
  }, []);

  const handleJoinMinistry = (m: MinistryGroup) => {
    setJoiningId(m.id);
    setTimeout(async () => {
      await churchService.ministries.updateCount(m.id, 1);
      setMinistries(prev => prev.map(item => item.id === m.id ? { ...item, membersCount: item.membersCount + 1 } : item));
      toast.success(`Interest registered for ${m.name}! We will contact you soon.`);
      setJoiningId(null);
    }, 1200);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Pillars of Assembly</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Our Ministries</h1>
          <p className="text-slate-400 font-light text-sm">Discover specialized departments designed for spiritual growth and community actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ministries.map((m, index) => (
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} key={m.id} className="bg-white border border-slate-105 rounded-3xl overflow-hidden hover:shadow-xl transition-all shadow-sm flex flex-col justify-between group">
              <div>
                <div className="h-44 bg-slate-900 relative shrink-0">
                  <img src={m.featuredImage} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  <div className="absolute top-4 left-4 bg-white/95 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow">Active Network</div>
                </div>
                <div className="p-7">
                  <h3 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-indigo-600 transition-colors">{m.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light mt-3 line-clamp-3">{m.description}</p>
                  <div className="mt-6 pt-5 border-t border-slate-50 space-y-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <div className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-indigo-500" /> Leads: <span className="text-slate-700 font-black">{m.leaders.slice(0,2).join(', ')}</span></div>
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {m.contactEmail}</div>
                  </div>
                </div>
              </div>
              <div className="p-7 pt-0 border-t border-slate-50 flex items-center justify-between">
                 <span className="text-xs text-indigo-600 font-extrabold flex items-center gap-1.5"><Users className="w-4 h-4" /> {m.membersCount} saints</span>
                 <button onClick={() => handleJoinMinistry(m)} disabled={!!joiningId} className="px-5 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-extrabold rounded-xl text-[11px] uppercase transition-all active:scale-95 disabled:opacity-50">
                    {joiningId === m.id ? 'Wait...' : 'Join Now'}
                 </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
