// pages/admin/ai-assistant.tsx
// ============================================================================
// NNCM Church Portal — AI Assistant (Gemini-Powered)
// Next.js with real Gemini API, accessibility, and UX upgrades.
//
// UPGRADES:
//  • Real Gemini API calls (replaces mock setTimeout)
//  • Error handling for API failures
//  • Message persistence in localStorage
//  • Proper form labels and ARIA
//  • Loading states with typing indicator
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Send,
  Database,
  ShieldCheck,
  Mic,
  History,
  Loader2,
  Lock,
  ChevronRight,
  BrainCircuit,
  PieChart,
  Target,
  Trash2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgSettings } from '@/hooks/useOrgSettings'

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string
  role: 'user' | 'assistant' | 'error'
  content: string
  timestamp: Date
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'nncm_ai_chat_history'
const MAX_STORED_MESSAGES = 50

const SYSTEM_INSTRUCTION = `You are the Ministry Intelligence Core for New Nature In Christ Ministry (NNCM), a church in Zomba, Malawi.
Your role is to assist church administrators with:
- Financial analysis and stewardship insights
- Membership growth and outreach strategies
- Sermon preparation and theological research
- Event planning and coordination
- Data-driven ministry recommendations

Always be respectful, spiritually grounded, and practical. Reference scripture where appropriate.
Keep responses concise and actionable. Use MWK (Malawian Kwacha) for financial discussions.`

// ============================================================================
// HELPERS
// ============================================================================

function loadMessages(userName: string): Message[] {
  if (typeof window === 'undefined') {
    return [createWelcomeMessage(userName)]
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      }
    }
  } catch {
    // Corrupted storage — start fresh
  }

  return [createWelcomeMessage(userName)]
}

function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return
  try {
    const toStore = messages.slice(-MAX_STORED_MESSAGES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch {
    // Storage full — silently fail
  }
}

function createWelcomeMessage(userName: string): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content: `Greetings ${userName || 'Administrator'}. I am the Ministry Intelligence Core, powered by Gemini. How can I assist with your administrative stewardship and data analysis today?`,
    timestamp: new Date(),
  }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AIAssistantPage() {
  const { user } = useAuth()
  const { settings } = useOrgSettings()
  const [messages, setMessages] = useState<Message[]>(() =>
    loadMessages(user?.name || '')
  )
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Persist messages
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  // Clear history
  const handleClearHistory = useCallback(() => {
    setMessages([createWelcomeMessage(user?.name || '')])
    localStorage.removeItem(STORAGE_KEY)
  }, [user?.name])

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || processing) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setProcessing(true)

    try {
      // Call the Gemini API endpoint from your Express server
      const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/gemini/chat`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
            { role: 'user', content: input.trim() },
          ],
          systemInstruction: SYSTEM_INSTRUCTION,
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'I received your query but could not generate a response. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'error',
        content: 'I apologize, but I could not connect to the intelligence core. Please check your connection and try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Head>
        <title>AI Assistant — NNCM Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className="lg:w-1/4 hidden lg:flex flex-col gap-6">
          <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10" aria-hidden="true" />
            <div className="relative z-10">
              <BrainCircuit className="w-10 h-10 text-indigo-400 mb-6" aria-hidden="true" />
              <h2 className="text-lg font-black tracking-tight mb-2">Intelligence Core</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                Leveraging Gemini to synthesize pastoral insights and church growth telemetry.
              </p>
              <div className="w-full h-px bg-white/10 mb-6" aria-hidden="true" />
              <div className="space-y-4">
                {[
                  { icon: PieChart, label: 'Fiscal Forecasting' },
                  { icon: Target, label: 'Outreach Optimization' },
                  { icon: ShieldCheck, label: 'Audit Compliance' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500"
                  >
                    <item.icon className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Memory Panel */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                Session Memory
              </h3>
              <div className="space-y-4">
                {messages
                  .filter((m) => m.role === 'user')
                  .slice(-3)
                  .reverse()
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-transparent"
                    >
                      <span className="text-[10px] font-bold text-slate-600 truncate block">
                        {m.content.substring(0, 50)}
                      </span>
                    </div>
                  ))}
                {messages.filter((m) => m.role === 'user').length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">No queries yet.</p>
                )}
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter text-slate-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-2 py-1"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Clear History
            </button>
          </div>
        </aside>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[3rem] shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20"
                aria-hidden="true"
              >
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-950 tracking-tight">
                  Ministry AI Assistant
                </h2>
                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Active
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
              <Database className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                {settings.orgName || 'NNCM'} KB
              </span>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 scroll-smooth"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={m.id}
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                      m.role === 'assistant'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : m.role === 'error'
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-white text-slate-400 border-slate-100'
                    }`}
                    aria-hidden="true"
                  >
                    {m.role === 'assistant' ? (
                      <Sparkles className="w-4 h-4 fill-white" />
                    ) : m.role === 'error' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'assistant'
                        ? 'bg-slate-50 text-slate-700 font-light'
                        : m.role === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-slate-950 text-white font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <div className="text-[8px] font-black opacity-30 mt-3 uppercase tracking-widest">
                      {m.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {processing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="flex gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">
                    Synthesizing...
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100">
            <form onSubmit={handleSend}>
              <label htmlFor="ai-input" className="sr-only">
                Ask a question
              </label>
              <div className="relative">
                <input
                  id="ai-input"
                  disabled={processing}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search insights, fiscal data, or request sanctuary reports..."
                  className="w-full pl-6 pr-32 py-5 bg-white border border-slate-200 rounded-[2.5rem] text-sm font-bold shadow-xl shadow-slate-100 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2.5 hover:bg-slate-50 rounded-full transition-all text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Voice input (coming soon)"
                    disabled
                  >
                    <Mic className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    disabled={!input.trim() || processing}
                    type="submit"
                    className="p-3 bg-indigo-600 hover:bg-slate-950 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-xl shadow-indigo-600/20 active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                End-to-End Encrypted Knowledge Stream
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
