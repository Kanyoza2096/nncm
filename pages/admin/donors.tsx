// pages/admin/donors.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, Mail, Phone, Loader2, X, Heart } from 'lucide-react'
import { donorService } from '@/services/donors'
import type { Donor } from '@/types'
import { toast } from 'sonner'

const DONOR_TYPES = ['individual', 'organization', 'church', 'anonymous'] as const

interface DonorForm {
  name: string
  email: string
  phone: string
  donorType: string
}

const EMPTY_FORM: DonorForm = { name: '', email: '', phone: '', donorType: 'individual' }

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<DonorForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await donorService.getDonors()
      setDonors(data)
    } catch { toast.error('Failed to load donors.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDonors() }, [fetchDonors])

  const filtered = donors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.email && d.email.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) { toast.error('Name is required.'); return }
    setSubmitting(true)
    try {
      await donorService.createDonor(formData as Omit<Donor, 'id' | 'totalDonations'>)
      toast.success('Donor registered.')
      setShowForm(false)
      setFormData(EMPTY_FORM)
      fetchDonors()
    } catch { toast.error('Failed to register donor.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (donor: Donor) => {
    if (!window.confirm(`Remove donor "${donor.name}"?`)) return
    try {
      await donorService.deleteDonor(donor.id)
      toast.success('Donor removed.')
      fetchDonors()
    } catch { toast.error('Failed to remove donor.') }
  }

  return (
    <>
      <Head><title>Donors — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Donor Registry</h1>
            <p className="text-slate-500 text-sm mt-1">Managing kingdom financiers and giving partners.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Register Donor
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="donor-search" className="sr-only">Search donors</label>
              <input id="donor-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Donor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Given</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Loading donor registry...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 font-medium italic">No donors found.</td></tr>
                ) : (
                  filtered.map(donor => (
                    <tr key={donor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm" aria-hidden="true">{donor.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{donor.name}</p>
                            {donor.email && <p className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1"><Mail className="w-3 h-3" />{donor.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="inline-flex px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-100">{donor.donorType || 'individual'}</span></td>
                      <td className="px-6 py-5 font-bold text-sm text-emerald-600">MWK {(donor.totalDonations || 0).toLocaleString()}</td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(donor)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Remove ${donor.name}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10" role="dialog" aria-modal="true" aria-label="Register new donor">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Heart className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Register Donor</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="donor-name" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Full Name *</label>
                    <input id="donor-name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="donor-email" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Email</label>
                      <input id="donor-email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="donor-phone" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Phone</label>
                      <input id="donor-phone" type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="donor-type" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Donor Type</label>
                    <select id="donor-type" value={formData.donorType} onChange={e => setFormData({...formData, donorType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                      {DONOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Register Donor'}
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
