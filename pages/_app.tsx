// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'  // ← ADD THIS
import { AuthProvider } from '@/hooks/useAuth'
import { OrgSettingsProvider } from '@/hooks/useOrgSettings'
import ErrorBoundary from '@/components/ErrorBoundary'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'  // ← ADD THIS
import { Toaster } from 'sonner'
import '@/styles/globals.css'

const PWAInstallPrompt = dynamic(
  () => import('@/components/layout/PWAInstallPrompt'),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Determine which layout to use
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register'
  const isAdminPage = router.pathname.startsWith('/admin')

  // Auth pages → NO layout (clean, no header/footer)
  if (isAuthPage) {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <OrgSettingsProvider>
            <Component {...pageProps} />
            <Toaster position="top-right" richColors expand closeButton />
          </OrgSettingsProvider>
        </AuthProvider>
      </ErrorBoundary>
    )
  }

  // Admin pages → AdminLayout (with sidebar)
  if (isAdminPage) {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <OrgSettingsProvider>
            <AdminLayout>
              <Component {...pageProps} />
              <Toaster position="top-right" richColors expand closeButton />
            </AdminLayout>
          </OrgSettingsProvider>
        </AuthProvider>
      </ErrorBoundary>
    )
  }

  // Public pages → PublicLayout (with header and footer)
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrgSettingsProvider>
          <PublicLayout>
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
