// pages/prayer.tsx
// ============================================================================
// NNCM Church Portal — Prayer Center
// Submit prayer requests and stand in agreement with the congregation.
// ============================================================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Heart,
  HandHeart,
  Sparkles,
  Send,
  User,
  MessageCircle,
  CheckCircle2,
  Flame,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOrgSettings } from '@/hooks/useOrgSettings'
import { churchService } from '@/services/churchService'
import type { PrayerCenterRequest } from '@/types'

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES: PrayerCenterRequest['category'][] = [
  'Healing',
  'Financial Provision',
  'Family',
  'Spiritual Growth',
  'Deliverance',
  'Other',
]

// ============================================================================
// HELPERS
// ============================================================================

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PrayerCenterPage() {
  const { settings } = useOrgSettings()

  // Prayer list state
  const [prayers, setPrayers] = useState<PrayerCenterRequest[]>([])
  const [loadingPrayers, setLoadingPrayers] = useState(true)
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set())

  // Form state
  const [name, setName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [category, setCategory] = useState<PrayerCenterRequest['category']>('Healing')
  const [requestText, setRequestText] = useState('')
  const [isPraiseReport, setIsPraiseReport] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load prayers on mount
  useEffect(() => {
    let cancelled = false
    churchService.prayers.getAll().then((data) => {
      if (!cancelled) {
        setPrayers(data.filter((p) => p.status === 'approved'))
        setLoadingPrayers(false)
      }
    }).catch(() => {
      if (!cancelled) setLoadingPrayers(false)
    })
    return () => { cancelled = true }
  }, [])

  const handlePray = async (id: string) => {
    if (prayedIds.has(id)) return
    setPrayedIds((prev) => new Set([...prev, id]))
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, prayerCount: (p.prayerCount || 0) + 1 } : p))
    )
    try {
      await churchService.prayers.incrementPrayerCount(id)
    } catch {
      // silent — optimistic update already done
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestText.trim()) {
      toast.error('Please write your prayer request.')
      return
    }
    setSubmitting(true)
    try {
      await churchService.prayers.submit({
        name: isAnonymous ? undefined : name.trim() || undefined,
        isAnonymous,
        requestText: requestText.trim(),
        category,
        isPraiseReport,
      })
      setSubmitted(true)
      setName('')
      setRequestText('')
      setIsAnonymous(false)
      setIsPraiseReport(false)
      setCategory('Healing')
      toast.success('Your request has been received. The saints are standing with you!')
      // Refresh list
      const updated = await churchService.prayers.getAll()
      setPrayers(updated.filter((p) => p.status === 'approved'))
      setTimeout(() => setSubmitted(false), 4000)
    } catch {
      toast.error('Could not submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      <Head>
        <title>Prayer Center — {settings.orgName}</title>
        <meta
          name="description"
          content={`Join the ${settings.orgName} prayer wall. Submit your prayer request and let the congregation stand in agreement with you.`}
        />
        <meta name="keywords" content="prayer, prayer requests, intercession, church, NNCM, Zomba, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Prayer Center — ${settings.orgName}`} />
        <meta property="og:description" content="Submit a prayer request and let the congregation agree with you in prayer." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/prayer`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`Prayer Center — ${settings.orgName}`} />
        <meta name="twitter:description" content="Stand in agreement with the congregation in prayer." />
      </Head>

      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="pt-28 pb-16 bg-slate-50 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-100/30 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-6">
              <HandHeart className="w-4 h-4" aria-hidden="true" />
              Prayer Center
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Agree Together<br />
              <span className="text-indigo-600">in Prayer</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl mx-auto">
              Submit a prayer request and let the congregation stand in agreement with you.
              We believe in the power of united intercession — Matthew 18:20.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                      */}
      {/* ================================================================ */}
      <section className="pb-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

            {/* ── SUBMIT FORM ────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm sticky top-28"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Submit a Request</h2>
                    <p className="text-xs text-slate-400 font-medium">We will stand with you</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">Request Received</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        The congregation is standing with you in prayer. Be encouraged!
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      noValidate
                    >
                      {/* Praise Report Toggle */}
                      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <input
                          id="is-praise"
                          type="checkbox"
                          checked={isPraiseReport}
                          onChange={(e) => setIsPraiseReport(e.target.checked)}
                          className="w-4 h-4 rounded accent-amber-500"
                        />
                        <label htmlFor="is-praise" className="text-xs font-bold text-amber-700 cursor-pointer flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                          This is a Praise Report!
                        </label>
                      </div>

                      {/* Category */}
                      <div className="space-y-1.5">
                        <label htmlFor="prayer-category" className="text-[10px] font-black uppercase text-slate-400 tracking-widest block px-1">
                          Category
                        </label>
                        <select
                          id="prayer-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value as PrayerCenterRequest['category'])}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Name */}
                      {!isAnonymous && (
                        <div className="space-y-1.5">
                          <label htmlFor="prayer-name" className="text-[10px] font-black uppercase text-slate-400 tracking-widest block px-1">
                            Your Name <span className="text-slate-300 normal-case">(optional)</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" aria-hidden="true" />
                            <input
                              id="prayer-name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Brother / Sister..."
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Anonymous toggle */}
                      <div className="flex items-center gap-3">
                        <input
                          id="is-anon"
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-4 h-4 rounded accent-indigo-600"
                        />
                        <label htmlFor="is-anon" className="text-xs font-bold text-slate-500 cursor-pointer">
                          Submit anonymously
                        </label>
                      </div>

                      {/* Request text */}
                      <div className="space-y-1.5">
                        <label htmlFor="prayer-text" className="text-[10px] font-black uppercase text-slate-400 tracking-widest block px-1">
                          Your Request <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <MessageCircle className="absolute left-4 top-4 w-4 h-4 text-slate-300" aria-hidden="true" />
                          <textarea
                            id="prayer-text"
                            value={requestText}
                            onChange={(e) => setRequestText(e.target.value)}
                            required
                            rows={5}
                            placeholder="Share what's on your heart..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold resize-none focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !requestText.trim()}
                        className="w-full py-4 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" aria-hidden="true" />
                            Submit Request
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── PRAYER WALL ────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">
                  Prayer Wall
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {prayers.length} request{prayers.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loadingPrayers ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl h-32 animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : prayers.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <HandHeart className="w-12 h-12 mx-auto mb-4 opacity-30" aria-hidden="true" />
                  <p className="font-bold">No prayer requests yet.</p>
                  <p className="text-sm mt-1">Be the first to submit one!</p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                  className="space-y-4"
                >
                  {prayers.map((prayer) => {
                    const hasPrayed = prayedIds.has(prayer.id)
                    return (
                      <motion.article
                        key={prayer.id}
                        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                        className={`bg-white rounded-3xl border p-6 shadow-sm transition-all ${
                          prayer.isPraiseReport
                            ? 'border-amber-100 bg-amber-50/30'
                            : 'border-slate-100'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              prayer.isPraiseReport ? 'bg-amber-100' : 'bg-indigo-50'
                            }`}>
                              {prayer.isPraiseReport
                                ? <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                : <HandHeart className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">
                                {prayer.isAnonymous || !prayer.name ? 'Anonymous Saint' : prayer.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {timeAgo(prayer.createdAt)} · {prayer.category}
                              </p>
                            </div>
                          </div>
                          {prayer.isPraiseReport && (
                            <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                              Praise
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <p className="text-sm text-slate-600 leading-relaxed mb-5 pl-12">
                          {prayer.requestText}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pl-12">
                          <button
                            onClick={() => handlePray(prayer.id)}
                            disabled={hasPrayed}
                            aria-label={hasPrayed ? 'Already praying' : 'I am praying for this'}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                              hasPrayed
                                ? 'bg-indigo-50 text-indigo-600 cursor-default'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            <Flame
                              className={`w-3.5 h-3.5 ${hasPrayed ? 'text-indigo-600' : ''}`}
                              aria-hidden="true"
                            />
                            {hasPrayed ? 'Praying' : "I'm Praying"}
                          </button>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {prayer.prayerCount} praying
                          </span>
                        </div>
                      </motion.article>
                    )
                  })}
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BOTTOM CTA                                                        */}
      {/* ================================================================ */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-900/30 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <HandHeart className="w-12 h-12 text-indigo-400 mx-auto mb-6" aria-hidden="true" />
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">
              Isaiah 40:31
            </h2>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              "But those who hope in the Lord will renew their strength. They will soar on wings like eagles;
              they will run and not grow weary, they will walk and not be faint."
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
