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
  Layout,
  Share2,
  Search,
  MessageSquare
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

  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    siteName: '',
  });
  const [loadingSeo, setLoadingSeo] = useState(true);
  const [previewPlatform, setPreviewPlatform] = useState<'whatsapp' | 'facebook' | 'google'>('whatsapp');

  useEffect(() => {
    fetch('/api/seo')
      .then(res => res.json())
      .then(data => {
        setSeoData({
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          siteName: data.siteName || '',
        });
        setLoadingSeo(false);
      })
      .catch(err => {
        console.error('Failed to load SEO settings:', err);
        setLoadingSeo(false);
      });
  }, []);

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
      }

      // Save SEO metadata
      await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoData),
      });

      // Dynamically update head meta tags in current browser tab instantly
      if (seoData.title) {
        document.title = seoData.title;
        const selectors = [
          { sel: 'meta[name="title"]', attr: 'content', val: seoData.title },
          { sel: 'meta[name="description"]', attr: 'content', val: seoData.description },
          { sel: 'meta[property="og:title"]', attr: 'content', val: seoData.title },
          { sel: 'meta[property="og:description"]', attr: 'content', val: seoData.description },
          { sel: 'meta[property="og:image"]', attr: 'content', val: seoData.imageUrl },
          { sel: 'meta[property="og:site_name"]', attr: 'content', val: seoData.siteName },
          { sel: 'meta[property="twitter:title"]', attr: 'content', val: seoData.title },
          { sel: 'meta[property="twitter:description"]', attr: 'content', val: seoData.description },
          { sel: 'meta[property="twitter:image"]', attr: 'content', val: seoData.imageUrl },
        ];
        selectors.forEach(({ sel, attr, val }) => {
          const el = document.querySelector(sel);
          if (el) el.setAttribute(attr, val);
        });
      }

      toast.success('Ministry sanctuary configuration & SEO metadata updated successfully.');
    } catch (err: any) {
      toast.error('Settings persist failure.');
    }
  };

  const tabs = ['Identity', 'Missions', 'Communications', 'SEO', 'Architecture'];

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
                     {tab === 'SEO' && <Share2 className="w-3.5 h-3.5" />}
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

                    {activeTab === 'SEO' && (
                      <motion.div 
                        key="SEO" 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        className="space-y-8 text-left"
                      >
                         <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl mb-8 flex items-center gap-4">
                            <Share2 className="w-10 h-10 text-indigo-600 shrink-0" />
                            <div>
                               <h5 className="font-black text-indigo-700 dark:text-indigo-400 text-xs uppercase tracking-widest">Centralized SEO & Link Share Branding</h5>
                               <p className="text-xs text-indigo-600/70 dark:text-indigo-600/70 font-medium leading-relaxed mt-1">
                                  Control the site name, titles, descriptions, and media cover images crawled by robots when links are shared on platforms like WhatsApp, Facebook, or Twitter. This overrides the default branding on social media previews!
                               </p>
                            </div>
                         </div>

                         {loadingSeo ? (
                            <div className="py-12 text-center text-slate-400 text-xs font-bold animate-pulse">
                               Loading SEO meta-registry...
                            </div>
                         ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                               {/* Input Form */}
                               <div className="space-y-6">
                                  <div className="space-y-1.5">
                                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Social Site Name (og:site_name)</label>
                                     <input 
                                        type="text" 
                                        value={seoData.siteName} 
                                        onChange={e => setSeoData({...seoData, siteName: e.target.value})} 
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" 
                                        placeholder="e.g. NNCM Church Portal" 
                                     />
                                  </div>

                                  <div className="space-y-1.5">
                                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Global Site Title (HTML & og:title)</label>
                                     <input 
                                        type="text" 
                                        value={seoData.title} 
                                        onChange={e => setSeoData({...seoData, title: e.target.value})} 
                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white" 
                                        placeholder="e.g. New Nature In Christ Ministry (NNCM)" 
                                     />
                                  </div>

                                  <div className="space-y-1.5">
                                     <div className="flex justify-between items-center pl-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Meta Description (HTML & og:description)</label>
                                        <span className={`text-[10px] font-bold ${seoData.description.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                                           {seoData.description.length} / 160 chars
                                        </span>
                                     </div>
                                     <textarea 
                                        rows={4} 
                                        value={seoData.description} 
                                        onChange={e => setSeoData({...seoData, description: e.target.value})} 
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                                        placeholder="Type an eye-catching summary of the ministry to entice visitors when shared."
                                     />
                                     <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pl-1">Recommended length is 120-160 characters for best display on mobile chats.</p>
                                  </div>

                                  <div className="space-y-3">
                                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Social Share Cover Image (og:image)</label>
                                     <div className="flex gap-2">
                                        <input 
                                           type="text" 
                                           value={seoData.imageUrl} 
                                           onChange={e => setSeoData({...seoData, imageUrl: e.target.value})} 
                                           className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white" 
                                           placeholder="https://images.unsplash.com/..." 
                                        />
                                        <NativeFileUpload 
                                           buttonText="Upload Cover" 
                                           acceptTypes="image/*" 
                                           folder="seo" 
                                           onUpload={(url) => setSeoData({...seoData, imageUrl: url})}
                                        />
                                     </div>
                                     <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider text-left">Quick-Select Premium Covers</span>
                                        <div className="grid grid-cols-5 gap-2">
                                           {[
                                              { name: 'Official Church Logo', url: '/logo.png' },
                                              { name: 'Sanctuary Worship', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&h=630&q=80' },
                                              { name: 'Holy Bible Study', url: 'https://images.unsplash.com/photo-1504052434569-70ad585e515e?auto=format&fit=crop&w=1200&h=630&q=80' },
                                              { name: 'Sermon Cross Light', url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=1200&h=630&q=80' },
                                              { name: 'Community Prayer', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=1200&h=630&q=80' },
                                           ].map((img, idx) => (
                                              <button 
                                                 key={idx} 
                                                 type="button" 
                                                 onClick={() => setSeoData({...seoData, imageUrl: img.url})}
                                                 className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${seoData.imageUrl === img.url ? 'border-indigo-600 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                 title={img.name}
                                              >
                                                 <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                              </button>
                                           ))}
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {/* Live Chat Preview Screen */}
                               <div className="space-y-6">
                                  <div className="flex justify-between items-center pl-1">
                                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Dynamic Live Crawler Preview
                                     </span>
                                     <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                        {[
                                           { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                           { id: 'facebook', label: 'Facebook', icon: Share2 },
                                           { id: 'google', label: 'Google', icon: Search },
                                        ].map(item => {
                                           const Icon = item.icon;
                                           return (
                                              <button
                                                 key={item.id}
                                                 type="button"
                                                 onClick={() => setPreviewPlatform(item.id as any)}
                                                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${previewPlatform === item.id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                              >
                                                 <Icon className="w-3 h-3" />
                                                 {item.label}
                                              </button>
                                           );
                                        })}
                                     </div>
                                  </div>

                                  {/* Preview Frame */}
                                  <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl min-h-[320px] flex items-center justify-center relative overflow-hidden shadow-inner">
                                     {/* WhatsApp Chat Preview */}
                                     {previewPlatform === 'whatsapp' && (
                                        <div className="w-full max-w-sm bg-[#e5ddd5] dark:bg-[#0b141a] p-4 rounded-2xl shadow-md border border-[#d1c7bd] dark:border-[#222e35] text-left font-sans">
                                           <div className="text-[10px] text-slate-500 dark:text-[#8696a0] text-center mb-3">Today</div>
                                           
                                           <div className="bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-[#e9edef] p-1.5 rounded-xl max-w-[85%] rounded-tl-none shadow-sm relative space-y-1 ml-1">
                                              <span className="text-[11px] text-[#027eb5] dark:text-[#53bdeb] hover:underline block cursor-pointer break-all">
                                                 https://nncm-portal.org
                                              </span>
                                              
                                              {/* Link Attachment Card */}
                                              <div className="bg-[#f0f2f5] dark:bg-[#111b21] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                                                 {seoData.imageUrl && (
                                                    <div className="w-full h-32 overflow-hidden bg-slate-950">
                                                       <img src={seoData.imageUrl} alt="SEO Cover" className="w-full h-full object-cover" />
                                                    </div>
                                                 )}
                                                 <div className="p-3 space-y-1 text-left">
                                                    <h6 className="text-[13px] font-bold text-slate-900 dark:text-[#e9edef] line-clamp-1 leading-snug">
                                                       {seoData.title || 'New Nature In Christ Ministry (NNCM)'}
                                                    </h6>
                                                    <p className="text-[11px] text-slate-500 dark:text-[#8696a0] line-clamp-2 leading-relaxed">
                                                       {seoData.description || 'Welcome to New Nature In Christ Ministry (NNCM) led by Pastor Richie Mkandawire.'}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 dark:text-[#8696a0] block font-mono uppercase tracking-wider">
                                                       nncm-portal.org
                                                    </span>
                                                 </div>
                                              </div>
                                              
                                              <div className="text-[9px] text-slate-400 text-right pr-1 pt-1">
                                                 10:42 AM
                                              </div>
                                           </div>
                                        </div>
                                     )}

                                     {/* Facebook Preview */}
                                     {previewPlatform === 'facebook' && (
                                        <div className="w-full max-w-sm bg-white dark:bg-[#242526] rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-4 font-sans text-left text-slate-900 dark:text-[#e4e6eb]">
                                           <div className="flex items-center gap-3 mb-3">
                                              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow">
                                                 NN
                                              </div>
                                              <div>
                                                 <h6 className="text-xs font-bold text-slate-900 dark:text-white">Pastor Richie Mkandawire</h6>
                                                 <span className="text-[10px] text-slate-500 dark:text-[#b0b3b8] flex items-center gap-1">Just now · 🌍</span>
                                              </div>
                                           </div>

                                           <p className="text-xs text-slate-800 dark:text-[#e4e6eb] mb-3 leading-relaxed">
                                              Check out our brand new online platform! Preaching the uncompromised word of God, raising a Christ-minded generation.
                                           </p>

                                           {/* Facebook Share Image & Text Link block */}
                                           <div className="border border-slate-200 dark:border-[#3e4042] rounded-xl overflow-hidden cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2f3031] transition-colors">
                                              {seoData.imageUrl ? (
                                                 <div className="w-full h-40 bg-slate-950 overflow-hidden">
                                                    <img src={seoData.imageUrl} alt="Facebook Cover" className="w-full h-full object-cover" />
                                                 </div>
                                              ) : (
                                                 <div className="w-full h-40 bg-slate-100 dark:bg-slate-800" />
                                              )}
                                              <div className="p-3 bg-slate-100 dark:bg-[#2f3031] border-t border-slate-200 dark:border-[#3e4042]">
                                                 <span className="text-[10px] uppercase text-slate-500 dark:text-[#b0b3b8] tracking-widest font-mono">
                                                    nncm-portal.org
                                                 </span>
                                                 <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                                                    {seoData.title || 'New Nature In Christ Ministry'}
                                                 </h5>
                                                 <p className="text-[11px] text-slate-500 dark:text-[#b0b3b8] mt-1 line-clamp-2 leading-relaxed">
                                                    {seoData.description || 'Welcome to New Nature In Christ Ministry (NNCM).'}
                                                 </p>
                                              </div>
                                           </div>
                                        </div>
                                     )}

                                     {/* Google Search Result Preview */}
                                     {previewPlatform === 'google' && (
                                        <div className="w-full max-w-md bg-white dark:bg-[#171717] rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-6 font-sans text-left">
                                           <div className="space-y-1">
                                              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                 <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-[8px] text-slate-500">
                                                    NN
                                                 </div>
                                                 <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-slate-200 font-medium text-[11px]">{seoData.siteName || 'New Nature In Christ Ministry'}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">https://nncm-portal.org</span>
                                                 </div>
                                              </div>
                                              
                                              <h4 className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer pt-1">
                                                 {seoData.title || 'New Nature In Christ Ministry (NNCM)'}
                                              </h4>
                                              
                                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light line-clamp-2 pt-0.5">
                                                 {seoData.description || 'Transforming lives by the power of the Holy Spirit, teaching the uncompromised word of God, and raising a Christ-minded generation.'}
                                              </p>
                                           </div>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            </div>
                         )}
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
