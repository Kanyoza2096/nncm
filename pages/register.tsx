// pages/register.tsx
// ============================================================================
// NNCM Church Portal — Member Registration
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  CheckCircle2,
  MapPin,
  Users,
  Fingerprint,
  QrCode,
  Sparkles,
  User,
  Mail,
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'
import { generateUUID } from '@/lib/id-utils'

// ============================================================================
// TYPES
// ============================================================================

interface SanctuaryPass {
  vid: string
  name: string
  group: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHURCH_GROUPS = [
  "Youths",
  "Women's Fellowship",
  "Men's Fellowship",
  "Children's Ministry",
  'General Congregation',
] as const

const FEATURES = [
  { icon: MapPin, text: 'Zomba District Wings' },
  { icon: Users, text: 'Cell Discipleship' },
  { icon: Fingerprint, text: 'Departmental Rosters' },
] as const

// ============================================================================
// HELPERS
// ============================================================================

function getRecommendedGroup(age: number, gender: string): string {
  if (age <= 12) return "Children's Ministry"
  if (age > 12 && age <= 35) return 'Youths'
  if (gender === 'female') return "Women's Fellowship"
  if (gender === 'male') return "Men's Fellowship"
  return 'General Congregation'
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

const churchName = 'New Nature In Christ Ministry'

export default function MemberRegistrationPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male')
  const [age, setAge] = useState('25')
  const [churchGroup, setChurchGroup] = useState<string>(CHURCH_GROUPS[0])
  const [saving, setSaving] = useState(false)
  const [pass, setPass] = useState<SanctuaryPass | null>(null)

  const handleGenderChange = (genderVal: 'male' | 'female' | 'other') => {
    setGender(genderVal)
    const recommended = getRecommendedGroup(Number(age) || 25, genderVal)
    setChurchGroup(recommended)
  }

  const handleAgeChange = (ageVal: string) => {
    setAge(ageVal)
    const recommended = getRecommendedGroup(Number(ageVal) || 25, gender)
    setChurchGroup(recommended)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const vid = generateUUID()

      const { churchService } = await import('@/services/churchService')
      const { beneficiaryService } = await import('@/services/beneficiaries')

      // Create member profile
      await churchService.members.createOrUpdate(vid, {
        name,
        email,
        phone,
        familyGroup: 'General Congregation',
        joinedMinistries: [
          churchGroup === 'Youths'
            ? 'min-youth'
            : churchGroup === "Women's Fellowship"
              ? 'min-women'
              : churchGroup === "Men's Fellowship"
                ? 'min-men'
                : 'min-children',
        ],
      })

      // Add to central beneficiary database
      await beneficiaryService.addBeneficiary({
        name,
        email,
        phone,
        gender,
        age: Number(age) || 25,
        dob: `${new Date().getFullYear() - (Number(age) || 25)}-01-01`,
        location: 'Zomba DMC Campus',
        address: 'General Town Area',
        maritalStatus: 'single',
        childrenCount: 0,
        occupation: 'Congregant',
        status: 'active',
        category: 'Local Resident',
        churchGroup,
        createdAt: Date.now(),
      })

      setPass({ vid, name, group: churchGroup })
      toast.success(`Welcome to the family, ${name}! Your Sanctuary Pass is ready.`)
    } catch {
      toast.error('Failed to establish registry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Membership Registration — {churchName}</title>
        <meta
          name="description"
          content={`Join the family at ${churchName}. Register as an official member, select your division, and connect with a fellowship branch in Zomba, Malawi.`}
        />
        <meta name="keywords" content="membership, registration, join church, NNCM, Zomba, Malawi" />

        {/* Open Graph */}
        <meta property="og:title" content={`Membership Registration — ${churchName}`} />
        <meta property="og:description" content={`Register as a member of ${churchName} in Zomba, Malawi.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/register`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={churchName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Membership Registration — ${churchName}`} />
        <meta name="twitter:description" content={`Register as a member of ${churchName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: `Membership Registration — ${churchName}`,
              url: `${siteUrl}/register`,
              description: `Official membership registration for ${churchName}.`,
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <header className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
              The Tabernacle Gates
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1">Saints Registry</h1>
            <p className="text-slate-400 font-light text-sm mt-2">
              Sign up as an official member, select your division, and generate your secure entry
              pass.
            </p>
          </header>

          {/* Form Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {!pass ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-2.5 mb-8 border-b border-indigo-50 pb-4">
                    <Sparkles className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                    <h2 className="text-xl font-black text-slate-900">Family Registry Entrance</h2>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-name"
                          className="text-[10px] uppercase font-black text-slate-400 tracking-wider"
                        >
                          Your Full Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"
                            aria-hidden="true"
                          />
                          <input
                            id="reg-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Samuel Phiri"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-email"
                          className="text-[10px] uppercase font-black text-slate-400 tracking-wider"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail
                            className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"
                            aria-hidden="true"
                          />
                          <input
                            id="reg-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="samuel@example.com"
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-phone"
                          className="text-[10px] uppercase font-black text-slate-400 tracking-wider"
                        >
                          WhatsApp / Phone
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"
                            aria-hidden="true"
                          />
                          <input
                            id="reg-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+265..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Age */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-age"
                          className="text-[10px] uppercase font-black text-slate-400 tracking-wider"
                        >
                          Age
                        </label>
                        <input
                          id="reg-age"
                          type="number"
                          required
                          min={1}
                          max={120}
                          value={age}
                          onChange={(e) => handleAgeChange(e.target.value)}
                          placeholder="e.g. 25"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-gender"
                          className="text-[10px] uppercase font-black text-slate-400 tracking-wider"
                        >
                          Gender
                        </label>
                        <select
                          id="reg-gender"
                          value={gender}
                          onChange={(e) => handleGenderChange(e.target.value as 'male' | 'female' | 'other')}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Church Group */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-group"
                          className="text-[10px] uppercase font-black text-indigo-600 tracking-wider"
                        >
                          Church Demographic Division
                        </label>
                        <select
                          id="reg-group"
                          value={churchGroup}
                          onChange={(e) => setChurchGroup(e.target.value)}
                          className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                        >
                          <option value="Youths">Youths (Ages 13-35)</option>
                          <option value="Women's Fellowship">Women&apos;s Fellowship</option>
                          <option value="Men's Fellowship">Men&apos;s Fellowship</option>
                          <option value="Children's Ministry">Children&apos;s Ministry (Ages 0-12)</option>
                          <option value="General Congregation">General Congregation</option>
                        </select>
                      </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 font-medium">
                      💡 <strong>Smart division pairing:</strong> The system automatically suggests
                      the optimal church group based on your age and gender details. You may override
                      this if you wish to join a different fellowship wing.
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-widest rounded-xl active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                    >
                      {saving ? 'Registering details in ledger...' : 'Register & Generate Sanctuary Pass'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="card"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-8"
                >
                  <div
                    className="w-16 h-16 bg-indigo-50 border-2 border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600"
                    aria-hidden="true"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-950 capitalize">
                      {pass.name}&apos;s Sanctuary Pass
                    </h2>
                    <p className="text-xs text-indigo-600 font-bold mt-1 uppercase tracking-wider">
                      Assigned to: {pass.group}
                    </p>
                  </div>

                  {/* Sanctuary Pass Card */}
                  <div className="max-w-xs mx-auto bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl text-left font-mono text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-600/5" aria-hidden="true" />
                    <div className="flex justify-between border-b border-slate-800 pb-4 mb-5 relative z-10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">
                        NNCM Official pass
                      </span>
                      <Fingerprint className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div>
                        <span className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter block">
                          Member UID
                        </span>
                        <p className="text-xs font-black tracking-tight">{pass.vid.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter block">
                          Assigned Guild
                        </span>
                        <p className="text-xs font-bold text-indigo-300">{pass.group}</p>
                      </div>
                      <div className="bg-white p-3 rounded-2xl flex justify-center border border-indigo-900/40">
                        <QrCode className="w-20 h-20 text-slate-950" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 relative z-10 flex justify-between items-center text-[7px] uppercase font-black tracking-widest text-slate-500">
                      <span>Check-in ready</span>
                      <span className="text-indigo-400">DMC Campus</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPass(null)}
                    className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-indigo-100 hover:border-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                  >
                    Begin another registration
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feature Icons */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {FEATURES.map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-2">
                <item.icon className="w-5 h-5 text-indigo-300" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
