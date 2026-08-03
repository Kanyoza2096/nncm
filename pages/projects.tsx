// pages/projects.tsx
// ============================================================================
// NNCM Church Portal — Church Projects
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'motion/react'
import { MapPin, ArrowRight, HeartHandshake } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { Project } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface ProjectsPageProps {
  projects: Project[]
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

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  const client = createBuildClient()

  const [projectsResult, settingsResult] = await Promise.allSettled([
    fetchProjects(client),
    fetchOrgName(client),
  ])

  return {
    props: {
      projects: projectsResult.status === 'fulfilled' ? projectsResult.value : [],
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchProjects(client: ReturnType<typeof createClient>): Promise<Project[]> {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[Build] Projects fetch failed:', error.message)
    return []
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    ...item,
    budget: Number(item.budget) || 0,
    raised: Number(item.raised) || 0,
    createdAt: item.created_at ? Number(item.created_at) : Date.now(),
  })) as Project[]
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
// HELPERS
// ============================================================================

function calculateProgress(budget: number, raised: number): number {
  if (!budget || budget <= 0) return 0
  return Math.min(100, Math.round((raised / budget) * 100))
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ProjectsPage({ projects, settings }: ProjectsPageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Church Projects — {settings.orgName}</title>
        <meta
          name="description"
          content={`Explore the ongoing sanctuary building projects and community outreaches of ${settings.orgName} across Malawi.`}
        />
        <meta name="keywords" content="church projects, sanctuary building, community outreach, NNCM, Zomba, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Church Projects — ${settings.orgName}`} />
        <meta property="og:description" content={`Strategic sanctuary builds and community welfare outreaches by ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/projects`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Church Projects — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Strategic sanctuary builds and community outreaches.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `Church Projects — ${settings.orgName}`,
              url: `${siteUrl}/projects`,
              description: `Ongoing sanctuary and community projects by ${settings.orgName}.`,
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
              Kingdom Advancement
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-3">
              Our Core Projects
            </h1>
            <p className="text-slate-500 font-light text-sm">
              Strategic sanctuary builds and community welfare outreaches across Malawi.
            </p>
          </header>

          {/* Empty State */}
          {projects.length === 0 ? (
            <div className="max-w-md mx-auto py-16 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="font-extrabold text-slate-900 text-lg">No Active Projects</h2>
              <p className="text-slate-500 text-xs font-light mt-2 leading-relaxed">
                There are no active kingdom advancement projects listed at the moment. Please check
                back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, idx) => {
                const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : (project.budget || 0)
                const raised = typeof project.raised === 'string' ? parseFloat(project.raised) : (project.raised || 0)
                const progress = calculateProgress(budget, raised)

                return (
                  <motion.article
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={project.id}
                    className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group p-4"
                  >
                    {/* Image */}
                    <div className="h-48 bg-slate-100 rounded-2xl relative overflow-hidden mb-6">
                      <img
                        src={
                          (Array.isArray(project.images) && project.images.length > 0
                            ? getImageUrl(project.images[0])
                            : null) ||
                          'https://images.unsplash.com/photo-1541963463532-d68292c34b19'
                        }
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {project.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-2 pb-2">
                      <h2 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h2>

                      {project.location && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mt-1.5 mb-4 uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                          {project.location}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-4 pt-4 border-t border-slate-50">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Progress
                          </span>
                          <span className="text-xs font-black text-indigo-600">{progress}%</span>
                        </div>
                        <div
                          className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${progress}% funded`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${progress}%` }}
                            viewport={{ once: true }}
                            className="h-full bg-indigo-600"
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Total Goal</span>
                          <span className="text-slate-900">MWK {budget.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-8">
                        <Link
                          href={`/projects/${project.id}`}
                          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          View Scope
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
