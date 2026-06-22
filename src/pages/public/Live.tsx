import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Send, 
  Users, 
  Video,
  Clock, 
  Share2, 
  Heart,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  name: string;
  message: string;
  role: string;
  time: string;
  avatarLetter: string;
  isStaff?: boolean;
}

const PRESET_MESSAGES = [
  "Glory to Jesus Christ! Old things are indeed passed away!",
  "Greeting from Zomba, Malawi! Standing in agreement with Pastor Richie.",
  "Amen! Walking in my new creation identity!!",
  "Wow! The NNCM Voices are ushering in glory today!",
  "Greetings to Pastor Richie. Loving this stream.",
  "Lord, heal my family! Laying down her petition this morning."
];

export default function Live() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Live Service',
    description: 'Join our live online service and worship with New Nature in Christ Ministry from anywhere in the world.',
    keywords: 'live church service, online church, live worship, stream, NNCM live'
  });

  const { profile } = useAuth();
  
  const [isLive] = useState(true);
  const [viewersCount, setViewersCount] = useState(145);
  const [chat, setChat] = useState<ChatMessage[]>([
    { id: '1', name: 'Deaconess Joyce Phiri', message: 'Welcome saints! Prepare your offering and elements.', role: 'Moderator', time: '09:58 AM', avatarLetter: 'J', isStaff: true },
    { id: '2', name: 'Sister Sarah Banda', message: 'Halleluya! Tuning in with my children from Lumbadzi.', role: 'Member', time: '09:59 AM', avatarLetter: 'S' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    const updateStats = setInterval(() => {
      setViewersCount(prev => prev + Math.floor(Math.random() * 5) - 2);
      if (Math.random() > 0.8) {
        const randomMsgIndex = Math.floor(Math.random() * PRESET_MESSAGES.length);
        const nameData = { name: 'Brother Christopher', initial: 'C' };
        
        setChat(prev => [...prev.slice(-30), {
          id: String(Date.now()),
          name: nameData.name,
          message: PRESET_MESSAGES[randomMsgIndex],
          role: 'Member',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatarLetter: nameData.initial
        }]);
      }
    }, 8000);

    return () => clearInterval(updateStats);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setChat(prev => [...prev, {
      id: 'usr_' + Date.now(),
      name: profile?.name || 'Visitor',
      message: inputMessage.trim(),
      role: 'Participant',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarLetter: (profile?.name || 'V').charAt(0).toUpperCase()
    }]);
    setInputMessage('');
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <span className="text-xs font-bold text-rose-550 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Sanctuary Live Stream</span>
              <span className="text-xs text-slate-400 font-mono font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-500" /> {viewersCount} active saints
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#020617] tracking-tight">Divine Ignition Service</h1>
            <p className="text-xs text-slate-450 font-light mt-0.5">Preaching: {settings.directorName || 'Pastor Richie Mkandawire'}</p>
          </div>

          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all border border-indigo-100">
            <Share2 className="w-4 h-4" /> Share Stream
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-900/10">
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" 
                title="live-stream"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>

            <div className="bg-white border border-slate-105 rounded-3xl p-8 shadow-sm">
              <h3 className="font-extrabold text-[#020617] text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Active Service Focus
              </h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                Theme: <b>Walking in Zoe Life</b>. Sunday Celebration Service commencing live from DMC Campus, Zomba. Praise Team led by nature voices.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-105 rounded-3xl shadow-xl flex flex-col h-[70vh] lg:h-auto overflow-hidden">
            <div className="p-4 bg-slate-950 text-white border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-[10px] tracking-widest uppercase">Live Chat</h3>
              </div>
              <span className="text-[10px] uppercase font-bold opacity-60">Verified saints</span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50 custom-scrollbar">
              <AnimatePresence initial={false}>
                {chat.map((msg) => (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-white ${msg.isStaff ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                      {msg.avatarLetter}
                    </div>
                    <div className="flex-1 min-w-0 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                      <p className="text-[10px] font-black text-slate-900 mb-1">{msg.name}</p>
                      <p className="text-xs text-slate-600 font-light leading-snug">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Stand in agreement... chat now..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-600 outline-none transition-all font-medium"
                />
                <button type="submit" className="p-2.5 bg-indigo-600 text-white rounded-xl active:scale-95 shadow-md">
                   <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
