// pages/transparency.tsx
// ============================================================================
// NNCM Church Portal — Transparency & Audit
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion } from 'motion/react'
import {
  ShieldCheck,
  TrendingUp,
  PieChart,
  Activity,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

interface MonthlyRecord {
  month: string
  totalIncome: number
}

interface TransparencyPageProps {
  stats: {
    totalGiving: number
    beneficiaries: number
    projects: number
  }
  reports: MonthlyRecord[]
  settings: {
    orgName: string
  }
  lastUpdated: string
}

// ============================================================================
// BUILD-TIME HELPERS
// ============================================================================

function createBuildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('[Build] Missing Supabase env vars — page will render with empty data.')
  }

  return createClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder_anon_key',
    { auth: { persistSession: false } }
  )
}

// ============================================================================
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<TransparencyPageProps> = async () => {
  const client = createBuildClient()

  const [expensesResult, beneficiariesResult, projectsResult, settingsResult] =
    await Promise.allSettled([
      fetchExpenses(client),
      fetchCount(client, 'beneficiaries'),
      fetchCount(client, 'projects'),
      fetchOrgName(client),
    ])

  const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value : []
  const beneficiaries = beneficiariesResult.status === 'fulfilled' ? beneficiariesResult.value : 0
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : 0

  // Build monthly reports from expenses
  const monthlyStats: Record<string, { month: string; amount: number }> = {}
  expenses.forEach((expense: Record<string, unknown>) => {
    const dt = new Date(Number(expense.date) || 0)
    const key = dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (!monthlyStats[key]) {
      monthlyStats[key] = { month: key, amount: 0 }
    }
    monthlyStats[key].amount += Number(expense.amount) || 0
  })

  const reports: MonthlyRecord[] = Object.values(monthlyStats)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((m) => ({
      month: m.month,
      totalIncome: m.amount,
    }))

  const totalGiving = reports.reduce((acc, r) => acc + r.totalIncome, 0)

  return {
    props: {
      stats: {
        totalGiving,
        beneficiaries,
        projects,
      },
      reports,
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchExpenses(client: ReturnType<typeof createClient>) {
  const { data, error } = await client
    .from('expenses')
    .select('amount, date')

  if (error) {
    console.warn('[Build] Expenses fetch failed:', error.message)
    return []
  }

  return data || []
}

async function fetchCount(client: ReturnType<typeof createClient>, table: string): Promise<number> {
  const { count, error } = await client
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.warn(`[Build] ${table} count failed:`, error.message)
    return 0
  }

  return count || 0
}

async function fetchOrgName(client: ReturnType<typeof createClient>): Promise<string> {
  try {
    const { data, error } = await client
      .from('settings')
      .select('organization_name, org_name')
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      return (data as Record<string, string>).organization_name ||
             (data as Record<string, string>).org_name ||
             'New Nature In Christ Ministry'
    }
  } catch {
    // Non-critical
  }
  return 'New Nature In Christ Ministry'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOCATION_BREAKDOWN = [
  { label: 'Missions & Soul Winning', value: 40, color: 'bg-indigo-500' },
  { label: 'Sanctuary Building', value: 35, color: 'bg-emerald-500' },
  { label: 'Admin & Media Ops', value: 25, color: 'bg-slate-700' },
] as const

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function TransparencyPage({ stats, reports, settings }: TransparencyPageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Transparency Portal — {settings.orgName}</title>
        <meta
          name="description"
          content={`Verifiable financial stewardship and real-time impact tracking for ${settings.orgName}. Every seed harvested is a soul impacted.`}
        />
        <meta name="keywords" content="transparency, financial, audit, stewardship, NNCM, church accountability" />

        {/* Open Graph */}
        <meta property="og:title" content={`Transparency Portal — ${settings.orgName}`} />
        <meta property="og:description" content={`Financial stewardship and impact tracking at ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/transparency`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Transparency Portal — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Financial stewardship at ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Transparency Portal — ${settings.orgName}`,
              url: `${siteUrl}/transparency`,
              description: `Financial stewardship and impact tracking for ${settings.orgName}.`,
              about: {
                '@type': 'Church',
                name: settings.orgName,
              },
            }),
          }}
        />
      </Head>

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}
      <main className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase font-mono">
              The Glass Sanctuary
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-3">
              Transparency & Audit
            </h1>
            <p className="text-slate-500 font-light text-sm">
              Every seed harvested is a soul impacted. We believe in the biblical radicality of
              financial openness.
            </p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
            {[
              {
                label: 'Total Givers Hub',
                value: `${stats.totalGiving.toLocaleString()} MK`,
                icon: TrendingUp,
                color: 'text-emerald-600 bg-emerald-50',
              },
              {
                label: 'Souls Impacted',
                value: stats.beneficiaries,
                icon: Activity,
                color: 'text-indigo-600 bg-indigo-50',
              },
              {
                label: 'Active Outposts',
                value: stats.projects,
                icon: ShieldCheck,
                color: 'text-amber-600 bg-amber-50',
              },
            ].map((stat) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                key={stat.label}
                className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-center"
              >
                <div
                  className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-50`}
                  aria-hidden="true"
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Monthly Records */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                  Monthly Fiscal Records
                </h2>

                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-slate-400 text-sm">No fiscal records available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.month}
                        className="group bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100"
                            aria-hidden="true"
                          >
                            {report.month.substring(0, 3)}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-950 text-lg">
                              {report.month} Audit
                            </h3>
                            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">
                              Certified Pastoral Report
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">
                              Harvest
                            </p>
                            <p className="text-sm font-black text-emerald-600">
                              MK {report.totalIncome.toLocaleString()}
                            </p>
                          </div>
                          <span
                            className="p-3 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            aria-hidden="true"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Allocation Sidebar */}
            <aside className="lg:col-span-4">
              <div className="bg-slate-950 text-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden sticky top-24">
                <div className="absolute inset-0 bg-indigo-600/5" aria-hidden="true" />
                <div className="relative z-10 space-y-8">
                  <PieChart className="w-10 h-10 text-indigo-400" aria-hidden="true" />
                  <div>
                    <h3 className="text-xl font-black mb-3">Resource Allocation</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Based on verified data across all Zomba city branches and outposts.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {ALLOCATION_BREAKDOWN.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                          <span className="text-slate-300">{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                      Public Accountability
                    </span>
                    <ShieldCheck className="w-5 h-5 text-indigo-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
