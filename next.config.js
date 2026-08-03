// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' — was for Cloudflare Pages static export.
  // Running as a standard Next.js dev server on Replit instead.

  images: {
    unoptimized: true,
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CHURCH_NAME: process.env.NEXT_PUBLIC_CHURCH_NAME,
  },

  trailingSlash: false,
}

module.exports = nextConfig
