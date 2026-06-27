import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Download, 
  Music,
  Disc,
  Play,
  Volume2,
  Calendar,
  User,
  Headphones
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
    description: 'Listen and stream spiritual audio teachings from our library.',
  });

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

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
                          s.pastor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadAudio = async (s: Sermon) => {
    const toastId = toast.loading(`Preparing MP3 audio file: "${s.title}"...`);
    try {
      await churchService.sermons.incrementDownload(s.id);
      setSermons(prev => prev.map(item => item.id === s.id ? { ...item, downloadsCount: item.downloadsCount + 1 } : item));
      
      const audioUrl = (!s.audioUrl || s.audioUrl === '#') 
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        : getImageUrl(s.audioUrl);
      
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${s.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Download of "${s.title}" completed successfully!`, { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Failed to trigger background download. Redirecting to audio file directly...', { id: toastId });
      // Fallback redirect
      const audioUrl = (!s.audioUrl || s.audioUrl === '#') 
        ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
        : getImageUrl(s.audioUrl);
      window.open(audioUrl, '_blank');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simplified Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Spiritual Audios</span>
          </span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-2">Sermons Library</h1>
          <p className="text-slate-500 font-light text-sm">
            Stream high-quality spiritual messages and download direct MP3 files for offline study.
          </p>
        </div>

        {/* Dynamic Search & Categorization Filter Bar */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-105 shadow-md flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sermon title or preacher..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-wider ${
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

        {/* Sermon Stream Cards - Styled like beautiful video items, but purely playing audio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
               <Music className="w-12 h-12 text-slate-200 mx-auto mb-3 animate-bounce" />
               <p className="text-slate-400 font-medium">No spiritual audio lessons match your current criteria.</p>
            </div>
          ) : (
            filtered.map((s) => {
              const isDemo = !s.audioUrl || s.audioUrl === '#';
              const audioSource = isDemo 
                ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
                : getImageUrl(s.audioUrl);

              const isPlaying = currentlyPlaying === s.id;

              return (
                <motion.div 
                  key={s.id}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-105 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group shadow-sm"
                >
                  {/* Visual Thumbnail styled like a high-end video card */}
                  <div className="h-52 relative bg-slate-950 overflow-hidden shrink-0">
                    <img 
                      src={getImageUrl(s.coverImage)} 
                      alt={s.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                    
                    {/* Dark gradient shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    {/* Department Tag */}
                    <span className="absolute top-4 left-4 bg-white/95 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-slate-950 shadow-md">
                      {s.category}
                    </span>

                    {/* Styled as a video card: floating circular play icon overlay in the center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div 
                        onClick={() => {
                          const player = document.getElementById(`audio-player-${s.id}`) as HTMLAudioElement;
                          if (player) {
                            if (currentlyPlaying === s.id) {
                              player.pause();
                            } else {
                              player.play();
                            }
                          }
                        }}
                        animate={{ scale: isPlaying ? [1, 1.08, 1] : 1 }}
                        transition={{ repeat: isPlaying ? Infinity : 0, duration: 2 }}
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl group-hover:bg-indigo-600/95 group-hover:border-indigo-500 transition-all duration-300 pointer-events-auto cursor-pointer"
                        title={isPlaying ? 'Audio Streaming' : 'Play Sermon'}
                      >
                        {isPlaying ? (
                          <Disc className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                        )}
                      </motion.div>
                    </div>

                    {/* Video-Style Duration indicator showing file is high-quality audio */}
                    <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-xs border border-white/10 text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5">
                      <Headphones className="w-3 h-3 text-indigo-400" />
                      <span>{isDemo ? 'Demo Playback' : 'Audio Playback'}</span>
                    </div>
                  </div>

                  {/* Clean, Simple Sermon Information (Title & Preacher Only - No notes, PDFs, or excerpts) */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 text-slate-350" />
                        <span>{s.date}</span>
                      </div>
                      
                      <h3 className="font-extrabold text-[#020617] text-lg leading-snug tracking-tight hover:text-indigo-650 transition-colors line-clamp-2">
                        {s.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-150">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                         </div>
                         <span className="text-xs font-bold text-slate-600">{s.pastor}</span>
                      </div>
                    </div>

                    {/* Clean Audio Playback Section */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        {isDemo ? (
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Demo Audio (6-Min Instrumental)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                            <Music className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Sermon Audio Recording</span>
                          </span>
                        )}
                        {isPlaying && <span className="text-indigo-600 animate-pulse text-[9px]">● STREAMING</span>}
                      </div>
                      <audio 
                        id={`audio-player-${s.id}`}
                        controls 
                        onPlay={() => setCurrentlyPlaying(s.id)}
                        onPause={() => { if (currentlyPlaying === s.id) setCurrentlyPlaying(null); }}
                        className="w-full h-8 accent-indigo-600 rounded-lg" 
                        src={audioSource}
                        preload="none"
                      >
                        Your device does not support inline audio playback.
                      </audio>
                    </div>

                    {/* Well-implemented direct background download */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                        {s.downloadsCount} downloads
                      </span>
                      <button 
                        onClick={() => handleDownloadAudio(s)}
                        className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-[#020617] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-indigo-600/15 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP3</span>
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
