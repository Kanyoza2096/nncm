import { Bell, Search, Sun, Moon, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TopbarProps {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Avoid hydration mismatch by not rendering theme toggle until mounted
  if (!mounted) {
    return (
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 w-full">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-indigo-600 transition-colors" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>
    )
  }

  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4 text-sm">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-indigo-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-slate-500">Pages</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-900 font-medium">Dashboard</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6 flex-1 sm:justify-end">
        <div className="relative flex-1 sm:flex-none">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <label htmlFor="topbar-search" className="sr-only">Search</label>
          <input
            id="topbar-search"
            type="text"
            placeholder="Search..."
            className="w-full sm:w-64 bg-slate-100 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 placeholder-slate-400 transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Toggle notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 block w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  <button className="text-xs text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                      <p className="text-sm font-medium text-slate-900">New User Registered</p>
                      <p className="text-xs text-slate-500 mt-1">A new user has just registered an account.</p>
                      <p className="text-xs text-slate-400 mt-1">{i} hours ago</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
