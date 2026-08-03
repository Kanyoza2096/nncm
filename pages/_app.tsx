// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Login page - NO layout (just the form)
  if (router.pathname === '/login' || router.pathname === '/register') {
    return (
      <>
        <Component {...pageProps} />
        <Toaster position="top-right" richColors />
      </>
    )
  }

  // Admin pages - AdminLayout (sidebar + topbar)
  if (router.pathname.startsWith('/admin')) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
        <Toaster position="top-right" richColors />
      </AdminLayout>
    )
  }

  // All other pages - PublicLayout (header + footer)
  return (
    <PublicLayout>
      <Component {...pageProps} />
      <Toaster position="top-right" richColors />
    </PublicLayout>
  )
}
