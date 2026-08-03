// pages/_app.tsx
// ============================================================================
// NNCM Church Portal — App Wrapper
// Global providers, styles, and layout.
// ============================================================================

import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AuthProvider } from '@/hooks/useAuth'
import { OrgSettingsProvider } from '@/hooks/useOrgSettings'
import ErrorBoundary from '@/components/ErrorBoundary'
import PublicLayout from '@/components/layout/PublicLayout'  // ← ADD THIS
import { Toaster } from 'sonner'
import '@/styles/globals.css'

// Client-only components (prevents SSR hydration issues)
const PWAInstallPrompt = dynamic(
  () => import('@/components/layout/PWAInstallPrompt'),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrgSettingsProvider>
          <PublicLayout>  {/* ← WRAP EVERYTHING IN LAYOUT */}
            {isClient ? (
              <>
                <Component {...pageProps} />
                <PWAInstallPrompt />
                <Toaster position="top-right" richColors expand closeButton />
              </>
            ) : (
              <Component {...pageProps} />
            )}
          </PublicLayout>
        </OrgSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
