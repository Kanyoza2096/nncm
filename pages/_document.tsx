// pages/_document.tsx
// ============================================================================
// NNCM Church Portal — HTML Shell
// PWA manifest, meta tags, font preloading.
// ============================================================================

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Preconnect to Supabase */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-slate-50 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
