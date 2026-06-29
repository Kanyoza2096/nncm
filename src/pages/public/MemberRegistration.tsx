import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  MapPin, 
  Users, 
  Fingerprint,
  QrCode,
  Sparkles,
  User,
  Mail,
  Phone,
  Compass
} from 'lucide-react';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { churchService } from '../../services/churchService';
import { beneficiaryService } from '../../services/beneficiaries';
import { toast } from 'sonner';
import { generateUUID } from '../../lib/id-utils';

export default function MemberRegistration() {
  useDocumentMeta({
    title: 'Membership Registration',
    description: 'Join the family. Register as a member and connect with a fellowship branch.',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('25');
  const [churchGroup, setChurchGroup] = useState('Youths');
  const [saving, setSaving] = useState(false);
  const [pass, setPass] = useState<any | null>(null);

  // Helper to suggest recommended division
  const getRecommendedGroup = (ageVal: number, genderVal: string): string => {
    if (ageVal <= 12) return "Children's Ministry";
    if (ageVal > 12 && ageVal <= 35) return "Youths";
    if (genderVal === 'female') return "Women's Fellowship";
    if (genderVal === 'male') return "Men's Fellowship";
    return "General Congregation";
  };

  const handleGenderChange = (genderVal: 'male' | 'female' | 'other') => {
    setGender(genderVal);
    const recommended = getRecommendedGroup(Number(age) || 25, genderVal);
    setChurchGroup(recommended);
  };

  const handleAgeChange = (ageVal: string) => {
    setAge(ageVal);
    const recommended = getRecommendedGroup(Number(ageVal) || 25, gender);
    setChurchGroup(recommended);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(async () => {
      try {
        const vid = generateUUID();
        
        // 1. Create check-in member pass
        await churchService.members.createOrUpdate(vid, { 
          name, 
          email,
          phone,
          familyGroup: 'General Congregation',
          joinedMinistries: [churchGroup === 'Youths' ? 'min-youth' : churchGroup === "Women's Fellowship" ? 'min-women' : churchGroup === "Men's Fellowship" ? 'min-men' : 'min-children']
        });

        // 2. Add member record in central administration database
        await beneficiaryService.addBeneficiary({
          name,
          email,
          phone,
          gender,
          age: Number(age) || 25,
          dob: `${new Date().getFullYear() - (Number(age) || 25)}-01-01`,
          location: 'Zomba DMC Campus',
          address: 'General Town Area',
          maritalStatus: 'single',
          childrenCount: 0,
          occupation: 'Congregant',
          status: 'active',
          category: 'Local Resident',
          churchGroup: churchGroup,
          createdAt: Date.now()
        });

        setPass({ vid, name, group: churchGroup });
        setSaving(false);
        toast.success(`Welcome to the family, ${name}! Your Sanctuary Pass is ready.`);
      } catch (err) {
        console.error(err);
        setSaving(false);
        toast.error('Failed to establish registry. Please try again.');
      }
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase">The Tabernacle Gates</span>
          <h1 className="text-4xl font-extrabold text-[#020617] mt-1">Saints Registry</h1>
          <p className="text-slate-400 font-light text-sm mt-2">Sign up as an official member, select your division, and generate your secure entry pass.</p>
        </div>

        <div className="bg-white border border-slate-105 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
           <AnimatePresence mode="wait">
             {!pass ? (
                <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="flex items-center gap-2.5 mb-8 border-b border-indigo-50 pb-4">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-black text-slate-900">Family Registry Entrance</h3>
                  </div>
                  <form onSubmit={handleRegister} className="space-y-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Your Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
                            <input 
                              type="text" 
                              required 
                              value={name} 
                              onChange={e => setName(e.target.value)} 
                              placeholder="e.g. Samuel Phiri" 
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
                            <input 
                              type="email" 
                              required 
                              value={email} 
                              onChange={e => setEmail(e.target.value)} 
                              placeholder="samuel@example.com" 
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">WhatsApp / Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
                            <input 
                              type="tel" 
                              required 
                              value={phone} 
                              onChange={e => setPhone(e.target.value)} 
                              placeholder="+265..." 
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Age</label>
                          <input 
                            type="number" 
                            required 
                            min={1} 
                            max={120} 
                            value={age} 
                            onChange={e => handleAgeChange(e.target.value)} 
                            placeholder="e.g. 25" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Gender</label>
                          <select 
                            value={gender} 
                            onChange={e => handleGenderChange(e.target.value as any)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Church Demographic Division</label>
                          <select 
                            value={churchGroup} 
                            onChange={e => setChurchGroup(e.target.value)}
                            className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                          >
                            <option value="Youths">Youths (Ages 13-35)</option>
                            <option value="Women's Fellowship">Women's Fellowship</option>
                            <option value="Men's Fellowship">Men's Fellowship</option>
                            <option value="Children's Ministry">Children's Ministry (Ages 0-12)</option>
                            <option value="General Congregation">General Congregation</option>
                          </select>
                        </div>
                     </div>

                     <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500 font-medium">
                       💡 <strong>Smart division pairing:</strong> The system automatically suggests the optimal church group based on your age and gender details. You may override this if you wish to join a different fellowship wing.
                     </div>

                     <button disabled={saving} className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20">
                       {saving ? 'Registering details in ledger...' : 'Register & Generate Sanctuary Pass'}
                     </button>
                  </form>
                </motion.div>
             ) : (
                <motion.div key="card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                   <div className="w-16 h-16 bg-indigo-50 border-2 border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-950 capitalize">{pass.name}'s Sanctuary Pass</h3>
                     <p className="text-xs text-indigo-600 font-bold mt-1 uppercase tracking-wider">Assigned to: {pass.group}</p>
                   </div>
                   
                   <div className="max-w-xs mx-auto bg-[#0b1220] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl text-left font-mono text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-indigo-600/5 animate-pulse-subtle" />
                      <div className="flex justify-between border-b border-slate-800 pb-4 mb-5 relative z-10">
                         <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">NNCM Official pass</span>
                         <Fingerprint className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="space-y-4 relative z-10">
                         <div>
                           <label className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter">Member UID</label>
                           <p className="text-xs font-black tracking-tight">{pass.vid.toUpperCase()}</p>
                         </div>
                         <div>
                           <label className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter">Assigned Guild</label>
                           <p className="text-xs font-bold text-indigo-300">{pass.group}</p>
                         </div>
                         <div className="bg-white p-3 rounded-2xl flex justify-center border border-indigo-900/40">
                            <QrCode className="w-20 h-20 text-slate-950" />
                         </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-800 relative z-10 flex justify-between items-center text-[7px] uppercase font-black tracking-widest text-slate-500">
                         <span>Check-in ready</span>
                         <span className="text-indigo-400">DMC Campus</span>
                      </div>
                   </div>
                   <button onClick={() => setPass(null)} className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">Begin another registration</button>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
           {[ {icon: MapPin, text: 'Zomba District Wings'}, {icon: Users, text: 'Cell Discipleship'}, {icon: Fingerprint, text: 'Departmental Rosters'} ].map((item, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
                 <item.icon className="w-5 h-5 text-indigo-300" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.text}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
