// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // ← Uncomment this for Cloudflare Pages

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
