import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, ShieldCheck, Sparkles, User, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useOrgSettings } from '../../hooks/useOrgSettings';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { authService } from '../../services/auth';
import { User as UserType } from '../../types';
import { getImageUrl } from '../../lib/image-utils';

interface TeamLeader {
  id: string;
  name: string;
  role: string;
  photoURL: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

const DEFAULT_LEADERS: TeamLeader[] = [
  {
    id: 'placeholder-1',
    name: 'Pastor Patricia Mkandawire',
    role: 'Co-Pastor & Women\'s Ministry Director',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    whatsapp: '265882404093',
    email: 'patricia.m@nncm.org',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com'
  },
  {
    id: 'placeholder-2',
    name: 'Elder Charles Banda',
    role: 'Head of Administration & Elder',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    whatsapp: '265882404093',
    email: 'charles.b@nncm.org',
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 'placeholder-3',
    name: 'Sister Evelyn Phiri',
    role: 'Youth & Music Director',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    whatsapp: '265882404093',
    email: 'evelyn.p@nncm.org',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  },
  {
    id: 'placeholder-4',
    name: 'Brother Gift Chimwaza',
    role: 'Missions & Outreach Coordinator',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    whatsapp: '265882404093',
    email: 'gift.c@nncm.org',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  }
];

export default function Leadership() {
  useDocumentMeta({
    title: 'Leadership & Pastoral Team',
    description: 'Meet the pastoral team and oversight board of New Nature in Christ Ministry.',
    keywords: 'leadership, pastors, elders, church board, NNCM leadership'
  });

  const { settings } = useOrgSettings();
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const allUsers = await authService.getAllProfiles();
        // Filter for leadership roles
        const leadershipRoles = ['pastor', 'ministry_leader', 'readership', 'elder', 'deacon', 'admin', 'super_admin'];
        const team = allUsers.filter(u => 
          leadershipRoles.includes(u.role) && 
          u.status === 'active' &&
          u.name.toLowerCase() !== (settings.directorName || 'Pastor Richie Mkandawire').toLowerCase()
        );
        setTeamMembers(team);
      } catch (err) {
        console.error('Failed to fetch leadership team:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeam();
  }, [settings.directorName]);

  const combinedLeaders: TeamLeader[] = [
    ...DEFAULT_LEADERS,
    ...teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      photoURL: member.photoURL || '',
      whatsapp: member.whatsapp || '',
      email: member.email || '',
    }))
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-4"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Spiritual Pillars & Governance
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
            Our Pastoral & Leadership Team
          </h1>
          <p className="text-slate-500 font-light text-base sm:text-lg leading-relaxed">
            Called by God, tested in faith, and dedicated to the spiritual shepherdhood of lives in {settings.orgAddress || 'Malawi'}.
          </p>
        </div>

        {/* Senior Pastor Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-lg border-4 border-indigo-50 bg-slate-50 mb-6 focus-within:ring-2 ring-indigo-500 ring-offset-4 transition-all">
              {settings.directorImage ? (
                <img src={getImageUrl(settings.directorImage)} alt="Senior Pastor" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-6xl font-black">
                  {(settings.directorName || 'P').split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" /> Senior Pastor & Founder
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">{settings.directorName || 'Pastor Richie Mkandawire'}</h2>
              <p className="text-sm font-semibold text-indigo-600 mt-1 uppercase tracking-wider">Visionary Lead</p>
            </div>
            
            <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-light">
              {settings.directorBio || 'Pastor Richie founded the ministry with a burning desire to see lives transformed by the power of the Holy Spirit. He is passionately committed to preaching and teaching the uncompromised word of God.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a href={`mailto:${settings.directorEmail || 'richiefa88@gmail.com'}`} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Message Pastor
              </a>
              <a href={`https://wa.me/${settings.directorWhatsApp?.replace(/\+/g, '') || '265882404093'}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> WhatsApp Counsel
              </a>
            </div>
          </div>
        </motion.div>

        {/* Other Team Members */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-slate-200" />
              Regional Oversight & Ministry Leaders
              <div className="h-px w-8 bg-slate-200" />
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {combinedLeaders.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group text-center flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500 bg-slate-50">
                    {member.photoURL ? (
                      <img 
                        src={member.photoURL.startsWith('http') ? member.photoURL : getImageUrl(member.photoURL)} 
                        alt={member.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-950 leading-tight group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                  <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-widest mt-1">
                    {member.role}
                  </p>
                </div>
                
                {/* Social & Contact Links */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-50">
                  {member.whatsapp && (
                    <a 
                      href={`https://wa.me/${member.whatsapp.replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.email && (
                    <a 
                      href={`mailto:${member.email}`}
                      title="Email"
                      className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.facebook && (
                    <a 
                      href={member.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.twitter && (
                    <a 
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter / X"
                      className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.instagram && (
                    <a 
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="p-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
