// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for Cloudflare Pages
  
  images: {
    unoptimized: true,  // Required for static export
  },
  
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CHURCH_NAME: process.env.NEXT_PUBLIC_CHURCH_NAME,
  },
  
  // Trailing slashes for consistency with your current React Router setup
  trailingSlash: false,
}

module.exports = nextConfig
