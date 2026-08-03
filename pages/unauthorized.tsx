// pages/unauthorized.tsx
// ============================================================================
// NNCM Church Portal — Unauthorized Access Page (403)
// ============================================================================

import Head from 'next/head'
import Link from 'next/link'
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react'

const churchName = 'New Nature In Christ Ministry'

export default function UnauthorizedPage() {
  return (
    <>
      <Head>
        <title>Access Restricted — {churchName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-[3rem] p-10 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" aria-hidden="true" />

          <div
            className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-100 text-rose-500"
            aria-hidden="true"
          >
            <ShieldAlert className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Access Restricted
          </h1>
          <p className="text-slate-400 font-light text-sm leading-relaxed mb-10">
            Your current credentials do not have the required clearance to access this secure
            sanctuary partition.
          </p>

          <div className="space-y-4">
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-slate-950/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Back to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline pt-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Return to Public Portal
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">
              Security Protocol 403 active
            </span>
          </div>
        </div>
      </main>
    </>
  )
}
