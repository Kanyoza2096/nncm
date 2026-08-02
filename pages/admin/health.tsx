// pages/admin/health.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Activity, Server, Database, Wifi, WifiOff, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface ServiceStatus {
  name: string
  status: 'online' | 'offline' | 'checking'
  latency?: number
  lastChecked?: Date
}

export default function AdminHealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Supabase Database', status: 'checking' },
    { name: 'Supabase Auth', status: 'checking' },
    { name: 'Supabase Storage', status: 'checking' },
    { name: 'Gemini AI', status: 'checking' },
  ])
  const [checking, setChecking] = useState(false)
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null)

  const checkHealth = async () => {
    setChecking(true)
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' as const })))

    const results: ServiceStatus[] = []
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check Supabase
    if (url && key) {
      const client = createClient(url, key)
      const start = Date.now()

      try {
        const { error } = await client.from('settings').select('id').limit(1)
        results.push({ name: 'Supabase Database', status: error ? 'offline' : 'online', latency: Date.now() - start })
      } catch {
        results.push({ name: 'Supabase Database', status: 'offline' })
      }

      try {
        const { error } = await client.auth.getSession()
        results.push({ name: 'Supabase Auth', status: 'online', latency: Date.now() - start })
      } catch {
        results.push({ name: 'Supabase Auth', status: 'offline' })
      }

      try {
        const { error } = await client.storage.getBucket('attachments')
        results.push({ name: 'Supabase Storage', status: 'online' })
      } catch {
        results.push({ name: 'Supabase Storage', status: 'offline' })
      }
    } else {
      results.push(
        { name: 'Supabase Database', status: 'offline' },
        { name: 'Supabase Auth', status: 'offline' },
        { name: 'Supabase Storage', status: 'offline' }
      )
    }

    // Check Gemini
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/gemini/chat`
      const geminiStart = Date.now()
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }], systemInstruction: 'Reply with just "pong"' }),
      })
      results.push({ name: 'Gemini AI', status: response.ok ? 'online' : 'offline', latency: Date.now() - geminiStart })
    } catch {
      results.push({ name: 'Gemini AI', status: 'offline' })
    }

    results.forEach(r => { r.lastChecked = new Date() })
    setServices(results)
    setLastFullCheck(new Date())
    setChecking(false)
    toast.success('Health check complete.')
  }

  useEffect(() => { checkHealth() }, [])

  const onlineCount = services.filter(s => s.status === 'online').length

  return (
    <>
      <Head><title>System Health — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Health</h1>
            <p className="text-slate-500 text-sm mt-1">{onlineCount}/{services.length} services online.</p>
          </div>
          <button onClick={checkHealth} disabled={checking} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
            {checking ? 'Checking...' : 'Run Health Check'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map(service => (
            <div key={service.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${service.status === 'online' ? 'bg-emerald-50 text-emerald-600' : service.status === 'checking' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                  {service.status === 'online' ? <CheckCircle2 className="w-6 h-6" /> : service.status === 'checking' ? <Clock className="w-6 h-6 animate-pulse" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{service.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{service.status}</p>
                </div>
              </div>
              {service.latency !== undefined && (
                <span className="text-xs font-mono text-slate-400">{service.latency}ms</span>
              )}
            </div>
          ))}
        </div>

        {lastFullCheck && (
          <p className="text-center text-[10px] text-slate-400 font-mono">
            Last full check: {lastFullCheck.toLocaleTimeString()}
          </p>
        )}
      </div>
    </>
  )
}
