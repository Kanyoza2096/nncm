import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Download, 
  X, 
  Video, 
  BookOpen,
  FileText,
  Music
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { churchService } from '../../services/churchService';
import { Sermon } from '../../types';
import { toast } from 'sonner';
import { getImageUrl } from '../../lib/image-utils';

export default function Sermons() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Sermons Library',
    description: 'Listen to and watch recent sermons, biblical teachings, and messages from New Nature in Christ Ministry.',
    keywords: 'sermons, preaching, bible teaching, audio sermons, video messages, NNCM'
  });

  const [searchParams] = useSearchParams();
  const initialSermonId = searchParams.get('id');

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);

  useEffect(() => {
    async function fetchSermons() {
      try {
        const list = await churchService.sermons.getAll();
        setSermons(list);
        if (initialSermonId) {
          const matched = list.find(s => s.id === initialSermonId);
          if (matched) setActiveSermon(matched);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSermons();
  }, [initialSermonId]);

  const categories = ['All', 'Sunday Service', 'Midweek Service', 'Youth', 'Crusade'];

  const filtered = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.pastor.toLowerCase().includes(search.toLowerCase()) ||
                          s.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (s: Sermon) => {
    try {
      await churchService.sermons.incrementDownload(s.id);
      setSermons(prev => prev.map(item => item.id === s.id ? { ...item, downloadsCount: item.downloadsCount + 1 } : item));
      if (activeSermon && activeSermon.id === s.id) {
        setActiveSermon(prev => prev ? { ...prev, downloadsCount: prev.downloadsCount + 1 } : null);
      }
      toast.success(`Study guide downloaded for: "${s.title}"!`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Spiritual Word Feed</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Sermon Outlines & Audio</h1>
          <p className="text-slate-500 font-light text-sm">
            Access revelation knowledge through our archived weekly assembly study guides and digital playbacks.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, scripture, or preacher..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all uppercase tracking-wider ${
                  selectedCategory === c 
                    ? 'bg-indigo-600 text-white shadow shadow-indigo-650/20' 
                    : 'text-slate-400 hover:bg-slate-50 bg-transparent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Directory List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
               <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
               <p className="text-slate-400 font-medium">No archived sermons matched your current criteria.</p>
            </div>
          ) : (
            filtered.map((s) => (
              <motion.div 
                key={s.id}
                layoutId={`sermon-card-${s.id}`}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer group"
                onClick={() => setActiveSermon(s)}
              >
                <div className="h-44 relative bg-slate-900 overflow-hidden shrink-0">
                  <img src={getImageUrl(s.coverImage)} alt={s.title} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <span className="absolute top-4 left-4 bg-white/95 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-900">
                    {s.category}
                  </span>
                </div>

                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-widest">{s.date}</span>
                    <h3 className="font-extrabold text-slate-950 text-lg leading-snug mt-2 line-clamp-2">{s.title}</h3>
                    <p className="text-xs text-slate-450 mt-3 font-light leading-relaxed line-clamp-2">{s.excerpt}</p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> {s.downloadsCount}
                    </span>
                    <span className="text-indigo-600 uppercase tracking-widest group-hover:underline">Study notes &rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Sermon Detail Modal */}
        <AnimatePresence>
          {activeSermon && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold px-3 py-1 bg-indigo-600 text-white rounded-full uppercase">{activeSermon.category}</span>
                    <h2 className="font-extrabold text-slate-900 text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{activeSermon.title}</h2>
                  </div>
                  <button onClick={() => setActiveSermon(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="p-6 sm:p-10 overflow-y-auto space-y-8 flex-1">
                  {activeSermon.videoUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                      <iframe src={activeSermon.videoUrl} title="playback" className="absolute inset-0 w-full h-full" allowFullScreen />
                    </div>
                  )}

                  {activeSermon.audioUrl && activeSermon.audioUrl !== '#' && (
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                          <Music className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight block">Listen to Audio Sermon</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest block">Digital Playback Recording</p>
                        </div>
                      </div>
                      <div className="w-full sm:flex-1 max-w-md">
                        <audio controls className="w-full" src={getImageUrl(activeSermon.audioUrl)}>
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                       <div className="space-y-4">
                         <h4 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                           <FileText className="w-4 h-4" /> Structured Insights & Highlights
                         </h4>
                         <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-light">
                           {activeSermon.notes || 'Full study highlights are synchronized upon publication. Please refer to the PDF download for current outlines.'}
                         </div>
                       </div>
                    </div>

                    <div className="lg:col-span-4">
                       <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-5 shadow-xl relative overflow-hidden">
                         <div className="relative z-10">
                           <BookOpen className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                           <h5 className="font-bold text-lg leading-tight">Assembly Study Booklet</h5>
                           <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">Full weekly study outline with Hebrew context and Thursday cell questions.</p>
                           <button onClick={() => handleDownload(activeSermon)} className="w-full mt-6 flex justify-center items-center py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                             <Download className="w-4 h-4 mr-2" /> Download Ref
                           </button>
                           <span className="block mt-4 text-[9px] font-mono opacity-50">{activeSermon.downloadsCount} community requests</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
