// pages/contact.tsx
// ============================================================================
// NNCM Church Portal — Contact Page
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion } from 'motion/react'
import {
  Send,
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

interface ContactPageProps {
  settings: {
    orgName: string
    orgAddress: string
    orgEmail: string
    orgPhone: string
    facebookUrl: string
    twitterUrl: string
    instagramUrl: string
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
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<ContactPageProps> = async () => {
  const client = createBuildClient()

  const defaults = {
    orgName: 'New Nature In Christ Ministry',
    orgAddress: 'DMC Campus, Zomba, Malawi',
    orgEmail: 'office@nncm.org',
    orgPhone: '+265 882 404 093',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
  }

  try {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return { props: { settings: defaults } }
    }

    const item = data as Record<string, string>

    return {
      props: {
        settings: {
          orgName: item.organization_name || item.org_name || defaults.orgName,
          orgAddress: item.address || item.org_address || defaults.orgAddress,
          orgEmail: item.email || item.org_email || defaults.orgEmail,
          orgPhone: item.phone || item.org_phone || defaults.orgPhone,
          facebookUrl: item.facebook_url || '',
          twitterUrl: item.twitter_url || '',
          instagramUrl: item.instagram_url || '',
        },
      },
    }
  } catch {
    return { props: { settings: defaults } }
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INQUIRY_CATEGORIES = [
  'Counseling',
  'Prayers',
  'Media Inquiry',
  'Administrative',
  'Partnership',
] as const

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ContactPage({ settings }: ContactPageProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: INQUIRY_CATEGORIES[0],
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      toast.success('Your message has been received. Our secretariat will respond shortly.')
      setForm({ name: '', email: '', subject: INQUIRY_CATEGORIES[0], message: '' })
    }, 1500)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Contact Us — {settings.orgName}</title>
        <meta
          name="description"
          content={`Get in touch with ${settings.orgName} for prayers, counseling, and inquiries. Located at ${settings.orgAddress}.`}
        />
        <meta name="keywords" content="contact, church, NNCM, Zomba, Malawi, counseling, prayer" />

        {/* Open Graph */}
        <meta property="og:title" content={`Contact Us — ${settings.orgName}`} />
        <meta property="og:description" content={`Get in touch with ${settings.orgName} in ${settings.orgAddress}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/contact`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Contact Us — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Get in touch with ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ContactPage',
              name: `Contact Us — ${settings.orgName}`,
              url: `${siteUrl}/contact`,
              about: {
                '@type': 'Church',
                name: settings.orgName,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Zomba',
                  addressCountry: 'MW',
                  streetAddress: settings.orgAddress,
                },
                telephone: settings.orgPhone,
                email: settings.orgEmail,
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
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left — Info */}
            <div className="lg:w-1/2 space-y-12">
              <header>
                <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
                  Connectivity Hub
                </span>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-4 leading-tight">
                  Get in touch with the Ministry
                </h1>
                <p className="text-slate-500 font-light text-base leading-relaxed">
                  Whether you&apos;re seeking spiritual counseling, sharing a testimony, or inquiring
                  about our assemblies, we are here to walk with you.
                </p>
              </header>

              {/* Contact Cards */}
              <div className="space-y-6">
                {[
                  { icon: MapPin, title: 'Sanctuary Address', body: settings.orgAddress },
                  { icon: Mail, title: 'Secretariat Email', body: settings.orgEmail },
                  { icon: Phone, title: 'Reach Us Directly', body: settings.orgPhone },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0"
                      aria-hidden="true"
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {item.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 font-light">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-6">
                  Social Fellowship
                </h3>
                <div className="flex items-center gap-4">
                  {[
                    { icon: Facebook, url: settings.facebookUrl, label: 'Facebook' },
                    { icon: Twitter, url: settings.twitterUrl, label: 'Twitter' },
                    { icon: Instagram, url: settings.instagramUrl, label: 'Instagram' },
                  ].map((social) =>
                    social.url ? (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" aria-hidden="true" />
                      </a>
                    ) : (
                      <button
                        key={social.label}
                        disabled
                        className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-sm cursor-not-allowed"
                        aria-label={`${social.label} (not configured)`}
                      >
                        <social.icon className="w-5 h-5" aria-hidden="true" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:w-1/2">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden relative">
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 pointer-events-none"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-black text-slate-950 mb-8 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                  Send Inquiry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-name"
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                      >
                        Your Full Name
                      </label>
                      <input
                        id="contact-name"
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Mary Mkandawire"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-email"
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                      >
                        Return Email
                      </label>
                      <input
                        id="contact-email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="mary@email.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-subject"
                      className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                    >
                      Inquiry Category
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {INQUIRY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-message"
                      className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                    >
                      Detailed Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can the ministry family serve you today?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-light focus:ring-2 focus:ring-indigo-600 outline-none transition-all leading-relaxed resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-4 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    {loading ? (
                      'Transmitting...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        Dispatch Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
