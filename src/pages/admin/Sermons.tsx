import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Play, 
  Download, 
  Calendar,
  X, 
  Music, 
  FileText, 
  FileArchive,
  BookMarked,
  Sparkles,
  Save,
  Trash,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { churchService } from '../../services/churchService';
import { Sermon } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import NativeFileUpload from '../../components/NativeFileUpload';
import { getImageUrl } from '../../lib/image-utils';

export default function AdminSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);

  // Deletion confirmation states
  const [deleteConfirmSermon, setDeleteConfirmSermon] = useState<Sermon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    pastor: '',
    category: 'Sunday Service',
    date: new Date().toISOString().split('T')[0],
    videoUrl: '',
    audioUrl: '',
    notes: '',
    excerpt: '',
    coverImage: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
  });

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const data = await churchService.sermons.getAll();
      setSermons(data);
    } catch (err) {
      toast.error('Failed to synchronize sermon library cache.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSermon(null);
    setFormData({
      title: '',
      pastor: 'Pastor Richie Mkandawire',
      category: 'Sunday Service',
      date: new Date().toISOString().split('T')[0],
      videoUrl: '',
      audioUrl: '',
      notes: '',
      excerpt: '',
      coverImage: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title,
      pastor: sermon.pastor,
      category: sermon.category,
      date: sermon.date,
      videoUrl: sermon.videoUrl || '',
      audioUrl: sermon.audioUrl || '',
      notes: sermon.notes || '',
      excerpt: sermon.excerpt,
      coverImage: sermon.coverImage,
    });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmSermon) return;
    setIsDeleting(true);
    try {
      await churchService.sermons.delete(deleteConfirmSermon.id);
      toast.success(`Removed sermon: "${deleteConfirmSermon.title}"`);
      setDeleteConfirmSermon(null);
      fetchSermons();
    } catch (err) {
      toast.error('Failed to remove sermon outline.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim()) {
      toast.error('Title and short excerpt are required.');
      return;
    }

    try {
      if (editingSermon) {
        await churchService.sermons.update(editingSermon.id, formData);
        toast.success('Sermon outline edited successfully.');
      } else {
        await churchService.sermons.create(formData);
        toast.success('New sermon entry published successfully.');
      }
      setIsModalOpen(false);
      fetchSermons();
    } catch (err) {
      toast.error('Failure saving sermon configuration.');
    }
  };

  const filtered = sermons.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.pastor.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Public Sermons Library</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload and coordinate theological outlines, audio/video streams, and study booklets.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
        >
          <Plus className="w-4 h-4" /> Add Sermon / Outline
        </button>
      </div>

      {/* Sermons Library Metrics KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><BookMarked className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Digital Sermons</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{sermons.length} Lessons</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Download className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Outline Downloads</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {sermons.reduce((acc, s) => acc + (s.downloadsCount || 0), 0)} Requests
            </h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center border-t-4 border-t-indigo-600">
            <div className="flex items-center gap-3 mb-1">
               <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Global Availability</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">Synchronized in real-time on public mobile & Web interfaces.</p>
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
              placeholder="Search by topic, preacher, or category..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-black uppercase tracking-wider placeholder:normal-case placeholder:font-normal"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-150 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sermon Title & Topic</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sanctuary Preacher</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Publishing Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Downloads</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting sermons archive...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No matching sermons discovered in catalog.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0">
                             <img src={getImageUrl(s.coverImage)} alt="" className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">{s.title}</p>
                             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-widest">{s.category}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-bold text-slate-650 dark:text-slate-300">{s.pastor}</p>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">
                       {s.date}
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-bold">
                          <Download className="w-4 h-4 text-slate-300" /> {s.downloadsCount} dl
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-200 rounded-lg transition-colors border border-slate-100 dark:border-slate-700"
                            title="Edit"
                          >
                             <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmSermon(s)}
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

      {/* Editor Modal */}
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
                    {editingSermon ? 'Configure Archive Outline' : 'Publish New Sermon Content'}
                  </h3>
                  <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">Sermons Library Node</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Sermon Title</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                      placeholder="e.g. Walking in New Nature"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Pastoral Preacher</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.pastor} 
                      onChange={e => setFormData({...formData, pastor: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                      placeholder="Preacher Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Weekly Category Tag</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white"
                    >
                      <option value="Sunday Service">Sunday Service</option>
                      <option value="Midweek Service">Midweek Service</option>
                      <option value="Conference">Conference</option>
                      <option value="Youth">Youth Assembly</option>
                      <option value="Crusade">Crusade / Revival</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Assembly preaching Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Summary / Excerpt (For Cards)</label>
                  <textarea 
                    rows={2} 
                    required 
                    value={formData.excerpt} 
                    onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-med focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                    placeholder="Short meta hook described on public catalog..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Sermon Outlines & Hebrew Exegesis Notes</label>
                  <textarea 
                    rows={4} 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                    placeholder="Provide full systematic verse highlights, Greek/Hebrew references, and questions..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">YouTube Embed ID (or full link)</label>
                    <input 
                      type="text" 
                      value={formData.videoUrl} 
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                      placeholder="e.g. https://www.youtube.com/embed/dQw4w9..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Audio Recording URL (.mp3)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.audioUrl} 
                        onChange={e => setFormData({...formData, audioUrl: e.target.value})} 
                        className="flex-1 px-4 py-3 bg-slate-55/40 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                        placeholder="Path to audio file..."
                      />
                      <NativeFileUpload 
                         buttonText="Upload Audio" 
                         acceptTypes="audio/*, .mp3, .wav, .m4a, .aac, .ogg, .webm, .flac, .mp4, .3gp" 
                         folder="audio_sermons" 
                         onUpload={(url) => setFormData({...formData, audioUrl: url})}
                      />
                    </div>
                    {formData.audioUrl && (
                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between p-2 pl-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850">
                         <div className="flex items-center gap-1.5 truncate">
                            <Music className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[170px]" title={formData.audioUrl}>{formData.audioUrl}</span>
                         </div>
                         <button 
                            type="button" 
                            onClick={() => {
                              setFormData({...formData, audioUrl: ''});
                              toast.info('Associated audio file reference cleared. Remember to click Save.');
                            }} 
                            className="text-xs text-red-650 hover:text-red-700 font-black uppercase tracking-wider pl-3 pr-2 py-1 leading-none hover:underline"
                            title="Deletes audio file association"
                         >
                            Delete Audio
                         </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl space-y-3">
                   <div className="flex justify-between items-center">
                      <div>
                         <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-none">Lesson Cover Graphic</h5>
                         <p className="text-[10px] text-slate-400 font-bold mt-1">Uploaded graphic visual displayed on catalog card.</p>
                      </div>
                      <NativeFileUpload 
                        buttonText="Add Graphic" 
                        acceptTypes="image/*" 
                        folder="sermons" 
                        onUpload={(url) => setFormData({...formData, coverImage: url})}
                      />
                   </div>
                   {formData.coverImage && (
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                         <FileText className="w-3.5 h-3.5" /> 
                         <span className="truncate max-w-sm">{formData.coverImage}</span>
                         <button type="button" onClick={() => setFormData({...formData, coverImage: ''})} className="text-red-600 font-bold hover:underline">Clear</button>
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
                    <Save className="w-4 h-4" /> Save Authority Config
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal for Sermons Deletion */}
      <AnimatePresence>
        {deleteConfirmSermon && (
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
                Are you sure you want to delete sermon <span className="font-extrabold text-slate-800 dark:text-slate-200">"{deleteConfirmSermon.title}"</span>? This will permanently remove the record from the public stream.
              </p>

              {deleteConfirmSermon.coverImage && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100">
                  <img src={getImageUrl(deleteConfirmSermon.coverImage)} alt={deleteConfirmSermon.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmSermon(null)}
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
