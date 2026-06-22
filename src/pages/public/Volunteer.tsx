import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, 
  Send, 
  Search, 
  MapPin, 
  Smartphone,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { volunteerService } from '../../services/volunteers';
import { toast } from 'sonner';

export default function Volunteer() {
  const { settings } = useOrgSettings();
  useDocumentMeta({
    title: 'Serve with Us',
    description: 'Join our ministry volunteer workforce. Find your place in the choir, ushering, media, or welfare departments.',
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('Ushering');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const depts = ['Ushering', 'Choir (NNCM Voices)', 'Media & Digital', 'Kids/Youth Workers', 'Welfare & Compassion', 'Security & Logistics'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      await volunteerService.registerVolunteer({ 
        name, 
        phone, 
        department: dept,
        email: '',
        skills: [],
        availability: 'flexible',
        status: 'active',
        createdAt: Date.now()
      });
      setSuccess(true);
      setLoading(false);
      toast.success('Your application to serve has been registered!');
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Levite Workforce</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1 mb-3">Enlist for Service</h1>
          <p className="text-slate-400 font-light text-sm">"The harvest is plentiful, but the laborers are few." Discover your area of kingdom service today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-6 space-y-10">
             <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Find Your Spirit-Lead Fit</h2>
                <p className="text-slate-500 font-light text-sm leading-relaxed">
                   Serving in the house of God is not just a duty; it is an act of spiritual identity. At {settings?.orgName || 'NNCM'}, we empower our workforce with spiritual mentorship and specialized skills training.
                </p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Training & Equipping', text: 'Monthly capacity building sessions for all servants.', icon: Users },
                  { title: 'Spiritual Mentorship', text: 'Direct access to pastoral guidance and prayer groups.', icon: HeartHandshake }
                ].map((f, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-105 rounded-3xl shadow-sm">
                     <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl w-fit mb-4">
                        <f.icon className="w-5 h-5" />
                     </div>
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{f.title}</h4>
                     <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">{f.text}</p>
                  </div>
                ))}
             </div>

             <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <MapPin className="w-32 h-32 scale-150 rotate-12" />
                </div>
                <h3 className="text-xl font-black mb-2 relative z-10">Zomba District Reach</h3>
                <p className="text-indigo-100 text-xs leading-relaxed font-light relative z-10">Our workforce covers the main DMC Campus and mobile evangelical teams visiting village outposts weekly.</p>
             </div>
          </div>

          <div className="lg:col-span-6">
             <div className="bg-white border border-slate-105 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.div key="form" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}>
                       <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-indigo-600" /> Servant Registration
                       </h3>
                       <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Legal Name</label>
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Samuel Chilwa" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300" />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">WhatsApp / Phone</label>
                            <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+265..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-300" />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Department</label>
                            <select value={dept} onChange={e => setDept(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer">
                               {depts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>

                          <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
                             {loading ? 'Processing Registry...' : 'Submit Servanthood Intent'}
                          </button>
                       </form>
                    </motion.div>
                  ) : (
                    <motion.div key="success" initial={{ scale: 0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} className="text-center py-10 space-y-6">
                       <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-sm">
                          <CheckCircle2 className="w-10 h-10" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900">Enlistment Success!</h3>
                       <p className="text-sm text-slate-500 font-light leading-relaxed max-w-xs mx-auto">Thank you for saying YES to the call. Our departmental head for <b>{dept}</b> will reach you via {phone} shortly.</p>
                       <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-[#020617] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Done</button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
