import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { getImageUrl } from '../../lib/image-utils';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useOrgSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Photo Gallery', href: '/gallery' },
    { name: 'Sermon Outlines', href: '/sermons' },
    { name: 'Live Stream', href: '/live' },
    { name: 'Events Calendar', href: '/events' },
    { name: 'Ministries', href: '/ministries' },
    { name: 'Prayer Center', href: '/prayer' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-white border-b border-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              {settings.orgLogo ? (
                <div className="relative h-14 flex items-center justify-center">
                  <img src={getImageUrl(settings.orgLogo)} alt={settings.orgName} className="h-14 w-auto max-w-[200px] md:max-w-[240px] object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {settings.orgName}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 -mt-1 hidden sm:block">
                  2 Corinthians 5:17
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden xl:flex items-center space-x-1">
            {navigation.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-2 text-xs font-semibold tracking-wide transition-all rounded-full ${
                  location.pathname === link.href 
                    ? 'text-indigo-600 bg-indigo-50/50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Portal
            </Link>
            <Link
              to="/give"
              className="relative group overflow-hidden bg-indigo-600 px-6 py-2.5 rounded-full text-sm font-bold text-white shadow-xl shadow-indigo-600/10 hover:shadow-2xl hover:shadow-indigo-600/20 transition-all duration-300 active:scale-95"
            >
              <span className="relative z-10">Online Giving</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Link>
          </div>

          <div className="xl:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="h-6 w-6 text-indigo-600" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-2">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded-2xl text-base font-bold transition-all ${
                    location.pathname === link.href 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.href && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </Link>
              ))}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/give"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center p-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                >
                  Give Online
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
