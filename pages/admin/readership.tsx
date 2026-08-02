// pages/admin/readership.tsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Search, BookOpen, Users, Calendar, TrendingUp } from 'lucide-react'
import { authService } from '@/services/auth'
import type { User } from '@/types'
import { toast } from 'sonner'

export default function AdminReadershipPage() {
  const [readers, setReaders] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchReaders = useCallback(async () => {
    setLoading(true)
    try {
      const all = await authService.getAllProfiles()
      setReaders(all.filter(u => u.role === 'readership' || u.role === 'pastor' || u.role === 'elder'))
    } catch { toast.error('Failed to load readership.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchReaders() }, [fetchReaders])

  const filtered = readers.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.email && r.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <Head><title>Readership — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Readership Registry</h1>
            <p className="text-slate-500 text-sm mt-1">{readers.length} ordained readers and teachers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Active Readers', value: readers.filter(r => r.status === 'active').length, icon: BookOpen, color: 'indigo' },
            { label: 'Total Teachers', value: readers.length, icon: Users, color: 'emerald' },
            { label: 'Sermons Delivered', value: '—', icon: TrendingUp, color: 'amber' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`} aria-hidden="true"><stat.icon className="w-4 h-4" /></div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{loading ? '...' : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="reader-search" className="sr-only">Search readers</label>
              <input id="reader-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-medium" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reader</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">Loading readership registry...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic">No readers found.</td></tr>
                ) : (
                  filtered.map(reader => (
                    <tr key={reader.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm" aria-hidden="true">{reader.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{reader.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{reader.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">{reader.role}</span></td>
                      <td className="px-6 py-5"><span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${reader.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{reader.status}</span></td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">{reader.createdAt ? new Date(Number(reader.createdAt)).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
