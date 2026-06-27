import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Building,
  Heart
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { projectService } from '../../services/projects';
import { Project } from '../../types';
import { getImageUrl } from '../../lib/image-utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       projectService.getProjectById(id).then(data => {
         setProject(data);
         setLoading(false);
       });
    }
  }, [id]);

  useDocumentMeta({
    title: project?.title || 'Project Detail',
    description: project?.description || 'View details of our mission project.',
    ogTitle: project ? `${project.title} - New Nature In Christ Ministry` : undefined,
    ogDescription: project?.description || 'View details of our mission project.',
    ogImage: (project?.images && project.images[0]) ? getImageUrl(project.images[0]) : undefined,
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Saints, Please wait...</div>;
  if (!project) return <div className="p-20 text-center">Project index error. <Link to="/projects" className="text-indigo-600">Return</Link></div>;

  const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : project.budget;
  const raised = typeof project.raised === 'string' ? parseFloat(project.raised) : (project.raised || 0);
  const progress = Math.min(100, Math.round((raised / budget) * 100));

  return (
    <div className="bg-white min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
         <Link to="/projects" className="inline-flex items-center text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-10 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Project Index
         </Link>

         <div className="space-y-12">
            <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl border border-slate-100/50">
               <img src={getImageUrl(project.images && project.images[0])} alt={project.title} className="w-full h-full object-cover" />
               <div className="absolute top-8 left-8">
                  <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">{project.category}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-7 space-y-8">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-4">{project.title}</h1>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                       <MapPin className="w-4 h-4 text-indigo-500" /> {project.location}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                       <Target className="w-4 h-4" /> Strategic Scope
                    </h4>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">{project.description}</p>
                  </div>
               </div>

               <div className="lg:col-span-5">
                  <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm space-y-8 sticky top-24">
                     <div>
                        <div className="flex justify-between items-end mb-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Momentum</span>
                           <span className="text-xl font-black text-slate-950">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        <div>
                           <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">Target Goal</p>
                           <p className="font-black text-slate-950 text-lg tracking-tight">MWK {budget.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">Harvested</p>
                           <p className="font-black text-emerald-600 text-lg tracking-tight">MWK {raised.toLocaleString()}</p>
                        </div>
                     </div>

                     <Link to="/give" className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                        <Heart className="w-4 h-4 fill-white" /> Partner with a Seed
                     </Link>

                     <div className="space-y-4 pt-4">
                        {[
                           { icon: ShieldCheck, text: 'Verifiable Ledger Entry' },
                           { icon: Building, text: 'Real Estate Asset Growth' }
                        ].map((li, i) => (
                           <div key={i} className="flex items-center gap-3 text-slate-450 text-[10px] font-bold uppercase tracking-widest leading-none">
                              <li.icon className="w-4 h-4 text-slate-300" /> {li.text}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
