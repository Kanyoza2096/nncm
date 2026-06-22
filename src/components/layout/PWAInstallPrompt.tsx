import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Sparkles } from 'lucide-react';
import { useOrgSettings } from '../../hooks/useOrgSettings';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const { settings } = useOrgSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. Listen for the native beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] Native prompt event received');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Identify iOS users who need custom instructions (no generic beforeinstallprompt support)
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    
    // Safely check for iOS standalone mode
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isAppleDevice && !isStandalone) {
      setIsIos(true);
    }

    // 3. Fallback: If no prompt event triggers after 3 seconds, we show manual installation instructions
    // unless the app is already running as standalone (installed)
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (!isAppInstalled) {
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger the native browser install prompt
    await deferredPrompt.prompt();
    
    // Check outcome
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice outcome: ${outcome}`);
    
    // Clear prompt state
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismissPrompt = () => {
    setIsVisible(false);
    // Persist user dismissal so we don't repeatedly show/interfere
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        id="pwa-install-prompt"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-50 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-indigo-950/40 p-5 border border-slate-800 flex flex-col gap-4 overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <img 
              src="/icon-192.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-lg object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-400">Installable Web App</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mt-1 leading-tight">{settings.orgName ? `${settings.orgName} App` : 'Church App'}</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {isIos ? (
                <span>
                  Tap the <strong>'Share'</strong> button <span className="inline-block px-1 bg-slate-800 rounded">⎋</span> in Safari, then select <strong>'Add to Home Screen'</strong> to install the App on your iOS device.
                </span>
              ) : deferredPrompt ? (
                "Install our secure Portal on your device for fast access, sermons, notifications, and improved offline performance."
              ) : (
                <span>
                  Tap your browser menu (such as standard Chrome's <strong>'⋮'</strong> or <strong>'...'</strong> settings button) and select <strong>'Add to Home Screen'</strong> or <strong>'Install App'</strong> for instant direct access.
                </span>
              )}
            </p>
          </div>
          <button
            onClick={dismissPrompt}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={dismissPrompt}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-center"
          >
            Dismiss
          </button>
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-all text-center"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
          ) : (
            <button
              onClick={dismissPrompt}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all text-center"
            >
              I Understand
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
