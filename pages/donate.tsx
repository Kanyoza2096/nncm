// pages/donate.tsx
// ============================================================================
// NNCM Church Portal — Donate / Seed Partnership
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Heart,
  Globe,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================================================
// CONSTANTS
// ============================================================================

const AMOUNT_PRESETS = ['1000', '2500', '5000', '10000', '25000', '50000'] as const

const DONATION_TYPES = [
  'Tithes',
  'Sacrificial Offering',
  'Sanctuary Project',
  'Children Services',
  'Youth Outreach',
] as const

const PAYMENT_METHODS = ['Airtel Money', 'TNM Mpamba', 'Visa / Mastercard'] as const

const TRUST_BADGES = [
  { icon: CheckCircle2, text: 'Authorized 256-bit Secure Encryption' },
  { icon: Clock, text: 'Instant Digital Receipt Issued' },
  { icon: Sparkles, text: 'Biblical Harvest Principles Observed' },
] as const

const churchName = 'New Nature In Christ Ministry'

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function DonatePage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    amount: '5000',
    type: DONATION_TYPES[0],
    notes: '',
  })
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { donorService } = await import('@/services/donors')
      await donorService.createDonation({
        donorName: form.name || 'Anonymous Giver',
        donorEmail: form.email || 'guest@nncm.org',
        amount: Number(form.amount),
        donationType: form.type,
        paymentMethod: method,
        notes: form.notes,
      })

      toast.success('Glory to God! Your seed has been registered.')
      router.push({
        pathname: '/donate/thank-you',
        query: {
          amount: form.amount,
          ref: `NNCM-${Math.floor(Math.random() * 900000)}`,
        },
      })
    } catch {
      toast.error('Transaction failure. Please try again.')
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
        <title>Support Our Mission — {churchName}</title>
        <meta
          name="description"
          content={`Partner with ${churchName} to impact lives through gospel outreach and sanctuary building in Zomba, Malawi. Give securely online.`}
        />
        <meta name="keywords" content="donate, tithes, offering, giving, church donation, NNCM, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Support Our Mission — ${churchName}`} />
        <meta property="og:description" content={`Partner with ${churchName} through secure online giving.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/donate`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={churchName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Support Our Mission — ${churchName}`} />
        <meta name="twitter:description" content={`Secure online giving for ${churchName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Support Our Mission — ${churchName}`,
              url: `${siteUrl}/donate`,
              description: `Secure online giving portal for ${churchName}.`,
              about: {
                '@type': 'Church',
                name: churchName,
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left — Info */}
            <div className="lg:col-span-5 space-y-10">
              <header>
                <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-1 block">
                  Partnership Gateway
                </span>
                <h1 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-none mb-4">
                  Seed Partnership & Stewardship
                </h1>
                <p className="text-slate-500 font-light text-base leading-relaxed">
                  Connect your resources to eternal purposes. Your giving fuels our sanctuary
                  builds, community outreaches, and digital gospel distribution.
                </p>
              </header>

              {/* Impact Card */}
              <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10" aria-hidden="true">
                  <Globe className="w-32 h-32 scale-150 rotate-12" />
                </div>
                <div className="relative z-10 flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Live Secure Channel
                  </span>
                </div>
                <h2 className="text-xl font-black mb-2 relative z-10">Impact Assurance</h2>
                <p className="text-indigo-100 text-xs leading-relaxed font-light relative z-10">
                  All donations are logged into our transparent ledger for real-time accountability
                  and spiritual oversight.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                  Ministry Standard
                </h3>
                {TRUST_BADGES.map((badge) => (
                  <div
                    key={badge.text}
                    className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <badge.icon className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="donor-name"
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                      >
                        Full Giver Name
                      </label>
                      <input
                        id="donor-name"
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Mary Nkandawire"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="donor-email"
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                      >
                        Email (For Receipt)
                      </label>
                      <input
                        id="donor-email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="mary@email.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <fieldset className="space-y-4">
                    <legend className="text-[10px] font-black uppercase text-indigo-600 tracking-widest pl-1">
                      Giving Amount (MWK)
                    </legend>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {AMOUNT_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setForm({ ...form, amount: preset })}
                          className={`p-2.5 rounded-xl border text-[10px] font-black tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            form.amount === preset
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                              : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                          }`}
                          aria-pressed={form.amount === preset}
                        >
                          MK {preset}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="donor-amount" className="sr-only">
                      Custom Amount (MWK)
                    </label>
                    <input
                      id="donor-amount"
                      required
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 text-lg focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </fieldset>

                  {/* Category & Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="donation-type"
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                      >
                        Category
                      </label>
                      <select
                        id="donation-type"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-600"
                      >
                        {DONATION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="payment-method"
                        className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                      >
                        Gateway
                      </label>
                      <select
                        id="payment-method"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-600"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-4 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    {loading ? (
                      'Processing transaction...'
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-white" aria-hidden="true" />
                        Activate Seed Entry
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
