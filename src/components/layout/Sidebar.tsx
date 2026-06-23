import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  Briefcase, 
  Receipt, 
  UserCircle,
  Settings,
  LogOut,
  FileText,
  X,
  Activity,
  Shield,
  MessageSquare,
  Sparkles,
  BookOpen,
  BookMarked,
  Calendar,
  Image
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { getImageUrl } from '../../lib/image-utils';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const { settings } = useOrgSettings();
  
  const isVolunteer = profile?.role === 'volunteer';
  const isStaff = profile?.role === 'staff';

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Church Members', path: '/admin/beneficiaries', icon: Users },
    { name: 'Readership Team', path: '/admin/readership', icon: BookMarked },
    { name: 'Sermons Library', path: '/admin/sermons', icon: BookOpen },
    { name: 'Church Events', path: '/admin/events', icon: Calendar },
    { name: 'Givers & Patrons', path: '/admin/donors', icon: HeartHandshake, sensitiveStaff: false, sensitiveVolunteer: true },
    { name: 'Tithes & Offerings', path: '/admin/donations', icon: HeartHandshake, sensitiveStaff: true, sensitiveVolunteer: true },
    { name: 'Ministries & Outposts', path: '/admin/projects', icon: Briefcase },
    { name: 'Finances & Expenses', path: '/admin/expenses', icon: Receipt, sensitiveStaff: true, sensitiveVolunteer: true },
    { name: 'Ministry Servers', path: '/admin/volunteers', icon: UserCircle },
    { name: 'Reports', path: '/admin/reports', icon: FileText, sensitiveStaff: true, sensitiveVolunteer: true },
    { name: 'AI Helper', path: '/admin/ai-assistant', icon: Sparkles },
    { name: 'Photo Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Blogs & Articles', path: '/admin/blog', icon: FileText, sensitiveStaff: true, sensitiveVolunteer: true },
    { name: 'Praise Reports', path: '/admin/testimonials', icon: MessageSquare, sensitiveStaff: true, sensitiveVolunteer: true },
  ].filter(item => {
    if (isVolunteer && item.sensitiveVolunteer) return false;
    if (isStaff && item.sensitiveStaff) return false;
    return true;
  });

  const adminOnlyItems = [
    { name: 'System Users', path: '/admin/users', icon: Shield },
    { name: 'System Health', path: '/admin/health', icon: Activity },
  ];

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <aside className="w-64 bg-white dark:bg-[#0b1120] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
          {settings.orgLogo ? (
            <div className="h-10 flex items-center justify-center shrink-0">
              <img src={getImageUrl(settings.orgLogo)} alt="Logo" className="h-10 w-auto max-w-[120px] object-contain rounded-lg" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="font-bold text-white leading-none">{settings.orgName?.charAt(0) || 'N'}</span>
            </div>
          )}
          <span className="font-bold text-sm tracking-tight shrink-0 truncate max-w-[120px]">
            {settings.orgName || 'NNCM Portal'}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}

        {isAdmin && adminOnlyItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            to="/admin/settings"
            onClick={onClose}
            className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
              location.pathname.startsWith('/admin/settings')
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <Settings className={`mr-3 h-4 w-4 ${location.pathname.startsWith('/admin/settings') ? 'text-white' : 'text-slate-400'}`} />
            Settings
          </Link>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 p-1 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-200">{profile?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{profile?.role?.replace('_', ' ') || 'Guest'}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 opacity-70 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}
