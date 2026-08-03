// pages/sitemap.xml.tsx
// Dynamic sitemap generator — includes all blog posts, sermons, and events

import { GetStaticProps } from 'next'
import { createClient } from '@supabase/supabase-js'

function createBuildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createClient(url || '', key || '', { auth: { persistSession: false } })
}

export const getStaticProps: GetStaticProps = async ({ res }) => {
  const client = createBuildClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nncm.pages.dev'
  const today = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages = [
    { path: '', priority: '1.0', freq: 'weekly' },
    { path: 'sermons', priority: '0.8', freq: 'weekly' },
    { path: 'events', priority: '0.8', freq: 'weekly' },
    { path: 'blog', priority: '0.8', freq: 'weekly' },
    { path: 'about', priority: '0.7', freq: 'monthly' },
    { path: 'prayer', priority: '0.7', freq: 'monthly' },
    { path: 'give', priority: '0.7', freq: 'monthly' },
    { path: 'contact', priority: '0.6', freq: 'monthly' },
    { path: 'scriptures', priority: '0.8', freq: 'weekly' },
    { path: 'leadership', priority: '0.6', freq: 'monthly' },
    { path: 'donate', priority: '0.7', freq: 'monthly' },
    { path: 'register', priority: '0.6', freq: 'monthly' },
  ]

  // Fetch dynamic content
  let blogPosts: any[] = []
  let sermonsList: any[] = []
  let eventsList: any[] = []

  try {
    const { data: blog } = await client.from('blog_posts').select('id,updated_at,created_at').eq('published', true)
    blogPosts = blog || []
  } catch {}

  try {
    const { data: sermons } = await client.from('sermons').select('id,date').order('date', { ascending: false }).limit(20)
    sermonsList = sermons || []
  } catch {}

  try {
    const { data: events } = await client.from('events').select('id,event_date').gte('event_date', today)
    eventsList = events || []
  } catch {}

  // Build XML
  const urls = [
    ...staticPages.map(p => `
  <url>
    <loc>${siteUrl}/${p.path}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...blogPosts.map(p => `
  <url>
    <loc>${siteUrl}/blog/${p.id}</loc>
    <lastmod>${(p.updated_at || p.created_at || '').split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ...sermonsList.map(s => `
  <url>
    <loc>${siteUrl}/sermons/${s.id}</loc>
    <lastmod>${(s.date || '').split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
    ...eventsList.map(e => `
  <url>
    <loc>${siteUrl}/events/${e.id}</loc>
    <lastmod>${(e.event_date || '').split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(xml)
  res.end()

  return { props: {} }
}

// This component never renders — it's just for the sitemap XML
export default function Sitemap() {
  return null
}
