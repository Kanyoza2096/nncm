// pages/admin/reports.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, Download, Loader2, X, FileText } from 'lucide-react'
import { reportService } from '@/services/reports'
import { toast } from 'sonner'

interface Report { id: string; title: string; type: string; date: string; size: string; url?: string }

const REPORT_TYPES = ['Financial', 'Attendance', 'Outreach', 'Membership', 'Annual'] as const

interface ReportForm { title: string; type: string }

const EMPTY_FORM: ReportForm = { title: '', type: 'Financial' }

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ReportForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try { setReports(await reportService.getReports()) }
    catch { toast.error('Failed to load reports.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) { toast.error('Title required.'); return }
    setSubmitting(true)
    try {
      await reportService.createReport({
        title: formData.title, type: formData.type,
        date: new Date().toISOString(), size: '0 KB', url: '',
        createdAt: Date.now()
      })
      toast.success('Report generated.')
      setShowForm(false); setFormData(EMPTY_FORM); fetchReports()
    } catch { toast.error('Failed to create report.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (report: Report) => {
    if (!window.confirm(`Delete "${report.title}"?`)) return
    try { await reportService.deleteReport(report.id); toast.success('Report deleted.'); fetchReports() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Reports — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports Archive</h1>
            <p className="text-slate-500 text-sm mt-1">{reports.length} reports generated.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Generate Report
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="report-search" className="sr-only">Search reports</label>
              <input id="report-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or type..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Report</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Size</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading archive...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No reports found.</td></tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600" aria-hidden="true"><FileText className="w-4 h-4" /></div>
                          <p className="text-sm font-bold text-slate-900">{r.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="inline-flex px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{r.type}</span></td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-xs text-slate-400">{r.size || '—'}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {r.url && (
                            <a href={r.url} download className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label={`Download ${r.title}`}><Download className="w-4 h-4" aria-hidden="true" /></a>
                          )}
                          <button onClick={() => handleDelete(r)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label={`Delete ${r.title}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10" role="dialog" aria-modal="true" aria-label="Generate report">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Generate Report</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="report-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Report Title *</label>
                    <input id="report-title" type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div>
                    <label htmlFor="report-type" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Type</label>
                    <select id="report-type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                      {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : 'Generate'}
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
