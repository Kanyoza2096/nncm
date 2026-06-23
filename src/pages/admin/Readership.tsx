import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Mail, 
  MessageCircle, 
  Trash2, 
  Loader2,
  X,
  UserPlus,
  Phone,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { authService } from '../../services/auth';
import { User, Role } from '../../types';
import { generateUUID } from '../../lib/id-utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import NativeFileUpload from '../../components/NativeFileUpload';
import { getImageUrl } from '../../lib/image-utils';

export default function Readership() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    role: 'readership' as Role,
    photoURL: '',
    status: 'active' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const allProfiles = await authService.getAllProfiles();
      // Filter for leadership/staff roles
      const leadershipRoles: Role[] = ['pastor', 'secretary', 'treasurer', 'deacon', 'elder', 'readership', 'staff', 'admin', 'ministry_leader'];
      const filteredProfiles = allProfiles.filter(u => leadershipRoles.includes(u.role));
      setMembers(filteredProfiles);
    } catch (err) {
      toast.error('Failed to load ministry directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Check if email already exists in local list
      if (members.some(m => m.email.toLowerCase() === formData.email.toLowerCase())) {
        toast.error('A person with this email is already registered in the directory.');
        setIsSubmitting(false);
        return;
      }

      const id = generateUUID();
      await authService.createUserProfile(id, {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        role: formData.role,
        photoURL: formData.photoURL || undefined,
        status: formData.status,
        createdAt: Date.now()
      });

      toast.success('Personnel registered successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        role: 'readership',
        photoURL: '',
        status: 'active'
      });
      fetchMembers();
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === '23505' || err.message?.includes('duplicate key')) {
        toast.error('This email is already in use by another member.');
      } else {
        toast.error('Failed to register member. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the registry?')) return;
    try {
      await authService.deleteUserProfile(id);
      toast.success('Member removed from registry.');
      fetchMembers();
    } catch (err) {
      toast.error('Failed to remove member.');
    }
  };

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles: { label: string; value: string }[] = [
    { label: 'All Personnel', value: 'all' },
    { label: 'Pastors', value: 'pastor' },
    { label: 'Secretaries', value: 'secretary' },
    { label: 'Treasurers', value: 'treasurer' },
    { label: 'Elders', value: 'elder' },
    { label: 'Deacons', value: 'deacon' },
    { label: 'Readership', value: 'readership' },
    { label: 'Staff', value: 'staff' },
  ];

  const getRoleLabel = (r: string) => {
    return roles.find(role => role.value === r)?.label || r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Ministry Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-light">Managing stewards, readers, and official church leadership roles.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-slate-950 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register New Personnel
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 transition-all dark:text-white shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                roleFilter === r.value 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Retrieving directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
             <BookOpen className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
             <p className="text-slate-400 font-medium italic">No personnel matches found.</p>
          </div>
        ) : (
          filtered.map((member, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.05 }}
              key={member.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-indigo-500/10 hover:border-b-indigo-500"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-2xl font-black text-indigo-600 overflow-hidden">
                    {member.photoURL ? (
                      <img src={getImageUrl(member.photoURL)} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      member.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 rounded-full text-white shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight mb-1">{member.name}</h3>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
                  <p className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">{getRoleLabel(member.role)}</p>
                </div>
                
                <div className="flex items-center gap-3 w-full border-t border-slate-50 dark:border-slate-800 pt-5">
                  <a 
                    href={`mailto:${member.email}`} 
                    className="flex-1 p-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30 rounded-xl text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group/btn"
                    title="Email Member"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover/btn:inline">Email</span>
                  </a>
                  {member.whatsapp && (
                    <a 
                      href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30 rounded-xl text-slate-400 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 group/btn"
                      title="WhatsApp Member"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover/btn:inline">WhatsApp</span>
                    </a>
                  )}
                  <button 
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2.5 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/30 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                    title="Remove Person"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-12"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
                  <UserPlus className="w-6 h-6 text-indigo-600" /> New Personnel
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center mb-6 pt-2">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-950 shadow-inner flex items-center justify-center overflow-hidden">
                         {formData.photoURL ? (
                           <img src={getImageUrl(formData.photoURL)} alt="Preview" className="w-full h-full object-cover" />
                         ) : (
                           <Camera className="w-8 h-8 text-slate-300" />
                         )}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                         <NativeFileUpload 
                           onUpload={(url) => setFormData(prev => ({ ...prev, photoURL: url }))}
                           folder="avatars"
                           buttonText=" "
                           acceptTypes="image/*"
                         />
                      </div>
                   </div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-3">Upload Personnel Photo</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Samuel Jere" 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white transition-all shadow-inner"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Official Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@nncm.org" 
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+265 99..." 
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Liturgy Role / Stewardship</label>
                   <select 
                     value={formData.role}
                     onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                     className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none dark:text-white appearance-none transition-all shadow-inner"
                   >
                     <option value="pastor">Ministry Pastor</option>
                     <option value="secretary">Ministry Secretary</option>
                     <option value="treasurer">Ministry Treasurer</option>
                     <option value="elder">Church Elder</option>
                     <option value="deacon">Deacon / Deaconess</option>
                     <option value="readership">Readership Personnel</option>
                     <option value="staff">Official Staff</option>
                   </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-indigo-600 hover:bg-slate-950 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Authorize & Registry Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
