import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Tag,
  ImageIcon,
  MoreVertical
} from 'lucide-react';
import { blogService } from '../../services/blog';
import { BlogPost } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getImageUrl } from '../../lib/image-utils';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await blogService.getBlogPosts();
      setPosts(data);
    } catch (err) {
      toast.error('Blog index cache sync failure.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.author.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Ministry Announcements (Blog)</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Spiritual feeding and official news broadcast for the global assembly.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Create New Article
        </button>
      </div>

      {/* Blog Analytics KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><FileText className="w-4 h-4" /></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Articles</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{posts.length} Pieces</h4>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center border-t-4 border-t-indigo-600">
            <div className="flex items-center gap-3 mb-1">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Feed Distribution</span>
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Just Now</h4>
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
              placeholder="Search by title, author, or keywords..."
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
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Broadcast Article</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Author</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engagement Target</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Post Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Feeding global blog cluster...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No spiritual feed records discovered.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0">
                             <img src={getImageUrl(p.coverImage)} alt="" className="w-full h-full object-cover opacity-60" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">{p.title}</p>
                             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-widest flex items-center gap-1.5"><Tag className="w-3 h-3" /> {p.category}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.author.name}</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono italic">
                          <Eye className="w-4 h-4" /> 5.2k Reads
                       </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400">
                       {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
