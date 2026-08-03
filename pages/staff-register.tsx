// pages/staff-register.tsx
// ============================================================================
// NNCM Church Portal — Staff Registration
// Next.js static export with SEO and accessibility upgrades.
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
  User,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const churchName = 'New Nature In Christ Ministry'

export default function StaffRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)
  const { register, user } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/admin')
    }
  }, [user, router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return

    setProcessing(true)
    try {
      await register(email, password, name)
      toast.success('Official account established. Welcome to the ministry workforce.')
      router.push('/admin')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failure.'
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Head>
        <title>Staff Registration — {churchName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-10 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back to entry
            </Link>
            <div className="flex justify-center mb-8">
              <div
                className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50"
                aria-hidden="true"
              >
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              Registry Entry
            </h1>
            <p className="text-slate-400 text-sm mt-3 font-light">
              Registering as ministry workforce agent for {churchName}.
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/40"
          >
            <form onSubmit={handleRegister} className="space-y-6" noValidate>
              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="staff-name"
                  className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                >
                  Full Identity Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-3.5 w-4 h-4 text-slate-300"
                    aria-hidden="true"
                  />
                  <input
                    id="staff-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samuel Nkandawire"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="staff-email"
                  className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                >
                  Official Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-3.5 w-4 h-4 text-slate-300"
                    aria-hidden="true"
                  />
                  <input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@nncm.org"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="staff-password"
                  className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1"
                >
                  Security Key (Password)
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-3.5 w-4 h-4 text-slate-300"
                    aria-hidden="true"
                  />
                  <input
                    id="staff-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
              >
                {processing ? (
                  'Establishing Identity...'
                ) : (
                  <>
                    Register Official
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed max-w-[15rem] mx-auto">
                By registering, you agree to uphold the ministry standard and confidentiality
                protocols.
              </p>
            </div>
          </motion.div>

          {/* Role Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <AlertCircle className="w-4 h-4 text-indigo-500" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">
                Role Assigned: Staff
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
