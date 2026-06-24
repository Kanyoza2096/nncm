import { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  MapPin, 
  TrendingUp, 
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  X,
  Compass,
  Users,
  Mail,
  FolderDot
} from 'lucide-react';
import { projectService } from '../../services/projects';
import { churchService } from '../../services/churchService';
import { Project, MinistryGroup } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/currency-utils';
import { getImageUrl } from '../../lib/image-utils';

export default function AdminProjects() {
  const [activeTab, setActiveTab] = useState<'projects' | 'ministries'>('projects');

  // Project States
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    category: 'Outpost Construction',
    location: 'Zomba',
    budget: '',
    raised: '0',
    targetDays: '180'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ministry States
  const [ministries, setMinistries] = useState<MinistryGroup[]>([]);
  const [ministriesLoading, setMinistriesLoading] = useState(true);
  const [ministrySearch, setMinistrySearch] = useState('');
  const [showMinistryForm, setShowMinistryForm] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<MinistryGroup | null>(null);

  const [ministryFormData, setMinistryFormData] = useState({
    name: '',
    description: '',
    leaders: '',
    featuredImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    contactEmail: ''
  });
  const [isSubmittingMinistry, setIsSubmittingMinistry] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchMinistries();
  }, []);

  // --- Project Operations ---
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      toast.error('Kingdom projects index unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProjectClick = (p: Project) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      name: p.name,
      description: p.description || '',
      category: p.category || 'Outpost Construction',
      location: p.location,
      budget: p.budget.toString(),
      raised: (p.raised || 0).toString(),
      targetDays: '180'
    });
    setShowForm(true);
  };

  const handleAddProjectClick = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      name: '',
      description: '',
      category: 'Outpost Construction',
      location: 'Zomba',
      budget: '',
      raised: '0',
      targetDays: '180'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.name || !formData.budget) {
      toast.error('Title, short name, and budget are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const budgetNum = parseFloat(formData.budget) || 0;
      const raisedNum = parseFloat(formData.raised) || 0;
      const days = parseInt(formData.targetDays) || 120;

      if (editingProject) {
        await projectService.updateProject(editingProject.id, {
          title: formData.title,
          name: formData.name,
          description: formData.description || formData.title,
          category: formData.category,
          location: formData.location,
          budget: budgetNum,
          raised: raisedNum,
        });
        toast.success('Ministry project/outpost details updated successfully!');
      } else {
        await projectService.createProject({
          title: formData.title,
          name: formData.name,
          description: formData.description || formData.title,
          category: formData.category,
          location: formData.location,
          budget: budgetNum,
          raised: raisedNum,
          status: 'active',
          images: [],
          startDate: Date.now(),
          endDate: Date.now() + days * 24 * 3600 * 1000
        } as any);
        toast.success('Ministry build or outpost registered successfully!');
      }

      setShowForm(false);
      fetchProjects();
    } catch (err) {
      toast.error(editingProject ? 'Failed to update project.' : 'Failed to register ministry outpost.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to retire and delete this ministry project/outpost?')) return;
    try {
      await projectService.deleteProject(id);
      toast.success('Ministry project/outpost safely retired.');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project / outpost.');
    }
  };

  // --- Ministry Operations ---
  const fetchMinistries = async () => {
    setMinistriesLoading(true);
    try {
      const data = await churchService.ministries.getAll();
      setMinistries(data);
    } catch (err) {
      toast.error('Failed to load ministry departments.');
    } finally {
      setMinistriesLoading(false);
    }
  };

  const handleAddMinistryClick = () => {
    setEditingMinistry(null);
    setMinistryFormData({
      name: '',
      description: '',
      leaders: '',
      featuredImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      contactEmail: ''
    });
    setShowMinistryForm(true);
  };

  const handleEditMinistryClick = (m: MinistryGroup) => {
    setEditingMinistry(m);
    setMinistryFormData({
      name: m.name,
      description: m.description,
      leaders: m.leaders ? m.leaders.join(', ') : '',
      featuredImage: m.featuredImage,
      contactEmail: m.contactEmail
    });
    setShowMinistryForm(true);
  };

  const handleDeleteMinistry = async (id: string) => {
    if (!window.confirm('Are you sure you want to retire and delete this ministry department?')) return;
    try {
      await churchService.ministries.delete(id);
      toast.success('Ministry department safely decommissioned.');
      fetchMinistries();
    } catch (err) {
      toast.error('Failed to delete ministry department.');
    }
  };

  const handleSubmitMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministryFormData.name || !ministryFormData.description || !ministryFormData.contactEmail) {
      toast.error('Name, description, and contact email are required.');
      return;
    }
    setIsSubmittingMinistry(true);
    try {
      const leadersArray = ministryFormData.leaders
        ? ministryFormData.leaders.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      if (editingMinistry) {
        await churchService.ministries.update(editingMinistry.id, {
          name: ministryFormData.name,
          description: ministryFormData.description,
          leaders: leadersArray,
          featuredImage: ministryFormData.featuredImage,
          contactEmail: ministryFormData.contactEmail
        });
        toast.success('Ministry department details updated successfully!');
      } else {
        await churchService.ministries.create({
          name: ministryFormData.name,
          description: ministryFormData.description,
          leaders: leadersArray,
          featuredImage: ministryFormData.featuredImage,
          contactEmail: ministryFormData.contactEmail
        });
        toast.success('New ministry department registered successfully!');
      }

      setShowMinistryForm(false);
      fetchMinistries();
    } catch (err) {
      toast.error(editingMinistry ? 'Failed to update ministry.' : 'Failed to register ministry.');
    } finally {
      setIsSubmittingMinistry(false);
    }
  };

  // --- Filtering ---
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMinistries = ministries.filter(m => 
    m.name.toLowerCase().includes(ministrySearch.toLowerCase()) ||
    m.description.toLowerCase().includes(ministrySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Upper Tab Bar Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px mb-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Building className="w-4 h-4" /> Outposts & Builds
        </button>
        <button
          onClick={() => setActiveTab('ministries')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'ministries'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Compass className="w-4 h-4" /> Ministry Departments
        </button>
      </div>

      {activeTab === 'projects' ? (
        // ================= OUTPOSTS & PROJECTS VIEW =================
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Ministry Projects & Assets</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Overseeing sanctuary builds and regional outreach outposts.</p>
            </div>
            <button 
              onClick={handleAddProjectClick}
              className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Initiate New Project
            </button>
          </div>

          {/* KPI Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Building className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Assets</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{projects.length} Registered</h4>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Funding Pool</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">65% Seeded</h4>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sm:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Priority Target</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate">DMC Main Sanctuary Alpha</h4>
             </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects by title or outpost location..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center animate-pulse"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Inventorying assets...</p></div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]"><p className="text-slate-400 font-medium italic">No active projects discovered.</p></div>
            ) : (
              filteredProjects.map((p, idx) => {
                const budget = typeof p.budget === 'string' ? parseFloat(p.budget) : p.budget;
                const raised = typeof p.raised === 'string' ? parseFloat(p.raised) : (p.raised || 0);
                const progress = Math.min(100, Math.round((raised / budget) * 100));
                return (
                  <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.1 }} key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex flex-col sm:flex-row group h-full">
                      <div className="sm:w-2/5 h-48 sm:h-auto relative bg-slate-950/20 overflow-hidden shrink-0 border-r border-slate-50 dark:border-slate-800">
                         <img src={getImageUrl(p.images && p.images[0])} alt={p.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>{p.status}</span>
                         </div>
                      </div>
                      <div className="p-7 flex-1 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <h3 className="font-extrabold text-slate-950 dark:text-white text-lg leading-tight group-hover:text-indigo-600 transition-colors break-words flex-1 pr-2">{p.title}</h3>
                               <div className="flex items-center gap-1 shrink-0">
                                 <button onClick={() => handleEditProjectClick(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                                 <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                               <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {p.location}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                               <div className="flex justify-between items-end">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Momentum</span>
                                  <span className="text-sm font-black text-slate-950 dark:text-white">{progress}%</span>
                                </div>
                               <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                               </div>
                               <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-400">Yield: {formatCurrency(raised)}</span>
                                  <span className="text-slate-900 dark:text-indigo-400">OF {formatCurrency(budget)}</span>
                               </div>
                            </div>
                         </div>

                         <div className="mt-8 flex items-center justify-between">
                             <div className="flex items-center gap-1.5 text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest italic">
                                <Clock className="w-3.5 h-3.5" /> Est Comp: Q4 2026
                             </div>
                             <Link to={`/admin/projects/${p.id}`} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer">
                                <ExternalLink className="w-4 h-4" />
                             </Link>
                         </div>
                      </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      ) : (
        // ================= MINISTRY DEPARTMENTS VIEW =================
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Ministry Departments</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Equipping, configuring, and adding new active church departments.</p>
            </div>
            <button 
              onClick={handleAddMinistryClick}
              className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Initiate New Ministry
            </button>
          </div>

          {/* Ministry KPI Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg"><Compass className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Departments</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{ministries.length} Departments</h4>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-lg"><Users className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enlisted Saints</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {ministries.reduce((sum, m) => sum + (m.membersCount || 0), 0)} Registered
                </h4>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg"><FolderDot className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Status</span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate">100% Grace-led</h4>
             </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={ministrySearch}
              onChange={e => setMinistrySearch(e.target.value)}
              placeholder="Search ministry departments by name, keyword or description..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
            />
          </div>

          {/* Ministry List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ministriesLoading ? (
              <div className="col-span-full py-20 text-center animate-pulse"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Loading departments...</p></div>
            ) : filteredMinistries.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]"><p className="text-slate-400 font-medium italic">No ministry departments found.</p></div>
            ) : (
              filteredMinistries.map((m, idx) => {
                return (
                  <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.1 }} key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all flex flex-col sm:flex-row group h-full">
                      <div className="sm:w-2/5 h-48 sm:h-auto relative bg-slate-950/20 overflow-hidden shrink-0 border-r border-slate-50 dark:border-slate-800">
                         <img src={m.featuredImage} alt={m.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white">Active</span>
                         </div>
                      </div>
                      <div className="p-7 flex-1 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <h3 className="font-extrabold text-slate-950 dark:text-white text-base leading-tight group-hover:text-indigo-600 transition-colors break-words flex-1 pr-2">{m.name}</h3>
                               <div className="flex items-center gap-1 shrink-0">
                                 <button onClick={() => handleEditMinistryClick(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                                 <button onClick={() => handleDeleteMinistry(m.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light mt-3 line-clamp-3">
                              {m.description}
                            </p>

                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/60 space-y-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 text-indigo-500" /> 
                                <span>Leads: </span>
                                <span className="text-slate-700 dark:text-slate-300 font-black truncate max-w-[150px]">
                                  {m.leaders ? m.leaders.join(', ') : 'No Leaders Registered'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-indigo-500" /> 
                                <span className="lowercase truncate max-w-[150px]">{m.contactEmail}</span>
                              </div>
                            </div>
                         </div>

                         <div className="mt-6 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/60 pt-4">
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                <Users className="w-4 h-4" /> {m.membersCount || 0} Saints
                             </div>
                         </div>
                      </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ================= PROJECT FORM MODAL ================= */}
      <AnimatePresence>
         {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" />
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-10 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                       <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                          <Layers className="w-5 h-5 text-indigo-600 animate-pulse" /> {editingProject ? 'Update Build / Outpost' : 'Register Build / Outpost'}
                       </h3>
                       <p className="text-xs text-slate-400 font-light mt-1">Configure physical infrastructure or outreach outpost targets.</p>
                     </div>
                     <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
                        <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                     </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Project Full Title *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. DMC Main Sanctuary Phase II" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Short Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Sanctuary Build" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Outpost Category</label>
                        <select 
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        >
                          <option value="Sanctuary operations">Sanctuary Operations / Builds</option>
                          <option value="Outpost Construction">Outpost Construction</option>
                          <option value="Youth Ministry">Youth Ministry Projects</option>
                          <option value="Charity outreach">Charity & Public Welfare</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Location / Outpost *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Zomba Central" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Financial Target *</label>
                        <input 
                          type="number" 
                          required
                          value={formData.budget}
                          onChange={e => setFormData({ ...formData, budget: e.target.value })}
                          placeholder="Target Budget (MWK)" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Initially Raised *</label>
                        <input 
                          type="number" 
                          required
                          value={formData.raised}
                          onChange={e => setFormData({ ...formData, raised: e.target.value })}
                          placeholder="Initial Yield (MWK)" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Execution Days *</label>
                        <input 
                          type="number" 
                          required
                          value={formData.targetDays}
                          onChange={e => setFormData({ ...formData, targetDays: e.target.value })}
                          placeholder="Expected Days" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Project Impact Description</label>
                      <textarea 
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed scope and spiritual parameters of this endeavor..." 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white resize-none"
                      />
                    </div>

                    <div className="pt-2 flex gap-3 w-full">
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)} 
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest rounded-xl outline-none active:scale-95 transition-all transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none cursor-pointer"
                      >
                        {isSubmitting ? 'Processing...' : (editingProject ? 'Update Outpost' : 'Initiate Project')}
                      </button>
                    </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* ================= MINISTRY FORM MODAL ================= */}
      <AnimatePresence>
         {showMinistryForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setShowMinistryForm(false)} className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" />
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-10 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                       <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                          <Compass className="w-5 h-5 text-indigo-600 animate-pulse" /> {editingMinistry ? 'Update Ministry Group' : 'Register Ministry Group'}
                       </h3>
                       <p className="text-xs text-slate-400 font-light mt-1">Configure a standard spiritual auxiliary or workflow team department.</p>
                     </div>
                     <button onClick={() => setShowMinistryForm(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
                        <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                     </button>
                  </div>
                  
                  <form onSubmit={handleSubmitMinistry} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Ministry Name *</label>
                      <input 
                        type="text" 
                        required
                        value={ministryFormData.name}
                        onChange={e => setMinistryFormData({ ...ministryFormData, name: e.target.value })}
                        placeholder="e.g. Nature Shakers Youth Network" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Description / Mandate *</label>
                      <textarea 
                        rows={3}
                        required
                        value={ministryFormData.description}
                        onChange={e => setMinistryFormData({ ...ministryFormData, description: e.target.value })}
                        placeholder="Detailed description of the theological focus, activities, and operational parameters..." 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Ministry Leaders (comma-separated)</label>
                        <input 
                          type="text" 
                          value={ministryFormData.leaders}
                          onChange={e => setMinistryFormData({ ...ministryFormData, leaders: e.target.value })}
                          placeholder="e.g. Sister Sandra, Auntie Martha" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Contact Email *</label>
                        <input 
                          type="email" 
                          required
                          value={ministryFormData.contactEmail}
                          onChange={e => setMinistryFormData({ ...ministryFormData, contactEmail: e.target.value })}
                          placeholder="e.g. youth@nncm-church.org" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Featured Unsplash Image URL</label>
                      <input 
                        type="text" 
                        value={ministryFormData.featuredImage}
                        onChange={e => setMinistryFormData({ ...ministryFormData, featuredImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..." 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white"
                      />
                    </div>

                    <div className="pt-2 flex gap-3 w-full">
                      <button 
                        type="button" 
                        onClick={() => setShowMinistryForm(false)} 
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest rounded-xl outline-none active:scale-95 transition-all transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmittingMinistry}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none cursor-pointer"
                      >
                        {isSubmittingMinistry ? 'Registering...' : (editingMinistry ? 'Update Ministry' : 'Initiate Ministry')}
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

function Link(props: any) {
  return <a {...props} />;
}
