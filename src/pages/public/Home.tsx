import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Radio,
  Clock,
  Send,
  Heart,
  Users,
  Video,
  Download,
  Flame,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Globe,
  Plus,
  ShieldCheck,
  User,
  Music,
  Disc
} from 'lucide-react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { churchService } from '../../services/churchService';
import { authService } from '../../services/auth';
import { Sermon, ChurchEvent, Devotional, PrayerCenterRequest, User as UserType } from '../../types';
import { toast } from 'sonner';
import { getImageUrl } from '../../lib/image-utils';

export default function Home() {
  useDocumentMeta({
    title: 'Welcome',
    description: 'Welcome to New Nature in Christ Ministry. We are a Bible-believing church dedicated to raising uncompromised disciples and impacting our community.',
    keywords: 'church, ministry, Jesus, Malawi, Lilongwe, Zomba, Gospel'
  });

  const { settings } = useOrgSettings();
  
  // States
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [prayers, setPrayers] = useState<PrayerCenterRequest[]>([]);
  const [leadership, setLeadership] = useState<UserType[]>([]);
  
  // Prayer Form
  const [formName, setFormName] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('Healing');
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);

  useEffect(() => {
    async function loadHomeContent() {
      try {
        const allSermons = await churchService.sermons.getAll();
        setSermons(allSermons.slice(0, 3));
      } catch (err) {
        console.error('Failed loading sermons:', err);
      }

      try {
        const allEvents = await churchService.events.getAll();
        setEvents(allEvents.slice(0, 2));
      } catch (err) {
        console.error('Failed loading events:', err);
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const activeDevotional = await churchService.devotionals.getForDate(today);
        setDevotional(activeDevotional);
      } catch (err) {
        console.error('Failed loading devotional:', err);
      }

      try {
        const activePrayers = await churchService.prayers.getAll();
        setPrayers(activePrayers.slice(0, 3));
      } catch (err) {
        console.error('Failed loading prayers:', err);
      }

      try {
        const allUsers = await authService.getAllProfiles();
        const leaders = allUsers.filter(u => 
          ['pastor', 'ministry_leader', 'readership'].includes(u.role) && 
          u.status === 'active'
        ).slice(0, 4);
        setLeadership(leaders);
      } catch (err) {
        console.error('Failed loading leadership profiles:', err);
      }
    }
    loadHomeContent();
  }, []);

  const handleDownloadAudio = async (s: Sermon) => {
    try {
      await churchService.sermons.incrementDownload(s.id);
      setSermons(prev => prev.map(item => item.id === s.id ? { ...item, downloadsCount: item.downloadsCount + 1 } : item));
      
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

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) {
      toast.error('Please write your prayer request');
      return;
    }

    setSubmittingPrayer(true);
    try {
      await churchService.prayers.submit({
        name: formAnonymous ? 'Anonymous' : (formName.trim() || 'Anonymous Member'),
        isAnonymous: formAnonymous,
        requestText: formText,
        category: formCategory,
        isPraiseReport: false
      });
      
      toast.success('Your prayer request has been submitted to the intercessory wall!');
      setFormText('');
      setFormName('');
      
      // reload prayers list
      const activePrayers = await churchService.prayers.getAll();
      setPrayers(activePrayers.slice(0, 3));
    } catch (e) {
      toast.error('Failed submitting prayer request');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleSupportPrayer = async (id: string) => {
    try {
      await churchService.prayers.incrementPrayerCount(id);
      setPrayers(prev => prev.map(p => p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p));
      toast.success('Thank you for standing in agreement and praying for this need!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 overflow-hidden font-sans">
      
      {/* 1. Full-Screen Elegant Hero Section */}
      <section className="relative bg-slate-950 text-white pt-32 pb-44 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1920&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-25 object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#4f46e530,transparent)] uppercase opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20 mb-8"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            {settings.motto || '2 Corinthians 5:17 — All Things Have Become New!'}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white max-w-4xl mx-auto mb-6"
          >
            Experience a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-amber-300 to-indigo-300">New Nature</span> in Jesus Christ
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Welcome to <span className="font-semibold text-white">{settings.orgName || 'New Nature In Christ Ministry'}</span>. Under the pastoral oversight of {settings.directorName || 'Pastor Richie Mkandawire'}, we are raising a spirit-filled, discipleship-focused family in {settings.orgAddress || 'Zomba, Malawi'}.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/scriptures"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/35 transition-all duration-200 hover:scale-105 active:scale-95 text-center group"
            >
              <BookOpen className="mr-2.5 w-5 h-5 text-indigo-200 group-hover:animate-bounce" />
              Scripture Meditations
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-800 text-base font-bold rounded-2xl text-slate-300 hover:text-white hover:bg-slate-900/50 hover:border-slate-700 transition-all duration-200 hover:scale-105 hover:bg-slate-900 active:scale-95 text-center bg-transparent"
            >
              Learn Our Vision
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Responsive Sticky Service Times Ticker */}
      <section className="relative -mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-indigo-600 px-6 py-3 flex items-center justify-between gap-3 text-white">
            <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Service Schedules — Visit Us This Week!
            </span>
            <span className="hidden md:inline-block text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider"> DMC Campus </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-slate-100">
            {[
              { day: 'SUNDAY SERVICE', name: 'Sunday Celebration Service', time: '08:30 AM - 12:00 PM', desc: 'DMC Campus | Heavy Worship, Powerful Word & Fellowship' },
              { day: 'WEDNESDAY BIBLE STUDY', name: 'Weekly Bible Study', time: '03:00 PM - 05:00 PM', desc: "Pastor's House | Deep Scriptures Exploration & Intercession" }
            ].map((srv, index) => (
              <div key={index} className="p-6 flex flex-col hover:bg-slate-50 transition-colors duration-200">
                <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider mb-1">{srv.day}</span>
                <h4 className="font-bold text-slate-950 text-base leading-tight mb-2">{srv.name}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> {srv.time}
                </div>
                <p className="text-xs text-slate-405 font-light">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Daily Scripture / Devotional Section */}
      {devotional && (
        <section id="daily-devotional" className="py-24 bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Spiritual Nourishment
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 tracking-tight">Daily Bread Devotional</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto font-light">
                A daily scripture and guided reflection generated fresh each day by our pastoral study assistant for your spiritual walk.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-white border border-indigo-100/60 rounded-3xl p-8 sm:p-12 shadow-xl shadow-indigo-600/[0.03] relative overflow-hidden group"
            >
              {/* Subtle design graphics */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full filter blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full filter blur-3xl -ml-10 -mb-10 group-hover:bg-amber-500/10 transition-colors duration-500" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xl leading-tight">{devotional.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-1">
                      {devotional.date ? new Date(devotional.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : devotional.date}
                    </p>
                  </div>
                </div>
                <div className="self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 px-4 py-2 rounded-2xl shadow-sm border border-amber-300">
                    <Flame className="w-3.5 h-3.5 text-amber-800" /> {devotional.scripture}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative pl-6 border-l-4 border-indigo-600 italic font-medium text-slate-800 text-lg leading-relaxed bg-indigo-50/20 py-4 pr-4 rounded-r-2xl border border-indigo-100/30">
                  {devotional.scriptureText}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Today's Meditation
                  </h4>
                  <p className="text-base text-slate-650 leading-relaxed font-light whitespace-pre-line text-slate-700">
                    {devotional.reflection}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-3">Guided Daily Prayer</h4>
                  <p className="text-sm bg-indigo-50/30 text-slate-700 leading-relaxed italic p-6 rounded-2xl border border-indigo-100/40 shadow-inner">
                    "{devotional.prayer}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 4. Latest Sermons Grid */}
      <section className="py-24 bg-slate-100/40 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Spiritual Library</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1.5 tracking-tight">Recent Sermons</h2>
              <p className="text-slate-400 mt-2 text-sm font-light">Equip your walk with high-definition word revelations and video playbacks.</p>
            </div>
            <Link 
              to="/sermons" 
              className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 group"
            >
              Browse Library 
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sermons.map((s, index) => {
              const isDemo = !s.audioUrl || s.audioUrl === '#';
              const audioSource = isDemo 
                ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
                : getImageUrl(s.audioUrl);

              const isPlaying = currentlyPlaying === s.id;

              return (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-slate-105 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                >
                  {/* Thumbnail Cover with Play button overlay & Video duration style tag */}
                  <div className="h-48 relative overflow-hidden shrink-0 bg-slate-950">
                    <img 
                      src={getImageUrl(s.coverImage)} 
                      alt={s.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-slate-950 shadow-sm">
                      {s.category}
                    </div>

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
                        className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/35 flex items-center justify-center text-white shadow-xl group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300 pointer-events-auto cursor-pointer"
                        title={isPlaying ? 'Audio Streaming' : 'Play Sermon'}
                      >
                        {isPlaying ? (
                          <Disc className="w-5 h-5 animate-spin text-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                        )}
                      </motion.div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs border border-white/10 text-white font-mono text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                      <Headphones className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{isDemo ? 'Demo Playback' : 'Audio Playback'}</span>
                    </div>
                  </div>

                  {/* Body with Title & Preacher only (No notes, PDFs, or excerpts) */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{s.date}</span>
                      
                      <h3 className="font-extrabold text-[#020617] text-base mt-1.5 line-clamp-2 leading-snug">
                        {s.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                         <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {s.pastor.charAt(0).toUpperCase()}
                         </div>
                         <span className="text-xs font-semibold text-slate-600">{s.pastor}</span>
                      </div>

                      {/* Integrated Audio Player */}
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          {isDemo ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Demo Audio (6-Min Instrumental)</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-600">
                              <Music className="w-3.5 h-3.5 text-emerald-600" />
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
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold font-mono text-[10px]">
                        {s.downloadsCount} downloads
                      </span>
                      <button 
                        onClick={() => handleDownloadAudio(s)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-[#020617] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP3</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Upcoming Events */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
            <div>
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Stay Connected</span>
              <h2 className="text-3xl font-extrabold text-slate-950 mt-1.5 tracking-tight">Upcoming Conferences & Crusades</h2>
              <p className="text-slate-400 mt-2 text-sm font-light">Be a part of live corporate breakthroughs and local assembly programs.</p>
            </div>
            <Link 
              to="/events" 
              className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 group"
            >
              Calendar Events 
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((e, index) => (
              <motion.div 
                key={e.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-slate-50 border border-slate-105 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row h-full"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto shrink-0 relative bg-slate-900">
                  <img src={e.image} alt={e.title} className="w-full h-full object-cover object-center" />
                  <span className="absolute top-4 left-4 bg-indigo-600 text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full">
                    {e.category}
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-lg leading-snug">{e.title}</h3>
                    <p className="mt-2.5 text-xs text-slate-500 leading-relaxed font-light line-clamp-3">{e.description}</p>
                    
                    <div className="mt-5 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Calendar className="w-4 h-4 text-indigo-600" /> {e.date} &bull; {e.time}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-400" /> {e.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="text-xs text-indigo-600 font-bold">{e.registeredCount} attending</span>
                    <Link to={`/events`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow transition-all active:scale-95 duration-150">
                      Register Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Live Interactive Prayer Request Hub */}
      <section className="py-24 bg-slate-100/30 border-t border-b border-slate-200/60 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left side: Prayer Submission Form */}
            <div className="lg:col-span-5 bg-white border border-slate-105 rounded-3xl p-8 shadow-xl sticky top-24">
              <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase block mb-1 font-mono">Stand in Agreement</span>
              <h2 className="font-extrabold text-slate-950 text-2xl mb-4">Submit Prayer Request</h2>
              <p className="text-xs text-slate-450 font-light leading-relaxed mb-6">
                Our active intercessory prayer network and pastors gather daily to stand in battle prayer over all requests.
              </p>

              <form onSubmit={handlePrayerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Your Name (Optional)</label>
                  <input 
                    type="text" 
                    value={formName}
                    disabled={formAnonymous}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={formAnonymous ? 'Anonymous' : 'e.g. Brother George'}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-slate-50 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input 
                    type="checkbox" 
                    id="chk-anonymous-home"
                    checked={formAnonymous}
                    onChange={(e) => {
                      setFormAnonymous(e.target.checked);
                      if (e.target.checked) setFormName('');
                    }}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
                  />
                  <label htmlFor="chk-anonymous-home" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide cursor-pointer">Submit anonymously</label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Your Petition</label>
                  <textarea 
                    rows={4}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Describe what you want us to lay before the Lord..."
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-slate-50 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingPrayer}
                  className="w-full inline-flex items-center justify-center p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 active:scale-95 transition-all outline-none border border-transparent"
                >
                  {submittingPrayer ? 'Submitting...' : 'Submit to Prayer Wall'}
                  <Send className="ml-2 w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right side: Altar Wall Feed */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase font-mono">The Communal Altar</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1.5 tracking-tight">Active Petitions Wall</h2>
                <p className="text-slate-400 text-sm mt-1">Believers standing together across Zomba. Click "Amen" to join agreement!</p>
              </div>

              <div className="space-y-4">
                {prayers.map((pray) => (
                  <motion.div 
                    key={pray.id}
                    className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 font-bold text-xs text-indigo-600 flex items-center justify-center border border-indigo-100">
                          {pray.name ? pray.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 underline underline-offset-4 decoration-indigo-200">{pray.name || 'Anonymous Petitioner'}</h4>
                          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">Church Feed</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">{pray.category}</span>
                    </div>

                    <p className="text-slate-700 text-sm font-light leading-relaxed mb-4 whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                      "{pray.requestText}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {pray.prayerCount} voices
                      </span>

                      <button
                        onClick={() => handleSupportPrayer(pray.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-bold uppercase transition-all"
                      >
                        <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" /> Stand in Amen
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-2">
                <Link to="/prayer" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide hover:underline">
                  Browse Comprehensive Altar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6.5 Leadership Section */}
      {leadership.length > 0 && (
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-4"
                >
                  <ShieldCheck className="w-4 h-4" /> Spiritual Shepherds
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Meet Our Pastoral & Leadership Team
                </h2>
                <p className="mt-4 text-slate-500 font-light text-base sm:text-lg leading-relaxed">
                  The dedicated men and women called to guide our ministry branches across the region.
                </p>
              </div>
              <Link 
                to="/leadership" 
                className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide hover:underline group"
              >
                View Unified Registry <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadership.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-sm border-2 border-slate-50 group-hover:shadow-xl transition-all duration-500">
                    {member.photoURL ? (
                      <img 
                        src={getImageUrl(member.photoURL)} 
                        alt={member.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <User className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-1 drop-shadow-sm">
                        {member.role.replace('_', ' ')}
                      </p>
                      <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{member.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Giving Showcase */}
      <section className="bg-slate-950 relative text-white py-24 overflow-hidden border-t border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#4f46e525,transparent)] opacity-40" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="inline-flex items-center gap-1.5 bg-indigo-500/15 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-5"
          >
            <DollarSign className="w-3 h-3 text-amber-400" /> Malachi 3:10 — Support the Storehouse
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
            Honor God with Your Seeds & Offerings
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Convenient and secure digital channels are integrated to help givers support building projects, evangelism outreach programs, and children services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/give"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/25 transition-all duration-200 hover:scale-105 active:scale-95 text-center min-w-[200px]"
            >
              Give Online Now
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl text-slate-300 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all duration-200 hover:scale-105 active:scale-95 text-center min-w-[200px]"
            >
              First Time Guest Register
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
