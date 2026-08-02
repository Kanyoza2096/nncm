// pages/donate/thank-you.tsx
// ============================================================================
// NNCM Church Portal — Donation Thank You Page
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'motion/react'
import { CheckCircle2, Share2, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

// ============================================================================
// CONSTANTS
// ============================================================================

const churchName = 'New Nature In Christ Ministry'

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function DonateThankYouPage() {
  const router = useRouter()
  const [receipt, setReceipt] = useState({
    amount: 0,
    ref: 'NNCM-REF',
  })

  useEffect(() => {
    if (router.isReady) {
      const { amount, ref } = router.query
      setReceipt({
        amount: Number(amount) || 0,
        ref: (ref as string) || 'NNCM-REF',
      })
    }
  }, [router.isReady, router.query])

  const handleShare = () => {
    const shareText = `I just supported the work at ${churchName}! Partner with us: ${window.location.origin}/donate`
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Share link copied to clipboard!')
    }).catch(() => {
      toast.error('Could not copy to clipboard.')
    })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Thank You for Giving — {churchName}</title>
        <meta
          name="description"
          content={`We appreciate your partnership with ${churchName}. Your generous seed makes a difference in Zomba, Malawi.`}
        />
        {/* Don't index thank-you pages */}
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph */}
        <meta property="og:title" content={`Thank You for Giving — ${churchName}`} />
        <meta property="og:description" content={`Your seed has been received by ${churchName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/donate/thank-you`} />
        <meta property="og:site_name" content={churchName} />
      </Head>

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}
      <main className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans flex items-center justify-center">
        <div className="max-w-xl w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[3rem] p-8 sm:p-14 shadow-2xl text-center space-y-8 relative overflow-hidden"
          >
            {/* Gradient top bar */}
            <div
              className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-600 to-indigo-800"
              aria-hidden="true"
            />

            {/* Success icon */}
            <div
              className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border-2 border-emerald-100 shadow-sm"
              aria-hidden="true"
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
                Transaction Confirmed
              </span>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                Abundant Harvest!
              </h1>
              <p className="text-slate-500 font-light text-sm leading-relaxed max-w-[20rem] mx-auto">
                We have received your generous seed of{' '}
                <strong className="text-slate-900">
                  MK {receipt.amount.toLocaleString()}
                </strong>
                . A digital receipt has been dispatched to your email.
              </p>
            </div>

            {/* Receipt */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 text-left space-y-3 font-mono text-[10px] text-slate-500 relative">
              <span className="absolute top-4 right-4 p-1 px-2.5 bg-emerald-100 text-emerald-700 font-black rounded-lg text-[8px] uppercase">
                Verified
              </span>
              <p className="flex justify-between">
                Reference:{' '}
                <span className="text-slate-900 font-bold">{receipt.ref}</span>
              </p>
              <p className="flex justify-between">
                Amount Received:{' '}
                <span className="text-slate-900 font-bold">
                  MK {receipt.amount.toLocaleString()}
                </span>
              </p>
              <p className="flex justify-between">
                Designation:{' '}
                <span className="text-slate-900 font-bold">General Sanctuary Ops</span>
              </p>
              <p className="flex justify-between">
                Timestamp:{' '}
                <span className="text-slate-900 font-bold">
                  {new Date().toLocaleString()}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-4">
              <button
                onClick={handleShare}
                className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                Share Impact
              </button>
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
              >
                Return to Home Sanctuary
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              2 Corinthians 9:7 Ministry
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
