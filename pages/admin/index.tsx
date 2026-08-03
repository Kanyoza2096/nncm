// pages/admin/index.tsx
// ============================================================================
// NNCM Church Portal — Admin Dashboard
// Next.js with real Supabase data, accessibility, and UX upgrades.
//
// UPGRADES:
//  • Real data from Supabase (no hardcoded chart data)
//  • Loading skeletons per stat card
//  • Error states with retry
//  • Proper Next.js Link (removed broken inline Link component)
//  • Semantic HTML
//  • Chart.js lazy-loaded (reduces initial bundle)
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Users,
  Heart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// DYNAMIC IMPORTS — Chart.js is heavy, load only when needed
// ============================================================================

const Charts = dynamic(() => import('@/components/admin/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-100 rounded-2xl animate-pulse" />
  ),
})

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  beneficiaries: number
  donors: number
  totalDonations: number
  totalExpenses: number
  activeProjects: number
  volunteers: number
  recentDonations: { amount: number; donor_name: string; created_at: string }[]
  expensesByCategory: { category: string; amount: number }[]
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
  return `MWK ${amount.toLocaleString()}`
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    beneficiaries: 0,
    donors: 0,
    totalDonations: 0,
    totalExpenses: 0,
    activeProjects: 0,
    volunteers: 0,
    recentDonations: [],
    expensesByCategory: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { supabase } = await import('@/lib/supabase')

      const [
        beneficiariesResult,
        donorsResult,
        donationsResult,
        expensesResult,
        projectsResult,
        volunteersResult,
      ] = await Promise.allSettled([
        supabase.from('beneficiaries').select('*', { count: 'exact', head: true }),
        supabase.from('donors').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('amount, donor_name, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('expenses').select('amount, category'),
        supabase.from('projects').select('*').eq('status', 'active'),
        supabase.from('volunteers').select('*', { count: 'exact', head: true }),
      ])

      const beneficiaries = beneficiariesResult.status === 'fulfilled' ? beneficiariesResult.value.count || 0 : 0
      const donors = donorsResult.status === 'fulfilled' ? donorsResult.value.count || 0 : 0

      const donations = donationsResult.status === 'fulfilled' ? donationsResult.value.data || [] : []
      const totalDonations = donations.reduce((sum: number, d: Record<string, unknown>) => sum + (Number(d.amount) || 0), 0)

      const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : []
      const totalExpenses = expenses.reduce((sum: number, e: Record<string, unknown>) => sum + (Number(e.amount) || 0), 0)

      // Group expenses by category
      const categoryMap: Record<string, number> = {}
      expenses.forEach((e: Record<string, unknown>) => {
        const cat = (e.category as string) || 'Uncategorized'
        categoryMap[cat] = (categoryMap[cat] || 0) + (Number(e.amount) || 0)
      })
      const expensesByCategory = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }))

      const activeProjects = projectsResult.status === 'fulfilled' ? (projectsResult.value.data || []).length : 0
      const volunteers = volunteersResult.status === 'fulfilled' ? volunteersResult.value.count || 0 : 0

      setStats({
        beneficiaries,
        donors,
        totalDonations,
        totalExpenses,
        activeProjects,
        volunteers,
        recentDonations: donations as DashboardStats['recentDonations'],
        expensesByCategory,
      })
    } catch (err) {
      setError('Failed to load dashboard data.')
      console.error('[Dashboard] Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // ==========================================================================
  // STAT CARDS
  // ==========================================================================

  const statCards = [
    {
      name: 'Total Church Family',
      value: stats.beneficiaries,
      icon: Users,
      color: 'indigo',
      trend: null,
      format: (v: number) => v.toLocaleString(),
    },
    {
      name: 'Tithes & Harvests',
      value: stats.totalDonations,
      icon: Heart,
      color: 'emerald',
      trend: null,
      format: formatCurrency,
    },
    {
      name: 'Ministry Spending',
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: 'rose',
      trend: null,
      format: formatCurrency,
    },
    {
      name: 'Ministry Workforce',
      value: stats.volunteers,
      icon: Users,
      color: 'amber',
      trend: null,
      format: (v: number) => v.toLocaleString(),
    },
  ]

  return (
    <>
      <Head>
        <title>Admin Dashboard — NNCM</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrative Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Real-time ministry impact and financial stewardship tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <button
              type="button"
              onClick={fetchStats}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Refresh dashboard data"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between" role="alert">
            <p className="text-red-800 text-sm font-medium">{error}</p>
            <button
              onClick={fetchStats}
              className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <motion.div
              whileHover={{ y: -3 }}
              key={stat.name}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                  <stat.icon className="w-6 h-6" aria-hidden="true" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.name}
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {loading ? (
                    <span className="inline-block w-24 h-7 bg-slate-200 rounded animate-pulse" aria-hidden="true" />
                  ) : (
                    stat.format(stat.value)
                  )}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts + Sidebar */}
        {!loading && (
          <Charts
            donations={stats.recentDonations}
            expensesByCategory={stats.expensesByCategory}
            totalDonations={stats.totalDonations}
          />
        )}

        {/* Active Projects */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Active Outposts</h3>
            <Link
              href="/admin/projects"
              className="text-xs font-bold text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
            >
              See all &rarr;
            </Link>
          </div>
          {stats.activeProjects > 0 ? (
            <p className="text-sm text-slate-500">
              {stats.activeProjects} active project{stats.activeProjects !== 1 ? 's' : ''} across Zomba.
            </p>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-100">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-400">
                <Activity className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-xs text-slate-400 font-medium italic">
                No active projects at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
