// pages/admin/events.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Edit2, Trash2, Save, X, Loader2, Calendar, MapPin, Users, Eye } from 'lucide-react'
import { churchService } from '@/services/churchService'
import type { ChurchEvent } from '@/types'
import { toast } from 'sonner'
import NativeFileUpload from '@/components/NativeFileUpload'
import { getImageUrl } from '@/lib/image-utils'

const CATEGORIES = ['Conference', 'Crusade', 'Bible Study', 'Youth', 'Sunday Service', 'Midweek Service', 'Outreach']

interface EventForm {
  title: string; description: string; category: string; date: string; time: string
  location: string; registrationOpen: boolean; image: string
}

const EMPTY_FORM: EventForm = {
  title: '', description: '', category: 'Conference',
  date: '', time: '08:00 AM', location: 'NNCM Main Auditorium, Zomba',
  registrationOpen: true, image: ''
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null)
  const [formData, setFormData] = useState<EventForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try { setEvents(await churchService.events.getAll()) }
    catch { toast.error('Failed to load events.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (event: ChurchEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title, description: event.description || '', category: event.category,
      date: event.date, time: event.time || '', location: event.location || '',
      registrationOpen: event.registrationOpen ?? true, image: event.image || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) { toast.error('Title and date required.'); return }
    setSubmitting(true)
    try {
      if (editingEvent) {
        await churchService.events.update(editingEvent.id, formData)
        toast.success('Event updated.')
      } else {
        await churchService.events.create(formData)
        toast.success('Event created.')
      }
      setShowForm(false); setEditingEvent(null); setFormData(EMPTY_FORM); fetchEvents()
    } catch { toast.error('Failed to save event.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (event: ChurchEvent) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return
    try { await churchService.events.delete(event.id); toast.success('Event deleted.'); fetchEvents() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Events — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events Calendar</h1>
            <p className="text-slate-500 text-sm mt-1">{events.length} events in registry.</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setFormData(EMPTY_FORM); setShowForm(true) }} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Event
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="event-search" className="sr-only">Search events</label>
              <input id="event-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Event</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registered</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading events...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No events found.</td></tr>
                ) : (
                  filtered.map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                            {evt.image && <img src={getImageUrl(evt.image)} alt="" className="w-full h-full object-cover opacity-70" />}
                            <button onClick={() => setLightboxImage(evt.image)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity" aria-label="View flyer"><Eye className="w-4 h-4 text-white" /></button>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{evt.title}</p>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{evt.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</div>
                        {evt.time && <p className="text-[10px] text-slate-400 mt-0.5">{evt.time}</p>}
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500"><div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location || '—'}</div></td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600"><div className="flex items-center gap-1"><Users className="w-3 h-3 text-indigo-500" />{evt.registeredCount || 0}</div></td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(evt)} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label={`Edit ${evt.title}`}><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(evt)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Delete ${evt.title}`}><Trash2 className="w-3.5 h-3.5" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={editingEvent ? 'Edit event' : 'New event'}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-extrabold text-slate-900 text-lg">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-4" noValidate>
                  <div>
                    <label htmlFor="evt-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Event Title *</label>
                    <input id="evt-title" type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="evt-desc" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Description</label>
                    <textarea id="evt-desc" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="evt-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                      <select id="evt-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="evt-date" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Date *</label>
                      <input id="evt-date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="evt-time" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Time</label>
                      <input id="evt-time" type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="evt-location" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Location</label>
                      <input id="evt-location" type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="evt-reg-open" type="checkbox" checked={formData.registrationOpen} onChange={e => setFormData({...formData, registrationOpen: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                    <label htmlFor="evt-reg-open" className="text-xs font-bold text-slate-600">Registration Open</label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Event Flyer</label>
                    <div className="flex gap-2 items-center">
                      <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="Image URL" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                      <NativeFileUpload buttonText="Upload" acceptTypes="image/*" folder="events" onUpload={(url: string) => setFormData({...formData, image: url})} />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxImage(null)} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out">
              <button onClick={() => setLightboxImage(null)} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full z-50 focus:outline-none focus:ring-2 focus:ring-white/50" aria-label="Close"><X className="w-5 h-5" /></button>
              <img src={getImageUrl(lightboxImage)} alt="Event flyer" className="max-w-full max-h-[85vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
