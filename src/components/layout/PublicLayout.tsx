import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff } from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check: if offline on mount, show persistent offline badge
    if (!navigator.onLine) {
      setIsOnline(false);
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <PublicHeader />
      
      {/* Real-time PWA Connectivity Status Banner */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            id="pwa-connection-toast"
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full text-xs font-bold shadow-xl border ${
              isOnline 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-950/10' 
                : 'bg-slate-900 border-slate-800 text-white shadow-slate-950/20'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-300 animate-pulse" />
            ) : (
              <WifiOff className="w-4 h-4 text-indigo-400" />
            )}
            <span className="tracking-wide">
              {isOnline ? 'Internet connection restored. Live data active!' : 'You are offline. Browsing cached portal content.'}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-300 animate-ping' : 'bg-indigo-400'}`} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <PublicFooter />
    </div>
  );
}
