// pages/projects/[id].tsx
// ============================================================================
// NNCM Church Portal — Project Detail Page
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  MapPin,
  Target,
  ShieldCheck,
  Building,
  Heart,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { Project } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface ProjectDetailProps {
  project: Project
  settings: {
    orgName: string
  }
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
// STATIC PATHS — Generate one page per project at build time
// ============================================================================

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createBuildClient()

  try {
    const { data, error } = await client
      .from('projects')
      .select('id')

    if (error || !data) {
      return { paths: [], fallback: false }
    }

    const paths = data.map((item: Record<string, string>) => ({
      params: { id: item.id },
    }))

    return { paths, fallback: false }
  } catch {
    return { paths: [], fallback: false }
  }
}

// ============================================================================
// STATIC PROPS — Fetch single project at build time
// ============================================================================

export const getStaticProps: GetStaticProps<ProjectDetailProps> = async ({ params }) => {
  const client = createBuildClient()
  const id = params?.id as string

  const [projectResult, settingsResult] = await Promise.allSettled([
    fetchProject(client, id),
    fetchOrgName(client),
  ])

  if (projectResult.status === 'rejected' || !projectResult.value) {
    return { notFound: true }
  }

  return {
    props: {
      project: projectResult.value,
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
    },
  }
}

async function fetchProject(
  client: ReturnType<typeof createClient>,
  id: string
): Promise<Project | null> {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    ...(data as Project),
    budget: Number((data as Record<string, unknown>).budget) || 0,
    raised: Number((data as Record<string, unknown>).raised) || 0,
    createdAt: (data as Record<string, unknown>).created_at
      ? Number((data as Record<string, unknown>).created_at)
      : Date.now(),
  } as Project
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

export default function ProjectDetailPage({ project, settings }: ProjectDetailProps) {
  const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : (project.budget || 0)
  const raised = typeof project.raised === 'string' ? parseFloat(project.raised) : (project.raised || 0)
  const progress = calculateProgress(budget, raised)
  const coverImage =
    Array.isArray(project.images) && project.images.length > 0
      ? getImageUrl(project.images[0])
      : null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>{project.title} — {settings.orgName}</title>
        <meta name="description" content={project.description?.substring(0, 160) || ''} />

        {/* Open Graph */}
        <meta property="og:title" content={`${project.title} — ${settings.orgName}`} />
        <meta property="og:description" content={project.description?.substring(0, 160) || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${siteUrl}/projects/${project.id}`} />
        {coverImage && <meta property="og:image" content={coverImage} />}
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} — ${settings.orgName}`} />
        <meta name="twitter:description" content={project.description?.substring(0, 160) || ''} />
        {coverImage && <meta name="twitter:image" content={coverImage} />}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Project',
              name: project.title,
              description: project.description,
              url: `${siteUrl}/projects/${project.id}`,
              ...(coverImage && { image: coverImage }),
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
      <main className="bg-white min-h-screen pt-28 pb-20 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Back Link */}
          <Link
            href="/projects"
            className="inline-flex items-center text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-10 group focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
          >
            <ArrowLeft
              className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
              aria-hidden="true"
            />
            Project Index
          </Link>

          <div className="space-y-12">
            {/* Cover Image */}
            <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl border border-slate-100/50">
              <img
                src={coverImage || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19'}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-8 left-8">
                <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  {project.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left — Description */}
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight mb-4">
                    {project.title}
                  </h1>
                  {project.location && (
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                      {project.location}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    Strategic Scope
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Right — Funding Sidebar */}
              <div className="lg:col-span-5">
                <aside className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm space-y-8 sticky top-24">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Funding Momentum
                      </span>
                      <span className="text-xl font-black text-slate-950">{progress}%</span>
                    </div>
                    <div
                      className="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
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
                        className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
                        Target Goal
                      </p>
                      <p className="font-black text-slate-950 text-lg tracking-tight">
                        MWK {budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">
                        Harvested
                      </p>
                      <p className="font-black text-emerald-600 text-lg tracking-tight">
                        MWK {raised.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/donate"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    <Heart className="w-4 h-4 fill-white" aria-hidden="true" />
                    Partner with a Seed
                  </Link>

                  <div className="space-y-4 pt-4">
                    {[
                      { icon: ShieldCheck, text: 'Verifiable Ledger Entry' },
                      { icon: Building, text: 'Real Estate Asset Growth' },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none"
                      >
                        <item.icon className="w-4 h-4 text-slate-300" aria-hidden="true" />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
