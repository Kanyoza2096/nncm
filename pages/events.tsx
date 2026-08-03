// pages/events.tsx
// ============================================================================
// NNCM Church Portal — Events Calendar
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  UserCheck,
  Bell,
  Check,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { ChurchEvent } from '@/types'

// ============================================================================
// DYNAMIC IMPORTS
// ============================================================================

const LightboxModal = dynamic(() => import('@/components/ui/LightboxModal'), {
  ssr: false,
})

// ============================================================================
// TYPES
// ============================================================================

interface EventsPageProps {
  events: ChurchEvent[]
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

// ============================================================================
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<EventsPageProps> = async () => {
  const client = createBuildClient()

  const [eventsResult, settingsResult] = await Promise.allSettled([
    fetchEvents(client),
    fetchSettings(client),
  ])

  return {
    props: {
      events: eventsResult.status === 'fulfilled' ? eventsResult.value : [],
      settings: settingsResult.status === 'fulfilled' ? settingsResult.value : {
        orgName: 'New Nature In Christ Ministry',
        orgAddress: 'Zomba, Malawi',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchEvents(client: any): Promise<ChurchEvent[]> {
  const tables = ['events', 'nncm_events', 'church_events']

  for (const table of tables) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .order('event_date', { ascending: true })

    if (!error && data && data.length > 0) {
      return data.map((item: Record<string, unknown>) => ({
        ...item,
        registeredCount: Number(item.registered_count) || 0,
        registrationOpen: Boolean(item.registration_open),
      })) as ChurchEvent[]
    }
  }

  return []
}

async function fetchSettings(client: any) {
  const defaults = {
    orgName: 'New Nature In Christ Ministry',
    orgAddress: 'Zomba, Malawi',
  }

  try {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error || !data) return defaults

    const item = data as Record<string, string>
    return {
      orgName: item.organization_name || item.org_name || defaults.orgName,
      orgAddress: item.address || item.org_address || defaults.orgAddress,
    }
  } catch {
    return defaults
  }
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.warning('Notifications not supported in this browser.')
      return
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      toast.success('Browser alerts activated!')
      new Notification('Welcome to NNCM! 🎉', {
        body: 'You are now registered to receive Sunday Service and Bible Study push reminders.',
      })
    } else {
      toast.warning('Permission was not granted.')
    }
  }, [])

  return { permission, requestPermission }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function EventsPage({ events: initialEvents, settings }: EventsPageProps) {
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Registration form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [submittingReg, setSubmittingReg] = useState(false)

  const { permission, requestPermission } = useNotificationPermission()

  const handleRegisterClick = (event: ChurchEvent) => {
    setSelectedEvent(event)
    setRegName('')
    setRegEmail('')
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regEmail.trim()) {
      toast.error('Details required!')
      return
    }

    setSubmittingReg(true)
    try {
      if (selectedEvent) {
        const { churchService } = await import('@/services/churchService')
        await churchService.events.register(selectedEvent.id)

        setEvents((prev) =>
          prev.map((item) =>
            item.id === selectedEvent.id
              ? { ...item, registeredCount: (item.registeredCount || 0) + 1 }
              : item
          )
        )
        toast.success(`Registered successfully for ${selectedEvent.title}!`)
        setSelectedEvent(null)
      }
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setSubmittingReg(false)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Events Calendar — {settings.orgName}</title>
        <meta
          name="description"
          content={`Upcoming events, conferences, crusades, and church activities at ${settings.orgName} in ${settings.orgAddress}.`}
        />
        <meta name="keywords" content="church events, activities, conferences, calendar, NNCM, Zomba" />

        {/* Open Graph */}
        <meta property="og:title" content={`Events Calendar — ${settings.orgName}`} />
        <meta property="og:description" content={`Upcoming church events at ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/events`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Events Calendar — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Upcoming church events at ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `Events Calendar — ${settings.orgName}`,
              url: `${siteUrl}/events`,
              description: `Upcoming church events at ${settings.orgName} in ${settings.orgAddress}.`,
              about: {
                '@type': 'Church',
                name: settings.orgName,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Zomba',
                  addressCountry: 'MW',
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
          <header className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">
              Church Gatherings
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-3">
              Conferences & Crusades
            </h1>
            <p className="text-slate-400 font-light text-sm">
              Join us in {settings.orgAddress} for weekly study blocks and seasonal assemblies.
            </p>
          </header>

          {/* Weekly Reminders Banner */}
          <div className="mb-14 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl border border-indigo-500/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -ml-20 -mb-20" aria-hidden="true" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Weekly Sanctuary Reminders
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold mt-3 tracking-tight">
                  Never Miss Sunday Service or Bible Study
                </h2>
                <p className="text-indigo-200/80 font-light text-xs md:text-sm mt-3 leading-relaxed">
                  Stay connected to the body of Christ with automatic recurring reminders. Get
                  notified every <strong>Sunday at 6:00 AM (CAT)</strong> for Sunday Service, and
                  every <strong>Wednesday at 2:00 PM (CAT)</strong> for Bible Study!
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium">
                    <Clock className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                    <span>
                      <strong>Sunday Service:</strong> Sundays 6:00 AM
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium">
                    <Clock className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                    <span>
                      <strong>Bible Study:</strong> Wednesdays 2:00 PM
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto shrink-0 flex flex-col gap-3 min-w-[280px]">
                {permission === 'granted' ? (
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    Live Browser Alerts Active
                  </div>
                ) : (
                  <button
                    onClick={requestPermission}
                    className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs py-3.5 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <Bell className="w-4 h-4 text-indigo-300" aria-hidden="true" />
                    Activate Live Push Reminders
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white border border-slate-100 rounded-3xl border-dashed">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-2" aria-hidden="true" />
              <p className="text-slate-400 font-medium">No public events finalized at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events.map((event) => (
                <motion.article
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  key={event.id}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col sm:flex-row h-full shadow-sm"
                >
                  {/* Image */}
                  <div className="sm:w-2/5 h-64 sm:h-auto shrink-0 relative bg-slate-950 overflow-hidden">
                    <div className="absolute inset-0" aria-hidden="true">
                      <img
                        src={event.image}
                        alt=""
                        className="w-full h-full object-cover blur-lg scale-110 opacity-40"
                        loading="lazy"
                      />
                    </div>
                    <img
                      src={event.image}
                      alt={`Cover for event: ${event.title}`}
                      className="w-full h-full object-contain relative z-10 opacity-95 group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 bg-indigo-600 text-white text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full z-20">
                      {event.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLightboxImage(event.image)}
                      className="absolute top-4 right-4 bg-slate-950/85 hover:bg-indigo-600 border border-white/20 text-white p-1.5 rounded-full transition-colors z-20 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label={`View full flyer for ${event.title}`}
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-extrabold text-slate-950 text-lg leading-tight">
                        {event.title}
                      </h2>
                      <p className="mt-3 text-slate-500 text-xs font-light leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                      <div className="mt-6 space-y-2.5 text-[11px] font-bold">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Calendar className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                          {event.date} &bull; {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-4 h-4" aria-hidden="true" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs text-indigo-600 font-extrabold flex items-center gap-1.5">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        {event.registeredCount} joining
                      </span>
                      {event.registrationOpen && (
                        <button
                          onClick={() => handleRegisterClick(event)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          Register Seat
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Registration Modal */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center"
                onClick={() => setSelectedEvent(null)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-white max-w-sm w-full rounded-3xl p-8 border border-slate-100 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Register for ${selectedEvent.title}`}
                >
                  <h3 className="font-extrabold text-slate-900 text-xl mb-2">
                    Reserve Attendance
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-light">
                    &ldquo;{selectedEvent.title}&rdquo; at DMC Campus Main Sanctuary.
                  </p>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="reg-name" className="sr-only">
                        Full Name
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-email" className="sr-only">
                        Email Address
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-3 text-xs rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                      />
                    </div>
                    <div className="pt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="flex-1 p-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-[11px] uppercase hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReg}
                        className="flex-1 p-3 bg-indigo-600 text-white font-extrabold rounded-xl text-[11px] uppercase flex justify-center items-center gap-1 shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {submittingReg ? (
                          'Wait...'
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" aria-hidden="true" />
                            Confirm
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <LightboxModal imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
        )}
      </main>
    </>
  )
}
