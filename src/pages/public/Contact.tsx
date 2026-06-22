import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Mail, 
  MapPin, 
  Phone,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { toast } from 'sonner';

export default function Contact() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Contact Us',
    description: 'Get in touch with New Nature in Christ Ministry for prayers, counseling, and inquiries.',
  });

  const [form, setForm] = useState({ name: '', email: '', subject: 'Counseling', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Your message has been received. Our secretariat will respond shortly.');
      setForm({ name: '', email: '', subject: 'Counseling', message: '' });
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2 space-y-12">
            <div>
              <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">Connectivity Hub</span>
              <h1 className="text-4xl font-extrabold text-slate-900 mt-1 mb-4 leading-tight">Get in touch with the Ministry</h1>
              <p className="text-slate-500 font-light text-base leading-relaxed">
                Whether you're seeking spiritual counseling, sharing a testimony, or inquiring about our global assemblies, we are here to walk with you.
              </p>
            </div>

            <div className="space-y-6">
               {[
                 { icon: MapPin, title: 'Sanctuary Address', body: settings.orgAddress || 'DMC Campus, Zomba, Malawi' },
                 { icon: Mail, title: 'Secretariat Email', body: settings.orgEmail || 'office@nncm.org' },
                 { icon: Phone, title: 'Reach Us Directly', body: settings.orgPhone || '+265 882 404 093' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0"><item.icon className="w-5 h-5" /></div>
                    <div>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
                       <p className="text-xs text-slate-400 mt-1 font-light">{item.body}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-8 border-t border-slate-200">
               <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-6">Social Fellowship</h4>
               <div className="flex items-center gap-4">
                  {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                    <button key={idx} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                       <Icon className="w-5 h-5" />
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:w-1/2">
             <div className="bg-white border border-slate-105 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                <h3 className="text-2xl font-black text-slate-950 mb-8 flex items-center gap-3">
                   <MessageSquare className="w-6 h-6 text-indigo-600" /> Send Inquiry
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Your Full Name</label>
                         <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Mary Mkandawire" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Return Email</label>
                         <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="mary@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Inquiry Category</label>
                      <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none cursor-pointer appearance-none">
                         {['Counseling', 'Prayers', 'Media Inquiry', 'Administrative', 'Partnership'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Detailed Message</label>
                      <textarea required rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="How can the ministry family serve you today?" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-light focus:ring-2 focus:ring-indigo-600 outline-none transition-all leading-relaxed" />
                   </div>

                   <button disabled={loading} type="submit" className="w-full p-4 bg-indigo-600 hover:bg-[#020617] text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                      {loading ? 'Transmitting...' : <><Send className="w-4 h-4" /> Dispatch Message</>}
                   </button>
                </form>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
