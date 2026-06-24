import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Search, 
  BookOpen, 
  Compass, 
  Wind, 
  Play, 
  Pause,
  Layers,
  Type,
  Share2,
  Check,
  Award
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { toast } from 'sonner';

interface Scripture {
  reference: string;
  text: string;
  category: 'Identity' | 'Grace' | 'Zoe Life' | 'Faith' | 'Victory';
  context?: string;
}

const SCRIPTURES: Scripture[] = [
  {
    reference: '2 Corinthians 5:17',
    text: 'Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new.',
    category: 'Identity',
    context: 'The foundation of our new nature under Grace.'
  },
  {
    reference: 'Galatians 2:20',
    text: 'I have been crucified with Christ; it is no longer I who live, but Christ lives in me; and the life which I now live in the flesh I live by faith in the Son of God, who loved me and gave Himself for me.',
    category: 'Identity',
    context: 'The substitutionary life of Christ in the believer.'
  },
  {
    reference: 'Ephesians 2:8-9',
    text: 'For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, lest anyone should boast.',
    category: 'Grace',
    context: 'Salvation as a complete gift of Divine favor.'
  },
  {
    reference: 'Romans 8:1',
    text: 'There is therefore now no condemnation to those who are in Christ Jesus, who do not walk according to the flesh, but according to the Spirit.',
    category: 'Grace',
    context: 'The absolute freedom from guilt and law.'
  },
  {
    reference: 'Romans 5:17',
    text: 'For if by the one man\'s offense death reigned through the one, much more those who receive abundance of grace and of the gift of righteousness will reign in life through the One, Jesus Christ.',
    category: 'Grace',
    context: 'Reigning as kings in this present life through righteousness.'
  },
  {
    reference: '1 John 4:4',
    text: 'You are of God, little children, and have overcome them, because He who is in you is greater than he who is in the world.',
    category: 'Victory',
    context: 'The indwelling Christ guaranteeing our triumph.'
  },
  {
    reference: 'Colossians 3:3-4',
    text: 'For you died, and your life is hidden with Christ in God. When Christ who is our life appears, then you also will appear with Him in glory.',
    category: 'Identity',
    context: 'Our ultimate security and shared destiny in God.'
  },
  {
    reference: 'John 10:10',
    text: 'The thief does not come except to steal, and to kill, and to destroy. I have come that they may have life, and that they may have it more abundantly.',
    category: 'Zoe Life',
    context: 'The super-abundant God-kind of life (Zoe) brought by Jesus.'
  },
  {
    reference: 'Romans 8:37',
    text: 'Yet in all these things we are more than conquerors through Him who loved us.',
    category: 'Victory',
    context: 'Absolute triumph over every limitation.'
  },
  {
    reference: 'Ephesians 1:3',
    text: 'Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ.',
    category: 'Grace',
    context: 'The present-hour reality of complete spiritual enrichment.'
  },
  {
    reference: 'Philemon 1:6',
    text: 'That the sharing of your faith may become effective by the acknowledgment of every good thing which is in you in Christ Jesus.',
    category: 'Faith',
    context: 'The effectiveness of faith hinges on acknowledging our inner treasures.'
  },
  {
    reference: '1 Corinthians 15:57',
    text: 'But thanks be to God, who gives us the victory through our Lord Jesus Christ.',
    category: 'Victory',
    context: 'Victory as a direct inheritance, not a sweat.'
  },
  {
    reference: '2 Corinthians 3:18',
    text: 'But we all, with unveiled face, beholding as in a mirror the glory of the Lord, are being transformed into the same image from glory to glory, just as by the Spirit of the Lord.',
    category: 'Zoe Life',
    context: 'The effortless transformation of our souls by beholding Jesus.'
  },
  {
    reference: 'John 1:16',
    text: 'And of His fullness we have all received, and grace for grace.',
    category: 'Grace',
    context: 'Receiving unending waves of unmerited blessing.'
  },
  {
    reference: '1 Peter 2:9',
    text: 'But you are a chosen generation, a royal priesthood, a holy nation, His own special people, that you may proclaim the praises of Him who called you out of darkness into His marvelous light.',
    category: 'Identity',
    context: 'Our priestly office and royal status in the Kingdom.'
  }
];

interface ThemePreset {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  cardClass: string;
}

const THEMES: ThemePreset[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Slate',
    bgClass: 'bg-slate-950 text-white',
    textClass: 'text-white selection:bg-indigo-500/30',
    accentClass: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    cardClass: 'bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-2xl'
  },
  {
    id: 'sunrise',
    name: 'Warm Sunrise',
    bgClass: 'bg-amber-50/40 text-stone-900',
    textClass: 'text-stone-900 selection:bg-amber-200/50',
    accentClass: 'text-amber-700 border-amber-200/50 bg-amber-100/60',
    cardClass: 'bg-white/80 border border-amber-100/80 backdrop-blur-md shadow-xl shadow-amber-900/5'
  },
  {
    id: 'emerald',
    name: 'Serene Moss',
    bgClass: 'bg-emerald-950/95 text-emerald-50',
    textClass: 'text-emerald-50 selection:bg-emerald-500/30',
    accentClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    cardClass: 'bg-emerald-900/40 border border-emerald-800/40 backdrop-blur-md shadow-2xl'
  },
  {
    id: 'minimalist',
    name: 'Pure Grace',
    bgClass: 'bg-white text-slate-800',
    textClass: 'text-slate-900 selection:bg-indigo-100',
    accentClass: 'text-indigo-600 border-indigo-100 bg-indigo-50/50',
    cardClass: 'bg-white border border-slate-150 shadow-lg'
  }
];

export default function Scriptures() {
  useDocumentMeta({
    title: 'Scripture Meditations',
    description: 'Immerse yourself in beautiful animated scripture, designed to stir faith, unleash grace, and awaken your new creation identity.',
    keywords: 'scriptures, Bible verses, daily devotion, new creation, grace, faith, healing, NNCM'
  });

  const [currentCategory, setCurrentCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(THEMES[0]);
  const [isSerif, setIsSerif] = useState<boolean>(true);
  
  // Audio narration states
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);

  // Auto rotation states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotationInterval, setRotationInterval] = useState<number>(10); // seconds
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Meditation mode
  const [isMeditating, setIsMeditating] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const [copied, setCopied] = useState<boolean>(false);

  // Filter scriptures based on category and search query
  const filteredScriptures = SCRIPTURES.filter(scrip => {
    const matchesCat = currentCategory === 'All' || scrip.category === currentCategory;
    const matchesSearch = scrip.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scrip.reference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Keep index within range when list changes
  useEffect(() => {
    if (currentIndex >= filteredScriptures.length) {
      setCurrentIndex(0);
    }
  }, [filteredScriptures, currentIndex]);

  const currentScripture = filteredScriptures[currentIndex] || SCRIPTURES[0];

  const handleNext = useCallback(() => {
    if (filteredScriptures.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % filteredScriptures.length);
  }, [filteredScriptures]);

  const handlePrev = useCallback(() => {
    if (filteredScriptures.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + filteredScriptures.length) % filteredScriptures.length);
  }, [filteredScriptures]);

  const handleRandom = () => {
    if (filteredScriptures.length <= 1) return;
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex) {
      nextIdx = Math.floor(Math.random() * filteredScriptures.length);
    }
    setCurrentIndex(nextIdx);
  };

  // Web Speech API initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  // Stop reading if current scripture changes
  useEffect(() => {
    if (speechSynth) {
      speechSynth.cancel();
      setIsSpeaking(false);
    }
  }, [currentIndex, speechSynth]);

  const handleSpeak = () => {
    if (!speechSynth || !currentScripture) return;

    if (isSpeaking) {
      speechSynth.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(`${currentScripture.text} - ${currentScripture.reference}`);
    
    // Choose a nice English voice if possible
    const voices = speechSynth.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                         voices.find(v => v.lang.startsWith('en'));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.rate = 0.85; // slightly slower for meditative pace
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    speechSynth.speak(utterance);
  };

  // Auto rotation timer loop
  useEffect(() => {
    if (!isPlaying || isMeditating || filteredScriptures.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, rotationInterval * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, rotationInterval, handleNext, isMeditating, filteredScriptures]);

  // Breathing Guide Loop
  useEffect(() => {
    if (!isMeditating) return;

    let timer: NodeJS.Timeout;
    const breathe = () => {
      setBreathPhase('Inhale');
      timer = setTimeout(() => {
        setBreathPhase('Hold');
        timer = setTimeout(() => {
          setBreathPhase('Exhale');
          timer = setTimeout(breathe, 4000); // Exhale 4s
        }, 4000); // Hold 4s
      }, 4000); // Inhale 4s
    };

    breathe();
    return () => clearTimeout(timer);
  }, [isMeditating]);

  // Copy text helper
  const handleCopy = () => {
    if (!currentScripture) return;
    const fullText = `"${currentScripture.text}" — ${currentScripture.reference} (New Nature in Christ Ministry)`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Scripture copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`transition-all duration-1000 min-h-screen pt-24 pb-20 font-sans ${activeTheme.bgClass} flex flex-col justify-between`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        
        {/* Navigation & Options Header Bar (Hidden in Fullscreen Meditation) */}
        <AnimatePresence>
          {!isMeditating && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/10 flex items-center gap-1 text-[10px] uppercase font-black tracking-widest">
                      <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" /> Wisdom Feed
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Scripture Meditations</h1>
                  <p className="text-xs opacity-70 mt-1">Behold Jesus. Walk in Zoe. Embrace your New Identity.</p>
                </div>

                {/* Controller toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Theme Presets */}
                  <div className="flex items-center gap-1.5 bg-slate-900/10 dark:bg-white/5 p-1 rounded-xl border border-slate-200/10">
                    <Layers className="w-3.5 h-3.5 opacity-60 ml-1.5" />
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setActiveTheme(theme)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                          activeTheme.id === theme.id 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'hover:bg-slate-900/10 dark:hover:bg-white/5 opacity-70'
                        }`}
                      >
                        {theme.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Font Type Toggle */}
                  <button
                    onClick={() => setIsSerif(!isSerif)}
                    title="Change Typography Theme"
                    className="p-2 bg-slate-900/10 dark:bg-white/5 hover:bg-slate-900/20 dark:hover:bg-white/10 border border-slate-200/10 rounded-xl transition"
                  >
                    <Type className="w-4 h-4" />
                  </button>

                  {/* Meditation Breath Trigger */}
                  <button
                    onClick={() => setIsMeditating(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Wind className="w-4 h-4 animate-pulse" /> Meditate
                  </button>
                </div>
              </div>

              {/* Categorization & Search Header */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
                <div className="flex flex-wrap gap-1.5 bg-slate-900/5 dark:bg-white/5 p-1 rounded-xl border border-slate-200/5 max-w-xl">
                  {['All', 'Identity', 'Grace', 'Zoe Life', 'Faith', 'Victory'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCurrentCategory(cat);
                        setCurrentIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentCategory === cat
                          ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400'
                          : 'opacity-75 hover:opacity-100 hover:bg-white/40 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 max-w-xs self-stretch">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search scriptures..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentIndex(0);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900/5 dark:bg-white/5 border border-slate-200/10 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Stage Area */}
        <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-12 relative">
          
          {/* Main Scripture Card */}
          <div className="w-full max-w-4xl relative min-h-[380px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {filteredScriptures.length > 0 ? (
                <motion.div
                  key={currentScripture.reference}
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className={`p-8 sm:p-14 rounded-3xl ${activeTheme.cardClass} flex-1 flex flex-col justify-between relative overflow-hidden`}
                >
                  {/* Decorative glowing orb inside card */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

                  {/* Header info */}
                  <div className="flex justify-between items-center mb-6">
                    <span className={`px-2.5 py-1 text-[9px] uppercase font-black tracking-widest rounded-full ${activeTheme.accentClass}`}>
                      {currentScripture.category}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">
                      {currentIndex + 1} of {filteredScriptures.length}
                    </span>
                  </div>

                  {/* Scripture Text */}
                  <div className="my-auto space-y-6">
                    <blockquote 
                      className={`text-xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-relaxed sm:leading-loose ${
                        isSerif ? 'font-serif italic' : 'font-sans'
                      } ${activeTheme.textClass}`}
                    >
                      “{currentScripture.text}”
                    </blockquote>

                    {/* Context or subtitle */}
                    {currentScripture.context && (
                      <p className="text-xs opacity-50 font-light italic max-w-xl">
                        {currentScripture.context}
                      </p>
                    )}
                  </div>

                  {/* Reference & Actions Footer */}
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-200/10 pt-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
                      <cite className="not-italic text-base sm:text-lg font-bold tracking-tight">
                        {currentScripture.reference}
                      </cite>
                    </div>

                    {/* Quick Utility Tools */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleSpeak}
                        title={isSpeaking ? 'Stop Reading' : 'Listen with Audio'}
                        className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/5 hover:bg-slate-900/20 dark:hover:bg-white/10 border border-slate-200/5 transition text-indigo-500 dark:text-indigo-400 active:scale-95"
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={handleCopy}
                        title="Copy Quote Reference"
                        className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/5 hover:bg-slate-900/20 dark:hover:bg-white/10 border border-slate-200/5 transition active:scale-95"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={handleRandom}
                        title="Random Scripture"
                        className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/5 hover:bg-slate-900/20 dark:hover:bg-white/10 border border-slate-200/5 transition active:scale-95 text-indigo-500 dark:text-indigo-400"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 dark:bg-white/5 border border-slate-200/10 rounded-3xl min-h-[300px]">
                  <Compass className="w-12 h-12 text-slate-400 animate-spin mb-4" />
                  <h3 className="text-sm font-extrabold">No Scriptures Match Your Filter</h3>
                  <p className="text-xs opacity-60 mt-1">Try resetting your category or clearing the search keyword.</p>
                  <button
                    onClick={() => { setCurrentCategory('All'); setSearchQuery(''); }}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </AnimatePresence>

            {/* Manual Slide Navigation Overlay Arrows */}
            {filteredScriptures.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-indigo-600 border border-slate-200/10 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
                  aria-label="Previous verse"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:text-indigo-600 border border-slate-200/10 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
                  aria-label="Next verse"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Fullscreen Quiet Meditation Breathing Visualizer Modal Overlay */}
          <AnimatePresence>
            {isMeditating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950 text-white z-[999] flex flex-col justify-between p-8 sm:p-12"
              >
                {/* Floating ambient glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px]" />
                  <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-emerald-500/5 blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between relative z-10">
                  
                  {/* Close Meditation Header */}
                  <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Word Meditation</h3>
                        <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">{breathPhase} Mode</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMeditating(false)}
                      className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-xs font-bold transition"
                    >
                      Exit Meditation
                    </button>
                  </div>

                  {/* Meditation Center: Dynamic breathing ring & current Scripture */}
                  <div className="my-auto space-y-12 py-8 flex flex-col items-center">
                    
                    {/* Breathing circle indicator */}
                    <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                      {/* Interactive ring animating based on breathPhase */}
                      <motion.div
                        animate={{
                          scale: breathPhase === 'Inhale' ? [1, 1.45] : breathPhase === 'Hold' ? 1.45 : [1.45, 1],
                        }}
                        transition={{
                          duration: 4,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full border-2 border-indigo-400/30 bg-indigo-500/10"
                      />
                      <motion.div
                        animate={{
                          scale: breathPhase === 'Inhale' ? [1, 1.25] : breathPhase === 'Hold' ? 1.25 : [1.25, 1],
                          opacity: breathPhase === 'Hold' ? 0.8 : 0.4
                        }}
                        transition={{
                          duration: 4,
                          ease: "easeInOut"
                        }}
                        className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500/40"
                      />
                      <span className="relative text-xs font-black tracking-widest uppercase text-white animate-pulse">
                        {breathPhase}
                      </span>
                    </div>

                    {/* Big serene display of current verse */}
                    <blockquote className="text-2xl sm:text-4xl text-center max-w-3xl leading-relaxed sm:leading-loose font-serif italic text-slate-100 selection:bg-indigo-500/20">
                      “{currentScripture.text}”
                    </blockquote>

                    <cite className="not-italic text-sm sm:text-base font-bold text-slate-400 block tracking-wider">
                      — {currentScripture.reference}
                    </cite>
                  </div>

                  {/* Meditation Footer controls */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-6 text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Breathing rate: 4s-4s-4s</span>
                    <div className="flex gap-4">
                      <button 
                        onClick={handlePrev}
                        className="text-xs hover:text-white transition font-semibold"
                      >
                        Prev Verse
                      </button>
                      <button 
                        onClick={handleNext}
                        className="text-xs hover:text-white transition font-semibold"
                      >
                        Next Verse
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Rotation Loop Controller Toolbar */}
        <AnimatePresence>
          {!isMeditating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/10 pt-6 text-xs opacity-80"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold border border-slate-200/10 ${
                    isPlaying 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> Auto-Cycle Active
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Auto-Cycle Paused
                    </>
                  )}
                </button>

                {isPlaying && (
                  <div className="flex items-center gap-2">
                    <span className="opacity-70">Interval:</span>
                    <select
                      value={rotationInterval}
                      onChange={(e) => setRotationInterval(Number(e.target.value))}
                      className="bg-slate-900/10 dark:bg-white/5 border border-slate-200/10 rounded-lg p-1 text-[11px] font-bold focus:outline-none"
                    >
                      <option value={5}>5s</option>
                      <option value={10}>10s</option>
                      <option value={15}>15s</option>
                      <option value={20}>20s</option>
                      <option value={30}>30s</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Inspired theology oversight by New Nature in Christ Ministry (NNCM)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
