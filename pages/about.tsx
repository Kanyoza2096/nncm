// pages/about.tsx
// ============================================================================
// NNCM Church Portal — About Us Page
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion } from 'motion/react'
import { 
  Heart, 
  BookOpen, 
  Compass, 
  Flame, 
  Target, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Cross 
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

interface AboutPageProps {
  settings: {
    orgName: string
    orgAbout: string
    vision: string
    mission: string
    motto: string
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
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

function fromDB(obj: Record<string, unknown>): Record<string, unknown> {
  const reverse: Record<string, string> = {
    org_name: 'orgName',
    organization_name: 'organizationName',
    org_about: 'orgAbout',
    org_address: 'orgAddress',
    created_at: 'createdAt',
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[reverse[key] || key] = value
  }
  return result
}

// ============================================================================
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<AboutPageProps> = async () => {
  const client = createBuildClient()

  const defaults = {
    orgName: 'New Nature In Christ Ministry',
    orgAbout: 'A Pentecostal church fully relying on the Holy Spirit and His ministration. We preach and teach the word of God and make disciples of Jesus Christ.',
    vision: 'To reach the whole world with the word of Christ Jesus, and systematic preaching and teaching the word of God in the power of the Holy Spirit.',
    mission: 'Preaching and teaching Christ where the name of the Lord has never been heard (Romans 15:20)',
    motto: 'NNC- Christ minded generation',
  }

  try {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      console.warn('[Build] Settings not found, using defaults for About page')
      return {
        props: {
          settings: defaults,
          lastUpdated: new Date().toISOString(),
        },
      }
    }

    const item = fromDB(data)

    // Parse orgAbout — may be JSON
    let aboutText = defaults.orgAbout
    const rawAbout = (item.orgAbout as string) || ''
    if (rawAbout) {
      try {
        const trimmed = rawAbout.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const parsed = JSON.parse(trimmed)
          aboutText = parsed.aboutText || defaults.orgAbout
        } else {
          aboutText = rawAbout
        }
      } catch {
        aboutText = rawAbout
      }
    }

    return {
      props: {
        settings: {
          orgName: (item.organizationName as string) || (item.orgName as string) || defaults.orgName,
          orgAbout: aboutText,
          vision: (item.vision as string) || defaults.vision,
          mission: (item.mission as string) || defaults.mission,
          motto: (item.motto as string) || defaults.motto,
        },
        lastUpdated: new Date().toISOString(),
      },
    }
  } catch (e) {
    console.error('[Build] About page settings fetch failed:', e)
    return {
      props: {
        settings: defaults,
        lastUpdated: new Date().toISOString(),
      },
    }
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CORE_VALUES = [
  {
    num: '1',
    title: 'LOVE',
    scripture: 'Luke 6:27-36, John 13:34-35, Matt 22:34-40',
    description:
      'The essence of our calling is summed up in a single word: LOVE. In a world that has romanticized and sexualized love, the church has a beautiful opportunity to show the love of God Himself.',
  },
  {
    num: '2',
    title: 'PROCLAIM',
    scripture: 'Acts 1:8; Romans 1:16; 2 Corinthians 2:17',
    description:
      'We celebrate that our God is a speaking God who has revealed Himself to us. The Bible is our inspired text, which He will never contradict.',
  },
  {
    num: '3',
    title: 'REACH',
    scripture: 'Matt 24:12-14',
    description:
      'While He who is not willing that any should perish calls us to take His loving message to everyone. Nations are coming to our neighborhoods, this will also be our opportunity.',
  },
  {
    num: '4',
    title: 'LAUNCH',
    scripture: 'Matt 9:35-38; Luke 19; Eph 2:8-10',
    description:
      'To accomplish the call God has given to us, we must see the entire body of Christ mobilized for the kingdom service. May God allow us to Launch new waves of Godly people.',
  },
] as const

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AboutPage({ settings }: AboutPageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>About Us — {settings.orgName}</title>
        <meta
          name="description"
          content={`Learn about the history, core values, vision, and mission of ${settings.orgName}. ${settings.orgAbout.substring(0, 150)}`}
        />
        <meta name="keywords" content="about us, core values, history, NNCM, mission, vision, Malawi church" />

        {/* Open Graph */}
        <meta property="og:title" content={`About Us — ${settings.orgName}`} />
        <meta property="og:description" content={`Discover the vision, mission, and core values of ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`About Us — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Discover the vision, mission, and core values of ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AboutPage',
              name: `About ${settings.orgName}`,
              url: `${siteUrl}/about`,
              description: settings.orgAbout,
              about: {
                '@type': 'Church',
                name: settings.orgName,
                description: settings.motto,
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
          {/* Banner */}
          <header className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100"
            >
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              A Ministry Born of Vision
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
              About Us & Our Purpose
            </h1>
            <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
              Discover our foundational story, doctrinal pillars, core values, and the divine call guiding{' '}
              {settings.orgName}.
            </p>
          </header>

          {/* Purpose Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm"
            >
              <div
                className="p-3 bg-indigo-50 w-fit rounded-xl border border-indigo-100 inline-block mb-6"
                aria-hidden="true"
              >
                <Cross className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-950 mb-4">Our Purpose & Calling</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light mb-4">
                {settings.orgAbout}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#4f46e512,transparent_55%)]" aria-hidden="true" />

              <div className="relative z-10">
                <div
                  className="p-3 bg-white/10 text-amber-300 w-fit rounded-xl border border-white/10 inline-block mb-6"
                  aria-hidden="true"
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-4">Integrity & Excellence</h2>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  We declare and establish this ministry to preserve and protect the principles of our faith, and to
                  uphold the independence of the church in autonomy of action.
                </p>
              </div>

              <div className="relative z-10 border-t border-white/15 pt-6 mt-6 font-mono text-[10px]">
                <span className="text-indigo-400 font-bold uppercase tracking-widest block mb-1">
                  Standard Measure
                </span>
                <p className="text-slate-400">
                  &ldquo;I have been crucified with Christ; it is no longer I who live...&rdquo; — Galatians 2:20
                </p>
              </div>
            </motion.div>
          </div>

          {/* Story & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              {
                title: 'Vision',
                body: settings.vision,
                icon: Target,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
              },
              {
                title: 'Mission',
                body: settings.mission,
                icon: Flame,
                color: 'text-rose-600 bg-rose-50 border-rose-100',
              },
              {
                title: 'Motto',
                body: settings.motto,
                icon: Sparkles,
                color: 'text-amber-600 bg-amber-50 border-amber-100',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`p-2.5 rounded-xl w-fit mb-6 border ${item.color}`}
                  aria-hidden="true"
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light">{item.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Core Values Section */}
          <section aria-labelledby="core-values-heading" className="mb-24">
            <div className="max-w-2xl mb-12 text-center sm:text-left mx-auto sm:ml-0">
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
                The Assembly Pillars
              </span>
              <h2 id="core-values-heading" className="text-3xl font-extrabold text-slate-900 mt-1">
                What We Stand For
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {CORE_VALUES.map((value) => (
                <div
                  key={value.num}
                  className="flex gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:ring-2 ring-indigo-50 transition-all"
                >
                  <div
                    className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 shrink-0 text-sm"
                    aria-hidden="true"
                  >
                    {value.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 mb-1">{value.title}</h3>
                    <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-wider block mb-2">
                      {value.scripture}
                    </span>
                    <p className="text-sm text-slate-500 leading-relaxed font-light">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
