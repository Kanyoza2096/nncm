import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, HeartHandshake, TrendingUp, Sparkles } from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { projectService } from '../../services/projects';
import { Project } from '../../types';
import { getImageUrl } from '../../lib/image-utils';

export default function Projects() {
  useDocumentMeta({
    title: 'Church Projects',
    description: 'Explore the ongoing sanctuary building projects and community outreaches of New Nature in Christ Ministry.',
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Kingdom Advancement</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">Our Core Projects</h1>
          <p className="text-slate-500 font-light text-sm">Strategic sanctuary builds and community welfare outreaches across Malawi.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, idx) => {
              const budget = typeof p.budget === 'string' ? parseFloat(p.budget) : p.budget;
              const raised = typeof p.raised === 'string' ? parseFloat(p.raised) : (p.raised || 0);
              const progress = Math.min(100, Math.round((raised / budget) * 100));
              return (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.1 }} key={p.id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group p-4">
                  <div className="h-48 bg-slate-100 rounded-2xl relative overflow-hidden mb-6">
                    <img src={getImageUrl(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                        <span className="bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                    </div>
                  </div>
                  
                  <div className="px-2 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mt-1.5 mb-4 uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {p.location}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                          <span className="text-xs font-black text-indigo-600">{progress}%</span>
                       </div>
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} className="h-full bg-indigo-600" />
                       </div>
                       <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Total Goal</span>
                          <span className="text-slate-900">MWK {budget.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="mt-8">
                       <Link to={`/projects/${p.id}`} className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                          View Scope <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
