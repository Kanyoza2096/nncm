// pages/leadership.tsx
// ============================================================================
// NNCM Church Portal — Leadership & Pastoral Team
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion } from 'motion/react'
import {
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { User as UserType } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface TeamLeader {
  id: string
  name: string
  role: string
  photoURL: string
  whatsapp?: string
  email?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
}

interface LeadershipPageProps {
  seniorPastor: {
    name: string
    role: string
    bio: string
    image: string
    email: string
    whatsapp: string
  }
  teamMembers: TeamLeader[]
  settings: {
    orgName: string
    orgAddress: string
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

function fromDB(obj: Record<string, unknown>): Record<string, unknown> {
  const reverse: Record<string, string> = {
    photo_url: 'photoURL',
    created_at: 'createdAt',
    org_name: 'orgName',
    organization_name: 'organizationName',
    director_name: 'directorName',
    director_role: 'directorRole',
    director_bio: 'directorBio',
    director_image: 'directorImage',
    director_email: 'directorEmail',
    director_whatsapp: 'directorWhatsApp',
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

export const getStaticProps: GetStaticProps<LeadershipPageProps> = async () => {
  const client = createBuildClient()

  const [teamResult, settingsResult] = await Promise.allSettled([
    fetchTeamMembers(client),
    fetchSettings(client),
  ])

  const settings = settingsResult.status === 'fulfilled'
    ? settingsResult.value
    : {
        orgName: 'New Nature In Christ Ministry',
        orgAddress: 'Zomba, Malawi',
        seniorPastor: {
          name: 'Pastor Richie Mkandawire',
          role: 'Senior Pastor & Founder',
          bio: 'Pastor Richie founded the ministry with a burning desire to see lives transformed by the power of the Holy Spirit.',
          image: '',
          email: 'richiefa88@gmail.com',
          whatsapp: '+265882404093',
        },
      }

  return {
    props: {
      seniorPastor: settings.seniorPastor,
      teamMembers: teamResult.status === 'fulfilled' ? teamResult.value : [],
      settings: {
        orgName: settings.orgName,
        orgAddress: settings.orgAddress,
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchTeamMembers(
  client: any
): Promise<TeamLeader[]> {
  const { data, error } = await client
    .from('users')
    .select('*')
    .in('role', ['pastor', 'ministry_leader', 'readership', 'elder', 'deacon', 'admin', 'super_admin'])
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) {
    console.warn('[Build] Team members fetch failed:', error.message)
    return []
  }

  return (data || [])
    .map((item) => {
      const mapped = fromDB(item as Record<string, unknown>)
      return {
        id: (mapped.id as string) || '',
        name: (mapped.name as string) || '',
        role: ((mapped.role as string) || 'volunteer')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        photoURL: (mapped.photoURL as string) || '',
        whatsapp: (mapped.whatsapp as string) || '',
        email: (mapped.email as string) || '',
        facebook: (mapped.facebook as string) || '',
        twitter: (mapped.twitter as string) || '',
        linkedin: (mapped.linkedin as string) || '',
        instagram: (mapped.instagram as string) || '',
      } as TeamLeader
    })
    // Exclude the senior pastor from the team grid
    .filter((member) => member.role.toLowerCase() !== 'pastor' || member.name.toLowerCase().includes('mkandawire') === false)
}

async function fetchSettings(client: any) {
  const defaults = {
    orgName: 'New Nature In Christ Ministry',
    orgAddress: 'Zomba, Malawi',
    seniorPastor: {
      name: 'Pastor Richie Mkandawire',
      role: 'Senior Pastor & Founder',
      bio: 'Pastor Richie founded the ministry with a burning desire to see lives transformed by the power of the Holy Spirit.',
      image: '',
      email: 'richiefa88@gmail.com',
      whatsapp: '+265882404093',
    },
  }

  try {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) return defaults

    const item = fromDB(data as Record<string, unknown>)

    // Parse orgAbout for leadership JSON
    let directorName = defaults.seniorPastor.name
    let directorRole = defaults.seniorPastor.role
    let directorBio = defaults.seniorPastor.bio
    let directorImage = defaults.seniorPastor.image
    let directorEmail = defaults.seniorPastor.email
    let directorWhatsapp = defaults.seniorPastor.whatsapp

    const rawAbout = (item.orgAbout as string) || ''
    if (rawAbout) {
      try {
        const trimmed = rawAbout.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const parsed = JSON.parse(trimmed)
          directorName = parsed.directorName || directorName
          directorRole = parsed.directorRole || directorRole
          directorBio = parsed.directorBio || parsed.directorQuote || directorBio
          directorImage = parsed.directorImage || directorImage
          directorEmail = parsed.directorEmail || directorEmail
          directorWhatsapp = parsed.directorWhatsApp || directorWhatsapp
        }
      } catch {
        // Not JSON — use defaults
      }
    }

    return {
      orgName: (item.organizationName as string) || (item.orgName as string) || defaults.orgName,
      orgAddress: (item.address as string) || (item.orgAddress as string) || defaults.orgAddress,
      seniorPastor: {
        name: directorName,
        role: directorRole,
        bio: directorBio,
        image: directorImage,
        email: directorEmail,
        whatsapp: directorWhatsapp,
      },
    }
  } catch {
    return defaults
  }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function LeadershipPage({
  seniorPastor,
  teamMembers,
  settings,
}: LeadershipPageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Leadership & Pastoral Team — {settings.orgName}</title>
        <meta
          name="description"
          content={`Meet the pastoral team and oversight board of ${settings.orgName} in ${settings.orgAddress}. Led by ${seniorPastor.name}, ${seniorPastor.role}.`}
        />
        <meta name="keywords" content="leadership, pastors, elders, church board, NNCM, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Leadership & Pastoral Team — ${settings.orgName}`} />
        <meta
          property="og:description"
          content={`Meet ${seniorPastor.name} and the leadership team at ${settings.orgName}.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/leadership`} />
        {seniorPastor.image && <meta property="og:image" content={getImageUrl(seniorPastor.image)} />}
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Leadership & Pastoral Team — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Meet the leadership team at ${settings.orgName}.`} />
        {seniorPastor.image && (
          <meta name="twitter:image" content={getImageUrl(seniorPastor.image)} />
        )}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Leadership & Pastoral Team — ${settings.orgName}`,
              url: `${siteUrl}/leadership`,
              description: `Pastoral and leadership team of ${settings.orgName}.`,
              about: {
                '@type': 'Church',
                name: settings.orgName,
                founder: {
                  '@type': 'Person',
                  name: seniorPastor.name,
                  jobTitle: seniorPastor.role,
                },
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
          <header className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-4"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              Spiritual Pillars & Governance
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
              Our Pastoral & Leadership Team
            </h1>
            <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
              Called by God, tested in faith, and dedicated to the spiritual shepherdhood of lives
              in {settings.orgAddress}.
            </p>
          </header>

          {/* Senior Pastor Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
          >
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-50 bg-slate-50 mb-6">
                {seniorPastor.image ? (
                  <img
                    src={getImageUrl(seniorPastor.image)}
                    alt={seniorPastor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-6xl font-black"
                    aria-hidden="true"
                  >
                    {seniorPastor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {seniorPastor.role}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                  {seniorPastor.name}
                </h2>
                <p className="text-sm font-semibold text-indigo-600 mt-1 uppercase tracking-wider">
                  Visionary Lead
                </p>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                {seniorPastor.bio}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <a
                  href={`mailto:${seniorPastor.email}`}
                  className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Message Pastor
                </a>
                <a
                  href={`https://wa.me/${seniorPastor.whatsapp?.replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  WhatsApp Counsel
                </a>
              </div>
            </div>
          </motion.div>

          {/* Team Members Grid */}
          {teamMembers.length > 0 && (
            <section aria-labelledby="team-heading" className="space-y-12">
              <div className="text-center">
                <h2 id="team-heading" className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-slate-200" aria-hidden="true" />
                  Regional Oversight & Ministry Leaders
                  <span className="h-px w-8 bg-slate-200" aria-hidden="true" />
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {teamMembers.map((member, index) => (
                  <motion.article
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow text-center flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500 bg-slate-50">
                        {member.photoURL ? (
                          <img
                            src={
                              member.photoURL.startsWith('http')
                                ? member.photoURL
                                : getImageUrl(member.photoURL)
                            }
                            alt={member.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"
                            aria-hidden="true"
                          >
                            <User className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-950 leading-tight group-hover:text-indigo-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-widest mt-1">
                        {member.role}
                      </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-50">
                      {member.whatsapp && (
                        <a
                          href={`https://wa.me/${member.whatsapp.replace(/\+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          aria-label={`WhatsApp ${member.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          title="Email"
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Facebook"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label={`Facebook profile of ${member.name}`}
                        >
                          <Facebook className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Twitter / X"
                          className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                          aria-label={`Twitter profile of ${member.name}`}
                        >
                          <Twitter className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Instagram"
                          className="p-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
                          aria-label={`Instagram profile of ${member.name}`}
                        >
                          <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn"
                          className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                          aria-label={`LinkedIn profile of ${member.name}`}
                        >
                          <Linkedin className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
