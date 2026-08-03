// pages/gallery.tsx
// ============================================================================
// NNCM Church Portal — Photo Gallery
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Maximize2,
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { GalleryImage } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface GalleryPageProps {
  images: GalleryImage[]
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

// ============================================================================
// STATIC GENERATION
// ============================================================================

export const getStaticProps: GetStaticProps<GalleryPageProps> = async () => {
  const client = createBuildClient()

  const [imagesResult, settingsResult] = await Promise.allSettled([
    fetchGallery(client),
    fetchOrgName(client),
  ])

  return {
    props: {
      images: imagesResult.status === 'fulfilled' ? imagesResult.value : [],
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchGallery(client: any): Promise<GalleryImage[]> {
  // Try database tables first (mirrors supabaseService.church.gallery.getAll())
  const candidateTables = ['gallery', 'nncm_gallery', 'gallery_images']

  for (const table of candidateTables) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      return data.map((item: Record<string, unknown>) => ({
        id: (item.id as string) || '',
        url: (item.url as string) || (item.image_url as string) || '',
        title: (item.title as string) || 'Gallery Image',
        category: (item.category as string) || 'Sunday Service',
        description: (item.description as string) || '',
        createdAt: item.created_at
          ? new Date(item.created_at as string).getTime()
          : Date.now(),
      })) as GalleryImage[]
    }
  }

  // Try storage bucket
  try {
    const { data: storageFiles, error: storageError } = await client
      .storage
      .from('attachments')
      .list('gallery', { limit: 100 })

    if (!storageError && storageFiles && storageFiles.length > 0) {
      return storageFiles
        .filter((file) => !file.name.startsWith('.') && file.name !== '.emptyFolderPlaceholder')
        .map((file) => {
          const cleanTitle = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/_\d+$/, '')
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim() || 'Gallery Image'

          return {
            id: file.id || `file-${file.name}`,
            url: `attachments/gallery/${file.name}`,
            title: cleanTitle,
            category: 'Sunday Service',
            description: '',
            createdAt: file.created_at
              ? new Date(file.created_at).getTime()
              : Date.now(),
          } as GalleryImage
        })
    }
  } catch {
    // Storage bucket not accessible
  }

  return []
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
// PAGE COMPONENT
// ============================================================================

export default function GalleryPage({ images, settings }: GalleryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  // Extract unique categories
  const categories = [
    'All',
    ...Array.from(new Set(images.map((img) => img.category || 'Sunday Service'))),
  ]

  const filteredImages =
    selectedCategory === 'All'
      ? images
      : images.filter((img) => (img.category || 'Sunday Service') === selectedCategory)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const navigateLightbox = useCallback(
    (direction: 'next' | 'prev') => {
      if (lightboxIndex === null || filteredImages.length === 0) return

      let newIndex = lightboxIndex
      if (direction === 'next') {
        newIndex = (lightboxIndex + 1) % filteredImages.length
      } else {
        newIndex =
          (lightboxIndex - 1 + filteredImages.length) % filteredImages.length
      }
      setLightboxIndex(newIndex)
    },
    [lightboxIndex, filteredImages]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') navigateLightbox('next')
      if (e.key === 'ArrowLeft') navigateLightbox('prev')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, navigateLightbox, closeLightbox])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Photo Gallery — {settings.orgName}</title>
        <meta
          name="description"
          content={`Explore photos of Sunday services, community outreaches, conferences, and youth ministries at ${settings.orgName} in Zomba, Malawi.`}
        />
        <meta
          name="keywords"
          content="photo gallery, church gallery, NNCM photos, Malawi church pictures, Zomba ministry"
        />

        {/* Open Graph */}
        <meta property="og:title" content={`Photo Gallery — ${settings.orgName}`} />
        <meta property="og:description" content={`Visual documentation of God's grace in action at ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/gallery`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Photo Gallery — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Photos from ${settings.orgName} in Zomba, Malawi.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `Photo Gallery — ${settings.orgName}`,
              url: `${siteUrl}/gallery`,
              description: `Photo gallery of ${settings.orgName} activities in Zomba, Malawi.`,
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
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <header className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black tracking-widest uppercase mb-4"
            >
              <Camera className="w-3.5 h-3.5" aria-hidden="true" /> Sanctuary Moments
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-black tracking-tight text-slate-900"
            >
              Our Photo Gallery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed"
            >
              A visual documentation of God&apos;s grace in action across Zomba, Malawi. Explore
              snapshots of Sunday celebrations, crusades, and youth events.
            </motion.p>
          </header>
        </div>

        {/* Category Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div
            className="flex flex-wrap items-center justify-center gap-2 pb-2"
            role="group"
            aria-label="Filter by category"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs font-extrabold tracking-wide transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-100'
                }`}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl max-w-xl mx-auto">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-800">No images found</h2>
              <p className="text-slate-400 text-xs mt-2">
                No photos have been added to this category yet.
              </p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.article
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      {failedImages[image.id] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
                          <Camera className="w-8 h-8 mb-2 text-indigo-500/80" aria-hidden="true" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Image offline
                          </span>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(image.url)}
                          alt={image.title}
                          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={() => {
                            setFailedImages((prev) => ({ ...prev, [image.id]: true }))
                          }}
                        />
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={() => openLightbox(index)}
                          className="p-3 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
                          aria-label={`View full image: ${image.title}`}
                        >
                          <Maximize2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur py-1.5 px-3 rounded-full text-[10px] font-black uppercase text-indigo-600 tracking-wider shadow">
                        {image.category || 'Sunday Service'}
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="p-5">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {image.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <time dateTime={new Date(image.createdAt).toISOString()}>
                          {new Date(image.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && filteredImages[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
            >
              {/* Header */}
              <div className="w-full h-20 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
                <div className="text-white">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-950/60 px-2.5 py-1.5 rounded-md">
                    {filteredImages[lightboxIndex].category || 'Sunday Service'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 mt-1">
                    {filteredImages[lightboxIndex].title}
                  </h4>
                </div>
                <button
                  onClick={closeLightbox}
                  className="p-3 bg-white/10 hover:bg-rose-600/30 text-white rounded-full transition-all active:scale-95 border border-white/10 hover:border-rose-500/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Close image viewer"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Image */}
              <div className="relative flex-1 flex items-center justify-center px-4">
                {/* Desktop prev */}
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-6 z-10 p-3.5 bg-black/40 hover:bg-indigo-600 text-white border border-white/5 rounded-full transition-all active:scale-90 hidden md:block focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                </button>

                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[72vh] max-w-[85vw] flex items-center justify-center select-none"
                >
                  <img
                    src={getImageUrl(filteredImages[lightboxIndex].url)}
                    alt={filteredImages[lightboxIndex].title}
                    className="max-h-[72vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
                  />
                </motion.div>

                {/* Desktop next */}
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-6 z-10 p-3.5 bg-black/40 hover:bg-indigo-600 text-white border border-white/5 rounded-full transition-all active:scale-90 hidden md:block focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Footer */}
              <div className="w-full p-6 text-center select-none bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center gap-3">
                <div className="flex gap-4 md:hidden">
                  <button
                    onClick={() => navigateLightbox('prev')}
                    className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => navigateLightbox('next')}
                    className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-full border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    Next
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-extrabold tracking-[0.25em] uppercase">
                  IMAGE {lightboxIndex + 1} OF {filteredImages.length}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
