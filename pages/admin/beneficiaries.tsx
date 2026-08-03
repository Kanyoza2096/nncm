// pages/admin/beneficiaries.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, Loader2, X, Users, MapPin, Phone } from 'lucide-react'
import { beneficiaryService } from '@/services/beneficiaries'
import type { Beneficiary } from '@/types'
import { toast } from 'sonner'

const GENDERS = ['male', 'female', 'other'] as const
const STATUSES = ['active', 'inactive', 'pending'] as const
const CATEGORIES = ['Local Resident', 'Refugee', 'Orphan', 'Widow', 'Student', 'Elderly'] as const

interface BeneficiaryForm {
  name: string; email: string; phone: string; gender: string; age: string
  location: string; category: string; status: string; notes: string
}

const EMPTY_FORM: BeneficiaryForm = {
  name: '', email: '', phone: '', gender: 'male', age: '',
  location: 'Zomba', category: 'Local Resident', status: 'active', notes: ''
}

export default function AdminBeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<BeneficiaryForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try { setBeneficiaries(await beneficiaryService.getBeneficiaries()) }
    catch { toast.error('Failed to load beneficiaries.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.location && b.location.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) { toast.error('Name required.'); return }
    setSubmitting(true)
    try {
      await beneficiaryService.addBeneficiary({
        name: formData.name, email: formData.email, phone: formData.phone,
        gender: formData.gender as 'male' | 'female' | 'other',
        age: Number(formData.age) || 0, dob: '', location: formData.location,
        address: formData.location, maritalStatus: 'single', childrenCount: 0,
        occupation: '', status: formData.status as 'active' | 'inactive', category: formData.category as string,
        churchGroup: '', createdAt: Date.now()
      })
      toast.success('Beneficiary added.')
      setShowForm(false); setFormData(EMPTY_FORM); fetchData()
    } catch { toast.error('Failed to add.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (b: Beneficiary) => {
    if (!window.confirm(`Remove "${b.name}"?`)) return
    try { await beneficiaryService.deleteBeneficiary(b.id); toast.success('Removed.'); fetchData() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Beneficiaries — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Beneficiaries</h1>
            <p className="text-slate-500 text-sm mt-1">{beneficiaries.length} souls in registry.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Beneficiary
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="ben-search" className="sr-only">Search</label>
              <input id="ben-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading registry...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No beneficiaries found.</td></tr>
                ) : (
                  filtered.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-sm" aria-hidden="true">{b.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{b.name}</p>
                            {b.phone && <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{b.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-300" />{b.location || '—'}</td>
                      <td className="px-6 py-5"><span className="text-[10px] font-bold uppercase text-slate-500">{b.category || '—'}</span></td>
                      <td className="px-6 py-5"><span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${b.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{b.status}</span></td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(b)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Remove ${b.name}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Add beneficiary">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Add Beneficiary</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="ben-name" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Full Name *</label>
                    <input id="ben-name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ben-email" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Email</label>
                      <input id="ben-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="ben-phone" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Phone</label>
                      <input id="ben-phone" type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="ben-gender" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Gender</label>
                      <select id="ben-gender" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ben-age" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Age</label>
                      <input id="ben-age" type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="ben-status" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Status</label>
                      <select id="ben-status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ben-location" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Location</label>
                      <input id="ben-location" type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="ben-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                      <select id="ben-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Add Beneficiary'}
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
