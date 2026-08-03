// pages/admin/users.tsx
// ============================================================================
// NNCM Church Portal — Admin Users Management
// Next.js with accessibility and UX upgrades.
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  UserPlus,
  Shield,
  ShieldCheck,
  Key,
  Trash2,
  Lock,
  Loader2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { authService } from '@/services/auth'
import type { User, Role } from '@/types'
import { generateUUID } from '@/lib/id-utils'
import { toast } from 'sonner'

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'member', label: 'Church Member' },
  { value: 'pastor', label: 'Senior Pastor' },
  { value: 'secretary', label: 'Ministry Secretary' },
  { value: 'treasurer', label: 'Ministry Treasurer' },
  { value: 'deacon', label: 'Deacon / Deaconess' },
  { value: 'elder', label: 'Church Elder' },
  { value: 'readership', label: 'Readership Personnel' },
  { value: 'volunteer', label: 'Volunteer Service' },
  { value: 'staff', label: 'Official Staff' },
  { value: 'admin', label: 'System Admin' },
]

interface UserForm {
  name: string
  email: string
  whatsapp: string
  role: Role
}

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  whatsapp: '',
  role: 'member',
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UserForm>(EMPTY_FORM)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const profiles = await authService.getAllProfiles()
      setUsers(profiles)
    } catch {
      toast.error('Privileged workforce directory locked.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const id = generateUUID()
      await authService.createUserProfile(id, {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        role: formData.role,
        status: 'active',
        createdAt: Date.now(),
      })

      toast.success('Agent authorized and profile activated!')
      setShowForm(false)
      setFormData(EMPTY_FORM)
      fetchUsers()
    } catch {
      toast.error('Failed to authorize agent.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete
  const handleDelete = async (user: User) => {
    if (!window.confirm(`Remove "${user.name}" from authorized workforce?`)) return

    try {
      await authService.deleteUserProfile(user.id)
      toast.success('Agent removed from workforce.')
      fetchUsers()
    } catch {
      toast.error('Failed to remove agent.')
    }
  }

  return (
    <>
      <Head>
        <title>Users — NNCM Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrative Workforce
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 font-light">
              Managing access permissions and staff authorization levels.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-950 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-xl flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Authorize New Agent
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search
                className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="user-search" className="sr-only">
                Search agents
              </label>
              <input
                id="user-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents by name, email, or role..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              SECURE ACCESS
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Authorized Agent
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Clearance Level
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Department
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Last Access
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                        Syncing authorized workforce...
                      </span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-400 font-medium italic">
                        No authorized agents discovered in this partition.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm"
                            aria-hidden="true"
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-1.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            user.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3 mr-1.5" aria-hidden="true" />
                          ) : (
                            <Key className="w-3 h-3 mr-1.5" aria-hidden="true" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-xs text-slate-500 uppercase tracking-tight">
                        Secretariat
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2 text-slate-300 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Shield className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-lg"
                            aria-label={`Remove ${user.name}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Authorize Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12"
                role="dialog"
                aria-modal="true"
                aria-label="Authorize new agent"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <UserPlus className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                    Grant Access
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Close form"
                  >
                    <XCircle className="w-6 h-6 text-slate-400" aria-hidden="true" />
                  </button>
                </div>

                {/* Warning Banner */}
                <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="font-black text-indigo-700 text-[10px] uppercase tracking-widest">
                      Protocol Pre-Check
                    </h3>
                    <p className="text-xs text-indigo-600/70 leading-relaxed mt-1 font-medium">
                      Authorization of new agents should only proceed after regional board
                      confirmation and spiritual screening.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="user-name"
                      className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                    >
                      Agent Identity (Official Name)
                    </label>
                    <input
                      id="user-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Samuel Chilwa"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="user-email"
                      className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                    >
                      Security Email
                    </label>
                    <input
                      id="user-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@nncm.org"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="user-whatsapp"
                      className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                    >
                      WhatsApp Protocol Number
                    </label>
                    <input
                      id="user-whatsapp"
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+265..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="user-role"
                      className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                    >
                      Assigned Role & Clearance
                    </label>
                    <select
                      id="user-role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as Role })
                      }
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none appearance-none"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-2" aria-hidden="true" />
                        Processing...
                      </>
                    ) : (
                      'Submit Authorization'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
