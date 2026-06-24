import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  Shield, 
  Globe, 
  Bell, 
  Languages, 
  Users,
  Image as ImageIcon,
  Heart,
  CheckCircle2,
  Lock,
  Layout
} from 'lucide-react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import NativeFileUpload from '../../components/NativeFileUpload';
import { getImageUrl } from '../../lib/image-utils';

export default function Settings() {
  const { settings, updateSettings } = useOrgSettings();
  const [activeTab, setActiveTab] = useState('Identity');
  
  const [disableMockSeeds, setDisableMockSeeds] = useState(() => {
    return localStorage.getItem('nncm_disable_mock_seeds') !== 'false';
  });

  const handleToggleMockSeeds = (checked: boolean) => {
    localStorage.setItem('nncm_disable_mock_seeds', checked ? 'true' : 'false');
    setDisableMockSeeds(checked);
    // When changing, let's clear cached lists so they recalculate with the new seed settings
    const keysToReset = [
      'nncm_sermons', 'nncm_events', 'nncm_ministries', 'nncm_prayers', 
      'nncm_counseling', 'nncm_devotionals', 'nncm_library', 'nncm_members', 
      'nncm_attendance', 'nncm_gallery'
    ];
    keysToReset.forEach(k => localStorage.removeItem(k));
    toast.success(checked ? 'Demo mock data disabled. New sessions will open with a clean slate.' : 'Demo mock data fallback enabled.');
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all locally cached data in this browser? This will empty all local sermons, events, and registrations saved on this device.')) {
      const keysToClear = [
        'nncm_sermons', 'nncm_events', 'nncm_ministries', 'nncm_prayers', 
        'nncm_counseling', 'nncm_devotionals', 'nncm_library', 'nncm_members', 
        'nncm_attendance', 'nncm_gallery'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      toast.success('Local browser cache cleared successfully. Refreshing site...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };
  
  const [formData, setFormData] = useState({
    orgName: settings.orgName || '',
    orgEmail: settings.orgEmail || '',
    orgPhone: settings.orgPhone || '',
    orgAddress: settings.orgAddress || '',
    vision: settings.vision || '',
    mission: settings.mission || '',
    motto: settings.motto || '',
    orgAbout: settings.orgAbout || '',
    orgLogo: settings.orgLogo || '',
    facebookUrl: settings.facebookUrl || '',
    twitterUrl: settings.twitterUrl || '',
    youtubeUrl: settings.youtubeUrl || '',
    instagramUrl: settings.instagramUrl || '',
    koboApiUrl: settings.koboApiUrl || '',
    koboToken: settings.koboToken || '',
    koboFormId: settings.koboFormId || '',
  });

  // Keep form data in sync as settings load asynchronously
  useEffect(() => {
    if (settings) {
      setFormData({
        orgName: settings.orgName || '',
        orgEmail: settings.orgEmail || '',
        orgPhone: settings.orgPhone || '',
        orgAddress: settings.orgAddress || '',
        vision: settings.vision || '',
        mission: settings.mission || '',
        motto: settings.motto || '',
        orgAbout: settings.orgAbout || '',
        orgLogo: settings.orgLogo || '',
        facebookUrl: settings.facebookUrl || '',
        twitterUrl: settings.twitterUrl || '',
        youtubeUrl: settings.youtubeUrl || '',
        instagramUrl: settings.instagramUrl || '',
        koboApiUrl: settings.koboApiUrl || '',
        koboToken: settings.koboToken || '',
        koboFormId: settings.koboFormId || '',
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (updateSettings) {
        await updateSettings(formData);
        toast.success('Core sanctuary configuration updated successfully.');
      }
    } catch (err: any) {
      toast.error('Settings persist failure.');
    }
  };

  const tabs = ['Identity', 'Missions', 'Communications', 'Architecture'];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Portal Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage global identity and operational parameters for {settings.orgName}.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all outline-none"
        >
          <Save className="w-4 h-4" /> Save Authority Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Rail */}
        <div className="lg:col-span-3">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-1 sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                    activeTab === tab 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${activeTab === tab ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                     {tab === 'Identity' && <Building className="w-3.5 h-3.5" />}
                     {tab === 'Missions' && <Heart className="w-3.5 h-3.5" />}
                     {tab === 'Communications' && <Globe className="w-3.5 h-3.5" />}
                     {tab === 'Architecture' && <Layout className="w-3.5 h-3.5" />}
                  </div>
                  {tab}
                </button>
              ))}
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 sm:p-12 space-y-10 flex-1 overflow-y-auto">
                 
                 <AnimatePresence mode="wait">
                    {activeTab === 'Identity' && (
                      <motion.div 
                        key="Identity" 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        className="space-y-8"
                      >
                         <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-100 dark:border-slate-800/60 mb-6Shared">
                            <div className="w-20 h-20 bg-slate-950 text-white rounded-[2rem] flex items-center justify-center shadow-xl relative overflow-hidden group shrink-0 border border-slate-800">
                               {formData.orgLogo ? (
                                  <img src={getImageUrl(formData.orgLogo)} alt="Official Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                               ) : (
                                  <>
                                     <div className="absolute inset-0 bg-indigo-600/20 animate-pulse-slow" />
                                     <Building className="w-8 h-8 relative z-10 text-indigo-400" />
                                  </>
                               )}
                            </div>
                            <div className="space-y-3">
                               <div>
                                  <h3 className="text-xl font-black text-slate-950 dark:text-white leading-tight">Ministry Brand Logo</h3>
                                  <p className="text-xs text-slate-400 font-bold mt-1">Foundational Ministry Seal used in headers and documents.</p>
                               </div>
                               <div className="flex items-center gap-3">
                                  <NativeFileUpload 
                                     buttonText="Upload New Logo" 
                                     acceptTypes="image/*" 
                                     folder="logos" 
                                     onUpload={(url) => setFormData({...formData, orgLogo: url})}
                                  />
                                  {formData.orgLogo && (
                                     <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, orgLogo: ''})}
                                        className="text-xs text-red-600 hover:text-red-700 font-black uppercase tracking-widest px-4 py-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 rounded-xl transition-all"
                                     >
                                        Remove Logo
                                     </button>
                                  )}
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Official Name</label>
                               <input type="text" value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="NNCM Church" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Admin Email</label>
                               <input type="email" value={formData.orgEmail} onChange={e => setFormData({...formData, orgEmail: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="office@nncm.org" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Secretariat Hotline</label>
                               <input type="tel" value={formData.orgPhone} onChange={e => setFormData({...formData, orgPhone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="+265..." />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Sanctuary HQ Address</label>
                               <input type="text" value={formData.orgAddress} onChange={e => setFormData({...formData, orgAddress: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="DMC Campus, Zomba" />
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'Missions' && (
                      <motion.div 
                        key="Missions" 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                      >
                         <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl mb-8 flex items-center gap-4">
                            <Shield className="w-10 h-10 text-indigo-600 shrink-0" />
                            <div>
                               <h5 className="font-black text-indigo-700 dark:text-indigo-400 text-xs uppercase tracking-widest">Apostolic Statements</h5>
                               <p className="text-xs text-indigo-600/70 dark:text-indigo-600/70 font-medium leading-relaxed mt-1">These values represent our global brand identity on all public portals.</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Ministry Vision</label>
                               <textarea rows={3} value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Core Mission</label>
                               <textarea rows={3} value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Ministry Motto / Tagline</label>
                               <input type="text" value={formData.motto} onChange={e => setFormData({...formData, motto: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="Christ minded generation" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">General About Summary</label>
                               <textarea rows={3} value={formData.orgAbout} onChange={e => setFormData({...formData, orgAbout: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" />
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'Communications' && (
                      <motion.div 
                        key="Communications" 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                      >
                         <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl mb-8 flex items-center gap-4">
                            <Globe className="w-10 h-10 text-indigo-600 shrink-0" />
                            <div>
                               <h5 className="font-black text-indigo-700 dark:text-indigo-400 text-xs uppercase tracking-widest">Global Social Presence & Media Directories</h5>
                               <p className="text-xs text-indigo-600/70 dark:text-indigo-600/70 font-medium leading-relaxed mt-1">Configure global social media anchors and streaming links rendered across pages.</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Facebook Handle / Page URL</label>
                               <input type="url" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Twitter (X) Profile Link</label>
                               <input type="url" value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">YouTube Channel / Stream URL</label>
                               <input type="url" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Instagram Media Profile</label>
                               <input type="url" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" />
                            </div>
                         </div>
                      </motion.div>
                    )}

                    {activeTab === 'Architecture' && (
                      <motion.div 
                        key="Architecture" 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                      >
                         <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl mb-8 flex items-center gap-4">
                            <Layout className="w-10 h-10 text-indigo-600 shrink-0" />
                            <div>
                               <h5 className="font-black text-indigo-700 dark:text-indigo-400 text-xs uppercase tracking-widest">Platform Core & KoBoToolbox Integration</h5>
                               <p className="text-xs text-indigo-600/70 dark:text-indigo-600/70 font-medium leading-relaxed mt-1">Wire up your KoBoToolbox database pipeline for seamless digital data ingestion of activities, cases, and testimonies.</p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">KoBo API Server URL</label>
                               <input type="text" value={formData.koboApiUrl} onChange={e => setFormData({...formData, koboApiUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="https://kf.kobotoolbox.org/api/v2/assets" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">KoBo Authentication Token</label>
                                  <input type="password" value={formData.koboToken} onChange={e => setFormData({...formData, koboToken: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="Token value" />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Asset / Form ID UID</label>
                                  <input type="text" value={formData.koboFormId} onChange={e => setFormData({...formData, koboFormId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" placeholder="aSdfGhJkl123..." />
                               </div>
                            </div>
                         </div>

                         {/* Local Seed & Reset Management */}
                         <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-8 space-y-6">
                            <div>
                               <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest text-left">Local Session & Demo Data Settings</h4>
                               <p className="text-xs text-slate-400 font-medium mt-1 text-left">Control how default mock items are handled when no cloud database is connected.</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 gap-4">
                               <div className="space-y-1 pr-4 text-left">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Disable Default Mock Seed Data (Clean Slate)</span>
                                  <span className="text-[11px] text-slate-400 leading-normal block">When enabled, new users/browsers will start with a completely empty, clean portal rather than being pre-populated with default demo sermons and ministries.</span>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                  <input 
                                    type="checkbox" 
                                    checked={disableMockSeeds} 
                                    onChange={e => handleToggleMockSeeds(e.target.checked)} 
                                    className="sr-only peer" 
                                  />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 gap-4">
                               <div className="space-y-1 text-left">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white block font-sans">Clear Browser's Local Cache</span>
                                  <span className="text-[11px] text-slate-400 leading-normal block font-sans">Wipe out all local data edits, sermons, events, registrations, and settings saved in your current browser session.</span>
                               </div>
                               <button 
                                  type="button" 
                                  onClick={handleClearLocalStorage}
                                  className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 font-bold uppercase tracking-widest px-4 py-2 border border-rose-200 dark:border-rose-800/60 rounded-xl transition-all cursor-pointer shrink-0 font-sans"
                               >
                                  Wipe Cache
                                </button>
                            </div>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>

              </div>
              
              <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Synchronized with Global CDN & Local Cache
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
