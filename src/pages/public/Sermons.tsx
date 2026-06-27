import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  Download, 
  Music,
  Disc
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
    description: 'Listen to recent audio sermons and teachings from New Nature in Christ Ministry.',
    keywords: 'sermons, preaching, bible teaching, audio sermons, NNCM'
  });

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function fetchSermons() {
      try {
        const list = await churchService.sermons.getAll();
        setSermons(list);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSermons();
  }, []);

  const categories = ['All', 'Sunday Service', 'Midweek Service', 'Youth', 'Crusade'];

  const filtered = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.pastor.toLowerCase().includes(search.toLowerCase()) ||
                          s.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadAudio = async (s: Sermon) => {
    try {
      await churchService.sermons.incrementDownload(s.id);
      setSermons(prev => prev.map(item => item.id === s.id ? { ...item, downloadsCount: item.downloadsCount + 1 } : item));
      
      // Use actual audio link or fallback high-quality placeholder for realistic play
      const audioUrl = (!s.audioUrl || s.audioUrl === '#') 
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        : getImageUrl(s.audioUrl);
      
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${s.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading audio sermon: "${s.title}"!`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to trigger download. Please try again.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Spiritual Audio Feed</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Audio Sermons Library</h1>
          <p className="text-slate-500 font-light text-sm">
            Listen directly to recent sermon messages and preaching. Stream or download any spiritual teaching.
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
              placeholder="Search by topic or preacher..."
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
               <Music className="w-12 h-12 text-slate-200 mx-auto mb-3" />
               <p className="text-slate-400 font-medium">No archived audio sermons matched your current criteria.</p>
            </div>
          ) : (
            filtered.map((s) => {
              const audioSource = (!s.audioUrl || s.audioUrl === '#') 
                ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
                : getImageUrl(s.audioUrl);

              return (
                <motion.div 
                  key={s.id}
                  layoutId={`sermon-card-${s.id}`}
                  className="bg-white border border-slate-150 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Thumbnail / Cover Image */}
                  <div className="h-48 relative bg-slate-900 overflow-hidden shrink-0">
                    <img 
                      src={getImageUrl(s.coverImage)} 
                      alt={s.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                    <span className="absolute top-4 left-4 bg-white/95 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-900 shadow-sm">
                      {s.category}
                    </span>
                    <div className="absolute top-4 right-4 bg-indigo-600/90 text-white p-2 rounded-full shadow-sm">
                      <Disc className="w-4 h-4 animate-spin-slow text-white" />
                    </div>
                  </div>

                  {/* Sermon Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                        {s.date} &bull; {s.pastor}
                      </div>
                      <h3 className="font-extrabold text-slate-950 text-lg leading-snug line-clamp-2">
                        {s.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2">
                        {s.excerpt}
                      </p>
                    </div>

                    {/* Integrated Audio Player */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                        <Music className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sermon Audio Playback</span>
                      </div>
                      <audio 
                        controls 
                        className="w-full h-8 accent-indigo-600 rounded-lg" 
                        src={audioSource}
                        preload="none"
                      >
                        Your browser does not support audio playback.
                      </audio>
                    </div>

                    {/* Download & Stats Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium font-mono">
                        {s.downloadsCount} downloads
                      </span>
                      <button 
                        onClick={() => handleDownloadAudio(s)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download MP3
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
