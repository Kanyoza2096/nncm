import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  X, 
  UserCheck,
  Bell,
  RefreshCw,
  Check,
  Eye
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { churchService } from '../../services/churchService';
import { ChurchEvent } from '../../types';
import { toast } from 'sonner';
import { notificationService } from '../../services/notificationService';

export default function EventsCalendar() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Events Calendar',
    description: 'Upcoming events, conferences, crusades, and church activities at New Nature in Christ Ministry.',
    keywords: 'church events, activities, conferences, calendar, NNCM'
  });

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Registration Form 
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);

  // Reminders / Sync States
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const list = await churchService.events.getAll();
        setEvents(list);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();

    // Check link status
    setNotifPermission(notificationService.getPermissionState());
  }, []);

  const handleRegisterClick = (e: ChurchEvent) => {
    setSelectedEvent(e);
    setRegName('');
    setRegEmail('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      toast.error('Details required!');
      return;
    }

    setSubmittingReg(true);
    setTimeout(async () => {
      try {
        if (selectedEvent) {
          await churchService.events.register(selectedEvent.id);
          setEvents(prev => prev.map(item => item.id === selectedEvent.id ? { ...item, registeredCount: item.registeredCount + 1 } : item));
          toast.success(`Registered successfully for ${selectedEvent.title}!`);
          setSelectedEvent(null);
        }
      } catch (err) {
         toast.error('System timeout');
      } finally {
        setSubmittingReg(false);
      }
    }, 1500);
  };



  const handleEnablePush = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      toast.success('Browser alerts activated!');
      notificationService.sendNotification(
        'Welcome to NNCM! 🎉',
        'You are now registered to receive Sunday Service and Bible Study push reminders.',
        'announcement'
      );
    } else {
      toast.warning('Permission was not granted.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Church Gatherings</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Conferences & Crusades</h1>
          <p className="text-slate-400 font-light text-sm">Join us in {settings.orgAddress || 'Zomba'} for weekly study blocks and seasonal assemblies.</p>
        </div>

        {/* Weekly Recurring Reminders & Integrations Section */}
        <div className="mb-14 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl border border-indigo-500/10">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Weekly Sanctuary Reminders
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold mt-3 tracking-tight">
                Never Miss Sunday Service or Bible Study
              </h2>
              <p className="text-indigo-200/80 font-light text-xs md:text-sm mt-3 leading-relaxed">
                Stay connected to the body of Christ with automatic recurring reminders. Get notified every **Sunday at 6:00 AM (CAT)** for Sunday Service, and every **Wednesday at 2:00 PM (CAT)** for Bible Study!
              </p>
              
              {/* Service tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span><strong>Sunday Service:</strong> Sundays 6:00 AM</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span><strong>Bible Study:</strong> Wednesdays 2:00 PM</span>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-auto shrink-0 flex flex-col gap-3 min-w-[280px]">
              {/* Push Notification Action */}
              {notifPermission === 'granted' ? (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Live Browser Alerts Active
                </div>
              ) : (
                <button
                  onClick={handleEnablePush}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs py-3.5 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Bell className="w-4 h-4 text-indigo-300" /> Activate Live Push Reminders
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Special/Periodic Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white border border-slate-100 rounded-3xl border-dashed">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 font-medium">No public events finalized at this time.</p>
            </div>
          ) : (
            events.map((e, index) => (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} key={e.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col sm:flex-row h-full shadow-sm">
                <div className="sm:w-2/5 h-64 sm:h-auto shrink-0 relative bg-slate-950 border-r border-slate-100 overflow-hidden group/event">
                  {/* Blurred background copy to fill space without showing solid blanks */}
                  <div className="absolute inset-0 select-none pointer-events-none">
                    <img 
                      src={e.image} 
                      alt="" 
                      className="w-full h-full object-cover blur-lg scale-110 opacity-40" 
                    />
                  </div>
                  {/* Fully visible container image */}
                  <img 
                    src={e.image} 
                    alt={e.title} 
                    className="w-full h-full object-contain relative z-10 opacity-95 group-hover/event:scale-102 transition-transform duration-500" 
                  />
                  
                  <span className="absolute top-4 left-4 bg-indigo-600 text-white text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full z-20">{e.category}</span>

                  {/* View full flyer button */}
                  <button 
                    type="button"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setLightboxImage(e.image);
                    }}
                    className="absolute top-4 right-4 bg-slate-950/85 hover:bg-indigo-600 border border-white/20 text-white p-1.5 rounded-full transition-colors z-20 flex items-center justify-center shadow-lg"
                    title="View Full Flyer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[#020617] text-lg leading-tight">{e.title}</h3>
                    <p className="mt-3 text-slate-500 text-xs font-light leading-relaxed line-clamp-3">{e.description}</p>
                    <div className="mt-6 space-y-2.5 text-[11px] font-bold">
                      <div className="flex items-center gap-2 text-slate-800"><Calendar className="w-4 h-4 text-indigo-600" /> {e.date} &bull; {e.time}</div>
                      <div className="flex items-center gap-2 text-slate-400"><MapPin className="w-4 h-4" /> {e.location}</div>
                    </div>
                  </div>
                  <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-indigo-600 font-extrabold flex items-center gap-1.5"><Users className="w-4 h-4" /> {e.registeredCount} joining</span>
                    {e.registrationOpen && (
                      <button onClick={() => handleRegisterClick(e)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow shadow-indigo-650/20">Register Seat</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>
          {selectedEvent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm p-4 flex items-center justify-center">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white max-w-sm w-full rounded-3xl p-8 border border-slate-100 shadow-2xl">
                <h3 className="font-extrabold text-slate-900 text-xl mb-2">Reserve Attendance</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-light">"{selectedEvent.title}" at DMC Campus Main Sanctuary.</p>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium" />
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium" />
                  <div className="pt-4 flex gap-2">
                     <button type="button" onClick={() => setSelectedEvent(null)} className="flex-1 p-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-[11px] uppercase">Cancel</button>
                     <button type="submit" disabled={submittingReg} className="flex-1 p-3 bg-indigo-600 text-white font-extrabold rounded-xl text-[11px] uppercase flex justify-center items-center gap-1 shadow-lg disabled:opacity-50">
                       {submittingReg ? 'Wait...' : <><UserCheck className="w-4 h-4" /> Confirm</>}
                     </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
