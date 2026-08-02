// pages/admin/gallery.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Camera, Search, Plus, Trash2, Calendar, X, Image as ImageIcon,
  Heart, Grid, Sparkles, Link as LinkIcon, Loader2, Upload,
  CheckCircle, AlertCircle, FileImage, FolderOpen, CheckCircle2, SlidersHorizontal
} from 'lucide-react'
import { churchService } from '@/services/churchService'
import type { GalleryImage } from '@/types'
import { getImageUrl } from '@/lib/image-utils'
import { toast } from 'sonner'
import { uploadFileToSupabase } from '@/lib/storage'

const CATEGORIES = ['Sunday Service', 'Fellowship & Meetings', 'Youth', 'Crusade & Outreaches', 'Special Events']

const IMAGE_PRESETS = [
  { title: 'Worship Sunday Service', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Community Outreach Service', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Youth Flame Ministry Rehearsal', url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Sanctuary Choir Praise', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=1200&q=80' }
]

interface PendingImage {
  id: string; file: File; objectUrl: string; title: string; category: string
  customCategory?: string; status: 'pending' | 'uploading' | 'success' | 'failed'
  uploadedUrl?: string; error?: string
}

interface SingleForm { title: string; category: string; customCategory: string; url: string }

const EMPTY_FORM: SingleForm = { title: '', category: 'Sunday Service', customCategory: '', url: '' }

function cleanFileNameToTitle(filename: string): string {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename
  return nameWithoutExt.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim()
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [uploadTab, setUploadTab] = useState<'device' | 'url'>('device')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [singleForm, setSingleForm] = useState<SingleForm>(EMPTY_FORM)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [globalCategory, setGlobalCategory] = useState('Sunday Service')
  const [uploadingBatch, setUploadingBatch] = useState(false)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    try { setImages(await churchService.gallery.getAll()) }
    catch { toast.error('Could not reach photographic archives.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchImages() }, [fetchImages])

  const categoriesList = ['All', ...Array.from(new Set(images.map(img => img.category || 'Sunday Service')))]

  const filtered = images.filter(img => {
    const matchSearch = img.title.toLowerCase().includes(search.toLowerCase()) || (img.category || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'All' || (img.category || 'Sunday Service') === selectedCategory
    return matchSearch && matchCat
  })

  // Device file selection
  const handleDeviceFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files?.length) return
    const newPending: PendingImage[] = Array.from(files).map(file => ({
      id: 'pending-' + Math.random().toString(36).substring(2, 9),
      file, objectUrl: URL.createObjectURL(file),
      title: cleanFileNameToTitle(file.name), category: globalCategory, status: 'pending'
    }))
    setPendingImages(prev => [...prev, ...newPending])
    toast.success(`Enrolled ${newPending.length} photos.`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePending = (id: string, objUrl: string) => {
    URL.revokeObjectURL(objUrl)
    setPendingImages(prev => prev.filter(i => i.id !== id))
  }

  const updatePendingTitle = (id: string, title: string) => setPendingImages(prev => prev.map(i => i.id === id ? {...i, title} : i))
  const updatePendingCategory = (id: string, cat: string, custom?: string) => setPendingImages(prev => prev.map(i => i.id === id ? {...i, category: cat, customCategory: custom} : i))

  const applyGlobalCategory = (cat: string) => {
    setGlobalCategory(cat)
    setPendingImages(prev => prev.map(i => ({...i, category: cat})))
  }

  // Batch upload
  const handleBatchUpload = async () => {
    if (!pendingImages.length) { toast.error('No files selected.'); return }
    setUploadingBatch(true)
    let success = 0
    const promises = pendingImages.map(async (img) => {
      if (img.status === 'success') return
      setPendingImages(prev => prev.map(i => i.id === img.id ? {...i, status: 'uploading'} : i))
      try {
        const result = await uploadFileToSupabase(img.file, 'gallery')
        const finalCat = img.category === 'Custom' ? (img.customCategory?.trim() || 'Sunday Service') : img.category
        await churchService.gallery.create({ title: img.title.trim() || 'Sanctuary Scene', category: finalCat, url: result.url })
        success++
        setPendingImages(prev => prev.map(i => i.id === img.id ? {...i, status: 'success', uploadedUrl: result.url} : i))
      } catch (err: any) {
        setPendingImages(prev => prev.map(i => i.id === img.id ? {...i, status: 'failed', error: err.message || 'Upload failed'} : i))
      }
    })
    await Promise.all(promises)
    setUploadingBatch(false)
    if (success > 0) {
      toast.success(`${success} photos uploaded!`)
      fetchImages()
      setPendingImages(prev => { prev.forEach(i => { if (i.status === 'success') URL.revokeObjectURL(i.objectUrl) }); return prev.filter(i => i.status !== 'success') })
    } else { toast.error('Upload failed.') }
  }

  // Single URL submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalCat = singleForm.category === 'Custom' ? (singleForm.customCategory.trim() || 'Sunday Service') : singleForm.category
    if (!singleForm.title.trim() || !singleForm.url.trim()) { toast.error('Title and URL required.'); return }
    try {
      await churchService.gallery.create({ title: singleForm.title.trim(), category: finalCat, url: singleForm.url.trim() })
      toast.success('Image registered.')
      setShowForm(false); setSingleForm(EMPTY_FORM); fetchImages()
    } catch { toast.error('Registration failed.') }
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await churchService.gallery.delete(deleteTarget.id); toast.success('Image removed.'); setDeleteTarget(null); fetchImages() }
    catch { toast.error('Delete failed.') }
    finally { setDeleting(false) }
  }

  return (
    <>
      <Head><title>Gallery — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><Camera className="w-6 h-6 text-indigo-600" aria-hidden="true" /> Photo Library</h1>
            <p className="text-slate-500 text-sm mt-1">Administer public archives and gallery.</p>
          </div>
          <button onClick={() => { setPendingImages([]); setShowForm(true) }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Upload Photos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Grid, label: 'Gallery Assets', value: images.length, color: 'indigo' },
            { icon: Heart, label: 'Categories', value: Math.max(0, categoriesList.length - 1), color: 'pink' },
            { icon: CheckCircle2, label: 'Status', value: 'Live Online', color: 'emerald' },
          ].map(s => (
            <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 bg-${s.color}-50 text-${s.color}-600 rounded-lg`} aria-hidden="true"><s.icon className="w-4 h-4" /></div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{loading ? '...' : s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="gallery-search" className="sr-only">Search gallery</label>
              <input id="gallery-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto" role="group" aria-label="Filter by category">
              {categoriesList.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-900'}`} aria-pressed={selectedCategory === cat}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-extrabold tracking-widest text-xs uppercase animate-pulse flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-slate-400"><Camera className="w-12 h-12 mx-auto mb-3" /><p className="text-xs font-bold uppercase">No pictures found.</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map(img => (
                  <div key={img.id} className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 transition-all">
                    <div className="aspect-video relative overflow-hidden bg-slate-200">
                      {failedImages[img.id] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400"><Camera className="w-8 h-8 mb-2" /><span className="text-[10px] font-bold uppercase">Offline</span></div>
                      ) : (
                        <img src={getImageUrl(img.url)} alt={img.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" onError={() => setFailedImages(prev => ({...prev, [img.id]: true}))} />
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-indigo-600/90 rounded-md text-[9px] font-black uppercase text-white tracking-widest">{img.category || 'Sunday Service'}</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{img.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(img.createdAt).toLocaleDateString()}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5">
                        <a href={img.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-black uppercase hover:underline">View</a>
                        <button onClick={() => setDeleteTarget(img)} className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Delete ${img.title}`}><Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Drawer */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => { if (!uploadingBatch) setShowForm(false) }} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 180 }} className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden z-10" role="dialog" aria-modal="true" aria-label="Upload photos">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Camera className="w-5 h-5 text-indigo-600" aria-hidden="true" /> New Gallery Pictures</h2>
                    <p className="text-[11px] text-slate-400">Upload local photos or external URLs.</p>
                  </div>
                  <button onClick={() => setShowForm(false)} disabled={uploadingBatch} className="p-1.5 hover:bg-slate-200 text-slate-400 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>

                <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                  <button onClick={() => setUploadTab('device')} className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${uploadTab === 'device' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>Device Upload</button>
                  <button onClick={() => setUploadTab('url')} className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${uploadTab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>Web Link</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {uploadTab === 'device' && (
                    <div className="space-y-6">
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors relative">
                        <input type="file" ref={fileInputRef} onChange={handleDeviceFiles} multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" aria-label="Select photos from device" />
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm"><Upload className="w-6 h-6 text-indigo-600" aria-hidden="true" /></div>
                        <p className="text-sm font-black text-slate-800 mt-4">Select Photos from device</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPEG, HEIC, WebP up to 10MB each.</p>
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-lg uppercase tracking-wider"><FolderOpen className="w-3.5 h-3.5" /> Browse Local Storage</div>
                      </div>

                      {pendingImages.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs text-slate-500 font-extrabold flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4" /> Set all to:</span>
                          <select value={globalCategory} onChange={e => applyGlobalCategory(e.target.value)} className="px-3 py-1.5 text-xs font-extrabold bg-white border border-slate-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Global category">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        </div>
                      )}

                      <div className="space-y-4">
                        {pendingImages.length > 0 && <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Queue ({pendingImages.length} files)</h3>}
                        <AnimatePresence initial={false}>
                          {pendingImages.map(img => (
                            <motion.div key={img.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 items-start">
                              <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                                <img src={img.objectUrl} alt="" className="w-full h-full object-cover" />
                                {img.status === 'uploading' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>}
                                {img.status === 'success' && <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-400" /></div>}
                                {img.status === 'failed' && <div className="absolute inset-0 bg-red-950/75 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-500" /></div>}
                              </div>
                              <div className="flex-1 space-y-2.5 min-w-0">
                                <div>
                                  <label className="text-[9px] font-black uppercase text-slate-400 block">Title ({(img.file.size / 1024).toFixed(0)} KB)</label>
                                  <input type="text" value={img.title} onChange={e => updatePendingTitle(img.id, e.target.value)} disabled={img.status === 'uploading' || img.status === 'success'} className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 disabled:opacity-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 block">Category</label>
                                    <select value={img.category} onChange={e => updatePendingCategory(img.id, e.target.value)} disabled={img.status === 'uploading' || img.status === 'success'} className="w-full px-2.5 py-1.5 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}<option value="Custom">Custom...</option></select>
                                  </div>
                                  {img.category === 'Custom' && (
                                    <div>
                                      <label className="text-[9px] font-black uppercase text-slate-400 block">Custom Name</label>
                                      <input type="text" value={img.customCategory || ''} onChange={e => updatePendingCategory(img.id, 'Custom', e.target.value)} disabled={img.status === 'uploading' || img.status === 'success'} placeholder="e.g. Easter" className="w-full px-2.5 py-1 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                                    </div>
                                  )}
                                </div>
                                {img.error && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{img.error}</p>}
                              </div>
                              {img.status !== 'success' && img.status !== 'uploading' && (
                                <button onClick={() => removePending(img.id, img.objectUrl)} className="p-1 px-2.5 self-center text-slate-400 hover:text-red-500 border border-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Remove file"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {pendingImages.length === 0 && (
                          <div className="py-12 border border-slate-100 rounded-2xl flex flex-col items-center text-slate-400 gap-2"><FileImage className="w-10 h-10" /><p className="text-xs font-bold uppercase">No files chosen yet</p></div>
                        )}
                      </div>
                    </div>
                  )}

                  {uploadTab === 'url' && (
                    <form onSubmit={handleSingleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="gal-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Caption Title</label>
                        <input id="gal-title" type="text" required value={singleForm.title} onChange={e => setSingleForm({...singleForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none" />
                      </div>
                      <div>
                        <label htmlFor="gal-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                        <select id="gal-category" value={singleForm.category} onChange={e => setSingleForm({...singleForm, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}<option value="Custom">Custom...</option></select>
                      </div>
                      {singleForm.category === 'Custom' && (
                        <div className="pl-2 border-l-2 border-indigo-600">
                          <label htmlFor="gal-custom" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Custom Tag</label>
                          <input id="gal-custom" type="text" required value={singleForm.customCategory} onChange={e => setSingleForm({...singleForm, customCategory: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none" />
                        </div>
                      )}
                      <div>
                        <label htmlFor="gal-url" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Image URL</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
                          <input id="gal-url" type="url" required value={singleForm.url} onChange={e => setSingleForm({...singleForm, url: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest pl-1 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Suggested Presets</span>
                        <div className="grid grid-cols-2 gap-2">
                          {IMAGE_PRESETS.map((p, i) => (
                            <button key={i} type="button" onClick={() => setSingleForm({...singleForm, url: p.url, title: singleForm.title || p.title})} className="p-2 py-2.5 bg-slate-50 border border-slate-200 hover:border-indigo-600 text-slate-600 text-[10px] font-semibold text-left rounded-lg truncate flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"><ImageIcon className="w-3 h-3 text-slate-400 shrink-0" /><span className="truncate">{p.title}</span></button>
                          ))}
                        </div>
                      </div>
                      {singleForm.url && (
                        <div className="rounded-2xl border border-slate-200 aspect-video overflow-hidden bg-slate-100"><img src={singleForm.url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; toast.error('URL does not resolve to an image.') }} /></div>
                      )}
                      <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">Register Image</button>
                      </div>
                    </form>
                  )}
                </div>

                {uploadTab === 'device' && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button onClick={() => { pendingImages.forEach(i => URL.revokeObjectURL(i.objectUrl)); setPendingImages([]) }} disabled={!pendingImages.length || uploadingBatch} className="flex-1 py-3.5 bg-slate-200 text-slate-600 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400">Clear</button>
                    <button onClick={handleBatchUpload} disabled={!pendingImages.length || uploadingBatch} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {uploadingBatch ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Upload className="w-4 h-4" /> Upload All ({pendingImages.length})</>}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl" role="dialog" aria-modal="true" aria-label="Confirm deletion">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /> Confirm Delete</h3>
                <p className="text-xs text-slate-500 mt-2.5">Delete <strong>"{deleteTarget.title}"</strong>? This is permanent.</p>
                {deleteTarget.url && <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-100"><img src={getImageUrl(deleteTarget.url)} alt="" className="w-full h-full object-cover" /></div>}
                <div className="mt-5 flex gap-3">
                  <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400">
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
