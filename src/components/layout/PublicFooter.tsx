import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { getImageUrl } from '../../lib/image-utils';

export default function PublicFooter() {
  const { settings } = useOrgSettings();
  
  return (
    <footer className="bg-slate-900 pt-24 pb-12 overflow-hidden relative" aria-labelledby="footer-heading">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 max-w-sm">
            <div className="flex items-center gap-3 mb-8 group">
              {settings.orgLogo ? (
                <div className="h-14 flex items-center justify-center">
                  <img src={getImageUrl(settings.orgLogo)} alt={settings.orgName} className="h-14 w-auto max-w-[200px] object-contain rounded-xl" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-display font-bold text-2xl tracking-tight text-white">{settings.orgName}</span>
            </div>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              {settings.orgAbout || "Empowering communities through verifiable transparency and real-time humanitarian impact tracking."}
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <a href="#" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><MapPin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Phone className="w-5 h-5" /></a>
            </div>
          </div>
          
          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-8">
            <div>
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-6">Assemblies</h3>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Our DNA Statement</Link></li>
                <li><Link to="/sermons" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Sermon Outlines</Link></li>
                <li><Link to="/scriptures" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Scripture Meditations</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-6">Fellowship</h3>
              <ul className="space-y-4">
                <li><Link to="/events" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Events Calendar</Link></li>
                <li><Link to="/ministries" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Ministries</Link></li>
                <li><Link to="/prayer" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Prayer Center Feed</Link></li>
                <li><Link to="/register" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Join Church Registry</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-6">Seeds</h3>
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">Your tithing seed funds sanctuary operations and charity outreaches.</p>
                <Link 
                  to="/give" 
                  className="inline-flex w-full items-center justify-center bg-indigo-600 text-white py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/5"
                >
                  Give Online
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <p className="text-sm font-medium text-slate-500">
              &copy; 2026 {settings.orgName}. All rights reserved. | Designed for God's Glory
            </p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <p className="text-xs font-mono text-slate-400">
              Sanctuary: <span className="text-indigo-400 font-bold">{settings.orgAddress}</span>
            </p>
          </div>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-600">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Saints United
            </span>
            <span className="hidden sm:inline">2 Corinthians 5:17 Assembly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
