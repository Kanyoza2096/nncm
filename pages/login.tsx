// pages/login.tsx
// ============================================================================
// NNCM Church Portal — Staff Login
// Bug fix: removed getStaticProps (caused hydration mismatch / duplicate render).
// Now uses useOrgSettings() for client-side org data, matching every other page.
// ============================================================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Heart,
  ChevronRight,
  Database,
  Cloud,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgSettings } from '@/hooks/useOrgSettings'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image-utils'

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)
  const { login, user } = useAuth()
  const { settings } = useOrgSettings()
  const router = useRouter()

  // Redirect destination after login — wait for router to be ready
  // so we don't read an empty query object on first render.
  const [from, setFrom] = useState('/admin')

  useEffect(() => {
    if (router.isReady) {
      setFrom((router.query.from as string) || '/admin')
    }
  }, [router.isReady, router.query.from])

  // Redirect if already logged in (only after router is ready to avoid double redirect)
  useEffect(() => {
    if (user && router.isReady) {
      router.replace(from)
    }
  }, [user, router.isReady, from])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setProcessing(true)
    try {
      await login(email, password)
      // Redirect happens automatically via the useEffect above
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed.'
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Head>
        <title>Staff Login — {settings.orgName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-slate-100/40 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-50/40 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="max-w-md w-full relative z-10"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-4 group mb-10 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-2xl p-2"
            >
              {settings.orgLogo ? (
                <img
                  src={getImageUrl(settings.orgLogo)}
                  alt={settings.orgName}
                  className="h-16 w-auto max-w-[220px] object-contain rounded-xl bg-white border border-slate-100 p-1 shadow-md transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" aria-hidden="true" />
                  <div className="relative w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 overflow-hidden border border-slate-100">
                    <Heart className="w-7 h-7 text-indigo-600" aria-hidden="true" />
                  </div>
                </div>
              )}
              <div className="text-left">
                <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                  {settings.orgName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-px w-4 bg-indigo-200" aria-hidden="true" />
                  <span className="text-[10px] uppercase font-black text-indigo-600 tracking-[0.25em]">
                    Administrative Gateway
                  </span>
                </div>
              </div>
            </Link>

            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome Back</h2>
            <p className="text-slate-400 text-sm font-medium">
              Protected resource management for ministry leaders.
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" aria-hidden="true" />

            <form onSubmit={handleLogin} className="space-y-8" noValidate>
              {/* Email */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <label
                    htmlFor="login-email"
                    className="text-[10px] font-black uppercase text-slate-400 tracking-widest"
                  >
                    Authorized Identity
                  </label>
                  <Cloud className="w-3.5 h-3.5 text-slate-200" aria-hidden="true" />
                </div>
                <div className="relative">
                  <Mail
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    disabled={processing}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pastor@nncm.org"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-black uppercase text-slate-400 tracking-widest"
                  >
                    Secure Entry Key
                  </label>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    disabled={processing}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-5 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" aria-hidden="true" />
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      Enter Portal
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <Link
                href="/staff-register"
                className="inline-flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group/link focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
              >
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Need Access?
                </span>
                <div className="h-px w-6 bg-slate-200 group-hover/link:bg-indigo-200 transition-colors" aria-hidden="true" />
                <span className="text-sm font-bold text-slate-500 group-hover/link:text-indigo-600">
                  Register Staff Identity
                </span>
                <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>

          {/* Security Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-col items-center gap-8"
          >
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" aria-hidden="true" /> SECURE
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" aria-hidden="true" />
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4" aria-hidden="true" /> INFRASTRUCTURE
              </span>
              <span className="w-1 h-1 bg-slate-200 rounded-full" aria-hidden="true" />
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> VERIFIED
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative dots */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
      </main>
    </>
  )
}
