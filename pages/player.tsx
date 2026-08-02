// pages/prayer.tsx
// ============================================================================
// NNCM Church Portal — Prayer Center / Intercessory Altar
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState, useCallback } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Heart,
  Send,
  Users,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import type { PrayerCenterRequest } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface PrayerPageProps {
  prayers: PrayerCenterRequest[]
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

export const getStaticProps: GetStaticProps<PrayerPageProps> = async () => {
  const client = createBuildClient()

  const [prayersResult, settingsResult] = await Promise.allSettled([
    fetchPrayers(client),
    fetchOrgName(client),
  ])

  return {
    props: {
      prayers: prayersResult.status === 'fulfilled' ? prayersResult.value : [],
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchPrayers(client: ReturnType<typeof createClient>): Promise<PrayerCenterRequest[]> {
  const { data, error } = await client
    .from('prayer_requests')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.warn('[Build] Prayer requests fetch failed:', error.message)
    return []
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    prayerCount: Number(item.prayer_count) || 0,
    createdAt: item.created_at ? new Date(item.created_at as string).getTime() : Date.now(),
  })) as PrayerCenterRequest[]
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

const CATEGORIES = ['All', 'Healing', 'Provision', 'Family', 'Deliverance'] as const

const PRAYER_FORM_CATEGORIES = ['Healing', 'Provision', 'Family Restoration', 'Deliverance'] as const

// ============================================================================
// CUSTOM HOOK
// ============================================================================

function usePrayerWall(initialPrayers: PrayerCenterRequest[]) {
  const [prayers, setPrayers] = useState(initialPrayers)

  const refresh = useCallback(async () => {
    try {
      const { churchService } = await import('@/services/churchService')
      const data = await churchService.prayers.getAll()
      setPrayers(data)
    } catch {
      // Silent — keep current state
    }
  }, [])

  const agreePrayer = useCallback(async (id: string) => {
    try {
      const { churchService } = await import('@/services/churchService')
      await churchService.prayers.incrementPrayerCount(id)
      setPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: (p.prayerCount || 0) + 1 } : p))
      )
      toast.success('You have stood in spiritual agreement!')
    } catch {
      toast.error('Could not record your agreement.')
    }
  }, [])

  return { prayers, refresh, agreePrayer }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PrayerCenterPage({ prayers: initialPrayers, settings }: PrayerPageProps) {
  const { prayers, refresh, agreePrayer } = usePrayerWall(initialPrayers)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Form state
  const [formName, setFormName] = useState('')
  const [formText, setFormText] = useState('')
  const [formCategory, setFormCategory] = useState<string>(PRAYER_FORM_CATEGORIES[0])
  const [formAnonymous, setFormAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Filtering
  const filtered = prayers.filter(
    (p) =>
      selectedCategory === 'All' ||
      (p.category && p.category.includes(selectedCategory))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formText.trim()) return

    setSubmitting(true)
    try {
      const { churchService } = await import('@/services/churchService')
      await churchService.prayers.submit({
        name: formAnonymous ? 'Anonymous' : (formName.trim() || 'Guest'),
        isAnonymous: formAnonymous,
        requestText: formText,
        category: formCategory,
        isPraiseReport: false,
      })
      toast.success('Petition submitted to the altar wall.')
      setFormText('')
      setFormName('')
      await refresh()
    } catch {
      toast.error('Submission error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Prayer Altar — {settings.orgName}</title>
        <meta
          name="description"
          content={`Submit prayer requests and praise reports to ${settings.orgName}. Join our community in standing together in faith at the intercessory altar.`}
        />
        <meta name="keywords" content="prayer, intercessory, altar, prayer request, NNCM, Zomba, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Prayer Altar — ${settings.orgName}`} />
        <meta property="og:description" content={`Submit prayer requests and join the intercessory community at ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/prayer`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Prayer Altar — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Submit prayer requests at ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Prayer Altar — ${settings.orgName}`,
              url: `${siteUrl}/prayer`,
              description: `Intercessory prayer wall for ${settings.orgName} in Zomba, Malawi.`,
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
          <header className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
              The Throne of Grace
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-3">
              Intercessory Altar
            </h1>
            <p className="text-slate-500 font-light text-sm">
              &ldquo;If two of you agree on earth concerning anything they ask, it will be done for
              them.&rdquo;
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Submission Form */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl sticky top-24">
              <h2 className="font-extrabold text-slate-900 text-xl mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                Lodge Petition
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="prayer-name" className="sr-only">
                    Your Name
                  </label>
                  <input
                    id="prayer-name"
                    type="text"
                    value={formName}
                    disabled={formAnonymous}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    id="prayer-anonymous"
                    checked={formAnonymous}
                    onChange={(e) => setFormAnonymous(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="prayer-anonymous"
                    className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer"
                  >
                    Submit anonymously
                  </label>
                </div>

                <div>
                  <label htmlFor="prayer-category" className="sr-only">
                    Category
                  </label>
                  <select
                    id="prayer-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                  >
                    {PRAYER_FORM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="prayer-text" className="sr-only">
                    Your Petition
                  </label>
                  <textarea
                    id="prayer-text"
                    rows={4}
                    required
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Describe your request..."
                    className="w-full p-4 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium leading-relaxed resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  {submitting ? 'Submitting...' : 'Send to Altar'}
                </button>
              </form>
            </div>

            {/* Prayer Wall */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Filters */}
              <div
                className="flex flex-wrap gap-1.5 justify-center sm:justify-start"
                role="group"
                aria-label="Filter by category"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Prayer Cards */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                  <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-slate-400 font-medium text-sm">
                    No prayer requests in this category yet. Be the first to submit one.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {filtered.map((prayer) => (
                      <motion.article
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={prayer.id}
                        className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px]"
                              aria-hidden="true"
                            >
                              {prayer.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-slate-900 border-b border-indigo-100 inline-block">
                                {prayer.name || 'Anonymous Petitioner'}
                              </p>
                              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {prayer.category}
                              </span>
                            </div>
                          </div>
                          <span className="p-1 px-2.5 bg-indigo-50/50 rounded-full text-[9px] font-bold text-indigo-600 border border-indigo-100">
                            Live wall
                          </span>
                        </div>

                        <blockquote className="text-xs text-slate-700 leading-relaxed font-light italic p-4 bg-slate-50/50 border border-slate-100 rounded-2xl mb-4">
                          &ldquo;{prayer.requestText}&rdquo;
                        </blockquote>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
                          <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                            {prayer.prayerCount} Standing in Amen
                          </span>

                          <button
                            type="button"
                            onClick={() => agreePrayer(prayer.id)}
                            className="flex items-center gap-1.5 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all font-black text-[10px] uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            aria-label={`Pray for: ${prayer.requestText?.substring(0, 50)}`}
                          >
                            <Heart className="w-4 h-4 fill-emerald-500" aria-hidden="true" />
                            Amen
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
