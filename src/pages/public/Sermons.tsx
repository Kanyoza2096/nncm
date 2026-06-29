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
  Headphones,
  Eye,
  X
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

        {/* Sermon Audio List - Styled as elegant horizontal rows with cover photo on one side */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
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
                  whileHover={{ y: -2 }}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row h-auto group shadow-xs"
                >
                  {/* Cover photo side (left side on sm screens and up) */}
                  <div className="w-full sm:w-48 md:w-56 h-48 sm:h-auto shrink-0 relative bg-slate-950 overflow-hidden">
                    {/* Blurred background copy to fill space without showing solid blanks */}
                    <div className="absolute inset-0 select-none pointer-events-none">
                      <img 
                        src={getImageUrl(s.coverImage)} 
                        alt="" 
                        className="w-full h-full object-cover blur-lg scale-110 opacity-40" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Fully visible container image */}
                    <img 
                      src={getImageUrl(s.coverImage)} 
                      alt={s.title} 
                      className="w-full h-full object-contain relative z-10 opacity-90 group-hover:scale-102 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                    
                    {/* Dark gradient shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 z-10" />

                    {/* View full flyer button */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage(getImageUrl(s.coverImage));
                      }}
                      className="absolute top-3 right-3 bg-slate-950/85 hover:bg-indigo-600 border border-white/20 text-white p-1.5 rounded-full transition-colors z-20 flex items-center justify-center shadow-lg cursor-pointer"
                      title="View Full Flyer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Clean Audio Information (Title, Preacher, Player, & Downloads) */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          {s.category}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          <span>{s.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-150">
                            <User className="w-3 text-slate-500" />
                          </div>
                          <span>{s.pastor}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-extrabold text-[#020617] text-lg leading-snug tracking-tight hover:text-indigo-650 transition-colors line-clamp-2">
                        {s.title}
                      </h3>
                    </div>

                    {/* Clean Audio Playback Section */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                      {/* Play/Pause Button */}
                      <button 
                        type="button"
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-sm shrink-0 cursor-pointer ${
                          isPlaying ? 'bg-indigo-600 animate-pulse' : 'bg-slate-900 hover:bg-indigo-600'
                        }`}
                        title={isPlaying ? 'Pause Audio' : 'Play Audio'}
                      >
                        {isPlaying ? (
                          <Disc className="w-5 h-5 animate-spin text-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                        )}
                      </button>

                      {/* Native HTML5 Audio Player */}
                      <div className="flex-1 min-w-0">
                        <audio 
                          id={`audio-player-${s.id}`}
                          controls 
                          onPlay={() => setCurrentlyPlaying(s.id)}
                          onPause={() => { if (currentlyPlaying === s.id) setCurrentlyPlaying(null); }}
                          className="w-full h-8 accent-indigo-600 rounded-lg" 
                          src={audioSource}
                          preload="none"
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>

                      {/* Live status Indicator */}
                      <div className="flex items-center gap-2 justify-between sm:justify-start">
                        {isPlaying ? (
                          <span className="text-indigo-600 font-extrabold text-[9px] animate-pulse whitespace-nowrap bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            ● STREAMING
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                            <Headphones className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{isDemo ? 'Demo Playback' : 'Audio Playback'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Well-implemented direct background download */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                        {s.downloadsCount} downloads
                      </span>
                      <button 
                        onClick={() => handleDownloadAudio(s)}
                        className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-[#020617] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-indigo-600/15 active:scale-95 cursor-pointer"
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

      {/* Lightbox / Zoom Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out select-none animate-fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-full transition-colors z-50 flex items-center justify-center cursor-pointer shadow-lg"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/40 text-xs mt-3 font-mono">Click anywhere outside to exit full screen</p>
          </div>
        </div>
      )}

    </div>
  );
}
