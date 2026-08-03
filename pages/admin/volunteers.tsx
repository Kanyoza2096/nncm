// pages/admin/volunteers.tsx
// ============================================================================
// NNCM Church Portal — Admin Volunteers Management
// Next.js with accessibility and UX upgrades.
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users,
  Search,
  Plus,
  Sparkles,
  Trash2,
  Activity,
  HeartHandshake,
  Loader2,
  X,
} from 'lucide-react'
import { volunteerService } from '@/services/volunteers'
import type { Volunteer } from '@/types'
import { toast } from 'sonner'

// ============================================================================
// CONSTANTS
// ============================================================================

const DEPARTMENTS = [
  'All',
  'Ushering',
  'Choir',
  'Media',
  'Cleaning',
  'Security',
  'Welfare',
] as const

const DEPARTMENT_OPTIONS = [
  { value: 'Ushering', label: 'Ushering & Protocol' },
  { value: 'Choir', label: 'Praising Choir & Worship' },
  { value: 'Media', label: 'Media & Technical Support' },
  { value: 'Cleaning', label: 'Sanctuary Cleaning & Care' },
  { value: 'Security', label: 'Security & Orderly' },
  { value: 'Welfare', label: 'Welfare, Relief & Hospitality' },
] as const

const AVAILABILITY_OPTIONS = [
  { value: 'Weekends', label: 'Sundays & Saturday Rehearsals' },
  { value: 'Weekdays', label: 'Midweek fellowships / Night vigils' },
  { value: 'Flexible', label: 'Full-Time availability' },
] as const

interface VolunteerForm {
  name: string
  email: string
  phone: string
  department: string
  skillsStr: string
  availability: string
}

const EMPTY_FORM: VolunteerForm = {
  name: '',
  email: '',
  phone: '',
  department: 'Ushering',
  skillsStr: '',
  availability: 'Weekends',
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<VolunteerForm>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchVolunteers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await volunteerService.getVolunteers()
      setVolunteers(data)
    } catch {
      toast.error('Workforce registry unreachable.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVolunteers()
  }, [fetchVolunteers])

  // Filter
  const filtered = volunteers.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.phone && v.phone.includes(search))
    const matchesDept = selectedDept === 'All' || v.department === selectedDept
    return matchesSearch && matchesDept
  })

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Identity name and contact email are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const skillsArray = formData.skillsStr
        ? formData.skillsStr
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [`${formData.department} Support`]

      await volunteerService.registerVolunteer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        skills: skillsArray,
        availability: formData.availability,
        status: 'active',
      } as Volunteer)

      toast.success('Spiritual servant enlisted successfully!')
      setShowForm(false)
      setFormData(EMPTY_FORM)
      fetchVolunteers()
    } catch {
      toast.error('Failed to enlist servant.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete
  const handleDelete = async (volunteer: Volunteer) => {
    if (
      !window.confirm(
        `Are you sure you want to retire "${volunteer.name}" from active ministry duty?`
      )
    ) {
      return
    }

    try {
      await volunteerService.deleteVolunteer(volunteer.id)
      toast.success('Servant profile retired from active ledger.')
      fetchVolunteers()
    } catch {
      toast.error('Failed to retire servant.')
    }
  }

  return (
    <>
      <Head>
        <title>Volunteers — NNCM Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Ministry Servers List
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Coordinating the spiritual workforce across all departments.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Enlist New Server
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg" aria-hidden="true">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Active Pool
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-slate-200 rounded animate-pulse" />
              ) : (
                `${volunteers.length} Levites`
              )}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 sm:col-span-2 relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5" aria-hidden="true">
              <Sparkles className="w-32 h-32 scale-150 rotate-12" />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-1">
                Weekly Service Deployment
              </span>
              <p className="text-xl font-black text-indigo-600 tracking-tight">
                85% Capacity Ready
              </p>
            </div>
            <div className="relative z-10 flex -space-x-2" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center font-bold text-[10px] text-slate-500"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-widest">Growth</span>
            </div>
            <p className="text-xl font-black">+4 Joining</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/40">
            <div className="relative w-full sm:max-w-md">
              <Search
                className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="volunteer-search" className="sr-only">
                Search volunteers
              </label>
              <input
                id="volunteer-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or department..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1" role="group" aria-label="Filter by department">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    selectedDept === dept
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-100'
                  }`}
                  aria-pressed={selectedDept === dept}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Servant Identity
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Deployment Dept
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Join Date
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
                        Loading workforce registry...
                      </span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-400 font-medium italic">
                        No servants found in current department.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm"
                            aria-hidden="true"
                          >
                            {volunteer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {volunteer.name}
                            </p>
                            {volunteer.phone && (
                              <p className="text-[10px] font-mono text-slate-400 mt-1">
                                {volunteer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                          {volunteer.department}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          Exceptional
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-400 font-mono">
                        {new Date(volunteer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDelete(volunteer)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                          aria-label={`Remove ${volunteer.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enlist Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-10 border border-slate-100"
                role="dialog"
                aria-modal="true"
                aria-label="Enlist new volunteer"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                      Enlist New Server
                    </h2>
                    <p className="text-xs text-slate-400 font-light mt-1">
                      Register local Levites and helpers to specific ministry workflows.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-slate-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Close form"
                  >
                    <X className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="vol-name"
                      className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="vol-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Brother Thomas Phiri"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="vol-email"
                        className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1"
                      >
                        Contact Email *
                      </label>
                      <input
                        id="vol-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. thomas@gmail.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="vol-phone"
                        className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="vol-phone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +265 888 12 34 56"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Department + Availability */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="vol-dept"
                        className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1"
                      >
                        Ministry Department
                      </label>
                      <select
                        id="vol-dept"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                      >
                        {DEPARTMENT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="vol-availability"
                        className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1"
                      >
                        Availability Cycle
                      </label>
                      <select
                        id="vol-availability"
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                      >
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label
                      htmlFor="vol-skills"
                      className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 pl-1"
                    >
                      Skills & Spiritual Gifts (comma-separated)
                    </label>
                    <input
                      id="vol-skills"
                      type="text"
                      value={formData.skillsStr}
                      onChange={(e) => setFormData({ ...formData, skillsStr: e.target.value })}
                      placeholder="e.g. Sound design, Electric guitar, Public speaking"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-widest rounded-xl active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          Enlisting...
                        </>
                      ) : (
                        'Enlist Servant'
                      )}
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
