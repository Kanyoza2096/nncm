// pages/admin/sermons.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, Plus, Edit2, Trash2, Save, X, Loader2, AlertCircle,
  BookMarked, Download, Sparkles, Music, FileText
} from 'lucide-react'
import { churchService } from '@/services/churchService'
import type { Sermon } from '@/types'
import { toast } from 'sonner'
import NativeFileUpload from '@/components/NativeFileUpload'
import { getImageUrl } from '@/lib/image-utils'

const CATEGORIES = ['Sunday Service', 'Midweek Service', 'Conference', 'Youth', 'Crusade']

interface SermonForm {
  title: string; pastor: string; category: string; date: string
  videoUrl: string; audioUrl: string; notes: string; excerpt: string; coverImage: string
}

const EMPTY_FORM: SermonForm = {
  title: '', pastor: 'Pastor Richie Mkandawire', category: 'Sunday Service',
  date: new Date().toISOString().split('T')[0], videoUrl: '', audioUrl: '',
  notes: '', excerpt: '', coverImage: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80'
}

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null)
  const [formData, setFormData] = useState<SermonForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchSermons = useCallback(async () => {
    setLoading(true)
    try { setSermons(await churchService.sermons.getAll()) }
    catch { toast.error('Failed to load sermons.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSermons() }, [fetchSermons])

  const filtered = sermons.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.pastor.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (sermon: Sermon) => {
    setEditingSermon(sermon)
    setFormData({
      title: sermon.title, pastor: sermon.pastor, category: sermon.category,
      date: sermon.date, videoUrl: sermon.videoUrl || '', audioUrl: sermon.audioUrl || '',
      notes: sermon.notes || '', excerpt: sermon.excerpt || '', coverImage: sermon.coverImage || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.excerpt) { toast.error('Title and excerpt required.'); return }
    setSubmitting(true)
    try {
      if (editingSermon) {
        await churchService.sermons.update(editingSermon.id, formData)
        toast.success('Sermon updated.')
      } else {
        await churchService.sermons.create(formData)
        toast.success('Sermon published.')
      }
      setShowForm(false); setEditingSermon(null); setFormData(EMPTY_FORM); fetchSermons()
    } catch { toast.error('Failed to save sermon.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await churchService.sermons.delete(deleteTarget.id)
      toast.success('Sermon removed.')
      setDeleteTarget(null); fetchSermons()
    } catch { toast.error('Failed to delete.') }
    finally { setDeleting(false) }
  }

  return (
    <>
      <Head><title>Sermons — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Public Sermons Library</h1>
            <p className="text-slate-500 text-sm mt-1">Upload and coordinate theological outlines, audio/video streams.</p>
          </div>
          <button onClick={() => { setEditingSermon(null); setFormData(EMPTY_FORM); setShowForm(true) }} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Sermon
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg" aria-hidden="true"><BookMarked className="w-4 h-4" /></div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Digital Sermons</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{loading ? '...' : `${sermons.length} Lessons`}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg" aria-hidden="true"><Download className="w-4 h-4" /></div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Downloads</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{loading ? '...' : sermons.reduce((a, s) => a + (s.downloadsCount || 0), 0)}</p>
          </div>
          <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1 text-indigo-400"><Sparkles className="w-3.5 h-3.5" aria-hidden="true" /><span className="text-[9px] font-black uppercase tracking-widest">Global Availability</span></div>
            <p className="text-[11px] text-slate-500 font-bold">Synchronized on public interfaces.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="sermon-search" className="sr-only">Search sermons</label>
              <input id="sermon-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, preacher, or category..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Title</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preacher</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Downloads</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Consulting sermons archive...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No sermons found.</td></tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                            <img src={s.coverImage ? getImageUrl(s.coverImage) : '/logo.png'} alt="" className="w-full h-full object-cover opacity-70" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{s.title}</p>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{s.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600">{s.pastor}</td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">{s.date}</td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono font-bold flex items-center gap-1.5"><Download className="w-4 h-4 text-slate-300" />{s.downloadsCount || 0}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(s)} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label={`Edit ${s.title}`}><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Delete ${s.title}`}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editingSermon ? 'Edit sermon' : 'New sermon'}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">{editingSermon ? 'Edit Sermon' : 'Publish New Sermon'}</h2>
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">Sermons Library Node</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="serm-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Title *</label>
                      <input id="serm-title" type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="serm-pastor" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Preacher</label>
                      <input id="serm-pastor" type="text" required value={formData.pastor} onChange={e => setFormData({...formData, pastor: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="serm-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                      <select id="serm-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="serm-date" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Date</label>
                      <input id="serm-date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="serm-excerpt" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Excerpt *</label>
                    <textarea id="serm-excerpt" rows={2} required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>

                  <div>
                    <label htmlFor="serm-notes" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Sermon Notes</label>
                    <textarea id="serm-notes" rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="serm-video" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">YouTube URL</label>
                      <input id="serm-video" type="text" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="serm-audio" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Audio URL</label>
                      <div className="flex gap-2">
                        <input id="serm-audio" type="text" value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600" />
                        <NativeFileUpload buttonText="Upload" acceptTypes="audio/*" folder="audio_sermons" onUpload={(url: string) => setFormData({...formData, audioUrl: url})} />
                      </div>
                      {formData.audioUrl && (
                        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-1.5"><Music className="w-3.5 h-3.5 text-indigo-500" />{formData.audioUrl.substring(0, 50)}...</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">Cover Graphic</p>
                        <p className="text-[10px] text-slate-400 mt-1">Uploaded graphic for catalog card.</p>
                      </div>
                      <NativeFileUpload buttonText="Add Graphic" acceptTypes="image/*" folder="sermons" onUpload={(url: string) => setFormData({...formData, coverImage: url})} />
                    </div>
                    {formData.coverImage && (
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-2"><FileText className="w-3.5 h-3.5" />{formData.coverImage.substring(0, 60)}...</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 bg-slate-50 text-slate-500 hover:text-slate-900 font-bold rounded-2xl text-[11px] uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm deletion">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /> Confirm Deletion</h3>
                <p className="text-xs text-slate-500 mt-2.5">Delete sermon <strong>"{deleteTarget.title}"</strong>? This is permanent.</p>
                <div className="mt-5 flex gap-3">
                  <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400">
                    {deleting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</> : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
