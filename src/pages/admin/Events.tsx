import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Clock, 
  Users, 
  X, 
  Sparkles,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { churchService } from '../../services/churchService';
import { ChurchEvent } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import NativeFileUpload from '../../components/NativeFileUpload';
import { getImageUrl } from '../../lib/image-utils';

export default function AdminEvents() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);

  // Deletion confirmation states
  const [deleteConfirmEvt, setDeleteConfirmEvt] = useState<ChurchEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Conference',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 AM - 04:00 PM',
    location: 'NNCM Main Auditorium, Zomba',
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await churchService.events.getAll();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to sync events registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      category: 'Conference',
      date: new Date().toISOString().split('T')[0],
      time: '08:30 AM - 04:00 PM',
      location: 'NNCM Main Auditorium, Zomba',
      registrationOpen: true,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: ChurchEvent) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      registrationOpen: evt.registrationOpen,
      image: evt.image,
    });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmEvt) return;
    setIsDeleting(true);
    try {
      await churchService.events.delete(deleteConfirmEvt.id);
      toast.success(`Removed event: "${deleteConfirmEvt.title}"`);
      setDeleteConfirmEvt(null);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to remove event catalog.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    try {
      if (editingEvent) {
        await churchService.events.update(editingEvent.id, formData);
        toast.success('Event configurations adjusted.');
      } else {
        await churchService.events.create(formData);
        toast.success('New event broadcast successfully scheduled.');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error('Error saving event setup.');
    }
  };

  const filtered = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.location.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Church Events Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure conferences, crusades, bible study blocks, and fellowship programs.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
        >
          <Plus className="w-4 h-4" /> Schedule New Event
        </button>
      </div>

      {/* Events Metrics Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Calendar className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Events</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{events.length} Gatherings</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pre-registrations</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {events.reduce((acc, e) => acc + (e.registeredCount || 0), 0)} Confirmed
            </h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center border-t-4 border-t-indigo-600">
            <div className="flex items-center gap-3 mb-1">
               <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 dev-sparkles" /> Portal Broadcast</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Instantly routes to public view and enables seat reservations.</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40 dark:bg-slate-800/30">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, location, or tag..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-black uppercase tracking-wider placeholder:normal-case placeholder:font-normal"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-150 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gathering Title</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Host Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">DateTime</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reservations</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting schedule registry...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No scheduled assemblies matched your filter.</td></tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0">
                             <img src={getImageUrl(e.image)} alt="" className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">{e.title}</p>
                             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-widest">{e.category}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1 text-xs font-bold text-slate-650 dark:text-slate-300">
                         <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                         <span className="truncate max-w-[150px]">{e.location}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400 space-y-0.5">
                       <div className="font-bold text-slate-700 dark:text-slate-300">{e.date}</div>
                       <div className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {e.time}</div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-400 font-mono font-bold">{e.registeredCount} seats</span>
                         {e.registrationOpen ? (
                           <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider">Open</span>
                         ) : (
                           <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider">Closed</span>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(e)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-200 rounded-lg transition-colors border border-slate-100 dark:border-slate-700"
                            title="Edit"
                          >
                             <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmEvt(e)}
                            className="p-1.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 hover:text-red-700 text-red-650 rounded-lg transition-colors border border-red-100/30"
                            title="Remove"
                          >
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[#020617] dark:text-white text-lg">
                    {editingEvent ? 'Edit Gathering Program' : 'Schedule New Public Assembly'}
                  </h3>
                  <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">Calendar Broadcast Node</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Event / Assembly Title</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                      placeholder="e.g. Zomba Fire Conference"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Category Theme</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white"
                    >
                      <option value="Conference">Conference</option>
                      <option value="Crusade">Crusade</option>
                      <option value="Prayer Meeting">Prayer Meeting</option>
                      <option value="Bible Study">Bible Study</option>
                      <option value="Sunday Service">Sunday Service</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Starting-Ending Hours</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.time} 
                      onChange={e => setFormData({...formData, time: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                      placeholder="e.g. 08:30 AM - 04:00 PM"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Specific Venue Location</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                    placeholder="e.g. NNCM Main Auditorium, Zomba"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Detailed Description & Registration Call</label>
                  <textarea 
                    rows={4} 
                    required 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                    placeholder="Provide full description of the event speaker keys, topics covered, and directions..."
                  />
                </div>

                <div className="flex items-center gap-3">
                   <input 
                      type="checkbox" 
                      id="registrationOpen"
                      checked={formData.registrationOpen} 
                      onChange={e => setFormData({...formData, registrationOpen: e.target.checked})} 
                      className="w-4 h-4 text-indigo-600 border-slate-100 rounded focus:ring-indigo-500 bg-slate-100" 
                   />
                   <label htmlFor="registrationOpen" className="text-xs font-black uppercase text-slate-650 dark:text-slate-350 cursor-pointer select-none">Enable Public Seat Reservations / Registration</label>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl space-y-3">
                   <div className="flex justify-between items-center">
                      <div>
                         <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-none">Graphic Flyer / Poster</h5>
                         <p className="text-[10px] text-slate-400 font-bold mt-1">High fidelity poster displayed on public card.</p>
                      </div>
                      <NativeFileUpload 
                        buttonText="Upload Flyer" 
                        acceptTypes="image/*" 
                        folder="events" 
                        onUpload={(url) => setFormData({...formData, image: url})}
                      />
                   </div>
                   {formData.image && (
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                         <ImageIcon className="w-3.5 h-3.5" /> 
                         <span className="truncate max-w-sm">{formData.image}</span>
                         <button type="button" onClick={() => setFormData({...formData, image: ''})} className="text-red-600 font-bold hover:underline">Clear</button>
                      </div>
                   )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold rounded-2xl text-[11px] uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-slate-950 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all outline-none"
                  >
                    <Save className="w-4 h-4" /> Save Event Program
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Events Deletion */}
      <AnimatePresence>
        {deleteConfirmEvt && (
          <div className="fixed inset-0 z-50 bg-[#020617]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /> Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-2.5 leading-relaxed">
                Are you sure you want to delete <span className="font-extrabold text-slate-800 dark:text-slate-200">"{deleteConfirmEvt.title}"</span>? This will permanently remove the record from the public event stream.
              </p>

              {deleteConfirmEvt.image && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100">
                  <img src={getImageUrl(deleteConfirmEvt.image)} alt={deleteConfirmEvt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmEvt(null)}
                  disabled={isDeleting}
                  className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
