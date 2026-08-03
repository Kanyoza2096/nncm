// pages/admin/settings.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'motion/react'
import {
  Save, Building, Heart, Globe, Share2, Layout, Shield,
  Image as ImageIcon, Search, MessageSquare, Lock
} from 'lucide-react'
import { useOrgSettings } from '@/hooks/useOrgSettings'
import { toast } from 'sonner'
import NativeFileUpload from '@/components/NativeFileUpload'
import { getImageUrl } from '@/lib/image-utils'

const TABS = ['Identity', 'Missions', 'Communications', 'SEO', 'Architecture'] as const
type Tab = typeof TABS[number]

const SEO_COVER_PRESETS = [
  { name: 'Official Church Logo', url: '/logo.png' },
  { name: 'Sanctuary Worship', url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&h=630&q=80' },
  { name: 'Holy Bible Study', url: 'https://images.unsplash.com/photo-1504052434569-70ad585e515e?auto=format&fit=crop&w=1200&h=630&q=80' },
  { name: 'Sermon Cross Light', url: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=1200&h=630&q=80' },
  { name: 'Community Prayer', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=1200&h=630&q=80' },
]

interface SeoForm { title: string; description: string; imageUrl: string; siteName: string }

const EMPTY_SEO: SeoForm = { title: '', description: '', imageUrl: '', siteName: '' }

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useOrgSettings()
  const [activeTab, setActiveTab] = useState<Tab>('Identity')
  const [saving, setSaving] = useState(false)
  const [seoData, setSeoData] = useState<SeoForm>(EMPTY_SEO)
  const [loadingSeo, setLoadingSeo] = useState(true)
  const [previewPlatform, setPreviewPlatform] = useState<'whatsapp' | 'facebook' | 'google'>('whatsapp')

  const [formData, setFormData] = useState({
    orgName: '', orgEmail: '', orgPhone: '', orgAddress: '',
    vision: '', mission: '', motto: '', orgAbout: '', orgLogo: '',
    facebookUrl: '', twitterUrl: '', youtubeUrl: '', instagramUrl: '',
    koboApiUrl: '', koboToken: '', koboFormId: '',
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        orgName: settings.orgName || '', orgEmail: settings.orgEmail || '',
        orgPhone: settings.orgPhone || '', orgAddress: settings.orgAddress || '',
        vision: settings.vision || '', mission: settings.mission || '',
        motto: settings.motto || '', orgAbout: settings.orgAbout || '',
        orgLogo: settings.orgLogo || '',
        facebookUrl: settings.facebookUrl || '', twitterUrl: settings.twitterUrl || '',
        youtubeUrl: settings.youtubeUrl || '', instagramUrl: settings.instagramUrl || '',
        koboApiUrl: settings.koboApiUrl || '', koboToken: settings.koboToken || '',
        koboFormId: settings.koboFormId || '',
      })
    }
  }, [settings])

  useEffect(() => {
    fetch('/api/seo')
      .then(r => r.json())
      .then(data => {
        setSeoData({
          title: data.title || '', description: data.description || '',
          imageUrl: data.imageUrl || '', siteName: data.siteName || '',
        })
        setLoadingSeo(false)
      })
      .catch(() => setLoadingSeo(false))
  }, [])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      if (updateSettings) await updateSettings(formData)
      await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoData),
      })
      if (seoData.title) document.title = seoData.title
      toast.success('Settings saved successfully.')
    } catch { toast.error('Failed to save settings.') }
    finally { setSaving(false) }
  }

  const tabIcon = (tab: Tab) => {
    switch (tab) {
      case 'Identity': return <Building className="w-3.5 h-3.5" />
      case 'Missions': return <Heart className="w-3.5 h-3.5" />
      case 'Communications': return <Globe className="w-3.5 h-3.5" />
      case 'SEO': return <Share2 className="w-3.5 h-3.5" />
      case 'Architecture': return <Layout className="w-3.5 h-3.5" />
    }
  }

  return (
    <>
      <Head><title>Settings — NNCM Admin</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Configuration</h1>
            <p className="text-slate-500 text-sm mt-1">Manage global identity and operational parameters.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-slate-950 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <Save className="w-4 h-4" aria-hidden="true" /> {saving ? 'Saving...' : 'Save Config'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <nav className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1 sticky top-6">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`} aria-pressed={activeTab === tab}>
                  <div className={`p-1.5 rounded-lg ${activeTab === tab ? 'bg-white/20' : 'bg-slate-50'}`}>{tabIcon(tab)}</div>
                  {tab}
                </button>
              ))}
            </div>
          </nav>

          <div className="lg:col-span-9">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 sm:p-12 space-y-10 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'Identity' && (
                    <motion.div key="Identity" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="w-20 h-20 bg-slate-950 text-white rounded-[2rem] flex items-center justify-center shadow-xl relative overflow-hidden shrink-0">
                          {formData.orgLogo ? <img src={getImageUrl(formData.orgLogo)} alt="Logo" className="w-full h-full object-contain p-2" /> : <Building className="w-8 h-8 text-indigo-400" />}
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-black text-slate-950">Ministry Brand Logo</h3>
                          <div className="flex items-center gap-3">
                            <NativeFileUpload buttonText="Upload Logo" acceptTypes="image/*" folder="logos" onUpload={(url: string) => setFormData({...formData, orgLogo: url})} />
                            {formData.orgLogo && <button onClick={() => setFormData({...formData, orgLogo: ''})} className="text-xs text-red-600 font-black uppercase px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-red-400">Remove</button>}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { id: 'orgName', label: 'Official Name', type: 'text' },
                          { id: 'orgEmail', label: 'Admin Email', type: 'email' },
                          { id: 'orgPhone', label: 'Secretariat Hotline', type: 'tel' },
                          { id: 'orgAddress', label: 'Sanctuary HQ Address', type: 'text' },
                        ].map(f => (
                          <div key={f.id} className="space-y-1.5">
                            <label htmlFor={`set-${f.id}`} className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">{f.label}</label>
                            <input id={`set-${f.id}`} type={f.type} value={formData[f.id as keyof typeof formData]} onChange={e => setFormData({...formData, [f.id]: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'Missions' && (
                    <motion.div key="Missions" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-4">
                        <Shield className="w-10 h-10 text-indigo-600 shrink-0" aria-hidden="true" />
                        <div><h3 className="font-black text-indigo-700 text-xs uppercase tracking-widest">Apostolic Statements</h3><p className="text-xs text-indigo-600/70 mt-1">These values represent our global brand identity.</p></div>
                      </div>
                      {[
                        { id: 'vision', label: 'Ministry Vision', rows: 3 },
                        { id: 'mission', label: 'Core Mission', rows: 3 },
                        { id: 'motto', label: 'Ministry Motto / Tagline', rows: 1 },
                        { id: 'orgAbout', label: 'General About Summary', rows: 3 },
                      ].map(f => (
                        <div key={f.id} className="space-y-1.5">
                          <label htmlFor={`set-${f.id}`} className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">{f.label}</label>
                          {f.rows > 1 ? (
                            <textarea id={`set-${f.id}`} rows={f.rows} value={formData[f.id as keyof typeof formData]} onChange={e => setFormData({...formData, [f.id]: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-light leading-relaxed focus:ring-2 focus:ring-indigo-600 outline-none" />
                          ) : (
                            <input id={`set-${f.id}`} type="text" value={formData[f.id as keyof typeof formData]} onChange={e => setFormData({...formData, [f.id]: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'Communications' && (
                    <motion.div key="Communications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-4">
                        <Globe className="w-10 h-10 text-indigo-600 shrink-0" aria-hidden="true" />
                        <div><h3 className="font-black text-indigo-700 text-xs uppercase tracking-widest">Global Social Presence</h3><p className="text-xs text-indigo-600/70 mt-1">Configure social media anchors rendered across pages.</p></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {['facebookUrl', 'twitterUrl', 'youtubeUrl', 'instagramUrl'].map(id => (
                          <div key={id} className="space-y-1.5">
                            <label htmlFor={`set-${id}`} className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">{id.replace('Url', '')}</label>
                            <input id={`set-${id}`} type="url" value={formData[id as keyof typeof formData]} onChange={e => setFormData({...formData, [id]: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'SEO' && (
                    <motion.div key="SEO" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-4">
                        <Share2 className="w-10 h-10 text-indigo-600 shrink-0" aria-hidden="true" />
                        <div><h3 className="font-black text-indigo-700 text-xs uppercase tracking-widest">SEO & Link Share Branding</h3><p className="text-xs text-indigo-600/70 mt-1">Control how links appear when shared on WhatsApp, Facebook, or Google.</p></div>
                      </div>
                      {loadingSeo ? <p className="text-center text-slate-400 text-xs animate-pulse">Loading SEO registry...</p> : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            {[
                              { id: 'siteName', label: 'Site Name (og:site_name)', type: 'text' },
                              { id: 'title', label: 'Global Title (og:title)', type: 'text' },
                            ].map(f => (
                              <div key={f.id} className="space-y-1.5">
                                <label htmlFor={`seo-${f.id}`} className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">{f.label}</label>
                                <input id={`seo-${f.id}`} type={f.type} value={seoData[f.id as keyof SeoForm]} onChange={e => setSeoData({...seoData, [f.id]: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                              </div>
                            ))}
                            <div className="space-y-1.5">
                              <div className="flex justify-between pl-1">
                                <label htmlFor="seo-description" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                                <span className={`text-[10px] font-bold ${seoData.description.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>{seoData.description.length}/160</span>
                              </div>
                              <textarea id="seo-description" rows={4} value={seoData.description} onChange={e => setSeoData({...seoData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-light focus:ring-2 focus:ring-indigo-600 outline-none" />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 block">Cover Image (og:image)</label>
                              <div className="flex gap-2">
                                <input type="text" value={seoData.imageUrl} onChange={e => setSeoData({...seoData, imageUrl: e.target.value})} className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-indigo-600 outline-none" />
                                <NativeFileUpload buttonText="Upload" acceptTypes="image/*" folder="seo" onUpload={(url: string) => setSeoData({...seoData, imageUrl: url})} />
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Quick-Select Covers</span>
                                <div className="grid grid-cols-5 gap-2">
                                  {SEO_COVER_PRESETS.map((img, i) => (
                                    <button key={i} onClick={() => setSeoData({...seoData, imageUrl: img.url})} className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${seoData.imageUrl === img.url ? 'border-indigo-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`} title={img.name}><img src={img.url} alt={img.name} className="w-full h-full object-cover" /></button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Preview */}
                          <div className="space-y-6">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Preview</span>
                              <div className="flex bg-slate-100 p-1 rounded-xl">
                                {[
                                  { id: 'whatsapp' as const, label: 'WA', icon: MessageSquare },
                                  { id: 'facebook' as const, label: 'FB', icon: Share2 },
                                  { id: 'google' as const, label: 'Google', icon: Search },
                                ].map(item => (
                                  <button key={item.id} onClick={() => setPreviewPlatform(item.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${previewPlatform === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`} aria-pressed={previewPlatform === item.id}><item.icon className="w-3 h-3" />{item.label}</button>
                                ))}
                              </div>
                            </div>
                            <div className="border border-slate-100 bg-slate-50 p-6 rounded-3xl min-h-[320px] flex items-center justify-center">
                              {previewPlatform === 'whatsapp' && (
                                <div className="w-full max-w-sm bg-[#e5ddd5] p-4 rounded-2xl shadow-md">
                                  <p className="text-[10px] text-slate-500 text-center mb-3">Today</p>
                                  <div className="bg-white text-slate-900 p-1.5 rounded-xl max-w-[85%] space-y-1">
                                    <span className="text-[11px] text-[#027eb5] block">nncm-portal.org</span>
                                    <div className="bg-[#f0f2f5] rounded-lg overflow-hidden border border-slate-200">
                                      {seoData.imageUrl && <div className="w-full h-32 overflow-hidden"><img src={seoData.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                                      <div className="p-3 space-y-1">
                                        <p className="text-[13px] font-bold line-clamp-1">{seoData.title || 'NNCM'}</p>
                                        <p className="text-[11px] text-slate-500 line-clamp-2">{seoData.description || 'Welcome to NNCM.'}</p>
                                        <span className="text-[10px] text-slate-400 block font-mono uppercase">nncm-portal.org</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {previewPlatform === 'facebook' && (
                                <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-slate-200 p-4">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">NN</div>
                                    <div><p className="text-xs font-bold">Pastor Richie Mkandawire</p><span className="text-[10px] text-slate-500">Just now</span></div>
                                  </div>
                                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    {seoData.imageUrl ? <div className="w-full h-40"><img src={seoData.imageUrl} alt="" className="w-full h-full object-cover" /></div> : <div className="w-full h-40 bg-slate-100" />}
                                    <div className="p-3 bg-slate-100 border-t border-slate-200">
                                      <span className="text-[10px] uppercase text-slate-500 font-mono">nncm-portal.org</span>
                                      <p className="text-xs font-bold mt-1 line-clamp-1">{seoData.title || 'NNCM'}</p>
                                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{seoData.description || 'Welcome.'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {previewPlatform === 'google' && (
                                <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                      <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[8px]">NN</div>
                                      <span className="text-[10px]">{seoData.siteName || 'NNCM'}</span>
                                    </div>
                                    <p className="text-sm font-medium text-indigo-600 pt-1">{seoData.title || 'NNCM'}</p>
                                    <p className="text-xs text-slate-600 line-clamp-2">{seoData.description || 'Transforming lives.'}</p>
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
                    <motion.div key="Architecture" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-4">
                        <Layout className="w-10 h-10 text-indigo-600 shrink-0" aria-hidden="true" />
                        <div><h3 className="font-black text-indigo-700 text-xs uppercase tracking-widest">Platform Core & KoBoToolbox</h3><p className="text-xs text-indigo-600/70 mt-1">Wire up your KoBoToolbox database pipeline.</p></div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label htmlFor="set-koboApiUrl" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">KoBo API Server URL</label>
                          <input id="set-koboApiUrl" type="text" value={formData.koboApiUrl} onChange={e => setFormData({...formData, koboApiUrl: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label htmlFor="set-koboToken" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Auth Token</label>
                            <input id="set-koboToken" type="password" value={formData.koboToken} onChange={e => setFormData({...formData, koboToken: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="set-koboFormId" className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Form ID</label>
                            <input id="set-koboFormId" type="text" value={formData.koboFormId} onChange={e => setFormData({...formData, koboFormId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-8 border-t border-slate-50 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] flex items-center gap-2"><Lock className="w-3.5 h-3.5" aria-hidden="true" /> Synchronized with Global CDN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
