// pages/give.tsx
// ============================================================================
// NNCM Church Portal — Online Giving & Seeds
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Smartphone,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Building,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================================================
// CONSTANTS
// ============================================================================

const AMOUNT_PRESETS = ['1000', '2500', '5000', '10000', '25000', '50000'] as const

const PAYMENT_CHANNELS = [
  { id: 'Airtel Money', icon: Smartphone },
  { id: 'TNM Mpamba', icon: Smartphone },
  { id: 'International Card', icon: CreditCard },
] as const

const GIVING_CATEGORIES = [
  {
    icon: TrendingUp,
    title: 'Tithes (10%)',
    description: 'Support church administration and pastoral shepherding in Zomba city.',
  },
  {
    icon: Building,
    title: 'Project Seeds',
    description: 'Finance sanctuary construction blocks and community welfare hubs.',
  },
  {
    icon: Users,
    title: 'Missions Seed',
    description: 'Power national evangelism crusades and street soul winning outreaches.',
  },
] as const

interface SeedReceipt {
  ref: string
  amount: number
}

const churchName = 'New Nature In Christ Ministry'

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function GivePage() {
  const [amount, setAmount] = useState('5000')
  const [mode, setMode] = useState<string>(PAYMENT_CHANNELS[0].id)
  const [success, setSuccess] = useState<SeedReceipt | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGiving = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSuccess({
        ref: `NNCM-SEED-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: Number(amount),
      })
      toast.success('Praise the Lord! Your seed has been registered.')
    }, 2000)
  }

  const formatCurrency = (value: number): string => {
    return `MWK ${value.toLocaleString()}`
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Online Giving & Seeds — {churchName}</title>
        <meta
          name="description"
          content={`Partner with ${churchName} securely. Pay tithes, offerings, and partnership seeds online through Airtel Money, TNM Mpamba, or International Card.`}
        />
        <meta name="keywords" content="giving, tithes, offering, seeds, online giving, NNCM, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Online Giving & Seeds — ${churchName}`} />
        <meta property="og:description" content={`Secure online giving for ${churchName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/give`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={churchName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Online Giving & Seeds — ${churchName}`} />
        <meta name="twitter:description" content={`Secure online giving for ${churchName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Online Giving & Seeds — ${churchName}`,
              url: `${siteUrl}/give`,
              description: `Secure online giving portal for ${churchName} in Zomba, Malawi.`,
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
          {/* Header */}
          <header className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
              The Storehouse Gates
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-3">
              Online Tithing & Seeds
            </h1>
            <p className="text-slate-400 font-light text-sm">
              Honor the Lord with your resources through our secure Malawian gateway.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="font-extrabold text-slate-900 text-xl mb-8">
                      Process Giving
                    </h2>

                    <form onSubmit={handleGiving} className="space-y-8" noValidate>
                      {/* Amount Presets */}
                      <fieldset>
                        <legend className="sr-only">Select giving amount</legend>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {AMOUNT_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setAmount(preset)}
                              className={`p-2.5 rounded-xl border text-[10px] font-black tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                amount === preset
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                              }`}
                              aria-pressed={amount === preset}
                            >
                              MK {preset}
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      {/* Custom Amount */}
                      <div className="relative">
                        <label htmlFor="give-amount" className="sr-only">
                          Amount (MWK)
                        </label>
                        <span
                          className="absolute left-4 top-3 text-slate-400 font-bold text-xs"
                          aria-hidden="true"
                        >
                          MWK
                        </span>
                        <input
                          id="give-amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>

                      {/* Payment Channel */}
                      <fieldset>
                        <legend className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block mb-4">
                          Choose Channel
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {PAYMENT_CHANNELS.map((channel) => (
                            <button
                              key={channel.id}
                              type="button"
                              onClick={() => setMode(channel.id)}
                              className={`p-4 border rounded-2xl flex flex-col gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                mode === channel.id
                                  ? 'ring-2 ring-indigo-600 border-transparent shadow'
                                  : 'bg-white border-slate-100 hover:bg-slate-50'
                              }`}
                              aria-pressed={mode === channel.id}
                            >
                              <channel.icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
                              <span className="text-[11px] font-black text-slate-800 text-left">
                                {channel.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl text-xs active:scale-95 transition-all shadow-xl shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                      >
                        {loading ? 'Processing transaction...' : 'Confirm Seed Entry'}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div
                      className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm"
                      aria-hidden="true"
                    >
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Seed Received!</h2>

                    <div className="max-w-xs mx-auto p-6 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3 font-mono text-[10px] text-slate-500 relative">
                      <span className="absolute top-0 right-0 p-4 font-black uppercase text-[7px] text-emerald-600 rotate-12">
                        Verified
                      </span>
                      <p>
                        Ref:{' '}
                        <span className="text-slate-900 font-bold">{success.ref}</span>
                      </p>
                      <p>
                        Amount:{' '}
                        <span className="text-slate-900 font-bold">
                          {formatCurrency(success.amount)}
                        </span>
                      </p>
                      <p>
                        Status:{' '}
                        <span className="text-slate-900 font-bold">Storehouse Ledger Logged</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSuccess(null)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-xl transition active:scale-95 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                    >
                      Submit Another Offering
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info Sidebar */}
            <aside className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
                  <HelpCircle className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  Giving Policy
                </h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Integrity is our hallmark. Every contribution is directly mapped to the{' '}
                  <strong>Church Transparency Ledger</strong> for public audit assurance.
                </p>
              </div>

              {GIVING_CATEGORIES.map((category) => (
                <div
                  key={category.title}
                  className="flex gap-4 items-start p-4 bg-white border border-slate-50 rounded-2xl shadow-sm"
                >
                  <div
                    className="p-2 bg-slate-50 rounded-xl text-indigo-600 border border-slate-100 mt-0.5"
                    aria-hidden="true"
                  >
                    <category.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wide">
                      {category.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-light leading-relaxed mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
