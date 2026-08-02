// pages/volunteer.tsx
// ============================================================================
// NNCM Church Portal — Volunteer / Serve With Us Page
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  HeartHandshake,
  Send,
  Search,
  MapPin,
  Smartphone,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

interface VolunteerPageProps {
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
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

// ============================================================================
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<VolunteerPageProps> = async () => {
  const client = createBuildClient()

  let orgName = 'New Nature In Christ Ministry'

  try {
    const { data, error } = await client
      .from('settings')
      .select('organization_name, org_name')
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      orgName = (data as Record<string, string>).organization_name ||
                (data as Record<string, string>).org_name ||
                orgName
    }
  } catch {
    // Non-critical — use default
  }

  return {
    props: {
      settings: { orgName },
    },
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEPARTMENTS = [
  'Ushering',
  'Choir (NNCM Voices)',
  'Media & Digital',
  'Kids/Youth Workers',
  'Welfare & Compassion',
  'Security & Logistics',
] as const

const BENEFITS = [
  {
    title: 'Training & Equipping',
    description: 'Monthly capacity building sessions for all servants.',
    icon: Users,
  },
  {
    title: 'Spiritual Mentorship',
    description: 'Direct access to pastoral guidance and prayer groups.',
    icon: HeartHandshake,
  },
] as const

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function VolunteerPage({ settings }: VolunteerPageProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0])
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { volunteerService } = await import('@/services/volunteers')
      await volunteerService.registerVolunteer({
        name,
        phone,
        department,
        email: '',
        skills: [],
        availability: 'flexible',
        status: 'active',
        createdAt: Date.now(),
      })

      setSuccess(true)
      toast.success('Your application to serve has been registered!')
    } catch {
      toast.error('Could not submit your application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Serve With Us — {settings.orgName}</title>
        <meta
          name="description"
          content={`Join the ministry volunteer workforce at ${settings.orgName}. Find your place in the choir, ushering, media, or welfare departments in Zomba, Malawi.`}
        />
        <meta name="keywords" content="volunteer, serve, ministry, church service, NNCM, Zomba" />

        {/* Open Graph */}
        <meta property="og:title" content={`Serve With Us — ${settings.orgName}`} />
        <meta property="og:description" content={`Join the volunteer workforce at ${settings.orgName}. Find your place in kingdom service.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/volunteer`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Serve With Us — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Join the volunteer workforce at ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Serve With Us — ${settings.orgName}`,
              url: `${siteUrl}/volunteer`,
              description: `Join the ministry volunteer workforce at ${settings.orgName}.`,
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
              The Levite Workforce
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-3">
              Enlist for Service
            </h1>
            <p className="text-slate-400 font-light text-sm">
              &ldquo;The harvest is plentiful, but the laborers are few.&rdquo; Discover your area of
              kingdom service today.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column — Info */}
            <div className="lg:col-span-6 space-y-10">
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Find Your Spirit-Led Fit
                </h2>
                <p className="text-slate-500 font-light text-sm leading-relaxed">
                  Serving in the house of God is not just a duty; it is an act of spiritual identity.
                  At {settings.orgName}, we empower our workforce with spiritual mentorship and
                  specialized skills training.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BENEFITS.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm"
                  >
                    <div
                      className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl w-fit mb-4"
                      aria-hidden="true"
                    >
                      <benefit.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reach Banner */}
              <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10" aria-hidden="true">
                  <MapPin className="w-32 h-32 scale-150 rotate-12" />
                </div>
                <h3 className="text-xl font-black mb-2 relative z-10">Zomba District Reach</h3>
                <p className="text-indigo-100 text-xs leading-relaxed font-light relative z-10">
                  Our workforce covers the main DMC Campus and mobile evangelical teams visiting
                  village outposts weekly.
                </p>
              </div>
            </div>

            {/* Right Column — Form */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                        Servant Registration
                      </h3>

                      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="volunteer-name"
                            className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                          >
                            Full Legal Name
                          </label>
                          <input
                            id="volunteer-name"
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Samuel Chilwa"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="volunteer-phone"
                            className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                          >
                            WhatsApp / Phone
                          </label>
                          <input
                            id="volunteer-phone"
                            required
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+265..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="volunteer-department"
                            className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                          >
                            Target Department
                          </label>
                          <select
                            id="volunteer-department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          disabled={loading}
                          type="submit"
                          className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                        >
                          {loading ? 'Processing Registry...' : 'Submit Servanthood Intent'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-10 space-y-6"
                    >
                      <div
                        className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-sm"
                        aria-hidden="true"
                      >
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">Enlistment Success!</h3>
                      <p className="text-sm text-slate-500 font-light leading-relaxed max-w-xs mx-auto">
                        Thank you for saying YES to the call. Our departmental head for{' '}
                        <strong>{department}</strong> will reach you via {phone} shortly.
                      </p>
                      <button
                        onClick={() => setSuccess(false)}
                        className="px-8 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
