// pages/admin/expenses.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, Trash2, Loader2, X, TrendingDown } from 'lucide-react'
import { expenseService } from '@/services/expenses'
import type { Expense } from '@/types'
import { toast } from 'sonner'

const CATEGORIES = ['Admin', 'Infrastructure', 'Food', 'Healthcare', 'Education', 'Transport', 'Utilities', 'Media', 'Other'] as const

interface ExpenseForm {
  projectId: string; amount: string; category: string; description: string; approvedBy: string
}

const EMPTY_FORM: ExpenseForm = { projectId: '', amount: '', category: 'Admin', description: '', approvedBy: '' }

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ExpenseForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try { setExpenses(await expenseService.getExpenses()) }
    catch { toast.error('Failed to load expenses.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const filtered = expenses.filter(e =>
    (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
    (e.category && e.category.toLowerCase().includes(search.toLowerCase()))
  )

  const total = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) { toast.error('Amount and description required.'); return }
    setSubmitting(true)
    try {
      await expenseService.logExpense({
        projectId: formData.projectId,
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description,
        approvedBy: formData.approvedBy,
        date: Date.now(),
      } as Omit<Expense, 'id'>)
      toast.success('Expense logged.')
      setShowForm(false); setFormData(EMPTY_FORM); fetchExpenses()
    } catch { toast.error('Failed to log expense.') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm('Delete this expense record?')) return
    try { await expenseService.deleteExpense(expense.id); toast.success('Expense removed.'); fetchExpenses() }
    catch { toast.error('Failed to delete.') }
  }

  return (
    <>
      <Head><title>Expenses — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Ledger</h1>
            <p className="text-slate-500 text-sm mt-1">Total: <span className="font-bold text-rose-600">MWK {total.toLocaleString()}</span></p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Plus className="w-4 h-4" aria-hidden="true" /> Log Expense
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="expense-search" className="sr-only">Search expenses</label>
              <input id="expense-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by description or category..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading ledger...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic">No expenses recorded.</td></tr>
                ) : (
                  filtered.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{exp.description}</p>
                        {exp.approvedBy && <p className="text-[10px] text-slate-400 mt-1">By: {exp.approvedBy}</p>}
                      </td>
                      <td className="px-6 py-5"><span className="inline-flex px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-100">{exp.category}</span></td>
                      <td className="px-6 py-5 font-bold text-sm text-rose-600">MWK {Number(exp.amount).toLocaleString()}</td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">{new Date(Number(exp.date)).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(exp)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label="Delete expense"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
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
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10" role="dialog" aria-modal="true" aria-label="Log expense">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Log Expense</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" aria-label="Close"><X className="w-5 h-5 text-slate-400" aria-hidden="true" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="exp-desc" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Description *</label>
                    <input id="exp-desc" type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exp-amount" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Amount (MWK) *</label>
                      <input id="exp-amount" type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="exp-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Category</label>
                      <select id="exp-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exp-project" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Project ID</label>
                      <input id="exp-project" type="text" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                      <label htmlFor="exp-approved" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1">Approved By</label>
                      <input id="exp-approved" type="text" value={formData.approvedBy} onChange={e => setFormData({...formData, approvedBy: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-400">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Log Expense'}
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
