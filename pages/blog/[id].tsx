// pages/blog/[id].tsx
// ============================================================================
// NNCM Church Portal — Blog Detail Page
// Next.js static export with SEO, accessibility, and UX upgrades.
// ============================================================================

import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, BookOpen } from 'lucide-react'
import Markdown from 'react-markdown'
import { createClient } from '@supabase/supabase-js'
import { getImageUrl } from '@/lib/image-utils'
import type { BlogPost } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

interface BlogDetailProps {
  post: BlogPost
  settings: {
    orgName: string
  }
}

// ============================================================================
// BUILD-TIME HELPERS
// ============================================================================

function createBuildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

function fromDB(obj: Record<string, unknown>): Record<string, unknown> {
  const reverse: Record<string, string> = {
    featured_image: 'featuredImage',
    published_at: 'publishedAt',
    author_name: 'authorName',
    author_id: 'authorId',
    created_at: 'createdAt',
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[reverse[key] || key] = value
  }
  return result
}

// ============================================================================
// STATIC PATHS — Generate one page per blog post at build time
// ============================================================================

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createBuildClient()

  try {
    const { data, error } = await client
      .from('blog_posts')
      .select('id')
      .eq('published', true)

    if (error || !data) {
      return { paths: [], fallback: false }
    }

    const paths = data.map((item: Record<string, string>) => ({
      params: { id: item.id },
    }))

    return { paths, fallback: false }
  } catch {
    return { paths: [], fallback: false }
  }
}

// ============================================================================
// STATIC PROPS
// ============================================================================

export const getStaticProps: GetStaticProps<BlogDetailProps> = async ({ params }) => {
  const client = createBuildClient()
  const id = params?.id as string

  const [postResult, settingsResult] = await Promise.allSettled([
    fetchPost(client, id),
    fetchOrgName(client),
  ])

  if (postResult.status === 'rejected' || !postResult.value) {
    return { notFound: true }
  }

  return {
    props: {
      post: postResult.value,
      settings: {
        orgName: settingsResult.status === 'fulfilled' ? settingsResult.value : 'New Nature In Christ Ministry',
      },
    },
  }
}

async function fetchPost(
  client: ReturnType<typeof createClient>,
  id: string
): Promise<BlogPost | null> {
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error || !data) return null

  const mapped = fromDB(data as Record<string, unknown>)
  return {
    ...mapped,
    published: Boolean((data as Record<string, unknown>).published),
    publishedAt: Number((data as Record<string, unknown>).published_at) || Date.now(),
  } as BlogPost
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

export default function BlogDetailPage({ post, settings }: BlogDetailProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const coverImage = post.featuredImage
    ? getImageUrl(post.featuredImage)
    : null

  return (
    <>
      {/* ================================================================== */}
      {/* SEO META TAGS                                                        */}
      {/* ================================================================== */}
      <Head>
        <title>{post.title} — {settings.orgName}</title>
        <meta
          name="description"
          content={post.excerpt || post.content?.slice(0, 160) || `Read this article from ${settings.orgName}.`}
        />

        {/* Open Graph */}
        <meta property="og:title" content={`${post.title} — ${settings.orgName}`} />
        <meta
          property="og:description"
          content={post.excerpt || post.content?.slice(0, 160) || ''}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${siteUrl}/blog/${post.id}`} />
        {coverImage && <meta property="og:image" content={coverImage} />}
        <meta property="og:site_name" content={settings.orgName} />
        <meta property="article:published_time" content={new Date(post.publishedAt).toISOString()} />
        {post.authorName && <meta property="article:author" content={post.authorName} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} — ${settings.orgName}`} />
        <meta name="twitter:description" content={post.excerpt || post.content?.slice(0, 160) || ''} />
        {coverImage && <meta name="twitter:image" content={coverImage} />}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              url: `${siteUrl}/blog/${post.id}`,
              datePublished: new Date(post.publishedAt).toISOString(),
              description: post.excerpt || post.content?.slice(0, 160),
              ...(coverImage && { image: coverImage }),
              author: {
                '@type': 'Person',
                name: post.authorName || 'NNCM Administrator',
              },
              publisher: {
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
      <main className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-10 group transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform"
              aria-hidden="true"
            />
            Back to Articles
          </Link>

          {/* Header */}
          <header className="mb-12">
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">
              {post.category || 'Impact Report'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 mt-8 font-black text-[9px] uppercase tracking-widest text-slate-400">
              <div className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-indigo-500" aria-hidden="true" />
                {post.authorName || 'Administrator'}
              </div>
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" aria-hidden="true" />
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {new Date(post.publishedAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="w-full aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-slate-100">
              <img
                src={coverImage || 'https://images.unsplash.com/photo-1469571486090-e5996073efed?auto=format&fit=crop&w=800&q=80'}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-slate max-w-none prose-sm sm:prose-base prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 prose-img:rounded-3xl">
            <Markdown>{post.content}</Markdown>
          </div>

          {/* Author Footer */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600 border border-indigo-100"
                aria-hidden="true"
              >
                {post.authorName?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  About author
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {post.authorName || 'NNCM Administrator'}
                </p>
              </div>
            </div>
            <Link
              href="/donate"
              className="px-6 py-3 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Support this work
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
