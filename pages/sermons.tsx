// pages/sermons.tsx
// ============================================================================
// NNCM Church Portal — Sermons Library
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState, useCallback } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import {
  Search,
  Download,
  Music,
  Disc,
  Play,
  Volume2,
  Calendar,
  User,
  Headphones,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { Sermon } from '@/types'

// ============================================================================
// DYNAMIC IMPORTS
// ============================================================================

const LightboxModal = dynamic(() => import('@/components/ui/LightboxModal'), {
  ssr: false,
})

// ============================================================================
// TYPES
// ============================================================================

interface SermonsPageProps {
  sermons: Sermon[]
  settings: {
    orgName: string
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

function fromDB(obj: Record<string, unknown>): Record<string, unknown> {
  const reverse: Record<string, string> = {
    created_at: 'createdAt',
    downloads_count: 'downloadsCount',
    cover_image: 'coverImage',
    audio_url: 'audioUrl',
    video_url: 'videoUrl',
    org_name: 'orgName',
    organization_name: 'organizationName',
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[reverse[key] || key] = value
  }
  return result
}

// ============================================================================
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<SermonsPageProps> = async () => {
  const client = createBuildClient()

  // Fetch sermons and settings in parallel
  const [sermonsResult, settingsResult] = await Promise.allSettled([
    fetchSermons(client),
    fetchOrgName(client),
  ])

  if (sermonsResult.status === 'rejected') {
    throw new Error(`Sermons page build failed: ${sermonsResult.reason}`)
  }

  return {
    props: {
      sermons: sermonsResult.value,
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchSermons(client: any): Promise<Sermon[]> {
  const tables = ['sermons', 'nncm_sermons']

  for (const table of tables) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .order('date', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((item) => ({
        ...fromDB(item),
        downloadsCount: Number((item as Record<string, unknown>).downloads_count) || 0,
      })) as Sermon[]
    }
  }

  throw new Error(`No sermons found in tables [${tables.join(', ')}]`)
}

async function fetchOrgName(client: any): Promise<string> {
  try {
    const { data, error } = await client
      .from('settings')
      .select('organization_name, org_name')
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      return (data as Record<string, string>).organization_name ||
             (data as Record<string, string>).org_name ||
             'New Nature In Christ Ministry'
    }
  } catch {
    // Non-critical
  }
  return 'New Nature In Christ Ministry'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES = ['All', 'Sunday Service', 'Midweek Service', 'Youth', 'Crusade'] as const

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function useSermonFilters(sermons: Sermon[]) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const filtered = sermons.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.pastor.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return { search, setSearch, selectedCategory, setSelectedCategory, filtered }
}

function useAudioPlayer() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const play = useCallback(
    (sermonId: string, audioUrl: string) => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ''
      }
      const audio = new Audio(audioUrl)
      audio.onplay = () => setCurrentlyPlaying(sermonId)
      audio.onpause = () => setCurrentlyPlaying(null)
      audio.onended = () => setCurrentlyPlaying(null)
      audio.onerror = () => {
        setCurrentlyPlaying(null)
        toast.error('Audio playback failed.')
      }
      audio.play().catch(() => {
        toast.error('Could not play audio. Please try again.')
      })
      setAudioElement(audio)
    },
    [audioElement]
  )

  const stop = useCallback(() => {
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ''
      setCurrentlyPlaying(null)
      setAudioElement(null)
    }
  }, [audioElement])

  return { currentlyPlaying, play, stop }
}

function useSermonDownloads(initialSermons: Sermon[]) {
  const [sermons, setSermons] = useState(initialSermons)

  const download = useCallback(async (sermon: Sermon) => {
    const toastId = toast.loading(`Preparing MP3: "${sermon.title}"...`)
    try {
      const { churchService } = await import('@/services/churchService')
      await churchService.sermons.incrementDownload(sermon.id)

      setSermons((prev) =>
        prev.map((item) =>
          item.id === sermon.id
            ? { ...item, downloadsCount: (item.downloadsCount || 0) + 1 }
            : item
        )
      )

      const audioUrl =
        !sermon.audioUrl || sermon.audioUrl === '#'
          ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
          : getImageUrl(sermon.audioUrl)

      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${sermon.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Download of "${sermon.title}" completed!`, { id: toastId })
    } catch {
      toast.error('Download failed. Redirecting to audio file...', { id: toastId })
      const audioUrl =
        !sermon.audioUrl || sermon.audioUrl === '#'
          ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
          : getImageUrl(sermon.audioUrl)
      window.open(audioUrl, '_blank')
    }
  }, [])

  return { sermons, download }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function SermonsPage({ sermons: initialSermons, settings }: SermonsPageProps) {
  const { sermons, download } = useSermonDownloads(initialSermons)
  const { search, setSearch, selectedCategory, setSelectedCategory, filtered } =
    useSermonFilters(sermons)
  const audio = useAudioPlayer()
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Sermons Library — {settings.orgName}</title>
        <meta
          name="description"
          content={`Listen and download spiritual audio teachings from ${settings.orgName}. Stream sermons by Pastor Richie Mkandawire and our ministry team in Zomba, Malawi.`}
        />
        <meta name="keywords" content="sermons, audio, mp3, teaching, preaching, Malawi, Zomba, NNCM" />

        {/* Open Graph */}
        <meta property="og:title" content={`Sermons Library — ${settings.orgName}`} />
        <meta property="og:description" content={`Stream and download audio sermons from ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/sermons`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Sermons Library — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Stream and download audio sermons from ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `Sermons Library — ${settings.orgName}`,
              url: `${siteUrl}/sermons`,
              description: `Audio sermon library from ${settings.orgName} in Zomba, Malawi.`,
              about: {
                '@type': 'Church',
                name: settings.orgName,
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
            <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-500 animate-pulse" aria-hidden="true" />
              Spiritual Audios
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950 mt-1 mb-2">
              Sermons Library
            </h1>
            <p className="text-slate-500 font-light text-sm">
              Stream high-quality spiritual messages and download direct MP3 files for offline study.
            </p>
          </header>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-md flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" aria-hidden="true" />
              <label htmlFor="sermon-search" className="sr-only">
                Search sermons
              </label>
              <input
                id="sermon-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by sermon title or preacher..."
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 transition-all font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full md:w-auto" role="group" aria-label="Filter by category">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-50 bg-transparent'
                  }`}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sermons List */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {filtered.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                <Music className="w-12 h-12 text-slate-200 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-400 font-medium">
                  No spiritual audio lessons match your current criteria.
                </p>
              </div>
            ) : (
              filtered.map((sermon) => {
                const isDemo = !sermon.audioUrl || sermon.audioUrl === '#'
                const audioSource = isDemo
                  ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
                  : getImageUrl(sermon.audioUrl)
                const isPlaying = audio.currentlyPlaying === sermon.id

                return (
                  <motion.article
                    key={sermon.id}
                    whileHover={{ y: -2 }}
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row h-auto shadow-sm"
                  >
                    {/* Cover Image */}
                    <div className="w-full sm:w-48 md:w-56 h-48 sm:h-auto shrink-0 relative bg-slate-950 overflow-hidden">
                      <div className="absolute inset-0" aria-hidden="true">
                        <img
                          src={getImageUrl(sermon.coverImage)}
                          alt=""
                          className="w-full h-full object-cover blur-lg scale-110 opacity-40"
                          loading="lazy"
                        />
                      </div>
                      <img
                        src={getImageUrl(sermon.coverImage)}
                        alt={`Cover for sermon: ${sermon.title}`}
                        className="w-full h-full object-contain relative z-10 opacity-90 group-hover:scale-102 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 z-10" aria-hidden="true" />

                      <button
                        type="button"
                        onClick={() => setLightboxImage(getImageUrl(sermon.coverImage))}
                        className="absolute top-3 right-3 bg-slate-950/85 hover:bg-indigo-600 border border-white/20 text-white p-1.5 rounded-full transition-colors z-20 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label={`View full flyer for ${sermon.title}`}
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            {sermon.category}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            <time dateTime={sermon.date}>{sermon.date}</time>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-150" aria-hidden="true">
                              <User className="w-3 text-slate-500" />
                            </div>
                            <span>{sermon.pastor}</span>
                          </div>
                        </div>

                        <h2 className="font-extrabold text-slate-950 text-lg leading-snug tracking-tight line-clamp-2">
                          {sermon.title}
                        </h2>
                      </div>

                      {/* Audio Player */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            if (isPlaying) {
                              audio.stop()
                            } else {
                              audio.play(sermon.id, audioSource)
                            }
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            isPlaying ? 'bg-indigo-600' : 'bg-slate-900 hover:bg-indigo-600'
                          }`}
                          aria-label={isPlaying ? `Stop playing ${sermon.title}` : `Play ${sermon.title}`}
                        >
                          {isPlaying ? (
                            <Disc className="w-5 h-5 animate-spin text-white" aria-hidden="true" />
                          ) : (
                            <Play className="w-4 h-4 fill-white text-white translate-x-0.5" aria-hidden="true" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <audio
                            controls
                            onPlay={() => audio.play(sermon.id, audioSource)}
                            onPause={() => audio.stop()}
                            className="w-full h-8 accent-indigo-600 rounded-lg"
                            src={audioSource}
                            preload="none"
                            aria-label={`Audio player for ${sermon.title}`}
                          >
                            Your browser does not support audio playback.
                          </audio>
                        </div>

                        <div className="flex items-center gap-2 justify-between sm:justify-start">
                          {isPlaying ? (
                            <span className="text-indigo-600 font-extrabold text-[9px] animate-pulse whitespace-nowrap bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                              ● STREAMING
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                              <Headphones className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                              {isDemo ? 'Demo Playback' : 'Audio Playback'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Download */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                          {sermon.downloadsCount} downloads
                        </span>
                        <button
                          type="button"
                          onClick={() => download(sermon)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-indigo-600/15 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          aria-label={`Download MP3 for ${sermon.title}`}
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Download MP3</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                )
              })
            )}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <LightboxModal imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
        )}
      </main>
    </>
  )
}
