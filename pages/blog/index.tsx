// pages/blog/index.tsx
// ============================================================================
// NNCM Church Portal — Blog Listing
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { BlogPost } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface BlogPageProps {
  posts: BlogPost[]
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
    featured_image: 'featuredImage',
    published_at: 'publishedAt',
    author_name: 'authorName',
    author_id: 'authorId',
    created_at: 'createdAt',
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

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  const client = createBuildClient()

  const [postsResult, settingsResult] = await Promise.allSettled([
    fetchPosts(client),
    fetchOrgName(client),
  ])

  if (postsResult.status === 'rejected') {
    throw new Error(`Blog page build failed: ${postsResult.reason}`)
  }

  return {
    props: {
      posts: postsResult.value,
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchPosts(client: ReturnType<typeof createClient>): Promise<BlogPost[]> {
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.warn('[Build] Blog posts fetch failed:', error.message)
    return []
  }

  return (data || []).map((item) => {
    const mapped = fromDB(item as Record<string, unknown>)
    return {
      ...mapped,
      published: Boolean((item as Record<string, unknown>).published),
      publishedAt: Number((item as Record<string, unknown>).published_at) || Date.now(),
    } as BlogPost
  })
}

async function fetchOrgName(client: ReturnType<typeof createClient>): Promise<string> {
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

export default function BlogPage({ posts, settings }: BlogPageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>Impact News & Updates — {settings.orgName}</title>
        <meta
          name="description"
          content={`Read the latest church narratives, impact stories, and ministry updates from ${settings.orgName} in Zomba, Malawi.`}
        />
        <meta name="keywords" content="blog, news, updates, church stories, NNCM, Malawi, Zomba" />

        {/* Open Graph */}
        <meta property="og:title" content={`Impact News & Updates — ${settings.orgName}`} />
        <meta property="og:description" content={`Church narratives and ministry updates from ${settings.orgName}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/blog`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:site_name" content={settings.orgName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Impact News & Updates — ${settings.orgName}`} />
        <meta name="twitter:description" content={`Church narratives from ${settings.orgName}.`} />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Blog',
              name: `Impact News & Updates — ${settings.orgName}`,
              url: `${siteUrl}/blog`,
              description: `Church narratives and ministry updates from ${settings.orgName}.`,
              about: {
                '@type': 'Church',
                name: settings.orgName,
              },
              blogPost: posts.map((post) => ({
                '@type': 'BlogPosting',
                headline: post.title,
                url: `${siteUrl}/blog/${post.id}`,
                datePublished: new Date(post.publishedAt).toISOString(),
                description: post.excerpt,
                ...(post.featuredImage && { image: getImageUrl(post.featuredImage) }),
              })),
            }),
          }}
        />
      </Head>

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
        {/* Header */}
        <header className="text-center mb-16">
          <span className="text-xs font-black text-indigo-600 tracking-widest uppercase">
            Church Narratives
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 mt-1">
            Impact News & Updates
          </h1>
        </header>

        {/* Empty State */}
        {posts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-medium italic text-sm">
              No impact narratives have been published to the portal yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-3xl"
              >
                <article className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
                  {/* Featured Image */}
                  <div className="h-52 bg-slate-100 relative overflow-hidden">
                    <img
                      src={
                        post.featuredImage
                          ? getImageUrl(post.featuredImage)
                          : 'https://images.unsplash.com/photo-1469571486090-e5996073efed?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-md text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                        {post.category || 'Discipleship'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <time
                        className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]"
                        dateTime={new Date(post.publishedAt).toISOString()}
                      >
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </time>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-slate-500 text-xs font-light line-clamp-3 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center justify-between text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                      <span>Read Narrative</span>
                      <span className="text-lg" aria-hidden="true">&rarr;</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
