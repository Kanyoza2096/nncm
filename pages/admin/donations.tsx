// pages/admin/donations.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, Loader2, X, DollarSign } from 'lucide-react'
import { donorService } from '@/services/donors'
import type { Donation } from '@/types'
import { toast } from 'sonner'

const CURRENCIES = ['MWK', 'USD', 'ZAR', 'GBP'] as const

interface DonationForm { donorId: string; amount: string; currency: string; notes: string }

const EMPTY_FORM: DonationForm = { donorId: '', amount: '', currency: 'MWK', notes: '' }

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<DonationForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try { const data = await donorService.getDonations(); setDonations(data) }
    catch { toast.error('Failed to load donations.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDonations() }, [fetchDonations])

  const filtered = donations.filter(d =>
    (d.donorId && d.donorId.toLowerCase().includes(search.toLowerCase())) ||
    (d.notes && d.notes.toLowerCase().includes(search.toLowerCase()))
  )

  const total = filtered.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.donorId || !formData.amount) { toast.error('Donor ID and amount required.'); return }
    setSubmitting(true)
    try {
      await donorService.addDonation({ donorId: formData.donorId, amount: Number(formData.amount), currency: formData.currency, notes: formData.notes })
      toast.success('Donation recorded.')
      setShowForm(false)
      setFormData(EMPTY_FORM)
      fetchDonations()
    } catch { toast.error('Failed to record donation.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (donation: Donation) => {
    if (!window.confirm('Delete this donation record?')) return
    try { await donorService.deleteDonation(donation.id); toast.success('Donation removed.'); fetchDonations() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Donations — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Donations Ledger</h1>
            <p className="text-slate-500 text-sm mt-1">Total: <span className="font-bold text-emerald-600">MWK {total.toLocaleString()}</span></p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Record Donation
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="donation-search" className="sr-only">Search donations</label>
              <input id="donation-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by donor or notes..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Donor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading ledger...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No donations recorded.</td></tr>
                ) : (
                  filtered.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 text-xs font-mono text-slate-500">{d.donorId?.substring(0, 8)}...</td>
                      <td className="px-6 py-5 font-bold text-sm text-emerald-600">{d.currency || 'MWK'} {Number(d.amount).toLocaleString()}</td>
                      <td className="px-6 py-5 text-xs text-slate-400">{new Date(Number(d.date)).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-xs text-slate-500 max-w-[200px] truncate">{d.notes || '—'}</td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(d)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label="Delete donation"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10" role="dialog" aria-modal="true" aria-label="Record donation">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Record Donation</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="donation-donor" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Donor ID *</label>
                    <input id="donation-donor" type="text" required value={formData.donorId} onChange={e => setFormData({...formData, donorId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="donation-amount" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Amount *</label>
                      <input id="donation-amount" type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="donation-currency" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Currency</label>
                      <select id="donation-currency" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="donation-notes" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Notes</label>
                    <textarea id="donation-notes" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Record'}
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
