import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  Filter, 
  CheckCircle2, 
  XCircle,
  Clock,
  MoreVertical,
  Activity,
  Heart,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { testimonialService } from '../../services/testimonials';
import { Testimonial } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Congregation Member',
    organization: 'Zomba Assembly',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await testimonialService.getTestimonials();
      setItems(data);
    } catch (err) {
      toast.error('Testimony archives unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error('Lover name and Testimony content are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await testimonialService.createTestimonial({
        name: formData.name,
        role: formData.role,
        organization: formData.organization,
        content: formData.content,
        photoURL: '',
        rating: 5,
        approved: true,
        date: Date.now()
      });
      toast.success('Spiritual proof recorded and approved into archives!');
      setShowForm(false);
      setFormData({
        name: '',
        role: 'Congregation Member',
        organization: 'Zomba Assembly',
        content: ''
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to log spiritual proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this spiritual proof entry?')) return;
    try {
      await testimonialService.deleteTestimonial(id);
      toast.success('Spiritual proof entry deleted from archives.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete testimony.');
    }
  };

  const filtered = items.filter(i => {
    const authorName = i.name || (i as any).author || '';
    return authorName.toLowerCase().includes(search.toLowerCase()) || 
           i.content.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Public Testimonies</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verifiable spiritual proof of kingdom impact and miracles.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
        >
          <Plus className="w-4 h-4" /> Log Spiritual Proof
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><Activity className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Index</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{items.length} Proofs</h4>
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
              placeholder="Search testimony archives by name or content..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white font-medium"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
             <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-mono">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kingdom Proof (Content)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sanctified Author</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entry Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Mgmt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Validating spiritual proofs...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No transformation records discovered in current partition.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5 max-w-xs">
                       <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2 italic leading-relaxed">"{item.content}"</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
                          <div>
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight block leading-none">{item.name || (item as any).author}</span>
                            <span className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400 block mt-1 uppercase tracking-widest">{item.role || 'Member'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="inline-flex items-center px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Verified High
                       </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-400 font-mono italic">
                       {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDeleteTestimonial(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowForm(false)} 
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600 animate-pulse" /> Log Spiritual Proof
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-1">Record verified visual healings, breakthough testimonies, and divine impact reports.</p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Author Identity *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sister Grace Banda" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Author Role / Office</label>
                    <input 
                      type="text" 
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Youth Leader / Member" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Assembly / Group</label>
                    <input 
                      type="text" 
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Zomba Board / Youth group" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Spiritual Proof details *</label>
                  <textarea 
                    rows={5}
                    required
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write details of the breakthrough, healings or spiritual reports..." 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest rounded-xl outline-none active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Logging...
                      </>
                    ) : (
                      'Log Breakthrough'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
