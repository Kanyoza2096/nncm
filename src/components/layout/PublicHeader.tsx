import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Heart, 
  Shield, 
  Bell, 
  Trash2, 
  Settings, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Info, 
  RefreshCw,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { getImageUrl } from '../../lib/image-utils';
import { toast } from 'sonner';
import { 
  notificationService, 
  ChurchNotification, 
  NotificationPreference 
} from '../../services/notificationService';


export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useOrgSettings();

  // Notification panel states
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'preferences'>('alerts');
  const [notifications, setNotifications] = useState<ChurchNotification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPreference>({
    sundayService: true,
    bibleStudy: true,
    devotional: true,
    announcements: true,
  });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load notifications data on mount
  useEffect(() => {
    setNotifications(notificationService.getHistory());
    setPrefs(notificationService.getPreferences());
    setNotifPermission(notificationService.getPermissionState());

    // Close dropdown on outside click
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const isDesktopClick = desktopDropdownRef.current && desktopDropdownRef.current.contains(target);
      const isMobileClick = mobileDropdownRef.current && mobileDropdownRef.current.contains(target);
      if (!isDesktopClick && !isMobileClick) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    // Listen to real-time notification dispatches
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<ChurchNotification>;
      if (customEvent.detail) {
        setNotifications(prev => [customEvent.detail, ...prev]);
      }
    };
    window.addEventListener('nncm_new_notification', handleNewNotif);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('nncm_new_notification', handleNewNotif);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      toast.success('Push notifications activated! 🎉');
      notificationService.sendNotification(
        'Welcome to NNCM! 🎉',
        'You will now receive timely updates and service alerts directly on your device.',
        'announcement'
      );
    } else if (perm === 'denied') {
      toast.error('Notification permission was denied. Please update your browser settings to allow notifications.');
    }
  };

  const handleTogglePref = (key: keyof NotificationPreference) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    notificationService.savePreferences(updated);
    toast.success('Notification preference updated.');
  };

  const handleClearHistory = () => {
    notificationService.clearHistory();
    setNotifications([]);
    toast.success('History cleared.');
  };

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead();
    setNotifications(updated);
    toast.success('All marked as read.');
  };

  const handleMarkOneRead = (id: string) => {
    const updated = notificationService.markAsRead(id);
    setNotifications(updated);
  };

  const handleSimulateSunday = () => {
    notificationService.simulateSundayServicePush();
    toast.info('Simulated Sunday Service Push!');
  };

  const handleSimulateWednesday = () => {
    notificationService.simulateBibleStudyPush();
    toast.info('Simulated Wednesday Bible Study Push!');
  };

  const renderDropdown = (forMobile: boolean) => (
    <AnimatePresence>
      {showNotifications && (
        <>
          {/* Backdrop on Mobile only to lock focus and style like a true native modal */}
          {forMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden"
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="fixed sm:absolute inset-x-4 bottom-4 sm:bottom-auto sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden z-50 text-left font-sans"
          >
          {/* Header */}
          <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                Sanctuary Reminders
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  NEW
                </span>
              </h4>
              <p className="text-xs text-slate-400 font-light">Custom notifications and integrations</p>
            </div>
            <div className="flex gap-2">
              {activeTab === 'alerts' && notifications.length > 0 && (
                <button 
                  onClick={handleMarkAllRead} 
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => setActiveTab(activeTab === 'alerts' ? 'preferences' : 'alerts')}
                className="p-1.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-slate-850 hover:bg-slate-50 transition-colors"
                title="Notification Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-50 text-xs font-bold text-center bg-white">
            <button 
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 border-b-2 transition-all ${
                activeTab === 'alerts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Announcements ({notifications.length})
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 py-3 border-b-2 transition-all ${
                activeTab === 'preferences' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Settings & Sync
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[380px] overflow-y-auto p-4 space-y-4">
            {activeTab === 'alerts' ? (
              /* ALERTS TAB */
              notifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No alerts or push notifications logged yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleMarkOneRead(item.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                        item.read 
                          ? 'bg-white border-slate-50/70 hover:bg-slate-50/50' 
                          : 'bg-indigo-50/30 border-indigo-100/50 hover:bg-indigo-50/50 shadow-sm'
                      }`}
                    >
                      {!item.read && (
                        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                      )}
                      <div className="flex items-start gap-2.5 pr-4">
                        <div className="mt-0.5 text-slate-400">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">{item.title}</h5>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{item.body}</p>
                          <span className="text-[9px] font-mono text-slate-400 block mt-2">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between">
                    <button 
                      onClick={handleClearHistory}
                      className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* PREFERENCES & GOOGLE CALENDAR TAB */
              <div className="space-y-5">
                {/* 1. Browser Push Notifications Activation */}
                <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl space-y-3">
                  <h5 className="font-extrabold text-xs text-slate-900 tracking-wide uppercase flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" /> Browser Push Notifications
                  </h5>
                  {notifPermission === 'granted' ? (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs p-2.5 rounded-xl border border-emerald-100 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      Browser push notifications are ACTIVE
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 leading-relaxed font-light">
                        Request browser notification permissions to receive direct alerts on your device.
                      </p>
                      <button
                        onClick={handleRequestPermission}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all"
                      >
                        Activate Browser Notifications
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Push Preferences */}
                <div className="space-y-2.5">
                  <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest px-1">Subscription Preferences</h5>
                  
                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div className="pr-2">
                      <p className="text-xs font-bold text-slate-900">Sunday Service Alert</p>
                      <p className="text-[10px] text-slate-400 font-light">Remind me every Sunday at 6:00 AM</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={prefs.sundayService} 
                      onChange={() => handleTogglePref('sundayService')}
                      className="w-4.5 h-4.5 accent-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div className="pr-2">
                      <p className="text-xs font-bold text-slate-900">Wednesday Bible Study</p>
                      <p className="text-[10px] text-slate-400 font-light">Remind me every Wednesday at 2:00 PM</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={prefs.bibleStudy} 
                      onChange={() => handleTogglePref('bibleStudy')}
                      className="w-4.5 h-4.5 accent-indigo-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div className="pr-2">
                      <p className="text-xs font-bold text-slate-900">Daily Devotionals</p>
                      <p className="text-[10px] text-slate-400 font-light">Alert when new Daily Bread is released</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={prefs.devotional} 
                      onChange={() => handleTogglePref('devotional')}
                      className="w-4.5 h-4.5 accent-indigo-600 rounded"
                    />
                  </label>
                </div>

                {/* 4. Live Simulators */}
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl space-y-2">
                  <h6 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Live Service Reminders Test
                  </h6>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light mb-1.5">
                    Test exactly how church push reminders display on your device.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleSimulateSunday}
                      className="bg-white border border-slate-150 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-[10px] py-2 px-1.5 rounded-xl transition-all"
                    >
                      Sunday Alert (6:00AM)
                    </button>
                    <button
                      onClick={handleSimulateWednesday}
                      className="bg-white border border-slate-150 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-[10px] py-2 px-1.5 rounded-xl transition-all"
                    >
                      Bible Study (2:00PM)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-50 bg-slate-50/40 text-center">
            <p className="text-[9px] text-slate-400 font-light flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-indigo-500" /> Reminders automatically repeat weekly once added.
            </p>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );



  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Photo Gallery', href: '/gallery' },
    { name: 'Sermon Outlines', href: '/sermons' },
    { name: 'Scriptures', href: '/scriptures' },
    { name: 'Events Calendar', href: '/events' },
    { name: 'Ministries', href: '/ministries' },
    { name: 'Prayer Center', href: '/prayer' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-white border-b border-transparent'
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

          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {/* Notification Bell Icon & Dropdown Container */}
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative active:scale-90 ${
                  showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Notifications & Integrations"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {!isMobile && renderDropdown(false)}
            </div>

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

          <div className="xl:hidden flex items-center gap-2">
            {/* Mobile Notification Bell Icon */}
            <div className="relative md:hidden" ref={mobileDropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative active:scale-90 ${
                  showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isMobile && renderDropdown(true)}
            </div>

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
