// pages/admin/testimonials.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, CheckCircle2, XCircle, Loader2, X, MessageSquare } from 'lucide-react'
import { testimonialService } from '@/services/testimonials'
import type { Testimonial } from '@/types'
import { toast } from 'sonner'

interface TestimonialForm { name: string; role: string; content: string; approved: boolean }

const EMPTY_FORM: TestimonialForm = { name: '', role: '', content: '', approved: false }

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<TestimonialForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setTestimonials(await testimonialService.getTestimonials()) }
    catch { toast.error('Failed to load testimonials.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = testimonials.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.content) { toast.error('Name and content required.'); return }
    setSubmitting(true)
    try {
      await testimonialService.createTestimonial({ ...formData, photoURL: '' })
      toast.success('Testimonial added.')
      setShowForm(false); setFormData(EMPTY_FORM); fetchData()
    } catch { toast.error('Failed to add testimonial.') }
    finally { setSubmitting(false) }
  }

  const handleToggleApproval = async (t: Testimonial) => {
    try {
      await testimonialService.updateTestimonial(t.id, { approved: !t.approved })
      setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, approved: !item.approved } : item))
      toast.success(t.approved ? 'Testimonial unapproved.' : 'Testimonial approved.')
    } catch { toast.error('Failed to update.') }
  }

  const handleDelete = async (t: Testimonial) => {
    if (!window.confirm(`Delete testimonial by "${t.name}"?`)) return
    try { await testimonialService.deleteTestimonial(t.id); toast.success('Deleted.'); fetchData() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Testimonials — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Testimonials</h1>
            <p className="text-slate-500 text-sm mt-1">{testimonials.filter(t => t.approved).length} approved, {testimonials.length} total.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Testimonial
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="test-search" className="sr-only">Search testimonials</label>
              <input id="test-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or content..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Author</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Content</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading testimonials...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic">No testimonials found.</td></tr>
                ) : (
                  filtered.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        {t.role && <p className="text-[10px] text-slate-400">{t.role}</p>}
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 max-w-xs truncate">{t.content}</td>
                      <td className="px-6 py-5">
                        <button onClick={() => handleToggleApproval(t)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${t.approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {t.approved ? <><CheckCircle2 className="w-3 h-3" /> Approved</> : <><XCircle className="w-3 h-3" /> Pending</>}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(t)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Delete testimonial by ${t.name}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10" role="dialog" aria-modal="true" aria-label="Add testimonial">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Add Testimonial</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="test-name" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Full Name *</label>
                    <input id="test-name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="test-role" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Role / Title</label>
                    <input id="test-role" type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Church Member" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="test-content" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Testimony *</label>
                    <textarea id="test-content" rows={4} required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 resize-y" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Add Testimonial'}
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
