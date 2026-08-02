// pages/ministries.tsx
// ============================================================================
// NNCM Church Portal — Ministries Directory
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion } from 'motion/react'
import { Users, Mail, Compass } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import type { MinistryGroup } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface MinistriesPageProps {
  ministries: MinistryGroup[]
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

export const getStaticProps: GetStaticProps<MinistriesPageProps> = async () => {
  const client = createBuildClient()

  const [ministriesResult, settingsResult] = await Promise.allSettled([
    fetchMinistries(client),
    fetchOrgName(client),
  ])

  return {
    props: {
      ministries: ministriesResult.status === 'fulfilled' ? ministriesResult.value : [],
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchMinistries(client: ReturnType<typeof createClient>): Promise<MinistryGroup[]> {
  const { data, error } = await client
    .from('ministries')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.warn('[Build] Ministries fetch failed:', error.message)
    return []
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    membersCount: Number(item.members_count) || Number(item.membersCount) || 0,
    leaders: Array.isArray(item.leaders) ? item.leaders : [],
    featuredImage: (item.featured_image as string) || (item.featuredImage as string) || '',
    contactEmail: (item.contact_email as string) || (item.contactEmail as string) || '',
  })) as MinistryGroup[]
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
// PAGE COMPONENT
// ============================================================================

export default function MinistriesPage({ ministries: initialMinistries, settings }: MinistriesPageProps) {
  const [ministries, setMinistries] = useState(initialMinistries)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const handleJoinMinistry = async (ministry: MinistryGroup) => {
    setJoiningId(ministry.id)

    try {
      const { churchService } = await import('@/services/churchService')
      await churchService.ministries.updateCount(ministry.id, 1)

      setMinistries((prev) =>
        prev.map((item) =>
          item.id === ministry.id
            ? { ...item, membersCount: (item.membersCount || 0) + 1 }
            : item
        )
      )

      toast.success(`Interest registered for ${ministry.name}! We will contact you soon.`)
    } catch {
      toast.error('Could not register your interest. Please try again.')
    } finally {
      setJoiningId(null)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Ministries — {settings.orgName}</title>
        <meta
          name="description"
          content={`Find a place to serve and grow at ${settings.orgName}. Explore our ministries including Music, Youth, Children, and Compassion Outreach in Zomba, Malawi.`}
        />
        <meta
          name="keywords"
          content="ministries, church departments, youth group, choir, outreach, NNCM, Zomba"
        />

        {/* Open Graph */}
        <meta property="og:title" content={`Ministries — ${settings.orgName}`} />
        <meta property="og:description" content={`Explore ministries and find your place to serve at ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/ministries`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Ministries — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Explore ministries at ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `Ministries — ${settings.orgName}`,
              url: `${siteUrl}/ministries`,
              description: `Church ministries and departments at ${settings.orgName}.`,
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
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
              The Pillars of Assembly
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-3">
              Our Ministries
            </h1>
            <p className="text-slate-400 font-light text-sm">
              Discover specialized departments designed for spiritual growth and community actions.
            </p>
          </header>

          {/* Empty State */}
          {ministries.length === 0 ? (
            <div className="max-w-md mx-auto py-16 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-extrabold text-slate-900 text-lg">No Active Ministries</h2>
              <p className="text-slate-500 text-xs font-light mt-2 leading-relaxed">
                There are no church ministries registered in our registry right now. Check back
                soon or contact support to establish a new group.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministries.map((ministry, index) => (
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={ministry.id}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Featured Image */}
                    <div className="h-44 bg-slate-900 relative shrink-0">
                      <img
                        src={ministry.featuredImage || 'https://images.unsplash.com/photo-1504052434569-70ad083e0b77?auto=format&fit=crop&w=600&q=80'}
                        alt={ministry.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow">
                        Active Network
                      </div>
                    </div>

                    <div className="p-7">
                      <h2 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                        {ministry.name}
                      </h2>
                      <p className="text-xs text-slate-500 leading-relaxed font-light mt-3 line-clamp-3">
                        {ministry.description}
                      </p>

                      <div className="mt-6 pt-5 border-t border-slate-50 space-y-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {ministry.leaders && ministry.leaders.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                            Leads:{' '}
                            <span className="text-slate-700 font-black">
                              {ministry.leaders.slice(0, 2).join(', ')}
                            </span>
                          </div>
                        )}
                        {ministry.contactEmail && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                            <a
                              href={`mailto:${ministry.contactEmail}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {ministry.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <div className="p-7 pt-0 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-indigo-600 font-extrabold flex items-center gap-1.5">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      {ministry.membersCount} saints
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJoinMinistry(ministry)}
                      disabled={!!joiningId}
                      className="px-5 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-extrabold rounded-xl text-[11px] uppercase transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {joiningId === ministry.id ? 'Wait...' : 'Join Now'}
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
