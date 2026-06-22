import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Send, 
  Users, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { churchService } from '../../services/churchService';
import { PrayerCenterRequest } from '../../types';
import { toast } from 'sonner';

export default function PrayerCenter() {
  useDocumentMeta({
    title: 'Prayer Altar',
    description: 'Submit prayer requests and praise reports. Join our community in standing together in faith.',
  });

  const [prayers, setPrayers] = useState<PrayerCenterRequest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Registration Form 
  const [formName, setFormName] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('Healing');
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    churchService.prayers.getAll().then(setPrayers).catch(console.error);
  }, []);

  const cats = ['All', 'Healing', 'Provision', 'Family', 'Deliverance'];

  const filtered = prayers.filter(p => !selectedCategory || selectedCategory === 'All' || p.category.includes(selectedCategory));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;

    setSubmitting(true);
    try {
      await churchService.prayers.submit({
        name: formAnonymous ? 'Anonymous' : (formName.trim() || 'Guest'),
        isAnonymous: formAnonymous,
        requestText: formText,
        category: formCategory,
        isPraiseReport: false
      });
      toast.success('Petition submitted to the altar wall.');
      setFormText('');
      setFormName('');
      churchService.prayers.getAll().then(setPrayers);
    } catch (e) {
      toast.error('Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const agreePrayer = async (id: string) => {
    await churchService.prayers.incrementPrayerCount(id);
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p));
    toast.success('You have stood in spiritual agreement!');
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Throne of Grace</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Intercessory Altar</h1>
          <p className="text-slate-500 font-light text-sm">"If two of you agree on earth concerning anything they ask, it will be done for them."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-xl mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /> Lodge Petition</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={formName} disabled={formAnonymous} onChange={e => setFormName(e.target.value)} placeholder="Your Name" className="w-full px-4 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium" />
              <div className="flex items-center gap-2 py-0.5">
                <input type="checkbox" id="anon" checked={formAnonymous} onChange={e => setFormAnonymous(e.target.checked)} className="w-4 h-4 text-indigo-600 border-slate-300 rounded" />
                <label htmlFor="anon" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Submit anonymously</label>
              </div>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none font-bold text-slate-800">
                <option value="Healing">Healing</option>
                <option value="Provision">Provision</option>
                <option value="Family">Family Restoration</option>
                <option value="Deliverance">Deliverance</option>
              </select>
              <textarea rows={4} required value={formText} onChange={e => setFormText(e.target.value)} placeholder="Describe your request..." className="w-full p-4 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium leading-relaxed" />
              <button type="submit" disabled={submitting} className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Send to Altar'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {cats.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === c ? 'bg-indigo-600 text-white shadow' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {filtered.map((pray) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={pray.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px]">{pray.name?.charAt(0).toUpperCase() || 'A'}</div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 border-b border-indigo-100 inline-block">{pray.name || 'Anonymous Petitioner'}</p>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{pray.category}</span>
                        </div>
                      </div>
                      <div className="p-1 px-2.5 bg-indigo-50/50 rounded-full text-[9px] font-bold text-indigo-600 border border-indigo-100">Live wall</div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-light italic p-4 bg-slate-50/50 border border-slate-100 rounded-2xl mb-4">"{pray.requestText}"</p>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                      <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-300" /> {pray.prayerCount} Standing in Amen</span>
                      <button onClick={() => agreePrayer(pray.id)} className="flex items-center gap-1.5 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase">
                        <Heart className="w-4 h-4 fill-emerald-500 animate-pulse" /> Amen
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
