import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Database, 
  MessageSquare, 
  Cpu, 
  ShieldCheck, 
  Mic, 
  History,
  Zap,
  Loader2,
  Lock,
  ChevronRight,
  BrainCircuit,
  PieChart,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { useOrgSettings } from '../../hooks/useOrgSettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { settings } = useOrgSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings Agent ${user?.name || ''}. I am the Ministry Intelligence Core. How can I assist with your administrative stewardship and data analysis today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || processing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setProcessing(true);

    // Mocking Gemini Interaction for the preview
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed the current sanctuary records for "${input}". My deep synthesis indicates a 14% growth in Tithe consistency this quarter across the DMC Zomba campus. Would you like a detailed fiscal projection based on this trend?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-8 font-sans overflow-hidden animate-fadeIn">
      
      {/* Sidebar Capability Panel */}
      <div className="lg:w-1/4 hidden lg:flex flex-col gap-6">
         <div className="bg-[#0b1120] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-3xl" />
            <div className="relative z-10">
               <BrainCircuit className="w-10 h-10 text-indigo-400 mb-6" />
               <h3 className="text-lg font-black tracking-tight mb-2">Intelligence Core</h3>
               <p className="text-xs text-slate-400 leading-relaxed font-light mb-6 font-serif italic">Leveraging Gemini Pro to synthesize pastoral insights and church growth telemetry.</p>
               <div className="w-full h-px bg-white/10 mb-6" />
               <div className="space-y-4">
                  {[
                    { icon: PieChart, label: 'Fiscal Forecasting' },
                    { icon: Target, label: 'Outreach Optimization' },
                    { icon: ShieldCheck, label: 'Audit Compliance' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                       <s.icon className="w-3.5 h-3.5 text-indigo-500" /> {s.label}
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between flex-1">
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Analytical Memory</h4>
               <div className="space-y-4">
                  {[
                    'June Fiscal Synthesis',
                    'Youth Enlistment Target',
                    'Sanctuary Build Delta'
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-indigo-100">
                       <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{m}</span>
                       <ChevronRight className="w-3 h-3 text-slate-300" />
                    </div>
                  ))}
               </div>
            </div>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter text-slate-400">
               <History className="w-3.5 h-3.5" /> Retention Cycle: 30 Days
            </div>
         </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-xl overflow-hidden relative">
         <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 animate-pulse-slow">
                  <Sparkles className="w-5 h-5 fill-white" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white tracking-tight">Ministry AI Assistant</h3>
                  <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Synergy
                  </span>
               </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
               <Database className="w-3.5 h-3.5 text-slate-400" />
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">{settings.orgName} KB V2.1</span>
            </div>
         </div>

         <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scroll-smooth no-scrollbar">
            {messages.map((m) => (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                key={m.id} 
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                 <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                   m.role === 'assistant' 
                     ? 'bg-indigo-600 text-white border-indigo-500' 
                     : 'bg-white text-slate-400 border-slate-100'
                 }`}>
                    {m.role === 'assistant' ? <Sparkles className="w-4 h-4 fill-white" /> : <ShieldCheck className="w-4 h-4" />}
                 </div>
                 <div className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ring-1 ring-black/5 ${
                    m.role === 'assistant' 
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-light' 
                      : 'bg-[#020617] text-white font-bold'
                 }`}>
                    {m.content}
                    <div className="text-[8px] font-black opacity-30 mt-3 uppercase tracking-widest">
                       {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                 </div>
              </motion.div>
            ))}
            {processing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                 <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                       <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Synthesis In Progress</span>
                 </div>
              </motion.div>
            )}
         </div>

         <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative group">
               <input 
                 disabled={processing}
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="Search insights, fiscal data, or request sanctuary reports..."
                 className="w-full pl-6 pr-32 py-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-sm font-bold shadow-xl shadow-slate-100 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all dark:text-white"
               />
               <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button type="button" className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><Mic className="w-5 h-5" /></button>
                  <button 
                    disabled={!input.trim() || processing}
                    type="submit" 
                    className="p-3 bg-indigo-600 hover:bg-slate-950 disabled:opacity-30 disabled:scale-95 text-white rounded-full transition-all shadow-xl shadow-indigo-600/20 active:scale-90"
                  >
                     <Send className="w-5 h-5" />
                  </button>
               </div>
            </form>
            <div className="mt-4 flex items-center justify-center gap-4">
               <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> End-to-End Encrypted Knowledge Stream
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
