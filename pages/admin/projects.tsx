// pages/admin/projects.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, Edit2, Loader2, X, Building } from 'lucide-react'
import { projectService } from '@/services/projects'
import type { Project } from '@/types'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image-utils'

const STATUSES = ['active', 'completed', 'pending', 'cancelled'] as const
const CATEGORIES = ['Sanctuary operations', 'Youth Ministry', 'Charity outreach', 'Evangelism', 'Infrastructure'] as const

interface ProjectForm {
  name: string; title: string; description: string; category: string
  budget: string; raised: string; status: string; location: string; image: string
}

const EMPTY_FORM: ProjectForm = {
  name: '', title: '', description: '', category: 'Sanctuary operations',
  budget: '', raised: '0', status: 'active', location: 'Zomba', image: ''
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProjectForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try { setProjects(await projectService.getProjects()) }
    catch { toast.error('Failed to load projects.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setFormData({
      name: project.name || '', title: project.title, description: project.description || '',
      category: project.category || '', budget: String(project.budget || ''),
      raised: String(project.raised || '0'), status: project.status || 'active',
      location: project.location || '', image: (Array.isArray(project.images) ? project.images[0] : '') || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) { toast.error('Title required.'); return }
    setSubmitting(true)
    try {
      const data = {
        name: formData.name || formData.title,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: Number(formData.budget) || 0,
        raised: Number(formData.raised) || 0,
        status: formData.status,
        location: formData.location,
        images: formData.image ? [formData.image] : [],
      }

      if (editingId) {
        await projectService.updateProject(editingId, data)
        toast.success('Project updated.')
      } else {
        await projectService.createProject(data as Omit<Project, 'id'>)
        toast.success('Project created.')
      }
      setShowForm(false); setEditingId(null); setFormData(EMPTY_FORM); fetchProjects()
    } catch { toast.error('Failed to save project.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return
    try { await projectService.deleteProject(project.id); toast.success('Project deleted.'); fetchProjects() }
    catch { toast.error('Failed to delete.') }
  }

  const progress = (p: Project) => {
    const budget = Number(p.budget) || 1
    const raised = Number(p.raised) || 0
    return Math.min(100, Math.round((raised / budget) * 100))
  }

  return (
    <>
      <Head><title>Projects — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kingdom Projects</h1>
            <p className="text-slate-500 text-sm mt-1">{projects.length} projects in registry.</p>
          </div>
          <button onClick={() => { setEditingId(null); setFormData(EMPTY_FORM); setShowForm(true) }} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> New Project
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="project-search" className="sr-only">Search projects</label>
              <input id="project-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading projects...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No projects found.</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                            {Array.isArray(p.images) && p.images[0] ? <img src={getImageUrl(p.images[0])} alt="" className="w-full h-full object-cover" /> : <Building className="w-5 h-5 m-2.5 text-slate-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{p.title}</p>
                            <p className="text-[10px] text-slate-400">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-sm">MWK {Number(p.budget || 0).toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600" style={{width: `${progress(p)}%`}} /></div>
                          <span className="text-[10px] font-bold text-slate-500">{progress(p)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : p.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>{p.status}</span></td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label={`Edit ${p.title}`}><Edit2 className="w-4 h-4" aria-hidden="true" /></button>
                          <button onClick={() => handleDelete(p)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Delete ${p.title}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit project' : 'New project'}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Building className="w-5 h-5 text-indigo-600" aria-hidden="true" /> {editingId ? 'Edit Project' : 'New Project'}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="proj-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Project Title *</label>
                    <input id="proj-title" type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="proj-desc" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Description</label>
                    <textarea id="proj-desc" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="proj-budget" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Budget (MWK)</label>
                      <input id="proj-budget" type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="proj-raised" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Raised (MWK)</label>
                      <input id="proj-raised" type="number" value={formData.raised} onChange={e => setFormData({...formData, raised: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="proj-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                      <select id="proj-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="proj-status" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Status</label>
                      <select id="proj-status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="proj-location" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Location</label>
                    <input id="proj-location" type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
